import { IconX } from "@tabler/icons-react";
import clsx from "clsx";
import { WritableAtom, useAtom } from "jotai";
import { type PropsWithChildren, useEffect, useState } from "react";
import {
	Button,
	Dialog,
	DialogTrigger,
	Heading,
	Input,
	Modal,
} from "react-aria-components";

import Loading from "~/components/Loading";
import { tw } from "~/lib/utils";
import { actionBtnStyles } from "~/styles";

import {
	YouTubePlayerStatus,
	extractVideoId,
	useYouTubePlayer,
} from "./internals";

const btnHoverStyles = tw`hover:text-violet-800 dark:hover:text-violet-400`;

export default function YouTubeLanding({ children }: PropsWithChildren) {
	const { status, cueVideo, recentsAtom } = useYouTubePlayer();
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
					recentsAtom={recentsAtom}
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
	recentsAtom: WritableAtom<[string, string][], [removeId: string], void>;
}

const UrlForm = ({
	cueVideo,
	wasBadId,
	inputState,
	recentsAtom,
}: UrlFormProps) => {
	const [input, setInput] = inputState;
	const [error, setError] = useState(false);
	const [recents, removeId] = useAtom(recentsAtom);

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
					{recents.length ? (
						<DialogTrigger>
							<Button className={actionBtnStyles}>Load Recent</Button>
							<Modal>
								<Dialog className="max-w-lg overflow-auto rounded-md bg-zinc-100 p-8 outline-none dark:bg-zinc-700">
									<div>
										<Heading slot="title" className="mb-4 text-xl">
											Load Recent
										</Heading>
										<div className="flex flex-col gap-8">
											<div>
												{recents.map(([id, name]) => (
													<div
														key={id}
														className="flex items-center justify-between gap-1 rounded px-2 py-1 odd:bg-zinc-400 dark:odd:bg-zinc-800"
													>
														<Button
															slot="close"
															className={clsx(btnHoverStyles, "truncate")}
															onPress={() => cueVideo(id)}
														>
															{name}
														</Button>
														<Button
															className={btnHoverStyles}
															onPress={() => removeId(id)}
														>
															<IconX size="1rem" />
														</Button>
													</div>
												))}
											</div>
											<div className="flex justify-end">
												<Button
													autoFocus
													className={actionBtnStyles}
													slot="close"
												>
													Cancel
												</Button>
											</div>
										</div>
									</div>
								</Dialog>
							</Modal>
						</DialogTrigger>
					) : null}
				</div>
			</div>
		</div>
	);
};
