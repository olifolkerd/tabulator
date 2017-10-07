var Layout = function(table){
	this.table = table;
	this.mode = null;
};

//initialize layout system
Layout.prototype.initialize = function(layout){

	if(this.modes[layout]){
		this.mode = layout;
	}else{
		console.warn("Layout Error - invalid mode set, defaulting to 'fitData' : " + layout);
		this.mode = 'fitData';
	}

	this.table.element.attr("tabulator-layout", this.mode);
};

Layout.prototype.getMode = function(){
	return this.mode;
};

//trigger table layout
Layout.prototype.layout = function(){
	this.modes[this.mode].call(this, this.table.columnManager.columnsByIndex);
};

//layout render functions
Layout.prototype.modes = {

	//resize columns to fit data the contain
	"fitData": function(columns){
		columns.forEach(function(column){
			column.reinitializeWidth();
		});

		if(this.table.options.responsiveLayout && this.table.extExists("responsiveLayout", true)){
			this.table.extensions.responsiveLayout.update();
		}
	},

	//resize columns to fit data the contain
	"fitDataFill": function(columns){
		columns.forEach(function(column){
			column.reinitializeWidth();
		});

		if(this.table.options.responsiveLayout && this.table.extExists("responsiveLayout", true)){
			this.table.extensions.responsiveLayout.update();
		}
	},

	//resize columns to fit
	"fitColumns": function(columns){
		var self = this;

		var totalWidth = self.table.element.innerWidth(); //table element width
		var fixedWidth = 0; //total width of columns with a defined width
		var flexWidth = 0; //total width available to flexible columns
		var flexColWidth = 0; //desired width of flexible columns
		var flexColumns = []; //array of flexible width columns
		var gapFill=0; //number of pixels to be added to final column to close and half pixel gaps

		//ensure columns resize to take up the correct amount of space
		function scaleColumns(columns, freeSpace, colWidth){

			var oversizeCols = [],
			oversizeSpace = 0,
			remainingSpace = 0,
			gap = 0,
			undersizeCols = [];

			columns.forEach(function(column, i){
				if(column.minWidth >= colWidth){
					oversizeCols.push(column);
				}else{
					undersizeCols.push(column);
				}
			});

			if(oversizeCols.length){
				oversizeCols.forEach(function(column){
					oversizeSpace += column.minWidth;
					column.setWidth(column.minWidth);
				});

				remainingSpace = freeSpace - oversizeSpace;

				gap = remainingSpace - (Math.floor(remainingSpace/undersizeCols.length) * undersizeCols.length);

				gap += scaleColumns(undersizeCols, remainingSpace, Math.floor(remainingSpace/undersizeCols.length));
			}else{

				gap = freeSpace - (Math.floor(freeSpace/undersizeCols.length) * undersizeCols.length);

				undersizeCols.forEach(function(column){
					column.setWidth(colWidth);
				});
			}

			return gap;

		}

		if(this.table.options.responsiveLayout && this.table.extExists("responsiveLayout", true)){
			this.table.extensions.responsiveLayout.update();
		}

		//adjust for vertical scrollbar if present
		if(this.table.rowManager.element[0].scrollHeight > this.table.rowManager.element.innerHeight()){
			totalWidth -= this.table.rowManager.element[0].offsetWidth - this.table.rowManager.element[0].clientWidth;
		}

		columns.forEach(function(column){
			var width, minWidth, colWidth;

			if(column.visible){

				width = column.definition.width;
				minWidth =  parseInt(column.minWidth);

				if(width){

					if(typeof(width) == "string"){
						if(width.indexOf("%") > -1){
							colWidth = (totalWidth / 100) * parseInt(width);
						}else{
							colWidth = parseInt(width);
						}
					}else{
						colWidth = width;
					}

					fixedWidth += colWidth > minWidth ? colWidth : minWidth;

				}else{
					flexColumns.push(column);
				}
			}
		});

		//calculate available space
		flexWidth = totalWidth - fixedWidth;

		//calculate correct column size
		flexColWidth = Math.floor(flexWidth / flexColumns.length)

		//generate column widths
		var gapFill = scaleColumns(flexColumns, flexWidth, flexColWidth);

		//increase width of last column to account for rounding errors
		if(flexColumns.length){
			flexColumns[flexColumns.length-1].setWidth(flexColumns[flexColumns.length-1].getWidth() + gapFill);
		}
	},
};


Tabulator.registerExtension("layout", Layout);