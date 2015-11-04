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
		{title:"Gender", field:"gender", sortable:true, sorter:"string", onClick:function(e, val, cell, row){console.log("cell click - " + val, cell)},},
		{title:"Height", field:"height", sortable:true, formatter:"star", align:"center", width:100},
		{title:"Favourite Color", field:"col", sorter:"string", sortable:false},
		{title:"Date Of Birth", field:"dob", sortable:true, sorter:"date", align:"center"},
		{title:"Cheese Preference", field:"cheese", sortable:true, sorter:"boolean", align:"center", formatter:"tickCross"},
	],
});
```
There are a number of parameters that can be passed in with each column to dertermin how it is displayed:

- **title** - **REQUIRED** This is the title that will be displayed in the header for this column
- **field** - **REQUIRED** this is the key for this coulmn in the data array
- **align** - sets the text alignment for this column (left|center|right)
- **width** - sets the width of this column (if not set the system will determine the best)
- **sortable** - determines if the user can sort data by this column (see *Sorting Section* for more details)
- **sorter** - determines how to sort data in this column (see *Sorting Section* for more details)
- **formatter** - set how you would like the data to be formatted (see *Formatting Section* for more details)
- **onClick** - callback for when user clicks on a cell in this column (see *Callback Section* for more details)

Set Data
================================
