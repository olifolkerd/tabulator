export default class EventBus {

	constructor(table){
		this.events = {};
		this.table = table;
	}

	on(key, callback){
		if(!this.events[key]){
			this.events[key] = [];
		}

		this.events[key].push(callback)
	}

	off(key, callback){
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

	trigger(){
		var args = Array.from(arguments),
		key = args.shift();

		if(this.events[key]){
			this.events[key].forEach((callback) => {
				callback.apply(this, args);
			});
		}

		if(typeof this.table.options[key] === "function"){
			this.table.options[key].apply(this, args);
		}
	}
}