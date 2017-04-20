Row = function(){
	return {
		//Check for plugin
		pluginExists:function(plugin, required){
			if(this[plugin]){
				return true;
			}else{
				if(required){
					console.error("Tabulator Plugin Not Installed: " + plugin);
				}

				creturn false;
			}
		},
	}
}