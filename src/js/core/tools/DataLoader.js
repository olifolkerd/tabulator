import CoreFeature from '../CoreFeature.js';

export default class DataLoader extends CoreFeature{
	constructor(table){
		super(table);

		this.requestOrder = 0; //prevent requests coming out of sequence if overridden by another load request
		this.loading = false;
	}

	initialize(){}

	load(data, params, config, replace, silent, columnsChanged){
		var requestNo = ++this.requestOrder;

		this.dispatchExternal("dataLoading", data);

		//parse json data to array
		if (data && (data.indexOf("{") == 0 || data.indexOf("[") == 0)){
			data = JSON.parse(data);
		}

		if(this.confirm("data-loading", [data, params, config, silent])){
			this.loading = true;

			if(!silent){
				this.alertLoader();
			}

			//get params for request
			params = this.chain("data-params", [data, config, silent], params || {}, params || {});

			params = this.mapParams(params, this.table.options.dataSendParams);

			var result = this.chain("data-load", [data, params, config, silent], false, Promise.resolve([]));
			
			return result.then((response) => {
				if(!Array.isArray(response) && typeof response == "object"){
					response = this.mapParams(response, this.objectInvert(this.table.options.dataReceiveParams));
				}

				var rowData = this.chain("data-loaded", response, null, response);

				if(requestNo == this.requestOrder){
					this.clearAlert();

					if(rowData !== false){
						this.dispatchExternal("dataLoaded", rowData);
						this.table.rowManager.setData(rowData,  replace, typeof columnsChanged === "undefined" ? !replace : columnsChanged);
					}
				}else{
					console.warn("Data Load Response Blocked - An active data load request was blocked by an attempt to change table data while the request was being made");
				}
			}).catch((error) => {
				console.error("Data Load Error: ", error);
				this.dispatchExternal("dataLoadError", error);

				if(!silent){
					this.alertError();
				}
				
				setTimeout(() => {
					this.clearAlert();
				}, this.table.options.dataLoaderErrorTimeout);
			})
				.finally(() => {
					this.loading = false;
				});
		}else{
			this.dispatchExternal("dataLoaded", data);

			if(!data){
				data = [];
			}

			this.table.rowManager.setData(data, replace, typeof columnsChanged === "undefined" ? !replace : columnsChanged);
			return Promise.resolve();
		}
	}

	mapParams(params, map){
		var output = {};

		for(let key in params){
			output[map.hasOwnProperty(key) ? map[key] : key] = params[key];
		}

		return output;
	}

	objectInvert(obj){
		var output = {};

		for(let key in obj){
			output[obj[key]] = key;
		}

		return output;
	}

	blockActiveLoad(){
		this.requestOrder++;
	}

	alertLoader(){
		var shouldLoad = typeof this.table.options.dataLoader === "function" ? this.table.options.dataLoader() : this.table.options.dataLoader;

		if(shouldLoad){
			this.table.alertManager.alert(this.table.options.dataLoaderLoading || this.langText("data|loading"));
		}
	}

	alertError(){
		this.table.alertManager.alert(this.table.options.dataLoaderError || this.langText("data|error"), "error");
	}

	clearAlert(){
		this.table.alertManager.clear();
	}
}