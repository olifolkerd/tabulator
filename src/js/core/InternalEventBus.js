export default class InternalEventBus {

	constructor(debug){
		this.events = {};

		this.dispatch = debug ? this._debugDispatch.bind(this) : this._dispatch.bind(this);
	}

	subscribe(key, callback, priority = 10000){
		if(!this.events[key]){
			this.events[key] = [];
		}

		this.events[key].push({callback, priority});

		this.events[key].sort((a, b) => {
			return a.priority - b.priority;
		});
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
		return this.events[key] && this.events[key].length;
	}

	chain(key, args, fallback){
		var value;

		// console.log("InternalEvent:" + key, args);

		if(!Array.isArray(args)){
			args = [args];
		}

		if(this.subscribed(key)){
			this.events[key].forEach((subscriber, i) => {
				value = subscriber.callback.apply(this, (i ? args.concat([value]) : args));
			});

			return value;
		}else{
			return typeof fallback === "function" ? fallback() : fallback;
		}
	}

	_dispatch(){
		var args = Array.from(arguments),
		key = args.shift();

		if(this.events[key]){
			this.events[key].forEach((subscriber) => {
				let callResult = subscriber.callback.apply(this, args);
			});
		}
	}

	_debugDispatch(){
		var args = Array.from(arguments);
		args[0] = "InternalEvent:" + args[0];

		console.log(...args);

		return this._dispatch(...arguments)
	}
}