import { createStore, Provider as JotaiProvider } from "jotai";
import { DevTools } from "jotai-devtools";
import "jotai-devtools/styles.css";

import { BreakpointProvider } from "~/lib/utils";
import PlatformRouter from "~/components/PlatformRouter";
import Header from "~/components/Header";

const store = createStore();

declare global {
	interface Window {
		store: typeof store;
	}
}

window.store = store;

export default function App() {
	return (
		<JotaiProvider store={store}>
			<DevTools store={store} />
			<BreakpointProvider>
				<Header />
				<PlatformRouter />
			</BreakpointProvider>
		</JotaiProvider>
	);
}
