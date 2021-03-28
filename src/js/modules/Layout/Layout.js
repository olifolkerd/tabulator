import Module from '../../core/Module.js';

import defaultModes from './defaults/modes.js';

class Layout extends Module{

	constructor(table){
		super(table, "layout");

		this.mode = null;
	}

	//initialize layout system
	initialize(){
		var layout = this.table.options.layout;

		if(Layout.modes[layout]){
			this.mode = layout;
		}else{
			console.warn("Layout Error - invalid mode set, defaulting to 'fitData' : " + layout);
			this.mode = 'fitData';
		}

		this.table.element.setAttribute("tabulator-layout", this.mode);
	}

	getMode(){
		return this.mode;
	}

	//trigger table layout
	layout(){
		Layout.modes[this.mode].call(this, this.table.columnManager.columnsByIndex);

		if(this.mode.indexOf("fitData") === 0 && this.table.options.persistence && this.table.modExists("persistence", true) && this.table.modules.persistence.config.columns){
			this.table.modules.persistence.save("columns");
		}
	}
}

Layout.moduleName = "layout";

//load defaults
Layout.modes = defaultModes;

export default Layout;