$.widget("ui.tabulator", {


data:[],//array to hold data for table
sortCurrrent:{col:null,dir:null}, //column name of currently sorted column

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

	height:false, //height of tabulator
	fitColumns:true, //fit colums to width of screen;

	columns:[],//stor for colum header info

	sortable:true, //global default for sorting
	dateFormat: "dd/mm/yyyy", //date format to be used for sorting
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

	if(options.height){
		options.height = isNaN(options.height) ? options.height : options.height + "px";
		element.css({"height": options.height});
	}

	element.css({
		position:"relative",
		"box-sizing" : "border-box",
		"background-color": options.backgroundColor,
		"border": "1px solid " + options.borderColor,
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
		"border-bottom": "6px solid " + options.sortArrows.inactive,
	});


	$.each(options.columns, function(i, column) {

		column.sorter = typeof(column.sorter) == "undefined" ? "string" : column.sorter;
		column.sortable = typeof(column.sortable) == "undefined" ? options.sortable : column.sortable;

		var col = $('<th data-field="' + column.field + '" data-sortable=' + column.sortable + '>' + column.title + '</th>');

		//sort tabl click binding
		if(column.sortable){
			col.on("click", function(){

				self._sortClick(column, col);
			})
		}

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
		"user-select":"none",
	});

	//append sortable arrows to sortable headers
	$("th[data-sortable=true]", self.table).css({"padding-right":"30px"})
	.data("sortdir", "desc")
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
			this._parseData(jQuery.parseJSON(data));
			this._renderTable();
		}
	}else{
		if(data){
			//asume data is already an object
			this._parseData(data);
		}else{
			//no data provided, check if ajaxURL is present;
			if(this.options.ajaxURL){
				this._getAjaxData(this.options.ajaxURL);
			}else{
				//empty data
				this._parseData([]);
			}
		}
		this._renderTable();
	}
},

//parse and index data
_parseData:function(data){

	var newData = [];

	$.each(data, function(i, item) {
		newData[item.id] = item;
	});

	this.data = newData;
},

//get json data via ajax
_getAjaxData:function(url){

	var self = this;

	$.ajax({
		url: url,
		type: "GET",
		async: true,
		dataType:'json',
		success: function (data) {
			this._parseData(data);
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

	console.log("data", self.data)
	//build rows of table
	self.data.forEach( function(item, i) {
		console.log("item",item);
		var row = $('<tr data-id="' + item.id + '"></tr>');

		//bind row data to row
		row.data("data", item);

		//bind row click events
		row.on("click", function(e){self._rowClick(e, row, item)});
		row.on("contextmenu", function(e){self._rowContext(e, row, item)});

		$.each(self.options.columns, function(i, column) {
			//deal with values that arnt declared

			var value = typeof(item[column.field]) == 'undefined' ? "" : item[column.field];

			// set empty values to not break search
			if(typeof(item[column.field]) == 'undefined'){
				item[column.field] = "";
			}

			//set column text alignment
			var align = typeof(column.align) == 'undefined' ? "left" : column.align;

			var cell = $("<td data-field='" + column.field + "' data-value='" + self._safeString(value) + "' >" + value + "</td>");

			cell.css({
				padding: "4px",
				"text-align": align,
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

	//style table rows
	self._styleRows();

	//sort data if already sorted
	if(self.sortCurrrent.col){
		self._sorter(self.sortCurrrent.col, self.sortCurrrent.dir);
	}


	//show table once loading complete
	$("tbody", self.table).show();

},

//style rows of the table
_styleRows:function(){

	var self = this;

	$("tbody tr", self.table).css({"background-color":"transparent"})

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
},

//carry out action on row click
_rowClick: function(e, row, data){
	this.options.rowClick(e, row.data("id"), data, row);
},

//carry out action on row context
_rowContext: function(e, row, data){
	this.options.rowContext(e, row.data("id"), data, row);
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

_sortClick: function(column, element){
	var self = this;
	var table = self.table;
	var options = this.options;

	//reset all column sorts
	$("th[data-sortable=true][data-field!=" + column.field + "]", self.table).data("sortdir", "desc");
	$("th .tabular-arrow", self.table).css({
		"border-top": "none",
		"border-bottom": "6px solid " + options.sortArrows.inactive,
	})

	if (element.data("sortdir") == "desc"){
		element.data("sortdir", "asc");
		$(".tabular-arrow", element).css({
			"border-top": "none",
			"border-bottom": "6px solid " + options.sortArrows.active,
		});
	}else{
		element.data("sortdir", "desc");
		$(".tabular-arrow", element).css({
			"border-top": "6px solid " + options.sortArrows.active,
			"border-bottom": "none",
		});
	}

	self._sorter(column, element.data("sortdir"));
},

_sorter: function(column, dir){

	var self = this;
	var table = $("table tbody", self.element);
	var data = self.data;

	self.sortCurrrent.col = column;
	self.sortCurrrent.dir = dir;

	$("tr", table).sort(function(a,b) {

		//switch elements depending on search direction
		el1 = dir == "asc" ? data[$(a).data("id")] : data[$(b).data("id")]
		el2 = dir == "asc" ? data[$(b).data("id")] : data[$(a).data("id")]

		//sorting functions
		switch(column.sorter){

			case "number": //sort numbers
			return parseFloat(el1[column.field]) - parseFloat(el2[column.field]);
			break;

			case "string": //sort strings
			return el1[column.field].toLowerCase().localeCompare(el2[column.field].toLowerCase());
			break;

			case "date": //sort dates
			return self._formatDate(el1[column.field]) - self._formatDate(el2[column.field]);
			break;

			default:
			//handle custom sorter functions
			if(typeof(column.sorter) == "function"){
				return column.sorter(el1, el2);
			}
		}
	}).appendTo(table);

	//style table rows
	self._styleRows();
},


//format date for date comparison
_formatDate:function(dateString){
	var format = this.options.dateFormat

	var ypos = format.indexOf("yyyy");
	var mpos = format.indexOf("mm");
	var dpos = format.indexOf("dd");

	var formattedString = dateString.substring(ypos, ypos+4) + "-" + dateString.substring(mpos, mpos+2) + "-" + dateString.substring(dpos, dpos+2);

	return Date.parse(formattedString);
},


//custom data formatters
formatters:{
	email:function(){},
	link:function(){},
	tick:function(){},
	tickCross:function(){},
	star:function(){},
	progress:function(){},
},

//deconstructor
destroy: function() {

},


});