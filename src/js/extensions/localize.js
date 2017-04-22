var Localize = function(table){

	var extension = {
		table:table, //hold Tabulator object

		lang:{}, // hold current locale text

		default:{ //hold default locale text
			"columns":{
			},
			"pagination":{
				"first":"First",
				"first_title":"First Page",
				"last":"Last",
				"last_title":"Last Page",
				"prev":"Prev",
				"prev_title":"Prev Page",
				"next":"Next",
				"next_title":"Next Page",
			},
			"headerFilters":{
				"default":"filter column...",
				"columns":{
				}
			}
		},
	}

	return extension;
}

Tabulator.registerExtension("localize", Localize);