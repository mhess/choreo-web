import { atom } from "jotai";
import type { Atom, Getter, PrimitiveAtom, Setter, WritableAtom } from "jotai";

export type OnTickCallback = (ms: number) => void;

export abstract class PlatformPlayer {
	_onTickCallbacks: OnTickCallback[] = [];
	_tickIntervalId?: number = undefined;

	_onPlaybackChange(paused: boolean) {
		if (!paused) {
			if (this._tickIntervalId === undefined) {
				this._tickIntervalId = window.setInterval(this._tick.bind(this), 100);
			}
		} else if (this._tickIntervalId !== undefined) {
			window.clearInterval(this._tickIntervalId);
			this._tickIntervalId = undefined;
		}
	}

	async _tick(ms?: number) {
		const timeMs = ms !== undefined ? ms : await this.getCurrentTime();
		for (const cb of this._onTickCallbacks) cb(timeMs);
	}

	abstract play(): Promise<void>;

	abstract pause(): Promise<void>;

	abstract seekTo(ms: number): void;

	abstract getCurrentTime(): Promise<number>;

	async addOnTick(cb: OnTickCallback) {
		cb(await this.getCurrentTime());
		this._onTickCallbacks.push(cb);
	}

	removeOnTick(callback: OnTickCallback) {
		if (!this._onTickCallbacks.length) return;
		const index = this._onTickCallbacks.findIndex((cb) => cb === callback);
		if (index > -1) this._onTickCallbacks.splice(index, 1);
	}
}

type PlatformAtom<T, T1 = T> = WritableAtom<T | T1, [T], void>;

export const getPlatformAtoms = <PlayerClass, StatusEnum>({
	playerAtom,
	statusAtom,
	readyStatus,
	trackName,
	artist,
	paused,
}: {
	playerAtom: PrimitiveAtom<PlayerClass>;
	statusAtom: PrimitiveAtom<StatusEnum>;
	readyStatus: StatusEnum;
	trackName?: (get: Getter) => string;
	artist?: (get: Getter) => string;
	paused?: (get: Getter) => boolean;
}) => {
	const readyPlayerAtom = atom<PlayerClass | undefined>((get) => {
		const isReady = get(statusAtom) === readyStatus;
		const player = get(playerAtom);
		return isReady && player ? player : undefined;
	});

	return {
		player: makeDerivedAtomWritable(readyPlayerAtom, undefined),
		trackName: makeWritableAtomFromReader(trackName, ""),
		artist: makeWritableAtomFromReader(artist, ""),
		paused: makeWritableAtomFromReader(paused, true),
	};
};

const makeWritableAtomFromReader = <T>(
	reader: ((get: Getter) => T) | undefined,
	initial: T,
) => {
	const sourceAtom = reader ? atom(reader) : atom(initial);

	return reader
		? makeDerivedAtomWritable(sourceAtom, initial)
		: (sourceAtom as PrimitiveAtom<T>);
};

// For testing purposes
const makeDerivedAtomWritable = <T>(
	derivedReadOnlyAtom: Atom<T>,
	initial: T,
) => {
	const flagAtom = atom(false);
	const altSourceAtom = atom<T>(initial);

	const read = (get: Getter) =>
		get(flagAtom) ? get(altSourceAtom) : get(derivedReadOnlyAtom);

	const write = (_: Getter, set: Setter, newValue: T) => {
		set(flagAtom, true);
		set(altSourceAtom, newValue);
	};

	return atom(read, write);
};

export type PlatformAtoms = ReturnType<typeof getPlatformAtoms>;
