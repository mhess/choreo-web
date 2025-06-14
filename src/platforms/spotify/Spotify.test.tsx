import { act, render, screen, within } from "@testing-library/react";
import {
	type Mock,
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	test,
	vi,
} from "vitest";

import { spotifyTokenParam } from "~/../shared";
import { PlatformPlayer } from "~/lib/player";
import { expectNoDomChange, expectOnly, withStore } from "~/test/utils";

import SpotifyComponent from "./Spotify";
import { FakeSpotifyPlayer } from "./fakePlayer";
import { spotifyTokenAtom } from "./internals";

const assertScriptAndInvokeCallback = () => {
	const scripts = document.body.getElementsByTagName("script");
	expect(scripts).toHaveLength(1);
	expect(scripts[0]).toHaveAttribute(
		"src",
		"https://sdk.scdn.co/spotify-player.js",
	);
	window.onSpotifyWebPlaybackSDKReady();
};

const connectDeviceMsg =
	/^Please connect to the \SChoreo Player\S device in the Spotify player.$/;

describe("Spotify", () => {
	const { wrapper, getAtoms, setAtoms, getStore } = withStore();
	let spotifyPlayer: FakeSpotifyPlayer;

	beforeEach(() => {
		vi.clearAllMocks();

		spotifyPlayer = new FakeSpotifyPlayer({
			name: "foo",
			getOAuthToken: () => {},
		});

		window.Spotify = {
			Player: vi.fn(() => spotifyPlayer) as unknown as typeof Spotify.Player,
		};

		vi.spyOn(spotifyPlayer, "connect").mockRejectedValue(
			"connect should not have been called",
		);
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
		localStorage.clear();
		window.spotifyPromise = undefined;
		document.body.innerHTML = "";
	});

	it("Renders log in screen when not logged in", async () => {
		render(
			<SpotifyComponent token={null}>
				<div data-testid="entries" />
			</SpotifyComponent>,
			{ wrapper },
		);

		const link = await expectOnly(() =>
			screen.getByRole("link", { name: /^log\sin$/ }),
		);

		expect(screen.queryByTestId("entries")).not.toBeInTheDocument();

		expect(link).toHaveAttribute("href", "/api/login");
	});

	const assertElHasFullMsgAndLink = (el: HTMLElement, msg: string) => {
		expect(el).toHaveTextContent(
			`${msg} Would you like to try to log in to Spotify again?`,
		);
		const link = within(el).getByRole("link", { name: /^log\sin$/ });
		expect(link).toHaveAttribute("href", "/api/login");
	};

	it("Renders message on initialization error", async () => {
		(spotifyPlayer.connect as Mock).mockResolvedValue(false);
		const msg = "Initialization failed.";
		const { rerender } = render(
			<SpotifyComponent token="testToken">
				<div data-testid="entries" />
			</SpotifyComponent>,
			{ wrapper },
		);

		screen.getByText("Connecting to Spotify");

		rerender(
			<SpotifyComponent token={null}>
				<div data-testid="entries" />
			</SpotifyComponent>,
		);

		screen.getByText("Connecting to Spotify");

		assertScriptAndInvokeCallback();

		const msgEl = await expectOnly(() =>
			screen.getByText(new RegExp(`^${msg}`)),
		);

		assertElHasFullMsgAndLink(msgEl, msg);
	});

	const testMessageAfterError = async (
		_: string,
		msg: string,
		afterPlayerCreation: () => void,
	) => {
		(spotifyPlayer.connect as Mock).mockResolvedValue(true);
		const { rerender } = render(
			<SpotifyComponent token="testToken">
				<div data-testid="entries" />
			</SpotifyComponent>,
			{ wrapper },
		);

		expect(screen.getByText("Connecting to Spotify")).toBeInTheDocument();

		rerender(
			<SpotifyComponent token={null}>
				<div data-testid="entries" />
			</SpotifyComponent>,
		);

		expect(screen.getByText("Connecting to Spotify")).toBeInTheDocument();

		assertScriptAndInvokeCallback();

		await expectOnly(() => screen.getByText(connectDeviceMsg));

		afterPlayerCreation();

		const msgEl = await expectOnly(() =>
			screen.getByText(new RegExp(`^${msg}`)),
		);

		assertElHasFullMsgAndLink(msgEl, msg);
	};

	test.each([
		[
			"Renders message on playback error",
			"There was an error with playback.",
			() => {
				spotifyPlayer.emit("playback_error", { err: "playback" });
				expect(console.error).toHaveBeenCalledOnce();
				expect(console.error).toHaveBeenCalledWith(
					'playback error {"err":"playback"}',
				);
			},
		],
		[
			"Renders message on account error",
			"There was a problem with your account. Spotify requires a premium account for application access.",
			() => spotifyPlayer.emit("account_error"),
		],
		[
			"Renders message on auth error",
			"Could not authorize access.",
			() => spotifyPlayer.emit("authentication_error"),
		],
	])("%s", testMessageAfterError);

	const testEntriesRenderedAndPlayer = async (
		resolveConnect: (res: boolean) => void,
	) => {
		expect(screen.getByText("Connecting to Spotify")).toBeInTheDocument();

		expect(screen.queryByTestId("entries")).not.toBeInTheDocument();

		await expectNoDomChange();

		assertScriptAndInvokeCallback();

		resolveConnect(true);

		await expectOnly(() => screen.getByText(connectDeviceMsg));

		expect(screen.queryByTestId("entries")).not.toBeInTheDocument();

		await expectNoDomChange();

		expect(Spotify.Player).toHaveBeenCalledOnce();

		const [[playerInit]] = (Spotify.Player as Mock).mock.calls;
		expect(playerInit).toEqual({
			name: "Choreo Player",
			volume: 0.5,
			getOAuthToken: expect.any(Function),
		});

		const mock = vi.fn();
		playerInit.getOAuthToken(mock);
		expect(mock).toHaveBeenCalledOnce();
		expect(mock).toHaveBeenCalledWith("testToken");

		// Delayed ready status so that
		spotifyPlayer._setPlayerReady();

		await expectOnly(() => screen.getByTestId("entries"));

		const { playerAtom, pausedAtom, artistAtom, trackNameAtom } =
			getAtoms("spotify");
		const store = getStore();

		const player = store.get(playerAtom) as PlatformPlayer;

		expect(store.get(pausedAtom)).toBe(true);
		expect(store.get(artistAtom)).toEqual("First Artist");
		expect(store.get(trackNameAtom)).toEqual(
			"Track Name! That is Really Really Long",
		);

		expect(player).toBeInstanceOf(PlatformPlayer);

		vi.useFakeTimers();

		const tickMock = vi.fn();

		await player.addOnTick(tickMock);
		expect(tickMock).toHaveBeenCalledOnce();
		expect(tickMock).toHaveBeenCalledWith(0);

		await player.play();

		expect(store.get(pausedAtom)).toBe(false);

		await act(() => vi.advanceTimersByTime(50));

		expect(await player.getCurrentTime()).toEqual(50);

		await act(() => vi.advanceTimersByTime(50));

		expect(tickMock).toHaveBeenCalledTimes(2);
		expect(tickMock).toHaveBeenLastCalledWith(100);

		expect(await player.getCurrentTime()).toEqual(100);

		await player.pause();

		expect(store.get(pausedAtom)).toBe(true);

		expect(await player.getCurrentTime()).toEqual(100);

		await act(() => vi.advanceTimersByTime(100));

		expect(tickMock).toHaveBeenCalledTimes(2);

		await act(async () => player.seekTo(1000));

		expect(await player.getCurrentTime()).toEqual(1000);

		expect(tickMock).toHaveBeenCalledTimes(3);
		expect(tickMock).toHaveBeenLastCalledWith(1000);
	};

	it("Renders loading screens, entries, and creates player with token from params", async () => {
		localStorage.clear();
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		let resolve = (v: unknown) => {};
		(spotifyPlayer.connect as Mock).mockReturnValue(
			new Promise((res) => {
				resolve = res;
			}),
		);
		const { rerender } = render(
			<SpotifyComponent token="testToken">
				<div data-testid="entries" />
			</SpotifyComponent>,
			{ wrapper },
		);

		expect(screen.getByText("Connecting to Spotify")).toBeInTheDocument();

		rerender(
			<SpotifyComponent token={null}>
				<div data-testid="entries" />
			</SpotifyComponent>,
		);

		expect(localStorage.getItem(spotifyTokenParam)).toEqual(
			JSON.stringify("testToken"),
		);

		await testEntriesRenderedAndPlayer(resolve);
	});

	it("Renders loading screens, entries, and creates player with token from localStorage", async () => {
		setAtoms([[spotifyTokenAtom, "testToken"]]);
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		let resolve = (v: unknown) => {};
		(spotifyPlayer.connect as Mock).mockReturnValue(
			new Promise((res) => {
				resolve = res;
			}),
		);

		render(
			<SpotifyComponent token={null}>
				<div data-testid="entries" />
			</SpotifyComponent>,
			{ wrapper },
		);

		await testEntriesRenderedAndPlayer(resolve);
	});

	it("Only creates a single player after remounting", async () => {
		(spotifyPlayer.connect as Mock).mockResolvedValue(true);
		setAtoms([[spotifyTokenAtom, "testToken"]]);

		const { unmount } = render(
			<SpotifyComponent token={null}>
				<div data-testid="entries" />
			</SpotifyComponent>,
			{ wrapper },
		);

		unmount();

		render(
			<SpotifyComponent token={null}>
				<div data-testid="entries" />
			</SpotifyComponent>,
			{ wrapper },
		);

		assertScriptAndInvokeCallback();

		await expectOnly(() => screen.getByText(connectDeviceMsg));

		expect(Spotify.Player).toHaveBeenCalledOnce();
	});
});
