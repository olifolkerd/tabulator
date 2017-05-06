
//public row object
var RowObject = function (row){

	var obj = {
		getData:function(){
			return row.getData(true);
		},

		getElement:function(){
			return row.getElement();
		},

		getCells:function(){
			var cells = [];

			row.cells.forEach(function(cell){
				cells.push(cell.getObject());
			});

			return cells;
		},
	}

	return obj;
}


var Row = function(data, parent){

	var row = {
		table:parent.table,
		data:{},
		parent:parent,
		element:$("<div class='tabulator-row' role='row'></div>"),
		extensions:{}, //hold extension variables;
		cells:[],
		height:0, //hold element height
		outerHeight:0, //holde lements outer height
		initialized:false, //element has been rendered

		//////////////// Setup Functions /////////////////

		getElement:function(){
			return this.element;
		},


		generateElement:function(){
			var self = this;

			//set row selection characteristics
			if(self.table.options.selectable !== false && self.table.extExists("selectRow")){
				self.table.extensions.selectRow.initializeRow(this);
			}

			//handle row click events
			if (self.table.options.rowClick){
				self.element.on("click", function(e){
					self.table.options.rowClick(e, self.getObject());
				})
			}

			if (self.table.options.rowDblClick){
				self.element.on("dblclick", function(e){
					self.table.options.rowDblClick(e, self.getObject());
				})
			}

			if (self.table.options.rowContext){
				self.element.on("contextmenu", function(e){
					self.table.options.rowContext(e, self.getObject());
				})
			}
		},

		//normalize the height of elements in the row
		normalizeHeight:function(){
			this.setHeight(this.element.innerHeight())
		},

		//functions to setup on first render
		initialize:function(force){
			var self = this;

			if(!self.initialized || force){

				self.element.empty();

				self.cells = parent.columnManager.generateCells(self);

				self.cells.forEach(function(cell){
					self.element.append(cell.getElement());
				});

				self.normalizeHeight();
				self.initialized = true;
			}
		},

		reinitialize:function(){
			this.initialized = false;
			this.height=0;

			if(this.element.is(":visible")){
				this.initialize(true);
			}
		},

		setHeight:function(height){
			var self = this;

			if(self.height != height){

				self.height = height;

				self.cells.forEach(function(cell){
					cell.setHeight(height);
				});

				self.outerHeight = this.element.outerHeight();
			}
		},

		//return rows outer height
		getHeight:function(){
			return this.outerHeight;
		},

		//////////////// Data Management /////////////////

		setData:function(data){
			var self = this;

			if(self.table.extExists("mutator")){
				self.data = self.table.extensions.mutator.transformRow(data);
			}else{
				self.data = data;
			}
		},

		//update the rows data
		updateData:function(data){
			var self = this;

			//mutate incomming data if needed
			if(self.table.extExists("mutator")){
				data = self.table.extensions.mutator.transformRow(data);
			}else{
				data = data;
			}

			for (var attrname in data) {
				self.data[attrname] = data[attrname];
			}

			self.reinitialize();

			self.table.options.rowUpdated(self.getObject());
		},

		getData:function(transform){
			var self = this;

			if(transform){
				if(self.table.extExists("accessor")){
					return self.table.extensions.accessor.transformRow(self.data);
				}
			}else{
				return this.data;
			}

		},

		//////////////// Object Generation /////////////////
		getObject:function(){
			return new RowObject(row);
		},
	}

	row.setData(data);
	row.generateElement();

	return row;
}