import CoreFeature from './CoreFeature.js';
import Helpers from './Helpers.js';

export default class InteractionManager extends CoreFeature {

	constructor (table){
		super(table);

		this.el = this.table.element;

		this.abortClasses = ["tabulator-headers", "tabulator-table"]

		this.trackClases = {
			"tabulator-cell":"cell",
			"tabulator-row":"row",
			"tabulator-col":"column",
			// "tabulator":false,
		};

		this.bindListeners();
	}

	bindListeners(){
		this.el.addEventListener("click", this.track.bind(this, "click"))
		this.el.addEventListener("dblclick", this.track.bind(this, "dblclick"))
		this.el.addEventListener("contextmenu", this.track.bind(this, "contextmenu"))
		// this.el.addEventListener("mouseenter", this.track.bind(this, "mouseenter"))
		// this.el.addEventListener("mouseleave", this.track.bind(this, "mouseleave"))
		// this.el.addEventListener("mouseover", this.track.bind(this, "mouseover"))
		// this.el.addEventListener("mouseout", this.track.bind(this, "mouseout"))
		// this.el.addEventListener("mousemove", this.track.bind(this, "mousemove"))
		// this.el.addEventListener("touchstart", this.track.bind(this, "touchstart"))
		// this.el.addEventListener("touchend", this.track.bind(this, "touchend"))

		//TODO - add composite events for tab, double tap and taphold
	}

	track(type, e){
		var targets = this.findTargets(e.path);
		targets = this.bindComponents(targets);
		this.triggerEvents(type, e, targets);
	}

	findTargets(path){
		var targets = {};

		let trackClasses = Object.keys(this.trackClases);

		for (let el of path) {
			let classList = el.classList ? [...el.classList] : [];

			let abort = classList.filter((item) => {
				return this.abortClasses.includes(item);
			})

			if(abort.length){
				break;
			}

			let elTargets = classList.filter((item) => {
				return trackClasses.includes(item);
			})

			for (let target of elTargets) {
				targets[this.trackClases[target]] = el;
			}
		}

		return targets;
	}

	bindComponents(targets){
		//ensure row component is looked up before cell
		var keys = Object.keys(targets).reverse();

		for(let key of keys){
			let component;
			let target = targets[key];

			switch(key){
				case "row":
					component = this.table.rowManager.findRow(target);
				break;

				case "column":
					component = this.table.columnManager.findColumn(target);
				break

				case "cell":
					component = targets["row"].findCell(target);
				break;
			}

			if(component){
				targets[key] = component;
			}
		}

		return targets;
	}

	triggerEvents(type, e, targets){
		for(let key in targets){
			this.dispatch(key + "-" + type, e, targets[key])
		}
	}
}