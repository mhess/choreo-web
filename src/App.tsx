import { Provider as JotaiProvider, createStore } from "jotai";
import { DevTools } from "jotai-devtools";
import "jotai-devtools/styles.css";

import Header from "~/components/Header";
import PlatformRouter from "~/components/PlatformRouter";
import { BreakpointProvider } from "~/lib/utils";

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
			<DevTools store={store} position="bottom-right" />
			<BreakpointProvider>
				<Header />
				<PlatformRouter />
			</BreakpointProvider>
		</JotaiProvider>
	);
}
