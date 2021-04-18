export default class InternalEventBus {

	constructor(debug){
		this.events = {};
		this.subscriptionNotifiers = {};

		this.dispatch = debug ? this._debugDispatch.bind(this) : this._dispatch.bind(this);
	}

	subscriptionChange(key, callback){
		if(!this.subscriptionNotifiers[key]){
			this.subscriptionNotifiers[key] = [];
		}

		this.subscriptionNotifiers[key].push(callback);

		if(this.subscribed(key)){
			this._notifiySubscriptionChange(key, true);
		}
	}

	subscribe(key, callback, priority = 10000){
		if(!this.events[key]){
			this.events[key] = [];
		}

		this.events[key].push({callback, priority});

		this.events[key].sort((a, b) => {
			return a.priority - b.priority;
		});

		this._notifiySubscriptionChange(key, true);
	}

	unsubscribe(key, callback){
		var index;

		if(this.events[key]){
			if(callback){
				index = this.events[key].findIndex((item) => {
					return item.callback === callback;
				});

				if(index > -1){
					this.events[key].splice(index, 1);
				}else{
					console.warn("Cannot remove event, no matching event found:", key, callback);
					return;
				}
			}
		}else{
			console.warn("Cannot remove event, no events set on:", key);
			return;
		}

		this._notifiySubscriptionChange(key, false);
	}

	subscribed(key){
		return this.events[key] && this.events[key].length;
	}

	chain(key, args, initialValue, fallback){
		var value = initialValue;

		if(!Array.isArray(args)){
			args = [args];
		}

		if(this.subscribed(key)){
			this.events[key].forEach((subscriber, i) => {
				value = subscriber.callback.apply(this, args.concat([value]));
			});

			return value;
		}else{
			return typeof fallback === "function" ? fallback() : fallback;
		}
	}

	confirm(key, args){
		var confirmed = false;

		if(!Array.isArray(args)){
			args = [args];
		}

		if(this.subscribed(key)){
			this.events[key].forEach((subscriber, i) => {
				if(subscriber.callback.apply(this, args)){
					confirmed = true;
				}
			});
		}

		return confirmed;
	}

	_notifiySubscriptionChange(key, subscribed){
		var notifiers = this.subscriptionNotifiers[key];

		if(notifiers){
			notifiers.forEach((callback)=>{
				callback(subscribed);
			});
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