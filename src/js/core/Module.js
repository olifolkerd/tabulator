import CoreFeature from './CoreFeature.js';

class Module extends CoreFeature{

	constructor(table, name){
		super(table);

		this._handler = null;
	}

	initialize(){
		// setup module when table is initialized, to be overriden in module
	}


	///////////////////////////////////
	////// Options Registration ///////
	///////////////////////////////////

	registerTableOption(key, value){
		this.table.optionsList.register(key, value);
	}

	registerColumnOption(key, value){
		this.table.columnManager.optionsList.register(key, value);
	}

	///////////////////////////////////
	/// Public Function Registation ///
	///////////////////////////////////

	registerTableFunction(name, func){
		if(typeof this.table[name] === "undefined"){
			this.table[name] = func;
		}else{
			console.warn("Unable to bind table function, name already in use", name)
		}
	}

	registerComponentFunction(component, func, handler){
		return this.table.componentFunctionBinder.bind(component, func, handler);
	}

	///////////////////////////////////
	////////// Data Pipeline //////////
	///////////////////////////////////

	registerDataHandler(handler, priority){
		this.table.rowManager.registerDataPipelineHandler(handler, priority)
		this._handler = handler;
	}

	registerDisplayHandler(handler, priority){
		this.table.rowManager.registerDisplayPipelineHandler(handler, priority)
		this._handler = handler;
	}

	refreshData(renderInPosition, handler){
		if(!handler){
			handler = this._handler;
		}

		if(handler){
			this.table.rowManager.refreshActiveData(handler, false, renderInPosition);
		}
	}
}

export default Module;