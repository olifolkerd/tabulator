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

		this.el.addEventListener("click", this.track.bind(this, "click"))
	}

	track(type, e){
		var targets = this.findTargets(e.path);
		console.log("interactions", targets)
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
}