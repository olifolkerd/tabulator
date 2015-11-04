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
		{title:"Name", field:"name", sorter:"string", width:200},
		{title:"Age", field:"age", sorter:"number", align:"right", formatter:"progress"},
		{title:"Gender", field:"gender", sorter:"string", onClick:function(e, val, cell, row){console.log("cell click - " + val, cell)},},
		{title:"Height", field:"height", formatter:"star", align:"center", width:100},
		{title:"Favourite Color", field:"col", sorter:"string", sortable:false},
		{title:"Date Of Birth", field:"dob", sorter:"date", align:"center"},
		{title:"Cheese Preference", field:"cheese", align:"center", formatter:"tickCross", sorter:"boolean"},
	],
});
```
There are a number of parameters that can be passed in with each column to dertermin how it is displayed:

- **title** - **REQUIRED** This is the title that will be displayed in the header for this column
- **field** - **REQUIRED** this is the key for this coulmn in the data array



Set Data
================================
