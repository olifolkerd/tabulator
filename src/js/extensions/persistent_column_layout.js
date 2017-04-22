var PersistentColumnLayout = function(table){

	var extension = {
		table:table, //hold Tabulator object
	}

	return extension;
}

Tabulator.registerExtension("persistentColumnLayout", PersistentColumnLayout);