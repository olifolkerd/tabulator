import CoreFeature from '../CoreFeature.js';

export default class DependencyRegistry extends CoreFeature{
	
	constructor(table){
		super(table);
		
		this.deps = {};

		this.props = {

		};
	}
	
	initialize(){
		this.deps = Object.assign({}, this.options("dependencies"));
	}
	
	lookup(key, prop){
		if(prop){
			return this.lookupProp(key, prop);
		}else{
			return this.lookupKey(key);
		}
	}

	lookupProp(key, prop){
		var dependency;

		if(this.props[key] && this.props[key][prop]){
			return this.props[key][prop];
		}else{
			dependency = this.lookupKey(key);

			if(dependency){
				if(!this.props[key]){
					this.props[key] = {};
				}
				
				this.props[key][prop] = dependency[prop] || dependency;
				return this.props[key][prop];
			}
		}
	}

	lookupKey(key){
		var dependency;

		if(this.deps[key]){
			dependency = this.deps[key];
		}else if(window[key]){
			this.deps[key] = window[key];
			dependency = this.deps[key];
		}else{
			console.error("Unable to find dependency", key, "Please check documentation and ensure you have imported the required library into your project");
		}

		return dependency;
	}
}