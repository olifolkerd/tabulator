//tabulator with all modules installed
import {default as Tabulator} from './Tabulator.js';
import * as allModules from '../core/modules/optional.js';

class TabulatorFull extends Tabulator {
	static extendModule(){
		Tabulator.initializeModuleBinder(allModules);
		Tabulator._extendModule(...arguments);
	}

	static registerModule(){
		Tabulator.initializeModuleBinder(allModules);
		Tabulator._registerModule(...arguments);
	}

	constructor(element, options, modules){
		super(element, options, allModules);
	}
}

export default TabulatorFull;
