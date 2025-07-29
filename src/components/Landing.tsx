import { useAtom } from "jotai";
import { Button } from "react-aria-components";

import { platformAtom } from "~/lib/platformAtoms";
import { tw } from "~/lib/utils";
import { ctlBarBgStyles } from "~/styles";

import { AudioFile, Spotify, YouTube } from "./Logos";

const btnStyles = tw`${ctlBarBgStyles} flex items-center rounded border border-zinc-400 px-4 py-1 hover:brightness-95 dark:border-zinc-600 dark:hover:brightness-110`;

export default function Landing() {
	const [, selectPlatform] = useAtom(platformAtom);

	return (
		<div className="w-full overflow-y-auto">
			<section className="flex flex-col gap-6 py-10 pb-16 text-center">
				<h1 className="text-4xl/relaxed font-bold">
					Welcome&nbsp;to&nbsp;the Choreo&nbsp;Web&nbsp;App
				</h1>
				<h2 className="px-4 text-xl">Compose choreography to music easily!</h2>
			</section>
			<section className="flex flex-col items-center bg-zinc-200 px-4 pt-10 pb-12 dark:bg-zinc-700">
				<h1 className="mb-4 text-center text-2xl font-bold">Features</h1>
				<ul className="flex max-w-2xl list-disc flex-col gap-4 pl-6">
					<li>
						Use audio from a <b>Spotify Premium account</b>, <b>YouTube</b>, or
						a <b>local audio file</b>.
					</li>
					<li>
						Annotate time points in a track while it&apos;s playing using the
						built-in web player.
					</li>
					<li>Seek through a track easily using annotations.</li>
					<li>Save annotations to CSV files for later or to share!</li>
				</ul>
			</section>
			<section className="p flex flex-col items-center gap-6 pt-12 pb-16">
				<h2 className="text-xl">Go ahead and give it a try!</h2>
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
			</section>
		</div>
	);
}
