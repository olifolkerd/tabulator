$.widget("ui.tabulator", {

//setup options
options: {
	backgroundColor: "#aaa", //background color of tabulator
	borderColor:"#ccc", //border to tablulator
	height:"300", //height of tabulator
	columns:[],
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

	var table = $("<table><thead><tr></tr></thead><tbody></tbody></table>");

	$.each(options.columns, function(i, column) {
		$("thead>tr", table).append('<th data-field="' + column.field + '">' + column.title + '</th>');
	});

	element.append(table);

},

//set options
_setOption: function(option, value) {
	$.Widget.prototype._setOption.apply( this, arguments );
},



//decontructor
destroy: function() {

},


});