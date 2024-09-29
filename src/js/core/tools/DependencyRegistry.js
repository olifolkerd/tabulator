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
	
	lookup(key, prop, silent){
		if(Array.isArray(key)){
			for (const item of key) {
				var match = this.lookup(item, prop, true);

				if(match){
					break;
				}
			}

			if(match){
				return match;
			}else{
				this.error(key);
			}
		}else{
			if(prop){
				return this.lookupProp(key, prop, silent);
			}else{
				return this.lookupKey(key, silent);
			}
		}
	}
	
	lookupProp(key, prop, silent){
		var dependency;
		
		if(this.props[key] && this.props[key][prop]){
			return this.props[key][prop];
		}else{
			dependency = this.lookupKey(key, silent);
			
			if(dependency){
				if(!this.props[key]){
					this.props[key] = {};
				}
				
				this.props[key][prop] = dependency[prop] || dependency;
				return this.props[key][prop];
			}
		}
	}
	
	lookupKey(key, silent){
		var dependency;
		
		if(this.deps[key]){
			dependency = this.deps[key];
		}else if(window[key]){
			this.deps[key] = window[key];
			dependency = this.deps[key];
		}else{
			if(!silent){
				this.error(key);
			}
		}
		
		return dependency;
	}

	error(key){
		console.error("Unable to find dependency", key, "Please check documentation and ensure you have imported the required library into your project");
	}
}