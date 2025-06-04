import { IconX } from "@tabler/icons-react";
import { clsx } from "clsx";
import { useAtom } from "jotai";
import { Button } from "react-aria-components";

import InputWithAtom from "~/components/TextInputWithAtom";
import { type AtomicEntry, entryAtomsForPlatformAtom } from "~/lib/entries";
import { useEstablishedPlayer } from "~/lib/platformAtoms";
import { displayMs } from "~/lib/utils";
import { columnWidthStyles } from "~/styles";

import Count from "./Count";
import { NOTE_LABEL } from "./shared";

export default function Entry(props: { entry: AtomicEntry; index: number }) {
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
				"flex items-center pr-2 pl-4",
				isCurrent
					? "bg-orange-300 dark:bg-yellow-700"
					: "bg-zinc-300 odd:bg-zinc-400 dark:bg-zinc-800 dark:odd:bg-zinc-900",
			)}
		>
			<Count countAtom={countAtom} canFillAtom={countFillAtom} index={index} />
			<Button
				aria-label={`Seek to ${displayTime}`}
				className={`${columnWidthStyles.timestamp} px-4 py-2 text-right hover:text-blue-400`}
				onPress={() => player.seekTo(timeMs)}
			>
				{displayTime}
			</Button>
			{/* TODO: in-line this component and delete the importing file */}
			<InputWithAtom
				className="mr-2 min-w-0 flex-1 rounded px-2 py-0.5"
				aria-label={NOTE_LABEL}
				atom={noteAtom}
			/>
			<Button
				className={clsx(
					"p-hover:backdrop-brightness-90 rounded p-1 backdrop-brightness-95 disabled:opacity-0 dark:backdrop-brightness-110 hover:dark:backdrop-brightness-125",
					!index && "cursor-default",
				)}
				aria-label="Delete Entry"
				isDisabled={!index}
				onPress={() => removeEntry(index)}
			>
				<IconX size="1rem" />
			</Button>
		</div>
	);
}
