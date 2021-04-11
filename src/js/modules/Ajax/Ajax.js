import Module from '../../core/Module.js';

import defaultConfig from './defaults/config.js';
import defaultURLGenerator from './defaults/urlGenerator.js';
import defaultLoaderPromise from './defaults/loaderPromise.js';
import defaultContentTypeFormatters from './defaults/contentTypeFormatters.js';

class Ajax extends Module{

	constructor(table){
		super(table);

		this.config = false; //hold config object for ajax request
		this.url = ""; //request URL
		this.urlGenerator = false;
		this.params = false; //request parameters

		this.loaderPromise = false;

		this.progressiveLoad = false;
		this.loading = false;

		this.registerTableOption("ajaxURL", false); //url for ajax loading
		this.registerTableOption("ajaxURLGenerator", false);
		this.registerTableOption("ajaxParams", {});  //params for ajax loading
		this.registerTableOption("ajaxConfig", "get"); //ajax request type
		this.registerTableOption("ajaxContentType", "form"); //ajax request type
		this.registerTableOption("ajaxRequestFunc", false); //promise function
		this.registerTableOption("ajaxProgressiveLoad", false); //progressive loading
		this.registerTableOption("ajaxProgressiveLoadDelay", 0); //delay between requests
		this.registerTableOption("ajaxProgressiveLoadScrollMargin", 0); //margin before scroll begins
		this.registerTableOption("ajaxRequesting", function(){});
		this.registerTableOption("ajaxResponse", false);

	}

	//initialize setup options
	initialize(){
		this.loaderPromise = this.table.options.ajaxRequestFunc || Ajax.defaultLoaderPromise;

		this.urlGenerator = this.table.options.ajaxURLGenerator || Ajax.defaultURLGenerator;

		if(this.table.options.ajaxParams){
			this.setParams(this.table.options.ajaxParams);
		}

		if(this.table.options.ajaxConfig){
			this.setConfig(this.table.options.ajaxConfig);
		}

		if(this.table.options.ajaxURL){
			this.setUrl(this.table.options.ajaxURL);
		}

		if(this.table.options.ajaxProgressiveLoad){
			if(this.table.options.pagination){
				this.progressiveLoad = false;
				console.error("Progressive Load Error - Pagination and progressive load cannot be used at the same time");
			}else{
				if(this.table.modExists("page")){
					this.progressiveLoad = this.table.options.ajaxProgressiveLoad;
					this.table.modules.page.initializeProgressive(this.progressiveLoad);
				}else{
					console.error("Pagination plugin is required for progressive ajax loading");
				}
			}

			if(this.table.options.ajaxProgressiveLoad === "scroll"){
				this.subscribe("scroll-vertical", this.cellValueChanged.bind(this));
			}
		}

		this.registerTableFunction("getAjaxUrl", this.getUrl.bind(this));

		this.subscribe("data-loading", this.requestDataCheck.bind(this));
		this.subscribe("data-load", this.requestData.bind(this));
	}


	requestDataCheck(data, params, config){
		return !!((!data && this.url) || typeof data === "string");
	}

	requestData(data, params, config, previousData){
		if(this.requestDataCheck(data)){
			if(data){
				this.setUrl(data);
			}

			if(params){
				this.setParams(params, true);
			}

			return this.sendRequest();
		}else{
			return previousData;
		}
	}

	scrollVertical(top, dir){
		var el = this.table.rowManager.element;

		this.nextPage(el.scrollHeight - el.clientHeight - top);
	}

	//set ajax params
	setParams(params, update){
		if(update){
			this.params = this.params || {};

			for(let key in params){
				this.params[key] = params[key];
			}
		}else{
			this.params = params;
		}
	}

	getParams(){
		return this.params || {};
	}

	//load config object
	setConfig(config){
		this._loadDefaultConfig();

		if(typeof config == "string"){
			this.config.method = config;
		}else{
			for(let key in config){
				this.config[key] = config[key];
			}
		}
	}

	//create config object from default
	_loadDefaultConfig(force){
		if(!this.config || force){

			this.config = {};

			//load base config from defaults
			for(let key in Ajax.defaultConfig){
				this.config[key] = Ajax.defaultConfig[key];
			}
		}
	}

	//set request url
	setUrl(url){
		this.url = url;
	}

	//get request url
	getUrl(){
		return this.url;
	}

	//lstandard loading function
	loadData(inPosition, columnsChanged){
		if(this.progressiveLoad){
			return this._loadDataProgressive();
		}else{
			return this._loadDataStandard(inPosition, columnsChanged);
		}
	}

	nextPage(diff){
		var margin;

		if(!this.loading){

			margin = this.table.options.ajaxProgressiveLoadScrollMargin || (this.table.rowManager.getElement().clientHeight * 2);

			if(diff < margin){
				this.table.modules.page.nextPage()
				.then(()=>{}).catch(()=>{});
			}
		}
	}

	_loadDataProgressive(){
		this.table.rowManager.setData([]);
		return this.table.modules.page.setPage(1);
	}

	_loadDataStandard(inPosition, columnsChanged){
		return new Promise((resolve, reject)=>{
			this.sendRequest(inPosition)
			.then((data)=>{
				this.table.rowManager.setData(data, inPosition, columnsChanged)
				.then(()=>{
					resolve();
				})
				.catch((e)=>{
					reject(e)
				});
			})
			.catch((e)=>{
				reject(e)
			});
		});
	}

	generateParamsList(data, prefix){
		var output = [];

		prefix = prefix || "";

		if(Array.isArray(data)){
			data.forEach((item, i) => {
				output = output.concat(this.generateParamsList(item, prefix ? prefix + "[" + i + "]" : i));
			});
		}else if (typeof data === "object"){
			for (var key in data){
				output = output.concat(this.generateParamsList(data[key], prefix ? prefix + "[" + key + "]" : key));
			}
		}else{
			output.push({key:prefix, value:data});
		}

		return output;
	}

	serializeParams(params){
		var output = this.generateParamsList(params),
		encoded = [];

		output.forEach(function(item){
			encoded.push(encodeURIComponent(item.key) + "=" + encodeURIComponent(item.value));
		});

		return encoded.join("&");
	}

	//send ajax request
	sendRequest(silent){
		var url = this.url,
		esc, query;

		this._loadDefaultConfig();

		return new Promise((resolve, reject)=>{
			if(this.table.options.ajaxRequesting.call(this.table, this.url, this.params) !== false){

				this.loading = true;

				this.loaderPromise(url, this.config, this.params).then((data)=>{
					if(this.table.options.ajaxResponse){
						data = this.table.options.ajaxResponse.call(this.table, this.url, this.params, data);
					}
					resolve(data);

					this.loading = false;
				})
				.catch((error)=>{
					this.loading = false;

					reject(error);
				});
			}else{
				reject();
			}
		});
	}
}

Ajax.moduleName = "ajax";

//load defaults
Ajax.defaultConfig = defaultConfig;
Ajax.defaultURLGenerator = defaultURLGenerator;
Ajax.defaultLoaderPromise = defaultLoaderPromise;
Ajax.contentTypeFormatters = defaultContentTypeFormatters;

export default Ajax;