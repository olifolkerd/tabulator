![Tabluator Table](http://olifolkerd.github.io/tabulator/images/tabulator.png)

### Version 2.12 Out Now!

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
- Column Freezing
- Responsive Layout
- Pagination
- Editable cells
- Data Accessors and Mutators
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

Version 3.0 Comming Soon!
================================
Work has begun on the next big installment of Tabulator. I am doing a ground up rebuild of the core code to make it more modular, extensible and manageable. Version 3.0 will include the following features:
- Virtual DOM to massively improve render efficiency
- Modularised code to improve maintainablity and extension
- Extension Modules, breaking down sorting, formatting, mutating data and more into optional modules so you only have to includethe code you want to use
- Uniform Function and Callback naming to improve usability
- Improved CSS structure
- Uniform callback arguments
- New folder structure
- Webpack project build files
- A load of new features and tweaks

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

### CDNJS
To access Tabulator directly from the CDNJS CDN servers, include the following two lines at the start of your project, instead of the localy hosted versions:
```html
<link href="https://cdnjs.cloudflare.com/ajax/libs/tabulator/2.11.0/tabulator.min.css" rel="stylesheet">
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/tabulator/2.11.0/tabulator.min.js"></script>
```

Coming Soon
================================
Tabulator is actively under development and I plan to have even more useful features implemented soon, including:


- Custom Row Templates
- Aditional Editors and Formatters
- Column Calculations
- Copy to Clipboard
- Print Styling
- Drag Rows Between Tables
- Keyboard Cell Navigation
- Minified source files
- Minified CSS and JS




Get in touch if there are any features you feel Tabulator needs.