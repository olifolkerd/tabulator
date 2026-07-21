export default class ExternalEventBus {

	constructor(table, optionsList, debug){
		this.table = table;
		this.events = {};
		this.optionsList = optionsList || {};
		this.subscriptionNotifiers = {};

		this.dispatch = debug ? this._debugDispatch.bind(this) : this._dispatch.bind(this);
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

	subscribe(key, callback){
		if(!this.events[key]){
			this.events[key] = [];
		}

		this.events[key].push(callback);

		this._notifySubscriptionChange(key, true);
	}

	unsubscribe(key, callback){
		var index;

		if(this.events[key]){
			if(callback){
				index = this.events[key].findIndex((item) => {
					return item === callback;
				});

				if(index > -1){
					this.events[key].splice(index, 1);
				}else{
					console.warn("Cannot remove event, no matching event found:", key, callback);
					return;
				}
			}else{
				delete this.events[key];
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
		const len = subs?.length;
		if(len){
			const result = subs[0].apply(this.table, args);
			
			for(let i = 1; i < len; i++){
				subs[i].apply(this.table, args);
			}
			
			return result;
		}
	}

	_debugDispatch(key, ...args){
		if(this.debug === true || this.debug.includes(key)){
			const debugArgs = ["ExternalEvent:" + key, ...args];
			console.log(...debugArgs);
		}

		return this._dispatch(key, ...args);
	}
}
