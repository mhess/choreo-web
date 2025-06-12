import clsx from "clsx";
import { useAtom } from "jotai";
import { Button } from "react-aria-components";

import { platformAtom } from "~/lib/platformAtoms";
import { tw, useIsMobile } from "~/lib/utils";
import { ctlBarBgStyles } from "~/styles";

import { AudioFile, Spotify, YouTube } from "./Logos";

const btnStyles = tw`${ctlBarBgStyles} flex items-center rounded border border-zinc-400 px-4 py-1 hover:brightness-95 dark:border-zinc-600 dark:hover:brightness-110`;

export default function Landing() {
	const isMobile = useIsMobile();
	const [, selectPlatform] = useAtom(platformAtom);

	return (
		<div
			className={clsx(
				"flex w-full justify-center overflow-y-auto",
				isMobile && "items-start pt-4",
			)}
		>
			<div className="m-4 mt-8 flex w-full max-w-2xl flex-col gap-8">
				<h3 className="text-center text-4xl font-bold">
					Welcome to the Choreo&nbsp;App!
				</h3>
				<p className="text-center">
					Choreo is a web app that helps you compose choreography to music.
				</p>
				<div className="flex flex-col gap-6 text-center">
					<p>
						You can use audio from <b>Youtube,</b> a <b>Spotify</b> premium
						account, or a <b>local file</b> to set up a web player that allows
						you to annotate time points in a track while it&apos;s playing.
					</p>
					<p>Use these annotations to navigate around the song easily.</p>
					<p>Save these annotations to CSV files for later.</p>
					<p>Give it a try!</p>
				</div>
				<div className="flex flex-wrap justify-center gap-4">
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
