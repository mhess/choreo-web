import { useAtom } from "jotai";
import { Menu, MenuTrigger, Popover } from "react-aria-components";

import { platformAtom } from "~/lib/platformAtoms";
import Button from "~/components/Button";

import PlatformItems, {
	logoByPlatform,
	labelByPlatform,
} from "./PlatformItems";
import { menuButtonStyles, menuStyles } from "./styles";

export default function SelectPlatformButton() {
	const [platform] = useAtom(platformAtom);

	return (
		<MenuTrigger>
			<Button className={menuButtonStyles}>
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
