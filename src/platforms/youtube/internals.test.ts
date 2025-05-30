import { describe, expect, it } from "vitest";

import { extractVideoId } from "./internals";

describe("extractVideoId", () => {
	it("Returns content if it doesn't look like a URL", () => {
		expect(extractVideoId("foobaz")).toEqual("foobaz");
	});

	it("Returns null with incorrect host", () => {
		expect(extractVideoId("http://foo.com")).toBe(null);
	});

	it("Returns null with incorrect path", () => {
		expect(extractVideoId("http://www.youtube.com/listen?v=videoId")).toBe(
			null,
		);
	});

	it("Returns null if there's no v param", () => {
		expect(extractVideoId("http://www.youtube.com/watch?b=videoId")).toBe(null);
	});

	it("Returns the video ID if it's properly formatted URL", () => {
		expect(extractVideoId("http://www.youtube.com/watch?v=videoId")).toEqual(
			"videoId",
		);
	});
});
