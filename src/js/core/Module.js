class Module{

	constructor(table, name){
		this.table = table;
	}

	initialize(){
		// setup module when table is initialized, to be overriden in module
	}
}

export default Module;