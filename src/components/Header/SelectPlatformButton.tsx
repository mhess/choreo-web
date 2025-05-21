import { useAtom } from "jotai";
import { Button, Menu, MenuTrigger, Popover } from "react-aria-components";

import { platformAtom } from "~/lib/platformAtoms";
import { menuBtnStyles, menuStyles } from "~/styles";

import PlatformItems, {
	labelByPlatform,
	logoByPlatform,
} from "./PlatformItems";

export default function SelectPlatformButton() {
	const [platform] = useAtom(platformAtom);

	return (
		<MenuTrigger>
			<Button className={`${menuBtnStyles} gap-2 px-2 py-1 text-sm`}>
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
