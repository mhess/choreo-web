import { IconHelp } from "@tabler/icons-react";
import clsx from "clsx";
import { forwardRef, useEffect, useRef, useState } from "react";
import { Button, Heading, Dialog } from "react-aria-components";
import { Overlay, useModalOverlay, useOverlayTrigger } from "react-aria";

import { useIsMobile } from "~/lib/utils";
import { actionBtnStyles, menuButtonStyles } from "~/styles";

interface Props {
	help: { isShowing: boolean; toggle: () => void };
}

export default function HelpButton(props: Props) {
	const { help } = props;
	const isMobile = useIsMobile();

	const highlightRef = useRef(null);
	const modalRef = useRef(null);

	const state = useModalState();

	const { underlayProps, modalProps } = useModalOverlay({}, state, modalRef);
	const { overlayProps } = useOverlayTrigger({ type: "dialog" }, state);

	return (
		<>
			<HighlightButton
				ref={highlightRef}
				onPress={help.toggle}
				isHelpShowing={help.isShowing}
			/>
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
									<HighlightButton
										originalRef={highlightRef}
										onPress={() => {
											state.close();
											help.toggle();
										}}
									/>
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
	isHelpShowing?: boolean;
	onPress: () => void;
	originalRef?: React.MutableRefObject<HTMLButtonElement | null>;
}

interface ModalHelpStyles {
	bottom: number;
	right: number | string;
	transform?: string;
}

const HighlightButton = forwardRef<HTMLButtonElement, TriggerButtonProps>(
	function HighlightButton(props, ref) {
		const isMobile = useIsMobile();
		const { isHelpShowing, onPress, originalRef } = props;
		const [btnStyles, setBtnStyles] = useState<ModalHelpStyles>();
		const innerRef = useRef(null);

		useEffect(() => {
			if (!originalRef) return;
			const { right: fromLeft, bottom: fromTop } =
				originalRef.current!.getBoundingClientRect();
			const right = isMobile ? "50%" : window.innerWidth - fromLeft;
			const bottom = window.innerHeight - fromTop;
			const transform = isMobile ? "translateX(50%)" : undefined;

			setBtnStyles({ right, bottom, transform });
		}, [isMobile]);

		return (
			(btnStyles || !originalRef) && (
				<Button
					ref={originalRef ? innerRef : ref}
					className={clsx(
						menuButtonStyles,
						"px-2 py-1 text-sm",
						btnStyles &&
							"fixed shadow-[0_0_10px_1px] shadow-white data-[focus-visible]:outline-orange-500",
					)}
					style={btnStyles}
					onPress={onPress}
				>
					{isHelpShowing ? "Hide" : "Show"} Help
					<IconHelp size="1.25rem" className="ml-1" />
				</Button>
			)
		);
	},
);

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
