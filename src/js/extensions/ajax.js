var Ajax = function(table){

	var extension = {
		table:table, //hold Tabulator object
		config:false, //hold config object for ajax request
		url:"",
		params:false,

		//set ajax params
		setParams:function(params){
			this.params = params;
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
			if(!this.config || force){

				this.config = {};

				//load base config from defaults
				for(let key in this.defaultConfig){
					this.config[key] = this.defaultConfig[key];
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
			if(this.url){
				this._loadDefaultConfig();

				this.config.url = this.url;

				if(this.params){
					this.config.data = params;
				}

				this.config.success = function (data){callback(data);};

				$.ajax(this.config);

			}else{
				console.warn("Ajax Load Error - No URL Set");
				return false;
			}
		},



		defaultConfig:{ //default ajax config object
			url: "",
			type: "GET",
			async: true,
			dataType:"json",
			success: function (data){},
			error: function (xhr, textStatus, errorThrown){
				console.error("Ajax Load Error - Connection Error: " + xhr.status, errorThrown);

				self.table.options.dataLoadError(xhr, textStatus, errorThrown);
			},
		},
	}

	return extension;
}

Tabulator.registerExtension("ajax", Ajax);