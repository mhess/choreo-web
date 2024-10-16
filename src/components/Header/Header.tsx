import { useAtom } from "jotai";
import React, { useState } from "react";
import {
	Group,
	Text,
	Tooltip,
	useComputedColorScheme,
	useMantineColorScheme,
} from "@mantine/core";
import { MenuTrigger } from "react-aria-components";

import { IconChevronDown, IconMoon, IconSun } from "@tabler/icons-react";

import {
	artistAtom,
	platformAtom,
	playerAtom,
	trackNameAtom,
} from "~/lib/platformAtoms";
import { spotifyAuthAtom } from "~/platforms/spotify";
import { videoIdAtom } from "~/platforms/youtube";
import { useIsMobile } from "~/lib/utils";

import TooltipWithClick from "~/components/TooltipWithClick";
import SelectPlatformButton from "./SelectPlatformButton";
import MenuDropdown from "./MenuDropdown";
import Hamburger from "./Hamburger";
import Button from "~/components/Button";

import classes from "./Header.module.css";
import { menuButtonStyles } from "./styles";

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
		<header className="flex items-center border-b border-slate-800 bg-emerald-50 px-4 py-1 dark:border-slate-500 dark:bg-teal-900">
			<div className="flex min-w-0 flex-nowrap gap-4">
				<Button
					onPress={() => setPlatform("landing")}
					className="p-2 text-lg font-bold uppercase text-violet-900 dark:text-purple-300"
				>
					Choreo
				</Button>
				{player && <TrackInfo />}
			</div>
			<Group
				className={classes.headerRightSide}
				justify={isSpotify && player ? "space-between" : "right"}
			>
				{shouldShowActions && (
					<>
						{isSpotify && <SpotifyChangeButton />}
						{!isMobile && (
							<MenuTrigger>
								<Button className={`${menuButtonStyles} font-bold`}>
									Actions
									<IconChevronDown size="1.25rem" className="translate-y-0.5" />
								</Button>
								<MenuDropdown />
							</MenuTrigger>
						)}
					</>
				)}
			</Group>
			<Group gap="xs">
				{!isMobile && <SelectPlatformButton />}
				{!isMobile && <ToggleColorScheme />}
				{isMobile && <BurgerMenu />}
			</Group>
		</header>
	);
}

const TrackInfo = () => {
	const [artist] = useAtom(artistAtom);
	const [trackName] = useAtom(trackNameAtom);

	return (
		<Text className={classes.trackInfo} span>
			{artist.length > 0 && (
				<>
					<Text fw={700} span>
						{artist}
					</Text>
					:{" "}
				</>
			)}
			{trackName}
		</Text>
	);
};

const SpotifyChangeButton = () => {
	const [player] = useAtom(playerAtom);

	return !player ? null : (
		<TooltipWithClick
			ta="center"
			w={225}
			multiline
			label="Use a Spotify desktop or mobile app to change the track."
		>
			<Button
				className={`${menuButtonStyles} relative -top-1 mx-2 h-4 px-2 text-[0.625rem]`}
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
			<Hamburger
				onHoverChange={(state) => console.log({ state })}
				opened={isOpened}
				aria-label="Toggle menu"
			/>
			<MenuDropdown />
		</MenuTrigger>
	);
};

const ToggleColorScheme = () => {
	const { toggleColorScheme } = useMantineColorScheme();
	const isLight = useComputedColorScheme() === "light";

	return (
		<Tooltip label="Toggle light/dark mode" w={173}>
			<Button
				className={menuButtonStyles}
				aria-label="Toggle light/dark mode"
				onPress={toggleColorScheme}
			>
				{React.createElement(isLight ? IconSun : IconMoon, { size: "1.25rem" })}
			</Button>
		</Tooltip>
	);
};
