Tabulator
================================
An easy to use table generation JQuery UI Plugin

Tabulator allows you to create  a table with in seconds from any JSON formatted data.

It is not dependant on any external css or images, simply include the library in your JQuery UI project and you're away!

![Tabluator Table](/example_table.jpg?raw=true")

Tabulator is packed with useful  features including:

- JSON, array or AJAX data loading
- Column sorting
- Editable cells
- Adding/Deleting rows
- Custom data formatting
- Movable rows and columns
- Grouping Rows
- Data filtering
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
<div id="example-table"></div>
```

Turn the element into a tabulator with some simple javascript
```js
$("#example-table").tabulator();
```

###Live Demo

A live demo of tabulator in action can be found [here](http://htmlpreview.github.io/?https://github.com/olifolkerd/tabulator/blob/master/examples.html).

###Examples
A selection of demo tables can be found in the ***examples.html*** file.

Define Column Headers
================================
Column headers are defined as an array of JSON objects passed into the columns option when you create your tabulator

```js
$("#example-table").tabulator({
	columns:[
		{title:"Name", field:"name", sortable:true, sorter:"string", width:200, editable:true},
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
- **field** - ***Required*** *(not required in icon/button columns)* this is the key for this column in the data array
- **align** - sets the text alignment for this column (left|center|right)
- **width** - sets the width of this column (if not set the system will determine the best)
- **sortable** - determines if the user can sort data by this column (see [Sorting Data](#sorting-data) for more details)
- **sorter** - determines how to sort data in this column (see [Sorting Data](#sorting-data) for more details)
- **formatter** - set how you would like the data to be formatted (see [Formatting Data](#formatting-data) for more details)
- **onClick** - callback for when user clicks on a cell in this column (see [Callbacks](#callbacks) for more details)
- **editable** - *(boolean, default - false)* determines if this data is editable by the user. will use the editor that matches the formatter by default. (see [Manipulating Data](#manipulating-data) for more details)
- **editor** - set the editor to be used when editing the data. (see [Manipulating Data](#manipulating-data) for more details)
- **visible** - *(boolean, default - true)* determines if the column is visible

Set Table Data
================================
Tabulator row data is defined as an array of objects, that can either be passed as an array or retrieved as a JSON formatted string via AJAX from a URL.

The data can contain more columns that are defined in the columns options, these will be stored with the rest of the data, but not rendered to screen.

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

###Row Index
A unique numerical index value must be present for each row of data. By default Tabulator will look for this value in the ***id*** field for the data. If you wish to use a different field as the index, set this using the ***index*** option parameter.

```js
$("#example-table").tabulator({
	index:"age", //set the index field to the "age" field.
});
```

If the index is missing from the provided data, tabulator will generate one from the position of the data in the original array.

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
- **number** - sorts column as numbers (integer or float, will also handle numbers using "," seperators)
- **alphanum** - sorts column as alpha numeric code
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
### Sort Data on load
When data is loaded into the table it can be automatically sorted by a specified field, this field can be set in the options using the ***sortBy*** and ***sortDir*** parameters. see [Initial Data Sorting](#initial-data-sorting) for more details)

### Trigger Sorting Programmatically
You can trigger sorting using the ***sort*** function
```js
$("#example-table").tabulator("sort", "age", "asc");
```

If you wish to sort by multiple columns then you can pass an array of sorting objects to this function, the data will then be sorted in the order of the objects.

```js
$("#example-table").tabulator("sort", [
   {field:"age", dir:"asc"}, //sort by this first
   {field:"height", dir:"desc"}, //then sort by this second
]);
```

Formatting Data
================================
Tabulator allows you to format your data in a wide variety of ways, so your tables can display information in a more graphical and clear layout.

You can set formatters on a per column basis using the ***formatter*** option in the column data.

You can pass an optional additional parameter with formatter, ***formatterParams*** that should contain an object with additional information for configuring the formatter.
```js
{title:"Name", field:"name", formatter:"star", formatterParams:{stars:6}}
```

Tabulator comes with a number of preconfigured formatters including:
- **money** - formats a number into currency notation (eg. 1234567.8901 -> 1,234,567.89)
- **email** - renders data as an anchor with a mailto: link to the given value
- **link** - renders data as an anchor with a link to the given value
- **tick** - displays a green tick if the value is (true|'true'|'True'|1) and an empty cell if not
- **tickCross** - displays a green tick if the value is (true|'true'|'True'|1) and a red cross if not
- **star** - displays a graphical star rating based on integer values
  - optional  **formatterParams**
  - **stars** - maximum number of stars to be displayed *(default 5)*
- **progress** - displays a progress bar that fills the cell from left to right, using values 0-100 as a percentage of width
  - optional **formatterParams**
  - **min** - minimum value for progress bar *(default 0)*
  - **max** - minimum value for progress bar *(default 100)*
  - **color** - colour of progress bar *(default #2DC214)*


You can define a custom formatter function in the formatter option:
```js
{title:"Name", field:"name", formatter:function(value, data, cell, row, options, formatterParams){
		//value - the value of the cell
		//data - the data for the row the cell is in
		//cell - the DOM element of the cell
		//row - the DOM element of the row
		//options - the options set for this tabulator
		//formatterParams - parameters set for the column
		return "<div></div>"; // must return the html or jquery element of the html for the contents of the cell;
	},
}
```

###Icon/Button Columns
You can create icon/button columns, by not specifying the ***field*** parameter in the column data and creating a custom formatter for the column contents. In the example below we have created a print button on the left of each row.

```js
//custom formatter definition
var printIcon = function(value, data, cell, row, options){ //plain text value
			return "<i class='fa fa-print'></i>"
};

//column definition in the columns array
{formatter:printIcon, width:40, align:"center", onClick:function(e, cell, val, row){alert("Printing row data for: " + row.name)}},

```

###Row Formatting
Tabulator also allows you to define a row level formatter using the ***rowFormatter*** option. this lets you alter each row of the table based on the data it contains.

The example below changes the background colour of a cell to blue if the ***col*** value for that row is ***"blue"***.

```js
$("#example-table").tabulator({
	rowFormatter:function(row, data){
		//row - JQuery object for row
		//data - the data for the row

		if(data.col == "blue"){
			row.css({"background-color":"#A6A6DF"});
		}
	},
});


Grouping Data
================================

With Tabulator you can group rows together using the ***groupBy*** option.

To group by a field, set this option to the name of the field to be grouped.
```js
groupBy:"gender",
```

To group by more complex operations you should pass a function that returns a string that represents the group.
```js
groupBy:function(data){
   return data.gender + " - " + data.age; //groups by data and age
}
```

### Custom Group Headers
You can set the contents of the group headers with the ***groupHeader*** option. This should return the contents of the group header.
```js
groupHeader:function(value, count, data){
   return value + "<span style='color:#d00; margin-left:10px;'>(" + count + " item)</span>";
},
```

Filtering Data
================================
Tabulator allows you to filter the table data by any field in the data set.

To set a filter you need to call the ***setFilter*** method, passing the field you wish to filter, the comparison type and the value to filter for.
```js
	$("#example-table").tabulator("setFilter", "age", ">", 10);
```

Tabulator comes with a number of filter comparison types including:
- **=** - Displays only rows with data that is the same as the filter
- **&lt;** - displays rows with a value less than the filter value
- **&lt;=** - displays rows with a value less than or qual to the filter value
- **&gt;** - displays rows with a value greater than the filter value
- **&gt;=** - displays rows with a value greater than or qual to the filter value
- **!=** - displays rows with a value that is not equal to the filter value
- **like** - displays any rows with data that contains the specified string anywhere in the specified field. (case insesitive)

By default tabulator will assume you want to use the "=" comparison unless otherwise stated. This allows for the short hand use of the function:
```js
	$("#example-table").tabulator("setFilter", "name", "bob");
```

You can only have one filter active at a time, calling setFilter a second time will over write the previous filter.

Filters will remain in effect until they are cleared, including during ***setData*** calls.

###Get Current Filter
To find out what filter is currently applied to the table you should use the ***getFilter*** method.
```js
	$("#example-table").tabulator("getFilter");
```
If there is no filter set, this will return ***false***, otherwise it will return an object with the filter information.
```js
{
	"field":"age",
	"type":">",
	"value":10,
}
```

###Clearing Filters
To remove filters from the table you should use the ***clearFilter*** method.
```js
	$("#example-table").tabulator("clearFilter");
```
alternatively you can also call the ***setFilter*** method with no parameters to clear the filter.
```js
	$("#example-table").tabulator("setFilter");
```


Manipulating Data
================================
Tabulator allows you to manipulate the data in the table in a number of different ways

### Editable Data
Columns of the table can be set as editable using the ***editable*** parameter in the column definition. (see [Define Column Headers](#define-column-headers) for more details).

When a user clicks on an editable column the will be able to edit the value for that cell.

By default Tabulator will use an editor that matches the current formatter for that cell. if you wish to specify a specific editor, you can set them per column using the ***editor*** option in the column definition.

```js
{title:"Name", field:"rating", editor:"star"}
```

 Tabulator comes with a number of preconfigured editors including:
- **input** - editor for plain text
- **tick** - editor for tick and tickCross columns.
- **star** - editor for star columns (can use left/right arrow keys and enter for selection as well as mouse).
- **progress** -  editor for progress bar columns (can use left/right arrow keys and enter for selection as well as mouse)

You can define a custom editor function in the editor option:

```js
{title:"Name", field:"rating", editor:function(cell, value){
		//cell - JQuery object for current cell
		//value - the current value for current cell

		//create and style editor
		var editor = $("<select><option value=''></option><option value='male'>male</option><option value='female'>female</option></select>");
		editor.css({
			"border":"1px",
			"background":"transparent",
			"padding":"3px",
			"width":"100%",
			"box-sizing":"border-box",
		})

		//Set value of editor to the current value of the cell
		editor.val(value);

		//set focus on the select box when the editor is selected (timeout allows for editor to be added to DOM)
		setTimeout(function(){
			editor.focus();
		},100)

		//when the value has been set, trigger the cell to update
		editor.on("change blur", function(e){
			cell.trigger("editval", editor.val());
		});

		//return the editor element
		return editor;
	},
}
```

### Retreiving Data
You can retreive the data stored in the table using the ***getData** function.
```js
var data = $("#example-table").tabulator("getData");
```
This will return an array containing the data objects for each row in the table.


### Add Row
Additional rows can be added to the table at any point using the ***addRow*** function:
```js
$("#example-table").tabulator("addRow", {name:"Billy Bob", age:"12", gender:"male", height:1});
```
If you do not pass data for a column, it will be left empty. to create a blank row (ie for a user to fill in), pass an empty object to the function.

By default any new rows will be added to the bottom of the table, to change this to the top set the ***addRowPos*** option to "top";

### Delete Row
You can delete any row in the table using the ***deleteRow** function;
```js
$("#example-table").tabulator("deleteRow", 15);
```
You can either pass the function the id of the row you wish to delete or the data object that represents that row.


### Clear Table
You can clear all data in the table using the ***clear** function:
```js
$("#example-table").tabulator("clear");
```

Movable Rows and Columns
================================
### Movable Rows

To allow the user to move rows up and down the table, set the ***movableRows*** parameter in the options:
```js
$('#example-table'),tabulator({
	movableRows: true, //enable user movable rows, by default this is set to false
})
```
This will allow users to drag rows around using the handle on the left hand side of each row.

if you would like to use a custom handle for a row then set the ***movableRowHandle*** parameter with the HTML for the handle graphic.
```js
$('#example-table'),tabulator({
	movableRows: true, //enable user movable rows, by default this is set to false
	movableRowHandle: "<div style='height:10px; width:10px; background:#f00;'></div>", //custom handle html
})
```
**NOTE:** When grouping is enabled, rows can only be moved within their own group.

When a row has been successfully moved, the ***rowMoved*** callback will be triggered.
```js
$("#example-table").tabulator({
	rowMoved:function(id, data, row, index){
		//id - the id of the row
		//data - the data for the row
		//row - the DOM element of the row
		//index - new position of row in table
	}
});
```


###Movable Columns

To allow the user to move columns along the table, set the ***movableCols*** parameter in the options:
```js
$('#example-table'),tabulator({
	movableCols: true, //enable user movable rows, by default this is set to false
})
```
This will allow users to drag columns around using the column headers at the top of the table.

**NOTE:** icon/button columns and row handle columns are not movable.

When a column has been successfully moved, the ***colMoved*** callback will be triggered.
```js
$("#example-table").tabulator({
	colMoved:function(field, columns){
		//field- the filed name of the moved column
		//columns- the updated columns config array
	}
});
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

###Initial Data Sorting
When data is loaded into the table it can be automatically sorted by a specified field

Option | Data Type | Default Value | Description
---|---|---|---
sortBy|string|"id"| the name of the field to be sorted
sortDir|string|"DESC"| The direction of the sort (ASC or DESC).


###Added Rows
Option | Data Type | Default Value | Description
---|---|---|---
addRowPos|string|"bottom"| The position in the table for new rows to be added, "bottom" or "top"


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
editBoxColor|string|#1D68CD|A valid css color(rgb,hex,etc...) for border of a cell being edited.

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
When loading data, Tabulator can display a loading overlay over the table. This consists of a modal background and a loader element. The loader element can be set globally in the options and should be specified as a div with a ***display*** style of ***inline-block***.

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

CSS Clases
================================
Tabulator elements are assigned a range of CSS classes to make it easier for you to manipulate the look, feel and function of the table.

Class | Element Description
---|---
tabulator | Tabulator container element
tabulator-header | Column header row
tabulator-col | Column header (in header row)
tabulator-handle | Invisible resize handle on the right of each column header
tabulator-arrow | Sorting arrows
tabulator-tableHolder | Contain table and scroll bars
tabulator-table | Contain table rows
tabulator-row | Row of table
tabulator-cell | Data cell
tabulator-group | A group of rows (including group header)
tabulator-group-header | Contains header for a group
tabulator-group-body | Contains all data rows for a group
tabulator-loader-msg | Ajax loader message


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

###Row Added
The row added callback is triggered when a row is added to the table by the ***addRow** function.
```js
$("#example-table").tabulator({
	rowAdded:function(data){
		//data - the data for the row
	},
});
```

###Row Edit
The row edit callback is triggered when data in an editable row is changed.
```js
$("#example-table").tabulator({
	rowEdit:function(id, data, row){
		//id - the id of the row
		//data - the data for the row
		//row - the DOM element of the row
	},
});
```

###Row Deleted
The row deleted callback is triggered when a row is deleted from the table by the ***deleteRow*** function.
```js
$("#example-table").tabulator({
	rowDelete:function(id){
		//id - the id of the row
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
filterStarted|Table Filter has started
filterComplete|Filter has been applied to table

Coming Soon
================================
Tabulator is actively under development and I plan to have even more useful features implemented soon, including:

- Pagination (via Ajax or in-table)
- Table Footers
- Custom Filter Functions
- Column Visibility Toggle Functions
- Import/Export Column Data (size/position/visibility)
- Sparkline Formatter
- Extra Formatters
- Extra Sorters
- More Theming Options

Get in touch if there are any features you feel Tabulator needs.