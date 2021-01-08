import Tabulator from './core/Tabulator.js';
import modules from './modules.js';

(function (global, factory) {
	if(typeof exports === 'object' && typeof module !== 'undefined'){
		module.exports = factory();
	}else if(typeof define === 'function' && define.amd){
		define(factory);
	}else{
		global.Tabulator = factory();
	}
}(this, (function () {
	Tabulator.registerModule(modules);

	return Tabulator;
})));