import { Tooltip } from "@mantine/core";
import type { TooltipProps } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export default function TooltipWithClick(props: TooltipProps) {
	const [isOpen, { open, close, toggle }] = useDisclosure(false);

	const newProps = { ...props };

	if (newProps.opened === undefined) {
		newProps.onMouseEnter = open;
		newProps.onMouseLeave = close;
		newProps.onClick = toggle;
		newProps.opened = isOpen;
	}

	return <Tooltip {...newProps} />;
}
