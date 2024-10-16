import { useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { createContext, useContext } from "react";

export const displayMs = (totalMs: number) => {
	const ms = (totalMs % 1000).toString().slice(0, 2).padStart(2, "0");
	const totalSeconds = Math.floor(totalMs / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = (totalSeconds % 60).toString().padStart(2, "0");

	return `${minutes}:${seconds}.${ms}`;
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

export const IsMobileContext = createContext(false);

export const BreakpointProvider = ({ children }: React.PropsWithChildren) => {
	const { mobile } = useMantineTheme().breakpoints;
	const isMobile = !!useMediaQuery(`(max-width: ${mobile})`);

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
