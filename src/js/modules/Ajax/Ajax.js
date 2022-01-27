import Module from '../../core/Module.js';

import defaultConfig from './defaults/config.js';
import defaultURLGenerator from './defaults/urlGenerator.js';
import defaultLoaderPromise from './defaults/loaderPromise.js';
import defaultContentTypeFormatters from './defaults/contentTypeFormatters.js';

class Ajax extends Module{
	
	constructor(table){
		super(table);
		
		this.config = {}; //hold config object for ajax request
		this.url = ""; //request URL
		this.urlGenerator = false;
		this.params = false; //request parameters
		
		this.loaderPromise = false;
		
		this.registerTableOption("ajaxURL", false); //url for ajax loading
		this.registerTableOption("ajaxURLGenerator", false);
		this.registerTableOption("ajaxParams", {});  //params for ajax loading
		this.registerTableOption("ajaxConfig", "get"); //ajax request type
		this.registerTableOption("ajaxContentType", "form"); //ajax request type
		this.registerTableOption("ajaxRequestFunc", false); //promise function
		
		this.registerTableOption("ajaxRequesting", function(){});
		this.registerTableOption("ajaxResponse", false);
		
		this.contentTypeFormatters = Ajax.contentTypeFormatters;
	}
	
	//initialize setup options
	initialize(){
		this.loaderPromise = this.table.options.ajaxRequestFunc || Ajax.defaultLoaderPromise;
		this.urlGenerator = this.table.options.ajaxURLGenerator || Ajax.defaultURLGenerator;
		
		if(this.table.options.ajaxURL){
			this.setUrl(this.table.options.ajaxURL);
		}


		this.setDefaultConfig(this.table.options.ajaxConfig);
		
		this.registerTableFunction("getAjaxUrl", this.getUrl.bind(this));
		
		this.subscribe("data-loading", this.requestDataCheck.bind(this));
		this.subscribe("data-params", this.requestParams.bind(this));
		this.subscribe("data-load", this.requestData.bind(this));
	}
	
	requestParams(data, config, silent, params){
		var ajaxParams = this.table.options.ajaxParams;
		
		if(ajaxParams){
			if(typeof ajaxParams === "function"){
				ajaxParams = ajaxParams.call(this.table);
			}
			
			params = Object.assign(params, ajaxParams);
		}		
		
		return params;
	}
	
	requestDataCheck(data, params, config, silent){
		return !!((!data && this.url) || typeof data === "string");
	}
	
	requestData(url, params, config, silent, previousData){
		var ajaxConfig;
		
		if(!previousData && this.requestDataCheck(url)){
			if(url){
				this.setUrl(url);
			}
			
			ajaxConfig = this.generateConfig(config);
			
			return this.sendRequest(this.url, params, ajaxConfig);
		}else{
			return previousData;
		}
	}
	
	setDefaultConfig(config = {}){
		this.config = Object.assign({}, Ajax.defaultConfig);

		if(typeof config == "string"){
			this.config.method = config;
		}else{
			Object.assign(this.config, config);
		}
	}
	
	//load config object
	generateConfig(config = {}){
		var ajaxConfig = Object.assign({}, this.config)
		
		if(typeof config == "string"){
			ajaxConfig.method = config;
		}else{
			Object.assign(ajaxConfig, config);
		}
		
		return ajaxConfig;
	}
	
	//set request url
	setUrl(url){
		this.url = url;
	}
	
	//get request url
	getUrl(){
		return this.url;
	}
	
	//send ajax request
	sendRequest(url, params, config){
		if(this.table.options.ajaxRequesting.call(this.table, url, params) !== false){
			return this.loaderPromise(url, config, params)
			.then((data)=>{
				if(this.table.options.ajaxResponse){
					data = this.table.options.ajaxResponse.call(this.table, url, params, data);
				}
				
				return data;
			});
		}else{
			return Promise.reject();
		}
	}
}

Ajax.moduleName = "ajax";

//load defaults
Ajax.defaultConfig = defaultConfig;
Ajax.defaultURLGenerator = defaultURLGenerator;
Ajax.defaultLoaderPromise = defaultLoaderPromise;
Ajax.contentTypeFormatters = defaultContentTypeFormatters;

export default Ajax;