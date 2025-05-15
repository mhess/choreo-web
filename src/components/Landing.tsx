import { useAtom } from "jotai";
import { Button } from "react-aria-components";

import { platformAtom } from "~/lib/platformAtoms";
import { tw, useIsMobile } from "~/lib/utils";

import { AudioFile, Spotify, YouTube } from "./Logos";

const btnStyles = tw`flex items-center rounded border border-zinc-800 bg-teal-100 px-6 py-2 hover:brightness-95 dark:bg-teal-900 dark:hover:brightness-110`;

export default function Landing() {
	const isMobile = useIsMobile();
	const [, selectPlatform] = useAtom(platformAtom);

	return (
		<div
			className={`flex w-full justify-center overflow-y-auto ${isMobile ? "items-start pt-4" : ""}`}
		>
			<div className="m-4 mt-8 flex w-full max-w-3xl flex-col gap-4 text-center">
				<h3 className="text-4xl font-bold">Welcome to the Choreo App!</h3>
				<p>Choreo is an app that helps you compose choreography to music.</p>
				<p>
					The app can use audio from <b>Youtube,</b> a <b>Spotify</b> premium
					account, or a <b>local file</b> to set up a web player that allows you
					to annotate time points in a track while it&apos;s playing. You can
					use these annotations to navigate around the song easily. The app
					allows you to save these annotations to CSV files for later.
				</p>
				<div className="mt-8 flex flex-wrap justify-center gap-4">
					<Button
						className={`${btnStyles} gap-3`}
						onPress={() => selectPlatform("youtube")}
					>
						<span>Use YouTube</span>
						<YouTube />
					</Button>
					<Button
						className={`${btnStyles} gap-3`}
						onPress={() => selectPlatform("spotify")}
					>
						<span>Use Spotify Premium</span>
						<Spotify />
					</Button>
					<Button
						className={`${btnStyles} gap-2`}
						onPress={() => selectPlatform("audioFile")}
					>
						<span>Use a local audio file</span>
						<AudioFile />
					</Button>
				</div>
			</div>
		</div>
	);
}
