import { forwardRef } from "react";
import { MenuItem as AriaMenuItem, MenuItemProps } from "react-aria-components";

import { tw } from "~/lib/utils";

const menuItemStyles = tw`mb-1 flex items-center gap-2 rounded px-3 py-1 text-sm last:mb-0 hover:backdrop-brightness-90 dark:hover:backdrop-brightness-125`;

export default forwardRef(function MenuItem(
	props: MenuItemProps,
	ref: React.ForwardedRef<HTMLButtonElement>,
) {
	const { className, ...rest } = props;
	const styles = `${className} ${menuItemStyles}`;

	return <AriaMenuItem ref={ref} className={styles} {...rest} />;
});
