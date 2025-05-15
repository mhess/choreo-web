import { SpotifyPlayerStatus, useSpotifyPlayer } from "./internals";

import Loading from "~/components/Loading";

export default function Spotify({
	token,
	children,
}: React.PropsWithChildren<{ token: string | null }>) {
	const status = useSpotifyPlayer(token);

	if (status === SpotifyPlayerStatus.LOGGED_OUT)
		return (
			<div className="flex w-full justify-center">
				<p>
					Please <a href="/api/login">log&nbsp;in</a> to your spotify premium
					account.
				</p>
			</div>
		);

	return status === SpotifyPlayerStatus.READY ? (
		children
	) : (
		<div className="mx-4 h-full">{messageByStatus[status]}</div>
	);
}

const TryAgain = ({ message }: { message: string }) => (
	<p>
		{message} Would you like to try to <a href="/api/login">log&nbsp;in</a> to
		Spotify again?
	</p>
);

const messageByStatus: Record<
	Exclude<SpotifyPlayerStatus, "loggedOut" | "ready">,
	React.ReactNode
> = {
	[SpotifyPlayerStatus.LOADING]: <Loading message="Connecting to Spotify" />,
	[SpotifyPlayerStatus.NOT_CONNECTED]: (
		<div className="flex flex-col items-center">
			<p>
				Please connect to the &ldquo;Choreo Player&rdquo; device in the Spotify
				player.
			</p>
			<p>
				Ensure the device with the Spotify player is on the same network as this
				one.
			</p>
			<p>
				See this{" "}
				<a
					href="https://support.spotify.com/us/article/spotify-connect/"
					rel="noreferrer"
					target="_blank"
				>
					article
				</a>{" "}
				if you&apos;re having trouble.
			</p>
		</div>
	),
	[SpotifyPlayerStatus.PLAYBACK_ERROR]: (
		<TryAgain message="There was an error with playback." />
	),
	[SpotifyPlayerStatus.INIT_ERROR]: (
		<TryAgain message="Initialization failed." />
	),
	[SpotifyPlayerStatus.ACCT_ERROR]: (
		<TryAgain message="There was a problem with your account. Spotify requires a premium account for application access." />
	),
	[SpotifyPlayerStatus.AUTH_ERROR]: (
		<TryAgain message="Could not authorize access." />
	),
};
