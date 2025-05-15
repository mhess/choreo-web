import { useAtom } from "jotai";
import { Menu, MenuTrigger, Popover, Button } from "react-aria-components";

import { platformAtom } from "~/lib/platformAtoms";
import { menuButtonStyles, menuStyles } from "~/styles";

import PlatformItems, {
	logoByPlatform,
	labelByPlatform,
} from "./PlatformItems";

export default function SelectPlatformButton() {
	const [platform] = useAtom(platformAtom);

	return (
		<MenuTrigger>
			<Button className={`${menuButtonStyles} gap-2 px-2 py-1 text-sm`}>
				{logoByPlatform[platform]}
				{labelByPlatform[platform]}
			</Button>
			<Popover>
				<Menu className={menuStyles}>
					<PlatformItems />
				</Menu>
			</Popover>
		</MenuTrigger>
	);
}
