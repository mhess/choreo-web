import { IconMoon, IconSun } from "@tabler/icons-react";
import { useAtom } from "jotai";
import { Fragment, type ReactElement, createElement, useRef } from "react";
import { Menu, Popover, Separator } from "react-aria-components";

import MenuItem from "~/components/MenuItem";
import { entryAtomsForPlatformAtom } from "~/lib/entries";
import { platformAtom, playerAtom, trackNameAtom } from "~/lib/platformAtoms";
import { useColorScheme, useIsMobile } from "~/lib/utils";
import { audioFileAtom } from "~/platforms/audioFile";
import { spotifyAuthAtom } from "~/platforms/spotify";
import { resetVideoAtom } from "~/platforms/youtube";
import { menuStyles } from "~/styles";

import PlatformItems from "./PlatformItems";

export default function MenuDropdown() {
	const [{ clearAtom, saveToCSVAtom, loadFromCSVAtom }] = useAtom(
		entryAtomsForPlatformAtom,
	);
	const [, clear] = useAtom(clearAtom);
	const [, saveToCSV] = useAtom(saveToCSVAtom);
	const [, loadFromCSV] = useAtom(loadFromCSVAtom);

	const [, resetYtVideo] = useAtom(resetVideoAtom);
	const [isSpotifyLoggedIn, logoutSpotify] = useAtom(spotifyAuthAtom);
	const [, setAudioFile] = useAtom(audioFileAtom);

	const [trackName] = useAtom(trackNameAtom);
	const [platform] = useAtom(platformAtom);
	const [player] = useAtom(playerAtom);
	const { isDark, toggle: toggleColorScheme } = useColorScheme();
	const isMobile = useIsMobile();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleSaveCSV = () => {
		const formattedTrackName = (trackName as string)
			.toLocaleLowerCase()
			.replaceAll(" ", "_");
		saveToCSV(formattedTrackName);
	};

	const handleClickLoad = () => fileInputRef.current?.click();

	const handleLoadCSV = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
		const file = target?.files?.[0];
		if (!file) return alert("No file was selected :(");
		if (file.type !== "text/csv")
			return alert(`File must be of type "text/csv"`);
		loadFromCSV(file);
	};

	const entriesGroup = player && (
		<Fragment key="entries">
			<MenuItem onAction={handleClickLoad}>Load entries from CSV</MenuItem>
			<MenuItem onAction={handleSaveCSV}>Save entries to CSV</MenuItem>
			<MenuItem onAction={clear}>Clear entries</MenuItem>
		</Fragment>
	);

	const platformGroup = isMobile && <PlatformItems key="platform" />;

	const youTubeGroup = player && platform === "youtube" && (
		<MenuItem key="change-yt" onAction={resetYtVideo}>
			Change YouTube Video
		</MenuItem>
	);

	const spotifyLogoutGroup = isSpotifyLoggedIn && platform === "spotify" && (
		<MenuItem key="log-out" onAction={logoutSpotify}>
			Log out of Spotify
		</MenuItem>
	);

	const audioFileGroup = player && platform === "audioFile" && (
		<MenuItem key="change-file" onAction={() => setAudioFile()}>
			Change Audio File
		</MenuItem>
	);

	const lightDarkGroup = isMobile && (
		<MenuItem key="color-scheme" onAction={toggleColorScheme}>
			<div className="flex gap-1">
				{createElement(isDark ? IconMoon : IconSun, { size: "1.25rem" })}
				Toggle light/dark
			</div>
		</MenuItem>
	);

	const groupsToRender = [
		entriesGroup,
		platformGroup,
		spotifyLogoutGroup,
		youTubeGroup,
		audioFileGroup,
		lightDarkGroup,
	].filter(Boolean) as ReactElement[];

	const groupsWithDividers = groupsToRender.reduce(
		(output, el, index, groups) => {
			output.push(el);
			if (index < groups.length - 1)
				// biome-ignore lint/suspicious/noArrayIndexKey: an element with the same key will be the same element
				output.push(
					<Separator
						key={`div-${index}`}
						className="my-2 border-t border-slate-300 dark:border-slate-400"
					/>,
				);
			return output;
		},
		[] as ReactElement[],
	);

	return (
		<>
			{/* This input must still be rendered even after the menu dropdown closes
			  in order for the onChange callback to get invoked */}
			<label htmlFor="csv-upload" className="hidden">
				Upload CSV
				<input
					id="csv-upload"
					ref={fileInputRef}
					type="file"
					onChange={handleLoadCSV}
				/>
			</label>
			<Popover>
				<Menu className={menuStyles}>{groupsWithDividers}</Menu>
			</Popover>
		</>
	);
}
