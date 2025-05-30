import clsx from "clsx";
import { type PropsWithChildren, useEffect, useState } from "react";
import { Button, Input } from "react-aria-components";

import Loading from "~/components/Loading";
import { actionBtnStyles } from "~/styles";

import {
	YouTubePlayerStatus,
	extractVideoId,
	useYouTubePlayer,
} from "./internals";

export default function YouTubeLanding({ children }: PropsWithChildren) {
	const { status, cueVideo } = useYouTubePlayer();
	const formInput = useState("");

	switch (status) {
		case YouTubePlayerStatus.LOADING:
			return <Loading message="Loading YouTube player" />;
		case YouTubePlayerStatus.BAD_ID:
		case YouTubePlayerStatus.LOADED:
			return (
				<UrlForm
					inputState={formInput}
					cueVideo={cueVideo}
					wasBadId={status === YouTubePlayerStatus.BAD_ID}
				/>
			);
		case YouTubePlayerStatus.BUFFERING:
			return <Loading message="Waiting for video to load" />;
		case YouTubePlayerStatus.READY:
			return children;
		default:
			throw "Invalid YouTube Status";
	}
}

interface UrlFormProps {
	inputState: [string, (s: string) => void];
	cueVideo: (id: string) => void;
	wasBadId: boolean;
}

const UrlForm = ({ cueVideo, wasBadId, inputState }: UrlFormProps) => {
	const [input, setInput] = inputState;
	const [error, setError] = useState(false);

	useEffect(() => {
		setError(!!wasBadId);
	}, [wasBadId]);

	const handleLoadVideo = () => {
		const videoId = extractVideoId(input);
		if (videoId) cueVideo(videoId);
		else setError(true);
	};

	return (
		<div className="flex w-full justify-center overflow-hidden">
			<div className="mx-4 mt-8 mb-4 flex max-w-sm flex-1 flex-col items-center gap-4 text-center">
				<p>Please enter a YouTube video URL or ID</p>
				<div className="flex w-full flex-col gap-2">
					<Input
						value={input}
						className={clsx(
							"w-full rounded border px-2 py-0.5 text-center",
							error
								? "border-red-500 text-red-500 dark:text-red-300"
								: "border-zinc-400",
						)}
						onChange={(e) => {
							setError(false);
							setInput(e.target.value);
						}}
					/>
					{
						<p className={clsx("text-xs text-red-500", !error && "opacity-0")}>
							Not a valid YouTube URL or ID
						</p>
					}
				</div>
				<div className="flex items-center gap-4">
					<Button
						isDisabled={!input.length || error}
						className={actionBtnStyles}
						onPress={handleLoadVideo}
					>
						Load Video
					</Button>
				</div>
			</div>
		</div>
	);
};
