var Ajax = function(table){

	this.table = table; //hold Tabulator object
	this.config = false; //hold config object for ajax request
	this.url = ""; //request URL
	this.params = false; //request parameters

	this.loaderElement = $("<div class='tablulator-loader'></div>"); //loader message div
	this.msgElement = $("<div class='tabulator-loader-msg' role='alert'></div>"); //message element
	this.loadingElement = false;
	this.errorElement = false;
};

//initialize setup options
Ajax.prototype.initialize = function(){
	this.loaderElement.append(this.msgElement);

	if(this.table.options.ajaxLoaderLoading){
		this.loadingElement = this.table.options.ajaxLoaderLoading;
	}

	if(this.table.options.ajaxLoaderError){
		this.errorElement = this.table.options.ajaxLoaderError;
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

};

//set ajax params
Ajax.prototype.setParams = function(params, update){
	if(update){
		this.params = this.params || {};

		for(let key in params){
			this.params[key] = params[key];
		}
	}else{
		this.params = params;
	}
};

Ajax.prototype.getParams = function(){
	return this.params || {};
};

//load config object
Ajax.prototype.setConfig = function(config){
	this._loadDefaultConfig();

	if(typeof config == "string"){
		this.config.type = config;
	}else{
		for(let key in config){
			this.config[key] = config[key];
		}
	}
};

//create config object from default
Ajax.prototype._loadDefaultConfig = function(force){
	var self = this;
	if(!self.config || force){

		self.config = {};

		//load base config from defaults
		for(let key in self.defaultConfig){
			self.config[key] = self.defaultConfig[key];
		}
	}
};

//set request url
Ajax.prototype.setUrl = function(url){
	this.url = url;
};

//get request url
Ajax.prototype.getUrl = function(){
	return this.url;
};

//send ajax request
Ajax.prototype.sendRequest = function(callback){
	var self = this;

	if(self.url){

		self._loadDefaultConfig();

		self.config.url = self.url;

		if(self.params){
			self.config.data = self.params;
		}

		self.table.options.ajaxRequesting(self.url, self.params)

		self.showLoader();

		$.ajax(self.config)
		.done(function(data){
			if(self.table.options.ajaxResponse){
				data = self.table.options.ajaxResponse(self.url, self.params, data);
			}

			self.table.options.dataLoaded(data);

			callback(data);

			self.hideLoader();
		})
		.fail(function(xhr, textStatus, errorThrown){
			console.error("Ajax Load Error - Connection Error: " + xhr.status, errorThrown);

			self.table.options.ajaxError(xhr, textStatus, errorThrown);
			self.showError();

			setTimeout(function(){
				self.hideLoader();
			}, 3000);
		});

	}else{
		console.warn("Ajax Load Error - No URL Set");
		return false;
	}
};

Ajax.prototype.showLoader = function(){
	this.loaderElement.detach();

	this.msgElement.empty()
	.removeClass("tabulator-error")
	.addClass("tabulator-loading")

	if(this.loadingElement){
		this.msgElement.append(this.loadingElement);
	}else{
		this.msgElement.append(this.table.extensions.localize.getText("ajax.loading"));
	}

	this.table.element.append(this.loaderElement);
};

Ajax.prototype.showError = function(){
	this.loaderElement.detach();

	this.msgElement.empty()
	.removeClass("tabulator-loading")
	.addClass("tabulator-error")

	if(this.errorElement){
		this.msgElement.append(this.errorElement);
	}else{
		this.msgElement.append(this.table.extensions.localize.getText("ajax.error"));
	}

	this.table.element.append(this.loaderElement);
};

Ajax.prototype.hideLoader = function(){
	this.loaderElement.detach();
};

//default ajax config object
Ajax.prototype.defaultConfig = {
	url: "",
	type: "GET",
	async: true,
	dataType:"json",
	success: function (data){}
};

Tabulator.registerExtension("ajax", Ajax);