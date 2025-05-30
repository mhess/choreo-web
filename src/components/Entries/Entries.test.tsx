import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { UserEvent } from "@testing-library/user-event";
import { useAtom } from "jotai";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";

import type { AtomicEntry, EntryInput } from "~/lib/entries";
import type { PlatformPlayer } from "~/lib/player";
import { withStore } from "~/test/utils";

import Entries from "./Entries";

vi.mock("./Entry", () => ({
	default: ({ entry, index }: { entry: AtomicEntry; index: number }) => {
		const { timeMs, isCurrentAtom, countAtom } = entry;
		const [[isCurrent], [count]] = [isCurrentAtom, countAtom].map((a) =>
			useAtom(a),
		);
		return (
			<div data-testid="entry">
				{JSON.stringify({ timeMs, isCurrent, count, index })}
			</div>
		);
	},
}));

vi.mock("./Help", () => ({
	default: () => <div data-testid="help" />,
}));

const getCurrentTimeImpl = (() => {
	throw "getCurrentTime not mocked!";
}) as () => Promise<number>;

const pauseImpl = (() => {
	throw "pause not mocked!";
}) as () => Promise<void>;

describe("Entries", () => {
	const platform = "spotify";
	let user: UserEvent;
	let player: PlatformPlayer;

	const { wrapper, getAtoms, setAtoms } = withStore();

	beforeEach(() => {
		vi.clearAllMocks();

		user = userEvent.setup();
		player = {
			pause: vi.fn(pauseImpl).mockResolvedValueOnce(),
			addOnTick: vi.fn(),
			removeOnTick: vi.fn(),
		} as unknown as PlatformPlayer;

		const { playerAtom } = getAtoms(platform);
		setAtoms([[playerAtom, player]]);
	});

	const getRenderedEntryValues = () =>
		screen
			.getAllByTestId("entry")
			.map((e) => JSON.parse(e.textContent as string));

	const tickToTime = (timeMs: number) =>
		act(async () => {
			player.getCurrentTime = vi
				.fn(getCurrentTimeImpl)
				.mockResolvedValueOnce(timeMs);

			for (const call of (player.addOnTick as Mock).mock.calls)
				await call[0](timeMs);
		});

	const arrange = (entryInputs = [] as EntryInput[] | false) => {
		if (entryInputs) {
			const { entriesAtom } = getAtoms(platform);
			setAtoms([[entriesAtom, entryInputs]]);
		}

		return render(<Entries />, { wrapper });
	};

	describe("First visit", () => {
		const arrangeFirstVisit = async () => {
			player.play = vi.fn();

			arrange();
			expect(
				await screen.findByRole("dialog", { name: "First time here?" }),
			).toBeInTheDocument();

			expect(
				screen.queryByRole("button", { name: "Add Entry" }),
			).not.toBeInTheDocument();
		};

		const checkLocalStorageAndAddEntry = async () => {
			expect(
				screen.queryByRole("dialog", { name: "First time here?" }),
			).not.toBeInTheDocument();

			expect(localStorage.getItem("helpDismissed")).toBe("t");

			expect(
				screen.getByRole("button", { name: "Show Help" }),
			).toBeInTheDocument();

			await user.click(screen.getByRole("button", { name: "Play" }));

			await tickToTime(1000);

			await user.click(screen.getByRole("button", { name: "Add Entry" }));

			expect(getRenderedEntryValues()).toEqual([
				{
					timeMs: 0,
					count: 0,
					isCurrent: false,
					index: 0,
				},
				{
					timeMs: 1000,
					count: 0,
					isCurrent: true,
					index: 1,
				},
			]);
		};

		it('Shows "First time" dialog and correctly dismisses', async () => {
			await arrangeFirstVisit();

			await user.click(screen.getByRole("button", { name: "Dismiss" }));

			await checkLocalStorageAndAddEntry();
		});

		it('Can show help from "First time" dialog', async () => {
			await arrangeFirstVisit();

			await user.click(screen.getByRole("button", { name: "Show Help" }));

			expect(screen.getByTestId("help")).toBeInTheDocument();

			await user.click(screen.getByRole("button", { name: "Hide Help" }));

			expect(screen.queryByTestId("help")).not.toBeInTheDocument();

			await checkLocalStorageAndAddEntry();
		});
	});

	describe("Return visit", () => {
		beforeEach(() => {
			localStorage.setItem("helpDismissed", "t");
		});

		it("Renders the initial entry with column headers", () => {
			arrange();

			const headerRow = screen.getByRole("row");

			const headers = within(headerRow).getAllByRole("columnheader");

			["Count", "Timestamp", "Note"].forEach((title, index) =>
				expect(headers[index]).toHaveTextContent(title),
			);

			expect(getRenderedEntryValues()).toEqual([
				{
					timeMs: 0,
					count: 0,
					isCurrent: true,
					index: 0,
				},
			]);
		});

		it("Renders the controls which control playback", async () => {
			player.play = vi.fn();
			player.seekTo = vi.fn();

			const { pausedAtom } = getAtoms(platform);

			arrange();

			const controlsRegion = screen.getByRole("toolbar", { name: "Controls" });

			const inControls = within(controlsRegion);

			expect(
				inControls.queryByRole("button", { name: "Paused" }),
			).not.toBeInTheDocument();

			expect(player.play).not.toHaveBeenCalled();

			await user.click(inControls.getByRole("button", { name: "Play" }));

			expect(player.play).toHaveBeenCalledOnce();

			await act(async () => setAtoms([[pausedAtom, false]]));

			expect(
				inControls.getByRole("button", { name: "Pause" }),
			).toBeInTheDocument();

			expect(
				inControls.queryByRole("button", { name: "Play" }),
			).not.toBeInTheDocument();

			await tickToTime(12345);

			expect(player.seekTo).not.toHaveBeenCalled();

			(player.pause as Mock<typeof pauseImpl>).mockResolvedValueOnce();

			await user.click(inControls.getByRole("button", { name: "Pause" }));

			expect(player.pause).toHaveBeenCalledOnce();

			expect(player.seekTo).not.toHaveBeenCalled();

			await user.click(
				inControls.getByRole("button", { name: "Fast-forward 5 sec" }),
			);

			expect(player.seekTo).toHaveBeenCalledOnce();
			expect(player.seekTo).toHaveBeenCalledWith(17345);

			await tickToTime(17345);

			await user.click(
				inControls.getByRole("button", { name: "Rewind 5 sec" }),
			);

			expect(player.seekTo).toHaveBeenCalledTimes(2);
			expect(player.seekTo).toHaveBeenLastCalledWith(12345);
		});

		it("Highlights the current entry and updates the time display as the player is ticking", async () => {
			arrange([
				{ timeMs: 0 },
				{ timeMs: 1000 },
				{ timeMs: 2000 },
				{ timeMs: 3000 },
			]);

			const getHighlights = () =>
				screen
					.getAllByTestId("entry")
					.map((e) => JSON.parse(e.textContent as string).isCurrent);

			const getTimeDisplay = () =>
				within(screen.getByRole("toolbar", { name: "Controls" })).getByText(
					/\d:\d\d.\d\d/,
				);

			await tickToTime(0);

			expect(getHighlights()).toEqual([true, false, false, false]);
			expect(getTimeDisplay()).toHaveTextContent("0:00.00");

			await tickToTime(500);

			expect(getHighlights()).toEqual([true, false, false, false]);
			expect(getTimeDisplay()).toHaveTextContent("0:00.50");

			await tickToTime(1000);

			expect(getHighlights()).toEqual([false, true, false, false]);
			expect(getTimeDisplay()).toHaveTextContent("0:01.00");

			await tickToTime(1500);

			expect(getHighlights()).toEqual([false, true, false, false]);
			expect(getTimeDisplay()).toHaveTextContent("0:01.50");

			await tickToTime(2000);

			expect(getHighlights()).toEqual([false, false, true, false]);
			expect(getTimeDisplay()).toHaveTextContent("0:02.00");

			await tickToTime(3500);

			expect(getHighlights()).toEqual([false, false, false, true]);
			expect(getTimeDisplay()).toHaveTextContent("0:03.50");
		});

		it("Adds a new entry correctly", async () => {
			const initialEntries = [
				{ timeMs: 0 },
				{ timeMs: 1000 },
				{ timeMs: 2000 },
			];

			arrange(initialEntries);

			await tickToTime(0);

			expect(getRenderedEntryValues()).toEqual([
				{
					count: 0,
					isCurrent: true,
					timeMs: 0,
					index: 0,
				},
				{
					count: 0,
					isCurrent: false,
					timeMs: 1000,
					index: 1,
				},
				{
					count: 0,
					isCurrent: false,
					timeMs: 2000,
					index: 2,
				},
			]);

			await user.click(screen.getByRole("button", { name: "Add Entry" }));

			expect(getRenderedEntryValues()).toEqual([
				{
					count: 0,
					isCurrent: true,
					timeMs: 0,
					index: 0,
				},
				{
					count: 0,
					isCurrent: false,
					timeMs: 1000,
					index: 1,
				},
				{
					count: 0,
					isCurrent: false,
					timeMs: 2000,
					index: 2,
				},
			]);

			await tickToTime(500);

			await user.click(screen.getByRole("button", { name: "Add Entry" }));

			expect(getRenderedEntryValues()).toEqual([
				{
					count: 0,
					isCurrent: false,
					timeMs: 0,
					index: 0,
				},
				{
					count: 0,
					isCurrent: true,
					timeMs: 500,
					index: 1,
				},
				{
					count: 0,
					isCurrent: false,
					timeMs: 1000,
					index: 2,
				},
				{
					count: 0,
					isCurrent: false,
					timeMs: 2000,
					index: 3,
				},
			]);

			const { entriesAtom } = getAtoms(platform);
			setAtoms([[entriesAtom, initialEntries]]);

			await tickToTime(1000);

			await user.click(screen.getByRole("button", { name: "Add Entry" }));

			expect(getRenderedEntryValues()).toEqual([
				{
					count: 0,
					isCurrent: false,
					timeMs: 0,
					index: 0,
				},
				{
					count: 0,
					isCurrent: true,
					timeMs: 1000,
					index: 1,
				},
				{
					count: 0,
					isCurrent: false,
					timeMs: 2000,
					index: 2,
				},
			]);

			setAtoms([[entriesAtom, initialEntries]]);

			await tickToTime(1500);

			await user.click(screen.getByRole("button", { name: "Add Entry" }));

			expect(getRenderedEntryValues()).toEqual([
				{
					count: 0,
					isCurrent: false,
					timeMs: 0,
					index: 0,
				},
				{
					count: 0,
					isCurrent: false,
					timeMs: 1000,
					index: 1,
				},
				{
					count: 0,
					isCurrent: true,
					timeMs: 1500,
					index: 2,
				},
				{
					count: 0,
					isCurrent: false,
					timeMs: 2000,
					index: 3,
				},
			]);

			setAtoms([[entriesAtom, initialEntries]]);

			await tickToTime(3000);

			await user.click(screen.getByRole("button", { name: "Add Entry" }));

			expect(getRenderedEntryValues()).toEqual([
				{
					count: 0,
					isCurrent: false,
					timeMs: 0,
					index: 0,
				},
				{
					count: 0,
					isCurrent: false,
					timeMs: 1000,
					index: 1,
				},
				{
					count: 0,
					isCurrent: false,
					timeMs: 2000,
					index: 2,
				},
				{
					count: 0,
					isCurrent: true,
					timeMs: 3000,
					index: 3,
				},
			]);
		});

		it("Fills in new count if previous two entries have counts", async () => {
			arrange([{ timeMs: 0 }, { timeMs: 1000, count: 4 }]);

			await tickToTime(1495);

			await user.click(screen.getByRole("button", { name: "Add Entry" }));

			expect(getRenderedEntryValues()).toEqual([
				{
					count: 0,
					isCurrent: false,
					timeMs: 0,
					index: 0,
				},
				{
					count: 4,
					isCurrent: false,
					timeMs: 1000,
					index: 1,
				},
				{
					count: 6,
					isCurrent: true,
					timeMs: 1495,
					index: 2,
				},
			]);
		});

		it(`Renders/hides help content when the "Help" button is clicked`, async () => {
			arrange();

			expect(screen.queryByTestId("help")).not.toBeInTheDocument();

			await user.click(screen.getByRole("button", { name: "Show Help" }));

			expect(screen.getByTestId("help")).toBeInTheDocument();

			await user.click(screen.getByRole("button", { name: "Hide Help" }));

			expect(screen.queryByTestId("help")).not.toBeInTheDocument();
		});

		it("Pauses the player when unmounted", async () => {
			const { unmount } = arrange();

			expect(player.pause).not.toHaveBeenCalled();

			await act(async () => unmount());

			expect(player.pause).toHaveBeenCalledOnce();
		});

		it("Preserves the existing entries when remounted", async () => {
			const { unmount } = arrange([{ timeMs: 0, count: 1 }]);

			await act(async () => unmount());

			arrange(false);

			expect(getRenderedEntryValues()).toEqual([
				{
					timeMs: 0,
					count: 1,
					index: 0,
					isCurrent: false,
				},
			]);

			(player.pause as Mock<typeof pauseImpl>).mockResolvedValueOnce();
		});
	});
});
