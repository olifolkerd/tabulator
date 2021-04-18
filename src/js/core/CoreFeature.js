export default class CoreFeature{

	constructor(table){
		this.table = table;
	}

	//////////////////////////////////////////
	/////////////// DataLoad /////////////////
	//////////////////////////////////////////

	reloadData(data, silent){
		return this.table.dataLoader.load(data, undefined, undefined, undefined, silent);
	}

	//////////////////////////////////////////
	///////////// Localization ///////////////
	//////////////////////////////////////////

	langText(){
		return this.table.modules.localize.getText(...arguments);
	}

	langBind(){
		return this.table.modules.localize.bind(...arguments);
	}

	langLocale(){
		return this.table.modules.localize.getLocale(...arguments);
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

	confirm(){
		return this.table.eventBus.confirm(...arguments);
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
	//////////////// Options /////////////////
	//////////////////////////////////////////

	options(key){
		return this.table.options[key];
	}

	//////////////////////////////////////////
	//////////////// Modules /////////////////
	//////////////////////////////////////////

	module(key){
		return this.table.module(key);
	}
}