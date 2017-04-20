ColumnManager = function(config){
	var manager = {
		element:$("<div class='tabulator-header'></div>"), //containing element
		rowManager:null, //hold row manager object
		config:config, //hold table config settings

		columns:[], // column definition object
		columnsByIndex:[], //columns by index
		columnsByField:[], //columns by field

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

		setColumns:function(cols){
			var self = this;

			self.element.empty();

			self._parseColumnGroup(cols);
		},

		_parseColumnGroup:function(columns){
			var self = this;

			//iterate through columns
			columns.forEach(function(def, i){
				var col = new Column(def, self);

				self.columns.push(col);
			});
		},


		//Check for plugin
		pluginExists:function(plugin, required){
			if(this[plugin]){
				return true;
			}else{
				if(required){
					console.error("Tabulator Plugin Not Installed: " + plugin);
				}

				return false;
			}
		},
	}

	//initialize manager


	return manager;
}