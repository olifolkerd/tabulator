var Ajax = function(table){

	var extension = {
		table:table, //hold Tabulator object
		config:false, //hold config object for ajax request
		url:"", //request URL
		params:false, //request parameters

		loaderElement:$("<div class='tablulator-loader'></div>"), //loader message div
		msgElement:$("<div class='tabulator-loader-msg' role='alert'></div>"), //message element
		loadingElement:false,
		errorElement:false,


		//initialize setup options
		initialize:function(){
			this.loaderElement.append(this.msgElement);

			if(this.table.options.ajaxLoaderLoading){
				this.loadingElement = this.table.options.ajaxLoaderLoading;
			}

			if(this.table.options.ajaxLoaderError){
				this.errorElement = this.table.options.ajaxLoaderError;
			}
		},

		//set ajax params
		setParams:function(params){
			this.params = params;
		},

		getParams:function(){
			return this.params || {};
		},

		//load config object
		setConfig:function(config){
			this._loadDefaultConfig();

			if(typeof config == "string"){
				this.config.type = config;
			}else{
				for(let key in config){
					this.config[key] = config[key];
				}
			}
		},

		//create config object from default
		_loadDefaultConfig:function(force){
			var self = this;
			if(!self.config || force){

				self.config = {};

				//load base config from defaults
				for(let key in self.defaultConfig){
					self.config[key] = self.defaultConfig[key];
				}

				self.config.error = function (xhr, textStatus, errorThrown){
					console.error("Ajax Load Error - Connection Error: " + xhr.status, errorThrown);

					self.table.options.dataLoadError(xhr, textStatus, errorThrown);
					self.showError();

					setTimeout(function(){
						self.hideLoader();
					}, 3000);
				}
			}
		},

		//set request url
		setUrl:function(url){
			this.url = url;
		},

		//get request url
		getUrl:function(){
			return this.url;
		},

		//send ajax request
		sendRequest:function(callback){
		var self = this;
			if(self.url){
				self._loadDefaultConfig();

				self.config.url = self.url;

				if(self.params){
					self.config.data = self.params;
				}

				self.config.success = function (data){
					callback(data);
					self.hideLoader();
				};

				self.showLoader();

				$.ajax(self.config);

			}else{
				console.warn("Ajax Load Error - No URL Set");
				return false;
			}
		},

		showLoader:function(){
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
		},

		showError:function(){
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
		},

		hideLoader:function(){
			this.loaderElement.detach();
		},

		defaultConfig:{ //default ajax config object
			url: "",
			type: "GET",
			async: true,
			dataType:"json",
			success: function (data){},
		},
	}

	return extension;
}

Tabulator.registerExtension("ajax", Ajax);