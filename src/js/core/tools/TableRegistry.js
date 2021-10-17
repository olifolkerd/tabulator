import Tabulator from '../Tabulator.js';

class TableRegistry {

	static register(table){
		TableRegistry.tables.push(table);
	}

	static deregister(table){
		var index = TableRegistry.tables.indexOf(table);

		if(index > -1){
			TableRegistry.tables.splice(index, 1);
		}
	}

	static lookupTable(query, silent){
		var results = [],
		matches, match;

		if(typeof query === "string"){
			matches = document.querySelectorAll(query);

			if(matches.length){
				for(var i = 0; i < matches.length; i++){
					match = TableRegistry.matchElement(matches[i]);

					if(match){
						results.push(match);
					}
				}
			}

		}else if((typeof HTMLElement !== "undefined" && query instanceof HTMLElement) || query instanceof Tabulator){
			match = TableRegistry.matchElement(query);

			if(match){
				results.push(match);
			}
		}else if(Array.isArray(query)){
			query.forEach(function(item){
				results = results.concat(TableRegistry.lookupTable(item));
			});
		}else{
			if(!silent){
				console.warn("Table Connection Error - Invalid Selector", query);
			}
		}

		return results;
	}

	static matchElement(element){
		return TableRegistry.tables.find(function(table){
			return element instanceof Tabulator ? table === element : table.element === element;
		});
	}
}

TableRegistry.tables = [];

export default TableRegistry;