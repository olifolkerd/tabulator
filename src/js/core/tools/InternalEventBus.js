export default class InternalEventBus {

	constructor(debug){
		this.events = {};
		this.subscriptionNotifiers = {};

		this.dispatch = debug ? this._debugDispatch.bind(this) : this._dispatch.bind(this);
		this.chain = debug ? this._debugChain.bind(this) : this._chain.bind(this);
		this.confirm = debug ? this._debugConfirm.bind(this) : this._confirm.bind(this);
		this.debug = debug;
	}

	subscriptionChange(key, callback){
		if(!this.subscriptionNotifiers[key]){
			this.subscriptionNotifiers[key] = [];
		}

		this.subscriptionNotifiers[key].push(callback);

		if(this.subscribed(key)){
			this._notifySubscriptionChange(key, true);
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

		this._notifySubscriptionChange(key, true);
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

		this._notifySubscriptionChange(key, false);
	}

	subscribed(key){
		return this.events[key] && this.events[key].length;
	}

	_chain(key, args, initialValue, fallback){
		const subs = this.events[key];

		if(subs && subs.length){
			if(!Array.isArray(args)){
				args = [args];
			}

			//reuse a single args array across subscribers, mutating only the trailing
			//accumulator slot, instead of allocating a fresh concat per subscriber
			const callArgs = args.slice();
			const valueIndex = callArgs.length;
			let value = initialValue;

			for(let i = 0; i < subs.length; i++){
				callArgs[valueIndex] = value;
				value = subs[i].callback.apply(this, callArgs);
			}

			return value;
		}

		return typeof fallback === "function" ? fallback() : fallback;
	}

	_confirm(key, args){
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

	_notifySubscriptionChange(key, subscribed){
		var notifiers = this.subscriptionNotifiers[key];

		if(notifiers){
			notifiers.forEach((callback)=>{
				callback(subscribed);
			});
		}
	}

	_dispatch(key, ...args){
		const subs = this.events[key];
		if(subs){
			for(const subscriber of subs){
				subscriber.callback.apply(this, args);
			}
		}
	}

	_debugDispatch(key, ...args){
		if(this.debug === true || this.debug.includes(key)){
			const debugArgs = ["InternalEvent:" + key, ...args];
			console.log(...debugArgs);
		}

		return this._dispatch(key, ...args);
	}

	_debugChain(key, args, initialValue, fallback){
		if(this.debug === true || this.debug.includes(key)){
			const debugArgs = ["InternalEvent:" + key, args, initialValue, fallback];
			console.log(...debugArgs);
		}

		return this._chain(key, args, initialValue, fallback);
	}

	_debugConfirm(key, args){
		if(this.debug === true || this.debug.includes(key)){
			const debugArgs = ["InternalEvent:" + key, args];
			console.log(...debugArgs);
		}

		return this._confirm(key, args);
	}
}
