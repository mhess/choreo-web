import { forwardRef } from "react";
import { Button as AriaButton, ButtonProps } from "react-aria-components";

import { tw } from "~/lib/utils";
import { focusableStyles } from "~/styles";

export default forwardRef(function Button(
	props: ButtonProps,
	ref: React.ForwardedRef<HTMLButtonElement>,
) {
	const { className, ...rest } = props;
	const newStyles = tw`${className} ${focusableStyles}`;

	return <AriaButton ref={ref} className={newStyles} {...rest} />;
});
