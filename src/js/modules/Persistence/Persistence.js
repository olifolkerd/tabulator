import Module from '../../core/Module.js';

import defaultReaders from './defaults/readers.js';
import defaultWriters from './defaults/writers.js';

class Persistence extends Module{

	constructor(table){
		super(table);

		this.mode = "";
		this.id = "";
		// this.persistProps = ["field", "width", "visible"];
		this.defWatcherBlock = false;
		this.config = {};
		this.readFunc = false;
		this.writeFunc = false;

		this.registerTableOption("persistence", false);
		this.registerTableOption("persistenceID", ""); //key for persistent storage
		this.registerTableOption("persistenceMode", true); //mode for storing persistence information
		this.registerTableOption("persistenceReaderFunc", false); //function for handling persistence data reading
		this.registerTableOption("persistenceWriterFunc", false); //function for handling persistence data writing
	}

	// Test for whether localStorage is available for use.
	localStorageTest() {
		var  testKey =  "_tabulator_test";

		try {
			window.localStorage.setItem( testKey, testKey);
			window.localStorage.removeItem( testKey );
			return true;
		} catch(e) {
			return false;
		}
	}

	//setup parameters
	initialize(){
		if(this.table.options.persistence){
			//determine persistent layout storage type
			var mode = this.table.options.persistenceMode,
			id = this.table.options.persistenceID,
			retreivedData;

			this.mode = mode !== true ?  mode : (this.localStorageTest() ? "local" : "cookie");

			if(this.table.options.persistenceReaderFunc){
				if(typeof this.table.options.persistenceReaderFunc === "function"){
					this.readFunc = this.table.options.persistenceReaderFunc;
				}else{
					if(Persistence.readers[this.table.options.persistenceReaderFunc]){
						this.readFunc = Persistence.readers[this.table.options.persistenceReaderFunc];
					}else{
						console.warn("Persistence Read Error - invalid reader set", this.table.options.persistenceReaderFunc);
					}
				}
			}else{
				if(Persistence.readers[this.mode]){
					this.readFunc = Persistence.readers[this.mode];
				}else{
					console.warn("Persistence Read Error - invalid reader set", this.mode);
				}
			}

			if(this.table.options.persistenceWriterFunc){
				if(typeof this.table.options.persistenceWriterFunc === "function"){
					this.writeFunc = this.table.options.persistenceWriterFunc;
				}else{
					if(Persistence.writers[this.table.options.persistenceWriterFunc]){
						this.writeFunc = Persistence.writers[this.table.options.persistenceWriterFunc];
					}else{
						console.warn("Persistence Write Error - invalid reader set", this.table.options.persistenceWriterFunc);
					}
				}
			}else{
				if(Persistence.writers[this.mode]){
					this.writeFunc = Persistence.writers[this.mode];
				}else{
					console.warn("Persistence Write Error - invalid writer set", this.mode);
				}
			}

			//set storage tag
			this.id = "tabulator-" + (id || (this.table.element.getAttribute("id") || ""));

			this.config = {
				sort:this.table.options.persistence === true || this.table.options.persistence.sort,
				filter:this.table.options.persistence === true || this.table.options.persistence.filter,
				group:this.table.options.persistence === true || this.table.options.persistence.group,
				page:this.table.options.persistence === true || this.table.options.persistence.page,
				columns:this.table.options.persistence === true ? ["title", "width", "visible"] : this.table.options.persistence.columns,
			};

			//load pagination data if needed
			if(this.config.page){
				retreivedData = this.retreiveData("page");

				if(retreivedData){
					if(typeof retreivedData.paginationSize !== "undefined" && (this.config.page === true || this.config.page.size)){
						this.table.options.paginationSize = retreivedData.paginationSize;
					}

					if(typeof retreivedData.paginationInitialPage !== "undefined" && (this.config.page === true || this.config.page.page)){
						this.table.options.paginationInitialPage = retreivedData.paginationInitialPage;
					}
				}
			}

			//load group data if needed
			if(this.config.group){
				retreivedData = this.retreiveData("group");

				if(retreivedData){
					if(typeof retreivedData.groupBy !== "undefined" && (this.config.group === true || this.config.group.groupBy)){
						this.table.options.groupBy = retreivedData.groupBy;
					}
					if(typeof retreivedData.groupStartOpen !== "undefined" && (this.config.group === true || this.config.group.groupStartOpen)){
						this.table.options.groupStartOpen = retreivedData.groupStartOpen;
					}
					if(typeof retreivedData.groupHeader !== "undefined" && (this.config.group === true || this.config.group.groupHeader)){
						this.table.options.groupHeader = retreivedData.groupHeader;
					}
				}
			}

			if(this.config.columns){
				this.table.options.columns = this.load("columns", this.table.options.columns);
				this.subscribe("column-init", this.initializeColumn.bind(this));
				this.subscribe("column-show", this.save.bind(this, "columns"));
				this.subscribe("column-hide", this.save.bind(this, "columns"));
				this.subscribe("column-moved", this.save.bind(this, "columns"));
			}

			this.subscribe("table-built", this.tableBuilt.bind(this), 0);

			this.subscribe("table-redraw", this.tableRedraw.bind(this));

			this.subscribe("filter-changed", this.eventSave.bind(this, "filter"));
			this.subscribe("sort-changed", this.eventSave.bind(this, "sort"));
			this.subscribe("group-changed", this.eventSave.bind(this, "group"));
			this.subscribe("page-changed", this.eventSave.bind(this, "page"));
			this.subscribe("column-resized", this.eventSave.bind(this, "columns"));
			this.subscribe("layout-refreshed", this.eventSave.bind(this, "columns"));
		}

		this.registerTableFunction("getColumnLayout", this.getColumnLayout.bind(this));
		this.registerTableFunction("setColumnLayout", this.setColumnLayout.bind(this));
	}

	eventSave(type){
		if(this.config[type]){
			this.save(type);
		}
	}

	tableBuilt(){
		var options = this.table.options,
		sorters, filters;

		if(this.config.sort){
			sorters = this.load("sort");

			if(!sorters === false){
				this.table.options.initialSort = sorters;
			}
		}

		if(this.config.filter){
			filters = this.load("filter");

			if(!filters === false){
				this.table.options.initialFilter = filters;
			}
		}
	}

	tableRedraw(force){
		if(force && this.config.columns){
			this.save("columns");
		}
	}

	///////////////////////////////////
	///////// Table Functions /////////
	///////////////////////////////////

	getColumnLayout(){
		return this.parseColumns(this.table.columnManager.getColumns());
	}

	setColumnLayout(layout){
		this.table.columnManager.setColumns(this.mergeDefinition(this.table.options.columns, layout))
		return true;
	}

	///////////////////////////////////
	///////// Internal Logic //////////
	///////////////////////////////////

	initializeColumn(column){
		var def, keys;

		if(this.config.columns){
			this.defWatcherBlock = true;

			def = column.getDefinition();

			keys = this.config.columns === true ? Object.keys(def) : this.config.columns;

			keys.forEach((key)=>{
				var props = Object.getOwnPropertyDescriptor(def, key);
				var value = def[key];
				if(props){
					Object.defineProperty(def, key, {
						set: function(newValue){
							value = newValue;

							if(!this.defWatcherBlock){
								this.save("columns");
							}

							if(props.set){
								props.set(newValue);
							}
						},
						get:function(){
							if(props.get){
								props.get();
							}
							return value;
						}
					});
				}
			});

			this.defWatcherBlock = false;
		}
	}

	//load saved definitions
	load(type, current){
		var data = this.retreiveData(type);

		if(current){
			data = data ? this.mergeDefinition(current, data) : current;
		}

		return data;
	}

	//retreive data from memory
	retreiveData(type){
		return this.readFunc ? this.readFunc(this.id, type) : false;
	}

	//merge old and new column definitions
	mergeDefinition(oldCols, newCols){
		var output = [];

		newCols = newCols || [];

		newCols.forEach((column, to) => {
			var from = this._findColumn(oldCols, column),
			keys;

			if(from){
				if(this.config.columns === true || this.config.columns == undefined){
					keys =  Object.keys(from);
					keys.push("width");
				}else{
					keys = this.config.columns;
				}

				keys.forEach((key)=>{
					if(key !== "columns" && typeof column[key] !== "undefined"){
						from[key] = column[key];
					}
				});

				if(from.columns){
					from.columns = this.mergeDefinition(from.columns, column.columns);
				}

				output.push(from);
			}
		});

		oldCols.forEach((column, i) => {
			var from = this._findColumn(newCols, column);

			if (!from) {
				if(output.length>i){
					output.splice(i, 0, column);
				}else{
					output.push(column);
				}
			}
		});

		return output;
	}

	//find matching columns
	_findColumn(columns, subject){
		var type = subject.columns ? "group" : (subject.field ? "field" : "object");

		return columns.find(function(col){
			switch(type){
				case "group":
				return col.title === subject.title && col.columns.length === subject.columns.length;
				break;

				case "field":
				return col.field === subject.field;
				break;

				case "object":
				return col === subject;
				break;
			}
		});
	}

	//save data
	save(type){
		var data = {};

		switch(type){
			case "columns":
			data = this.parseColumns(this.table.columnManager.getColumns())
			break;

			case "filter":
			data = this.table.modules.filter.getFilters();
			break;

			case "sort":
			data = this.validateSorters(this.table.modules.sort.getSort());
			break;

			case "group":
			data = this.getGroupConfig();
			break;

			case "page":
			data = this.getPageConfig();
			break;
		}

		if(this.writeFunc){
			this.writeFunc(this.id, type, data);
		}

	}

	//ensure sorters contain no function data
	validateSorters(data){
		data.forEach(function(item){
			item.column = item.field;
			delete item.field;
		});

		return data;
	}

	getGroupConfig(){
		var data = {};

		if(this.config.group){
			if(this.config.group === true || this.config.group.groupBy){
				data.groupBy = this.table.options.groupBy;
			}

			if(this.config.group === true || this.config.group.groupStartOpen){
				data.groupStartOpen = this.table.options.groupStartOpen;
			}

			if(this.config.group === true || this.config.group.groupHeader){
				data.groupHeader = this.table.options.groupHeader;
			}
		}

		return data;
	}

	getPageConfig(){
		var data = {};

		if(this.config.page){
			if(this.config.page === true || this.config.page.size){
				data.paginationSize = this.table.modules.page.getPageSize();
			}

			if(this.config.page === true || this.config.page.page){
				data.paginationInitialPage = this.table.modules.page.getPage();
			}
		}

		return data;
	}


	//parse columns for data to store
	parseColumns(columns){
		var definitions = [],
		excludedKeys = ["headerContextMenu", "headerMenu", "contextMenu", "clickMenu"];

		columns.forEach((column) => {
			var defStore = {},
			colDef = column.getDefinition(),
			keys;

			if(column.isGroup){
				defStore.title = colDef.title;
				defStore.columns = this.parseColumns(column.getColumns());
			}else{
				defStore.field = column.getField();

				if(this.config.columns === true || this.config.columns == undefined){
					keys =  Object.keys(colDef);
					keys.push("width");
					keys.push("visible");
				}else{
					keys = this.config.columns;
				}

				keys.forEach((key)=>{
					switch(key){
						case "width":
						defStore.width = column.getWidth();
						break;
						case "visible":
						defStore.visible = column.visible;
						break;

						default:
						if(typeof colDef[key] !== "function" && excludedKeys.indexOf(key) === -1){
							defStore[key] = colDef[key];
						}
					}
				});
			}

			definitions.push(defStore);
		});

		return definitions;
	}
}

Persistence.moduleName = "persistence";

Persistence.moduleInitOrder = -10;

//load defaults
Persistence.readers = defaultReaders;
Persistence.writers = defaultWriters;

export default Persistence;