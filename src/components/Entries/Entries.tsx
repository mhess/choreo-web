import { useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";

import { useEstablishedPlayer } from "~/lib/platformAtoms";
import { setOnIndexChangeAtom, useEntryAtoms } from "~/lib/entries";
import { tw } from "~/lib/utils";

import Help from "./Help";
import Controls from "./Controls";
import Entry from "./Entry";

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
				className={`relative flex-1 overflow-y-auto ${isHelpOpen ? "" : tw`pb-8`}`}
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
