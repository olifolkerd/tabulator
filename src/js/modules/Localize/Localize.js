import Module from '../../module.js';

import defaultLangs from './defaults/langs.js';

class Localize extends Module{

	//load defaults
	static langs = defaultLangs;

	constructor(table){
		super(table);

		this.locale = "default"; //current locale
		this.lang = false; //current language
		this.bindings = {}; //update events to call when locale is changed
		this.langList = {};
	}

	initialize(){
		this.langList = Tabulator.prototype.helpers.deepClone(this.langs);
	}

	//set header placehoder
	setHeaderFilterPlaceholder(placeholder){
		this.langList.default.headerFilters.default = placeholder;
	}

	//set header filter placeholder by column
	setHeaderFilterColumnPlaceholder(column, placeholder){
		this.langList.default.headerFilters.columns[column] = placeholder;

		if(this.lang && !this.lang.headerFilters.columns[column]){
			this.lang.headerFilters.columns[column] = placeholder;
		}
	}

	//setup a lang description object
	installLang(locale, lang){
		if(this.langList[locale]){
			this._setLangProp(this.langList[locale], lang);
		}else{
			this.langList[locale] = lang;
		}
	}

	_setLangProp(lang, values){
		for(let key in values){
			if(lang[key] && typeof lang[key] == "object"){
				this._setLangProp(lang[key], values[key])
			}else{
				lang[key] = values[key];
			}
		}
	}

	//set current locale
	setLocale(desiredLocale){
		var self = this;

		desiredLocale = desiredLocale || "default";

		//fill in any matching languge values
		function traverseLang(trans, path){
			for(var prop in trans){
				if(typeof trans[prop] == "object"){
					if(!path[prop]){
						path[prop] = {};
					}
					traverseLang(trans[prop], path[prop]);
				}else{
					path[prop] = trans[prop];
				}
			}
		}

		//determing correct locale to load
		if(desiredLocale === true && navigator.language){
			//get local from system
			desiredLocale = navigator.language.toLowerCase();
		}

		if(desiredLocale){

			//if locale is not set, check for matching top level locale else use default
			if(!self.langList[desiredLocale]){
				let prefix = desiredLocale.split("-")[0];

				if(self.langList[prefix]){
					console.warn("Localization Error - Exact matching locale not found, using closest match: ", desiredLocale, prefix);
					desiredLocale = prefix;
				}else{
					console.warn("Localization Error - Matching locale not found, using default: ", desiredLocale);
					desiredLocale = "default";
				}
			}
		}

		self.locale = desiredLocale;

		//load default lang template
		self.lang = Tabulator.prototype.helpers.deepClone(self.langList.default || {});

		if(desiredLocale != "default"){
			traverseLang(self.langList[desiredLocale], self.lang);
		}

		self.table.options.localized.call(self.table, self.locale, self.lang);

		self._executeBindings();
	}

	//get current locale
	getLocale(locale){
		return self.locale;
	}

	//get lang object for given local or current if none provided
	getLang(locale){
		return locale ? this.langList[locale] : this.lang;
	}

	//get text for current locale
	getText(path, value){
		var path = value ? path + "|" + value : path,
		pathArray = path.split("|"),
		text = this._getLangElement(pathArray, this.locale);

		// if(text === false){
		// 	console.warn("Localization Error - Matching localized text not found for given path: ", path);
		// }

		return text || "";
	}

	//traverse langs object and find localized copy
	_getLangElement(path, locale){
		var self = this;
		var root = self.lang;

		path.forEach(function(level){
			var rootPath;

			if(root){
				rootPath = root[level];

				if(typeof rootPath != "undefined"){
					root = rootPath;
				}else{
					root = false;
				}
			}
		});

		return root;
	}

	//set update binding
	bind(path, callback){
		if(!this.bindings[path]){
			this.bindings[path] = [];
		}

		this.bindings[path].push(callback);

		callback(this.getText(path), this.lang);
	}

	//itterate through bindings and trigger updates
	_executeBindings(){
		var self = this;

		for(let path in self.bindings){
			self.bindings[path].forEach(function(binding){
				binding(self.getText(path), self.lang);
			});
		}
	}
}

// Tabulator.prototype.registerModule("localize", Localize);
module.exports = Localize;