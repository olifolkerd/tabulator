

//public group object
var GroupComponent = function (group){

	var obj = {
		type:"GroupComponent", //type of element

		getKey:function(){
			return group.key;
		},

		getElement:function(){
			return group.element;
		},

		getRows:function(){
			var output = []

			group.rows.forEach(function(row){
				output.push(row.getComponent());
			});

			return output;
		},

		getVisibility:function(){
			return group.visible;
		},

		show:function(){
			group.show()
		},

		hide:function(){
			group.hide();
		},

		toggle:function(){
			group.toggleVisibility();
		},

		_getSelf:function(){
			return group;
		},
	}

	return obj;
}

//////////////////////////////////////////////////
//////////////// Group Functions /////////////////
//////////////////////////////////////////////////

var Group = function(parent, key, generator, visible){

	this.key = key;
	this.parent = parent;
	this.type = "group"; //type of element
	this.rows = [];
	this.generator = generator;
	this.element = $("<div class='tabulator-row tabulator-group' role='rowgroup'></div>");
	this.arrowElement = $("<div class='tabulator-arrow'></div>");
	this.height = 0;
	this.outerHeight = 0;
	this.initialized = false;
	this.visible = visible;

	this.addBindings();
};

Group.prototype.addBindings = function(){
	var self = this;

	self.arrowElement.on("click", function(e){
		e.stopPropagation();
		e.stopImmediatePropagation();
		self.toggleVisibility();
	});
};

Group.prototype.addRow = function(row){
	this.rows.push(row);
};

Group.prototype.getRows = function(){
	this._visSet();

	return this.visible ? this.rows : [];
};

Group.prototype.getRowCount = function(){
	return this.rows.length;
};

Group.prototype.toggleVisibility = function(){
	if(this.visible){
		this.hide();
	}else{
		this.show();
	}
};

Group.prototype.hide = function(){
	this.visible = false;

	if(this.parent.table.rowManager.getRenderMode() == "classic"){
		this.rows.forEach(function(row){
			row.getElement().detach();
		});
	}else{
		this.parent.updateGroupRows(true);
	}

	this.parent.table.options.groupVisibilityChanged(this.getComponent(), false);
};

Group.prototype.show = function(){
	var self = this;

	self.visible = true;

	if(this.parent.table.rowManager.getRenderMode() == "classic"){
		self.rows.forEach(function(row){
			self.getElement().after(row.getElement());
			row.initialize();
		});
	}else{
		this.parent.updateGroupRows(true);
	}

	this.parent.table.options.groupVisibilityChanged(this.getComponent(), true);
};

Group.prototype._visSet = function(){
	var data = [];

	if(typeof this.visible == "function"){

		this.rows.forEach(function(row){
			data.push(row.getData());
		});

		this.visible = this.visible(this.key, this.getRowCount(), data);
	}
};

////////////// Standard Row Functions //////////////

Group.prototype.getElement = function(){
	this.addBindingsd = false;

	this._visSet();

	var data = [];

	this.rows.forEach(function(row){
		data.push(row.getData());
	});

	if(this.visible){
		this.element.addClass("tabulator-group-visible");
	}else{
		this.element.removeClass("tabulator-group-visible");
	}

	this.element.children().detach();

	this.element.html(this.generator(this.key, this.getRowCount(), data)).prepend(this.arrowElement);

	this.addBindings();

	return this.element;
};

//normalize the height of elements in the row
Group.prototype.normalizeHeight = function(){
	this.setHeight(this.element.innerHeight())
};

Group.prototype.initialize = function(force){
	if(!this.initialized || force){
		this.normalizeHeight();
		this.initialized = true;
	}
};

Group.prototype.reinitialize = function(){
	this.initialized = false;
	this.height = 0;

	if(this.element.is(":visible")){
		this.initialize(true);
	}
};

Group.prototype.setHeight = function(height){
	if(this.height != height){
		this.height = height;
		this.outerHeight = this.element.outerHeight();
	}
};

//return rows outer height
Group.prototype.getHeight = function(){
	return this.outerHeight;
};


//////////////// Object Generation /////////////////
Group.prototype.getComponent = function(){
	return new GroupComponent(this);
};

//////////////////////////////////////////////////
////////////// Group Row Extension ///////////////
//////////////////////////////////////////////////

var GroupRows = function(table){

	this.table = table; //hold Tabulator object

	this.findGroupId = false; //enable table grouping and set field to group by
	this.startOpen = function(){return false;}; //starting state of group
	this.headerGenerator = function(value, count, data){ //header layout function
		return value + "<span>(" + count + " " + ((count === 1) ? "item" : "items") + ")</span>";
	};

	this.groupList = []; //ordered list of groups
	this.groups = {}; //hold row groups
};


//initialize group configuration
GroupRows.prototype.initialize = function(){
	var self = this;

	if(typeof self.table.options.groupBy == "function"){
		self.findGroupId = self.table.options.groupBy;
	}else{
		self.findGroupId = function(data){
			return data[self.table.options.groupBy];
		}
	}

	if(self.table.options.groupStartOpen){
		self.startOpen = typeof self.table.options.groupStartOpen == "function" ? self.table.options.groupStartOpen : function(){return true;};
	}

	if(self.table.options.groupHeader){
		self.headerGenerator = self.table.options.groupHeader
	}

};

//return appropriate rows with group headers
GroupRows.prototype.getRows = function(data){
	var self = this,
	oldGroups = self.groups,
	groupComponents = [];

	self.groups = {};
	self.groupList =[];

	if(self.findGroupId){

		self.table.options.dataGrouping();

		data.forEach(function(row){

			var groupID = self.findGroupId(row.getData());

			if(!self.groups[groupID]){
				var group = new Group(self, groupID, self.headerGenerator, oldGroups[groupID] ? oldGroups[groupID].visible : self.startOpen);

				self.groups[groupID] = group;
				self.groupList.push(group);
			}

			self.groups[groupID].addRow(row);
		});

		if(self.table.options.dataGrouped){
			self.groupList.forEach(function(group){
				self.groupComponents.push(group.getComponent());
			});

			self.table.options.dataGrouped(groupList);
		};

		return self.updateGroupRows();

	}else{
		return data.slice(0);
	}

};

GroupRows.prototype.updateGroupRows = function(force){
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
};

GroupRows.prototype.scrollHeaders = function(left){
	this.groupList.forEach(function(group){
		group.arrowElement.css("margin-left", left);
	});
};

Tabulator.registerExtension("groupRows", GroupRows);