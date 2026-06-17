import { IconX } from "@tabler/icons-react";
import { clsx } from "clsx";
import { WritableAtom, useAtom } from "jotai";
import { ChangeEvent, ComponentProps, memo, useEffect, useState } from "react";
import { Button, Input } from "react-aria-components";

import { type AtomicEntry, entryAtomsForPlatformAtom } from "~/lib/entries";
import { useEstablishedPlayer } from "~/lib/platformAtoms";
import type { OnTickCallback } from "~/lib/player";
import { displayMs } from "~/lib/utils";
import { columnWidthStyles } from "~/styles";

import Count from "./Count";
import { NOTE_LABEL } from "./shared";

const delBtnStyles =
	"p-hover:backdrop-brightness-90 rounded p-1 backdrop-brightness-95 disabled:opacity-0 dark:backdrop-brightness-110 hover:dark:backdrop-brightness-125";

function Entry(props: { entry: AtomicEntry; index: number }) {
	const { entry, index } = props;

	const player = useEstablishedPlayer();

	const [{ removeAtom }] = useAtom(entryAtomsForPlatformAtom);
	const [, removeEntry] = useAtom(removeAtom);

	const {
		timeMs,
		countAtom,
		noteAtom,
		isCurrentAtom,
		canFillAtom: countFillAtom,
	} = entry;
	const [isCurrent] = useAtom(isCurrentAtom);

	const displayTime = displayMs(timeMs);

	return (
		<div
			role="row"
			className={clsx(
				"relative pr-2 pl-4",
				isCurrent
					? "bg-orange-300 dark:bg-yellow-700"
					: "bg-zinc-300 odd:bg-zinc-400 dark:bg-zinc-800 dark:odd:bg-zinc-900",
			)}
		>
			{isCurrent ? <Progress index={index} timeMs={timeMs} /> : null}
			<div className="flex items-center">
				<Count
					countAtom={countAtom}
					canFillAtom={countFillAtom}
					index={index}
				/>
				<Button
					aria-label={`Seek to ${displayTime}`}
					className={`${columnWidthStyles.timestamp} px-4 py-2 text-right hover:text-blue-400`}
					onPress={() => player.seekTo(timeMs)}
				>
					{displayTime}
				</Button>
				{/* TODO: in-line this component and delete the importing file */}
				<NoteInput
					id={`note-${index}`}
					className="mr-2 min-w-0 flex-1 rounded px-2 py-0.5"
					aria-label={`${NOTE_LABEL} for entry ${index + 1}`}
					atom={noteAtom}
				/>
				<Button
					className={clsx(delBtnStyles, !index && "cursor-default")}
					aria-label="Delete Entry"
					isDisabled={!index}
					onPress={() => removeEntry(index)}
				>
					<IconX size="1rem" />
				</Button>
			</div>
		</div>
	);
}

interface NoteInputProps extends ComponentProps<"input"> {
	atom: WritableAtom<string, [string], void>;
}

const Progress = (props: { index: number; timeMs: number }) => {
	const { index, timeMs } = props;

	const player = useEstablishedPlayer();
	const [{ entriesAtom }] = useAtom(entryAtomsForPlatformAtom);
	const [entries] = useAtom(entriesAtom);
	const [progress, setProgress] = useState(0);

	// It's possible that this could be achieved in a much less computationally
	// expensive and jerky way using CSS animations, but it would require a lot
	// of work to make it robust for seeking and buffering.
	useEffect(() => {
		if (index >= entries.length - 1) return;

		const nextEntry = entries[index + 1];
		const entryLengthMs = nextEntry.timeMs - timeMs;

		const cb: OnTickCallback = (ms) => {
			if (ms > nextEntry.timeMs || ms < timeMs) return;
			const percent = ((ms - timeMs) / entryLengthMs) * 100;
			setProgress(percent);
		};

		player.addOnTick(cb);
		return () => player.removeOnTick(cb);
	}, [player, entries]);

	return (
		<div
			style={{ width: `${progress}%` }}
			className="pointer-events-none absolute top-0 left-0 h-full backdrop-brightness-70"
		/>
	);
};

const NoteInput = (props: NoteInputProps) => {
	const { atom, ...inputProps } = props;
	const [note, setNote] = useAtom(atom);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setNote(e.target.value);
	};

	return <Input {...inputProps} value={note} onChange={handleChange} />;
};

export default memo(Entry);
