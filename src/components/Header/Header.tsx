import { IconChevronDown, IconMoon, IconSun } from "@tabler/icons-react";
import clsx from "clsx";
import { useAtom } from "jotai";
import React, { useState } from "react";
import { Button, MenuTrigger } from "react-aria-components";

import Tooltip, { tooltipStyles } from "~/components/Tooltip";
import TooltipWithClick from "~/components/TooltipWithClick";
import {
	artistAtom,
	platformAtom,
	playerAtom,
	trackNameAtom,
} from "~/lib/platformAtoms";
import { useColorScheme, useIsMobile } from "~/lib/utils";
import { spotifyAuthAtom } from "~/platforms/spotify";
import { videoIdAtom } from "~/platforms/youtube";
import { ctlBarStyles, menuBtnStyles } from "~/styles";

import Hamburger from "./Hamburger";
import MenuDropdown from "./MenuDropdown";
import SelectPlatformButton from "./SelectPlatformButton";

export default function Header() {
	const [platform, setPlatform] = useAtom(platformAtom);
	const [ytVideoId] = useAtom(videoIdAtom);
	const [isLoggedIn] = useAtom(spotifyAuthAtom);
	const [player] = useAtom(playerAtom);
	const isMobile = useIsMobile();

	const isSpotify = platform === "spotify";
	const shouldShowActions =
		player ||
		(isLoggedIn && isSpotify) ||
		(platform === "youtube" && !!ytVideoId);

	return (
		<header className={`${ctlBarStyles} flex items-center border-b px-4 py-1`}>
			<div className="flex min-w-0 flex-nowrap items-center gap-4">
				<Button
					onPress={() => setPlatform("landing")}
					className="cursor-pointer p-2 text-lg font-bold text-violet-700 uppercase dark:text-violet-500 dark:brightness-200"
				>
					Choreo
				</Button>
				{player && <TrackInfo />}
			</div>
			<div
				className={clsx(
					"mr-4 flex grow flex-nowrap",
					isSpotify && player ? "justify-between" : "justify-end",
				)}
			>
				{shouldShowActions && (
					<>
						{isSpotify && <SpotifyChangeButton />}
						{!isMobile && (
							<MenuTrigger>
								<Button className={`${menuBtnStyles} px-2 py-1 text-sm`}>
									Actions
									<IconChevronDown size="1.25rem" className="translate-y-0.5" />
								</Button>
								<MenuDropdown />
							</MenuTrigger>
						)}
					</>
				)}
			</div>
			<div className="flex gap-3">
				{!isMobile && <SelectPlatformButton />}
				{!isMobile && <ToggleColorScheme />}
				{isMobile && <BurgerMenu />}
			</div>
		</header>
	);
}

const TrackInfo = () => {
	const [artist] = useAtom(artistAtom);
	const [trackName] = useAtom(trackNameAtom);

	return (
		<span className="truncate">
			{artist.length > 0 && (
				<>
					<b>{artist}</b>:{" "}
				</>
			)}
			{trackName}
		</span>
	);
};

const SpotifyChangeButton = () => {
	const [player] = useAtom(playerAtom);

	return !player ? null : (
		<TooltipWithClick
			tooltip={"Use the Spotify desktop or mobile app to change the track."}
			className={clsx(tooltipStyles, "max-w-72")}
		>
			<Button
				className={clsx(
					menuBtnStyles,
					"relative -top-1 mx-2 h-4 cursor-default px-1 text-[0.5rem] font-bold",
				)}
			>
				Change?
			</Button>
		</TooltipWithClick>
	);
};

const BurgerMenu = () => {
	const [isOpened, setIsOpened] = useState(false);

	return (
		<MenuTrigger onOpenChange={setIsOpened}>
			<Hamburger opened={isOpened} aria-label="Toggle menu" />
			<MenuDropdown />
		</MenuTrigger>
	);
};

const ToggleColorScheme = () => {
	const { isDark, toggle } = useColorScheme();

	return (
		<Tooltip tooltip="Toggle light/dark mode" delay={1000}>
			<Button
				className={`${menuBtnStyles} px-2 py-1`}
				aria-label={`Set ${isDark ? "light" : "dark"} color scheme`}
				onPress={toggle}
			>
				{React.createElement(isDark ? IconMoon : IconSun, { size: "1.25rem" })}
			</Button>
		</Tooltip>
	);
};
