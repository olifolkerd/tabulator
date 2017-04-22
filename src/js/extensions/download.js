var Download = function(table){

	var extension = {
		table:table, //hold Tabulator object
	}

	return extension;
}

Tabulator.registerExtension("download", Download);