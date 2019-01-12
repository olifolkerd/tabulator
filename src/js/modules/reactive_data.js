var ReactiveData = function(table){
	this.table = table; //hold Tabulator object
	this.data = false;
	this.blocked = false; //block reactivity while performing update
	this.origFuncs = {}; // hold original data array functions to allow replacement after data is done with
};

ReactiveData.prototype.watchData = function(data){
	var self = this,
	pushFunc;

	self.unwatchData();

	self.data = data;

	//override array push function
	self.origFuncs.push = data.push;

	Object.defineProperty(self.data, "push", {
		enumerable: false,
		value: function () {
			var args = Array.from(arguments);

			if(!self.blocked){
				args.forEach(function (arg){
					self.table.rowManager.addRowActual(arg, false);
				});
			}

			return self.origFuncs.push.apply(data, arguments);
		}
	});

	//override array unshift function
	self.origFuncs.unshift = data.unshift;

	Object.defineProperty(self.data, "unshift", {
		enumerable: false,
		value: function () {
			var args = Array.from(arguments);

			if(!self.blocked){
				args.forEach(function (arg){
					self.table.rowManager.addRowActual(arg, true);
				});
			}

			return self.origFuncs.unshift.apply(data, arguments);
		}
	});


	//override array shift function
	self.origFuncs.shift = data.shift;

	Object.defineProperty(self.data, "shift", {
		enumerable: false,
		value: function () {
			var row;

			if(!self.blocked){
				if(self.data.length){
					row = self.table.rowManager.getRowFromDataObject(self.data[0]);

					if(row){
						row.deleteActual();
					}
				}
			}

			return self.origFuncs.shift.call(data);
		}
	});

	//override array pop function
	self.origFuncs.pop = data.pop;

	Object.defineProperty(self.data, "pop", {
		enumerable: false,
		value: function () {
			var row;
			if(!self.blocked){
				if(self.data.length){
					row = self.table.rowManager.getRowFromDataObject(self.data[self.data.length - 1]);

					if(row){
						row.deleteActual();
					}
				}
			}
			return self.origFuncs.pop.call(data);
		}
	});
};

ReactiveData.prototype.unwatchData = function(){
	if(this.data !== false){
		for(var key in this.origFuncs){
			Object.defineProperty(self.data, key, {
				enumerable: false,
				value: origFuncs.push,
			});
		}
	}
};

ReactiveData.prototype.watchRow = function(row){
	var self = this,
	data = row.getData();

	this.blocked = true;

	for(var key in data){
		this.watchKey(row, data, key);
	}

	this.blocked = false;
};

ReactiveData.prototype.watchKey = function(row, data, key){
	var self = this,
	value = data[key];

	Object.defineProperty(data, key, {
		set: function(newValue){
			value = newValue;

			if(!self.blocked){
				var update = {};
				update[key] = newValue;
				row.updateData(update);
			}
		},
		get:function(){
			return value;
		}
	});
};

ReactiveData.prototype.unwatchRow = function(row){
	var data = row.getData();

	for(var key in data){
		Object.defineProperty(data, key, {
			value:data[key],
		});
	}
};

ReactiveData.prototype.block = function(){
	this.blocked = true;
};

ReactiveData.prototype.unblock = function(){
	this.blocked = false;
};

Tabulator.prototype.registerModule("reactiveData", ReactiveData);



