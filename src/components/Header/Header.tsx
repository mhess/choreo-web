import { useAtom } from "jotai";
import React, { useState } from "react";
import {
	MenuTrigger,
	Tooltip,
	TooltipTrigger,
	Button,
} from "react-aria-components";
import { IconChevronDown, IconMoon, IconSun } from "@tabler/icons-react";

import {
	artistAtom,
	platformAtom,
	playerAtom,
	trackNameAtom,
} from "~/lib/platformAtoms";
import { spotifyAuthAtom } from "~/platforms/spotify";
import { videoIdAtom } from "~/platforms/youtube";
import { useIsMobile, useColorScheme } from "~/lib/utils";
import TooltipWithClick from "~/components/TooltipWithClick";

import SelectPlatformButton from "./SelectPlatformButton";
import MenuDropdown from "./MenuDropdown";
import Hamburger from "./Hamburger";

import { ctlBarStyles, menuButtonStyles, menuStyles } from "~/styles";

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
					className="p-2 text-lg font-bold uppercase text-violet-700 dark:text-violet-500 dark:brightness-200"
				>
					Choreo
				</Button>
				{player && <TrackInfo />}
			</div>
			<div
				className={`mr-4 flex grow flex-nowrap ${isSpotify && player ? "justify-between" : "justify-end"}`}
			>
				{shouldShowActions && (
					<>
						{isSpotify && <SpotifyChangeButton />}
						{!isMobile && (
							<MenuTrigger>
								<Button
									className={`${menuButtonStyles} px-2 py-1 text-sm font-bold`}
								>
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
		<TooltipWithClick tooltip="Use a Spotify desktop or mobile app to change the track.">
			<Button
				className={`${menuButtonStyles} relative -top-1 mx-2 h-4 px-1 text-[0.5rem] font-bold`}
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
		<TooltipTrigger delay={500}>
			<Button
				className={`${menuButtonStyles} px-2 py-1`}
				aria-label="Toggle light/dark mode"
				onPress={toggle}
			>
				{React.createElement(isDark ? IconMoon : IconSun, { size: "1.25rem" })}
			</Button>
			<Tooltip className={`${menuStyles} text-sm`} offset={8}>
				Toggle light/dark mode
			</Tooltip>
		</TooltipTrigger>
	);
};
