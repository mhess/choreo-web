import { IconHelp } from "@tabler/icons-react";
import clsx from "clsx";
import {
	type CSSProperties,
	type ComponentProps,
	type ForwardedRef,
	type MutableRefObject,
	forwardRef,
	useEffect,
	useRef,
	useState,
} from "react";
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

	const dialogState = useModalState();

	const { underlayProps, modalProps } = useModalOverlay(
		{},
		dialogState,
		modalRef,
	);
	const { dialogProps, titleProps } = useDialog({}, dialogRef);

	return (
		<>
			<HelpTriggerButton
				dialogRef={dialogRef}
				dialog={dialogState}
				help={help}
			/>
			{dialogState.isOpen && (
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
										onPress={dialogState.close}
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
	dialog: ReturnType<typeof useModalState>;
}

function HelpTriggerButton(props: TriggerButtonProps) {
	const { help, dialogRef, dialog } = props;

	const btnRef = useRef<HTMLButtonElement>(null);

	const handlePress = () => {
		if (dialog.isOpen) dialog.close();
		help.toggle();
	};

	const simpleBtnProps = {
		isHelpShowing: help.isShowing,
		onPress: handlePress,
	};

	return (
		<>
			{<SimpleHelpButton ref={btnRef} {...simpleBtnProps} />}
			{dialog.isOpen && (
				<DialogHelpButton
					{...simpleBtnProps}
					originalBtnRef={btnRef}
					dialogRef={dialogRef}
				/>
			)}
		</>
	);
}

interface DialogHelpButtonProps extends SimpleHelpButtonProps {
	dialogRef: MutableRefObject<HTMLElement | null>;
	originalBtnRef: MutableRefObject<HTMLButtonElement | null>;
}

const DialogHelpButton = (props: DialogHelpButtonProps) => {
	const { originalBtnRef, dialogRef, ...simpleButtonProps } = props;

	const [positionStyling, setPositionStyling] = useState<CSSProperties>();
	const isMobile = useIsMobile();

	useEffect(() => {
		const { right: fromLeft, bottom: fromTop } =
			originalBtnRef.current!.getBoundingClientRect();
		const right = isMobile ? "50%" : window.innerWidth - fromLeft;
		const bottom = window.innerHeight - fromTop;
		const transform = isMobile ? "translateX(50%)" : undefined;

		setPositionStyling({ right, bottom, transform });
	}, [isMobile]);

	return positionStyling
		? createPortal(
				<SimpleHelpButton
					{...simpleButtonProps}
					style={positionStyling}
					className={dialogBtnStyles}
				/>,
				dialogRef.current!,
			)
		: null;
};

interface SimpleHelpButtonProps extends ComponentProps<typeof Button> {
	isHelpShowing: boolean;
}

const SimpleHelpButton = forwardRef(function SimpleHelpButton(
	props: SimpleHelpButtonProps,
	ref: ForwardedRef<HTMLButtonElement>,
) {
	const { isHelpShowing, className, ...otherProps } = props;

	return (
		<Button
			ref={ref}
			className={clsx(helpBtnStyles, className)}
			{...otherProps}
		>
			{isHelpShowing ? "Hide" : "Show"}&nbsp;Help
			<IconHelp size="1.25rem" className="ml-1" />
		</Button>
	);
});

const useModalState = () => {
	const [isOpen, setOpen] = useState(
		localStorage.getItem("helpDismissed") !== "t",
	);

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
