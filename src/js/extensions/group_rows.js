

//public group object
var GroupObject = function (group){

	var obj = {
		type:"groupObject", //type of element

	}

	return obj;
}


//group object
var Group = function(parent, id, generator, visible){
	var group = {
		id:id,
		parent:parent,
		type:"group", //type of element
		rows:[],
		generator:generator,
		element:$("<div class='tabulator-row tabulator-group' role='rowgroup'></div>"),
		arrowElement:$("<div class='tabulator-arrow'></div>"),
		height:0,
		outerHeight:0,
		initialized:false,
		visible:visible,

		//////////////// Group Functions /////////////////

		addBindings:function(){
			var self = this;

			self.element.on("click", function(e){
				e.stopPropagation();
				e.stopImmediatePropagation();
				self.toggleVisibility();
			});
		},

		addRow:function(row){
			this.rows.push(row);
		},

		getRows:function(){
			return this.visible ? this.rows : [];
		},

		getRowCount:function(){
			return this.rows.length;
		},

		toggleVisibility:function(){
			if(this.visible){
				this.hide();
			}else{
				this.show();
			}

			this.parent.updateGroupRows(true);
		},

		hide:function(){
			this.visible = false;
		},

		show:function(){
			var self = this;

			self.visible = true;
		},

		////////////// Standard Row Functions //////////////

		getElement:function(){
			this.addBindingsd = false;

			var data = [];

			this.rows.forEach(function(row){
				data.push(row.getData());
			});

			if(this.visible){
				this.element.addClass("tabulator-group-visible");
			}else{
				this.element.removeClass("tabulator-group-visible");
			}

			this.element.empty().html(this.generator(this.id, this.getRowCount(), data)).prepend(this.arrowElement);

			this.addBindings();

			return this.element;
		},

		//normalize the height of elements in the row
		normalizeHeight:function(){
			this.setHeight(this.element.innerHeight())
		},

		initialize:function(force){
			if(!this.initialized || force){
				this.normalizeHeight();
				this.initialized = true;
			}
		},

		reinitialize:function(){
			this.initialized = false;
			this.height = 0;

			if(this.element.is(":visible")){
				this.initialize(true);
			}
		},

		setHeight:function(height){
			if(this.height != height){
				this.height = height;
				this.outerHeight = this.element.outerHeight();
			}
		},

		//return rows outer height
		getHeight:function(){
			return this.outerHeight;
		},


		//////////////// Object Generation /////////////////
		getObject:function(){
			return new GroupObject(group);
		},
	}

	group.addBindings();

	return group;
}


var GroupRows = function(table){

	var extension = {
		table:table, //hold Tabulator object

		findGroupId:false, //enable table grouping and set field to group by
		startOpen:true, //starting state of group
		headerGenerator:function(value, count, data){ //header layout function
			return value + "<span>(" + count + " " + ((count === 1) ? "item" : "items") + ")</span>";
		},

		groupList:[], //ordered list of groups
		groups:{}, //hold row groups

		//initialize group configuration
		initialize:function(){
			var self = this;

			if(typeof self.table.options.groupBy == "function"){
				self.findGroupId = self.table.options.groupBy;
			}else{
				self.findGroupId = function(data){
					return data[self.table.options.groupBy];
				}
			}

			if(self.table.options.groupStartOpen){
				self.startOpen = self.table.options.groupStartOpen;
			}

			if(self.table.options.groupHeader){
				self.headerGenerator = self.table.options.groupHeader
			}

		},

		//return appropriate rows with group headers
		getRows:function(data){
			var self = this;

			var oldGroups = self.groups;
			self.groups = {};
			self.groupList =[];

			if(self.findGroupId){

				data.forEach(function(row){

					var groupID = self.findGroupId(row.getData());

					if(!self.groups[groupID]){
						var group = new Group(self, groupID, self.headerGenerator, oldGroups[groupID] ? oldGroups[groupID].visible : self.startOpen);

						self.groups[groupID] = group;
						self.groupList.push(group);
					}

					self.groups[groupID].addRow(row);
				});

				return self.updateGroupRows();

			}else{
				return data.slice(0);
			}

		},

		updateGroupRows:function(force){
			var self = this,
			output = [],
			oldRowCount;

			self.groupList.forEach(function(group){
				output.push(group);

				group.getRows().forEach(function(row){
					output.push(row);
				})
			});

			//force update of table display
			if(force){
				oldRowCount = self.table.rowManager.displayRowsCount;

				self.table.rowManager.setDisplayRows(output);
				self.table.rowManager._virtualRenderFill(Math.floor((self.table.rowManager.element.scrollTop() / self.table.rowManager.element[0].scrollHeight) * oldRowCount));
			}

			return output;
		}

	}

	return extension;
}

Tabulator.registerExtension("groupRows", GroupRows);