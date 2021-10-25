import CoreFeature from '../CoreFeature.js';
import Helpers from './Helpers.js';

export default class InteractionManager extends CoreFeature {

	constructor (table){
		super(table);

		this.el = this.table.element;

		this.abortClasses = ["tabulator-headers", "tabulator-table"];

		this.previousTargets = {};

		this.listeners = [
		"click",
		"dblclick",
		"contextmenu",
		"mouseenter",
		"mouseleave",
		"mouseover",
		"mouseout",
		"mousemove",
		"touchstart",
		"touchend",
		];

		this.componentMap = {
			"tabulator-cell":"cell",
			"tabulator-row":"row",
			"tabulator-group":"group",
			"tabulator-col":"column",
		};

		this.buildListenerMap();
		this.bindSubscriptionWatchers();
	}

	buildListenerMap(){
		var listenerMap = {};

		this.listeners.forEach((listener) => {
			listenerMap[listener] = {
				handler:null,
				components:[],
			}
		})

		this.listeners = listenerMap;
	}

	bindSubscriptionWatchers(){
		var listeners = Object.keys(this.listeners),
		components = Object.values(this.componentMap);

		for(let comp of components){
			for(let listener of listeners){
				let key = comp + "-" + listener;

				this.subscriptionChange(key, this.subscriptionChanged.bind(this, comp, listener));
			}
		}
	}

	subscriptionChanged(component, key, added){
		var listener = this.listeners[key].components,
		index = listener.indexOf(component),
		changed = false;

		if(added){
			if(index === -1){
				listener.push(component);
				changed = true;
			}
		}else{
			if(!this.subscribed(component + "-" + key)){
				if(index > -1){
					listener.splice(index, 1);
					changed = true;
				}
			}
		}

		if(changed){
			this.updateEventListeners();
		}
	}

	updateEventListeners(){
		for(let key in this.listeners){
			let listener = this.listeners[key];

			if(listener.components.length){
				if(!listener.handler){
					listener.handler = this.track.bind(this, key);
					this.el.addEventListener(key, listener.handler)
					console.log("add", key)
					// this.el.addEventListener(key, listener.handler, {passive: true})
				}
			}else{
				if(listener.handler){
					this.el.removeEventListener(key, listener.handler)
					listener.handler = null;
				}
			}
		}
	}

	track(type, e){
		var path = (e.composedPath && e.composedPath()) || e.path;
		var targets = this.findTargets(path);
		targets = this.bindComponents(type, targets);
		this.triggerEvents(type, e, targets);
	}

	findTargets(path){
		var targets = {};

		let componentMap = Object.keys(this.componentMap);

		for (let el of path) {
			let classList = el.classList ? [...el.classList] : [];

			let abort = classList.filter((item) => {
				return this.abortClasses.includes(item);
			})

			if(abort.length){
				break;
			}

			let elTargets = classList.filter((item) => {
				return componentMap.includes(item);
			})

			for (let target of elTargets) {
				targets[this.componentMap[target]] = el;
			}
		}

		if(targets.group && targets.group === targets.row){
			delete targets.row;
		}

		return targets;
	}

	bindComponents(type, targets){
		//ensure row component is looked up before cell
		var keys = Object.keys(targets).reverse(),
		listener = this.listeners[type],
		targetMatches = {};

		for(let key of keys){
			let component;
			let target = targets[key];
			let previousTarget = this.previousTargets[key];

			if(previousTarget && previousTarget.target === target){
				component = previousTarget.component;
			}else{
				switch(key){
					case "row":
					case "group":
					if(listener.components.includes("row") || listener.components.includes("cell")){
						let rows = this.table.rowManager.getVisibleRows();

						component = rows.find((row) => {
							return row.getElement() === target;
						});
					}
					break;

					case "column":
					if(listener.components.includes("column")){
						component = this.table.columnManager.findColumn(target);
					}
					break

					case "cell":
					if(listener.components.includes("cell")){
						component = targets["row"].findCell(target);
					}
					break;
				}
			}

			if(component){
				targets[key] = component;
				targetMatches[key] = {
					target:target,
					component:component,
				}
			}
		}

		this.previousTargets = targetMatches;

		return targets;
	}

	triggerEvents(type, e, targets){
		var listener = this.listeners[type];

		for(let key in targets){
			if(targets[key] && listener.components.includes(key)){
				this.dispatch(key + "-" + type, e, targets[key]);
			}
		}
	}
}