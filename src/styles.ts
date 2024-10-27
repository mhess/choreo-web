import { tw } from "./lib/utils";

export const menuStyles = tw`rounded border border-solid border-slate-400 bg-slate-100 px-2 py-1 outline-none dark:border-slate-500 dark:bg-slate-700`;

export const menuButtonStyles = tw`flex items-center rounded border border-solid border-zinc-600 hover:backdrop-brightness-95 dark:border-zinc-200 dark:hover:backdrop-brightness-110`;

export const ctlBarStyles = tw`border-slate-800 bg-teal-100 dark:border-slate-500 dark:bg-teal-900`;

export const actionBtnStyles = tw`rounded border border-zinc-600 bg-violet-400 px-4 py-2 enabled:hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-violet-800 enabled:dark:hover:brightness-110 dark:disabled:bg-slate-500`;
