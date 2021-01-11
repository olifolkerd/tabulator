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

		this.loaderElement = this.createLoaderElement(); //loader message div
		this.msgElement = this.createMsgElement(); //message element
		this.loadingElement = false;
		this.errorElement = false;
		this.loaderPromise = false;

		this.progressiveLoad = false;
		this.loading = false;

		this.requestOrder = 0; //prevent requests comming out of sequence if overridden by another load request
	}

	//initialize setup options
	initialize(){
		var template;

		this.loaderElement.appendChild(this.msgElement);

		if(this.table.options.ajaxLoaderLoading){
			if(typeof this.table.options.ajaxLoaderLoading == "string"){
				template = document.createElement('template');
				template.innerHTML = this.table.options.ajaxLoaderLoading.trim();
				this.loadingElement = template.content.firstChild;
			}else{
				this.loadingElement = this.table.options.ajaxLoaderLoading;
			}
		}

		this.loaderPromise = this.table.options.ajaxRequestFunc || Ajax.defaultLoaderPromise;

		this.urlGenerator = this.table.options.ajaxURLGenerator || Ajax.defaultURLGenerator;

		if(this.table.options.ajaxLoaderError){
			if(typeof this.table.options.ajaxLoaderError == "string"){
				template = document.createElement('template');
				template.innerHTML = this.table.options.ajaxLoaderError.trim();
				this.errorElement = template.content.firstChild;
			}else{
				this.errorElement = this.table.options.ajaxLoaderError;
			}
		}

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
		}
	}

	createLoaderElement(){
		var el = document.createElement("div");
		el.classList.add("tabulator-loader");
		return el;
	}

	createMsgElement(){
		var el = document.createElement("div");

		el.classList.add("tabulator-loader-msg");
		el.setAttribute("role", "alert");

		return el;
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
		var self = this;
		if(!self.config || force){

			self.config = {};

			//load base config from defaults
			for(let key in Ajax.defaultConfig){
				self.config[key] = Ajax.defaultConfig[key];
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
		var self = this;

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

	blockActiveRequest(){
		this.requestOrder ++;
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
		var self = this,
		output = [];

		prefix = prefix || "";

		if ( Array.isArray(data) ) {
			data.forEach(function(item, i){
				output = output.concat(self.generateParamsList(item, prefix ? prefix + "[" + i + "]" : i));
			});
		}else if (typeof data === "object"){
			for (var key in data){
				output = output.concat(self.generateParamsList(data[key], prefix ? prefix + "[" + key + "]" : key));
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
		var self = this,
		url = self.url,
		requestNo, esc, query;

		self.requestOrder ++;
		requestNo = self.requestOrder;

		self._loadDefaultConfig();

		return new Promise((resolve, reject)=>{
			if(self.table.options.ajaxRequesting.call(this.table, self.url, self.params) !== false){

				self.loading = true;

				if(!silent){
					self.showLoader();
				}

				this.loaderPromise(url, self.config, self.params).then((data)=>{
					if(requestNo === self.requestOrder){
						if(self.table.options.ajaxResponse){
							data = self.table.options.ajaxResponse.call(self.table, self.url, self.params, data);
						}
						resolve(data);

						self.hideLoader();
						self.loading = false;
					}else{
						console.warn("Ajax Response Blocked - An active ajax request was blocked by an attempt to change table data while the request was being made");
					}

				})
				.catch((error)=>{
					console.error("Ajax Load Error: ", error);
					self.table.options.ajaxError.call(self.table, error);

					self.showError();

					setTimeout(function(){
						self.hideLoader();
					}, 3000);

					self.loading = false;

					reject(error);
				});
			}else{
				reject();
			}
		});
	}

	showLoader(){
		var shouldLoad = typeof this.table.options.ajaxLoader === "function" ? this.table.options.ajaxLoader() : this.table.options.ajaxLoader;

		if(shouldLoad){

			this.hideLoader();

			while(this.msgElement.firstChild) this.msgElement.removeChild(this.msgElement.firstChild);
			this.msgElement.classList.remove("tabulator-error");
			this.msgElement.classList.add("tabulator-loading");

			if(this.loadingElement){
				this.msgElement.appendChild(this.loadingElement);
			}else{
				this.msgElement.innerHTML = this.table.modules.localize.getText("ajax|loading");
			}

			this.table.element.appendChild(this.loaderElement);
		}
	}

	showError(){
		this.hideLoader();

		while(this.msgElement.firstChild) this.msgElement.removeChild(this.msgElement.firstChild);
		this.msgElement.classList.remove("tabulator-loading");
		this.msgElement.classList.add("tabulator-error");

		if(this.errorElement){
			this.msgElement.appendChild(this.errorElement);
		}else{
			this.msgElement.innerHTML = this.table.modules.localize.getText("ajax|error");
		}

		this.table.element.appendChild(this.loaderElement);
	}

	hideLoader(){
		if(this.loaderElement.parentNode){
			this.loaderElement.parentNode.removeChild(this.loaderElement);
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