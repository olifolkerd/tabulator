import Module from '../../core/Module.js';

export default class ReactiveData extends Module{

	static moduleName = "reactiveData";
	
	constructor(table){
		super(table);
		
		this.data = false;
		this.blocked = false; //block reactivity while performing update
		this.origFuncs = {}; // hold original data array functions to allow replacement after data is done with
		this.currentVersion = 0;
		
		this.registerTableOption("reactiveData", false); //enable data reactivity
	}
	
	initialize(){
		if(this.table.options.reactiveData){
			this.subscribe("cell-value-save-before", this.block.bind(this, "cellsave"));
			this.subscribe("cell-value-save-after", this.unblock.bind(this, "cellsave"));
			this.subscribe("row-data-save-before", this.block.bind(this, "rowsave"));
			this.subscribe("row-data-save-after", this.unblock.bind(this, "rowsave"));
			this.subscribe("row-data-init-after", this.watchRow.bind(this));
			this.subscribe("data-processing", this.watchData.bind(this));
			this.subscribe("table-destroy", this.unwatchData.bind(this));
		}
	}
	
	watchData(data){
		var self = this,
		version;
		
		this.currentVersion ++;
		
		version = this.currentVersion;
		
		this.unwatchData();
		
		this.data = data;

		//hold a reference to the instance methods so they can be restored in unwatchData.
		//note: the actual array mutation below is performed via the native Array.prototype
		//methods rather than these captured references. On framework reactive arrays (e.g.
		//Vue 3) reading data.push returns an instrumented method that re-dispatches through
		//this overridden property, which - while reactivity is blocked - would silently drop
		//the underlying mutation and leave the array out of sync with the table (issue #4212).

		//override array push function
		this.origFuncs.push = data.push;
		
		Object.defineProperty(this.data, "push", {
			enumerable: false,
			configurable: true,
			value: function(){
				var args = Array.from(arguments),
				result;

				if(!self.blocked && version === self.currentVersion){	
					self.block("data-push");

					args.forEach((arg) => {
						self.table.rowManager.addRowActual(arg, false);
					});
					
					result = Array.prototype.push.apply(data, arguments);

					self.unblock("data-push");
				}
				
				return result;
			}
		});
		
		//override array unshift function
		this.origFuncs.unshift = data.unshift;
		
		Object.defineProperty(this.data, "unshift", {
			enumerable: false,
			configurable: true,
			value: function(){
				var args = Array.from(arguments),
				result;
				
				if(!self.blocked && version === self.currentVersion){
					self.block("data-unshift");
					
					args.forEach((arg) => {
						self.table.rowManager.addRowActual(arg, true);
					});
					
					result = Array.prototype.unshift.apply(data, arguments);

					self.unblock("data-unshift");
				}
				
				return result;
			}
		});
		
		
		//override array shift function
		this.origFuncs.shift = data.shift;
		
		Object.defineProperty(this.data, "shift", {
			enumerable: false,
			configurable: true,
			value: function(){
				var row, result;
				
				if(!self.blocked && version === self.currentVersion){
					self.block("data-shift");
					
					if(self.data.length){
						row = self.table.rowManager.getRowFromDataObject(self.data[0]);
						
						if(row){
							row.deleteActual();
						}
					}

					result = Array.prototype.shift.call(data);

					self.unblock("data-shift");
				}
				
				return result;
			}
		});
		
		//override array pop function
		this.origFuncs.pop = data.pop;
		
		Object.defineProperty(this.data, "pop", {
			enumerable: false,
			configurable: true,
			value: function(){
				var row, result;
			
				if(!self.blocked && version === self.currentVersion){
					self.block("data-pop");
					
					if(self.data.length){
						row = self.table.rowManager.getRowFromDataObject(self.data[self.data.length - 1]);
						
						if(row){
							row.deleteActual();
						}
					}

					result = Array.prototype.pop.call(data);

					self.unblock("data-pop");
				}

				return result;
			}
		});
		
		
		//override array splice function
		this.origFuncs.splice = data.splice;
		
		Object.defineProperty(this.data, "splice", {
			enumerable: false,
			configurable: true,
			value: function(){
				var args = Array.from(arguments),
				start = args[0] < 0 ? data.length + args[0] : args[0],
				end = args[1],
				newRows = args[2] ? args.slice(2) : false,
				startRow, result;
				
				if(!self.blocked && version === self.currentVersion){
					self.block("data-splice");
					//add new rows
					if(newRows){
						startRow = data[start] ? self.table.rowManager.getRowFromDataObject(data[start]) : false;
						
						if(startRow){
							newRows.forEach((rowData) => {
								self.table.rowManager.addRowActual(rowData, true, startRow, true);
							});
						}else{
							newRows = newRows.slice().reverse();
							
							newRows.forEach((rowData) => {
								self.table.rowManager.addRowActual(rowData, true, false, true);
							});
						}
					}
					
					//delete removed rows
					if(end !== 0){
						var oldRows = data.slice(start, typeof args[1] === "undefined" ? args[1] : start + end);
						
						oldRows.forEach((rowData, i) => {
							var row = self.table.rowManager.getRowFromDataObject(rowData);
							
							if(row){
								row.deleteActual(i !== oldRows.length - 1);
							}
						});
					}
					
					if(newRows || end !== 0){
						self.table.rowManager.reRenderInPosition();
					}

					result = Array.prototype.splice.apply(data, arguments);

					self.unblock("data-splice");
				}
				
				return result ;
			}
		});
	}
	
	unwatchData(){
		if(this.data !== false){
			for(var key in this.origFuncs){
				Object.defineProperty(this.data, key, {
					enumerable: true,
					configurable:true,
					writable:true,
					value: this.origFuncs[key],
				});
			}
		}
	}
	
	watchRow(row){
		var data = row.getData();
		
		for(var key in data){
			this.watchKey(row, data, key);
		}
		
		if(this.table.options.dataTree){
			this.watchTreeChildren(row);
		}
	}
	
	watchTreeChildren (row){
		var self = this,
		childField = row.getData()[this.table.options.dataTreeChildField];

		//note: the actual array mutation below is performed via the native Array.prototype
		//methods. Reading childField.push on a framework reactive array (e.g. Vue 3) returns
		//an instrumented method that re-dispatches through this overridden property; while
		//reactivity is blocked that would silently drop the mutation and desync the child
		//array from the table (issue #4212). Regular functions (not arrows) are required so
		//that `arguments` refers to the call's arguments rather than watchTreeChildren's.

		if(childField){

			Object.defineProperty(childField, "push", {
				enumerable: false,
				configurable: true,
				value: function(){
					var result;

					if(!self.blocked){
						self.block("tree-push");

						result = Array.prototype.push.apply(childField, arguments);
						self.rebuildTree(row);

						self.unblock("tree-push");
					}

					return result;
				}
			});

			Object.defineProperty(childField, "unshift", {
				enumerable: false,
				configurable: true,
				value: function(){
					var result;

					if(!self.blocked){
						self.block("tree-unshift");

						result = Array.prototype.unshift.apply(childField, arguments);
						self.rebuildTree(row);

						self.unblock("tree-unshift");
					}

					return result;
				}
			});

			Object.defineProperty(childField, "shift", {
				enumerable: false,
				configurable: true,
				value: function(){
					var result;

					if(!self.blocked){
						self.block("tree-shift");

						result = Array.prototype.shift.call(childField);
						self.rebuildTree(row);

						self.unblock("tree-shift");
					}

					return result;
				}
			});

			Object.defineProperty(childField, "pop", {
				enumerable: false,
				configurable: true,
				value: function(){
					var result;

					if(!self.blocked){
						self.block("tree-pop");

						result = Array.prototype.pop.call(childField);
						self.rebuildTree(row);

						self.unblock("tree-pop");
					}

					return result;
				}
			});

			Object.defineProperty(childField, "splice", {
				enumerable: false,
				configurable: true,
				value: function(){
					var result;

					if(!self.blocked){
						self.block("tree-splice");

						result = Array.prototype.splice.apply(childField, arguments);
						self.rebuildTree(row);

						self.unblock("tree-splice");
					}

					return result;
				}
			});
		}
	}
	
	rebuildTree(row){
		this.table.modules.dataTree.initializeRow(row);
		this.table.modules.dataTree.layoutRow(row);
		this.table.rowManager.refreshActiveData("tree", false, true);
	}
	
	watchKey(row, data, key){
		var self = this,
		props = Object.getOwnPropertyDescriptor(data, key),
		value = data[key],
		version = this.currentVersion;
		
		Object.defineProperty(data, key, {
			set: (newValue) => {
				value = newValue;
				if(!self.blocked && version === self.currentVersion){
					self.block("key");
					
					var update = {};
					update[key] = newValue;
					row.updateData(update);
					
					self.unblock("key");
				}
				
				if(props.set){
					props.set(newValue);
				}
			},
			get:() => {
				
				if(props.get){
					props.get();
				}
				
				return value;
			}
		});
	}
	
	unwatchRow(row){
		var data = row.getData();
		
		for(var key in data){
			Object.defineProperty(data, key, {
				value:data[key],
			});
		}
	}
	
	block(key){
		if(!this.blocked){
			this.blocked = key;
		}
	}
	
	unblock(key){
		if(this.blocked === key){
			this.blocked = false;
		}
	}
}
