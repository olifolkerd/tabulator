export default class EventBus {

	constructor(optionsList){
		this.events = {};
		this.optionsList = optionsLis || {};
	}

	subscribe(key, callback){
		if(!this.events[key]){
			this.events[key] = [];
		}

		this.events[key].push(callback)
	}

	unsubscribe(key, callback){
		var index;

		if(this.events[key]){
			if(callback){
				index = this.events[key].indexOf(callback);

				if(index > -1){
					this.events[key].splice(index, 1);
				}else{
					console.warn("Cannot remove event, no matching event found:", key, callback);
				}
			}else{
				delete this.events[key];
			}
		}else{
			console.warn("Cannot remove event, no events set on:", key);
		}
	}

	subscribed(key){
		return this.optionsList[key] || (this.events[key] && this.events[key].length);
	}

	dispatch(){
		var args = Array.from(arguments),
		key = args.shift(),
		result;

		if(this.events[key]){
			this.events[key].forEach((callback, i) => {
				let callResult = callback.apply(this, args);

				if(!i){
					result = callResult;
				}
			});
		}

		if(typeof this.optionsList[key] === "function"){
			result = this.optionsList[key].apply(this, args);
		}

		return result;
	}
}