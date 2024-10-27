import {
	Dialog,
	DialogTrigger,
	Popover,
	Tooltip,
	TooltipTrigger,
} from "react-aria-components";

import { menuStyles } from "~/styles";

interface Props extends React.PropsWithChildren {
	tooltip: React.ReactNode;
}

const isTouchDevice = window.ontouchstart || navigator.maxTouchPoints > 0;

export default function TooltipWithClick(props: Props) {
	const { tooltip, children } = props;

	return isTouchDevice ? (
		<DialogTrigger>
			{children}
			<Popover offset={8}>
				<Dialog className={`${menuStyles} max-w-xs`}>
					<p>{tooltip}</p>
				</Dialog>
			</Popover>
		</DialogTrigger>
	) : (
		<TooltipTrigger delay={0}>
			{children}
			<Tooltip className={`${menuStyles} max-w-xs`} offset={8}>
				{tooltip}
			</Tooltip>
		</TooltipTrigger>
	);
}
