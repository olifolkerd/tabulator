import Module from '../../core/Module.js';
import Helpers from '../../core/Helpers.js';

class Interaction extends Module{

	constructor(table){
		super(table);

		this.rowEventsMap = {
			rowClick:"row-click",
			rowDblClick:"row-dblclick",
			rowContext:"row-contextmenu",
			rowMouseEnter:"row-mouseenter",
			rowMouseLeave:"row-mouseleave",
			rowMouseOver:"row-mouseover",
			rowMouseOut:"row-mouseout",
			rowMouseMove:"row-mousemove",
		}

	}

	initialize(){
		this.initializeRows();

		this.subscribe("column-init", this.initializeColumn.bind(this))
	}

	initializeRows(){
		for(let key in this.rowEventsMap){
			if(this.table.options[key]){
				this.subscribe(this.rowEventsMap[key], this.handle.bind(this, key))
			}
		}
	}

	initializeColumn(column){
		console.log("inter column", column)
		this.initializeCells(column);
	}

	initializeCells(column){

	}

	handle(action, e, component){
		this.table.options[action](e, component.getComponent());
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