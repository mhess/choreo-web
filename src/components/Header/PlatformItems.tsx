import { useAtom } from "jotai";
import { Header, Section } from "react-aria-components";

import MenuItem from "~/components/MenuItem";
import { type Platform, platformAtom } from "~/lib/platformAtoms";
import { tw } from "~/lib/utils";

import { AudioFile, Spotify, YouTube } from "../Logos";

const logoStyles = tw`flex w-7 justify-center`;

export default function PlatformItems() {
	const [platform, setPlatform] = useAtom(platformAtom);

	return (
		<Section>
			<Header className="mb-2 text-xs">Switch to</Header>
			{platform !== "spotify" && (
				<MenuItem onAction={() => setPlatform("spotify")}>
					<span className={logoStyles}>{logoByPlatform.spotify}</span>
					{labelByPlatform.spotify}
				</MenuItem>
			)}
			{platform !== "youtube" && (
				<MenuItem onAction={() => setPlatform("youtube")}>
					<span className={logoStyles}>{logoByPlatform.youtube}</span>
					{labelByPlatform.youtube}
				</MenuItem>
			)}
			{platform !== "audioFile" && (
				<MenuItem onAction={() => setPlatform("audioFile")}>
					<span className={logoStyles}>{logoByPlatform.audioFile}</span>
					{labelByPlatform.audioFile}
				</MenuItem>
			)}
		</Section>
	);
}

export const logoByPlatform: Record<Platform, React.ReactNode> = {
	spotify: <Spotify className="h-4" />,
	youtube: <YouTube className="h-4" />,
	audioFile: <AudioFile />,
	landing: undefined,
};

export const labelByPlatform: Record<Platform, string> = {
	spotify: "Spotify",
	youtube: "YouTube",
	audioFile: "Audio File",
	landing: "Select Platform",
};
