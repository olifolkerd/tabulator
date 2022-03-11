module.exports = {
	"env": {
		"browser": true,
		"es2021": true
	},
	"extends": "eslint:recommended",
	"parserOptions": {
		"ecmaVersion": "latest",
		"sourceType": "module"
	},
	"rules": {
		"indent": ["error", "tab"],
		"no-unused-vars": ["error", { "vars": "all", "args": "none", "ignoreRestSiblings": false }]
	}
}
