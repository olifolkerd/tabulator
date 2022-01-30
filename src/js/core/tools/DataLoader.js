import CoreFeature from '../CoreFeature.js';

export default class DataLoader extends CoreFeature{
	constructor(table){
		super(table);

		this.loaderElement = this.createLoaderElement(); //loader message div
		this.msgElement = this.createMsgElement(); //message element
		this.loadingElement = null;
		this.errorElement = null;

		this.requestOrder = 0; //prevent requests comming out of sequence if overridden by another load request
		this.loading = false;
	}

	initialize(){
		var template;

		this.loaderElement.appendChild(this.msgElement);

		if(this.table.options.dataLoaderLoading){
			if(typeof this.table.options.dataLoaderLoading == "string"){
				template = document.createElement('template');
				template.innerHTML = this.table.options.dataLoaderLoading.trim();
				this.loadingElement = template.firstElementChild;
			}else{
				this.loadingElement = this.table.options.dataLoaderLoading;
			}
		}

		if(this.table.options.dataLoaderError){
			if(typeof this.table.options.dataLoaderError == "string"){
				template = document.createElement('template');
				template.innerHTML = this.table.options.dataLoaderError.trim();
				this.errorElement = template.firstElementChild;
			}else{
				this.errorElement = this.table.options.dataLoaderError;
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

	load(data, params, config, replace, silent){
		var requestNo = ++this.requestOrder;

		this.dispatchExternal("dataLoading", data);

		//parse json data to array
		if (data && (data.indexOf("{") == 0 || data.indexOf("[") == 0)){
			data = JSON.parse(data);
		}

		if(this.confirm("data-loading", [data, params, config, silent])){
			this.loading = true;

			if(!silent){
				this.showLoader();
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
					this.hideLoader();

					if(rowData !== false){
						this.dispatchExternal("dataLoaded", rowData);
						this.table.rowManager.setData(rowData,  replace, !replace);
					}
				}else{
					console.warn("Data Load Response Blocked - An active data load request was blocked by an attempt to change table data while the request was being made");
				}
			}).catch((error) => {
				console.error("Data Load Error: ", error);
				this.dispatchExternal("dataLoadError", error);

				if(!silent){
					this.showError();
				}
				
				setTimeout(() => {
					this.hideLoader();
				}, this.table.options.dataLoaderErrorTimeout);
			})
			.finally(() => {
				this.loading = false;
			})
		}else{
			this.dispatchExternal("dataLoaded", data);

			if(!data){
				data = [];
			}

			this.table.rowManager.setData(data, replace, !replace);
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

	showLoader(){
		var shouldLoad = typeof this.table.options.dataLoader === "function" ? this.table.options.dataLoader() : this.table.options.dataLoader;

		if(shouldLoad){
			this.hideLoader();

			while(this.msgElement.firstChild) this.msgElement.removeChild(this.msgElement.firstChild);

			this.msgElement.classList.remove("tabulator-error");
			this.msgElement.classList.add("tabulator-loading");

			if(this.loadingElement){
				this.msgElement.appendChild(this.loadingElement);
			}else{
				this.msgElement.innerHTML = this.langText("data|loading");
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
			this.msgElement.innerHTML = this.langText("data|error");
		}

		this.table.element.appendChild(this.loaderElement);
	}


	hideLoader(){
		if(this.loaderElement.parentNode){
			this.loaderElement.parentNode.removeChild(this.loaderElement);
		}
	}
}