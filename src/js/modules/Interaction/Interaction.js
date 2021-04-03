import Module from '../../core/Module.js';
import Helpers from '../../core/Helpers.js';

class Interaction extends Module{

	constructor(table){
		super(table);

	}

	initialize(){
		this.initializeRows();

		this.subscribe("column-init", this.initializeColumn.bind(this))
	}

	initializeRows(){
		//handle row click events
		if (this.table.options.rowClick){
			this.subscribe("row-click", this.handle.bind(this, "rowClick"))
		}

		if (this.table.options.rowDblClick){
			this.subscribe("row-dblclick", this.handle.bind(this, "rowDblClick"))
		}

		if (this.table.options.rowContext){
			this.subscribe("row-contextmenu", this.handle.bind(this, "rowContext"))
		}

		if (this.table.options.rowMouseEnter){
			this.subscribe("row-mouseenter", this.handle.bind(this, "rowMouseEnter"))
		}

		if (this.table.options.rowMouseLeave){
			this.subscribe("row-mouseleave", this.handle.bind(this, "rowMouseLeave"))
		}

		if (this.table.options.rowMouseOver){
			this.subscribe("row-mouseover", this.handle.bind(this, "rowMouseOver"))
		}

		if (this.table.options.rowMouseOut){
			this.subscribe("row-mouseout", this.handle.bind(this, "rowMouseOut"))
		}

		if (this.table.options.rowMouseMove){
			this.subscribe("row-mousemove", this.handle.bind(this, "rowMouseMove"))
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
}

Interaction.moduleName = "interaction";

export default Interaction;