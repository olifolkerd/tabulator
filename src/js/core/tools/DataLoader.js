import CoreFeature from '../CoreFeature.js';

export default class DataLoader extends CoreFeature{
	constructor(table){
		super(table);
	}

	load(data, params, replace){
		//parse json data to array
		if (data && (data.indexOf("{") == 0 || data.indexOf("[") == 0)){
			data = JSON.parse(data);
		}

		if(this.confirm("data-load", data)){
			console.log("remote")
			//TODO - update chain function to take intitial value for the chain (pass in the params option)

			//get params for request
			var params = this.chain("data-requesting", data, {});

			//TODO - loading table data - show spinner

			var result = this.chain("data-request", [data, params], Promise.resolve([]));

			result.then((rowData) => {

				//TODO - table data loaded - hide spinner
				this.table.rowManager.setData(rowData,  replace, !replace);
			})

			//load data from module
		}else{
			console.log("local");
			//load data into table
			this.table.rowManager.setData(data, replace, !replace);
		}
	}
}