import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { act, renderHook, type RenderHookResult } from "@testing-library/react";

import { AtomsProvider } from "testUtils";

import type { EntriesData, Entry } from "./entries";
import { type Platform, platformAtom } from "./atoms";
import { spotifyPlayerAtom } from "./spotify";
import type { Player } from "./player";
import { useEntries, ENTRIES_STORAGE_KEY } from "./entries";
import { createStore } from "jotai";
import { _TESTING_ONLY_setPlayer, type YouTubePlayer } from "./youtube";

const defaultEntry: Entry = { count: 0, timeMs: 0, note: "Start" };

const implantLSEntries = (entries: Entry[]) => {
	beforeEach(() => {
		localStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(entries));
	});

	afterEach(() => {
		localStorage.clear();
	});
};

describe("useEntries", () => {
	beforeEach(() => {
		localStorage.clear();
		vi.clearAllMocks();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("When there are entries stored in localStorage", () => {
		const storedEntries = [{ count: 1, timeMs: 0, note: "first note" }];

		implantLSEntries(storedEntries);

		it("Renders those entries on mount", () => {
			const { result } = renderHook(() => useEntries());

			expect(result.current.entries).toEqual(storedEntries);
		});
	});

	describe("When there are no entries stored in localStorage", () => {
		it("Renders the default entry", () => {
			const { result } = renderHook(() => useEntries());

			expect(result.current.entries).toEqual([defaultEntry]);
		});
	});

	describe("Adding an entry", () => {
		it("Adds the entry to rendered entries and to localStorage", async () => {
			const { result } = renderHook(() => useEntries());

			await act(() => result.current.addEntry(2));

			const nextEntry: Entry = { count: 0, timeMs: 2, note: "" };
			const expectedEntries = [defaultEntry, nextEntry];

			expect(result.current.entries).toEqual(expectedEntries);

			vi.advanceTimersByTime(2000);

			expect(localStorage.getItem(ENTRIES_STORAGE_KEY)).toEqual(
				JSON.stringify(expectedEntries),
			);
		});

		describe("When prior entries have non-zero counts", () => {
			const priorEntries = [
				{ count: 1, timeMs: 100, note: "first" },
				{ count: 2, timeMs: 200, note: "second" },
			];

			implantLSEntries(priorEntries);

			it("Correctly fills in the count for the new entry", async () => {
				const { result } = renderHook(() => useEntries());

				await act(() => result.current.addEntry(302));

				expect(result.current.entries).toEqual([
					...priorEntries,
					{ count: 3, timeMs: 302, note: "" },
				]);
			});
		});

		describe("With a timestamp between existing entries", () => {
			const existingEntries = [
				{ count: 2, timeMs: 201, note: "" },
				{ count: 4, timeMs: 406, note: "" },
			];

			implantLSEntries(existingEntries);

			it("Places the new entry correctly", async () => {
				const { result } = renderHook(() => useEntries());

				await act(() => result.current.addEntry(299));

				const expectedEntries = [...existingEntries];
				const newExpectedEntry = {
					count: expect.any(Number),
					timeMs: 299,
					note: "",
				};
				expectedEntries.splice(1, 0, newExpectedEntry);
				expect(result.current.entries).toEqual(expectedEntries);
			});
		});

		describe("When new entry has same timestamp as existing entry", () => {
			it("Does not add the entry", async () => {
				const { result } = renderHook(() => useEntries());

				expect(result.current.entries).toEqual([defaultEntry]);

				await act(() => result.current.addEntry(0));

				expect(result.current.entries).toEqual([defaultEntry]);
			});
		});
	});

	describe("Removing an entry", () => {
		it("Removes the rendered entries and in localStorage", async () => {
			const { result } = renderHook(() => useEntries());

			await act(() => result.current.removeEntry(0));

			expect(result.current.entries).toEqual([]);

			vi.advanceTimersByTime(2000);

			expect(localStorage.getItem(ENTRIES_STORAGE_KEY)).toEqual(
				JSON.stringify([]),
			);
		});
	});

	describe("Clearing entries", () => {
		implantLSEntries([{ count: 1, timeMs: 101, note: "one" }]);

		it("Removes all entries and replaces with default in rendered and localStorage", async () => {
			const { result } = renderHook(() => useEntries());
			await act(() => result.current.clear());

			expect(result.current.entries).toEqual([defaultEntry]);

			vi.advanceTimersByTime(2000);

			expect(localStorage.getItem(ENTRIES_STORAGE_KEY)).toEqual(
				JSON.stringify([defaultEntry]),
			);
		});
	});

	describe("When provided a Player", () => {
		const store = createStore();

		const getPlayer = (platform: Platform) =>
			({
				platform,
				addOnTick: vi.fn(),
				removeOnTick: vi.fn(),
			}) as unknown as Player;

		const spotifyPlayer = getPlayer("spotify");
		const youTubePlayer = getPlayer("youtube");

		const wrapper = ({ children }: React.PropsWithChildren) => (
			<AtomsProvider
				store={store}
				initialValues={[
					[platformAtom, "spotify"],
					[spotifyPlayerAtom, spotifyPlayer],
				]}
			>
				{children}
			</AtomsProvider>
		);

		implantLSEntries([
			{ count: 0, timeMs: 0, note: "" },
			{ count: 1, timeMs: 101, note: "" },
			{ count: 3, timeMs: 205, note: "" },
		]);

		const setUpEntryHighlighting = (
			result: RenderHookResult<EntriesData, Record<string, never>>["result"],
		) => {
			const highlights = [false, false, false];

			result.current.entries.forEach((_: Entry, index: number) => {
				result.current.setHighlighter(index, (val: boolean) => {
					highlights[index] = val;
				});
			});

			return highlights;
		};

		it("Highlights, scrolls, and unmounts correctly entry with player ticking", async () => {
			const { result, unmount } = renderHook(() => useEntries(), { wrapper });

			const highlights = setUpEntryHighlighting(result);

			const $scroller = {
				scrollTop: 0,
				clientHeight: 100,
				scrollTo(_newX: number, newTop: number) {
					this.scrollTop = newTop;
				},
			} as HTMLElement;
			result.current.scrollerRef.current = $scroller;

			const entryElHeight = 50;
			result.current.containerRef.current = {
				childNodes: [0, 1, 2].map((i) => ({
					clientHeight: entryElHeight,
					offsetTop: 25 + i * entryElHeight,
				})),
			} as unknown as HTMLElement;

			expect(spotifyPlayer.addOnTick).toHaveBeenCalledOnce();
			const tickCallback = (spotifyPlayer.addOnTick as Mock).mock.calls[0][0];

			await act(() => tickCallback(0));

			expect(highlights).toEqual([true, false, false]);
			expect($scroller.scrollTop).toEqual(0);

			await act(() => tickCallback(103));

			expect(highlights).toEqual([false, true, false]);
			expect($scroller.scrollTop).toEqual(25);

			await act(() => tickCallback(120));

			expect(highlights).toEqual([false, true, false]);
			expect($scroller.scrollTop).toEqual(25);

			await act(() => tickCallback(400));

			expect(highlights).toEqual([false, false, true]);
			expect($scroller.scrollTop).toEqual(75);

			await act(() => tickCallback(5));

			expect(highlights).toEqual([true, false, false]);
			expect($scroller.scrollTop).toEqual(75);

			await act(() => unmount());

			expect(spotifyPlayer.removeOnTick).toHaveBeenCalledOnce();
			expect(spotifyPlayer.removeOnTick).toHaveBeenCalledWith(tickCallback);
		});

		it("Correctly re-highlights the first entry after the player has changed", async () => {
			const { result } = renderHook(() => useEntries(), { wrapper });

			const highlights = setUpEntryHighlighting(result);

			expect(spotifyPlayer.addOnTick).toHaveBeenCalledOnce();
			const spotifyTickCallback = (spotifyPlayer.addOnTick as Mock).mock
				.calls[0][0];

			await act(() => spotifyTickCallback(0));

			expect(highlights).toEqual([true, false, false]);

			await act(() => {
				store.set(_TESTING_ONLY_setPlayer, youTubePlayer as YouTubePlayer);
				store.set(platformAtom, "youtube");
			});

			// Entries get re-rendered on platform change
			highlights.splice(0, highlights.length, false, false, false);

			expect(spotifyPlayer.removeOnTick).toHaveBeenCalledOnce();
			expect(spotifyPlayer.removeOnTick).toHaveBeenCalledWith(
				spotifyTickCallback,
			);

			expect(youTubePlayer.addOnTick).toHaveBeenCalledOnce();
			const youTubeTickCallback = (youTubePlayer.addOnTick as Mock).mock
				.calls[0][0];

			await act(() => youTubeTickCallback(0));

			expect(highlights).toEqual([true, false, false]);
		});
	});
});
