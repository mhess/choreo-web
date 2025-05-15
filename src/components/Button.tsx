import { forwardRef } from "react";
import { Button as AriaButton, ButtonProps } from "react-aria-components";
import { tw } from "~/lib/utils";

export default forwardRef(function Button(
	props: ButtonProps,
	ref: React.ForwardedRef<HTMLButtonElement>,
) {
	const { className: originalClassName, ...rest } = props;
	const newStyles = tw`outline-none data-[focus-visible]:outline-cyan-600 dark:data-[focus-visible]:outline-orange-400 ${originalClassName}`;

	return <AriaButton ref={ref} className={newStyles} {...rest} />;
});
