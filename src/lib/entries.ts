import { atom, useAtom } from "jotai";
import type { Atom, Getter, PrimitiveAtom, Setter, WritableAtom } from "jotai";
import Papa from "papaparse";
import { useLayoutEffect } from "react";

import { type Platform, platformAtom, platforms } from "~/lib/platformAtoms";

export type Entry = {
	count: number;
	timeMs: number;
	note: string;
};

export type AtomicEntry = {
	countAtom: WritableAtom<number, [number, number, boolean?], void>;
	timeMs: number;
	loopAtom: WritableAtom<number, [number], void>;
	noteAtom: PrimitiveAtom<string>;
	isCurrentAtom: PrimitiveAtom<boolean>;
	canFillAtom: PrimitiveAtom<boolean>;
};

type PlatformEntryAtoms = {
	initEntriesAtom: WritableAtom<null, [], void>;
	entriesAtom: WritableAtom<AtomicEntry[], [EntryInput[]?], void>;
	addAtom: WritableAtom<null, [number], void>;
	removeAtom: WritableAtom<null, [number], void>;
	clearAtom: WritableAtom<null, [], void>;
	fillCountsAtom: WritableAtom<null, [number], void>;
	currentIndexAtom: WritableAtom<
		null,
		[number, boolean],
		[number | null, number | null]
	>;
	saveToCSVAtom: WritableAtom<null, [string], void>;
	loadFromCSVAtom: WritableAtom<null, [File], Promise<void>>;
};

export const useEntryAtoms = () => {
	const [platformEntryAtoms] = useAtom(entryAtomsForPlatformAtom);
	const [, initEntries] = useAtom(platformEntryAtoms.initEntriesAtom);

	useLayoutEffect(() => {
		initEntries();
	}, [initEntries]);

	return platformEntryAtoms;
};

// Can't easily export contained atoms because most are WritableAtom's
// with function signatures that must be replicated in when creating a
// new atom
export const entryAtomsForPlatformAtom = atom(
	(get) => entryAtomsByPlatform[get(platformAtom)],
);

// declare global {
// 	interface Window {
// 		atoms: Record<Platform, {}>;
// 	}
// }
// window.atoms = {} as Window["atoms"];

const createPlatformEntryAtoms = (): PlatformEntryAtoms => {
	// For debugging. Since these atoms are never passed to the useAtom() hook,
	// the only way to see their values is to put them on the window.
	// window.atoms[platform] = {};
	const currentEntryAtom = atom<AtomicEntry | null>(null);

	const entriesSrcAtom = atom<AtomicEntry[]>([]);

	const makeAtomicEntry = getAtomicEntryMaker(entriesSrcAtom);

	const entriesAtom = atom(
		(get) => get(entriesSrcAtom),
		(_, set, entryInputs: EntryInput[] = []) => {
			const newInputs = entryInputs.length
				? entryInputs
				: [{ timeMs: 0, note: "Start", isCurrent: true }];

			const newEntries = newInputs.map(makeAtomicEntry);
			set(entriesSrcAtom, newEntries);
		},
	);

	const initEntriesAtom = atom(null, (get, set) => {
		if (!get(entriesAtom).length) set(entriesAtom);
	});

	const addAtom = atom(null, (get: Getter, set: Setter, timeMs: number) => {
		const entries = get(entriesSrcAtom);
		const index = findEntryIndex(entries, timeMs);

		if (entries[index]?.timeMs === timeMs) return;

		for (const entry of entries) set(entry.isCurrentAtom, false);
		const count = guessCountForIndex(get, entries, index, timeMs);
		const newEntry: AtomicEntry = makeAtomicEntry({
			count,
			timeMs,
			note: "",
			isCurrent: true,
		});

		const newEntries = [
			...entries.slice(0, index),
			newEntry,
			...entries.slice(index),
		];

		set(entriesSrcAtom, newEntries);
	});

	const removeAtom = atom(null, (get: Getter, set: Setter, index: number) => {
		if (!index) return;
		const newEntries = [...get(entriesAtom)];
		newEntries.splice(index, 1);
		set(entriesSrcAtom, newEntries);
	});

	const clearAtom = atom(null, (_: Getter, set: Setter) => {
		set(entriesAtom);
	});

	const fillCountsAtom = atom(null, (get, set, index: number) => {
		const entries = get(entriesAtom);

		set(entries[index].canFillAtom, false);

		for (let i = index + 1; i < entries.length; i++) {
			const entry = entries[i];
			const count = guessCountForIndex(get, entries, i, entry.timeMs);
			set(entry.countAtom, count, i, true);
			set(entry.canFillAtom, false);
		}
	});

	// TODO: change to `setHighlightIndexAtom` or something else that has a verb
	//			 as the first word
	const currentIndexAtom = atom(
		null,
		(
			get: Getter,
			set: Setter,
			timeMs: number,
			isSeek: boolean,
		): [number | null, number | null] => {
			const entries = get(entriesAtom);
			const prevEntry = get(currentEntryAtom);

			let nextIndex = findHighlightIndex(entries, timeMs);
			let nextEntry = entries[nextIndex];

			// Still in same entry
			if (nextEntry === prevEntry) return [null, null];

			const loopState = prevEntry ? get(prevEntry.loopAtom) : 0;

			if (isSeek || loopState === 0 || loopState === 1) {
				if (prevEntry) set(prevEntry.isCurrentAtom, false);
				set(nextEntry.isCurrentAtom, true);
				set(currentEntryAtom, nextEntry);
				return [nextIndex, null];
			}

			if (loopState === 3) return [null, prevEntry!.timeMs];

			// loopState === 2
			do {
				nextEntry = entries[--nextIndex];
				if (get(nextEntry.loopAtom) === 1) break;
			} while (nextIndex);
			return [null, nextEntry.timeMs];
		},
	);

	const saveToCSVAtom = atom(null, (get, _, fileName: string) => {
		const jsonableEntries = get(entriesAtom).map((atomic) => ({
			count: get(atomic.countAtom),
			timeMs: atomic.timeMs,
			note: get(atomic.noteAtom),
		}));

		saveToCSV(fileName, jsonableEntries);
	});

	const loadFromCSVAtom = atom(null, async (_, set, file: File) => {
		const entries = await loadFromCSV(file);
		set(entriesSrcAtom, entries.map(makeAtomicEntry));
	});

	return {
		initEntriesAtom,
		entriesAtom,
		addAtom,
		removeAtom,
		clearAtom,
		fillCountsAtom,
		currentIndexAtom,
		saveToCSVAtom,
		loadFromCSVAtom,
	};
};

export type EntryInput = Partial<Omit<Entry, "timeMs">> & {
	timeMs: number;
	isCurrent?: boolean;
};

const getAtomicEntryMaker =
	(entriesAtom: Atom<AtomicEntry[]>) =>
	(entry: EntryInput): AtomicEntry => {
		const canFillAtom = atom(false);

		const countSrcAtom = atom(entry.count || 0);
		const countAtom = atom(
			(get) => get(countSrcAtom),
			(get, set, count: number, index: number, isFill = false) => {
				set(countSrcAtom, count);

				if (!isFill) {
					set(canFillAtom, !getDoCountsAlign(get, entriesAtom, index));
				}
			},
		);
		const loopSrcAtom = atom(0);
		const loopAtom = atom(
			(get) => get(loopSrcAtom),
			(get, set, entryIndex: number) => {
				let nextState = (get(loopSrcAtom) + 1) % 4;
				if (!entryIndex && nextState === 2) nextState = 3;
				set(loopSrcAtom, nextState);
			},
		);

		return {
			countAtom,
			timeMs: entry.timeMs,
			loopAtom,
			noteAtom: atom(entry.note || ""),
			isCurrentAtom: atom(entry.isCurrent || false),
			canFillAtom,
		};
	};

const entryAtomsByPlatform = platforms.reduce(
	(entriesByPlatform, platform) => {
		entriesByPlatform[platform] = createPlatformEntryAtoms();
		return entriesByPlatform;
	},
	{} as Record<Platform, PlatformEntryAtoms>,
);

const getDoCountsAlign = (
	get: Getter,
	entriesAtom: Atom<AtomicEntry[]>,
	index: number,
) => {
	const entries = get(entriesAtom);
	const entry = entries[index];
	const prevEntry = entries[index - 1];
	const nextEntry = entries[index + 1];
	if (!prevEntry || !nextEntry) return true;
	const prevCountMs = getCountMs(get, prevEntry, entry);
	if (!prevCountMs) return true;
	const nextTimeDelta = nextEntry.timeMs - entry.timeMs;
	const expectedCountDelta = Math.round(nextTimeDelta / prevCountMs);

	const delta = get(nextEntry.countAtom) - get(entry.countAtom);
	return delta === expectedCountDelta;
};

const findEntryIndex = (
	entries: { timeMs: number }[],
	timeMs: number,
): number => {
	let s = 0;
	let e = entries.length;

	while (s !== e) {
		const pivot = ((e - s) >> 1) + s;
		const pivotTime = entries[pivot].timeMs;
		if (timeMs <= pivotTime) e = pivot;
		else s = pivot + 1;
	}

	return s;
};

const findHighlightIndex = (
	entries: { timeMs: number }[],
	timeMs: number,
): number => {
	let s = 0;
	let e = entries.length;
	const lastIndex = e - 1;

	if (timeMs > entries[lastIndex].timeMs) return lastIndex;

	let diff: number;
	do {
		diff = e - s;
		const pivot = (diff >> 1) + s;
		const pivotTime = entries[pivot].timeMs;
		if (timeMs < pivotTime) e = pivot;
		else s = pivot;
	} while (diff > 1);

	return s;
};

const guessCountForIndex = (
	get: Getter,
	entries: AtomicEntry[],
	index: number,
	timeMs: number,
): number => {
	const sliceStartIndex = index - 2 < 0 ? 0 : index - 2;
	const priorTwo = entries.slice(sliceStartIndex, index);

	if (!priorTwo.length) return 0;

	if (priorTwo.length === 1) return get(priorTwo[0].countAtom);

	const [first, second] = priorTwo;

	const countLengthMs = getCountMs(get, first, second);
	if (!countLengthMs) return get(second.countAtom);

	const timeDeltaMs = timeMs - second.timeMs;
	const countDelta = Math.round(timeDeltaMs / countLengthMs);

	return countDelta + get(second.countAtom);
};

type CountAndTime = Pick<AtomicEntry, "countAtom" | "timeMs">;

/**
 * Calculate the milliseconds in each unit of count given by the count
 * difference between two entries.
 */
const getCountMs = (get: Getter, first: CountAndTime, second: CountAndTime) => {
	const countDelta = get(second.countAtom) - get(first.countAtom);
	if (countDelta <= 0) return 0;
	const msDelta = second.timeMs - first.timeMs;
	return Math.round(msDelta / countDelta);
};

const saveToCSV = (fileName: string, entries: Entry[]) => {
	const csv = Papa.unparse(entries, { quotes: true });
	const file = new Blob([csv], { type: "text/csv" });
	const $a = document.createElement("a");
	const url = URL.createObjectURL(file);
	$a.href = url;
	$a.download = `${fileName}.csv`;
	$a.style.height = "0";
	document.body.appendChild($a);
	$a.click();
	setTimeout(() => {
		$a.remove();
		window.URL.revokeObjectURL(url);
	}, 1);
};

const loadFromCSV = async (file: File) => {
	const csv = await file.text();
	const result = Papa.parse<Entry>(csv, { header: true, dynamicTyping: true });
	if (result.errors.length) {
		alert(`CSV had errors ${result.errors.map((e) => e.message).join("\r\n")}`);
		return [];
	}
	return result.data;
};
