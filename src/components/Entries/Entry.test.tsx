import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { UserEvent } from "@testing-library/user-event";
import type { Atom } from "jotai";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AtomicEntry, EntryInput } from "~/lib/entries";
import type { Platform } from "~/lib/platformAtoms";
import type { PlatformPlayer } from "~/lib/player";
import { withStore } from "~/test/utils";

import Entry from "./Entry";

describe("Entry", () => {
	const platform: Platform = "spotify";
	let user: UserEvent;

	const {
		wrapper: Wrapper,
		getAtoms,
		setAtoms,
		getStore,
		setPlatform,
	} = withStore();

	const exampleEntry = {
		timeMs: 12340,
		count: 5,
		note: "Note",
		isCurrent: false,
	};

	beforeEach(() => {
		vi.clearAllMocks();

		user = userEvent.setup();

		setPlatform(platform);
	});

	const getEntryValues = () => {
		const { entriesAtom } = getAtoms(platform);
		const store = getStore();

		return store.get(entriesAtom).map((atomicEntry) => {
			const { timeMs, ...rest } = atomicEntry;
			return (Object.getOwnPropertyNames(rest) as (keyof AtomicEntry)[]).reduce(
				(values, atomName) => {
					values[atomName.slice(0, -4)] = store.get(
						atomicEntry[atomName] as Atom<boolean | number>,
					);
					return values;
				},
				{ timeMs } as Record<string, boolean | number>,
			);
		});
	};

	const wrapper = ({ children }: React.PropsWithChildren) => (
		<Wrapper>
			<div role="table">{children}</div>
		</Wrapper>
	);

	const arrange = (entryInputs: EntryInput[], index: number) => {
		const { entriesAtom } = getAtoms(platform);
		setAtoms([[entriesAtom, entryInputs]]);
		const entry = getStore().get(entriesAtom)[index];

		const result = render(<Entry entry={entry} index={index} />, { wrapper });

		return { entry, result };
	};

	it("It displays the correct count, timestamp, and note", () => {
		arrange([exampleEntry], 0);

		expect(screen.getByLabelText("Count")).toHaveValue("5");

		expect(
			screen.getByRole("button", { name: "Seek to 0:12.34" }),
		).toBeInTheDocument();

		expect(screen.getByLabelText("Note")).toHaveValue("Note");

		expect(
			screen.queryByRole("button", {
				name: "Fill in the rest of entry counts",
			}),
		).not.toBeInTheDocument();
	});

	it("Is highlighted when current", async () => {
		const highlightClass = "bg-orange-300";
		const { entry } = arrange([exampleEntry], 0);

		expect(screen.getByRole("row")).not.toHaveClass(highlightClass);

		await act(async () => setAtoms([[entry.isCurrentAtom, true]]));

		expect(screen.getByRole("row")).toHaveClass(highlightClass);
	});

	it("Correctly modifies the count", async () => {
		arrange([exampleEntry], 0);

		const countInput = screen.getByLabelText("Count");

		await user.clear(countInput);
		await user.type(countInput, "10");

		expect(countInput).toHaveValue("10");
		expect(getEntryValues()).toEqual([
			{
				count: 10,
				canFill: false,
				isCurrent: false,
				note: "Note",
				timeMs: 12340,
			},
		]);
	});

	it("Seeks player to correct time when timestamp is clicked", async () => {
		const player = { seekTo: vi.fn() } as unknown as PlatformPlayer;
		const { playerAtom } = getAtoms("spotify");
		setAtoms([[playerAtom, player]]);

		arrange([exampleEntry], 0);

		await user.click(screen.getByRole("button", { name: "Seek to 0:12.34" }));

		expect(player.seekTo).toHaveBeenCalledOnce();
		expect(player.seekTo).toHaveBeenCalledWith(12340);
	});

	it("Correctly modifies the note", async () => {
		arrange([exampleEntry], 0);

		const newValue = "New note";
		const noteInput = screen.getByLabelText("Note");
		await user.clear(noteInput);
		await user.type(noteInput, newValue);

		expect(noteInput).toHaveValue(newValue);

		expect(getEntryValues()).toEqual([
			{
				count: 5,
				canFill: false,
				isCurrent: false,
				note: "New note",
				timeMs: 12340,
			},
		]);
	});

	it("Does not allow deleting entry at time 0", async () => {
		arrange([{ timeMs: 0 }, { timeMs: 1000 }], 0);

		expect(screen.getByRole("button", { name: "Delete Entry" })).toBeDisabled();
	});

	it("Updates entries when the delete button is clicked", async () => {
		arrange(
			[{ timeMs: 0 }, exampleEntry, { timeMs: 23450 }, { timeMs: 30000 }],
			1,
		);

		expect(getEntryValues()).toEqual([
			{
				count: 0,
				canFill: false,
				isCurrent: false,
				note: "",
				timeMs: 0,
			},
			{
				count: 5,
				canFill: false,
				isCurrent: false,
				note: "Note",
				timeMs: 12340,
			},
			{
				count: 0,
				canFill: false,
				isCurrent: false,
				note: "",
				timeMs: 23450,
			},
			{
				count: 0,
				canFill: false,
				isCurrent: false,
				note: "",
				timeMs: 30000,
			},
		]);

		await user.click(screen.getByRole("button", { name: "Delete Entry" }));

		expect(getEntryValues()).toEqual([
			{
				count: 0,
				canFill: false,
				isCurrent: false,
				note: "",
				timeMs: 0,
			},
			{
				count: 0,
				canFill: false,
				isCurrent: false,
				note: "",
				timeMs: 23450,
			},
			{
				count: 0,
				canFill: false,
				isCurrent: false,
				note: "",
				timeMs: 30000,
			},
		]);
	});

	describe("Count fill behavior", () => {
		const getFillBtn = () =>
			screen.queryByRole("button", {
				name: "Fill in the rest of entry counts",
			}) as HTMLElement;

		it("Does not render count fill button for first entry", async () => {
			arrange(
				[
					{ timeMs: 0, count: 1 },
					{ timeMs: 995, count: 0 },
				],
				0,
			);

			expect(getFillBtn()).not.toBeInTheDocument();

			const countInput = screen.getByLabelText("Count");
			await user.click(countInput);

			expect(getFillBtn()).not.toBeInTheDocument();

			await user.clear(countInput);
			expect(getFillBtn()).not.toBeInTheDocument();

			await user.type(countInput, "1");
			expect(getFillBtn()).not.toBeInTheDocument();
		});

		it("Does not render count fill button for last entry", async () => {
			arrange(
				[
					{ timeMs: 0, count: 1 },
					{ timeMs: 995, count: 0 },
				],
				1,
			);

			expect(getFillBtn()).not.toBeInTheDocument();

			const countInput = screen.getByLabelText("Count");
			await user.click(countInput);

			expect(getFillBtn()).not.toBeInTheDocument();

			await user.clear(countInput);
			expect(getFillBtn()).not.toBeInTheDocument();

			await user.type(countInput, "1");
			expect(getFillBtn()).not.toBeInTheDocument();
		});

		it("Correctly renders fill count button in middle entries and can fill", async () => {
			arrange(
				[
					{ timeMs: 0, count: 1 },
					{ timeMs: 995, count: 0 },
					{ timeMs: 2005, count: 0 },
				],
				1,
			);

			expect(getFillBtn()).not.toBeInTheDocument();

			const countInput = screen.getByLabelText("Count");
			expect(countInput).toHaveValue("0");

			await user.click(countInput);

			// No fill button when input has not been modified
			expect(getFillBtn()).not.toBeInTheDocument();

			await user.clear(countInput);

			// No fill button when input is empty
			expect(getFillBtn()).not.toBeInTheDocument();

			await user.type(countInput, "2");

			// Fill button appears when counts don't align
			expect(getFillBtn()).toBeInTheDocument();

			await user.click(getFillBtn());

			expect(
				screen.getByRole("dialog", { name: "Fill in the rest?" }),
			).toHaveTextContent(
				"Do you want to use the count of this entry and the previous entry to fill in the rest of the counts?",
			);

			await user.click(screen.getByRole("button", { name: "No" }));

			expect(
				screen.queryByRole("dialog", { name: "Fill in the rest?" }),
			).not.toBeInTheDocument();

			expect(getEntryValues()).toEqual([
				{
					count: 1,
					canFill: false,
					isCurrent: false,
					note: "",
					timeMs: 0,
				},
				{
					count: 2,
					canFill: true,
					isCurrent: false,
					note: "",
					timeMs: 995,
				},
				{
					count: 0,
					canFill: false,
					isCurrent: false,
					note: "",
					timeMs: 2005,
				},
			]);

			await user.click(countInput);

			await user.click(getFillBtn());

			await user.click(screen.getByRole("button", { name: "Yes" }));

			expect(
				screen.queryByRole("dialog", { name: "Fill in the rest?" }),
			).not.toBeInTheDocument();

			expect(getFillBtn()).not.toBeInTheDocument();

			expect(getEntryValues()).toEqual([
				{
					count: 1,
					canFill: false,
					isCurrent: false,
					note: "",
					timeMs: 0,
				},
				{
					count: 2,
					canFill: false,
					isCurrent: false,
					note: "",
					timeMs: 995,
				},
				{
					count: 3,
					canFill: false,
					isCurrent: false,
					note: "",
					timeMs: 2005,
				},
			]);

			await user.click(countInput);

			expect(getFillBtn()).not.toBeInTheDocument();

			await user.clear(countInput);

			expect(getFillBtn()).not.toBeInTheDocument();

			await user.type(countInput, "5");

			expect(getFillBtn()).toBeInTheDocument();

			await user.clear(countInput);
			await user.type(countInput, "2");

			expect(getFillBtn()).not.toBeInTheDocument();
		});
	});
});
