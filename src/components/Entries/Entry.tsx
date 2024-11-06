import { useAtom } from "jotai";
import {
	Dialog,
	DialogTrigger,
	Heading,
	Modal,
	Button,
} from "react-aria-components";
import { IconArrowMoveDown, IconX } from "@tabler/icons-react";

import { displayMs } from "~/lib/utils";
import { useEstablishedPlayer } from "~/lib/platformAtoms";
import { entryAtomsForPlatformAtom, type AtomicEntry } from "~/lib/entries";
import InputWithAtom from "~/components/TextInputWithAtom";
import Tooltip, { tooltipStyles } from "~/components/Tooltip";
import { actionBtnStyles } from "~/styles";

import { COUNT_LABEL, NOTE_LABEL } from "./shared";

export default function Entry(props: { entry: AtomicEntry; index: number }) {
	const { entry, index } = props;

	const player = useEstablishedPlayer();

	const [{ removeAtom }] = useAtom(entryAtomsForPlatformAtom);
	const [, removeEntry] = useAtom(removeAtom);

	const { timeMs, countAtom, noteAtom, isCurrentAtom, countFillAtom } = entry;
	const [canFill, fillRest] = useAtom(countFillAtom);
	const [isCurrent] = useAtom(isCurrentAtom);

	const displayTime = displayMs(timeMs);

	const handleClickFillRest = (closeModal: () => void) => () => {
		fillRest();
		closeModal();
	};

	return (
		<div
			role="row"
			className={`flex items-center pl-4 pr-2 ${isCurrent ? "bg-orange-300 dark:bg-yellow-700" : "bg-zinc-300 odd:bg-zinc-400 dark:bg-zinc-800 dark:odd:bg-zinc-900"}`}
		>
			<div>
				{canFill ? (
					<DialogTrigger>
						<Tooltip
							tooltip="Use the timing of this and the previous entry to fill in counts
								for the remaining entries."
							offset={12}
							className={`${tooltipStyles} max-w-[19.25rem]`}
						>
							<div className="relative">
								<Button
									className="absolute top-0.5 cursor-pointer text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
									aria-label="Fill in the rest of entry counts"
								>
									<IconArrowMoveDown
										style={{ width: "18px" }}
										viewBox="2 4 20 16"
									/>
								</Button>
							</div>
						</Tooltip>
						<Modal>
							<Dialog className="max-w-lg overflow-auto rounded-md bg-zinc-100 p-8 outline-none dark:bg-zinc-700">
								{({ close }) => (
									<div>
										<Heading slot="title" className="mb-4 text-xl">
											Fill in the rest?
										</Heading>
										<div className="flex flex-col gap-4">
											<p>
												Do you want to use the count of this entry and the
												previous entry to fill in the rest of the counts?
											</p>
											<div className="flex justify-end gap-4">
												<Button
													className={actionBtnStyles}
													onPress={handleClickFillRest(close)}
												>
													Yes
												</Button>
												<Button
													className="rounded border border-zinc-600 px-4 py-2 hover:backdrop-brightness-95 dark:hover:backdrop-brightness-110"
													onPress={close}
												>
													No
												</Button>
											</div>
										</div>
									</div>
								)}
							</Dialog>
						</Modal>
					</DialogTrigger>
				) : undefined}
				<InputWithAtom
					className="w-12 rounded px-2 py-0.5 text-right"
					aria-label={COUNT_LABEL}
					type="number"
					atom={countAtom}
				/>
			</div>
			<Button
				aria-label={`Seek to ${displayTime}`}
				className="w-[5.5rem] px-4 py-2 text-right hover:text-blue-400"
				onPress={() => player.seekTo(timeMs)}
			>
				{displayTime}
			</Button>
			<InputWithAtom
				className="mr-2 min-w-0 flex-1 rounded px-2 py-0.5"
				aria-label={NOTE_LABEL}
				atom={noteAtom}
			/>
			<Button
				className="rounded p-1 backdrop-brightness-95 hover:backdrop-brightness-90 disabled:opacity-0 dark:backdrop-brightness-110 hover:dark:backdrop-brightness-125"
				aria-label="Delete Entry"
				isDisabled={!index}
				onPress={() => removeEntry(index)}
			>
				<IconX size="1rem" />
			</Button>
		</div>
	);
}
