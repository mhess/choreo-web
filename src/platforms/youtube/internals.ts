import { type PrimitiveAtom, atom, useAtom } from "jotai";
import { useEffect } from "react";

import { PlatformPlayer, getPlatformAtoms } from "~/lib/player";

declare global {
	interface Window {
		onYouTubeIframeAPIReady: () => void;
		ytPlayerPromise?: Promise<YouTubePlayer>;
		ytPlayer: YT.Player;
	}
}

export enum YouTubePlayerStatus {
	LOADING = "Player has not loaded yet",
	LOADED = "Player has loaded",
	BUFFERING = "Waiting for video to load",
	BAD_ID = "Cannot use URL provided",
	ERROR = "There was an error",
	READY = "Ready",
}

// https://developers.google.com/youtube/iframe_api_reference#Events
const BAD_ID_ERR_CODES = new Set([2, 100, 101, 150]);

const playerAtom = atom<YouTubePlayer>();
const statusAtom = atom(YouTubePlayerStatus.LOADING);
const pausedAtom = atom(true);
const writePausedAtom = atom(null, (_, set, paused: boolean) =>
	set(pausedAtom, paused),
);

const YT_KEY_LS_KEY = "yt-video-id";
export const resetVideoAtom = atom(null, (_, set) => {
	set(statusAtom, YouTubePlayerStatus.LOADED);
	localStorage.removeItem(YT_KEY_LS_KEY);
});

const videoDataAtom = atom((get) => {
	const player = get(playerAtom);
	const isReady = player && get(statusAtom) === YouTubePlayerStatus.READY;
	return isReady ? player.ytPlayer.getVideoData() : undefined;
});

export const atoms = getPlatformAtoms({
	playerAtom: playerAtom as PrimitiveAtom<YouTubePlayer | undefined>,
	statusAtom,
	readyStatus: YouTubePlayerStatus.READY,
	paused: (get) => get(pausedAtom),
	artist: (get) => get(videoDataAtom)?.author || "",
	trackName: (get) => get(videoDataAtom)?.title || "",
});

export const YT_PLAYER_EL_ID = "ytplayer";
const YT_SCRIPT_ID = "yt-api-script";

const getYouTubePlayer = async (
	setPaused: (paused: boolean) => void,
	setStatus: (status: YouTubePlayerStatus) => void,
): Promise<YouTubePlayer> => {
	if (!document.getElementById(YT_SCRIPT_ID)) {
		const $player = document.createElement("div");
		$player.id = YT_PLAYER_EL_ID;
		$player.style.display = "none";
		document.body.appendChild($player);

		const $script = document.createElement("script");
		$script.id = YT_SCRIPT_ID;
		$script.src = "https://www.youtube.com/iframe_api";
		document.body.appendChild($script);
	}

	return new Promise((resolve) => {
		window.onYouTubeIframeAPIReady = () => {
			const player = new YT.Player(YT_PLAYER_EL_ID, {
				height: "0",
				width: "0",
				playerVars: { playsinline: 1 },
				events: {
					onReady: () =>
						resolve(new YouTubePlayer(player, setPaused, setStatus)),
					onError: (e) => {
						if (BAD_ID_ERR_CODES.has(e.data)) {
							setStatus(YouTubePlayerStatus.BAD_ID);
						} else setStatus(YouTubePlayerStatus.ERROR);
					},
				},
			});

			window.ytPlayer = player;
		};
	});
};

class YouTubePlayer extends PlatformPlayer {
	ytPlayer: YT.Player;

	constructor(
		ytPlayer: YT.Player,
		setPaused: (paused: boolean) => void,
		setStatus: (status: YouTubePlayerStatus) => void,
	) {
		super();

		this.ytPlayer = ytPlayer;

		ytPlayer.addEventListener("onStateChange", ({ data: state }) => {
			const isPaused = state !== YT.PlayerState.PLAYING;
			setPaused(isPaused);

			if (state === YT.PlayerState.CUED) {
				localStorage.setItem(YT_KEY_LS_KEY, ytPlayer.getVideoData().video_id);
				setStatus(YouTubePlayerStatus.READY);
			}

			this._onPlaybackChange(isPaused);
		});
	}

	async play() {
		this.ytPlayer.playVideo();
	}

	async pause() {
		this.ytPlayer.pauseVideo();
	}

	async seekTo(ms: number) {
		const posMs = ms < 0 ? 0 : ms;
		// @ts-expect-error: seekTo() call with 2 args seems to break the player
		this.ytPlayer.seekTo(posMs / 1000);
		this._tick(posMs);
	}

	async getCurrentTime() {
		return this.ytPlayer.getCurrentTime() * 1000;
	}
}

type YouTubePlayerType = InstanceType<typeof YouTubePlayer>;
export type { YouTubePlayerType as YouTubePlayer };

export const extractVideoId = (input: string) => {
	let url;
	try {
		url = new URL(input);
	} catch {
		return input;
	}

	if (url.hostname === "www.youtube.com" && url.pathname === "/watch") {
		const params = new URLSearchParams(url.search);
		return params.get("v");
	}

	if (url.hostname === "youtu.be" && url.pathname.length > 1) {
		return url.pathname.slice(1);
	}

	return null;
};

export const useYouTubePlayer = () => {
	const [player, setPlayer] = useAtom(playerAtom);
	const [status, setStatus] = useAtom(statusAtom);
	const [, setPaused] = useAtom(writePausedAtom);

	useEffect(() => {
		if (!window.ytPlayerPromise)
			window.ytPlayerPromise = getYouTubePlayer(setPaused, setStatus);
		window.ytPlayerPromise.then(setPlayer);
	}, [setPlayer, setPaused, setStatus]);

	useEffect(() => {
		if (player) {
			const savedVideoId = localStorage.getItem(YT_KEY_LS_KEY);

			if (savedVideoId) {
				if (status !== YouTubePlayerStatus.READY) cueVideo(savedVideoId);
			} else setStatus(YouTubePlayerStatus.LOADED);
		} else {
			setStatus(YouTubePlayerStatus.LOADING);
		}
	}, [player]);

	const cueVideo = (videoId: string) => {
		setStatus(YouTubePlayerStatus.BUFFERING);
		player?.ytPlayer.cueVideoById(videoId);
	};

	return { status, cueVideo };
};
