Tabulator
================================
An easy to use table generation JQuery UI Plugin

Tabulator allows you to creat a table with in seconds from any JSON formatted data.

It relys on no external css or images, simply include the library in your jquery ui project and you're away!


Setup
================================
Seting up tabulator couldnt be simpler

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
$("example-table").tabulator();
```

Define Column Headers
================================
Column headers are defined as an array of JSON objects passed into the columns option when you create your tabulator

```js
$("example-table").tabulator({
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
There are a number of parameters that can be passed in with each column to dertermin how it is displayed:

- **title** - ***REQUIRED*** This is the title that will be displayed in the header for this column
- **field** - ***REQUIRED*** this is the key for this coulmn in the data array
- **align** - sets the text alignment for this column (left|center|right)
- **width** - sets the width of this column (if not set the system will determine the best)
- **sortable** - determines if the user can sort data by this column (see *Sorting Section* for more details)
- **sorter** - determines how to sort data in this column (see *Sorting Section* for more details)
- **formatter** - set how you would like the data to be formatted (see *Formatting Section* for more details)
- **onClick** - callback for when user clicks on a cell in this column (see [*Callback Section*](#callbacks) for more details)

Set Table Data
================================
Tabulator row data is defined as an array of objects, that can either be passed as an array or retreived as a JSON formatted string via AJAX from a url.

The data can contain more columns that are defined in the columns options, these will be sotred with the rest of the data, but not rendered to screen.

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

Set data using array
--------------------------------
You can pass an array of data directly to the table using the ***setData*** method.

```js
$("example-table").tabulator("setData",[
	{id:1, name:"Billy Bob", age:"12", gender:"male", height:1, col:"red", dob:"", cheese:1},
	{id:2, name:"Mary May", age:"1", gender:"female", height:2, col:"blue", dob:"14/05/1982", cheese:true},
]);
```

Set data using AJAX
--------------------------------
if you wish to reteive your data from a remote source then simply pass the url to the set data method and it will perform the ajax request for you.

```js
$("example-table").tabulator("setData","http://www.getmydata.com/now");
```
Data must be provided in the form of a JSON formatted array of objects;

If you will allways request the same url for your data then you can set it in the ***ajaxURL*** option when you create your Tabulator

```js
$("example-table").tabulator({
	ajaxURL,"http://www.getmydata.com/now",
});
```
and call ***setData*** to refresh the data at any point
```js
$("example-table").tabulator("setData");
```

Sorting Data
================================
*more info comming soon*

Formatting Data
================================
*more info comming soon*

Table Layout
================================
*more info comming soon*

Options
================================
*more info comming soon*

Callbacks
================================
*more info comming soon*

Events
================================
*more info comming soon*

Comming Soon
================================
Tabulator is activly under development and i plan to have even more useful features implemented soon, including:

- Grouping Data
- Editable Cells
- Extra Formatters
- Extra Sorters
- More Theming Options