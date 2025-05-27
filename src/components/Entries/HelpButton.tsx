import { IconHelp } from "@tabler/icons-react";
import { cloneElement, useEffect, useRef, useState } from "react";
import { Overlay, useDialog, useModalOverlay } from "react-aria";
import { Button } from "react-aria-components";
import { createPortal } from "react-dom";

import { tw, useIsMobile } from "~/lib/utils";
import { actionBtnStyles, menuBtnStyles } from "~/styles";

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
	const { dialogProps, titleProps } = useDialog({}, dialogRef);

	return (
		<>
			<TriggerButton dialogRef={dialogRef} dialogState={state} help={help} />
			{state.isOpen && (
				<Overlay>
					<div
						{...underlayProps}
						className="fixed inset-0 flex items-center justify-center bg-black/75"
					>
						<div
							ref={modalRef}
							{...modalProps}
							className="flex h-full flex-col items-center justify-center p-4"
						>
							<div
								{...dialogProps}
								ref={dialogRef}
								className="max-h-full max-w-lg rounded-md bg-zinc-100 p-6 dark:bg-zinc-700"
							>
								<h3 {...titleProps} className="mb-4 text-xl">
									First time here?
								</h3>
								<div className="flex flex-col gap-4">
									<p>
										Click the &ldquo;Show Help&rdquo; button{" "}
										{isMobile ? "at the bottom" : "in the bottom right corner"}{" "}
										of the screen to toggle the help messages!
									</p>
									<Button
										onPress={state.close}
										className={`${actionBtnStyles} self-end`}
									>
										Dismiss
									</Button>
								</div>
							</div>
						</div>
					</div>
				</Overlay>
			)}
		</>
	);
}

const dialogBtnStyles = tw`fixed shadow-[0_0_10px_1px] shadow-white data-[focus-visible]:outline-orange-500`;
const helpBtnStyles = tw`${menuBtnStyles} px-2 py-1 text-sm`;

interface TriggerButtonProps {
	help: HelpState;
	dialogRef: React.MutableRefObject<HTMLDivElement | null>;
	dialogState: ReturnType<typeof useModalState>;
}

function TriggerButton(props: TriggerButtonProps) {
	const isMobile = useIsMobile();
	const btnRef = useRef<HTMLButtonElement>(null);
	const { help, dialogRef, dialogState: dialog } = props;
	const [dialogBtnPositionStyles, setDialogBtnPositionStyles] =
		useState<React.CSSProperties>();

	useEffect(() => {
		if (dialogBtnPositionStyles) setDialogBtnPositionStyles(undefined);
	}, [isMobile, dialog.isOpen]);

	useEffect(() => {
		if (dialog.isOpen && !dialogBtnPositionStyles) {
			const { right: fromLeft, bottom: fromTop } =
				btnRef.current!.getBoundingClientRect();
			const right = isMobile ? "50%" : window.innerWidth - fromLeft;
			const bottom = window.innerHeight - fromTop;
			const transform = isMobile ? "translateX(50%)" : undefined;

			setDialogBtnPositionStyles({ right, bottom, transform });
		}
	}, [dialogBtnPositionStyles]);

	const handlePress = () => {
		if (dialog.isOpen) dialog.close();
		help.toggle();
	};

	const btnEl = (
		<Button ref={btnRef} className={helpBtnStyles} onPress={handlePress}>
			{help.isShowing ? "Hide" : "Show"} Help
			<IconHelp size="1.25rem" className="ml-1" />
		</Button>
	);

	const shouldShowDialogButton = Boolean(
		dialog.isOpen && dialogBtnPositionStyles,
	);

	const dialogButton = shouldShowDialogButton
		? createPortal(
				cloneElement(btnEl, {
					style: dialogBtnPositionStyles,
					className: `${helpBtnStyles} ${dialogBtnStyles}`,
				}),
				dialogRef.current!,
			)
		: null;

	return (
		<>
			{btnEl}
			{dialogButton}
		</>
	);
}

const useModalState = () => {
	const [isOpen, setOpen] = useState(!localStorage.getItem("helpDismissed"));

	return {
		open: () => setOpen(true),
		close: () => {
			setOpen(false);
			localStorage.setItem("helpDismissed", "t");
		},
		isOpen,
		setOpen,
		toggle: () => setOpen((prev) => !prev),
	};
};
