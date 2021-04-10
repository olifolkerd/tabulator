import CoreFeature from '../CoreFeature.js';

export default class DataNexus extends CoreFeature{
	constructor(){
		super(table);
	}

	setData(data, params, replace){

		//parse json data to array
		if (data.indexOf("{") == 0 || data.indexOf("[") == 0){
			data = JSON.parse(data);
		}

		if(this.confirm("data-set", data)){

			//TODO - update chain function to take intitial value for the chain (pass in the params option)

			//get params for request
			var params = this.chain("data-requesting", data, {});

			//TODO - loading table data - show spinner

			var result = this.chain("data-request", [data, params], Promise.resolve([]));

			result.then((rowData) => {

				//TODO - table data loaded - hide spinner

				this.rowManager.setData(data,  replace, !replace);
			})

			//load data from module
		}else{
			//load data into table
			this.rowManager.setData(data, replace, !replace);
		}
	}
}