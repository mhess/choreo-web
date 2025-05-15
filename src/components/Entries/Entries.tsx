import { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { Box } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { useEstablishedPlayer } from "~/lib/platformAtoms";
import { setOnIndexChangeAtom, useEntryAtoms } from "~/lib/entries";

import Help from "./Help";
import Controls from "./Controls";
import Entry from "./Entry";

import classes from "./Entries.module.css";

export const COUNT_LABEL = "Count";
export const NOTE_LABEL = "Note";

export default function Entries() {
	const player = useEstablishedPlayer();

	const scrollerRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const { entriesAtom, currentIndexAtom } = useEntryAtoms();
	const [, setCallback] = useAtom(setOnIndexChangeAtom);
	const [, setCurrentIndexForTime] = useAtom(currentIndexAtom);
	const [entries] = useAtom(entriesAtom);

	const [isHelpOpen, { toggle }] = useDisclosure(false);

	useEffect(() => {
		setCallback((index) =>
			setEntriesScrollPosition(scrollerRef, containerRef, index),
		);

		player.addOnTick(setCurrentIndexForTime);

		return () => {
			player.removeOnTick(setCurrentIndexForTime);
			player.pause();
		};
	}, [player, setCallback, setCurrentIndexForTime]);

	return (
		<>
			{isHelpOpen && <EntryHeader />}
			<Box
				role="region"
				aria-label="Entries"
				className={classes.entries}
				pb={isHelpOpen ? 0 : "2rem"}
				ref={scrollerRef}
			>
				{!isHelpOpen && <EntryHeader />}
				<Box ref={containerRef}>
					{entries.map((entry, index) => (
						<Entry key={entry.timeMs} entry={entry} index={index} />
					))}
				</Box>
				{isHelpOpen && (
					<Help scrollerRef={scrollerRef} containerRef={containerRef} />
				)}
			</Box>
			<Controls help={{ isShowing: isHelpOpen, toggle }} />
		</>
	);
}

const headerStyles = "text-sm leading-3 font-bold";
const borderStyles =
	"border-r border-solid border-gray-800 dark:border-gray-500";

const EntryHeader = () => (
	<div role="row" className="flex py-2 pl-4 lowercase">
		<span
			role="columnheader"
			className={`${headerStyles} ${borderStyles} w-16 pr-2 text-right`}
		>
			{COUNT_LABEL}
		</span>
		<span
			role="columnheader"
			className={`${headerStyles} ${borderStyles} w-[5.5rem] text-center`}
		>
			Timestamp
		</span>
		<span role="columnheader" className={`${headerStyles} ml-2`}>
			{NOTE_LABEL}
		</span>
	</div>
);

const setEntriesScrollPosition = (
	scrollRef: ElementRef,
	containerRef: ElementRef,
	newIndex: number,
) => {
	const $scroller = scrollRef.current;
	if ($scroller) {
		const $child = containerRef.current?.childNodes[newIndex] as HTMLElement;
		if (!$child) return;

		const oldTop = $scroller.scrollTop;
		const childBottom = $child.offsetTop + $child.clientHeight;
		if (childBottom > oldTop + $scroller.clientHeight) {
			const halfClient = $scroller.clientHeight >> 1;
			const newTop = $child.offsetTop - halfClient;
			$scroller.scrollTo(0, newTop);
		}
	}
};
