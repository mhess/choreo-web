import { type PropsWithChildren } from "react";

import Loading from "~/components/Loading";

import { SpotifyPlayerStatus, useSpotifyPlayer } from "./internals";

interface SpotifyProps extends PropsWithChildren {
	token: string | null;
}

export default function Spotify({ token, children }: SpotifyProps) {
	const status = useSpotifyPlayer(token);

	if (status === SpotifyPlayerStatus.READY) return children;

	return (
		<div className="mx-4 flex h-full flex-col items-center justify-center">
			{messageByStatus[status]}
		</div>
	);
}

const TryAgain = ({ message }: { message: string }) => (
	<p>
		{message} Would you like to try to <a href="/api/login">log&nbsp;in</a> to
		Spotify again?
	</p>
);

const NotConnected = () => (
	<div className="flex flex-col gap-4 text-center">
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
);

const messageByStatus: Record<
	Exclude<SpotifyPlayerStatus, "ready">,
	React.ReactNode
> = {
	[SpotifyPlayerStatus.LOADING]: <Loading message="Connecting to Spotify" />,
	[SpotifyPlayerStatus.LOGGED_OUT]: (
		<p className="text-center">
			Please <a href="/api/login">log&nbsp;in</a> to your Spotify premium
			account.
		</p>
	),
	[SpotifyPlayerStatus.NOT_CONNECTED]: <NotConnected />,
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
