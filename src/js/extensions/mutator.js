var Mutator = function(table){

	var extension = {
		table:table, //hold Tabulator object

		//default mutators
		mutators:{},
	}

	return extension;
}

Tabulator.registerExtension("mutator", Mutator);