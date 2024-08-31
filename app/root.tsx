import { Links, Meta, Scripts, ScrollRestoration } from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
	Center,
	ColorSchemeScript,
	MantineProvider,
	createTheme,
} from "@mantine/core";
import "@mantine/core/styles.css";

import appStylesHref from "./app.css?url";
import classes from "./theme.module.css";

import { useSpotifyAuth, AuthStatus } from "./lib/spotify";

import Editor from "./components/Editor";
import Landing from "./components/Landing";
import Loading from "./components/Loading";

const theme = createTheme({
	components: {
		Input: {
			defaultProps: { size: "xs" },
			classNames: { input: classes.input },
		},
		Button: {
			defaultProps: { size: "compact-sm", variant: "default" },
		},
	},
});

export const meta: MetaFunction = () => [
	{ charSet: "utf-8" },
	{
		name: "viewport",
		content: "width=device-width,initial-scale=1",
	},
	{ title: "Choreo" },
	{ property: "og:title", content: "Choreo" },
	{
		name: "description",
		content: "Easily compose choreographies to music on Spotify",
	},
];

export const links: LinksFunction = () => [
	{ rel: "stylesheet", href: appStylesHref },
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200",
	},
];

export const Layout = ({ children }: { children: React.ReactNode }) => (
	<html lang="en" className="h-full">
		<head>
			<Meta />
			<Links />
			<ColorSchemeScript />
		</head>
		<body className="flex flex-col h-full">
			<MantineProvider theme={theme}>{children}</MantineProvider>
			<ScrollRestoration />
			<Scripts />
		</body>
	</html>
);

export default function App() {
	const { status, token } = useSpotifyAuth();

	return status === AuthStatus.GOOD ? (
		<Editor token={token} />
	) : (
		<NotAuthenticated status={status} />
	);
}

const NotAuthenticated = ({ status }: { status: AuthStatus }) => (
	<Center className="h-full">
		{status === AuthStatus.LOADING ? (
			<Loading message="loading" />
		) : (
			<Landing />
		)}
	</Center>
);
