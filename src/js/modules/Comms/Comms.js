import Module from '../../core/Module.js';

export default class Comms extends Module{

	static moduleName = "comms";

	constructor(table){
		super(table);
	}

	initialize(){
		this.registerTableFunction("tableComms", this.receive.bind(this));
	}

	getConnections(selectors){
		var connections = [],
		connection;

		connection = this.table.constructor.registry.lookupTable(selectors);

		connection.forEach((con) =>{
			if(this.table !== con){
				connections.push(con);
			}
		});

		return connections;
	}

	send(selectors, module, action, data){
		var connections = this.getConnections(selectors);

		connections.forEach((connection) => {
			connection.tableComms(this.table.element, module, action, data);
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