import { useAtom } from "jotai";
import {
	Button,
	CloseButton,
	Group,
	Modal,
	Stack,
	Text,
	Tooltip,
} from "@mantine/core";
import { IconArrowMoveDown } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

import { displayMs } from "~/lib/utils";
import { useEstablishedPlayer } from "~/lib/platformAtoms";
import { entryAtomsForPlatformAtom, type AtomicEntry } from "~/lib/entries";
import { COUNT_LABEL, NOTE_LABEL } from "./Entries";

import InputWithAtom from "~/components/TextInputWithAtom";

import classes from "./Entry.module.css";

export default function Entry({
	entry,
	index,
}: {
	entry: AtomicEntry;
	index: number;
}) {
	const player = useEstablishedPlayer();
	const [opened, { open: openFillModal, close: closeFillModal }] =
		useDisclosure();

	const [{ removeAtom }] = useAtom(entryAtomsForPlatformAtom);
	const [, removeEntry] = useAtom(removeAtom);

	const { timeMs, countAtom, noteAtom, isCurrentAtom, countFillAtom } = entry;
	const [canFill, fillRest] = useAtom(countFillAtom);
	const [isCurrent] = useAtom(isCurrentAtom);

	const displayTime = displayMs(timeMs);

	const handleClickFillRest = () => {
		fillRest();
		closeFillModal();
	};

	return (
		<Group
			role="row"
			className={`${classes.entry}${isCurrent ? ` ${classes.highlight}` : ""}`}
		>
			<Modal
				title="Fill in the rest?"
				styles={{
					title: { fontSize: "var(--mantine-font-size-xl)", fontWeight: 700 },
				}}
				opened={opened}
				onClose={closeFillModal}
				withCloseButton={false}
				padding="lg"
			>
				<Stack>
					<Text>
						Do you want to use the count of this entry and the previous entry to
						fill in the rest of the counts?
					</Text>
					<Group justify="right" gap="xs">
						{/* TODO: Maybe use app purple color? */}
						<Button size="sm" variant="filled" onClick={handleClickFillRest}>
							Yes
						</Button>
						<Button size="sm" variant="outline" onClick={closeFillModal}>
							No
						</Button>
					</Group>
				</Stack>
			</Modal>
			<div className="relative">
				{canFill ? (
					<Tooltip
						openDelay={750}
						w={211}
						label="Use the timing of this and the previous entry to fill in counts for the remaining entries"
						multiline
					>
						<IconArrowMoveDown
							className="absolute top-0 cursor-pointer hover:text-blue-300"
							style={{ width: "18px" }}
							viewBox="2 4 20 16"
							role="button"
							aria-label="Fill in the rest of entry counts"
							onClick={openFillModal}
						/>
					</Tooltip>
				) : undefined}
				<InputWithAtom
					className="w-16 rounded px-2 py-0.5 text-right"
					aria-label={COUNT_LABEL}
					// leftSectionWidth="22"
					// classNames={{ input: classes.countInput }}
					// min={0}
					type="number"
					atom={countAtom}
				/>
			</div>
			<Text
				role="button"
				aria-label={`Seek to ${displayTime}`}
				span
				className={classes.timestamp}
				onClick={() => player.seekTo(timeMs)}
			>
				{displayTime}
			</Text>
			<InputWithAtom
				className="mr-2 flex-1 rounded px-2 py-0.5"
				aria-label={NOTE_LABEL}
				atom={noteAtom}
			/>
			<CloseButton
				aria-label="Delete Entry"
				disabled={!index}
				onClick={() => removeEntry(index)}
			/>
		</Group>
	);
}
