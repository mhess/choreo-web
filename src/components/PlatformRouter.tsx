import { useAtom } from "jotai";
import { useEffect } from "react";

import { spotifyTokenParam } from "~/../shared";
import Entries from "~/components/Entries";
import { platformAtom } from "~/lib/platformAtoms";
import { AudioFile } from "~/platforms/audioFile";
import { Spotify } from "~/platforms/spotify";
import { Youtube } from "~/platforms/youtube";

import Landing from "./Landing";

export default function PlatformRouter() {
	const [platform, setPlatform] = useAtom(platformAtom);

	const token = new URLSearchParams(window.location.search).get(
		spotifyTokenParam,
	);

	useEffect(() => {
		if (!token) return;

		setPlatform("spotify");

		const newUrl = new URL(window.location.href);
		newUrl.searchParams.delete(spotifyTokenParam);
		window.history.replaceState(null, "", newUrl);
	}, [token, setPlatform]);

	const displayPlatform = token ? "spotify" : platform;

	switch (displayPlatform) {
		case "spotify":
			return (
				<Spotify token={token}>
					<Entries />
				</Spotify>
			);
		case "youtube":
			return (
				<Youtube>
					<Entries />
				</Youtube>
			);
		case "audioFile":
			return (
				<AudioFile>
					<Entries />
				</AudioFile>
			);
		default:
			return <Landing />;
	}
}
