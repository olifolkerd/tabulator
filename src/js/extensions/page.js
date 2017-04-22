var Page = function(table){

	var extension = {
		table:table, //hold Tabulator object
	}

	return extension;
}

Tabulator.registerExtension("page", Page);