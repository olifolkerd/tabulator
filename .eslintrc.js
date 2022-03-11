module.exports = {
	"env": {
		"browser": true,
		"es2021": true
	},
	globals: {
		'luxon': 'readonly',
		'XLSX': 'readonly',
		'jspdf': 'readonly'
	},
	"extends": "eslint:recommended",
	"parserOptions": {
		"ecmaVersion": "latest",
		"sourceType": "module"
	},
	"rules": {
		"semi": "error",
		"indent": ["error", "tab"],
		"no-unused-vars": ["error", { "vars": "all", "args": "none", "ignoreRestSiblings": false }],
		"no-fallthrough": "off",
		"no-inner-declarations": "off",
	}
}
