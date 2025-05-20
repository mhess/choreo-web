import {
	type ChangeEvent,
	type MutableRefObject,
	type PropsWithChildren,
	useRef,
} from "react";
import { Button } from "react-aria-components";

import Loading from "~/components/Loading";
import { actionBtnStyles } from "~/styles";

import { FilePlayerStatus, useAudioFilePlayer } from "./internals";

export default function AudioFileEditor({ children }: PropsWithChildren) {
	const { status, setFile } = useAudioFilePlayer();
	const fileInputRef = useRef<HTMLInputElement>();

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target?.files?.[0];
		if (file) setFile(file);
	};

	switch (status) {
		case FilePlayerStatus.READY:
			return children;
		case FilePlayerStatus.LOADING:
			return <Loading message="Waiting for data" />;
		case FilePlayerStatus.NO_FILE:
			return (
				<div className="mt-8 flex justify-center">
					<div className="flex flex-col">
						<Button
							className={actionBtnStyles}
							onPress={() => fileInputRef.current?.click()}
						>
							Select an audio file
						</Button>
						<input
							className="hidden"
							ref={fileInputRef as MutableRefObject<HTMLInputElement>}
							type="file"
							onChange={handleFileChange}
						/>
					</div>
				</div>
			);
	}
}
