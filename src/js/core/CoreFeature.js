export default class CoreFeature{

	constructor(table){
		this.table = table;
	}

	//////////////////////////////////////////
	/////////////// Event Bus ////////////////
	//////////////////////////////////////////

	subscribe(){
		this.table.eventBus.subscribe(...arguments);
	}

	unsubscribe(){
		this.table.eventBus.unsubscribe(...arguments);
	}

	subscribed(key){
		this.table.eventBus.subscribed(key);
	}

	subscriptionChange(){
		this.table.eventBus.subscriptionChange(...arguments);
	}

	dispatch(){
		this.table.eventBus.dispatch(...arguments);
	}

	chain(){
		return this.table.eventBus.chain(...arguments);
	}

	dispatchExternal(){
		this.table.externalEvents.dispatch(...arguments);
	}

	subscribedExternal(key){
		this.table.externalEvents.subscribed(key);
	}

	subscriptionChangeExternal(){
		this.table.externalEvents.subscriptionChange(...arguments);
	}


	//////////////////////////////////////////
	//////////////// Modules /////////////////
	//////////////////////////////////////////

	module(key){
		return this.table.module(key);
	}
}