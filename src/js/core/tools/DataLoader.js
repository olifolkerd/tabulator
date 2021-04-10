import CoreFeature from '../CoreFeature.js';

export default class DataLoader extends CoreFeature{
	constructor(table){
		super(table);

		this.loaderElement = this.createLoaderElement(); //loader message div
		this.msgElement = this.createMsgElement(); //message element
		this.loadingElement = null;
		this.errorElement = null;

		this.requestOrder = 0; //prevent requests comming out of sequence if overridden by another load request
	}

	initialize(){
		var template;

		this.loaderElement.appendChild(this.msgElement);

		if(this.table.options.dataLoaderLoading){
			if(typeof this.table.options.dataLoaderLoading == "string"){
				template = document.createElement('template');
				template.innerHTML = this.table.options.dataLoaderLoading.trim();
				this.loadingElement = template.content.firstChild;
			}else{
				this.loadingElement = this.table.options.dataLoaderLoading;
			}
		}

		if(this.table.options.dataLoaderError){
			if(typeof this.table.options.dataLoaderError == "string"){
				template = document.createElement('template');
				template.innerHTML = this.table.options.dataLoaderError.trim();
				this.errorElement = template.content.firstChild;
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

	load(data, params, replace){
		var requestNo = ++this.requestOrder;

		//parse json data to array
		if (data && (data.indexOf("{") == 0 || data.indexOf("[") == 0)){
			data = JSON.parse(data);
		}

		if(this.confirm("data-loading", data)){

			this.showLoader();

			//get params for request
			var params = this.chain("data-params", data, params || {}, {});

			params = this.mapParams(params, this.table.options.dataSendParams);

			var result = this.chain("data-load", [data, params], Promise.resolve([]));

			result.then((response) => {
				if(!Array.isArray(response) && typeof response == "object"){
					response = this.mapParams(response, this.objectInvert(this.table.options.dataReceiveParams));
				}

				var rowData = this.chain("data-loaded", response, null, response);

				if(requestNo === this.requestOrder){
					this.hideLoader();
					this.table.rowManager.setData(rowData,  replace, !replace);
				}else{
					console.warn("Data Load Response Blocked - An active data load request was blocked by an attempt to change table data while the request was being made");
				}
			}).catch((error) => {
				console.error("Data Load Error: ", error);
				this.dispatchExternal("dataError", error);

				this.showError();

				setTimeout(() => {
					this.hideLoader();
				}, 3000);
			})

			//load data from module
		}else{
			console.log("local");
			//load data into table
			this.table.rowManager.setData(data, replace, !replace);
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
		console.log("show", this.table.options.dataLoader);
		if(shouldLoad){

			this.hideLoader();



			while(this.msgElement.firstChild) this.msgElement.removeChild(this.msgElement.firstChild);
			this.msgElement.classList.remove("tabulator-error");
			this.msgElement.classList.add("tabulator-loading");

			if(this.loadingElement){
				this.msgElement.appendChild(this.loadingElement);
			}else{
				this.msgElement.innerHTML = this.table.modules.localize.getText("data|loading");
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
			this.msgElement.innerHTML = this.table.modules.localize.getText("data|error");
		}

		this.table.element.appendChild(this.loaderElement);
	}


	hideLoader(){
		if(this.loaderElement.parentNode){
			this.loaderElement.parentNode.removeChild(this.loaderElement);
		}
	}
}