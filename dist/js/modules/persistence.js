/* Tabulator v4.4.3 (c) Oliver Folkerd */

var Persistence = function Persistence(table) {
	this.table = table; //hold Tabulator object
	this.mode = "";
	this.id = "";
	// this.persistProps = ["field", "width", "visible"];
	this.defWatcherBlock = false;
	this.config = {};
};

// Test for whether localStorage is available for use.
Persistence.prototype.localStorageTest = function () {
	var testKey = "_tabulator_test";

	try {
		window.localStorage.setItem(testKey, testKey);
		window.localStorage.removeItem(testKey);
		return true;
	} catch (e) {
		return false;
	}
};

//setup parameters
Persistence.prototype.initialize = function () {
	//determine persistent layout storage type

	var mode = this.table.options.persistenceMode,
	    id = this.table.options.persistenceID,
	    retreivedData;

	this.mode = mode !== true ? mode : this.localStorageTest() ? "local" : "cookie";

	//set storage tag
	this.id = "tabulator-" + (id || this.table.element.getAttribute("id") || "");

	this.config = {
		sort: this.table.options.persistence === true || this.table.options.persistence.sort,
		filter: this.table.options.persistence === true || this.table.options.persistence.filter,
		group: this.table.options.persistence === true || this.table.options.persistence.group,
		page: this.table.options.persistence === true || this.table.options.persistence.page,
		columns: this.table.options.persistence === true ? ["title", "width", "visible"] : this.table.options.persistence.columns
	};

	//load pagination data if needed
	if (this.config.page) {
		retreivedData = this.retreiveData("page");

		if (retreivedData) {
			if (typeof retreivedData.paginationSize !== "undefined") {
				this.table.options.paginationSize = retreivedData.paginationSize;
			}

			// if(typeof retreivedData.paginationInitialPage !== "undefined"){
			// 	this.table.options.paginationInitialPage = retreivedData.paginationInitialPage;
			// }
		}
	}

	//load group data if needed
	if (this.config.group) {
		retreivedData = this.retreiveData("group");

		if (retreivedData) {
			if (typeof retreivedData.groupBy !== "undefined") {
				this.table.options.groupBy = retreivedData.groupBy;
			}
			if (typeof retreivedData.groupStartOpen !== "undefined") {
				this.table.options.groupStartOpen = retreivedData.groupStartOpen;
			}
			if (typeof retreivedData.groupHeader !== "undefined") {
				this.table.options.groupHeader = retreivedData.groupHeader;
			}
		}
	}
};

Persistence.prototype.initializeColumn = function (column) {
	var self = this,
	    def,
	    keys;

	if (this.config.columns) {
		this.defWatcherBlock = true;

		def = column.getDefinition();

		keys = this.config.columns === true ? Object.keys(def) : this.config.columns;

		keys.forEach(function (key) {
			var props = Object.getOwnPropertyDescriptor(def, key);
			var value = def[key];

			Object.defineProperty(def, key, {
				set: function set(newValue) {
					value = newValue;

					if (!self.defWatcherBlock) {
						self.save("columns");
					}

					if (props.set) {
						props.set(newValue);
					}
				},
				get: function get() {
					if (props.get) {
						props.get();
					}
					return value;
				}
			});
		});

		this.defWatcherBlock = false;
	}
};

//load saved definitions
Persistence.prototype.load = function (type, current) {

	var data = this.retreiveData(type);

	if (current) {
		data = data ? this.mergeDefinition(current, data) : current;
	}

	console.log("P Load", type, data);

	return data;
};

//retreive data from memory
Persistence.prototype.retreiveData = function (type) {
	var data = "",
	    id = this.id + (type === "columns" ? "" : "-" + type);

	switch (this.mode) {
		case "local":
			data = localStorage.getItem(id);
			break;

		case "cookie":

			//find cookie
			var cookie = document.cookie,
			    cookiePos = cookie.indexOf(id + "="),
			    end = void 0;

			//if cookie exists, decode and load column data into tabulator
			if (cookiePos > -1) {
				cookie = cookie.substr(cookiePos);

				end = cookie.indexOf(";");

				if (end > -1) {
					cookie = cookie.substr(0, end);
				}

				data = cookie.replace(id + "=", "");
			}
			break;

		default:
			console.warn("Persistence Load Error - invalid mode selected", this.mode);
	}

	return data ? JSON.parse(data) : false;
};

//merge old and new column definitions
Persistence.prototype.mergeDefinition = function (oldCols, newCols) {
	var self = this,
	    output = [];

	// oldCols = oldCols || [];
	newCols = newCols || [];

	newCols.forEach(function (column, to) {

		var from = self._findColumn(oldCols, column),
		    keys;

		if (from) {

			keys = self.config.columns === true ? Object.keys(from) : self.config.columns;

			keys.forEach(function (key) {
				if (typeof column[key] !== "undefined") {
					from[key] = column[key];
				}
			});

			if (from.columns) {
				from.columns = self.mergeDefinition(from.columns, column.columns);
			}

			output.push(from);
		}
	});

	oldCols.forEach(function (column, i) {
		var from = self._findColumn(newCols, column);
		if (!from) {
			if (output.length > i) {
				output.splice(i, 0, column);
			} else {
				output.push(column);
			}
		}
	});

	return output;
};

//find matching columns
Persistence.prototype._findColumn = function (columns, subject) {
	var type = subject.columns ? "group" : subject.field ? "field" : "object";

	return columns.find(function (col) {
		switch (type) {
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
};

//save data
Persistence.prototype.save = function (type) {
	var data = {};

	switch (type) {
		case "columns":
			data = this.parseColumns(this.table.columnManager.getColumns());
			break;

		case "filter":
			data = this.table.modules.filter.getFilters();
			break;

		case "sort":
			data = this.validateSorters(this.table.modules.sort.getSort());
			break;

		case "group":
			data = {
				groupBy: this.table.options.groupBy,
				groupStartOpen: this.table.options.groupStartOpen,
				groupHeader: this.table.options.groupHeader
			};
			break;

		case "page":
			data = {
				paginationSize: this.table.modules.page.getPageSize()
				// paginationInitialPage:this.table.modules.page.getPage(),
			};
			break;
	}

	console.log("P Save", type, data);

	var id = this.id + (type === "columns" ? "" : "-" + type);

	this.saveData(id, data);
};

//ensure sorters contain no function data
Persistence.prototype.validateSorters = function (data) {
	data.forEach(function (item) {
		item.column = item.field;
		delete item.field;
	});

	return data;
};

//save data to chosed medium
Persistence.prototype.saveData = function (id, data) {

	data = JSON.stringify(data);

	switch (this.mode) {
		case "local":
			localStorage.setItem(id, data);
			break;

		case "cookie":
			var expireDate = new Date();
			expireDate.setDate(expireDate.getDate() + 10000);

			//save cookie
			document.cookie = id + "=" + data + "; expires=" + expireDate.toUTCString();
			break;

		default:
			console.warn("Persistence Save Error - invalid mode selected", this.mode);
	}
};

//build permission list
Persistence.prototype.parseColumns = function (columns) {
	var self = this,
	    definitions = [];

	columns.forEach(function (column) {
		var defStore = {},
		    colDef = column.getDefinition(),
		    keys;

		if (column.isGroup) {
			defStore.title = colDef.title;
			defStore.columns = self.parseColumns(column.getColumns());
		} else {
			defStore.field = column.getField();

			keys = self.config.columns === true ? Object.keys(colDef) : self.config.columns;

			keys.forEach(function (key) {

				switch (key) {
					case "width":
						defStore.width = column.getWidth();
						break;
					case "visible":
						defStore.visible = column.visible;
						break;

					default:
						defStore[key] = colDef[key];
				}
			});
		}

		definitions.push(defStore);
	});

	return definitions;
};

Tabulator.prototype.registerModule("persistence", Persistence);