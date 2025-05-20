/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite';
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [react(), tailwindcss(), tsConfigPaths()],
	test: {
		environment: "jsdom",
		setupFiles: ["./src/test/vitest-setup.ts"],
	},
});
