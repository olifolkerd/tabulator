import CoreFeature from '../CoreFeature.js';

export default class DependencyRegistry extends CoreFeature{
	
	constructor(table){
		super(table);
		
		this.deps = {};
	}
	
	initialize(){
		this.deps = Object.assign({}, this.options("dependencies"));
	}
	
	lookup(key){
		if(this.deps[key]){
			return this.deps[key];
		}else if(window[key]){
			this.deps[key] = window[key];
			return this.deps[key];
		}
		
		console.error("Unable to find dependency", key, "Please check documentation and ensure you have imported the required library into your project");
	}
}