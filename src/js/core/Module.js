import CoreFeature from './CoreFeature.js';
import Popup from './tools/Popup.js';

export default class Module extends CoreFeature{
	
	constructor(table, name){
		super(table);
		
		this._handler = null;
	}
	
	initialize(){
		// setup module when table is initialized, to be overridden in module
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
	/// Public Function Registration ///
	///////////////////////////////////
	
	registerTableFunction(name, func){
		if(typeof this.table[name] === "undefined"){
			this.table[name] = (...args) => {
				this.table.initGuard(name);
				
				return func(...args);
			};
		}else{
			console.warn("Unable to bind table function, name already in use", name);
		}
	}
	
	registerComponentFunction(component, func, handler){
		return this.table.componentFunctionBinder.bind(component, func, handler);
	}
	
	///////////////////////////////////
	////////// Data Pipeline //////////
	///////////////////////////////////
	
	registerDataHandler(handler, priority){
		this.table.rowManager.registerDataPipelineHandler(handler, priority);
		this._handler = handler;
	}
	
	registerDisplayHandler(handler, priority){
		this.table.rowManager.registerDisplayPipelineHandler(handler, priority);
		this._handler = handler;
	}
	
	displayRows(adjust){
		var index = this.table.rowManager.displayRows.length - 1, 
		lookupIndex;
		
		if(this._handler){
			lookupIndex = this.table.rowManager.displayPipeline.findIndex((item) => {
				return item.handler === this._handler;
			});

			if(lookupIndex > -1){
				index = lookupIndex;
			}
		}
		
		if(adjust){
			index = index + adjust;
		}

		if(this._handler){
			if(index > -1){
				return this.table.rowManager.getDisplayRows(index);
			}else{
				return this.activeRows();
			}
		}	
	}
	
	activeRows(){
		return this.table.rowManager.activeRows;
	}
	
	refreshData(renderInPosition, handler){
		if(!handler){
			handler = this._handler;
		}
		
		if(handler){
			this.table.rowManager.refreshActiveData(handler, false, renderInPosition);
		}
	}
	
	///////////////////////////////////
	//////// Footer Management ////////
	///////////////////////////////////
	
	footerAppend(element){
		return this.table.footerManager.append(element);
	}
	
	footerPrepend(element){
		return this.table.footerManager.prepend(element);
	}
	
	footerRemove(element){
		return this.table.footerManager.remove(element);
	} 
	
	///////////////////////////////////
	//////// Popups Management ////////
	///////////////////////////////////
	
	popup(menuEl, menuContainer){
		return new Popup(this.table, menuEl, menuContainer);
	}
	
	///////////////////////////////////
	//////// Alert Management ////////
	///////////////////////////////////
	
	alert(content, type){
		return this.table.alertManager.alert(content, type);
	}
	
	clearAlert(){
		return this.table.alertManager.clear();
	}
	
}