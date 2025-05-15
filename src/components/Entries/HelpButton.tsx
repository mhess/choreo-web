import { IconHelp } from "@tabler/icons-react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button, Heading, Dialog } from "react-aria-components";
import { Overlay, useModalOverlay, useOverlayTrigger } from "react-aria";

import { useIsMobile } from "~/lib/utils";
import { actionBtnStyles, menuButtonStyles } from "~/styles";

interface HelpState {
	isShowing: boolean;
	toggle: () => void;
}

interface Props {
	help: HelpState;
}

export default function HelpButton(props: Props) {
	const { help } = props;
	const isMobile = useIsMobile();

	const dialogRef = useRef(null);
	const modalRef = useRef(null);

	const state = useModalState();

	const { underlayProps, modalProps } = useModalOverlay({}, state, modalRef);
	const { overlayProps } = useOverlayTrigger({ type: "dialog" }, state);

	return (
		<>
			<TriggerButton dialogRef={dialogRef} dialogState={state} help={help} />
			{state.isOpen && (
				<Overlay>
					<div {...underlayProps} className="react-aria-ModalOverlay">
						<div
							ref={modalRef}
							{...modalProps}
							className="flex h-full flex-col items-center justify-center p-4"
						>
							<Dialog
								{...overlayProps}
								ref={dialogRef}
								className="max-h-full max-w-lg rounded-md bg-zinc-100 p-6 dark:bg-zinc-700"
							>
								<>
									<Heading slot="title" className="mb-4 text-xl">
										First time here?
									</Heading>
									<div className="flex flex-col gap-4">
										<p>
											Click the &ldquo;Show Help&rdquo; button{" "}
											{isMobile
												? "at the bottom"
												: "in the bottom right corner"}{" "}
											of the screen to toggle the help messages!
										</p>
										<Button
											onPress={state.close}
											className={clsx(actionBtnStyles, "self-end")}
										>
											Dismiss
										</Button>
									</div>
								</>
							</Dialog>
						</div>
					</div>
				</Overlay>
			)}
		</>
	);
}

interface TriggerButtonProps {
	help: HelpState;
	dialogRef: React.MutableRefObject<HTMLDivElement | null>;
	dialogState: ReturnType<typeof useModalState>;
}

interface ModalHelpStyles {
	bottom: number;
	right: number | string;
	transform?: string;
}

function TriggerButton(props: TriggerButtonProps) {
	const isMobile = useIsMobile();
	const btnRef = useRef<HTMLButtonElement>(null);
	const { help, dialogRef, dialogState } = props;
	const [dialogBtnStyles, setDialogBtnStyles] = useState<ModalHelpStyles>();

	useEffect(() => {
		if (!dialogState.isOpen || dialogBtnStyles) return;
		const { right: fromLeft, bottom: fromTop } =
			btnRef.current!.getBoundingClientRect();
		const right = isMobile ? "50%" : window.innerWidth - fromLeft;
		const bottom = window.innerHeight - fromTop;
		const transform = isMobile ? "translateX(50%)" : undefined;

		setDialogBtnStyles({ right, bottom, transform });
	}, [isMobile, dialogState.isOpen]);

	const handlePress = () => {
		if (dialogState.isOpen) {
			dialogState.close();
			setDialogBtnStyles(undefined);
		}
		help.toggle();
	};

	const btnEl = (
		<Button
			ref={btnRef}
			className={clsx(
				menuButtonStyles,
				"px-2 py-1 text-sm",
				dialogBtnStyles &&
					"fixed shadow-[0_0_10px_1px] shadow-white data-[focus-visible]:outline-orange-500",
			)}
			style={dialogBtnStyles}
			onPress={handlePress}
		>
			{help.isShowing ? "Hide" : "Show"} Help
			<IconHelp size="1.25rem" className="ml-1" />
		</Button>
	);

	return dialogBtnStyles ? createPortal(btnEl, dialogRef.current!) : btnEl;
}

const useModalState = () => {
	const [isOpen, setOpen] = useState(!localStorage.helpDismissed);

	return {
		open: () => setOpen(true),
		close: () => {
			setOpen(false);
			localStorage.helpDismissed = true;
		},
		isOpen,
		setOpen,
		toggle: () => setOpen((prev) => !prev),
	};
};
