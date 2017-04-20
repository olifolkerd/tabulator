ColumnManager = function(config){
	var manager = {
		element:$("<div class='tabulator-header'></div>"), //containing element
		rowManager:null, //hold row manager object
		config:config, //hold table config settings

		//link to row manager
		setRowManager:function(manager){
			this.rowManager = manager;
		},

		//return containing element
		getElement:function(){
			return this.element;
		},

		//scroll horizontally to match table body
		scrollHoz:function(left){
			var self = this;
			var hozAdjust = 0;
			var scrollWidth = self.element[0].scrollWidth - self.config.element.innerWidth();

			self.element(left);

			//adjust for vertical scrollbar moving table when present
			if(left > scrollWidth){
				hozAdjust = left - scrollWidth
				self.element.css("margin-left", -(hozAdjust));
			}else{
				self.element.css("margin-left", 0);
			}

			//keep frozen columns fixed in position
			//self._calcFrozenColumnsPos(hozAdjust + 3);
		},


		//alert user that the plugin they are trying to use is missing
		missingPlugin:function(plugin){
			console.error("Tabulator Plugin Not Installed: " + plugin);
		},
	}

	//initialize manager


	return manager;
}