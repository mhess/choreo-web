import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import tailwind from "eslint-plugin-tailwindcss";

export default [
	{ files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
	{ languageOptions: { globals: globals.browser } },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	...tailwind.configs["flat/recommended"],
	// https://github.com/jsx-eslint/eslint-plugin-react/#configuration-new-eslintconfigjs
	pluginReact.configs.flat.recommended,
	pluginReact.configs.flat["jsx-runtime"],
	{ settings: { tailwindcss: { tags: ["tw"] } } },
];
