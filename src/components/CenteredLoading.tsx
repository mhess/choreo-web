import type { ReactNode } from "react";
import Loading from "./Loading";

export default function CenteredLoading({ message }: { message: ReactNode }) {
	return (
		<div className="flex h-full items-center justify-center">
			<Loading message={message} />
		</div>
	);
}
