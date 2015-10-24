$.widget("ui.tabulator", {


data:[],//array to hold data for table
sortcol:null, //column name of currently sorted column

//setup options
options: {
	backgroundColor: "#777", //background color of tabulator
	borderColor:"#ccc", //border to tablulator

	headerBackgroundColor:"#e6e6e6", //border to tablulator
	headerTextColor:"#555", //header text colour
	headerBorderColor:"#aaa", //header border color
	headerSeperatorColor:"#999", //header bottom seperator color

	rowBackgroundColor:"#fff", //table row background color
	rowBorderColor:"#aaa", //table border color
	rowTextColor:"#333", //table text color
	rowHoverBackground:"#bbb", //row background color on hover

	height:"300", //height of tabulator
	fitColumns:true, //fit colums to width of screen;

	columns:[],//stor for colum header info

	sortable:true, //global default for sorting
	sortArrows:{ //colors for sorting arrows
		active: "#000",
		inactive: "#bbb",
	},

	selectable:true, //highlight rows on hover

	ajaxURL:false, //url for ajax loading

	rowClick:function(){}, //do action on row click
	rowContext:function(){}, //context menu action
},

//constructor
_create: function() {
	var self = this;
	var options = self.options;
	var element = self.element;

	options.height = isNaN(options.height) ? options.height : options.height + "px"

	element.css({
		position:"relative",
		"box-sizing" : "border-box",
		"background-color": options.backgroundColor,
		"border": "1px solid " + options.borderColor,
		"height": options.height,
		"overflow-x":"auto",
	})

	//create header bar to fill full width of screen
	var headerfill = $("<div></div>");
	headerfill.css({
		position:"absolute",
		height:"24px",
		width:"100%",
		"background-color": options.headerBackgroundColor,
		"border-bottom":"1px solid " + options.headerSeperatorColor,
		"z-index":"0",
	})

	element.append(headerfill);

	//create table
	self.table = $("<table><thead><tr style='background-color:" + options.headerBackgroundColor + "; color: " + options.headerTextColor + "'></tr></thead><tbody></tbody></table>");

	self.table.css({
		position:"relative",
		"border-collapse": "collapse",
		"z-index":"1",
	});

	if(options.fitColumns) self.table.css({width:"100%"});

	//create sortable arrow chevrons
	var arrow = $("<div class='tabular-arrow'></div>");
	arrow.css({
		display: "inline-block",
		position: "absolute",
		top:"9px",
		right:"8px",
		width: 0,
		height: 0,
		"border-left": "6px solid transparent",
		"border-right": "6px solid transparent",
		"border-top": "6px solid " + options.sortArrows.inactive,
	});


	$.each(options.columns, function(i, column) {

		column.sortType = typeof(column.sortType) == "undefined" ? "string" : column.sortType;
		column.sortable = typeof(column.sortable) == "undefined" ? options.sortable : column.sortable;

		var col = $('<th data-field="' + column.field + '" data-sortable=' + column.sortable + ' data-sorttype="' + column.sortType + '">' + column.title + '</th>');

		$("thead>tr", self.table).append(col);

	});

	element.append(self.table);

	//layout headers
	$("th", self.table).css({
		"padding":"4px",
		"text-align":"left",
		"position":"relative",
		"border-right":"1px solid " + options.headerBorderColor,
		"border-bottom":"1px solid " + options.headerSeperatorColor,
	});

	//append sortable arrows to sortable headers
	$("th[data-sortable=true]", self.table).css({"padding-right":"30px"})
	.on("mouseover", function(){$(this).css({cursor:"pointer", "background-color":"rgba(0,0,0,.1)"})})
	.on("mouseout", function(){$(this).css({"background-color":"transparent"})})
	.append(arrow.clone());

},

//set options
_setOption: function(option, value) {
	$.Widget.prototype._setOption.apply( this, arguments );
},

//load data
setData:function(data){

	console.log("greddata", data);

	if(typeof(data) === "string"){
		if (data.indexOf("http") == 0){
			//make ajax call to url to get data
			this._getAjaxData(this.options.ajaxURL);
		}else{
			//assume data is a json encoded string
			this.data = jQuery.parseJSON(data);
			this._renderTable();
		}
	}else{
		if(data){
			//asume data is already an object
			this.data = data;
		}else{
			//no data provided, check if ajaxURL is present;
			if(this.options.ajaxURL){
				this._getAjaxData(this.options.ajaxURL);
			}else{
				//empty data
				this.data = [];
			}
		}
		this._renderTable();
	}
},

_getAjaxData:function(url){

	var self = this;

	$.ajax({
		url: url,
		type: "GET",
		async: true,
		dataType:'json',
		success: function (data) {
			self.data = data;
			self._renderTable();
		},
		error: function (xhr, ajaxOptions, thrownError) {
			console.log("Tablulator ERROR (ajax get): " + xhr.status + " - " + thrownError);
		},
	});
},

_renderTable:function(){
	var self = this;

	//hide table while building
	$("tbody", self.table).hide();

	//build rows of table
	$.each(self.data, function(i, item) {
		var row = $('<tr data-id="' + item.id + '"></tr>');

		//bind row data to row
		row.data("data", item);

		//bind row click events
		row.on("click", function(e){self._rowClick(e, row)});
		row.on("contextmenu", function(e){self._rowContext(e, row)});

		$.each(self.options.columns, function(i, column) {
			//deal with values that arnt declared
			var value = typeof(item[column.field]) == 'undefined' ? "" : item[column.field];

			var cell = $("<td data-field='" + column.field + "' data-value='" + self._safeString(value) + "' >" + value + "</td>");

			cell.css({
				padding:"4px",
			})

			//bind cell click function
			if(typeof(column.onClick) == "function"){
				cell.on("click", function(e){self._cellClick(e, cell)});
			}

			row.append(cell);
		});

		$("tbody", self.table).append(row);
	});

	$("tbody", self.table).css({
		"background-color":self.options.rowBackgroundColor,
		"color":self.options.rowTextColor,
	});

	//hover over rows
	if(self.options.selectable){
		$("tbody tr", self.table)
		.on("mouseover", function(){$(this).css({cursor:"pointer", "background-color":self.options.rowHoverBackground})})
		.on("mouseout", function(){$(this).css({"background-color":"transparent"})})
	}

	//color odd rows
	$("tbody tr:nth-of-type(even)", self.table).css({
		"background-color": "rgba(0,0,0,.1);" //shade even numbered rows
	})
	.on("mouseout", function(){$(this).css({"background-color": "rgba(0,0,0,.1);"})}); //make sure odd rows revert back to color after hover

	//add column borders to rows
	$("tbody td", self.table).css({
		"border-right":"1px solid " + self.options.rowBorderColor,
	});

	//show table once loading complete
	$("tbody", self.table).show();

},

//carry out action on row click
_rowClick: function(e, row){
	this.options.rowClick(e, row.data("id"), row.data("data"), row);
},

//carry out action on row context
_rowContext: function(e, row){
	this.options.rowContext(e, row.data("id"), row.data("data"), row);
},

//carry out action on cell click
_cellClick: function(e, cell){

	var column = this.options.columns.filter(function(column) {
		return column.field == cell.data("field");
	});

	column[0].onClick(e, cell.data("value"), cell, cell.closest("tr"));
},

//return escaped string for attribute
_safeString: function(value){
	return String(value).replace(/'/g, "&#39;");
},

//decontructor
destroy: function() {

},


});