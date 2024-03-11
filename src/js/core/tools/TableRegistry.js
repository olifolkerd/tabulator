export default class TableRegistry {
	static registry = {
		tables:[],
		
		register(table){
			TableRegistry.registry.tables.push(table);
		},
		
		deregister(table){
			var index = TableRegistry.registry.tables.indexOf(table);
			
			if(index > -1){
				TableRegistry.registry.tables.splice(index, 1);
			}
		},
		
		lookupTable(query, silent){
			var results = [],
			matches, match;
			
			if(typeof query === "string"){
				matches = document.querySelectorAll(query);
				
				if(matches.length){
					for(var i = 0; i < matches.length; i++){
						match = TableRegistry.registry.matchElement(matches[i]);
						
						if(match){
							results.push(match);
						}
					}
				}
				
			}else if((typeof HTMLElement !== "undefined" && query instanceof HTMLElement) || query instanceof TableRegistry){
				match = TableRegistry.registry.matchElement(query);
				
				if(match){
					results.push(match);
				}
			}else if(Array.isArray(query)){
				query.forEach(function(item){
					results = results.concat(TableRegistry.registry.lookupTable(item));
				});
			}else{
				if(!silent){
					console.warn("Table Connection Error - Invalid Selector", query);
				}
			}
			
			return results;
		},
		
		matchElement(element){
			return TableRegistry.registry.tables.find(function(table){
				return element instanceof TableRegistry ? table === element : table.element === element;
			});
		}
	};

		
	static findTable(query){
		var results = TableRegistry.registry.lookupTable(query, true);
		return Array.isArray(results) && !results.length ? false : results;
	}
}