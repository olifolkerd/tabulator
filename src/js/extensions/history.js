var History = function(table){
	this.table = table; //hold Tabulator object

	this.history = [];
	this.index = 0;
};


History.prototype.clear = function(){
	this.history = [];
	this.index = 0;
};

History.prototype.add = function(type, element, oldVal, newVal){

};

History.prototype.undo = function(){

};

history.prototype.redo = function(){

};


Tabulator.registerExtension("history", History);