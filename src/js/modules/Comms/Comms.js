import Module from '../../core/Module.js';
import TableRegistry from '../../core/TableRegistry.js';

class Comms extends Module{

	static moduleName = "comms";

	getConnections(selectors){
		var self = this,
		connections = [],
		connection;

		connection = Tabulator.comms.lookupTable(selectors);

		connection.forEach(function(con){
			if(self.table !== con){
				connections.push(con);
			}
		});

		return connections;
	}

	send(selectors, module, action, data){
		var self = this,
		connections = this.getConnections(selectors);

		connections.forEach(function(connection){
			connection.tableComms(self.table.element, module, action, data);
		});

		if(!connections.length && selectors){
			console.warn("Table Connection Error - No tables matching selector found", selectors);
		}
	}

	receive(table, module, action, data){
		if(this.table.modExists(module)){
			return this.table.modules[module].commsReceived(table, action, data);
		}else{
			console.warn("Inter-table Comms Error - no such module:", module);
		}
	}
}

export default Comms;