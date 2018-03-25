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
		var flexGrowUnits = 0; //total number of widthGrow blocks accross all columns
		var flexColWidth = 0; //desired width of flexible columns
		var flexColumns = []; //array of flexible width columns
		var fixedShrinkColumns = []; //array of fixed width columns that can shrink
		var flexShrinkUnits = 0; //total number of widthShrink blocks accross all columns
		var overflowWidth = 0; //horizontal overflow width
		var gapFill=0; //number of pixels to be added to final column to close and half pixel gaps

		function calcWidth(width){
			var colWidth;

			if(typeof(width) == "string"){
				if(width.indexOf("%") > -1){
					colWidth = (totalWidth / 100) * parseInt(width);
				}else{
					colWidth = parseInt(width);
				}
			}else{
				colWidth = width;
			}

			return colWidth;
		}

		//ensure columns resize to take up the correct amount of space
		function scaleColumns(columns, freeSpace, colWidth, shrinkCols){

			var oversizeCols = [],
			oversizeSpace = 0,
			remainingSpace = 0,
			nextColWidth = 0,
			gap = 0,
			changeUnits = 0,
			undersizeCols = [];

			function calcGrow(column){
				return (colWidth * (column.definition.widthGrow || 1));
			}

			function calcShrink(column){
				return  (calcWidth(column.width) - (colWidth * (column.definition.widthShrink || 0)))
			}

			columns.forEach(function(column, i){
				var width = shrinkCols ? calcShrink(column) : calcGrow(column);
				if(column.minWidth >= width){
					oversizeCols.push(column);
				}else{
					undersizeCols.push(column);
					changeUnits += shrinkCols ? (column.definition.widthShrink || 1) : (column.definition.widthGrow || 1);
				}
			});

			if(oversizeCols.length){
				oversizeCols.forEach(function(column){
					oversizeSpace += shrinkCols ?  column.width - column.minWidth : column.minWidth;
					column.setWidth(column.minWidth);
				});

				remainingSpace = freeSpace - oversizeSpace;

				nextColWidth = changeUnits ? Math.floor(remainingSpace/changeUnits) : remainingSpace;

				gap = remainingSpace - (nextColWidth * changeUnits);

				gap += scaleColumns(undersizeCols, remainingSpace, nextColWidth, shrinkCols);
			}else{
				gap = changeUnits ? freeSpace - (Math.floor(freeSpace/changeUnits) * changeUnits) : freeSpace;

				undersizeCols.forEach(function(column){
					column.setWidth(shrinkCols ? calcShrink(column) : calcGrow(column));
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

					colWidth = calcWidth(width);

					fixedWidth += colWidth > minWidth ? colWidth : minWidth;

					column.setWidth(colWidth > minWidth ? colWidth : minWidth);

					if(column.definition.widthShrink){
						fixedShrinkColumns.push(column);
						flexShrinkUnits += column.definition.widthShrink;
					}

				}else{
					flexColumns.push(column);
					flexGrowUnits += column.definition.widthGrow || 1;
				}
			}
		});


		//calculate available space
		flexWidth = totalWidth - fixedWidth;

		//calculate correct column size
		flexColWidth = Math.floor(flexWidth / flexGrowUnits)

		//generate column widths
		var gapFill = scaleColumns(flexColumns, flexWidth, flexColWidth, false);

		//increase width of last column to account for rounding errors
		if(flexColumns.length){
			flexColumns[flexColumns.length-1].setWidth(flexColumns[flexColumns.length-1].getWidth() + gapFill);
		}

		//shrink oversize columns if there is no available space
		overflowWidth = this.table.rowManager.element[0].scrollWidth - this.table.rowManager.element[0].clientWidth;
		if(overflowWidth > 0 && flexShrinkUnits){
			gapFill = scaleColumns(fixedShrinkColumns, Math.abs(overflowWidth), Math.floor(Math.abs(overflowWidth) / flexShrinkUnits), true);
		}

		//decrease width of last column to account for rounding errors
		if(fixedShrinkColumns.length){
			fixedShrinkColumns[fixedShrinkColumns.length-1].setWidth(fixedShrinkColumns[fixedShrinkColumns.length-1].getWidth() - gapFill);
		}




	},
};


Tabulator.registerExtension("layout", Layout);