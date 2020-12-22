/* Tabulator v4.9.3 (c) Oliver Folkerd */

var Persistence = function Persistence(table) {
	this.table = table; //hold Tabulator object
	this.mode = "";
	this.id = "";
	// this.persistProps = ["field", "width", "visible"];
	this.defWatcherBlock = false;
	this.config = {};
	this.readFunc = false;
	this.writeFunc = false;
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

	if (this.table.options.persistenceReaderFunc) {
		if (typeof this.table.options.persistenceReaderFunc === "function") {
			this.readFunc = this.table.options.persistenceReaderFunc;
		} else {
			if (this.readers[this.table.options.persistenceReaderFunc]) {
				this.readFunc = this.readers[this.table.options.persistenceReaderFunc];
			} else {
				console.warn("Persistence Read Error - invalid reader set", this.table.options.persistenceReaderFunc);
			}
		}
	} else {
		if (this.readers[this.mode]) {
			this.readFunc = this.readers[this.mode];
		} else {
			console.warn("Persistence Read Error - invalid reader set", this.mode);
		}
	}

	if (this.table.options.persistenceWriterFunc) {
		if (typeof this.table.options.persistenceWriterFunc === "function") {
			this.writeFunc = this.table.options.persistenceWriterFunc;
		} else {
			if (this.readers[this.table.options.persistenceWriterFunc]) {
				this.writeFunc = this.readers[this.table.options.persistenceWriterFunc];
			} else {
				console.warn("Persistence Write Error - invalid reader set", this.table.options.persistenceWriterFunc);
			}
		}
	} else {
		if (this.writers[this.mode]) {
			this.writeFunc = this.writers[this.mode];
		} else {
			console.warn("Persistence Write Error - invalid writer set", this.mode);
		}
	}

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
			if (typeof retreivedData.paginationSize !== "undefined" && (this.config.page === true || this.config.page.size)) {
				this.table.options.paginationSize = retreivedData.paginationSize;
			}

			if (typeof retreivedData.paginationInitialPage !== "undefined" && (this.config.page === true || this.config.page.page)) {
				this.table.options.paginationInitialPage = retreivedData.paginationInitialPage;
			}
		}
	}

	//load group data if needed
	if (this.config.group) {
		retreivedData = this.retreiveData("group");

		if (retreivedData) {
			if (typeof retreivedData.groupBy !== "undefined" && (this.config.group === true || this.config.group.groupBy)) {
				this.table.options.groupBy = retreivedData.groupBy;
			}
			if (typeof retreivedData.groupStartOpen !== "undefined" && (this.config.group === true || this.config.group.groupStartOpen)) {
				this.table.options.groupStartOpen = retreivedData.groupStartOpen;
			}
			if (typeof retreivedData.groupHeader !== "undefined" && (this.config.group === true || this.config.group.groupHeader)) {
				this.table.options.groupHeader = retreivedData.groupHeader;
			}
		}
	}

	if (this.config.columns) {
		this.table.options.columns = this.load("columns", this.table.options.columns);
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
			if (props) {
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
			}
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

	return data;
};

//retreive data from memory
Persistence.prototype.retreiveData = function (type) {
	return this.readFunc ? this.readFunc(this.id, type) : false;
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

			if (self.config.columns === true || self.config.columns == undefined) {
				keys = Object.keys(from);
				keys.push("width");
			} else {
				keys = self.config.columns;
			}

			keys.forEach(function (key) {
				if (key !== "columns" && typeof column[key] !== "undefined") {
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
			data = this.getGroupConfig();
			break;

		case "page":
			data = this.getPageConfig();
			break;
	}

	if (this.writeFunc) {
		this.writeFunc(this.id, type, data);
	}
};

//ensure sorters contain no function data
Persistence.prototype.validateSorters = function (data) {
	data.forEach(function (item) {
		item.column = item.field;
		delete item.field;
	});

	return data;
};

Persistence.prototype.getGroupConfig = function () {
	var data = {};

	if (this.config.group) {
		if (this.config.group === true || this.config.group.groupBy) {
			data.groupBy = this.table.options.groupBy;
		}

		if (this.config.group === true || this.config.group.groupStartOpen) {
			data.groupStartOpen = this.table.options.groupStartOpen;
		}

		if (this.config.group === true || this.config.group.groupHeader) {
			data.groupHeader = this.table.options.groupHeader;
		}
	}

	return data;
};

Persistence.prototype.getPageConfig = function () {
	var data = {};

	if (this.config.page) {
		if (this.config.page === true || this.config.page.size) {
			data.paginationSize = this.table.modules.page.getPageSize();
		}

		if (this.config.page === true || this.config.page.page) {
			data.paginationInitialPage = this.table.modules.page.getPage();
		}
	}

	return data;
};

//parse columns for data to store
Persistence.prototype.parseColumns = function (columns) {
	var self = this,
	    definitions = [],
	    excludedKeys = ["headerContextMenu", "headerMenu", "contextMenu", "clickMenu"];

	columns.forEach(function (column) {
		var defStore = {},
		    colDef = column.getDefinition(),
		    keys;

		if (column.isGroup) {
			defStore.title = colDef.title;
			defStore.columns = self.parseColumns(column.getColumns());
		} else {
			defStore.field = column.getField();

			if (self.config.columns === true || self.config.columns == undefined) {
				keys = Object.keys(colDef);
				keys.push("width");
			} else {
				keys = self.config.columns;
			}

			keys.forEach(function (key) {

				switch (key) {
					case "width":
						defStore.width = column.getWidth();
						break;
					case "visible":
						defStore.visible = column.visible;
						break;

					default:
						if (typeof colDef[key] !== "function" && excludedKeys.indexOf(key) === -1) {
							defStore[key] = colDef[key];
						}
				}
			});
		}

		definitions.push(defStore);
	});

	return definitions;
};

// read peristence information from storage
Persistence.prototype.readers = {
	local: function local(id, type) {
		var data = localStorage.getItem(id + "-" + type);

		return data ? JSON.parse(data) : false;
	},
	cookie: function cookie(id, type) {
		var cookie = document.cookie,
		    key = id + "-" + type,
		    cookiePos = cookie.indexOf(key + "="),
		    end,
		    data;

		//if cookie exists, decode and load column data into tabulator
		if (cookiePos > -1) {
			cookie = cookie.substr(cookiePos);

			end = cookie.indexOf(";");

			if (end > -1) {
				cookie = cookie.substr(0, end);
			}

			data = cookie.replace(key + "=", "");
		}

		return data ? JSON.parse(data) : false;
	}
};

//write persistence information to storage
Persistence.prototype.writers = {
	local: function local(id, type, data) {
		localStorage.setItem(id + "-" + type, JSON.stringify(data));
	},
	cookie: function cookie(id, type, data) {
		var expireDate = new Date();

		expireDate.setDate(expireDate.getDate() + 10000);

		document.cookie = id + "-" + type + "=" + JSON.stringify(data) + "; expires=" + expireDate.toUTCString();
	}
};

Tabulator.prototype.registerModule("persistence", Persistence);