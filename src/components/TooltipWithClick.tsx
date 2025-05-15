import {
	Dialog,
	DialogTrigger,
	Popover,
	Tooltip,
	TooltipTrigger,
} from "react-aria-components";
import { tw } from "~/lib/utils";

import { tooltipStyles, withArrow } from "~/styles";

interface Props extends React.PropsWithChildren {
	tooltip: React.ReactNode;
	className?: string;
}

const isTouchDevice = window.ontouchstart || navigator.maxTouchPoints > 0;

export default function TooltipWithClick(props: Props) {
	const { tooltip, children, className } = props;
	const styles = className ? className : tw`${tooltipStyles} max-w-xs`;

	return isTouchDevice ? (
		<DialogTrigger>
			{children}
			<Popover offset={10}>
				{withArrow(
					<Dialog className={styles}>
						<p>{children}</p>
					</Dialog>,
				)}
			</Popover>
		</DialogTrigger>
	) : (
		<TooltipTrigger delay={0}>
			{children}
			<Tooltip className={styles} offset={10}>
				{withArrow(tooltip)}
			</Tooltip>
		</TooltipTrigger>
	);
}
