import {
	Dialog,
	DialogTrigger,
	Popover,
	Tooltip,
	TooltipTrigger,
} from "react-aria-components";

import { useIsMobile } from "~/lib/utils";
import { menuStyles } from "~/styles";

interface Props extends React.PropsWithChildren {
	tooltip: React.ReactNode;
}

export default function TooltipWithClick(props: Props) {
	const { tooltip, children } = props;
	const isMobile = useIsMobile();

	return isMobile ? (
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
