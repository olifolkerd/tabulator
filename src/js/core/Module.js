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
	/// Public Function Registation ///
	///////////////////////////////////

	registerTableFunction(name, fun){
		if(typeof this.table[name] === "undefined"){
			this.table[name] = func;
		}else{
			console.warn("Unable to bind table function, name already in use", name)
		}
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

	refreshData(skipStage, renderInPosition, handler){
		if(!handler){
			handler = this._handler;
		}

		if(handler){
			this.table.rowManager.refreshActiveData(handler, skipStage, renderInPosition);
		}
	}
}

export default Module;