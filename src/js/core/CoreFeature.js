export default class CoreFeature{

	constructor(table){
		this.table = table;
	}

	//////////////////////////////////////////
	/////////////// DataLoad /////////////////
	//////////////////////////////////////////

	reloadData(data, silent, columnsChanged){
		return this.table.dataLoader.load(data, undefined, undefined, undefined, silent, columnsChanged);
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
	////////// Inter Table Comms /////////////
	//////////////////////////////////////////

	commsConnections(){
		return this.table.modules.comms.getConnections(...arguments);
	}

	commsSend(){
		return this.table.modules.comms.send(...arguments);
	}

	//////////////////////////////////////////
	//////////////// Layout  /////////////////
	//////////////////////////////////////////

	layoutMode(){
		return this.table.modules.layout.getMode();
	}

	layoutRefresh(force){
		return this.table.modules.layout.layout(force);
	}


	//////////////////////////////////////////
	/////////////// Event Bus ////////////////
	//////////////////////////////////////////

	subscribe(){
		return this.table.eventBus.subscribe(...arguments);
	}

	unsubscribe(){
		return this.table.eventBus.unsubscribe(...arguments);
	}

	subscribed(key){
		return this.table.eventBus.subscribed(key);
	}

	subscriptionChange(){
		return this.table.eventBus.subscriptionChange(...arguments);
	}

	dispatch(){
		return this.table.eventBus.dispatch(...arguments);
	}

	chain(){
		return this.table.eventBus.chain(...arguments);
	}

	confirm(){
		return this.table.eventBus.confirm(...arguments);
	}

	dispatchExternal(){
		return this.table.externalEvents.dispatch(...arguments);
	}

	subscribedExternal(key){
		return this.table.externalEvents.subscribed(key);
	}

	subscriptionChangeExternal(){
		return this.table.externalEvents.subscriptionChange(...arguments);
	}

	//////////////////////////////////////////
	//////////////// Options /////////////////
	//////////////////////////////////////////

	options(key){
		return this.table.options[key];
	}

	setOption(key, value){
		if(typeof value !== "undefined"){
			this.table.options[key] = value;
		}

		return this.table.options[key];
	}

	//////////////////////////////////////////
	/////////// Deprecation Checks ///////////
	//////////////////////////////////////////

	deprecationCheck(oldOption, newOption){
		return this.table.deprecationAdvisor.check(oldOption, newOption);
	}

	deprecationCheckMsg(oldOption, msg){
		return this.table.deprecationAdvisor.checkMsg(oldOption, msg);
	}

	deprecationMsg(msg){
		return this.table.deprecationAdvisor.msg(msg);
	}
	//////////////////////////////////////////
	//////////////// Modules /////////////////
	//////////////////////////////////////////

	module(key){
		return this.table.module(key);
	}
}