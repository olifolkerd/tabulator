import CoreFeature from './CoreFeature.js';

class Module extends CoreFeature{

	constructor(table, name){
		super(table);
	}

	initialize(){
		// setup module when table is initialized, to be overriden in module
	}


}

export default Module;