/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [react(), tailwindcss(), tsConfigPaths()],
	test: {
		environment: "jsdom",
		setupFiles: ["./src/test/vitest-setup.ts"],
	},
});
