$.widget("ui.tabulator", {

//array to hold data for table
data:[],

//setup options
options: {
	backgroundColor: "#aaa", //background color of tabulator
	borderColor:"#ccc", //border to tablulator
	height:"300", //height of tabulator
	columns:[],
	ajaxURL:false,
},

//constructor
_create: function() {
	var self = this;
	var options = self.options;
	var element = self.element;

	options.height = isNaN(options.height) ? options.height : options.height + "px"

	element.css({
		"box-sizing" : "border-box",
		"background-color": options.backgroundColor,
		"border": "1px solid " + options.borderColor,
		"height": options.height,
	})

	self.table = $("<table><thead><tr></tr></thead><tbody></tbody></table>");

	$.each(options.columns, function(i, column) {
		$("thead>tr", self.table).append('<th data-field="' + column.field + '">' + column.title + '</th>');
	});

	element.append(self.table);

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
	$.each(self.data, function(i, item) {
		var row = $('<tr data-id="' + item.id + '"></tr>');
		$.each(self.options.columns, function(i, column) {
			//deal with values that arnt declared
			var value = typeof(item[column.field]) == 'undefined' ? "" : item[column.field];

			row.append('<td data-field="' + column.field + '">' + value + '</td>');
		});

		$("tbody", self.table).append(row);
	});
},


//decontructor
destroy: function() {

},


});