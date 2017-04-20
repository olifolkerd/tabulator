RowManager = function(){
	return {
		//alert user that the plugin they are trying to use is missing
		missingPlugin:function(plugin){
			console.error("Tabulator Plugin Not Installed: " + plugin);
		},
	}
}