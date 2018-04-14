var Ajax = function(table){

	this.table = table; //hold Tabulator object
	this.config = false; //hold config object for ajax request
	this.url = ""; //request URL
	this.params = false; //request parameters

	this.loaderElement = $("<div class='tablulator-loader'></div>"); //loader message div
	this.msgElement = $("<div class='tabulator-loader-msg' role='alert'></div>"); //message element
	this.loadingElement = false;
	this.errorElement = false;

	this.progressiveLoad = false;
	this.loading = false;

	this.requestOrder = 0; //prevent requests comming out of sequence if overridden by another load request
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

	if(this.table.options.ajaxProgressiveLoad){
		if(this.table.options.pagination){
			this.progressiveLoad = false;
			console.error("Progressive Load Error - Pagination and progressive load cannot be used at the same time");
		}else{
			if(this.table.extExists("page")){
				this.progressiveLoad = this.table.options.ajaxProgressiveLoad;
				this.table.extensions.page.initializeProgressive(this.progressiveLoad);
			}else{
				console.error("Pagination plugin is required for progressive ajax loading");
			}
		}
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

//lstandard loading function
Ajax.prototype.loadData = function(inPosition){
	var self = this;

	if(this.progressiveLoad){
		this._loadDataProgressive();
	}else{
		this._loadDataStandard(inPosition);
	}
};

Ajax.prototype.nextPage = function(diff){
	var margin;

	if(!this.loading){

		margin = this.table.options.ajaxProgressiveLoadScrollMargin || (this.table.rowManager.element[0].clientHeight * 2);

		if(diff < margin){
			this.table.extensions.page.nextPage();
		}
	}
}

Ajax.prototype.blockActiveRequest = function(){
	this.requestOrder ++;
}

Ajax.prototype._loadDataProgressive = function(){
	this.table.rowManager.setData([]);
	this.table.extensions.page.setPage(1);
};

Ajax.prototype._loadDataStandard = function(inPosition){
	var self = this;
	this.sendRequest(function(data){
		self.table.rowManager.setData(data, inPosition);
	}, inPosition);
}

//send ajax request
Ajax.prototype.sendRequest = function(callback, silent){
	var self = this,
	requestNo;

	if(self.url){

		self.requestOrder ++;
		requestNo = self.requestOrder;

		self._loadDefaultConfig();

		self.config.url = self.url;

		if(self.params){
			self.config.data = self.params;
		}

		if(self.table.options.ajaxRequesting(self.url, self.params) !== false){

			self.loading = true;

			if(!silent){
				self.showLoader();
			}

			$.ajax(self.config)
			.done(function(data){

				if(requestNo === self.requestOrder){
					if(self.table.options.ajaxResponse){
						data = self.table.options.ajaxResponse(self.url, self.params, data);
					}

					callback(data);
				}else{
					console.warn("Ajax Response Blocked - An active ajax request was blocked by an attempt to change table data while the request was being made")
				}

				self.hideLoader();

				self.loading = false;
			})
			.fail(function(xhr, textStatus, errorThrown){
				console.error("Ajax Load Error - Connection Error: " + xhr.status, errorThrown);

				self.table.options.ajaxError(xhr, textStatus, errorThrown);
				self.showError();

				setTimeout(function(){
					self.hideLoader();
				}, 3000);

				self.loading = false;
			});
		}

	}else{
		console.warn("Ajax Load Error - No URL Set");
		return false;
	}
};

Ajax.prototype.showLoader = function(){
	var shouldLoad = typeof this.table.options.ajaxLoader === "function" ? this.table.options.ajaxLoader() : this.table.options.ajaxLoader;

	if(shouldLoad){

		this.loaderElement.detach();

		this.msgElement.empty()
		.removeClass("tabulator-error")
		.addClass("tabulator-loading")

		if(this.loadingElement){
			this.msgElement.append(this.loadingElement);
		}else{
			this.msgElement.append(this.table.extensions.localize.getText("ajax|loading"));
		}

		this.table.element.append(this.loaderElement);
	}
};

Ajax.prototype.showError = function(){
	this.loaderElement.detach();

	this.msgElement.empty()
	.removeClass("tabulator-loading")
	.addClass("tabulator-error")

	if(this.errorElement){
		this.msgElement.append(this.errorElement);
	}else{
		this.msgElement.append(this.table.extensions.localize.getText("ajax|error"));
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