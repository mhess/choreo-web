import { useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import clsx from "clsx";

import { useEstablishedPlayer } from "~/lib/platformAtoms";
import { setOnIndexChangeAtom, useEntryAtoms } from "~/lib/entries";

import { COUNT_LABEL, countWidth, NOTE_LABEL } from "./shared";
import Help from "./Help";
import Controls from "./Controls";
import Entry from "./Entry";
import { tw } from "~/lib/utils";

export default function Entries() {
	const player = useEstablishedPlayer();

	const scrollerRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const { entriesAtom, currentIndexAtom } = useEntryAtoms();
	const [, setCallback] = useAtom(setOnIndexChangeAtom);
	const [, setCurrentIndexForTime] = useAtom(currentIndexAtom);
	const [entries] = useAtom(entriesAtom);

	const [isHelpOpen, setIsHelpOpen] = useState(false);
	const toggle = () => setIsHelpOpen((prev) => !prev);

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
			<div
				role="region"
				aria-label="Entries"
				className={clsx(
					!isHelpOpen && "pb-8",
					"relative flex-1 overflow-y-auto",
				)}
				ref={scrollerRef}
			>
				{!isHelpOpen && <EntryHeader />}
				<div ref={containerRef}>
					{entries.map((entry, index) => (
						<Entry key={entry.timeMs} entry={entry} index={index} />
					))}
				</div>
				{isHelpOpen && (
					<Help scrollerRef={scrollerRef} containerRef={containerRef} />
				)}
			</div>
			<Controls help={{ isShowing: isHelpOpen, toggle }} />
		</>
	);
}

const textStyles = tw`text-sm font-bold leading-3`;
const borderStyles = tw`border-r border-solid border-gray-800 dark:border-gray-500`;

const countStyles = clsx(
	textStyles,
	borderStyles,
	countWidth,
	"pr-2 text-right",
);

const timestampStyles = clsx(
	textStyles,
	borderStyles,
	"w-[5.5rem] text-center",
);

const noteStyles = clsx(textStyles, "ml-2");

const EntryHeader = () => (
	<div role="row" className="flex py-2 pl-4 lowercase">
		<span role="columnheader" className={countStyles}>
			{COUNT_LABEL}
		</span>
		<span role="columnheader" className={timestampStyles}>
			Timestamp
		</span>
		<span role="columnheader" className={noteStyles}>
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
