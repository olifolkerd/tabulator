import CoreFeature from './CoreFeature.js';

class Module extends CoreFeature{

	constructor(table, name){
		super(table);

		this._handler = null;
	}

	initialize(){
		// setup module when table is initialized, to be overriden in module
	}

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