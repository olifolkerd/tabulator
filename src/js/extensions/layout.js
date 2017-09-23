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

				if(width){
					minWidth =  parseInt(column.minWidth);

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

		//calculate any sub pixel space that needs to be filed by the last column
		gapFill = totalWidth - fixedWidth - (flexColWidth * flexColumns.length);
		gapFill = gapFill > 0 ? gapFill : 0;

		flexColumns.forEach(function(column, i){
			var width = flexColWidth >= column.minWidth ? flexColWidth : column.minWidth;

			if(i == flexColumns.length -1 && gapFill){
				width += gapFill;
			}

			column.setWidth(width);
		});
	},
};


Tabulator.registerExtension("layout", Layout);