import { type PropsWithChildren, useState } from "react";
import { Button } from "react-aria-components";
import clsx from "clsx";

import { actionBtnStyles } from "~/styles";
import CenteredLoading from "~/components/CenteredLoading";

import {
	extractVideoIdFromUrl,
	useYouTubePlayer,
	YouTubePlayerStatus,
} from "./internals";

export default function YouTubeEditor({ children }: PropsWithChildren) {
	const { status, setStatus, setVideoId } = useYouTubePlayer();

	const handleRetry = () => {
		setVideoId(null);
		setStatus(YouTubePlayerStatus.LOADED);
	};

	switch (status) {
		case YouTubePlayerStatus.LOADING:
			return <CenteredLoading message="Loading YouTube player" />;
		case YouTubePlayerStatus.BAD_ID:
			return (
				<div className="mt-8 text-center">
					<p>Cannot use that video ID.</p>
					<Button
						className="text-violet-400 underline dark:text-violet-800"
						onPress={handleRetry}
					>
						Try a different one?
					</Button>
				</div>
			);
		case YouTubePlayerStatus.LOADED:
			return <UrlForm setVideoId={setVideoId} />;
		case YouTubePlayerStatus.BUFFERING:
			return <CenteredLoading message="Waiting for video to load" />;
		case YouTubePlayerStatus.READY:
			return children;
		default:
			return <p className="mt-8 text-center">Oops! Something went wrong!</p>;
	}
}

const UrlForm = ({ setVideoId }: { setVideoId: (id: string) => void }) => {
	const [input, setInput] = useState("");
	const [error, setError] = useState(false);

	const handleLoadUrl = () => {
		const videoId = extractVideoIdFromUrl(input);
		if (!videoId) setError(true);
		else setVideoId(videoId);
	};

	const handleLoadId = () => {
		setVideoId(input);
	};

	return (
		<div className="flex w-full justify-center overflow-hidden">
			<div className="mx-4 mb-4 mt-8 flex max-w-sm flex-1 flex-col items-center gap-4">
				<p>Please enter or paste in a YouTube video URL or ID</p>
				<div className="flex w-full flex-col gap-2">
					<input
						value={input}
						className={clsx(
							"w-full rounded border px-2 py-0.5 text-center",
							error ? "border-red-500 text-red-500" : "border-zinc-400",
						)}
						onChange={(e) => {
							setError(false);
							setInput(e.target.value);
						}}
					/>
					{
						<p
							className={clsx(
								"text-center text-xs text-red-500",
								!error && "opacity-0",
							)}
						>
							Not a valid YouTube URL or ID
						</p>
					}
				</div>
				<div className="flex items-center gap-4">
					<Button
						isDisabled={!input.length}
						className={actionBtnStyles}
						onPress={handleLoadUrl}
					>
						Load Url
					</Button>
					<Button
						isDisabled={!input.length}
						className={actionBtnStyles}
						onPress={handleLoadId}
					>
						Load video ID
					</Button>
				</div>
			</div>
		</div>
	);
};
