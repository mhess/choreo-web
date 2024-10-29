import { createContext, useContext, useEffect, useState } from "react";

export const displayMs = (totalMs: number) => {
	const hundredths = Math.round(totalMs / 10);
	const hundredthsStr = hundredths.toString().slice(-2).padStart(2, "0");
	const seconds = Math.floor(hundredths / 100);
	const minutes = Math.floor(seconds / 60);
	const secondsStr = (seconds % 60).toString().padStart(2, "0");

	return `${minutes}:${secondsStr}.${hundredthsStr}`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounced = (fn: (...rest: any[]) => void, timeMs: number) => {
	let timeoutId: number | undefined = undefined;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (...args: any[]) => {
		if (timeoutId !== undefined) window.clearTimeout(timeoutId);
		timeoutId = window.setTimeout(() => fn(...args), timeMs);
	};
};

const darkClassName = "dark";

const getIsDark = () =>
	document.documentElement.classList.contains(darkClassName);

const toggleColorScheme = () => {
	const isDark = getIsDark();
	document.documentElement.classList.toggle(darkClassName);
	localStorage.theme = isDark ? "light" : darkClassName;
};

export const useColorScheme = () => {
	const isDark = getIsDark();
	return { isDark, toggle: toggleColorScheme };
};

export const IsMobileContext = createContext(false);

const media = window.matchMedia("(max-width: 36rem)");

export const BreakpointProvider = ({ children }: React.PropsWithChildren) => {
	const [isMobile, setMatches] = useState(media.matches);

	useEffect(() => {
		const listener = () => setMatches(media.matches);
		media.addEventListener("change", listener);

		return () => media.removeEventListener("change", listener);
	}, []);

	return (
		<IsMobileContext.Provider value={isMobile}>
			{children}
		</IsMobileContext.Provider>
	);
};

export const useIsMobile = () => useContext(IsMobileContext);

// Use this tagged literal function to annotate tailwind class strings
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const tw = (strings: ReadonlyArray<string>, ...values: any[]) =>
	String.raw({ raw: strings }, ...values);
