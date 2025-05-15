import { Header, MenuItem, Section } from "react-aria-components";
import { useAtom } from "jotai";

import { type Platform, platformAtom } from "~/lib/platformAtoms";

import { AudioFile, Spotify, YouTube } from "../Logos";
import { tw } from "~/lib/utils";

const itemStyles = tw`mb-1 flex items-center gap-2 text-sm last:mb-0`;

export default function PlatformItems() {
	const [platform, setPlatform] = useAtom(platformAtom);

	return (
		<Section>
			<Header className="mb-2 text-xs">Switch to</Header>
			{platform !== "spotify" && (
				<MenuItem
					className={itemStyles}
					onAction={() => setPlatform("spotify")}
				>
					{logoByPlatform.spotify} {labelByPlatform.spotify}
				</MenuItem>
			)}
			{platform !== "youtube" && (
				<MenuItem
					className={itemStyles}
					onAction={() => setPlatform("youtube")}
				>
					{logoByPlatform.youtube} {labelByPlatform.youtube}
				</MenuItem>
			)}
			{platform !== "audioFile" && (
				<MenuItem
					className={itemStyles}
					onAction={() => setPlatform("audioFile")}
				>
					{logoByPlatform.audioFile} {labelByPlatform.audioFile}
				</MenuItem>
			)}
		</Section>
	);
}

export const logoByPlatform: Record<Platform, React.ReactNode> = {
	spotify: <Spotify />,
	youtube: <YouTube />,
	audioFile: <AudioFile />,
	landing: undefined,
};

export const labelByPlatform: Record<Platform, string> = {
	spotify: "Spotify",
	youtube: "YouTube",
	audioFile: "Audio File",
	landing: "Select Platform",
};
