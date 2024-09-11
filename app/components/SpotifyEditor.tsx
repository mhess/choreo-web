import { useAtom } from "jotai";
import { useEffect } from "react";
import { Center, Container, Text } from "@mantine/core";
import { Link } from "@remix-run/react";

import {
	PlayerStatus,
	spotifyPlayerAtom,
	useSpotifyPlayer,
} from "~/lib/spotify/player";
import { spotifyTokenAtom } from "~/lib/spotify/auth";

import Entries from "./Entries";
import Loading from "./Loading";
import { playerAtom } from "~/lib/atoms";

export default () => {
	const [token] = useAtom(spotifyTokenAtom);
	const { status, player: spotifyPlayer } = useSpotifyPlayer("fake");
	const [, setSpotifyPlayer] = useAtom(spotifyPlayerAtom);
	const [player] = useAtom(playerAtom);

	useEffect(() => {
		setSpotifyPlayer(spotifyPlayer);
	}, [spotifyPlayer, setSpotifyPlayer]);

	if (!token)
		return (
			<Center h="100%">
				<Text>
					Please <Link to="auth/login">log&nbsp;in</Link> to your spotify
					premium account.
				</Text>
			</Center>
		);

	const isPlayerReady = status === PlayerStatus.READY && player;

	return isPlayerReady ? (
		<Entries />
	) : (
		<Center mx="1rem" h="100%">
			{messageByStatus[status]}
		</Center>
	);
};

const TryAgain = ({ message }: { message: string }) => (
	<Text>
		{message} Would you like to try to <Link to="auth/login">log&nbsp;in</Link>{" "}
		again?
	</Text>
);

const messageByStatus: Record<PlayerStatus, React.ReactNode> = {
	[PlayerStatus.READY]: "shouldn't happen!",
	[PlayerStatus.LOADING]: <Loading message="Connecting to Spotify" />,
	[PlayerStatus.NOT_CONNECTED]: (
		<Container ta="center" size="xs">
			<Text>
				Please connect to the "Choreo Player" device on your Spotify player.
				Ensure that your other device is on the same network as this one.
			</Text>
			<Text mt="sm">
				See this{" "}
				<a
					href="https://support.spotify.com/us/article/spotify-connect/"
					rel="noreferrer"
					target="_blank"
				>
					article
				</a>{" "}
				if you're having trouble.
			</Text>
		</Container>
	),
	[PlayerStatus.PLAYBACK_ERROR]: (
		<TryAgain message="There was an error with playback." />
	),
	[PlayerStatus.INIT_ERROR]: <TryAgain message="Initialization Failed." />,
	[PlayerStatus.ACCT_ERROR]: (
		<TryAgain message="There was a problem with your account. Spotify requires a premium account for application access." />
	),
	[PlayerStatus.AUTH_ERROR]: <TryAgain message="Could not authorize access." />,
};
