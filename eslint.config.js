import eslint from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{ languageOptions: { globals: globals.browser } },
	eslint.configs.recommended,
	tseslint.configs.recommended,
	// https://github.com/jsx-eslint/eslint-plugin-react/#configuration-new-eslintconfigjs
	pluginReact.configs.flat.recommended,
	pluginReact.configs.flat["jsx-runtime"],
);
