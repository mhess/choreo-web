export default {
	plugins: [
		// Order seems to be important for these plugins to play nicely :\
		"@trivago/prettier-plugin-sort-imports",
		"prettier-plugin-tailwindcss",
	],
	importOrder: ["<THIRD_PARTY_MODULES>", "^~/", "^[.]{1,2}/"],
	importOrderSeparation: true,
	importOrderSortSpecifiers: true,
	tailwindFunctions: ["tw", "clsx"],
	useTabs: true,
};
