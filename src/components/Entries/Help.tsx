import { useEffect, useState } from "react";
import { IconCornerLeftUp, IconPlaylistAdd } from "@tabler/icons-react";

import { tw, useIsMobile } from "~/lib/utils";

const desktopControlsHelp = (
	<>
		From left to right, the control bar below has the <b>current track time</b>,{" "}
		<b>playback buttons</b>, and the <b>Add Entry</b> button.
	</>
);

const mobileControlsHelp = (
	<>
		From left-to-right and top-to-bottom, the control bar below has the{" "}
		<b>current track time</b>, <b>Add Entry</b>, and <b>playback</b> buttons.
	</>
);

const helpSectionStyles = tw`max-w-7xl justify-center bg-amber-300 px-4 py-2 text-sm dark:bg-orange-400`;
const termStyles = tw`font-bold italic`;
const defStyles = tw`ml-4`;

interface HelpProps {
	scrollerRef: ElementRef;
	containerRef: ElementRef;
}

export default function Help(props: HelpProps) {
	const { scrollerRef, containerRef } = props;
	const isMobile = useIsMobile();
	const [entryHeight, setEntryHeight] = useState(0);

	useEffect(() => {
		const $scroller = scrollerRef.current;
		const { lastChild } = containerRef.current;
		$scroller.scrollTo(0, lastChild.offsetTop);
		setEntryHeight(lastChild?.clientHeight || 0);
	}, [scrollerRef.current, containerRef.current]);

	return (
		<div
			className="flex flex-col items-center justify-between gap-4 overflow-y-auto px-4"
			style={{ height: `calc(100% - ${entryHeight}px)` }}
		>
			<div
				className={`${helpSectionStyles} shrink flex-col gap-2 rounded-b-lg pb-4`}
			>
				<p>
					<IconCornerLeftUp width="1.25rem" className="inline align-sub" /> The
					row above is an <b>entry</b>, which has a <b>count</b>,{" "}
					<b>timestamp</b>, and <b>note</b>.
				</p>
				<dl className="mt-2 flex flex-col gap-2">
					<div>
						<dt className={termStyles}>Entry</dt>
						<dd className={defStyles}>
							An annotation assigned to specific time point in the playing
							track.
						</dd>
					</div>
					<div>
						<dt className={termStyles}>Count</dt>
						<dd className={defStyles}>
							The number of user-specified measures/meters that have ellapsed at
							the timestamp for the entry. If you fill in the count values for
							the last two entries, all subsequently added entries will have
							their count values automatically generated based on the durations
							of the previous counts.
						</dd>
					</div>
					<div>
						<dt className={termStyles}>Timestamp</dt>
						<dd className={defStyles}>
							The time which the entry is annotating. Clicking on an
							entry&apos;s timestamp will seek to that point in the track.
						</dd>
					</div>
					<div>
						<dt className={termStyles}>Note</dt>
						<dd className={defStyles}>
							Whatever text you want to annotate that timestamp in a tack. For
							example, a dance pattern that should occur at that time.
						</dd>
					</div>
				</dl>
			</div>
			<div className={`${helpSectionStyles} items-end rounded-t-lg pt-4`}>
				<div>
					<p className="mb-4">
						{isMobile ? mobileControlsHelp : desktopControlsHelp}
					</p>
					<p>
						The <b>Add Entry</b>{" "}
						<IconPlaylistAdd width="1.25rem" className="inline" /> button will
						add an entry at the current track time—even while the track is
						playing.
					</p>
				</div>
			</div>
		</div>
	);
}
