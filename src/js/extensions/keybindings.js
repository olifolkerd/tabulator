var Keybindings = function(table){
	this.table = table; //hold Tabulator object
};


//default accessors
Keybindings.prototype.actions = {

};


Tabulator.registerExtension("keybindings", Keybindings);