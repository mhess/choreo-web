import { IconHelp } from "@tabler/icons-react";
import clsx from "clsx";
import { forwardRef, useEffect, useRef, useState } from "react";
import {
	Button,
	Dialog,
	DialogTrigger,
	Heading,
	Modal,
	ModalOverlay,
} from "react-aria-components";

import { actionBtnStyles, menuButtonStyles } from "~/styles";

const LS_NO_HELP_KEY = "helpDismissed";

interface Props {
	help: { isShowing: boolean; toggle: () => void };
}

export default function HelpButton(props: Props) {
	const { help } = props;
	const [isTooltipOpen, setIsTooltipOpen] = useState(false);
	const triggerRef = useRef(null);

	const closeTooltip = () => {
		if (isTooltipOpen) localStorage.setItem(LS_NO_HELP_KEY, "true");
		setIsTooltipOpen(false);
	};

	const handlePress = () => {
		closeTooltip();
		help.toggle();
	};

	useEffect(() => {
		const noHelp = !!localStorage.getItem(LS_NO_HELP_KEY);
		if (!noHelp) setIsTooltipOpen(true);
	}, []);

	return (
		<DialogTrigger isOpen={isTooltipOpen}>
			<TriggerButton
				ref={triggerRef}
				onPress={handlePress}
				isHelpShowing={help.isShowing}
			/>
			<ModalOverlay className="fixed inset-0 overflow-hidden bg-black/75">
				<Modal className="flex h-full flex-col items-center justify-center p-4">
					<Dialog className="max-h-full max-w-lg rounded-md bg-zinc-100 p-6 dark:bg-zinc-700">
						<div
							className="overflow-auto"
							style={{ maxHeight: "calc(100vh - 5rem)" }}
						>
							<Heading slot="title" className="mb-4 text-xl">
								First time here?
							</Heading>
							<div className="flex flex-col gap-4">
								<p>
									Click the &ldquo;Show Help&rdquo; button in the bottom right
									corner of the screen to toggle the help messages!
								</p>
								<div className="flex justify-end">
									<Button onPress={closeTooltip} className={actionBtnStyles}>
										Dismiss
									</Button>
								</div>
							</div>
							<TriggerButton
								originalRef={triggerRef}
								onPress={handlePress}
								isHelpShowing={help.isShowing}
							/>
						</div>
					</Dialog>
				</Modal>
			</ModalOverlay>
		</DialogTrigger>
	);
}

interface TriggerButtonProps {
	isHelpShowing: boolean;
	onPress: () => void;
	originalRef?: React.MutableRefObject<HTMLButtonElement | null>;
}

const TriggerButton = forwardRef<HTMLButtonElement, TriggerButtonProps>(
	function TriggerButton(props, ref) {
		const { isHelpShowing, onPress, originalRef } = props;
		const [coords, setCoordinates] = useState<DOMRect>();
		const innerRef = useRef(null);

		useEffect(() => {
			if (!originalRef) return;
			setCoordinates(originalRef.current!.getBoundingClientRect());
		}, []);

		return (
			(coords || !originalRef) && (
				<Button
					ref={originalRef ? innerRef : ref}
					className={clsx(
						menuButtonStyles,
						"px-2 py-1 text-sm",
						coords &&
							"fixed shadow-[0_0_10px_1px] shadow-white data-[focus-visible]:outline-orange-500",
					)}
					style={
						coords && {
							right: `calc(100vw - ${coords.right}px)`,
							bottom: `calc(100vh - ${coords.bottom}px)`,
						}
					}
					onPress={onPress}
				>
					{isHelpShowing ? "Hide" : "Show"} Help
					<IconHelp size="1.25rem" className="ml-1" />
				</Button>
			)
		);
	},
);
