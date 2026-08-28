const {
	defineConfig,
	globalIgnores,
} = require("eslint/config");

const globals = require("globals");

module.exports = defineConfig([{
	languageOptions: {
		globals: {
			...globals.browser,
			...globals.node,
			...globals.amd,
			"luxon": "readonly",
			"XLSX": "readonly",
			"jspdf": "readonly",
		},

		"ecmaVersion": "latest",
		"sourceType": "module",
		parserOptions: {},
	},

	"rules": {
		"semi": "error",

		"indent": ["error", "tab", {
			VariableDeclarator: 0,
			"SwitchCase": 1,
		}],

		"no-unused-vars": ["warn", {
			"vars": "all",
			"args": "none",
			"ignoreRestSiblings": false,
		}],

		"no-fallthrough": "off",
		"no-inner-declarations": "off",
		"no-prototype-builtins": "off",

		"no-empty": ["error", {
			"allowEmptyCatch": true,
		}],
	},
}, globalIgnores(["**/.eslintrc.js", "**/dist", "**/examples"])]);
