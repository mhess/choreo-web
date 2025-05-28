import {
	IconPlayerPause,
	IconPlayerPlay,
	IconPlaylistAdd,
	IconRewindBackward5,
	IconRewindForward5,
} from "@tabler/icons-react";
import clsx from "clsx";
import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { Button } from "react-aria-components";

import TooltipWithClick from "~/components/TooltipWithClick";
import { entryAtomsForPlatformAtom } from "~/lib/entries";
import { playerPausedAtom, useEstablishedPlayer } from "~/lib/platformAtoms";
import type { OnTickCallback } from "~/lib/player";
import { displayMs, tw, useIsMobile } from "~/lib/utils";
import { ctlBarStyles } from "~/styles";

import HelpButton from "./HelpButton";

const ctlBtnStyles = tw`rounded border border-zinc-600 bg-slate-50 hover:brightness-[98%] dark:bg-slate-800 dark:hover:brightness-110`;

interface Props {
	help: { isShowing: boolean; toggle: () => void };
}

export default function Controls(props: Props) {
	const { help } = props;
	const isMobile = useIsMobile();
	const [{ addAtom }] = useAtom(entryAtomsForPlatformAtom);
	const [, addEntry] = useAtom(addAtom);
	const player = useEstablishedPlayer();

	const handleAddEntry = async () => {
		const timeMs = await player.getCurrentTime();
		addEntry(timeMs);
	};

	return (
		<div
			className={clsx(
				ctlBarStyles,
				isMobile ? "flex-col gap-4 pb-3" : "justify-between",
				"flex items-center border-t px-4 py-2",
			)}
			role="toolbar"
			aria-label="Controls"
		>
			<span className={clsx("flex items-center", isMobile ? "gap-4" : "gap-8")}>
				<TrackTime />
				{!isMobile && <PlaybackButtons />}
				<Button
					className={clsx(ctlBtnStyles, isMobile ? "px-6 py-2" : "px-4 py-1")}
					onPress={handleAddEntry}
					aria-label="Add Entry"
				>
					<IconPlaylistAdd size="1.25rem" />
				</Button>
			</span>
			{isMobile && <PlaybackButtons />}
			<HelpButton help={help} />
		</div>
	);
}

const TrackTime = () => {
	const [timeMs, setTimeMs] = useState(0);
	const player = useEstablishedPlayer();

	useEffect(() => {
		const cb: OnTickCallback = (ms) => setTimeMs(ms);
		player.addOnTick(cb);
		return () => player.removeOnTick(cb);
	}, [player]);

	return (
		<TooltipWithClick tooltip="Current track time">
			<Button className="flex h-6 w-[5.5rem] cursor-default items-center justify-end rounded bg-zinc-50 px-2 font-mono text-sm dark:bg-zinc-800">
				{displayMs(timeMs)}
			</Button>
		</TooltipWithClick>
	);
};

const PlaybackButtons = () => {
	const isMobile = useIsMobile();
	const player = useEstablishedPlayer();
	const [paused] = useAtom(playerPausedAtom);

	const handleSeekDir = (deltaMs: number) => async () => {
		const time = await player.getCurrentTime();
		player.seekTo(deltaMs + time);
	};

	const btnStyles = clsx(
		ctlBtnStyles,
		isMobile ? tw`px-4 py-2` : tw`px-2 py-1`,
	);

	return (
		<span className="flex gap-2">
			<Button
				onPress={handleSeekDir(-5000)}
				aria-label="Rewind 5 sec"
				className={btnStyles}
			>
				<IconRewindBackward5 size="1.25rem" />
			</Button>
			<Button
				onPress={() => player[paused ? "play" : "pause"]()}
				aria-label={paused ? "Play" : "Pause"}
				className={btnStyles}
			>
				{React.createElement(paused ? IconPlayerPlay : IconPlayerPause, {
					size: "1rem",
				})}
			</Button>
			<Button
				onPress={handleSeekDir(5000)}
				aria-label="Fast-forward 5 sec"
				className={btnStyles}
			>
				<IconRewindForward5 size="1.25rem" />
			</Button>
		</span>
	);
};
