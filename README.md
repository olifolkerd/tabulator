![Tabluator Table](http://olifolkerd.github.io/tabulator/images/tabulator.png)

### Version 2.5 Out Now!

An easy to use interactive table generation plugin for JQuery UI

Full documentation & demos can be found at: [http://olifolkerd.github.io/tabulator](http://olifolkerd.github.io/tabulator)
***
![Tabluator Table](http://olifolkerd.github.io/tabulator/images/tabulator_table.jpg)
***
Features
================================
Tabulator allows you to create interactive tables in seconds from any HTML Table, Javascript Array or JSON formatted data.

Simply include the library and the css in your JQuery UI project and you're away!

Tabulator is packed with useful  features including:

- Fully CSS styleable
- JSON, array or AJAX data loading
- Column sorting
- Pagination
- Editable cells
- Adding/Deleting rows
- Custom data formatting
- Movable rows and columns
- Persistant Column Layouts (cookie storage of user layout changes)
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

Include the library and the css
```html
<link href="tabulator.css" rel="stylesheet">
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


### Bower Installation
To get Tabulator via the Bower package manager, open a terminal in your project directory and run the following commmand:
```
bower install tabulator --save
```

### NPM Installation
To get Tabulator via the NPM package manager, open a terminal in your project directory and run the following commmand:
```
npm install jquery.tabulator --save
```

Coming Soon
================================
Tabulator is actively under development and I plan to have even more useful features implemented soon, including:

- Pagination via AJAX request
- Multi row column headers / column grouping
- Selectable Rows
- Custom Row Templates
- Minified source files
- Minified CSS and JS
- Extra Formatters
- Extra Sorters
- Usage Case Examples (creating custom formatters, etc...)

Get in touch if there are any features you feel Tabulator needs.