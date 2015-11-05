Tabulator
================================
An easy to use table generation JQuery UI Plugin

Tabulator allows you to create  a table with in seconds from any JSON formatted data.

It relies on no external css or images, simply include the library in your JQuery UI project and you're away!

Tabulator is packed with useful  features including:

- JSON, array or AJAX data loading
- Column sorting
- Custom data formatting
- Resizable columns
- Auto scaling  to fit data/element
- Many theming options
- Custom click and context Events
- Callbacks at every stage of data processing and rendering


Setup
================================
Setting up tabulator could not be simpler.

Include the library
```html
<script type="text/javascript" src="tabulator.js"></script>
```

Create an element to hold the table
```html
<div id="example-table"><div>
```

Turn the element into a tabulator with some simple javascript
```js
$("#example-table").tabulator();
```

Define Column Headers
================================
Column headers are defined as an array of JSON objects passed into the columns option when you create your tabulator

```js
$("#example-table").tabulator({
	columns:[
		{title:"Name", field:"name", sortable:true, sorter:"string", width:200},
		{title:"Age", field:"age", sortable:true, sorter:"number", align:"right", formatter:"progress"},
		{title:"Gender", field:"gender", sortable:true, sorter:"string", onClick:function(e, val, cell, row){console.log("cell click")},},
		{title:"Height", field:"height", sortable:true, formatter:"star", align:"center", width:100},
		{title:"Favourite Color", field:"col", sorter:"string", sortable:false},
		{title:"Date Of Birth", field:"dob", sortable:true, sorter:"date", align:"center"},
		{title:"Cheese Preference", field:"cheese", sortable:true, sorter:"boolean", align:"center", formatter:"tickCross"},
	],
});
```
There are a number of parameters that can be passed in with each column to determine how it is displayed:

- **title** - ***Required*** This is the title that will be displayed in the header for this column
- **field** - ***Required*** this is the key for this column in the data array
- **align** - sets the text alignment for this column (left|center|right)
- **width** - sets the width of this column (if not set the system will determine the best)
- **sortable** - determines if the user can sort data by this column (see [Sorting Data](#sorting-data) for more details)
- **sorter** - determines how to sort data in this column (see [Sorting Data](#sorting-data) for more details)
- **formatter** - set how you would like the data to be formatted (see [Formatting Data](#formatting-data) for more details)
- **onClick** - callback for when user clicks on a cell in this column (see [Callbacks](#callbacks) for more details)

Set Table Data
================================
Tabulator row data is defined as an array of objects, that can either be passed as an array or retrieved  as a JSON formatted string via AJAX from a URL.

The data can contain more columns that are defined in the columns options, these will be sorted with the rest of the data, but not rendered to screen.

A unique "id" value must be present for each row of data, if it is missing Tabluator will add one.

an example JSON data set:
```js
[
	{id:1, name:"Billy Bob", age:"12", gender:"male", height:1, col:"red", dob:"", cheese:1},
	{id:2, name:"Mary May", age:"1", gender:"female", height:2, col:"blue", dob:"14/05/1982", cheese:true},
	{id:3, name:"Christine Lobowski", age:"42", height:0, col:"green", dob:"22/05/1982", cheese:"true"},
	{id:4, name:"Brendon Philips", age:"125", gender:"male", height:1, col:"orange", dob:"01/08/1980"},
	{id:5, name:"Margret Marmajuke", age:"16", gender:"female", height:5, col:"yellow", dob:"31/01/1999"},
	{id:6, name:"Billy Bob", age:"12", gender:"male", height:1, col:"red", dob:"", cheese:1},
	{id:7, name:"Mary May", age:"1", gender:"female", height:2, col:"blue", dob:"14/05/1982", cheese:true},
	{id:8, name:"Christine Lobowski", age:"42", height:0, col:"green", dob:"22/05/1982", cheese:"true"},
	{id:9, name:"Brendon Philips", age:"125", gender:"male", height:1, col:"orange", dob:"01/08/1980"},
	{id:10, name:"Margret Marmajuke", age:"16", gender:"female", height:5, col:"yellow", dob:"31/01/1999"},
]
```

###Set data using array
You can pass an array directly to the table using the ***setData*** method.

```js
$("#example-table").tabulator("setData",[
	{id:1, name:"Billy Bob", age:"12", gender:"male", height:1, col:"red", dob:"", cheese:1},
	{id:2, name:"Mary May", age:"1", gender:"female", height:2, col:"blue", dob:"14/05/1982", cheese:true},
]);
```

###Set data using AJAX
If you wish to retrieve your data from a remote source, pass the URL to the ***setData*** method and it will perform the AJAX request for you. The URL can be absolute or relative.

```js
$("#example-table").tabulator("setData","http://www.getmydata.com/now");
```
Data must be provided in the form of a JSON formatted array of objects.

If you always request the same url for your data then you can set it in the ***ajaxURL*** option when you create your Tabulator
```js
$("#example-table").tabulator({
	ajaxURL:"http://www.getmydata.com/now",
});
```
and call ***setData*** to refresh the data at any point
```js
$("#example-table").tabulator("setData");
```

Sorting Data
================================
Sorting of data by column is enabled by default on all columns. It is possible to turn sorting on or off globally using the ***sortable*** option when you create your Tabulator.
```js
$("#example-table").tabulator({
	sortable:false, // this option takes a boolean value (default = true)
});

you can set sorting on a per column basis using the ***sortable*** option in the column data.
```js
{title:"Name", field:"name", sortable:true, sorter:"string"}
```

### Sorter type
By default all data is sorted as a string. if you wish to specify a different sorting method then you should include the ***sorter*** option in the column data.

Tabulator comes with a number of preconfigured sorters including:
- **string** - sorts column as strings of characters
- **number** - sorts column as numbers (integer or float)
- **boolean** - sorts column as booleans
- **date** - sorts column as dates (for this you will need to set the date format using the ***dateFormat*** option when you create your table. default format is "dd/mm/yyyy")

You can define a custom sorter function in the sorter option:
```js
{title:"Name", field:"name", sortable:true, sorter:function(a, b){
		//a and b are the two values being compared
		return a - b; //you must return the difference between the two values
	},
}
```

Formatting Data
================================
Tabulator allows you to format your data in a wide variety of ways, so your tables can display information in a more graphical and clear layout.

you can set formatters on a per column basis using the ***formatter*** option in the column data.
```js
{title:"Name", field:"name", formatter:"tick"}
```

Tabulator comes with a number of preconfigured formatters including:
- **email** - renders data as an anchor with a mailto: link to the given value
- **link** - renders data as an anchor with a link to the given value
- **tick** - displays a green tick if the value is (true|'true'|'True'|1) and an empty cell if not
- **tickCross** - displays a green tick if the value is (true|'true'|'True'|1) and a red cross if not
- **star** - displays a graphical 0-5 star rating based on integer values from 0-5;
- **progress** - displays a progress bar that fills the cell from left to right, using values 0-100 as a percentage of width

You can define a custom formatter function in the formatter option:
```js
{title:"Name", field:"name", formatter:function(value, data, cell, row, options){
		//value - the value of the cell
		//data - the data for the row the cell is in
		//cell - the DOM element of the cell
		//row - the DOM element of the row
		//options - the options set for this tabulator
		return "<div></div>"; // must return the html or jquery element of the html for the contents of the cell;
	},
}
```

Table Layout
================================
Tabulator will arrange your data to fit as neatly as possible into the space provided. It has two different layout styles:

- Fit columns to data (default)
- Fit columns to container

###Fit Columns to data
This is the default table layout style and will cause columns to resize to fit the widest element they contain (unless a column width was set in the column options). This can cause the table to be wider than its containing element, in this case a scroll bar will appear;

###Fit Columns to container
This option will resize columns so that they fit perfectly inside the width of the container.

If a width is specified on any columns, where possible the columns will be set at this width and other columns will be resized around them. If there is not enough space to fit all the columns in, then all column widths are ignored and they are sized equally.

In this layout style at least one column must ***not*** have a width specified so it can be resized to fill any spare space.

to enable this layout mode set the ***fitColumns*** option to true when you create your Tabulator.
```js
$("#example-table").tabulator({
	fitColumns:true, // this option takes a boolean value (default = false)
});
```

###Resizable columns
By default it is possible to manually resize columns by dragging the borders of the column headers.

To disable this option globally set the ***colResizable*** option to false when you create your Tabulator.
```js
$("#example-table").tabulator({
	colResizable:false, // this option takes a boolean value (default = true)
});
```

###Minimum Column Width
It is possible to set a minimum column width to prevent resizing columns from becoming too small.

This can be set globally, by setting the ***colMinWidth*** option to the column width when you create your Tabulator.
```js
$("#example-table").tabulator({
	colMinWidth:80, //Minimum column width in px (default = 40)
});
```

###Redrawing the table
If the size of the element containing the Tabulator changes it is necessary to redraw the table to make sure the columns fit the new dimensions.

This can be done by calling the ***redraw*** method. For example, to trigger a redraw whenever the viewport width is changed:
```js
$(window).resize(function(){
	$("#example-table").tabulator("redraw");
});
```

Table Options
================================
In addition to the features mentioned above Tabulator has a range of aditional options to help customise your table.

###Table Theming
Tabulator allows you to set a number of global options that can help theme your table.

Option | Data Type | Default Value | Description
---|---|---|---
backgroundColor|string|#888| A valid css color(rgb,hex,etc...) for the background of the tabulator element
borderColor|string|#999| A valid css color(rgb,hex,etc...) for the border of the tabulator element
textSize|int/string|14| the text size for all text in the tabulator
headerBackgroundColor|string|#e6e6e6|A valid css color(rgb,hex,etc...) for the header cells
headerTextColor|string|#555|A valid css color(rgb,hex,etc...) for the header cells text
headerBorderColor|string|#aaa|A valid css color(rgb,hex,etc...) for the header cells border
headerSeperatorColor|string|#999|A valid css color(rgb,hex,etc...) for the header row bottom border
headerMargin|int/string|4|The size in pixels for the header cells margin
sortArrows|object||an object containing two options for theming the sorter arrows in the header *(see next table)*
rowBackgroundColor|string|#fff|A valid css color(rgb,hex,etc...) for the background colour of the table rows
rowBorderColor|string|#fff|A valid css color(rgb,hex,etc...) for the table row borders
rowTextColor|string|#333|A valid css color(rgb,hex,etc...) for the table row text
rowHoverBackground|string|#bbb|A valid css color(rgb,hex,etc...) for the table row background when hovered over.

#####Sort Arrow Theming
The ***sortArrows*** option contains two options

Option | Data Type | Default Value | Description
---|---|---|---
active|string|#666| A valid css color(rgb,hex,etc...) for the sorter arrow on currently sorted column
inactive|string|#bbb|A valid css color(rgb,hex,etc...) for the sorter arrow on unsorted column


###Table Size

Option | Data Type | Default Value | Description
---|---|---|---
height|string/int|false|Sets the height of the containing element, can be set to any valid height css value. If set to false (the default), the height of the table will resize to fit the table data.


###Data Loaders
When loading data, Tabulator can display a loading overlay over the table. This cosistis of a modal background and a loader element. The loader element can be set globaly in the options and should be specified as a div with a ***display*** style of ***inline-block***.

Option | Data Type | Default Value | Description
---|---|---|---
showLoader|boolean|true| Show loader while data is loading
loader|string|html (see below)| html for loader element
loaderError|string|html (see below)| html for the loader element in the event of an error

#####Default loader element
```html
<div style='display:inline-block; border:4px solid #333; border-radius:10px; background:#fff; font-weight:bold; font-size:16px; color:#000; padding:10px 20px;'>Loading Data</div>
```

#####Default loader error element
```html
<div style='display:inline-block; border:4px solid #D00; border-radius:10px; background:#fff; font-weight:bold; font-size:16px; color:#590000; padding:10px 20px;'>Loading Error</div>
```

Callbacks
================================
Tabulator features a range of callbacks to allow you to handle user interaction.

###Cell Click
The cell click callback is triggered when a user left clicks on a cell, it can be set on a per column basis using the ***onClick*** option in the columns data.

```js
{title:"Name", field:"name", onClick:function(e, cell, value, data){
		//e - the click event object
		//cell - the DOM element of the cell
		//value - the value of the cell
		//data - the data for the row the cell is in
	},
}
```

###Row Click
The row click callback is triggered when a user clicks on a row, it can be set globally, by setting the ***rowClick*** option when you create your Tabulator.
```js
$("#example-table").tabulator({
	rowClick:function(e, id, data, row){
		//e - the click event object
		//id - the id of the row
		//data - the data for the row
		//row - the DOM element of the row
	},
});
```

###Row Context Menu
The row context callback is triggered when a user right clicks on a row, it can be set globally, by setting the ***rowContext*** option when you create your Tabulator.
```js
$("#example-table").tabulator({
	rowContext:function(e, id, data, row){
		//e - the click event object
		//id - the id of the row
		//data - the data for the row
		//row - the DOM element of the row
	},
});
```

###Data Loaded
The data loaded callback is triggered when a new set of data is loaded into the table, it can be set globally, by setting the ***dataLoaded*** option when you create your
```js
$("#example-table").tabulator({
	dataLoaded:function(data){
		//data - the data for the row
	},
});
```

Events
================================
A number of events are fired as the Tabulator is loaded and rendered:

Event | Description
---|---
dataLoading|Data is being loaded (from string, array or AJAX source)
dataLoadError|There is has been an error loading data from an AJAX source
renderStarted|Table is has started to render
renderComplete|Table is has finished being rendered
sortStarted|Table has started sorting
sortComplete|Table has finished sorting

Coming Soon
================================
Tabulator is actively under development and I plan to have even more useful features implemented soon, including:

- Grouping Data
- Filtering Data
- Editable Cells
- Movable Rows
- Deleteable Rows
- Extra Formatters
- Extra Sorters
- More Theming Options