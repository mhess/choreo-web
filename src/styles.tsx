import clsx from "clsx";
import { tw } from "./lib/utils";
import { OverlayArrow } from "react-aria-components";

export const menuStyles = tw`rounded border border-solid border-slate-400 bg-slate-100 p-2 outline-none dark:border-slate-500 dark:bg-slate-700`;

export const ctlBarBgStyles = tw`bg-green-100 dark:bg-teal-900`;

export const ctlBarStyles = clsx(
	tw`border-zinc-400 dark:border-zinc-600`,
	ctlBarBgStyles,
);

export const menuButtonStyles = clsx(
	ctlBarBgStyles,
	tw`flex items-center rounded border border-solid border-zinc-500 hover:brightness-95 dark:border-zinc-400 dark:hover:brightness-110`,
);

export const actionBtnStyles = tw`rounded border border-zinc-500 bg-violet-600 px-4 py-2 text-zinc-50 enabled:hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-violet-800 enabled:dark:hover:brightness-110 dark:disabled:bg-slate-500`;

export const tooltipStyles = clsx(menuStyles, tw`text-sm`);

const arrowStyles = tw`fill-slate-100 stroke-slate-400 dark:fill-slate-700 dark:stroke-slate-500`;

export const withArrow = (content: React.ReactNode) =>
	function WithArrow({ placement }: { placement: string }) {
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
