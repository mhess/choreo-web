import { Dialog, DialogTrigger, Popover } from "react-aria-components";

import { tw } from "~/lib/utils";

import Tooltip, { tooltipOffset, tooltipStyles, withArrow } from "./Tooltip";

const isTouchDevice = window.ontouchstart || navigator.maxTouchPoints > 0;

interface Props extends React.PropsWithChildren {
	tooltip: React.ReactNode;
	className?: string;
}

export default function TooltipWithClick(props: Props) {
	const { tooltip, children, className } = props;
	const styles = className ? className : tw`${tooltipStyles} max-w-xs`;

	return isTouchDevice ? (
		<DialogTrigger>
			{children}
			<Popover offset={tooltipOffset}>
				{withArrow(
					<Dialog className={styles}>
						<p>{tooltip}</p>
					</Dialog>,
				)}
			</Popover>
		</DialogTrigger>
	) : (
		<Tooltip tooltip={tooltip}>{children}</Tooltip>
	);
}
