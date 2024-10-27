import { forwardRef } from "react";
import clsx from "clsx";
import { ButtonProps, Button } from "react-aria-components";

import { tw } from "~/lib/utils";

const lineStyles = tw`h-[2px] w-full rounded-full bg-zinc-800 transition duration-[0.25s] dark:bg-zinc-50`;

interface HamburgerProps extends ButtonProps {
	opened: boolean;
}

export default forwardRef(function Hamburger(
	props: HamburgerProps,
	ref: React.ForwardedRef<HTMLButtonElement>,
) {
	const { opened, ...buttonProps } = props;

	return (
		<Button
			ref={ref}
			{...buttonProps}
			className="grid w-6 justify-items-center gap-1 px-1 py-2"
		>
			<span
				className={clsx(lineStyles, opened ? "rotate-45" : "translate-y-1.5")}
			/>
			<span className={clsx(lineStyles, opened && "scale-x-0 transition")} />
			<span
				className={clsx(lineStyles, opened ? "-rotate-45" : "-translate-y-1.5")}
			/>
		</Button>
	);
});
