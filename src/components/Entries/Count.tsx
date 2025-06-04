import { IconArrowMoveDown } from "@tabler/icons-react";
import { useAtom } from "jotai";
import {
	ChangeEvent,
	FocusEvent,
	ForwardedRef,
	MutableRefObject,
	forwardRef,
	useRef,
	useState,
} from "react";
import {
	Button,
	Dialog,
	DialogTrigger,
	Heading,
	Input,
	Modal,
} from "react-aria-components";

import Tooltip, { tooltipStyles } from "~/components/Tooltip";
import { AtomicEntry, entryAtomsForPlatformAtom } from "~/lib/entries";
import { actionBtnStyles, columnWidthStyles } from "~/styles";

import { COUNT_LABEL } from "./shared";

interface CountInputProps {
	countAtom: AtomicEntry["countAtom"];
	canFillAtom: AtomicEntry["canFillAtom"];
	index: number;
}

export default function Count(props: CountInputProps) {
	const { countAtom, canFillAtom, index } = props;

	const [canFill] = useAtom(canFillAtom);

	const [{ fillCountsAtom }] = useAtom(entryAtomsForPlatformAtom);
	const [, fillRest] = useAtom(fillCountsAtom);

	const [isFocused, setIsFocused] = useState(false);
	const inputRef = useRef(null);
	const fillBtnRef = useRef(null);

	const handleBlurCapture = (e: FocusEvent<HTMLDivElement, HTMLElement>) => {
		if (
			inputRef.current === e.relatedTarget ||
			fillBtnRef.current === e.relatedTarget
		)
			return;
		setIsFocused(false);
	};

	const handleFocusCapture = (e: FocusEvent<HTMLDivElement, HTMLElement>) => {
		if (e.target === inputRef.current || e.target === fillBtnRef.current)
			setIsFocused(true);
	};

	const canShowFillTrigger = isFocused && canFill;

	return (
		<div
			className="relative"
			onBlurCapture={handleBlurCapture}
			onFocusCapture={handleFocusCapture}
		>
			<FillRest
				triggerBtnRef={fillBtnRef}
				showTrigger={canShowFillTrigger}
				action={fillRest}
				index={index}
			/>
			<CountInput ref={inputRef} atom={countAtom} index={index} />
		</div>
	);
}

const CountInput = forwardRef(function CountInput(
	{ atom, index }: { atom: CountInputProps["countAtom"]; index: number },
	ref: ForwardedRef<HTMLInputElement>,
) {
	const handleCountChange = (e: ChangeEvent<HTMLInputElement>) => {
		const newValue = Number(e.target.value);

		setCount(Number.isNaN(newValue) ? 0 : newValue, index);
	};

	const [count, setCount] = useAtom(atom);

	return (
		<Input
			ref={ref}
			className={`${columnWidthStyles.count} rounded px-2 py-0.5 text-right`}
			aria-label={COUNT_LABEL}
			value={String(count)}
			onChange={handleCountChange}
		/>
	);
});

interface FillRestProps {
	triggerBtnRef: MutableRefObject<HTMLButtonElement | null>;
	showTrigger: boolean;
	action: (index: number) => void;
	index: number;
}

const FillRest = (props: FillRestProps) => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const { triggerBtnRef, showTrigger, action, index } = props;

	const handlePressFillRest = (closeModal: () => void) => () => {
		action(index);
		closeModal();
	};

	if (!showTrigger && !isDialogOpen) return null;

	return (
		<DialogTrigger onOpenChange={setIsDialogOpen}>
			<Tooltip
				tooltip="Use the timing of this and the previous entry to fill in counts
			 					for the remaining entries."
				offset={12}
				className={`${tooltipStyles} max-w-[19.25rem]`}
			>
				<Button
					ref={triggerBtnRef}
					className="absolute top-0.5 text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
					aria-label="Fill in the rest of entry counts"
				>
					<IconArrowMoveDown style={{ width: "18px" }} viewBox="2 4 20 16" />
				</Button>
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
									Do you want to use the count of this entry and the previous
									entry to fill in the rest of the counts?
								</p>
								<div className="flex justify-end gap-4">
									<Button
										className={actionBtnStyles}
										onPress={handlePressFillRest(close)}
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
	);
};
