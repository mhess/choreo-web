import clsx from "clsx";
import {
	Tooltip as AriaTooltip,
	OverlayArrow,
	TooltipTrigger,
	TooltipTriggerComponentProps,
} from "react-aria-components";

import { tw } from "~/lib/utils";
import { menuStyles } from "~/styles";

export const tooltipStyles = clsx(menuStyles, tw`text-sm`);
export const tooltipOffset = 10;

interface Props extends TooltipTriggerComponentProps {
	tooltip: React.ReactNode;
	className?: string;
	offset?: number;
}

export default function Tooltip(props: Props) {
	const { tooltip, children, className, offset, ...triggerProps } = props;
	const styles = className ? className : tw`${tooltipStyles} max-w-xs`;

	return (
		<TooltipTrigger delay={0} closeDelay={250} {...triggerProps}>
			{children}
			<AriaTooltip className={styles} offset={offset ?? tooltipOffset}>
				{withArrow(tooltip)}
			</AriaTooltip>
		</TooltipTrigger>
	);
}

const arrowStyles = tw`fill-slate-100 stroke-slate-400 dark:fill-slate-700 dark:stroke-slate-500`;

export const withArrow = (content: React.ReactNode) =>
	function renderArrow({ placement }: { placement: string }) {
		return (
			<>
				<OverlayArrow className={arrowStyles}>
					<svg
						className={clsx(placement === "bottom" && "rotate-180")}
						width={12}
						height={12}
						viewBox="0 0 12 12"
					>
						<path d="M0 0 L6 6 L12 0" />
					</svg>
				</OverlayArrow>
				{content}
			</>
		);
	};
