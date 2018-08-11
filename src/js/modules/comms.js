var Comms = function(table){
	this.table = table;
};


Comms.prototype.getConnections = function(selectors){
	var self = this,
	connections = [],
	connection;

	if(Array.isArray(selectors)){
		connections = selectors;
	}else{
		connection = typeof selectors == "string" ?  $(selectors) : selectors;

		connection.each(function(){
			if(self.table.element !== this){
				connections.push($(this));
			}
		});
	}

	return connections;
}

Comms.prototype.send = function(selectors, module, action, data){
	var self = this,
	connections = this.getConnections(selectors);

	connections.forEach(function(connection){
		connection.tabulator("tableComms", self.table.element, module, action, data);
	});

	if(!connections.length && selectors){
		console.warn("Table Connection Error - No tables matching selector found", selectors);
	}
}


Comms.prototype.receive = function(table, module, action, data){
	if(this.table.modExists(module)){
		return this.table.modules[module].commsReceived(table, action, data);
	}else{
		console.warn("Inter-table Comms Error - no such module:", module);
	}
}


Tabulator.prototype.registerModule("comms", Comms);