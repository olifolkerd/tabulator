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
			rowTap:"row",
			rowDblTap:"row",
			rowTapHold:"row",
		}

		this.subscribers = {};

		this.touchSubscribers = {};

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
			}
		}

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
				if(this.eventMap[key].includes("-")){
					this.subscribers[key] = this.handle.bind(this, key);
					this.subscribe(this.eventMap[key], this.subscribers[key]);
				}else{
					this.subscribeTouchEvents(key);
				}

			}
		}else{
			if(this.eventMap[key].includes("-")){
				if(this.subscribers[key] && !this.table.options[key]  && !this.subscribedExternal(key)){
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
		var notouch = true,
		type = this.eventMap[key];

		if(this.subscribers[key] && !this.table.options[key]  && !this.subscribedExternal(key)){
			delete this.subscribers[key];

			for(let i in this.eventMap){
				if(this.eventMap[i] === type){
					if(this.subscribers[i]){
						notouch = false;
					}
				}
			}

			if(notouch){
				this.unsubscribe(type + "-touchstart", this.touchSubscribers[type + "-touchstart"]);
				this.unsubscribe(type + "-touchend", this.touchSubscribers[type + "-touchend"]);

				delete this.touchSubscribers[type + "-touchstart"];
				delete this.touchSubscribers[type + "-touchend"];
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

	handleTouch(type, action, e, component){
		var watchers = this.touchWatchers[type];

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

				this.dispatchExternal(type + "TapHold", e,  component.getComponent());
			}, 1000);
			break;

			case "end":
			if(watchers.tap){

				watchers.tap = null;
				this.dispatchExternal(type + "Tap", e,  component.getComponent());
			}

			if(watchers.tapDbl){
				clearTimeout(watchers.tapDbl);
				watchers.tapDbl = null;

				this.dispatchExternal(type + "DblTap", e,  component.getComponent());
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