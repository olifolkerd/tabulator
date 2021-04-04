import Module from '../../core/Module.js';
import Helpers from '../../core/Helpers.js';

class Interaction extends Module{

	constructor(table){
		super(table);

		this.eventMap = {
			rowClick:"row-click",
			rowDblClick:"row-dblclick",
			rowContext:"row-contextmenu",
			rowMouseEnter:"row-mouseenter",
			rowMouseLeave:"row-mouseleave",
			rowMouseOver:"row-mouseover",
			rowMouseOut:"row-mouseout",
			rowMouseMove:"row-mousemove",
		}

		this.subscribers = {};

	}

	initialize(){
		this.initializeExternalEvents();

		this.subscribe("column-init", this.initializeColumn.bind(this))
	}

	initializeExternalEvents(){
		for(let key in this.eventMap){
			if(this.table.options[key]){
				this.subscriptionChanged(key, true);
			}
			this.subscriptionChangeExternal(key, this.subscriptionChanged.bind(this, key))
		}
	}

	subscriptionChanged(key, added){
		var index;

		if(added){
			if(!this.subscribers[key]){
				this.subscribers[key] = this.handle.bind(this, key);
				this.subscribe(this.eventMap[key], this.subscribers[key]);
			}
		}else{
			if(this.subscribers[key] && !this.table.options[key]  && !this.subscribedExternal(key)){
				this.unsubscribe(this.eventMap[key], this.subscribers[key]);
				delete this.subscribers[key];
			}
		}
	}



	initializeColumn(column){
		this.initializeCells(column);
	}

	initializeCells(column){

	}

	handle(action, e, component){
		component = component.getComponent();

		if(this.table.options[action]){
			this.table.options[action](e, component);
		}

		this.dispatchExternal(action, e, component)
	}

	handleColumn(action, e, component){
		if(typeof component.definition[action] === "function"){
			component.definition[action](e, component.getComponent());
		}
	}

	handleCell(action, e, component){
		if(typeof component.column.definition[action] === "function"){
			component.column.definition[action](e, component.getComponent());
		}
	}
}

Interaction.moduleName = "interaction";

export default Interaction;