import Module from '../../core/Module.js';

import Cell from '../../core/cell/Cell.js';
import Column from '../../core/column/Column.js';

export default class Interaction extends Module{

	static moduleName = "interaction";

	constructor(table){
		super(table);

		this.eventMap = {
			//row events
			rowClick:"row-click",
			rowDblClick:"row-dblclick",
			rowContext:"row-contextmenu",
			rowMouseEnter:"row-mouseenter",
			rowMouseLeave:"row-mouseleave",
			rowMouseOver:"row-mouseover",
			rowMouseOut:"row-mouseout",
			rowMouseMove:"row-mousemove",
			rowMouseDown:"row-mousedown",
			rowMouseUp:"row-mouseup",
			rowTap:"row",
			rowDblTap:"row",
			rowTapHold:"row",

			//cell events
			cellClick:"cell-click",
			cellDblClick:"cell-dblclick",
			cellContext:"cell-contextmenu",
			cellMouseEnter:"cell-mouseenter",
			cellMouseLeave:"cell-mouseleave",
			cellMouseOver:"cell-mouseover",
			cellMouseOut:"cell-mouseout",
			cellMouseMove:"cell-mousemove",
			cellMouseDown:"cell-mousedown",
			cellMouseUp:"cell-mouseup",
			cellTap:"cell",
			cellDblTap:"cell",
			cellTapHold:"cell",

			//column header events
			headerClick:"column-click",
			headerDblClick:"column-dblclick",
			headerContext:"column-contextmenu",
			headerMouseEnter:"column-mouseenter",
			headerMouseLeave:"column-mouseleave",
			headerMouseOver:"column-mouseover",
			headerMouseOut:"column-mouseout",
			headerMouseMove:"column-mousemove",
			headerMouseDown:"column-mousedown",
			headerMouseUp:"column-mouseup",
			headerTap:"column",
			headerDblTap:"column",
			headerTapHold:"column",

			//group header
			groupClick:"group-click",
			groupDblClick:"group-dblclick",
			groupContext:"group-contextmenu",
			groupMouseEnter:"group-mouseenter",
			groupMouseLeave:"group-mouseleave",
			groupMouseOver:"group-mouseover",
			groupMouseOut:"group-mouseout",
			groupMouseMove:"group-mousemove",
			groupMouseDown:"group-mousedown",
			groupMouseUp:"group-mouseup",
			groupTap:"group",
			groupDblTap:"group",
			groupTapHold:"group",
		};

		this.subscribers = {};

		this.touchSubscribers = {};

		this.columnSubscribers = {};

		this.touchWatchers = {
			row:{
				tap:null,
				tapDbl:null,
				tapHold:null,
			},
			cell:{
				tap:null,
				tapDbl:null,
				tapHold:null,
			},
			column:{
				tap:null,
				tapDbl:null,
				tapHold:null,
			},
			group:{
				tap:null,
				tapDbl:null,
				tapHold:null,
			}
		};

		this.registerColumnOption("headerClick");
		this.registerColumnOption("headerDblClick");
		this.registerColumnOption("headerContext");
		this.registerColumnOption("headerMouseEnter");
		this.registerColumnOption("headerMouseLeave");
		this.registerColumnOption("headerMouseOver");
		this.registerColumnOption("headerMouseOut");
		this.registerColumnOption("headerMouseMove");
		this.registerColumnOption("headerMouseDown");
		this.registerColumnOption("headerMouseUp");
		this.registerColumnOption("headerTap");
		this.registerColumnOption("headerDblTap");
		this.registerColumnOption("headerTapHold");

		this.registerColumnOption("cellClick");
		this.registerColumnOption("cellDblClick");
		this.registerColumnOption("cellContext");
		this.registerColumnOption("cellMouseEnter");
		this.registerColumnOption("cellMouseLeave");
		this.registerColumnOption("cellMouseOver");
		this.registerColumnOption("cellMouseOut");
		this.registerColumnOption("cellMouseMove");
		this.registerColumnOption("cellMouseDown");
		this.registerColumnOption("cellMouseUp");
		this.registerColumnOption("cellTap");
		this.registerColumnOption("cellDblTap");
		this.registerColumnOption("cellTapHold");

	}

	initialize(){
		this.initializeExternalEvents();

		this.subscribe("column-init", this.initializeColumn.bind(this));
		this.subscribe("cell-dblclick", this.cellContentsSelectionFixer.bind(this));
		this.subscribe("scroll-horizontal", this.clearTouchWatchers.bind(this));
		this.subscribe("scroll-vertical", this.clearTouchWatchers.bind(this));
	}

	clearTouchWatchers(){
		var types = Object.values(this.touchWatchers);

		types.forEach((type) => {
			for(let key in type){
				type[key] = null;
			}
		});
	}
		
	cellContentsSelectionFixer(e, cell){
		var range;

		if(this.table.modExists("edit")){
			if (this.table.modules.edit.currentCell === cell){
				return; //prevent instant selection of editor content
			}
		}

		e.preventDefault();

		try{
			if (document.selection) { // IE
				range = document.body.createTextRange();
				range.moveToElementText(cell.getElement());
				range.select();
			} else if (window.getSelection) {
				range = document.createRange();
				range.selectNode(cell.getElement());
				window.getSelection().removeAllRanges();
				window.getSelection().addRange(range);
			}
		}catch(e){}
	}

	initializeExternalEvents(){
		for(let key in this.eventMap){
			this.subscriptionChangeExternal(key, this.subscriptionChanged.bind(this, key));
		}
	}

	subscriptionChanged(key, added){
		if(added){
			if(!this.subscribers[key]){
				if(this.eventMap[key].includes("-")){
					this.subscribers[key] = this.handle.bind(this, key);
					this.subscribe(this.eventMap[key], this.subscribers[key]);
				}else{
					this.subscribeTouchEvents(key);
				}
			}
		}else{
			if(this.eventMap[key].includes("-")){
				if(this.subscribers[key] && !this.columnSubscribers[key]  && !this.subscribedExternal(key)){
					this.unsubscribe(this.eventMap[key], this.subscribers[key]);
					delete this.subscribers[key];
				}
			}else{
				this.unsubscribeTouchEvents(key);
			}
		}
	}


	subscribeTouchEvents(key){
		var type = this.eventMap[key];

		if(!this.touchSubscribers[type + "-touchstart"]){
			this.touchSubscribers[type + "-touchstart"] = this.handleTouch.bind(this, type, "start");
			this.touchSubscribers[type + "-touchend"] = this.handleTouch.bind(this, type, "end");

			this.subscribe(type + "-touchstart", this.touchSubscribers[type + "-touchstart"]);
			this.subscribe(type + "-touchend", this.touchSubscribers[type + "-touchend"]);
		}

		this.subscribers[key] = true;
	}

	unsubscribeTouchEvents(key){
		var noTouch = true,
		type = this.eventMap[key];

		if(this.subscribers[key] && !this.subscribedExternal(key)){
			delete this.subscribers[key];

			for(let i in this.eventMap){
				if(this.eventMap[i] === type){
					if(this.subscribers[i]){
						noTouch = false;
					}
				}
			}

			if(noTouch){
				this.unsubscribe(type + "-touchstart", this.touchSubscribers[type + "-touchstart"]);
				this.unsubscribe(type + "-touchend", this.touchSubscribers[type + "-touchend"]);

				delete this.touchSubscribers[type + "-touchstart"];
				delete this.touchSubscribers[type + "-touchend"];
			}
		}
	}

	initializeColumn(column){
		var def = column.definition;

		for(let key in this.eventMap){
			if(def[key]){
				this.subscriptionChanged(key, true);

				if(!this.columnSubscribers[key]){
					this.columnSubscribers[key] = [];
				}

				this.columnSubscribers[key].push(column);
			}
		}
	}

	handle(action, e, component){
		this.dispatchEvent(action, e, component);
	}

	handleTouch(type, action, e, component){
		var watchers = this.touchWatchers[type];

		if(type === "column"){
			type = "header";
		}

		switch(action){
			case "start":
				watchers.tap = true;

				clearTimeout(watchers.tapHold);

				watchers.tapHold = setTimeout(() => {
					clearTimeout(watchers.tapHold);
					watchers.tapHold = null;

					watchers.tap = null;
					clearTimeout(watchers.tapDbl);
					watchers.tapDbl = null;

					this.dispatchEvent(type + "TapHold", e,  component);
				}, 1000);
				break;

			case "end":
				if(watchers.tap){

					watchers.tap = null;
					this.dispatchEvent(type + "Tap", e,  component);
				}

				if(watchers.tapDbl){
					clearTimeout(watchers.tapDbl);
					watchers.tapDbl = null;

					this.dispatchEvent(type + "DblTap", e,  component);
				}else{
					watchers.tapDbl = setTimeout(() => {
						clearTimeout(watchers.tapDbl);
						watchers.tapDbl = null;
					}, 300);
				}

				clearTimeout(watchers.tapHold);
				watchers.tapHold = null;
				break;
		}
	}

	dispatchEvent(action, e, component){
		var componentObj = component.getComponent(),
		callback;

		if(this.columnSubscribers[action]){

			if(component instanceof Cell){
				callback = component.column.definition[action];
			}else if(component instanceof Column){
				callback = component.definition[action];
			}

			if(callback){
				callback(e, componentObj);
			}
		}

		this.dispatchExternal(action, e, componentObj);
	}
}