class Module{

	constructor(table, name){
		this.table = table;
	}

	initialize(){
		// setup module when table is initialized, to be overriden in module
	}

	subscribe(){
		this.table.eventBus.subscribe(...arguments);
	}

	unsubscribe(){
		this.table.eventBus.unsubscribe(...arguments);
	}
}

export default Module;