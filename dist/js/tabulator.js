var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* Tabulator v4.9.3 (c) Oliver Folkerd */

;(function (global, factory) {
	if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined') {
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		define(factory);
	} else {
		global.Tabulator = factory();
	}
})(this, function () {

	'use strict';

	// https://tc39.github.io/ecma262/#sec-array.prototype.findIndex


	if (!Array.prototype.findIndex) {

		Object.defineProperty(Array.prototype, 'findIndex', {

			value: function value(predicate) {

				// 1. Let O be ? ToObject(this value).


				if (this == null) {

					throw new TypeError('"this" is null or not defined');
				}

				var o = Object(this);

				// 2. Let len be ? ToLength(? Get(O, "length")).


				var len = o.length >>> 0;

				// 3. If IsCallable(predicate) is false, throw a TypeError exception.


				if (typeof predicate !== 'function') {

					throw new TypeError('predicate must be a function');
				}

				// 4. If thisArg was supplied, let T be thisArg; else let T be undefined.


				var thisArg = arguments[1];

				// 5. Let k be 0.


				var k = 0;

				// 6. Repeat, while k < len


				while (k < len) {

					// a. Let Pk be ! ToString(k).


					// b. Let kValue be ? Get(O, Pk).


					// c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).


					// d. If testResult is true, return k.


					var kValue = o[k];

					if (predicate.call(thisArg, kValue, k, o)) {

						return k;
					}

					// e. Increase k by 1.


					k++;
				}

				// 7. Return -1.


				return -1;
			}

		});
	}

	// https://tc39.github.io/ecma262/#sec-array.prototype.find


	if (!Array.prototype.find) {

		Object.defineProperty(Array.prototype, 'find', {

			value: function value(predicate) {

				// 1. Let O be ? ToObject(this value).


				if (this == null) {

					throw new TypeError('"this" is null or not defined');
				}

				var o = Object(this);

				// 2. Let len be ? ToLength(? Get(O, "length")).


				var len = o.length >>> 0;

				// 3. If IsCallable(predicate) is false, throw a TypeError exception.


				if (typeof predicate !== 'function') {

					throw new TypeError('predicate must be a function');
				}

				// 4. If thisArg was supplied, let T be thisArg; else let T be undefined.


				var thisArg = arguments[1];

				// 5. Let k be 0.


				var k = 0;

				// 6. Repeat, while k < len


				while (k < len) {

					// a. Let Pk be ! ToString(k).


					// b. Let kValue be ? Get(O, Pk).


					// c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).


					// d. If testResult is true, return kValue.


					var kValue = o[k];

					if (predicate.call(thisArg, kValue, k, o)) {

						return kValue;
					}

					// e. Increase k by 1.


					k++;
				}

				// 7. Return undefined.


				return undefined;
			}

		});
	}

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes#Polyfill


	if (!String.prototype.includes) {

		String.prototype.includes = function (search, start) {

			'use strict';

			if (search instanceof RegExp) {

				throw TypeError('first argument must not be a RegExp');
			}

			if (start === undefined) {
				start = 0;
			}

			return this.indexOf(search, start) !== -1;
		};
	}

	// https://tc39.github.io/ecma262/#sec-array.prototype.includes


	if (!Array.prototype.includes) {

		Object.defineProperty(Array.prototype, 'includes', {

			value: function value(searchElement, fromIndex) {

				if (this == null) {

					throw new TypeError('"this" is null or not defined');
				}

				// 1. Let O be ? ToObject(this value).


				var o = Object(this);

				// 2. Let len be ? ToLength(? Get(O, "length")).


				var len = o.length >>> 0;

				// 3. If len is 0, return false.


				if (len === 0) {

					return false;
				}

				// 4. Let n be ? ToInteger(fromIndex).


				//    (If fromIndex is undefined, this step produces the value 0.)


				var n = fromIndex | 0;

				// 5. If n ≥ 0, then


				//  a. Let k be n.


				// 6. Else n < 0,


				//  a. Let k be len + n.


				//  b. If k < 0, let k be 0.


				var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

				function sameValueZero(x, y) {

					return x === y || typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y);
				}

				// 7. Repeat, while k < len


				while (k < len) {

					// a. Let elementK be the result of ? Get(O, ! ToString(k)).


					// b. If SameValueZero(searchElement, elementK) is true, return true.


					if (sameValueZero(o[k], searchElement)) {

						return true;
					}

					// c. Increase k by 1.


					k++;
				}

				// 8. Return false


				return false;
			}

		});
	}

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill


	if (typeof Object.assign !== 'function') {

		// Must be writable: true, enumerable: false, configurable: true


		Object.defineProperty(Object, "assign", {

			value: function assign(target, varArgs) {
				// .length of function is 2


				'use strict';

				if (target === null || target === undefined) {

					throw new TypeError('Cannot convert undefined or null to object');
				}

				var to = Object(target);

				for (var index = 1; index < arguments.length; index++) {

					var nextSource = arguments[index];

					if (nextSource !== null && nextSource !== undefined) {

						for (var nextKey in nextSource) {

							// Avoid bugs when hasOwnProperty is shadowed


							if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {

								to[nextKey] = nextSource[nextKey];
							}
						}
					}
				}

				return to;
			},

			writable: true,

			configurable: true

		});
	}

	var ColumnManager = function ColumnManager(table) {

		this.table = table; //hold parent table


		this.blockHozScrollEvent = false;

		this.headersElement = this.createHeadersElement();

		this.element = this.createHeaderElement(); //containing element


		this.rowManager = null; //hold row manager object


		this.columns = []; // column definition object


		this.columnsByIndex = []; //columns by index


		this.columnsByField = {}; //columns by field


		this.scrollLeft = 0;

		this.element.insertBefore(this.headersElement, this.element.firstChild);
	};

	////////////// Setup Functions /////////////////


	ColumnManager.prototype.createHeadersElement = function () {

		var el = document.createElement("div");

		el.classList.add("tabulator-headers");

		return el;
	};

	ColumnManager.prototype.createHeaderElement = function () {

		var el = document.createElement("div");

		el.classList.add("tabulator-header");

		if (!this.table.options.headerVisible) {

			el.classList.add("tabulator-header-hidden");
		}

		return el;
	};

	ColumnManager.prototype.initialize = function () {

		var self = this;

		//scroll body along with header


		// self.element.addEventListener("scroll", function(e){


		// 	if(!self.blockHozScrollEvent){


		// 		self.table.rowManager.scrollHorizontal(self.element.scrollLeft);


		// 	}


		// });

	};

	//link to row manager


	ColumnManager.prototype.setRowManager = function (manager) {

		this.rowManager = manager;
	};

	//return containing element


	ColumnManager.prototype.getElement = function () {

		return this.element;
	};

	//return header containing element


	ColumnManager.prototype.getHeadersElement = function () {

		return this.headersElement;
	};

	// ColumnManager.prototype.tempScrollBlock = function(){


	// 	clearTimeout(this.blockHozScrollEvent);


	// 	this.blockHozScrollEvent = setTimeout(() => {this.blockHozScrollEvent = false;}, 50);


	// }


	//scroll horizontally to match table body


	ColumnManager.prototype.scrollHorizontal = function (left) {

		var hozAdjust = 0,
		    scrollWidth = this.element.scrollWidth - this.table.element.clientWidth;

		// this.tempScrollBlock();


		this.element.scrollLeft = left;

		//adjust for vertical scrollbar moving table when present


		if (left > scrollWidth) {

			hozAdjust = left - scrollWidth;

			this.element.style.marginLeft = -hozAdjust + "px";
		} else {

			this.element.style.marginLeft = 0;
		}

		//keep frozen columns fixed in position


		//this._calcFrozenColumnsPos(hozAdjust + 3);


		this.scrollLeft = left;

		if (this.table.modExists("frozenColumns")) {

			this.table.modules.frozenColumns.scrollHorizontal();
		}
	};

	///////////// Column Setup Functions /////////////


	ColumnManager.prototype.generateColumnsFromRowData = function (data) {

		var cols = [],
		    definitions = this.table.options.autoColumnsDefinitions,
		    row,
		    sorter;

		if (data && data.length) {

			row = data[0];

			for (var key in row) {

				var col = {

					field: key,

					title: key

				};

				var value = row[key];

				switch (typeof value === 'undefined' ? 'undefined' : _typeof(value)) {

					case "undefined":

						sorter = "string";

						break;

					case "boolean":

						sorter = "boolean";

						break;

					case "object":

						if (Array.isArray(value)) {

							sorter = "array";
						} else {

							sorter = "string";
						}

						break;

					default:

						if (!isNaN(value) && value !== "") {

							sorter = "number";
						} else {

							if (value.match(/((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+$/i)) {

								sorter = "alphanum";
							} else {

								sorter = "string";
							}
						}

						break;

				}

				col.sorter = sorter;

				cols.push(col);
			}

			if (definitions) {

				switch (typeof definitions === 'undefined' ? 'undefined' : _typeof(definitions)) {

					case "function":

						this.table.options.columns = definitions.call(this.table, cols);

						break;

					case "object":

						if (Array.isArray(definitions)) {

							cols.forEach(function (col) {

								var match = definitions.find(function (def) {

									return def.field === col.field;
								});

								if (match) {

									Object.assign(col, match);
								}
							});
						} else {

							cols.forEach(function (col) {

								if (definitions[col.field]) {

									Object.assign(col, definitions[col.field]);
								}
							});
						}

						this.table.options.columns = cols;

						break;

				}
			} else {

				this.table.options.columns = cols;
			}

			this.setColumns(this.table.options.columns);
		}
	};

	ColumnManager.prototype.setColumns = function (cols, row) {

		var self = this;

		while (self.headersElement.firstChild) {
			self.headersElement.removeChild(self.headersElement.firstChild);
		}self.columns = [];

		self.columnsByIndex = [];

		self.columnsByField = {};

		//reset frozen columns


		if (self.table.modExists("frozenColumns")) {

			self.table.modules.frozenColumns.reset();
		}

		cols.forEach(function (def, i) {

			self._addColumn(def);
		});

		self._reIndexColumns();

		if (self.table.options.responsiveLayout && self.table.modExists("responsiveLayout", true)) {

			self.table.modules.responsiveLayout.initialize();
		}

		if (this.table.options.virtualDomHoz) {

			this.table.vdomHoz.reinitialize(false, true);
		}

		self.redraw(true);
	};

	ColumnManager.prototype._addColumn = function (definition, before, nextToColumn) {

		var column = new Column(definition, this),
		    colEl = column.getElement(),
		    index = nextToColumn ? this.findColumnIndex(nextToColumn) : nextToColumn;

		if (nextToColumn && index > -1) {

			var parentIndex = this.columns.indexOf(nextToColumn.getTopColumn());

			var nextEl = nextToColumn.getElement();

			if (before) {

				this.columns.splice(parentIndex, 0, column);

				nextEl.parentNode.insertBefore(colEl, nextEl);
			} else {

				this.columns.splice(parentIndex + 1, 0, column);

				nextEl.parentNode.insertBefore(colEl, nextEl.nextSibling);
			}
		} else {

			if (before) {

				this.columns.unshift(column);

				this.headersElement.insertBefore(column.getElement(), this.headersElement.firstChild);
			} else {

				this.columns.push(column);

				this.headersElement.appendChild(column.getElement());
			}

			column.columnRendered();
		}

		return column;
	};

	ColumnManager.prototype.registerColumnField = function (col) {

		if (col.definition.field) {

			this.columnsByField[col.definition.field] = col;
		}
	};

	ColumnManager.prototype.registerColumnPosition = function (col) {

		this.columnsByIndex.push(col);
	};

	ColumnManager.prototype._reIndexColumns = function () {

		this.columnsByIndex = [];

		this.columns.forEach(function (column) {

			column.reRegisterPosition();
		});
	};

	//ensure column headers take up the correct amount of space in column groups


	ColumnManager.prototype._verticalAlignHeaders = function () {

		var self = this,
		    minHeight = 0;

		self.columns.forEach(function (column) {

			var height;

			column.clearVerticalAlign();

			height = column.getHeight();

			if (height > minHeight) {

				minHeight = height;
			}
		});

		self.columns.forEach(function (column) {

			column.verticalAlign(self.table.options.columnHeaderVertAlign, minHeight);
		});

		self.rowManager.adjustTableSize();
	};

	//////////////// Column Details /////////////////


	ColumnManager.prototype.findColumn = function (subject) {

		var self = this;

		if ((typeof subject === 'undefined' ? 'undefined' : _typeof(subject)) == "object") {

			if (subject instanceof Column) {

				//subject is column element


				return subject;
			} else if (subject instanceof ColumnComponent) {

				//subject is public column component


				return subject._getSelf() || false;
			} else if (typeof HTMLElement !== "undefined" && subject instanceof HTMLElement) {

				//subject is a HTML element of the column header


				var match = self.columns.find(function (column) {

					return column.element === subject;
				});

				return match || false;
			}
		} else {

			//subject should be treated as the field name of the column


			return this.columnsByField[subject] || false;
		}

		//catch all for any other type of input


		return false;
	};

	ColumnManager.prototype.getColumnByField = function (field) {

		return this.columnsByField[field];
	};

	ColumnManager.prototype.getColumnsByFieldRoot = function (root) {
		var _this = this;

		var matches = [];

		Object.keys(this.columnsByField).forEach(function (field) {

			var fieldRoot = field.split(".")[0];

			if (fieldRoot === root) {

				matches.push(_this.columnsByField[field]);
			}
		});

		return matches;
	};

	ColumnManager.prototype.getColumnByIndex = function (index) {

		return this.columnsByIndex[index];
	};

	ColumnManager.prototype.getFirstVisibileColumn = function (index) {

		var index = this.columnsByIndex.findIndex(function (col) {

			return col.visible;
		});

		return index > -1 ? this.columnsByIndex[index] : false;
	};

	ColumnManager.prototype.getColumns = function () {

		return this.columns;
	};

	ColumnManager.prototype.findColumnIndex = function (column) {

		return this.columnsByIndex.findIndex(function (col) {

			return column === col;
		});
	};

	//return all columns that are not groups


	ColumnManager.prototype.getRealColumns = function () {

		return this.columnsByIndex;
	};

	//travers across columns and call action


	ColumnManager.prototype.traverse = function (callback) {

		var self = this;

		self.columnsByIndex.forEach(function (column, i) {

			callback(column, i);
		});
	};

	//get defintions of actual columns


	ColumnManager.prototype.getDefinitions = function (active) {

		var self = this,
		    output = [];

		self.columnsByIndex.forEach(function (column) {

			if (!active || active && column.visible) {

				output.push(column.getDefinition());
			}
		});

		return output;
	};

	//get full nested definition tree


	ColumnManager.prototype.getDefinitionTree = function () {

		var self = this,
		    output = [];

		self.columns.forEach(function (column) {

			output.push(column.getDefinition(true));
		});

		return output;
	};

	ColumnManager.prototype.getComponents = function (structured) {

		var self = this,
		    output = [],
		    columns = structured ? self.columns : self.columnsByIndex;

		columns.forEach(function (column) {

			output.push(column.getComponent());
		});

		return output;
	};

	ColumnManager.prototype.getWidth = function () {

		var width = 0;

		this.columnsByIndex.forEach(function (column) {

			if (column.visible) {

				width += column.getWidth();
			}
		});

		return width;
	};

	ColumnManager.prototype.moveColumn = function (from, to, after) {

		this.moveColumnActual(from, to, after);

		if (this.table.options.responsiveLayout && this.table.modExists("responsiveLayout", true)) {

			this.table.modules.responsiveLayout.initialize();
		}

		if (this.table.modExists("columnCalcs")) {

			this.table.modules.columnCalcs.recalc(this.table.rowManager.activeRows);
		}

		to.element.parentNode.insertBefore(from.element, to.element);

		if (after) {

			to.element.parentNode.insertBefore(to.element, from.element);
		}

		this._verticalAlignHeaders();

		this.table.rowManager.reinitialize();
	};

	ColumnManager.prototype.moveColumnActual = function (from, to, after) {

		if (from.parent.isGroup) {

			this._moveColumnInArray(from.parent.columns, from, to, after);
		} else {

			this._moveColumnInArray(this.columns, from, to, after);
		}

		this._moveColumnInArray(this.columnsByIndex, from, to, after, true);

		if (this.table.options.responsiveLayout && this.table.modExists("responsiveLayout", true)) {

			this.table.modules.responsiveLayout.initialize();
		}

		if (this.table.options.virtualDomHoz) {

			this.table.vdomHoz.reinitialize(true);
		}

		if (this.table.options.columnMoved) {

			this.table.options.columnMoved.call(this.table, from.getComponent(), this.table.columnManager.getComponents());
		}

		if (this.table.options.persistence && this.table.modExists("persistence", true) && this.table.modules.persistence.config.columns) {

			this.table.modules.persistence.save("columns");
		}
	};

	ColumnManager.prototype._moveColumnInArray = function (columns, from, to, after, updateRows) {
		var _this2 = this;

		var fromIndex = columns.indexOf(from),
		    toIndex,
		    rows = [];

		if (fromIndex > -1) {

			columns.splice(fromIndex, 1);

			toIndex = columns.indexOf(to);

			if (toIndex > -1) {

				if (after) {

					toIndex = toIndex + 1;
				}
			} else {

				toIndex = fromIndex;
			}

			columns.splice(toIndex, 0, from);

			if (updateRows) {

				if (this.table.options.dataTree && this.table.modExists("dataTree", true)) {

					this.table.rowManager.rows.forEach(function (row) {

						rows = rows.concat(_this2.table.modules.dataTree.getTreeChildren(row, false, true));
					});
				}

				rows = rows.concat(this.table.rowManager.rows);

				rows.forEach(function (row) {

					if (row.cells.length) {

						var cell = row.cells.splice(fromIndex, 1)[0];

						row.cells.splice(toIndex, 0, cell);
					}
				});
			}
		}
	};

	ColumnManager.prototype.scrollToColumn = function (column, position, ifVisible) {
		var _this3 = this;

		var left = 0,
		    offset = 0,
		    adjust = 0,
		    colEl = column.getElement();

		return new Promise(function (resolve, reject) {

			if (typeof position === "undefined") {

				position = _this3.table.options.scrollToColumnPosition;
			}

			if (typeof ifVisible === "undefined") {

				ifVisible = _this3.table.options.scrollToColumnIfVisible;
			}

			if (column.visible) {

				//align to correct position


				switch (position) {

					case "middle":

					case "center":

						adjust = -_this3.element.clientWidth / 2;

						break;

					case "right":

						adjust = colEl.clientWidth - _this3.headersElement.clientWidth;

						break;

				}

				//check column visibility


				if (!ifVisible) {

					offset = colEl.offsetLeft;

					if (offset > 0 && offset + colEl.offsetWidth < _this3.element.clientWidth) {

						return false;
					}
				}

				//calculate scroll position


				left = colEl.offsetLeft + adjust;

				left = Math.max(Math.min(left, _this3.table.rowManager.element.scrollWidth - _this3.table.rowManager.element.clientWidth), 0);

				_this3.table.rowManager.scrollHorizontal(left);

				_this3.scrollHorizontal(left);

				resolve();
			} else {

				console.warn("Scroll Error - Column not visible");

				reject("Scroll Error - Column not visible");
			}
		});
	};

	//////////////// Cell Management /////////////////


	ColumnManager.prototype.generateCells = function (row) {

		var self = this;

		var cells = [];

		self.columnsByIndex.forEach(function (column) {

			cells.push(column.generateCell(row));
		});

		return cells;
	};

	//////////////// Column Management /////////////////


	ColumnManager.prototype.getFlexBaseWidth = function () {

		var self = this,
		    totalWidth = self.table.element.clientWidth,
		    //table element width


		fixedWidth = 0;

		//adjust for vertical scrollbar if present


		if (self.rowManager.element.scrollHeight > self.rowManager.element.clientHeight) {

			totalWidth -= self.rowManager.element.offsetWidth - self.rowManager.element.clientWidth;
		}

		this.columnsByIndex.forEach(function (column) {

			var width, minWidth, colWidth;

			if (column.visible) {

				width = column.definition.width || 0;

				minWidth = typeof column.minWidth == "undefined" ? self.table.options.columnMinWidth : parseInt(column.minWidth);

				if (typeof width == "string") {

					if (width.indexOf("%") > -1) {

						colWidth = totalWidth / 100 * parseInt(width);
					} else {

						colWidth = parseInt(width);
					}
				} else {

					colWidth = width;
				}

				fixedWidth += colWidth > minWidth ? colWidth : minWidth;
			}
		});

		return fixedWidth;
	};

	ColumnManager.prototype.addColumn = function (definition, before, nextToColumn) {
		var _this4 = this;

		return new Promise(function (resolve, reject) {

			var column = _this4._addColumn(definition, before, nextToColumn);

			_this4._reIndexColumns();

			if (_this4.table.options.responsiveLayout && _this4.table.modExists("responsiveLayout", true)) {

				_this4.table.modules.responsiveLayout.initialize();
			}

			if (_this4.table.modExists("columnCalcs")) {

				_this4.table.modules.columnCalcs.recalc(_this4.table.rowManager.activeRows);
			}

			_this4.redraw(true);

			if (_this4.table.modules.layout.getMode() != "fitColumns") {

				column.reinitializeWidth();
			}

			_this4._verticalAlignHeaders();

			_this4.table.rowManager.reinitialize();

			if (_this4.table.options.virtualDomHoz) {

				_this4.table.vdomHoz.reinitialize();
			}

			resolve(column);
		});
	};

	//remove column from system


	ColumnManager.prototype.deregisterColumn = function (column) {

		var field = column.getField(),
		    index;

		//remove from field list


		if (field) {

			delete this.columnsByField[field];
		}

		//remove from index list


		index = this.columnsByIndex.indexOf(column);

		if (index > -1) {

			this.columnsByIndex.splice(index, 1);
		}

		//remove from column list


		index = this.columns.indexOf(column);

		if (index > -1) {

			this.columns.splice(index, 1);
		}

		if (this.table.options.responsiveLayout && this.table.modExists("responsiveLayout", true)) {

			this.table.modules.responsiveLayout.initialize();
		}

		this._verticalAlignHeaders();

		this.redraw();
	};

	//redraw columns


	ColumnManager.prototype.redraw = function (force) {

		if (force) {

			if (Tabulator.prototype.helpers.elVisible(this.element)) {

				this._verticalAlignHeaders();
			}

			this.table.rowManager.resetScroll();

			this.table.rowManager.reinitialize();
		}

		if (["fitColumns", "fitDataStretch"].indexOf(this.table.modules.layout.getMode()) > -1) {

			this.table.modules.layout.layout();
		} else {

			if (force) {

				this.table.modules.layout.layout();
			} else {

				if (this.table.options.responsiveLayout && this.table.modExists("responsiveLayout", true)) {

					this.table.modules.responsiveLayout.update();
				}
			}
		}

		if (this.table.modExists("frozenColumns")) {

			this.table.modules.frozenColumns.layout();
		}

		if (this.table.modExists("columnCalcs")) {

			this.table.modules.columnCalcs.recalc(this.table.rowManager.activeRows);
		}

		if (force) {

			if (this.table.options.persistence && this.table.modExists("persistence", true) && this.table.modules.persistence.config.columns) {

				this.table.modules.persistence.save("columns");
			}

			if (this.table.modExists("columnCalcs")) {

				this.table.modules.columnCalcs.redraw();
			}
		}

		this.table.footerManager.redraw();
	};

	//public column object

	var ColumnComponent = function ColumnComponent(column) {

		this._column = column;

		this.type = "ColumnComponent";
	};

	ColumnComponent.prototype.getElement = function () {

		return this._column.getElement();
	};

	ColumnComponent.prototype.getDefinition = function () {

		return this._column.getDefinition();
	};

	ColumnComponent.prototype.getField = function () {

		return this._column.getField();
	};

	ColumnComponent.prototype.getCells = function () {

		var cells = [];

		this._column.cells.forEach(function (cell) {

			cells.push(cell.getComponent());
		});

		return cells;
	};

	ColumnComponent.prototype.getVisibility = function () {

		console.warn("getVisibility function is deprecated, you should now use the isVisible function");

		return this._column.visible;
	};

	ColumnComponent.prototype.isVisible = function () {

		return this._column.visible;
	};

	ColumnComponent.prototype.show = function () {

		if (this._column.isGroup) {

			this._column.columns.forEach(function (column) {

				column.show();
			});
		} else {

			this._column.show();
		}
	};

	ColumnComponent.prototype.hide = function () {

		if (this._column.isGroup) {

			this._column.columns.forEach(function (column) {

				column.hide();
			});
		} else {

			this._column.hide();
		}
	};

	ColumnComponent.prototype.toggle = function () {

		if (this._column.visible) {

			this.hide();
		} else {

			this.show();
		}
	};

	ColumnComponent.prototype.delete = function () {

		return this._column.delete();
	};

	ColumnComponent.prototype.getSubColumns = function () {

		var output = [];

		if (this._column.columns.length) {

			this._column.columns.forEach(function (column) {

				output.push(column.getComponent());
			});
		}

		return output;
	};

	ColumnComponent.prototype.getParentColumn = function () {

		return this._column.parent instanceof Column ? this._column.parent.getComponent() : false;
	};

	ColumnComponent.prototype._getSelf = function () {

		return this._column;
	};

	ColumnComponent.prototype.scrollTo = function () {

		return this._column.table.columnManager.scrollToColumn(this._column);
	};

	ColumnComponent.prototype.getTable = function () {

		return this._column.table;
	};

	ColumnComponent.prototype.headerFilterFocus = function () {

		if (this._column.table.modExists("filter", true)) {

			this._column.table.modules.filter.setHeaderFilterFocus(this._column);
		}
	};

	ColumnComponent.prototype.reloadHeaderFilter = function () {

		if (this._column.table.modExists("filter", true)) {

			this._column.table.modules.filter.reloadHeaderFilter(this._column);
		}
	};

	ColumnComponent.prototype.getHeaderFilterValue = function () {

		if (this._column.table.modExists("filter", true)) {

			return this._column.table.modules.filter.getHeaderFilterValue(this._column);
		}
	};

	ColumnComponent.prototype.setHeaderFilterValue = function (value) {

		if (this._column.table.modExists("filter", true)) {

			this._column.table.modules.filter.setHeaderFilterValue(this._column, value);
		}
	};

	ColumnComponent.prototype.move = function (to, after) {

		var toColumn = this._column.table.columnManager.findColumn(to);

		if (toColumn) {

			this._column.table.columnManager.moveColumn(this._column, toColumn, after);
		} else {

			console.warn("Move Error - No matching column found:", toColumn);
		}
	};

	ColumnComponent.prototype.getNextColumn = function () {

		var nextCol = this._column.nextColumn();

		return nextCol ? nextCol.getComponent() : false;
	};

	ColumnComponent.prototype.getPrevColumn = function () {

		var prevCol = this._column.prevColumn();

		return prevCol ? prevCol.getComponent() : false;
	};

	ColumnComponent.prototype.updateDefinition = function (updates) {

		return this._column.updateDefinition(updates);
	};

	ColumnComponent.prototype.getWidth = function () {

		return this._column.getWidth();
	};

	ColumnComponent.prototype.setWidth = function (width) {

		var result;

		if (width === true) {

			result = this._column.reinitializeWidth(true);
		} else {

			result = this._column.setWidth(width);
		}

		if (this._column.table.options.virtualDomHoz) {

			this._column.table.vdomHoz.reinitialize(true);
		}

		return result;
	};

	ColumnComponent.prototype.validate = function () {

		return this._column.validate();
	};

	var Column = function Column(def, parent) {

		var self = this;

		this.table = parent.table;

		this.definition = def; //column definition

		this.parent = parent; //hold parent object

		this.type = "column"; //type of element

		this.columns = []; //child columns

		this.cells = []; //cells bound to this column

		this.element = this.createElement(); //column header element

		this.contentElement = false;

		this.titleHolderElement = false;

		this.titleElement = false;

		this.groupElement = this.createGroupElement(); //column group holder element

		this.isGroup = false;

		this.tooltip = false; //hold column tooltip

		this.hozAlign = ""; //horizontal text alignment

		this.vertAlign = ""; //vert text alignment


		//multi dimensional filed handling

		this.field = "";

		this.fieldStructure = "";

		this.getFieldValue = "";

		this.setFieldValue = "";

		this.titleFormatterRendered = false;

		this.setField(this.definition.field);

		if (this.table.options.invalidOptionWarnings) {

			this.checkDefinition();
		}

		this.modules = {}; //hold module variables;


		this.cellEvents = {

			cellClick: false,

			cellDblClick: false,

			cellContext: false,

			cellTap: false,

			cellDblTap: false,

			cellTapHold: false,

			cellMouseEnter: false,

			cellMouseLeave: false,

			cellMouseOver: false,

			cellMouseOut: false,

			cellMouseMove: false

		};

		this.width = null; //column width

		this.widthStyled = ""; //column width prestyled to improve render efficiency

		this.maxWidth = null; //column maximum width

		this.maxWidthStyled = ""; //column maximum prestyled to improve render efficiency

		this.minWidth = null; //column minimum width

		this.minWidthStyled = ""; //column minimum prestyled to improve render efficiency

		this.widthFixed = false; //user has specified a width for this column


		this.visible = true; //default visible state


		this.component = null;

		this._mapDepricatedFunctionality();

		//initialize column

		if (def.columns) {

			this.isGroup = true;

			def.columns.forEach(function (def, i) {

				var newCol = new Column(def, self);

				self.attachColumn(newCol);
			});

			self.checkColumnVisibility();
		} else {

			parent.registerColumnField(this);
		}

		if (def.rowHandle && this.table.options.movableRows !== false && this.table.modExists("moveRow")) {

			this.table.modules.moveRow.setHandle(true);
		}

		this._buildHeader();

		this.bindModuleColumns();
	};

	Column.prototype.createElement = function () {

		var el = document.createElement("div");

		el.classList.add("tabulator-col");

		el.setAttribute("role", "columnheader");

		el.setAttribute("aria-sort", "none");

		return el;
	};

	Column.prototype.createGroupElement = function () {

		var el = document.createElement("div");

		el.classList.add("tabulator-col-group-cols");

		return el;
	};

	Column.prototype.checkDefinition = function () {
		var _this5 = this;

		Object.keys(this.definition).forEach(function (key) {

			if (_this5.defaultOptionList.indexOf(key) === -1) {

				console.warn("Invalid column definition option in '" + (_this5.field || _this5.definition.title) + "' column:", key);
			}
		});
	};

	Column.prototype.setField = function (field) {

		this.field = field;

		this.fieldStructure = field ? this.table.options.nestedFieldSeparator ? field.split(this.table.options.nestedFieldSeparator) : [field] : [];

		this.getFieldValue = this.fieldStructure.length > 1 ? this._getNestedData : this._getFlatData;

		this.setFieldValue = this.fieldStructure.length > 1 ? this._setNestedData : this._setFlatData;
	};

	//register column position with column manager

	Column.prototype.registerColumnPosition = function (column) {

		this.parent.registerColumnPosition(column);
	};

	//register column position with column manager

	Column.prototype.registerColumnField = function (column) {

		this.parent.registerColumnField(column);
	};

	//trigger position registration

	Column.prototype.reRegisterPosition = function () {

		if (this.isGroup) {

			this.columns.forEach(function (column) {

				column.reRegisterPosition();
			});
		} else {

			this.registerColumnPosition(this);
		}
	};

	Column.prototype._mapDepricatedFunctionality = function () {

		if (typeof this.definition.hideInHtml !== "undefined") {

			this.definition.htmlOutput = !this.definition.hideInHtml;

			console.warn("hideInHtml column definition property is deprecated, you should now use htmlOutput");
		}

		if (typeof this.definition.align !== "undefined") {

			this.definition.hozAlign = this.definition.align;

			console.warn("align column definition property is deprecated, you should now use hozAlign");
		}

		if (typeof this.definition.downloadTitle !== "undefined") {

			this.definition.titleDownload = this.definition.downloadTitle;

			console.warn("downloadTitle definition property is deprecated, you should now use titleDownload");
		}
	};

	Column.prototype.setTooltip = function () {

		var self = this,
		    def = self.definition;

		//set header tooltips

		var tooltip = def.headerTooltip || def.tooltip === false ? def.headerTooltip : self.table.options.tooltipsHeader;

		if (tooltip) {

			if (tooltip === true) {

				if (def.field) {

					self.table.modules.localize.bind("columns|" + def.field, function (value) {

						self.element.setAttribute("title", value || def.title);
					});
				} else {

					self.element.setAttribute("title", def.title);
				}
			} else {

				if (typeof tooltip == "function") {

					tooltip = tooltip(self.getComponent());

					if (tooltip === false) {

						tooltip = "";
					}
				}

				self.element.setAttribute("title", tooltip);
			}
		} else {

			self.element.setAttribute("title", "");
		}
	};

	//build header element

	Column.prototype._buildHeader = function () {

		var self = this,
		    def = self.definition;

		while (self.element.firstChild) {
			self.element.removeChild(self.element.firstChild);
		}if (def.headerVertical) {

			self.element.classList.add("tabulator-col-vertical");

			if (def.headerVertical === "flip") {

				self.element.classList.add("tabulator-col-vertical-flip");
			}
		}

		self.contentElement = self._bindEvents();

		self.contentElement = self._buildColumnHeaderContent();

		self.element.appendChild(self.contentElement);

		if (self.isGroup) {

			self._buildGroupHeader();
		} else {

			self._buildColumnHeader();
		}

		self.setTooltip();

		//set resizable handles

		if (self.table.options.resizableColumns && self.table.modExists("resizeColumns")) {

			self.table.modules.resizeColumns.initializeColumn("header", self, self.element);
		}

		//set resizable handles

		if (def.headerFilter && self.table.modExists("filter") && self.table.modExists("edit")) {

			if (typeof def.headerFilterPlaceholder !== "undefined" && def.field) {

				self.table.modules.localize.setHeaderFilterColumnPlaceholder(def.field, def.headerFilterPlaceholder);
			}

			self.table.modules.filter.initializeColumn(self);
		}

		//set resizable handles

		if (self.table.modExists("frozenColumns")) {

			self.table.modules.frozenColumns.initializeColumn(self);
		}

		//set movable column

		if (self.table.options.movableColumns && !self.isGroup && self.table.modExists("moveColumn")) {

			self.table.modules.moveColumn.initializeColumn(self);
		}

		//set calcs column

		if ((def.topCalc || def.bottomCalc) && self.table.modExists("columnCalcs")) {

			self.table.modules.columnCalcs.initializeColumn(self);
		}

		//handle persistence

		if (self.table.modExists("persistence") && self.table.modules.persistence.config.columns) {

			self.table.modules.persistence.initializeColumn(self);
		}

		//update header tooltip on mouse enter

		self.element.addEventListener("mouseenter", function (e) {

			self.setTooltip();
		});
	};

	Column.prototype._bindEvents = function () {

		var self = this,
		    def = self.definition,
		    dblTap,
		    tapHold,
		    tap;

		//setup header click event bindings

		if (typeof def.headerClick == "function") {

			self.element.addEventListener("click", function (e) {
				def.headerClick(e, self.getComponent());
			});
		}

		if (typeof def.headerDblClick == "function") {

			self.element.addEventListener("dblclick", function (e) {
				def.headerDblClick(e, self.getComponent());
			});
		}

		if (typeof def.headerContext == "function") {

			self.element.addEventListener("contextmenu", function (e) {
				def.headerContext(e, self.getComponent());
			});
		}

		//setup header tap event bindings

		if (typeof def.headerTap == "function") {

			tap = false;

			self.element.addEventListener("touchstart", function (e) {

				tap = true;
			}, { passive: true });

			self.element.addEventListener("touchend", function (e) {

				if (tap) {

					def.headerTap(e, self.getComponent());
				}

				tap = false;
			});
		}

		if (typeof def.headerDblTap == "function") {

			dblTap = null;

			self.element.addEventListener("touchend", function (e) {

				if (dblTap) {

					clearTimeout(dblTap);

					dblTap = null;

					def.headerDblTap(e, self.getComponent());
				} else {

					dblTap = setTimeout(function () {

						clearTimeout(dblTap);

						dblTap = null;
					}, 300);
				}
			});
		}

		if (typeof def.headerTapHold == "function") {

			tapHold = null;

			self.element.addEventListener("touchstart", function (e) {

				clearTimeout(tapHold);

				tapHold = setTimeout(function () {

					clearTimeout(tapHold);

					tapHold = null;

					tap = false;

					def.headerTapHold(e, self.getComponent());
				}, 1000);
			}, { passive: true });

			self.element.addEventListener("touchend", function (e) {

				clearTimeout(tapHold);

				tapHold = null;
			});
		}

		//store column cell click event bindings

		if (typeof def.cellClick == "function") {

			self.cellEvents.cellClick = def.cellClick;
		}

		if (typeof def.cellDblClick == "function") {

			self.cellEvents.cellDblClick = def.cellDblClick;
		}

		if (typeof def.cellContext == "function") {

			self.cellEvents.cellContext = def.cellContext;
		}

		//store column mouse event bindings

		if (typeof def.cellMouseEnter == "function") {

			self.cellEvents.cellMouseEnter = def.cellMouseEnter;
		}

		if (typeof def.cellMouseLeave == "function") {

			self.cellEvents.cellMouseLeave = def.cellMouseLeave;
		}

		if (typeof def.cellMouseOver == "function") {

			self.cellEvents.cellMouseOver = def.cellMouseOver;
		}

		if (typeof def.cellMouseOut == "function") {

			self.cellEvents.cellMouseOut = def.cellMouseOut;
		}

		if (typeof def.cellMouseMove == "function") {

			self.cellEvents.cellMouseMove = def.cellMouseMove;
		}

		//setup column cell tap event bindings

		if (typeof def.cellTap == "function") {

			self.cellEvents.cellTap = def.cellTap;
		}

		if (typeof def.cellDblTap == "function") {

			self.cellEvents.cellDblTap = def.cellDblTap;
		}

		if (typeof def.cellTapHold == "function") {

			self.cellEvents.cellTapHold = def.cellTapHold;
		}

		//setup column cell edit callbacks

		if (typeof def.cellEdited == "function") {

			self.cellEvents.cellEdited = def.cellEdited;
		}

		if (typeof def.cellEditing == "function") {

			self.cellEvents.cellEditing = def.cellEditing;
		}

		if (typeof def.cellEditCancelled == "function") {

			self.cellEvents.cellEditCancelled = def.cellEditCancelled;
		}
	};

	//build header element for header

	Column.prototype._buildColumnHeader = function () {
		var _this6 = this;

		var def = this.definition,
		    table = this.table,
		    sortable;

		//set column sorter

		if (table.modExists("sort")) {

			table.modules.sort.initializeColumn(this, this.titleHolderElement);
		}

		//set column header context menu

		if ((def.headerContextMenu || def.headerClickMenu || def.headerMenu) && table.modExists("menu")) {

			table.modules.menu.initializeColumnHeader(this);
		}

		//set column formatter

		if (table.modExists("format")) {

			table.modules.format.initializeColumn(this);
		}

		//set column editor

		if (typeof def.editor != "undefined" && table.modExists("edit")) {

			table.modules.edit.initializeColumn(this);
		}

		//set colum validator

		if (typeof def.validator != "undefined" && table.modExists("validate")) {

			table.modules.validate.initializeColumn(this);
		}

		//set column mutator

		if (table.modExists("mutator")) {

			table.modules.mutator.initializeColumn(this);
		}

		//set column accessor

		if (table.modExists("accessor")) {

			table.modules.accessor.initializeColumn(this);
		}

		//set respoviveLayout

		if (_typeof(table.options.responsiveLayout) && table.modExists("responsiveLayout")) {

			table.modules.responsiveLayout.initializeColumn(this);
		}

		//set column visibility

		if (typeof def.visible != "undefined") {

			if (def.visible) {

				this.show(true);
			} else {

				this.hide(true);
			}
		}

		//asign additional css classes to column header

		if (def.cssClass) {

			var classeNames = def.cssClass.split(" ");

			classeNames.forEach(function (className) {

				_this6.element.classList.add(className);
			});
		}

		if (def.field) {

			this.element.setAttribute("tabulator-field", def.field);
		}

		//set min width if present

		this.setMinWidth(typeof def.minWidth == "undefined" ? this.table.options.columnMinWidth : parseInt(def.minWidth));

		if (def.maxWidth || this.table.options.columnMaxWidth) {

			if (def.maxWidth !== false) {

				this.setMaxWidth(typeof def.maxWidth == "undefined" ? this.table.options.columnMaxWidth : parseInt(def.maxWidth));
			}
		}

		this.reinitializeWidth();

		//set tooltip if present

		this.tooltip = this.definition.tooltip || this.definition.tooltip === false ? this.definition.tooltip : this.table.options.tooltips;

		//set orizontal text alignment

		this.hozAlign = typeof this.definition.hozAlign == "undefined" ? this.table.options.cellHozAlign : this.definition.hozAlign;

		this.vertAlign = typeof this.definition.vertAlign == "undefined" ? this.table.options.cellVertAlign : this.definition.vertAlign;

		this.titleElement.style.textAlign = this.definition.headerHozAlign || this.table.options.headerHozAlign;
	};

	Column.prototype._buildColumnHeaderContent = function () {

		var def = this.definition,
		    table = this.table;

		var contentElement = document.createElement("div");

		contentElement.classList.add("tabulator-col-content");

		this.titleHolderElement = document.createElement("div");

		this.titleHolderElement.classList.add("tabulator-col-title-holder");

		contentElement.appendChild(this.titleHolderElement);

		this.titleElement = this._buildColumnHeaderTitle();

		this.titleHolderElement.appendChild(this.titleElement);

		return contentElement;
	};

	//build title element of column

	Column.prototype._buildColumnHeaderTitle = function () {

		var self = this,
		    def = self.definition,
		    table = self.table,
		    title;

		var titleHolderElement = document.createElement("div");

		titleHolderElement.classList.add("tabulator-col-title");

		if (def.editableTitle) {

			var titleElement = document.createElement("input");

			titleElement.classList.add("tabulator-title-editor");

			titleElement.addEventListener("click", function (e) {

				e.stopPropagation();

				titleElement.focus();
			});

			titleElement.addEventListener("change", function () {

				def.title = titleElement.value;

				table.options.columnTitleChanged.call(self.table, self.getComponent());
			});

			titleHolderElement.appendChild(titleElement);

			if (def.field) {

				table.modules.localize.bind("columns|" + def.field, function (text) {

					titleElement.value = text || def.title || "&nbsp;";
				});
			} else {

				titleElement.value = def.title || "&nbsp;";
			}
		} else {

			if (def.field) {

				table.modules.localize.bind("columns|" + def.field, function (text) {

					self._formatColumnHeaderTitle(titleHolderElement, text || def.title || "&nbsp;");
				});
			} else {

				self._formatColumnHeaderTitle(titleHolderElement, def.title || "&nbsp;");
			}
		}

		return titleHolderElement;
	};

	Column.prototype._formatColumnHeaderTitle = function (el, title) {
		var _this7 = this;

		var formatter, contents, params, mockCell, onRendered;

		if (this.definition.titleFormatter && this.table.modExists("format")) {

			formatter = this.table.modules.format.getFormatter(this.definition.titleFormatter);

			onRendered = function onRendered(callback) {

				_this7.titleFormatterRendered = callback;
			};

			mockCell = {

				getValue: function getValue() {

					return title;
				},

				getElement: function getElement() {

					return el;
				}

			};

			params = this.definition.titleFormatterParams || {};

			params = typeof params === "function" ? params() : params;

			contents = formatter.call(this.table.modules.format, mockCell, params, onRendered);

			switch (typeof contents === 'undefined' ? 'undefined' : _typeof(contents)) {

				case "object":

					if (contents instanceof Node) {

						el.appendChild(contents);
					} else {

						el.innerHTML = "";

						console.warn("Format Error - Title formatter has returned a type of object, the only valid formatter object return is an instance of Node, the formatter returned:", contents);
					}

					break;

				case "undefined":

				case "null":

					el.innerHTML = "";

					break;

				default:

					el.innerHTML = contents;

			}
		} else {

			el.innerHTML = title;
		}
	};

	//build header element for column group

	Column.prototype._buildGroupHeader = function () {
		var _this8 = this;

		this.element.classList.add("tabulator-col-group");

		this.element.setAttribute("role", "columngroup");

		this.element.setAttribute("aria-title", this.definition.title);

		//asign additional css classes to column header

		if (this.definition.cssClass) {

			var classeNames = this.definition.cssClass.split(" ");

			classeNames.forEach(function (className) {

				_this8.element.classList.add(className);
			});
		}

		//set column header context menu

		if ((this.definition.headerContextMenu || this.definition.headerMenu) && this.table.modExists("menu")) {

			this.table.modules.menu.initializeColumnHeader(this);
		}

		this.titleElement.style.textAlign = this.definition.headerHozAlign || this.table.options.headerHozAlign;

		this.element.appendChild(this.groupElement);
	};

	//flat field lookup

	Column.prototype._getFlatData = function (data) {

		return data[this.field];
	};

	//nested field lookup

	Column.prototype._getNestedData = function (data) {

		var dataObj = data,
		    structure = this.fieldStructure,
		    length = structure.length,
		    output;

		for (var _i = 0; _i < length; _i++) {

			dataObj = dataObj[structure[_i]];

			output = dataObj;

			if (!dataObj) {

				break;
			}
		}

		return output;
	};

	//flat field set

	Column.prototype._setFlatData = function (data, value) {

		if (this.field) {

			data[this.field] = value;
		}
	};

	//nested field set

	Column.prototype._setNestedData = function (data, value) {

		var dataObj = data,
		    structure = this.fieldStructure,
		    length = structure.length;

		for (var _i2 = 0; _i2 < length; _i2++) {

			if (_i2 == length - 1) {

				dataObj[structure[_i2]] = value;
			} else {

				if (!dataObj[structure[_i2]]) {

					if (typeof value !== "undefined") {

						dataObj[structure[_i2]] = {};
					} else {

						break;
					}
				}

				dataObj = dataObj[structure[_i2]];
			}
		}
	};

	//attach column to this group

	Column.prototype.attachColumn = function (column) {

		var self = this;

		if (self.groupElement) {

			self.columns.push(column);

			self.groupElement.appendChild(column.getElement());
		} else {

			console.warn("Column Warning - Column being attached to another column instead of column group");
		}
	};

	//vertically align header in column

	Column.prototype.verticalAlign = function (alignment, height) {

		//calculate height of column header and group holder element

		var parentHeight = this.parent.isGroup ? this.parent.getGroupElement().clientHeight : height || this.parent.getHeadersElement().clientHeight;

		// var parentHeight = this.parent.isGroup ? this.parent.getGroupElement().clientHeight : this.parent.getHeadersElement().clientHeight;


		this.element.style.height = parentHeight + "px";

		if (this.isGroup) {

			this.groupElement.style.minHeight = parentHeight - this.contentElement.offsetHeight + "px";
		}

		//vertically align cell contents

		if (!this.isGroup && alignment !== "top") {

			if (alignment === "bottom") {

				this.element.style.paddingTop = this.element.clientHeight - this.contentElement.offsetHeight + "px";
			} else {

				this.element.style.paddingTop = (this.element.clientHeight - this.contentElement.offsetHeight) / 2 + "px";
			}
		}

		this.columns.forEach(function (column) {

			column.verticalAlign(alignment);
		});
	};

	//clear vertical alignmenet

	Column.prototype.clearVerticalAlign = function () {

		this.element.style.paddingTop = "";

		this.element.style.height = "";

		this.element.style.minHeight = "";

		this.groupElement.style.minHeight = "";

		this.columns.forEach(function (column) {

			column.clearVerticalAlign();
		});
	};

	Column.prototype.bindModuleColumns = function () {

		//check if rownum formatter is being used on a column

		if (this.definition.formatter == "rownum") {

			this.table.rowManager.rowNumColumn = this;
		}
	};

	//// Retreive Column Information ////


	//return column header element

	Column.prototype.getElement = function () {

		return this.element;
	};

	//return colunm group element

	Column.prototype.getGroupElement = function () {

		return this.groupElement;
	};

	//return field name

	Column.prototype.getField = function () {

		return this.field;
	};

	//return the first column in a group

	Column.prototype.getFirstColumn = function () {

		if (!this.isGroup) {

			return this;
		} else {

			if (this.columns.length) {

				return this.columns[0].getFirstColumn();
			} else {

				return false;
			}
		}
	};

	//return the last column in a group

	Column.prototype.getLastColumn = function () {

		if (!this.isGroup) {

			return this;
		} else {

			if (this.columns.length) {

				return this.columns[this.columns.length - 1].getLastColumn();
			} else {

				return false;
			}
		}
	};

	//return all columns in a group

	Column.prototype.getColumns = function () {

		return this.columns;
	};

	//return all columns in a group

	Column.prototype.getCells = function () {

		return this.cells;
	};

	//retreive the top column in a group of columns

	Column.prototype.getTopColumn = function () {

		if (this.parent.isGroup) {

			return this.parent.getTopColumn();
		} else {

			return this;
		}
	};

	//return column definition object

	Column.prototype.getDefinition = function (updateBranches) {

		var colDefs = [];

		if (this.isGroup && updateBranches) {

			this.columns.forEach(function (column) {

				colDefs.push(column.getDefinition(true));
			});

			this.definition.columns = colDefs;
		}

		return this.definition;
	};

	//////////////////// Actions ////////////////////


	Column.prototype.checkColumnVisibility = function () {

		var visible = false;

		this.columns.forEach(function (column) {

			if (column.visible) {

				visible = true;
			}
		});

		if (visible) {

			this.show();

			this.parent.table.options.columnVisibilityChanged.call(this.table, this.getComponent(), false);
		} else {

			this.hide();
		}
	};

	//show column

	Column.prototype.show = function (silent, responsiveToggle) {

		if (!this.visible) {

			this.visible = true;

			this.element.style.display = "";

			if (this.parent.isGroup) {

				this.parent.checkColumnVisibility();
			}

			this.cells.forEach(function (cell) {

				cell.show();
			});

			if (!this.isGroup && this.width === null) {

				this.reinitializeWidth();
			}

			this.table.columnManager._verticalAlignHeaders();

			if (this.table.options.persistence && this.table.modExists("persistence", true) && this.table.modules.persistence.config.columns) {

				this.table.modules.persistence.save("columns");
			}

			if (!responsiveToggle && this.table.options.responsiveLayout && this.table.modExists("responsiveLayout", true)) {

				this.table.modules.responsiveLayout.updateColumnVisibility(this, this.visible);
			}

			if (!silent) {

				this.table.options.columnVisibilityChanged.call(this.table, this.getComponent(), true);
			}

			if (this.parent.isGroup) {

				this.parent.matchChildWidths();
			}

			if (!this.silent && this.table.options.virtualDomHoz) {

				this.table.vdomHoz.reinitialize();
			}
		}
	};

	//hide column

	Column.prototype.hide = function (silent, responsiveToggle) {

		if (this.visible) {

			this.visible = false;

			this.element.style.display = "none";

			this.table.columnManager._verticalAlignHeaders();

			if (this.parent.isGroup) {

				this.parent.checkColumnVisibility();
			}

			this.cells.forEach(function (cell) {

				cell.hide();
			});

			if (this.table.options.persistence && this.table.modExists("persistence", true) && this.table.modules.persistence.config.columns) {

				this.table.modules.persistence.save("columns");
			}

			if (!responsiveToggle && this.table.options.responsiveLayout && this.table.modExists("responsiveLayout", true)) {

				this.table.modules.responsiveLayout.updateColumnVisibility(this, this.visible);
			}

			if (!silent) {

				this.table.options.columnVisibilityChanged.call(this.table, this.getComponent(), false);
			}

			if (this.parent.isGroup) {

				this.parent.matchChildWidths();
			}

			if (!this.silent && this.table.options.virtualDomHoz) {

				this.table.vdomHoz.reinitialize();
			}
		}
	};

	Column.prototype.matchChildWidths = function () {

		var childWidth = 0;

		if (this.contentElement && this.columns.length) {

			this.columns.forEach(function (column) {

				if (column.visible) {

					childWidth += column.getWidth();
				}
			});

			this.contentElement.style.maxWidth = childWidth - 1 + "px";

			if (this.parent.isGroup) {

				this.parent.matchChildWidths();
			}
		}
	};

	Column.prototype.removeChild = function (child) {

		var index = this.columns.indexOf(child);

		if (index > -1) {

			this.columns.splice(index, 1);
		}

		if (!this.columns.length) {

			this.delete();
		}
	};

	Column.prototype.setWidth = function (width) {

		this.widthFixed = true;

		this.setWidthActual(width);
	};

	Column.prototype.setWidthActual = function (width) {

		if (isNaN(width)) {

			width = Math.floor(this.table.element.clientWidth / 100 * parseInt(width));
		}

		width = Math.max(this.minWidth, width);

		if (this.maxWidth) {

			width = Math.min(this.maxWidth, width);
		}

		this.width = width;

		this.widthStyled = width ? width + "px" : "";

		this.element.style.width = this.widthStyled;

		if (!this.isGroup) {

			this.cells.forEach(function (cell) {

				cell.setWidth();
			});
		}

		if (this.parent.isGroup) {

			this.parent.matchChildWidths();
		}

		//set resizable handles

		if (this.table.modExists("frozenColumns")) {

			this.table.modules.frozenColumns.layout();
		}
	};

	Column.prototype.checkCellHeights = function () {

		var rows = [];

		this.cells.forEach(function (cell) {

			if (cell.row.heightInitialized) {

				if (cell.row.getElement().offsetParent !== null) {

					rows.push(cell.row);

					cell.row.clearCellHeight();
				} else {

					cell.row.heightInitialized = false;
				}
			}
		});

		rows.forEach(function (row) {

			row.calcHeight();
		});

		rows.forEach(function (row) {

			row.setCellHeight();
		});
	};

	Column.prototype.getWidth = function () {

		var width = 0;

		if (this.isGroup) {

			this.columns.forEach(function (column) {

				if (column.visible) {

					width += column.getWidth();
				}
			});
		} else {

			width = this.width;
		}

		return width;
	};

	Column.prototype.getHeight = function () {

		return this.element.offsetHeight;
	};

	Column.prototype.setMinWidth = function (minWidth) {

		this.minWidth = minWidth;

		this.minWidthStyled = minWidth ? minWidth + "px" : "";

		this.element.style.minWidth = this.minWidthStyled;

		this.cells.forEach(function (cell) {

			cell.setMinWidth();
		});
	};

	Column.prototype.setMaxWidth = function (maxWidth) {

		this.maxWidth = maxWidth;

		this.maxWidthStyled = maxWidth ? maxWidth + "px" : "";

		this.element.style.maxWidth = this.maxWidthStyled;

		this.cells.forEach(function (cell) {

			cell.setMaxWidth();
		});
	};

	Column.prototype.delete = function () {
		var _this9 = this;

		return new Promise(function (resolve, reject) {

			var index;

			if (_this9.isGroup) {

				_this9.columns.forEach(function (column) {

					column.delete();
				});
			}

			//cancel edit if column is currently being edited

			if (_this9.table.modExists("edit")) {

				if (_this9.table.modules.edit.currentCell.column === _this9) {

					_this9.table.modules.edit.cancelEdit();
				}
			}

			var cellCount = _this9.cells.length;

			for (var _i3 = 0; _i3 < cellCount; _i3++) {

				_this9.cells[0].delete();
			}

			if (_this9.element.parentNode) {

				_this9.element.parentNode.removeChild(_this9.element);
			}

			_this9.element = false;

			_this9.contentElement = false;

			_this9.titleElement = false;

			_this9.groupElement = false;

			if (_this9.parent.isGroup) {

				_this9.parent.removeChild(_this9);
			}

			_this9.table.columnManager.deregisterColumn(_this9);

			if (_this9.table.options.virtualDomHoz) {

				_this9.table.vdomHoz.reinitialize(true);
			}

			resolve();
		});
	};

	Column.prototype.columnRendered = function () {

		if (this.titleFormatterRendered) {

			this.titleFormatterRendered();
		}
	};

	Column.prototype.validate = function () {

		var invalid = [];

		this.cells.forEach(function (cell) {

			if (!cell.validate()) {

				invalid.push(cell.getComponent());
			}
		});

		return invalid.length ? invalid : true;
	};

	//////////////// Cell Management /////////////////


	//generate cell for this column

	Column.prototype.generateCell = function (row) {

		var self = this;

		var cell = new Cell(self, row);

		this.cells.push(cell);

		return cell;
	};

	Column.prototype.nextColumn = function () {

		var index = this.table.columnManager.findColumnIndex(this);

		return index > -1 ? this._nextVisibleColumn(index + 1) : false;
	};

	Column.prototype._nextVisibleColumn = function (index) {

		var column = this.table.columnManager.getColumnByIndex(index);

		return !column || column.visible ? column : this._nextVisibleColumn(index + 1);
	};

	Column.prototype.prevColumn = function () {

		var index = this.table.columnManager.findColumnIndex(this);

		return index > -1 ? this._prevVisibleColumn(index - 1) : false;
	};

	Column.prototype._prevVisibleColumn = function (index) {

		var column = this.table.columnManager.getColumnByIndex(index);

		return !column || column.visible ? column : this._prevVisibleColumn(index - 1);
	};

	Column.prototype.reinitializeWidth = function (force) {

		this.widthFixed = false;

		//set width if present

		if (typeof this.definition.width !== "undefined" && !force) {

			this.setWidth(this.definition.width);
		}

		//hide header filters to prevent them altering column width

		if (this.table.modExists("filter")) {

			this.table.modules.filter.hideHeaderFilterElements();
		}

		this.fitToData();

		//show header filters again after layout is complete

		if (this.table.modExists("filter")) {

			this.table.modules.filter.showHeaderFilterElements();
		}
	};

	//set column width to maximum cell width

	Column.prototype.fitToData = function () {

		var self = this;

		if (!this.widthFixed) {

			this.element.style.width = "";

			self.cells.forEach(function (cell) {

				cell.clearWidth();
			});
		}

		var maxWidth = this.element.offsetWidth;

		if (!self.width || !this.widthFixed) {

			self.cells.forEach(function (cell) {

				var width = cell.getWidth();

				if (width > maxWidth) {

					maxWidth = width;
				}
			});

			if (maxWidth) {

				self.setWidthActual(maxWidth + 1);
			}
		}
	};

	Column.prototype.updateDefinition = function (updates) {
		var _this10 = this;

		return new Promise(function (resolve, reject) {

			var definition;

			if (!_this10.isGroup) {

				if (!_this10.parent.isGroup) {

					definition = Object.assign({}, _this10.getDefinition());

					definition = Object.assign(definition, updates);

					_this10.table.columnManager.addColumn(definition, false, _this10).then(function (column) {

						if (definition.field == _this10.field) {

							_this10.field = false; //cleair field name to prevent deletion of duplicate column from arrays
						}

						_this10.delete().then(function () {

							resolve(column.getComponent());
						}).catch(function (err) {

							reject(err);
						});
					}).catch(function (err) {

						reject(err);
					});
				} else {

					console.warn("Column Update Error - The updateDefinition function is only available on ungrouped columns");

					reject("Column Update Error - The updateDefinition function is only available on columns, not column groups");
				}
			} else {

				console.warn("Column Update Error - The updateDefinition function is only available on ungrouped columns");

				reject("Column Update Error - The updateDefinition function is only available on columns, not column groups");
			}
		});
	};

	Column.prototype.deleteCell = function (cell) {

		var index = this.cells.indexOf(cell);

		if (index > -1) {

			this.cells.splice(index, 1);
		}
	};

	Column.prototype.defaultOptionList = ["title", "field", "columns", "visible", "align", "hozAlign", "vertAlign", "width", "minWidth", "maxWidth", "widthGrow", "widthShrink", "resizable", "frozen", "responsive", "tooltip", "cssClass", "rowHandle", "hideInHtml", "print", "htmlOutput", "sorter", "sorterParams", "formatter", "formatterParams", "variableHeight", "editable", "editor", "editorParams", "validator", "mutator", "mutatorParams", "mutatorData", "mutatorDataParams", "mutatorEdit", "mutatorEditParams", "mutatorClipboard", "mutatorClipboardParams", "accessor", "accessorParams", "accessorData", "accessorDataParams", "accessorDownload", "accessorDownloadParams", "accessorClipboard", "accessorClipboardParams", "accessorPrint", "accessorPrintParams", "accessorHtmlOutput", "accessorHtmlOutputParams", "clipboard", "download", "downloadTitle", "topCalc", "topCalcParams", "topCalcFormatter", "topCalcFormatterParams", "bottomCalc", "bottomCalcParams", "bottomCalcFormatter", "bottomCalcFormatterParams", "cellClick", "cellDblClick", "cellContext", "cellTap", "cellDblTap", "cellTapHold", "cellMouseEnter", "cellMouseLeave", "cellMouseOver", "cellMouseOut", "cellMouseMove", "cellEditing", "cellEdited", "cellEditCancelled", "headerSort", "headerSortStartingDir", "headerSortTristate", "headerClick", "headerDblClick", "headerContext", "headerTap", "headerDblTap", "headerTapHold", "headerTooltip", "headerVertical", "headerHozAlign", "editableTitle", "titleFormatter", "titleFormatterParams", "headerFilter", "headerFilterPlaceholder", "headerFilterParams", "headerFilterEmptyCheck", "headerFilterFunc", "headerFilterFuncParams", "headerFilterLiveFilter", "print", "headerContextMenu", "headerMenu", "contextMenu",

	// "headerClickMenu",

	"clickMenu", "formatterPrint", "formatterPrintParams", "formatterClipboard", "formatterClipboardParams", "formatterHtmlOutput", "formatterHtmlOutputParams", "titlePrint", "titleClipboard", "titleHtmlOutput", "titleDownload"];

	//////////////// Event Bindings /////////////////


	//////////////// Object Generation /////////////////

	Column.prototype.getComponent = function () {

		if (!this.component) {

			this.component = new ColumnComponent(this);
		}

		return this.component;
	};

	var RowManager = function RowManager(table) {

		this.table = table;

		this.element = this.createHolderElement(); //containing element

		this.tableElement = this.createTableElement(); //table element

		this.heightFixer = this.createTableElement(); //table element

		this.columnManager = null; //hold column manager object

		this.height = 0; //hold height of table element


		this.firstRender = false; //handle first render

		this.renderMode = "virtual"; //current rendering mode

		this.fixedHeight = false; //current rendering mode


		this.rows = []; //hold row data objects

		this.activeRows = []; //rows currently available to on display in the table

		this.activeRowsCount = 0; //count of active rows


		this.displayRows = []; //rows currently on display in the table

		this.displayRowsCount = 0; //count of display rows


		this.scrollTop = 0;

		this.scrollLeft = 0;

		this.vDomRowHeight = 20; //approximation of row heights for padding


		this.vDomTop = 0; //hold position for first rendered row in the virtual DOM

		this.vDomBottom = 0; //hold possition for last rendered row in the virtual DOM


		this.vDomScrollPosTop = 0; //last scroll position of the vDom top;

		this.vDomScrollPosBottom = 0; //last scroll position of the vDom bottom;


		this.vDomTopPad = 0; //hold value of padding for top of virtual DOM

		this.vDomBottomPad = 0; //hold value of padding for bottom of virtual DOM


		this.vDomMaxRenderChain = 90; //the maximum number of dom elements that can be rendered in 1 go


		this.vDomWindowBuffer = 0; //window row buffer before removing elements, to smooth scrolling


		this.vDomWindowMinTotalRows = 20; //minimum number of rows to be generated in virtual dom (prevent buffering issues on tables with tall rows)

		this.vDomWindowMinMarginRows = 5; //minimum number of rows to be generated in virtual dom margin


		this.vDomTopNewRows = []; //rows to normalize after appending to optimize render speed

		this.vDomBottomNewRows = []; //rows to normalize after appending to optimize render speed


		this.rowNumColumn = false; //hold column component for row number column


		this.redrawBlock = false; //prevent redraws to allow multiple data manipulations becore continuing

		this.redrawBlockRestoreConfig = false; //store latest redraw function calls for when redraw is needed

		this.redrawBlockRederInPosition = false; //store latest redraw function calls for when redraw is needed
	};

	//////////////// Setup Functions /////////////////


	RowManager.prototype.createHolderElement = function () {

		var el = document.createElement("div");

		el.classList.add("tabulator-tableHolder");

		el.setAttribute("tabindex", 0);

		return el;
	};

	RowManager.prototype.createTableElement = function () {

		var el = document.createElement("div");

		el.classList.add("tabulator-table");

		return el;
	};

	//return containing element

	RowManager.prototype.getElement = function () {

		return this.element;
	};

	//return table element

	RowManager.prototype.getTableElement = function () {

		return this.tableElement;
	};

	//return position of row in table

	RowManager.prototype.getRowPosition = function (row, active) {

		if (active) {

			return this.activeRows.indexOf(row);
		} else {

			return this.rows.indexOf(row);
		}
	};

	//link to column manager

	RowManager.prototype.setColumnManager = function (manager) {

		this.columnManager = manager;
	};

	RowManager.prototype.initialize = function () {

		var self = this;

		self.setRenderMode();

		//initialize manager

		self.element.appendChild(self.tableElement);

		self.firstRender = true;

		//scroll header along with table body

		self.element.addEventListener("scroll", function () {

			var left = self.element.scrollLeft;

			//handle horizontal scrolling

			if (self.scrollLeft != left) {

				self.columnManager.scrollHorizontal(left);

				if (self.table.options.groupBy) {

					self.table.modules.groupRows.scrollHeaders(left);
				}

				if (self.table.modExists("columnCalcs")) {

					self.table.modules.columnCalcs.scrollHorizontal(left);
				}

				self.table.options.scrollHorizontal(left);
			}

			self.scrollLeft = left;
		});

		//handle virtual dom scrolling

		if (this.renderMode === "virtual") {

			self.element.addEventListener("scroll", function () {

				var top = self.element.scrollTop;

				var dir = self.scrollTop > top;

				//handle verical scrolling

				if (self.scrollTop != top) {

					self.scrollTop = top;

					self.scrollVertical(dir);

					if (self.table.options.ajaxProgressiveLoad == "scroll") {

						self.table.modules.ajax.nextPage(self.element.scrollHeight - self.element.clientHeight - top);
					}

					self.table.options.scrollVertical(top);
				} else {

					self.scrollTop = top;
				}
			});
		}
	};

	////////////////// Row Manipulation //////////////////


	RowManager.prototype.findRow = function (subject) {

		var self = this;

		if ((typeof subject === 'undefined' ? 'undefined' : _typeof(subject)) == "object") {

			if (subject instanceof Row) {

				//subject is row element

				return subject;
			} else if (subject instanceof RowComponent) {

				//subject is public row component

				return subject._getSelf() || false;
			} else if (typeof HTMLElement !== "undefined" && subject instanceof HTMLElement) {

				//subject is a HTML element of the row

				var match = self.rows.find(function (row) {

					return row.getElement() === subject;
				});

				return match || false;
			}
		} else if (typeof subject == "undefined" || subject === null) {

			return false;
		} else {

			//subject should be treated as the index of the row

			var _match = self.rows.find(function (row) {

				return row.data[self.table.options.index] == subject;
			});

			return _match || false;
		}

		//catch all for any other type of input


		return false;
	};

	RowManager.prototype.getRowFromDataObject = function (data) {

		var match = this.rows.find(function (row) {

			return row.data === data;
		});

		return match || false;
	};

	RowManager.prototype.getRowFromPosition = function (position, active) {

		if (active) {

			return this.activeRows[position];
		} else {

			return this.rows[position];
		}
	};

	RowManager.prototype.scrollToRow = function (row, position, ifVisible) {
		var _this11 = this;

		var rowIndex = this.getDisplayRows().indexOf(row),
		    rowEl = row.getElement(),
		    rowTop,
		    offset = 0;

		return new Promise(function (resolve, reject) {

			if (rowIndex > -1) {

				if (typeof position === "undefined") {

					position = _this11.table.options.scrollToRowPosition;
				}

				if (typeof ifVisible === "undefined") {

					ifVisible = _this11.table.options.scrollToRowIfVisible;
				}

				if (position === "nearest") {

					switch (_this11.renderMode) {

						case "classic":

							rowTop = Tabulator.prototype.helpers.elOffset(rowEl).top;

							position = Math.abs(_this11.element.scrollTop - rowTop) > Math.abs(_this11.element.scrollTop + _this11.element.clientHeight - rowTop) ? "bottom" : "top";

							break;

						case "virtual":

							position = Math.abs(_this11.vDomTop - rowIndex) > Math.abs(_this11.vDomBottom - rowIndex) ? "bottom" : "top";

							break;

					}
				}

				//check row visibility

				if (!ifVisible) {

					if (Tabulator.prototype.helpers.elVisible(rowEl)) {

						offset = Tabulator.prototype.helpers.elOffset(rowEl).top - Tabulator.prototype.helpers.elOffset(_this11.element).top;

						if (offset > 0 && offset < _this11.element.clientHeight - rowEl.offsetHeight) {

							return false;
						}
					}
				}

				//scroll to row

				switch (_this11.renderMode) {

					case "classic":

						_this11.element.scrollTop = Tabulator.prototype.helpers.elOffset(rowEl).top - Tabulator.prototype.helpers.elOffset(_this11.element).top + _this11.element.scrollTop;

						break;

					case "virtual":

						_this11._virtualRenderFill(rowIndex, true);

						break;

				}

				//align to correct position

				switch (position) {

					case "middle":

					case "center":

						if (_this11.element.scrollHeight - _this11.element.scrollTop == _this11.element.clientHeight) {

							_this11.element.scrollTop = _this11.element.scrollTop + (rowEl.offsetTop - _this11.element.scrollTop) - (_this11.element.scrollHeight - rowEl.offsetTop) / 2;
						} else {

							_this11.element.scrollTop = _this11.element.scrollTop - _this11.element.clientHeight / 2;
						}

						break;

					case "bottom":

						if (_this11.element.scrollHeight - _this11.element.scrollTop == _this11.element.clientHeight) {

							_this11.element.scrollTop = _this11.element.scrollTop - (_this11.element.scrollHeight - rowEl.offsetTop) + rowEl.offsetHeight;
						} else {

							_this11.element.scrollTop = _this11.element.scrollTop - _this11.element.clientHeight + rowEl.offsetHeight;
						}

						break;

				}

				resolve();
			} else {

				console.warn("Scroll Error - Row not visible");

				reject("Scroll Error - Row not visible");
			}
		});
	};

	////////////////// Data Handling //////////////////


	RowManager.prototype.setData = function (data, renderInPosition, columnsChanged) {
		var _this12 = this;

		var self = this;

		return new Promise(function (resolve, reject) {

			if (renderInPosition && _this12.getDisplayRows().length) {

				if (self.table.options.pagination) {

					self._setDataActual(data, true);
				} else {

					_this12.reRenderInPosition(function () {

						self._setDataActual(data);
					});
				}
			} else {

				if (_this12.table.options.autoColumns && columnsChanged) {

					_this12.table.columnManager.generateColumnsFromRowData(data);
				}

				_this12.resetScroll();

				_this12._setDataActual(data);
			}

			resolve();
		});
	};

	RowManager.prototype._setDataActual = function (data, renderInPosition) {

		var self = this;

		self.table.options.dataLoading.call(this.table, data);

		this._wipeElements();

		if (this.table.options.history && this.table.modExists("history")) {

			this.table.modules.history.clear();
		}

		if (Array.isArray(data)) {

			if (this.table.modExists("selectRow")) {

				this.table.modules.selectRow.clearSelectionData();
			}

			if (this.table.options.reactiveData && this.table.modExists("reactiveData", true)) {

				this.table.modules.reactiveData.watchData(data);
			}

			data.forEach(function (def, i) {

				if (def && (typeof def === 'undefined' ? 'undefined' : _typeof(def)) === "object") {

					var row = new Row(def, self);

					self.rows.push(row);
				} else {

					console.warn("Data Loading Warning - Invalid row data detected and ignored, expecting object but received:", def);
				}
			});

			self.refreshActiveData(false, false, renderInPosition);

			self.table.options.dataLoaded.call(this.table, data);
		} else {

			console.error("Data Loading Error - Unable to process data due to invalid data type \nExpecting: array \nReceived: ", typeof data === 'undefined' ? 'undefined' : _typeof(data), "\nData:     ", data);
		}
	};

	RowManager.prototype._wipeElements = function () {

		this.rows.forEach(function (row) {

			row.wipe();
		});

		if (this.table.options.groupBy && this.table.modExists("groupRows")) {

			this.table.modules.groupRows.wipe();
		}

		this.rows = [];

		this.activeRows = [];

		this.activeRowsCount = 0;

		this.displayRows = [];

		this.displayRowsCount = 0;

		this.adjustTableSize();
	};

	RowManager.prototype.deleteRow = function (row, blockRedraw) {

		var allIndex = this.rows.indexOf(row),
		    activeIndex = this.activeRows.indexOf(row);

		if (activeIndex > -1) {

			this.activeRows.splice(activeIndex, 1);
		}

		if (allIndex > -1) {

			this.rows.splice(allIndex, 1);
		}

		this.setActiveRows(this.activeRows);

		this.displayRowIterator(function (rows) {

			var displayIndex = rows.indexOf(row);

			if (displayIndex > -1) {

				rows.splice(displayIndex, 1);
			}
		});

		if (!blockRedraw) {

			this.reRenderInPosition();
		}

		this.regenerateRowNumbers();

		this.table.options.rowDeleted.call(this.table, row.getComponent());

		if (this.table.options.dataChanged) {

			this.table.options.dataChanged.call(this.table, this.getData());
		}

		if (this.table.options.groupBy && this.table.modExists("groupRows")) {

			this.table.modules.groupRows.updateGroupRows(true);
		} else if (this.table.options.pagination && this.table.modExists("page")) {

			this.refreshActiveData(false, false, true);
		} else {

			if (this.table.options.pagination && this.table.modExists("page")) {

				this.refreshActiveData("page");
			}
		}
	};

	RowManager.prototype.addRow = function (data, pos, index, blockRedraw) {

		var row = this.addRowActual(data, pos, index, blockRedraw);

		if (this.table.options.history && this.table.modExists("history")) {

			this.table.modules.history.action("rowAdd", row, { data: data, pos: pos, index: index });
		}

		return row;
	};

	//add multiple rows

	RowManager.prototype.addRows = function (data, pos, index) {
		var _this13 = this;

		var self = this,
		    length = 0,
		    rows = [];

		return new Promise(function (resolve, reject) {

			pos = _this13.findAddRowPos(pos);

			if (!Array.isArray(data)) {

				data = [data];
			}

			length = data.length - 1;

			if (typeof index == "undefined" && pos || typeof index !== "undefined" && !pos) {

				data.reverse();
			}

			data.forEach(function (item, i) {

				var row = self.addRow(item, pos, index, true);

				rows.push(row);
			});

			if (_this13.table.options.groupBy && _this13.table.modExists("groupRows")) {

				_this13.table.modules.groupRows.updateGroupRows(true);
			} else if (_this13.table.options.pagination && _this13.table.modExists("page")) {

				_this13.refreshActiveData(false, false, true);
			} else {

				_this13.reRenderInPosition();
			}

			//recalc column calculations if present

			if (_this13.table.modExists("columnCalcs")) {

				_this13.table.modules.columnCalcs.recalc(_this13.table.rowManager.activeRows);
			}

			_this13.regenerateRowNumbers();

			resolve(rows);
		});
	};

	RowManager.prototype.findAddRowPos = function (pos) {

		if (typeof pos === "undefined") {

			pos = this.table.options.addRowPos;
		}

		if (pos === "pos") {

			pos = true;
		}

		if (pos === "bottom") {

			pos = false;
		}

		return pos;
	};

	RowManager.prototype.addRowActual = function (data, pos, index, blockRedraw) {

		var row = data instanceof Row ? data : new Row(data || {}, this),
		    top = this.findAddRowPos(pos),
		    allIndex = -1,
		    activeIndex,
		    dispRows;

		if (!index && this.table.options.pagination && this.table.options.paginationAddRow == "page") {

			dispRows = this.getDisplayRows();

			if (top) {

				if (dispRows.length) {

					index = dispRows[0];
				} else {

					if (this.activeRows.length) {

						index = this.activeRows[this.activeRows.length - 1];

						top = false;
					}
				}
			} else {

				if (dispRows.length) {

					index = dispRows[dispRows.length - 1];

					top = dispRows.length < this.table.modules.page.getPageSize() ? false : true;
				}
			}
		}

		if (typeof index !== "undefined") {

			index = this.findRow(index);
		}

		if (this.table.options.groupBy && this.table.modExists("groupRows")) {

			this.table.modules.groupRows.assignRowToGroup(row);

			var groupRows = row.getGroup().rows;

			if (groupRows.length > 1) {

				if (!index || index && groupRows.indexOf(index) == -1) {

					if (top) {

						if (groupRows[0] !== row) {

							index = groupRows[0];

							this._moveRowInArray(row.getGroup().rows, row, index, !top);
						}
					} else {

						if (groupRows[groupRows.length - 1] !== row) {

							index = groupRows[groupRows.length - 1];

							this._moveRowInArray(row.getGroup().rows, row, index, !top);
						}
					}
				} else {

					this._moveRowInArray(row.getGroup().rows, row, index, !top);
				}
			}
		}

		if (index) {

			allIndex = this.rows.indexOf(index);
		}

		if (index && allIndex > -1) {

			activeIndex = this.activeRows.indexOf(index);

			this.displayRowIterator(function (rows) {

				var displayIndex = rows.indexOf(index);

				if (displayIndex > -1) {

					rows.splice(top ? displayIndex : displayIndex + 1, 0, row);
				}
			});

			if (activeIndex > -1) {

				this.activeRows.splice(top ? activeIndex : activeIndex + 1, 0, row);
			}

			this.rows.splice(top ? allIndex : allIndex + 1, 0, row);
		} else {

			if (top) {

				this.displayRowIterator(function (rows) {

					rows.unshift(row);
				});

				this.activeRows.unshift(row);

				this.rows.unshift(row);
			} else {

				this.displayRowIterator(function (rows) {

					rows.push(row);
				});

				this.activeRows.push(row);

				this.rows.push(row);
			}
		}

		this.setActiveRows(this.activeRows);

		this.table.options.rowAdded.call(this.table, row.getComponent());

		if (this.table.options.dataChanged) {

			this.table.options.dataChanged.call(this.table, this.getData());
		}

		if (!blockRedraw) {

			this.reRenderInPosition();
		}

		return row;
	};

	RowManager.prototype.moveRow = function (from, to, after) {

		if (this.table.options.history && this.table.modExists("history")) {

			this.table.modules.history.action("rowMove", from, { posFrom: this.getRowPosition(from), posTo: this.getRowPosition(to), to: to, after: after });
		}

		this.moveRowActual(from, to, after);

		this.regenerateRowNumbers();

		this.table.options.rowMoved.call(this.table, from.getComponent());
	};

	RowManager.prototype.moveRowActual = function (from, to, after) {
		var _this14 = this;

		this._moveRowInArray(this.rows, from, to, after);

		this._moveRowInArray(this.activeRows, from, to, after);

		this.displayRowIterator(function (rows) {

			_this14._moveRowInArray(rows, from, to, after);
		});

		if (this.table.options.groupBy && this.table.modExists("groupRows")) {

			if (!after && to instanceof Group) {

				to = this.table.rowManager.prevDisplayRow(from) || to;
			}

			var toGroup = to.getGroup();

			var fromGroup = from.getGroup();

			if (toGroup === fromGroup) {

				this._moveRowInArray(toGroup.rows, from, to, after);
			} else {

				if (fromGroup) {

					fromGroup.removeRow(from);
				}

				toGroup.insertRow(from, to, after);
			}
		}
	};

	RowManager.prototype._moveRowInArray = function (rows, from, to, after) {

		var fromIndex, toIndex, start, end;

		if (from !== to) {

			fromIndex = rows.indexOf(from);

			if (fromIndex > -1) {

				rows.splice(fromIndex, 1);

				toIndex = rows.indexOf(to);

				if (toIndex > -1) {

					if (after) {

						rows.splice(toIndex + 1, 0, from);
					} else {

						rows.splice(toIndex, 0, from);
					}
				} else {

					rows.splice(fromIndex, 0, from);
				}
			}

			//restyle rows

			if (rows === this.getDisplayRows()) {

				start = fromIndex < toIndex ? fromIndex : toIndex;

				end = toIndex > fromIndex ? toIndex : fromIndex + 1;

				for (var _i4 = start; _i4 <= end; _i4++) {

					if (rows[_i4]) {

						this.styleRow(rows[_i4], _i4);
					}
				}
			}
		}
	};

	RowManager.prototype.clearData = function () {

		this.setData([]);
	};

	RowManager.prototype.getRowIndex = function (row) {

		return this.findRowIndex(row, this.rows);
	};

	RowManager.prototype.getDisplayRowIndex = function (row) {

		var index = this.getDisplayRows().indexOf(row);

		return index > -1 ? index : false;
	};

	RowManager.prototype.nextDisplayRow = function (row, rowOnly) {

		var index = this.getDisplayRowIndex(row),
		    nextRow = false;

		if (index !== false && index < this.displayRowsCount - 1) {

			nextRow = this.getDisplayRows()[index + 1];
		}

		if (nextRow && (!(nextRow instanceof Row) || nextRow.type != "row")) {

			return this.nextDisplayRow(nextRow, rowOnly);
		}

		return nextRow;
	};

	RowManager.prototype.prevDisplayRow = function (row, rowOnly) {

		var index = this.getDisplayRowIndex(row),
		    prevRow = false;

		if (index) {

			prevRow = this.getDisplayRows()[index - 1];
		}

		if (rowOnly && prevRow && (!(prevRow instanceof Row) || prevRow.type != "row")) {

			return this.prevDisplayRow(prevRow, rowOnly);
		}

		return prevRow;
	};

	RowManager.prototype.findRowIndex = function (row, list) {

		var rowIndex;

		row = this.findRow(row);

		if (row) {

			rowIndex = list.indexOf(row);

			if (rowIndex > -1) {

				return rowIndex;
			}
		}

		return false;
	};

	RowManager.prototype.getData = function (active, transform) {

		var output = [],
		    rows = this.getRows(active);

		rows.forEach(function (row) {

			if (row.type == "row") {

				output.push(row.getData(transform || "data"));
			}
		});

		return output;
	};

	RowManager.prototype.getComponents = function (active) {

		var output = [],
		    rows = this.getRows(active);

		rows.forEach(function (row) {

			output.push(row.getComponent());
		});

		return output;
	};

	RowManager.prototype.getDataCount = function (active) {

		var rows = this.getRows(active);

		return rows.length;
	};

	RowManager.prototype._genRemoteRequest = function () {
		var _this15 = this;

		var table = this.table,
		    options = table.options,
		    params = {};

		if (table.modExists("page")) {

			//set sort data if defined

			if (options.ajaxSorting) {

				var sorters = this.table.modules.sort.getSort();

				sorters.forEach(function (item) {

					delete item.column;
				});

				params[this.table.modules.page.paginationDataSentNames.sorters] = sorters;
			}

			//set filter data if defined

			if (options.ajaxFiltering) {

				var filters = this.table.modules.filter.getFilters(true, true);

				params[this.table.modules.page.paginationDataSentNames.filters] = filters;
			}

			this.table.modules.ajax.setParams(params, true);
		}

		table.modules.ajax.sendRequest().then(function (data) {

			_this15._setDataActual(data, true);
		}).catch(function (e) {});
	};

	//choose the path to refresh data after a filter update

	RowManager.prototype.filterRefresh = function () {

		var table = this.table,
		    options = table.options,
		    left = this.scrollLeft;

		if (options.ajaxFiltering) {

			if (options.pagination == "remote" && table.modExists("page")) {

				table.modules.page.reset(true);

				table.modules.page.setPage(1).then(function () {}).catch(function () {});
			} else if (options.ajaxProgressiveLoad) {

				table.modules.ajax.loadData().then(function () {}).catch(function () {});
			} else {

				//assume data is url, make ajax call to url to get data

				this._genRemoteRequest();
			}
		} else {

			this.refreshActiveData("filter");
		}

		this.scrollHorizontal(left);
	};

	//choose the path to refresh data after a sorter update

	RowManager.prototype.sorterRefresh = function (loadOrignalData) {

		var table = this.table,
		    options = this.table.options,
		    left = this.scrollLeft;

		if (options.ajaxSorting) {

			if ((options.pagination == "remote" || options.progressiveLoad) && table.modExists("page")) {

				table.modules.page.reset(true);

				table.modules.page.setPage(1).then(function () {}).catch(function () {});
			} else if (options.ajaxProgressiveLoad) {

				table.modules.ajax.loadData().then(function () {}).catch(function () {});
			} else {

				//assume data is url, make ajax call to url to get data

				this._genRemoteRequest();
			}
		} else {

			this.refreshActiveData(loadOrignalData ? "filter" : "sort");
		}

		this.scrollHorizontal(left);
	};

	RowManager.prototype.scrollHorizontal = function (left) {

		this.scrollLeft = left;

		this.element.scrollLeft = left;

		if (this.table.options.groupBy) {

			this.table.modules.groupRows.scrollHeaders(left);
		}

		if (this.table.modExists("columnCalcs")) {

			this.table.modules.columnCalcs.scrollHorizontal(left);
		}
	};

	//set active data set

	RowManager.prototype.refreshActiveData = function (stage, skipStage, renderInPosition) {

		var self = this,
		    table = this.table,
		    cascadeOrder = ["all", "filter", "sort", "display", "freeze", "group", "tree", "page"],
		    displayIndex;

		if (this.redrawBlock) {

			if (!this.redrawBlockRestoreConfig || cascadeOrder.indexOf(stage) < cascadeOrder.indexOf(this.redrawBlockRestoreConfig.stage)) {

				this.redrawBlockRestoreConfig = {

					stage: stage,

					skipStage: skipStage,

					renderInPosition: renderInPosition

				};
			}

			return;
		} else {

			if (self.table.modExists("edit")) {

				self.table.modules.edit.cancelEdit();
			}

			if (!stage) {

				stage = "all";
			}

			if (table.options.selectable && !table.options.selectablePersistence && table.modExists("selectRow")) {

				table.modules.selectRow.deselectRows();
			}

			//cascade through data refresh stages

			switch (stage) {

				case "all":

				case "filter":

					if (!skipStage) {

						if (table.modExists("filter")) {

							self.setActiveRows(table.modules.filter.filter(self.rows));
						} else {

							self.setActiveRows(self.rows.slice(0));
						}
					} else {

						skipStage = false;
					}

				case "sort":

					if (!skipStage) {

						if (table.modExists("sort")) {

							table.modules.sort.sort(this.activeRows);
						}
					} else {

						skipStage = false;
					}

					//regenerate row numbers for row number formatter if in use

					this.regenerateRowNumbers();

				//generic stage to allow for pipeline trigger after the data manipulation stage

				case "display":

					this.resetDisplayRows();

				case "freeze":

					if (!skipStage) {

						if (this.table.modExists("frozenRows")) {

							if (table.modules.frozenRows.isFrozen()) {

								if (!table.modules.frozenRows.getDisplayIndex()) {

									table.modules.frozenRows.setDisplayIndex(this.getNextDisplayIndex());
								}

								displayIndex = table.modules.frozenRows.getDisplayIndex();

								displayIndex = self.setDisplayRows(table.modules.frozenRows.getRows(this.getDisplayRows(displayIndex - 1)), displayIndex);

								if (displayIndex !== true) {

									table.modules.frozenRows.setDisplayIndex(displayIndex);
								}
							}
						}
					} else {

						skipStage = false;
					}

				case "group":

					if (!skipStage) {

						if (table.options.groupBy && table.modExists("groupRows")) {

							if (!table.modules.groupRows.getDisplayIndex()) {

								table.modules.groupRows.setDisplayIndex(this.getNextDisplayIndex());
							}

							displayIndex = table.modules.groupRows.getDisplayIndex();

							displayIndex = self.setDisplayRows(table.modules.groupRows.getRows(this.getDisplayRows(displayIndex - 1)), displayIndex);

							if (displayIndex !== true) {

								table.modules.groupRows.setDisplayIndex(displayIndex);
							}
						}
					} else {

						skipStage = false;
					}

				case "tree":

					if (!skipStage) {

						if (table.options.dataTree && table.modExists("dataTree")) {

							if (!table.modules.dataTree.getDisplayIndex()) {

								table.modules.dataTree.setDisplayIndex(this.getNextDisplayIndex());
							}

							displayIndex = table.modules.dataTree.getDisplayIndex();

							displayIndex = self.setDisplayRows(table.modules.dataTree.getRows(this.getDisplayRows(displayIndex - 1)), displayIndex);

							if (displayIndex !== true) {

								table.modules.dataTree.setDisplayIndex(displayIndex);
							}
						}
					} else {

						skipStage = false;
					}

					if (table.options.pagination && table.modExists("page") && !renderInPosition) {

						if (table.modules.page.getMode() == "local") {

							table.modules.page.reset();
						}
					}

				case "page":

					if (!skipStage) {

						if (table.options.pagination && table.modExists("page")) {

							if (!table.modules.page.getDisplayIndex()) {

								table.modules.page.setDisplayIndex(this.getNextDisplayIndex());
							}

							displayIndex = table.modules.page.getDisplayIndex();

							if (table.modules.page.getMode() == "local") {

								table.modules.page.setMaxRows(this.getDisplayRows(displayIndex - 1).length);
							}

							displayIndex = self.setDisplayRows(table.modules.page.getRows(this.getDisplayRows(displayIndex - 1)), displayIndex);

							if (displayIndex !== true) {

								table.modules.page.setDisplayIndex(displayIndex);
							}
						}
					} else {

						skipStage = false;
					}

			}

			if (Tabulator.prototype.helpers.elVisible(self.element)) {

				if (renderInPosition) {

					self.reRenderInPosition();
				} else {

					if (stage === "all" && this.table.options.virtualDomHoz) {

						this.table.vdomHoz.dataChange();
					}

					self.renderTable();

					if (table.options.layoutColumnsOnNewData) {

						self.table.columnManager.redraw(true);
					}
				}
			}

			if (table.modExists("columnCalcs")) {

				table.modules.columnCalcs.recalc(this.activeRows);
			}
		}
	};

	//regenerate row numbers for row number formatter if in use

	RowManager.prototype.regenerateRowNumbers = function () {
		var _this16 = this;

		if (this.rowNumColumn) {

			this.activeRows.forEach(function (row) {

				var cell = row.getCell(_this16.rowNumColumn);

				if (cell) {

					cell._generateContents();
				}
			});
		}
	};

	RowManager.prototype.setActiveRows = function (activeRows) {

		this.activeRows = activeRows;

		this.activeRowsCount = this.activeRows.length;
	};

	//reset display rows array

	RowManager.prototype.resetDisplayRows = function () {

		this.displayRows = [];

		this.displayRows.push(this.activeRows.slice(0));

		this.displayRowsCount = this.displayRows[0].length;

		if (this.table.modExists("frozenRows")) {

			this.table.modules.frozenRows.setDisplayIndex(0);
		}

		if (this.table.options.groupBy && this.table.modExists("groupRows")) {

			this.table.modules.groupRows.setDisplayIndex(0);
		}

		if (this.table.options.pagination && this.table.modExists("page")) {

			this.table.modules.page.setDisplayIndex(0);
		}
	};

	RowManager.prototype.getNextDisplayIndex = function () {

		return this.displayRows.length;
	};

	//set display row pipeline data

	RowManager.prototype.setDisplayRows = function (displayRows, index) {

		var output = true;

		if (index && typeof this.displayRows[index] != "undefined") {

			this.displayRows[index] = displayRows;

			output = true;
		} else {

			this.displayRows.push(displayRows);

			output = index = this.displayRows.length - 1;
		}

		if (index == this.displayRows.length - 1) {

			this.displayRowsCount = this.displayRows[this.displayRows.length - 1].length;
		}

		return output;
	};

	RowManager.prototype.getDisplayRows = function (index) {

		if (typeof index == "undefined") {

			return this.displayRows.length ? this.displayRows[this.displayRows.length - 1] : [];
		} else {

			return this.displayRows[index] || [];
		}
	};

	RowManager.prototype.getVisibleRows = function (viewable) {

		var topEdge = this.element.scrollTop,
		    bottomEdge = this.element.clientHeight + topEdge,
		    topFound = false,
		    topRow = 0,
		    bottomRow = 0,
		    rows = this.getDisplayRows();

		if (viewable) {

			this.getDisplayRows();

			for (var i = this.vDomTop; i <= this.vDomBottom; i++) {

				if (rows[i]) {

					if (!topFound) {

						if (topEdge - rows[i].getElement().offsetTop >= 0) {

							topRow = i;
						} else {

							topFound = true;

							if (bottomEdge - rows[i].getElement().offsetTop >= 0) {

								bottomRow = i;
							} else {

								break;
							}
						}
					} else {

						if (bottomEdge - rows[i].getElement().offsetTop >= 0) {

							bottomRow = i;
						} else {

							break;
						}
					}
				}
			}
		} else {

			topRow = this.vDomTop;

			bottomRow = this.vDomBottom;
		}

		return rows.slice(topRow, bottomRow + 1);
	};

	//repeat action accross display rows

	RowManager.prototype.displayRowIterator = function (callback) {

		this.displayRows.forEach(callback);

		this.displayRowsCount = this.displayRows[this.displayRows.length - 1].length;
	};

	//return only actual rows (not group headers etc)

	RowManager.prototype.getRows = function (active) {

		var rows;

		switch (active) {

			case "active":

				rows = this.activeRows;

				break;

			case "display":

				rows = this.table.rowManager.getDisplayRows();

				break;

			case "visible":

				rows = this.getVisibleRows(true);

				break;

			case "selected":

				rows = this.table.modules.selectRow.selectedRows;

				break;

			default:

				rows = this.rows;

		}

		return rows;
	};

	///////////////// Table Rendering /////////////////


	//trigger rerender of table in current position

	RowManager.prototype.reRenderInPosition = function (callback) {

		if (this.getRenderMode() == "virtual") {

			if (this.redrawBlock) {

				if (callback) {

					callback();
				} else {

					this.redrawBlockRederInPosition = true;
				}
			} else {

				var scrollTop = this.element.scrollTop;

				var topRow = false;

				var topOffset = false;

				var left = this.scrollLeft;

				var rows = this.getDisplayRows();

				for (var i = this.vDomTop; i <= this.vDomBottom; i++) {

					if (rows[i]) {

						var diff = scrollTop - rows[i].getElement().offsetTop;

						if (topOffset === false || Math.abs(diff) < topOffset) {

							topOffset = diff;

							topRow = i;
						} else {

							break;
						}
					}
				}

				if (callback) {

					callback();
				}

				this._virtualRenderFill(topRow === false ? this.displayRowsCount - 1 : topRow, true, topOffset || 0);

				this.scrollHorizontal(left);
			}
		} else {

			this.renderTable();

			if (callback) {

				callback();
			}
		}
	};

	RowManager.prototype.setRenderMode = function () {

		if (this.table.options.virtualDom) {

			this.renderMode = "virtual";

			if (this.table.element.clientHeight || this.table.options.height) {

				this.fixedHeight = true;
			} else {

				this.fixedHeight = false;
			}
		} else {

			this.renderMode = "classic";
		}
	};

	RowManager.prototype.getRenderMode = function () {

		return this.renderMode;
	};

	RowManager.prototype.renderTable = function () {

		this.table.options.renderStarted.call(this.table);

		this.element.scrollTop = 0;

		switch (this.renderMode) {

			case "classic":

				this._simpleRender();

				break;

			case "virtual":

				this._virtualRenderFill();

				break;

		}

		if (this.firstRender) {

			if (this.displayRowsCount) {

				this.firstRender = false;

				this.table.modules.layout.layout();
			} else {

				this.renderEmptyScroll();
			}
		}

		if (this.table.modExists("frozenColumns")) {

			this.table.modules.frozenColumns.layout();
		}

		if (!this.displayRowsCount) {

			if (this.table.options.placeholder) {

				this.table.options.placeholder.setAttribute("tabulator-render-mode", this.renderMode);

				this.getElement().appendChild(this.table.options.placeholder);

				this.table.options.placeholder.style.width = this.table.columnManager.getWidth() + "px";
			}
		}

		this.table.options.renderComplete.call(this.table);
	};

	//simple render on heightless table

	RowManager.prototype._simpleRender = function () {

		this._clearVirtualDom();

		if (this.displayRowsCount) {

			this.checkClassicModeGroupHeaderWidth();
		} else {

			this.renderEmptyScroll();
		}
	};

	RowManager.prototype.checkClassicModeGroupHeaderWidth = function () {

		var self = this,
		    element = this.tableElement,
		    onlyGroupHeaders = true;

		self.getDisplayRows().forEach(function (row, index) {

			self.styleRow(row, index);

			element.appendChild(row.getElement());

			row.initialize(true);

			if (row.type !== "group") {

				onlyGroupHeaders = false;
			}
		});

		if (onlyGroupHeaders) {

			element.style.minWidth = self.table.columnManager.getWidth() + "px";
		} else {

			element.style.minWidth = "";
		}
	};

	//show scrollbars on empty table div

	RowManager.prototype.renderEmptyScroll = function () {

		if (this.table.options.placeholder) {

			this.tableElement.style.display = "none";
		} else {

			this.tableElement.style.minWidth = this.table.columnManager.getWidth() + "px";

			// this.tableElement.style.minHeight = "1px";

			// this.tableElement.style.visibility = "hidden";
		}
	};

	RowManager.prototype._clearVirtualDom = function () {

		var element = this.tableElement;

		if (this.table.options.placeholder && this.table.options.placeholder.parentNode) {

			this.table.options.placeholder.parentNode.removeChild(this.table.options.placeholder);
		}

		// element.children.detach();

		while (element.firstChild) {
			element.removeChild(element.firstChild);
		}element.style.paddingTop = "";

		element.style.paddingBottom = "";

		element.style.minWidth = "";

		element.style.minHeight = "";

		element.style.display = "";

		element.style.visibility = "";

		this.scrollTop = 0;

		this.scrollLeft = 0;

		this.vDomTop = 0;

		this.vDomBottom = 0;

		this.vDomTopPad = 0;

		this.vDomBottomPad = 0;
	};

	RowManager.prototype.styleRow = function (row, index) {

		var rowEl = row.getElement();

		if (index % 2) {

			rowEl.classList.add("tabulator-row-even");

			rowEl.classList.remove("tabulator-row-odd");
		} else {

			rowEl.classList.add("tabulator-row-odd");

			rowEl.classList.remove("tabulator-row-even");
		}
	};

	//full virtual render

	RowManager.prototype._virtualRenderFill = function (position, forceMove, offset) {

		var self = this,
		    element = self.tableElement,
		    holder = self.element,
		    topPad = 0,
		    rowsHeight = 0,
		    topPadHeight = 0,
		    i = 0,
		    onlyGroupHeaders = true,
		    rows = self.getDisplayRows();

		position = position || 0;

		offset = offset || 0;

		if (!position) {

			self._clearVirtualDom();
		} else {

			while (element.firstChild) {
				element.removeChild(element.firstChild);
			} //check if position is too close to bottom of table

			var heightOccupied = (self.displayRowsCount - position + 1) * self.vDomRowHeight;

			if (heightOccupied < self.height) {

				position -= Math.ceil((self.height - heightOccupied) / self.vDomRowHeight);

				if (position < 0) {

					position = 0;
				}
			}

			//calculate initial pad

			topPad = Math.min(Math.max(Math.floor(self.vDomWindowBuffer / self.vDomRowHeight), self.vDomWindowMinMarginRows), position);

			position -= topPad;
		}

		if (self.displayRowsCount && Tabulator.prototype.helpers.elVisible(self.element)) {

			self.vDomTop = position;

			self.vDomBottom = position - 1;

			while ((rowsHeight <= self.height + self.vDomWindowBuffer || i < self.vDomWindowMinTotalRows) && self.vDomBottom < self.displayRowsCount - 1) {

				var index = self.vDomBottom + 1,
				    row = rows[index],
				    rowHeight = 0;

				self.styleRow(row, index);

				element.appendChild(row.getElement());

				row.initialize();

				if (!row.heightInitialized) {

					row.normalizeHeight(true);
				}

				// if(!row.initialized){

				// 	row.initialize(true);

				// }else{

				// 	if(!row.heightInitialized){

				// 		row.normalizeHeight(true);

				// 	}

				// }


				rowHeight = row.getHeight();

				if (i < topPad) {

					topPadHeight += rowHeight;
				} else {

					rowsHeight += rowHeight;
				}

				if (rowHeight > this.vDomWindowBuffer) {

					this.vDomWindowBuffer = rowHeight * 2;
				}

				if (row.type !== "group") {

					onlyGroupHeaders = false;
				}

				self.vDomBottom++;

				i++;
			}

			if (!position) {

				this.vDomTopPad = 0;

				//adjust rowheight to match average of rendered elements

				self.vDomRowHeight = Math.floor((rowsHeight + topPadHeight) / i);

				self.vDomBottomPad = self.vDomRowHeight * (self.displayRowsCount - self.vDomBottom - 1);

				self.vDomScrollHeight = topPadHeight + rowsHeight + self.vDomBottomPad - self.height;
			} else {

				self.vDomTopPad = !forceMove ? self.scrollTop - topPadHeight : self.vDomRowHeight * this.vDomTop + offset;

				self.vDomBottomPad = self.vDomBottom == self.displayRowsCount - 1 ? 0 : Math.max(self.vDomScrollHeight - self.vDomTopPad - rowsHeight - topPadHeight, 0);
			}

			element.style.paddingTop = self.vDomTopPad + "px";

			element.style.paddingBottom = self.vDomBottomPad + "px";

			if (forceMove) {

				this.scrollTop = self.vDomTopPad + topPadHeight + offset - (this.element.scrollWidth > this.element.clientWidth ? this.element.offsetHeight - this.element.clientHeight : 0);
			}

			this.scrollTop = Math.min(this.scrollTop, this.element.scrollHeight - this.height);

			//adjust for horizontal scrollbar if present (and not at top of table)

			if (this.element.scrollWidth > this.element.offsetWidth && forceMove) {

				this.scrollTop += this.element.offsetHeight - this.element.clientHeight;
			}

			this.vDomScrollPosTop = this.scrollTop;

			this.vDomScrollPosBottom = this.scrollTop;

			holder.scrollTop = this.scrollTop;

			element.style.minWidth = onlyGroupHeaders ? self.table.columnManager.getWidth() + "px" : "";

			if (self.table.options.groupBy) {

				if (self.table.modules.layout.getMode() != "fitDataFill" && self.displayRowsCount == self.table.modules.groupRows.countGroups()) {

					self.tableElement.style.minWidth = self.table.columnManager.getWidth();
				}
			}
		} else {

			this.renderEmptyScroll();
		}

		if (!this.fixedHeight) {

			this.adjustTableSize();
		}
	};

	//handle vertical scrolling

	RowManager.prototype.scrollVertical = function (dir) {

		var topDiff = this.scrollTop - this.vDomScrollPosTop;

		var bottomDiff = this.scrollTop - this.vDomScrollPosBottom;

		var margin = this.vDomWindowBuffer * 2;

		if (-topDiff > margin || bottomDiff > margin) {

			//if big scroll redraw table;

			var left = this.scrollLeft;

			this._virtualRenderFill(Math.floor(this.element.scrollTop / this.element.scrollHeight * this.displayRowsCount));

			this.scrollHorizontal(left);
		} else {

			if (dir) {

				//scrolling up

				if (topDiff < 0) {

					this._addTopRow(-topDiff);
				}

				if (bottomDiff < 0) {

					//hide bottom row if needed

					if (this.vDomScrollHeight - this.scrollTop > this.vDomWindowBuffer) {

						this._removeBottomRow(-bottomDiff);
					} else {

						this.vDomScrollPosBottom = this.scrollTop;
					}
				}
			} else {

				//scrolling down

				if (topDiff >= 0) {

					//hide top row if needed

					if (this.scrollTop > this.vDomWindowBuffer) {

						this._removeTopRow(topDiff);
					} else {

						this.vDomScrollPosTop = this.scrollTop;
					}
				}

				if (bottomDiff >= 0) {

					this._addBottomRow(bottomDiff);
				}
			}
		}
	};

	RowManager.prototype._addTopRow = function (topDiff) {
		var i = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;


		var table = this.tableElement,
		    rows = this.getDisplayRows();

		if (this.vDomTop) {

			var index = this.vDomTop - 1,
			    topRow = rows[index],
			    topRowHeight = topRow.getHeight() || this.vDomRowHeight;

			//hide top row if needed

			if (topDiff >= topRowHeight) {

				this.styleRow(topRow, index);

				table.insertBefore(topRow.getElement(), table.firstChild);

				if (!topRow.initialized || !topRow.heightInitialized) {

					this.vDomTopNewRows.push(topRow);

					if (!topRow.heightInitialized) {

						topRow.clearCellHeight();
					}
				}

				topRow.initialize();

				this.vDomTopPad -= topRowHeight;

				if (this.vDomTopPad < 0) {

					this.vDomTopPad = index * this.vDomRowHeight;
				}

				if (!index) {

					this.vDomTopPad = 0;
				}

				table.style.paddingTop = this.vDomTopPad + "px";

				this.vDomScrollPosTop -= topRowHeight;

				this.vDomTop--;
			}

			topDiff = -(this.scrollTop - this.vDomScrollPosTop);

			if (topRow.getHeight() > this.vDomWindowBuffer) {

				this.vDomWindowBuffer = topRow.getHeight() * 2;
			}

			if (i < this.vDomMaxRenderChain && this.vDomTop && topDiff >= (rows[this.vDomTop - 1].getHeight() || this.vDomRowHeight)) {

				this._addTopRow(topDiff, i + 1);
			} else {

				this._quickNormalizeRowHeight(this.vDomTopNewRows);
			}
		}
	};

	RowManager.prototype._removeTopRow = function (topDiff) {

		var table = this.tableElement,
		    topRow = this.getDisplayRows()[this.vDomTop],
		    topRowHeight = topRow.getHeight() || this.vDomRowHeight;

		if (topDiff >= topRowHeight) {

			var rowEl = topRow.getElement();

			rowEl.parentNode.removeChild(rowEl);

			this.vDomTopPad += topRowHeight;

			table.style.paddingTop = this.vDomTopPad + "px";

			this.vDomScrollPosTop += this.vDomTop ? topRowHeight : topRowHeight + this.vDomWindowBuffer;

			this.vDomTop++;

			topDiff = this.scrollTop - this.vDomScrollPosTop;

			this._removeTopRow(topDiff);
		}
	};

	RowManager.prototype._addBottomRow = function (bottomDiff) {
		var i = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;


		var table = this.tableElement,
		    rows = this.getDisplayRows();

		if (this.vDomBottom < this.displayRowsCount - 1) {

			var index = this.vDomBottom + 1,
			    bottomRow = rows[index],
			    bottomRowHeight = bottomRow.getHeight() || this.vDomRowHeight;

			//hide bottom row if needed

			if (bottomDiff >= bottomRowHeight) {

				this.styleRow(bottomRow, index);

				table.appendChild(bottomRow.getElement());

				if (!bottomRow.initialized || !bottomRow.heightInitialized) {

					this.vDomBottomNewRows.push(bottomRow);

					if (!bottomRow.heightInitialized) {

						bottomRow.clearCellHeight();
					}
				}

				bottomRow.initialize();

				this.vDomBottomPad -= bottomRowHeight;

				if (this.vDomBottomPad < 0 || index == this.displayRowsCount - 1) {

					this.vDomBottomPad = 0;
				}

				table.style.paddingBottom = this.vDomBottomPad + "px";

				this.vDomScrollPosBottom += bottomRowHeight;

				this.vDomBottom++;
			}

			bottomDiff = this.scrollTop - this.vDomScrollPosBottom;

			if (bottomRow.getHeight() > this.vDomWindowBuffer) {

				this.vDomWindowBuffer = bottomRow.getHeight() * 2;
			}

			if (i < this.vDomMaxRenderChain && this.vDomBottom < this.displayRowsCount - 1 && bottomDiff >= (rows[this.vDomBottom + 1].getHeight() || this.vDomRowHeight)) {

				this._addBottomRow(bottomDiff, i + 1);
			} else {

				this._quickNormalizeRowHeight(this.vDomBottomNewRows);
			}
		}
	};

	RowManager.prototype._removeBottomRow = function (bottomDiff) {

		var table = this.tableElement,
		    bottomRow = this.getDisplayRows()[this.vDomBottom],
		    bottomRowHeight = bottomRow.getHeight() || this.vDomRowHeight;

		if (bottomDiff >= bottomRowHeight) {

			var rowEl = bottomRow.getElement();

			if (rowEl.parentNode) {

				rowEl.parentNode.removeChild(rowEl);
			}

			this.vDomBottomPad += bottomRowHeight;

			if (this.vDomBottomPad < 0) {

				this.vDomBottomPad = 0;
			}

			table.style.paddingBottom = this.vDomBottomPad + "px";

			this.vDomScrollPosBottom -= bottomRowHeight;

			this.vDomBottom--;

			bottomDiff = -(this.scrollTop - this.vDomScrollPosBottom);

			this._removeBottomRow(bottomDiff);
		}
	};

	RowManager.prototype._quickNormalizeRowHeight = function (rows) {

		rows.forEach(function (row) {

			row.calcHeight();
		});

		rows.forEach(function (row) {

			row.setCellHeight();
		});

		rows.length = 0;
	};

	//normalize height of active rows

	RowManager.prototype.normalizeHeight = function () {

		this.activeRows.forEach(function (row) {

			row.normalizeHeight();
		});
	};

	//adjust the height of the table holder to fit in the Tabulator element

	RowManager.prototype.adjustTableSize = function () {

		var initialHeight = this.element.clientHeight,
		    modExists;

		if (this.renderMode === "virtual") {

			var otherHeight = Math.floor(this.columnManager.getElement().getBoundingClientRect().height + (this.table.footerManager && this.table.footerManager.active && !this.table.footerManager.external ? this.table.footerManager.getElement().getBoundingClientRect().height : 0));

			if (this.fixedHeight) {

				this.element.style.minHeight = "calc(100% - " + otherHeight + "px)";

				this.element.style.height = "calc(100% - " + otherHeight + "px)";

				this.element.style.maxHeight = "calc(100% - " + otherHeight + "px)";
			} else {

				this.element.style.height = "";

				this.element.style.height = this.table.element.clientHeight - otherHeight + "px";

				this.element.scrollTop = this.scrollTop;
			}

			this.height = this.element.clientHeight;

			this.vDomWindowBuffer = this.table.options.virtualDomBuffer || this.height;

			//check if the table has changed size when dealing with variable height tables

			if (!this.fixedHeight && initialHeight != this.element.clientHeight) {

				modExists = this.table.modExists("resizeTable");

				if (modExists && !this.table.modules.resizeTable.autoResize || !modExists) {

					this.redraw();
				}
			}
		}
	};

	//renitialize all rows

	RowManager.prototype.reinitialize = function () {

		this.rows.forEach(function (row) {

			row.reinitialize(true);
		});
	};

	//prevent table from being redrawn

	RowManager.prototype.blockRedraw = function () {

		this.redrawBlock = true;

		this.redrawBlockRestoreConfig = false;
	};

	//restore table redrawing

	RowManager.prototype.restoreRedraw = function () {

		this.redrawBlock = false;

		if (this.redrawBlockRestoreConfig) {

			this.refreshActiveData(this.redrawBlockRestoreConfig.stage, this.redrawBlockRestoreConfig.skipStage, this.redrawBlockRestoreConfig.renderInPosition);

			this.redrawBlockRestoreConfig = false;
		} else {

			if (this.redrawBlockRederInPosition) {

				this.reRenderInPosition();
			}
		}

		this.redrawBlockRederInPosition = false;
	};

	//redraw table

	RowManager.prototype.redraw = function (force) {

		var pos = 0,
		    left = this.scrollLeft;

		this.adjustTableSize();

		this.table.tableWidth = this.table.element.clientWidth;

		if (!force) {

			if (this.renderMode == "classic") {

				if (this.table.options.groupBy) {

					this.refreshActiveData("group", false, false);
				} else {

					this._simpleRender();
				}
			} else {

				this.reRenderInPosition();

				this.scrollHorizontal(left);
			}

			if (!this.displayRowsCount) {

				if (this.table.options.placeholder) {

					this.getElement().appendChild(this.table.options.placeholder);
				}
			}
		} else {

			this.renderTable();
		}
	};

	RowManager.prototype.resetScroll = function () {

		this.element.scrollLeft = 0;

		this.element.scrollTop = 0;

		if (this.table.browser === "ie") {

			var event = document.createEvent("Event");

			event.initEvent("scroll", false, true);

			this.element.dispatchEvent(event);
		} else {

			this.element.dispatchEvent(new Event('scroll'));
		}
	};

	var VDomHoz = function VDomHoz(table) {

		this.table = table;

		this.element = this.table.rowManager.tableElement;

		this.holderEl = this.table.rowManager.element;

		this.leftCol = 0;

		this.rightCol = 0;

		this.scrollLeft = 0;

		this.vDomScrollPosLeft = 0;

		this.vDomScrollPosRight = 0;

		this.vDomPadLeft = 0;

		this.vDomPadRight = 0;

		this.fitDataColAvg = 0;

		this.window = 200; //pixel margin to make column visible before it is shown on screen


		this.initialized = false;

		this.columns = [];

		if (this.compatabilityCheck()) {

			this.initialize();
		}
	};

	VDomHoz.prototype.compatabilityCheck = function () {

		var options = this.table.options,
		    frozen = false,
		    ok = true;

		if (options.layout == "fitDataTable") {

			console.warn("Horizontal Vitrual DOM is not compatible with fitDataTable layout mode");

			ok = false;
		}

		if (options.responsiveLayout) {

			console.warn("Horizontal Vitrual DOM is not compatible with responsive columns");

			ok = false;
		}

		if (this.table.rtl) {

			console.warn("Horizontal Vitrual DOM is not currently compatible with RTL text direction");

			ok = false;
		}

		// if(options.rowFormatter){

		// 	console.warn("Horizontal Vitrual DOM is not compatible with row formatters");

		// 	ok = false;

		// }


		if (options.columns) {

			frozen = options.columns.find(function (col) {

				return col.frozen;
			});

			if (frozen) {

				console.warn("Horizontal Vitrual DOM is not compatible with frozen columns");

				ok = false;
			}
		}

		if (!ok) {

			options.virtualDomHoz = false;
		}

		return ok;
	};

	VDomHoz.prototype.initialize = function () {
		var _this17 = this;

		this.holderEl.addEventListener("scroll", function () {

			var left = _this17.holderEl.scrollLeft;

			if (_this17.scrollLeft != left) {

				_this17.scrollLeft = left;

				_this17.scroll(left - (_this17.vDomScrollPosLeft + _this17.window));
			}
		});
	};

	VDomHoz.prototype.deinitialize = function () {

		this.initialized = false;
	};

	VDomHoz.prototype.clear = function () {

		this.columns = [];

		this.leftCol = -1;

		this.rightCol = 0;

		this.vDomScrollPosLeft = 0;

		this.vDomScrollPosRight = 0;

		this.vDomPadLeft = 0;

		this.vDomPadRight = 0;
	};

	VDomHoz.prototype.dataChange = function () {

		var change = false,
		    collsWidth = 0,
		    colEnd = 0,
		    group,
		    row,
		    rowEl;

		if (this.table.options.layout === "fitData") {

			this.table.columnManager.columnsByIndex.forEach(function (column) {

				if (!column.definition.width && column.visible) {

					change = true;
				}
			});

			if (change) {

				if (change && this.table.rowManager.getDisplayRows().length) {

					// this.table.vdomHoz.deinitialize();


					this.vDomScrollPosRight = this.scrollLeft + this.holderEl.clientWidth + this.window;

					if (this.table.options.groupBy) {

						group = this.table.modules.groupRows.getGroups(false)[0];

						row = group.getRows(false)[0];
					} else {

						row = this.table.rowManager.getDisplayRows()[0];
					}

					if (row) {

						rowEl = row.getElement();

						row.generateCells();

						this.element.appendChild(rowEl);

						for (var colEnd = 0; colEnd < row.cells.length; colEnd++) {

							var cell = row.cells[colEnd];

							rowEl.appendChild(cell.getElement());

							cell.column.reinitializeWidth();

							collsWidth += cell.column.getWidth();

							if (collsWidth > this.vDomScrollPosRight) {

								break;
							}
						}

						rowEl.parentNode.removeChild(rowEl);

						this.fitDataColAvg = Math.floor(collsWidth / (colEnd + 1));

						for (colEnd; colEnd < this.table.columnManager.columnsByIndex.length; colEnd++) {

							this.table.columnManager.columnsByIndex[colEnd].setWidth(this.fitDataColAvg);
						}

						this.reinitialize(false, true);
					}
				}
			}
		} else {

			if (this.table.options.layout === "fitColumns") {

				this.table.modules.layout.layout();

				this.table.vdomHoz.reinitialize(false, true);
			}
		}
	};

	VDomHoz.prototype.fitDataLayoutOverride = function () {

		for (var _i5 = this.leftCol; _i5 <= this.rightCol; _i5++) {

			this.columns[_i5].reinitializeWidth();
		}
	};

	VDomHoz.prototype.reinitialize = function (update, blockRedraw) {
		var _this18 = this;

		var old = {

			cols: this.columns,

			leftCol: this.leftCol,

			rightCol: this.rightCol

		};

		if (update && !this.initialized) {

			return;
		}

		this.clear();

		this.scrollLeft = this.holderEl.scrollLeft;

		this.vDomScrollPosLeft = this.scrollLeft - this.window;

		this.vDomScrollPosRight = this.scrollLeft + this.holderEl.clientWidth + this.window;

		var colPos = 0;

		this.table.columnManager.columnsByIndex.forEach(function (column) {

			var config = {};

			if (column.visible) {

				var width = column.getWidth();

				config.leftPos = colPos;

				config.rightPos = colPos + width;

				if (colPos + width > _this18.vDomScrollPosLeft && colPos < _this18.vDomScrollPosRight) {

					//column is visible


					if (_this18.leftCol == -1) {

						_this18.leftCol = _this18.columns.length;

						_this18.vDomPadLeft = colPos;
					}

					_this18.rightCol = _this18.columns.length;
				} else {

					// column is hidden

					if (_this18.leftCol !== -1) {

						_this18.vDomPadRight += width;
					}
				}

				_this18.columns.push(column);

				column.modules.vdomHoz = config;

				colPos += width;
			}
		});

		this.element.style.paddingLeft = this.vDomPadLeft + "px";

		this.element.style.paddingRight = this.vDomPadRight + "px";

		this.initialized = true;

		if (!blockRedraw) {

			if (!update || this.reinitChanged(old)) {

				this.renitializeRows();
			}
		}

		this.holderEl.scrollLeft = this.scrollLeft;
	};

	VDomHoz.prototype.reinitChanged = function (old) {
		var _this19 = this;

		var match = true;

		if (old.cols.length !== this.columns.length || old.leftCol !== this.leftCol || old.rightCol !== this.rightCol) {

			return true;
		}

		old.cols.forEach(function (col, i) {

			if (col !== _this19.columns[i]) {

				match = false;
			}
		});

		return !match;
	};

	VDomHoz.prototype.renitializeRows = function () {
		var _this20 = this;

		var rows = this.table.rowManager.getVisibleRows();

		rows.forEach(function (row) {

			_this20.reinitializeRow(row, true);
		});
	};

	VDomHoz.prototype.scroll = function (diff) {

		this.vDomScrollPosLeft += diff;

		this.vDomScrollPosRight += diff;

		if (diff > this.holderEl.clientWidth * .8) {

			this.reinitialize();
		} else {

			if (diff > 0) {

				//scroll right

				this.addColRight();

				this.removeColLeft();
			} else {

				//scroll left

				this.addColLeft();

				this.removeColRight();
			}
		}
	};

	VDomHoz.prototype.colPositionAdjust = function (start, end, diff) {

		for (var _i6 = start; _i6 < end; _i6++) {

			var column = this.columns[_i6];

			column.modules.vdomHoz.leftPos -= diff;

			column.modules.vdomHoz.rightPos -= diff;
		}
	};

	VDomHoz.prototype.addColRight = function () {

		var column = this.columns[this.rightCol + 1],
		    rows,
		    oldWidth,
		    widthDiff;

		if (column && column.modules.vdomHoz.leftPos <= this.vDomScrollPosRight) {

			rows = this.table.rowManager.getVisibleRows();

			rows.forEach(function (row) {

				if (row.type !== "group") {

					var cell = row.getCell(column);

					row.getElement().appendChild(cell.getElement());

					cell.cellRendered();
				}
			});

			if (this.fitDataColAvg) {

				oldWidth = column.getWidth();

				if (oldWidth === this.fitDataColAvg) {

					column.reinitializeWidth();

					widthDiff = oldWidth - column.getWidth();

					if (widthDiff) {

						column.modules.vdomHoz.rightPos -= widthDiff;

						this.colPositionAdjust(this.rightCol + 1, this.columns.length, widthDiff);
					}
				}
			}

			this.rightCol++;

			if (this.rightCol >= this.columns.length - 1) {

				this.vDomPadRight = 0;
			} else {

				this.vDomPadRight -= column.getWidth();
			}

			this.element.style.paddingRight = this.vDomPadRight + "px";

			this.addColRight();
		}
	};

	VDomHoz.prototype.addColLeft = function () {

		var column = this.columns[this.leftCol - 1],
		    rows;

		if (column && column.modules.vdomHoz.rightPos >= this.vDomScrollPosLeft) {

			var rows = this.table.rowManager.getVisibleRows();

			rows.forEach(function (row) {

				if (row.type !== "group") {

					var cell = row.getCell(column);

					row.getElement().prepend(cell.getElement());

					cell.cellRendered();
				}
			});

			if (!this.leftCol) {

				this.vDomPadLeft = 0;
			} else {

				this.vDomPadLeft -= column.getWidth();
			}

			this.element.style.paddingLeft = this.vDomPadLeft + "px";

			this.leftCol--;

			this.addColLeft();
		}
	};

	VDomHoz.prototype.removeColRight = function (column) {

		var column = this.columns[this.rightCol],
		    rows;

		if (column && column.modules.vdomHoz.leftPos > this.vDomScrollPosRight) {

			rows = this.table.rowManager.getVisibleRows();

			column.modules.vdomHoz.visible = false;

			rows.forEach(function (row) {

				if (row.type !== "group") {

					var cell = row.getCell(column);

					row.getElement().removeChild(cell.getElement());
				}
			});

			this.vDomPadRight += column.getWidth();

			this.element.style.paddingRight = this.vDomPadRight + "px";

			this.rightCol--;

			this.removeColRight();
		}
	};

	VDomHoz.prototype.removeColLeft = function () {

		var column = this.columns[this.leftCol],
		    rows;

		if (column && column.modules.vdomHoz.rightPos < this.vDomScrollPosLeft) {

			rows = this.table.rowManager.getVisibleRows();

			rows.forEach(function (row) {

				if (row.type !== "group") {

					var cell = row.getCell(column);

					row.getElement().removeChild(cell.getElement());
				}
			});

			this.vDomPadLeft += column.getWidth();

			this.element.style.paddingLeft = this.vDomPadLeft + "px";

			this.leftCol++;

			this.removeColLeft();
		}
	};

	VDomHoz.prototype.initializeRow = function (row) {

		if (row.type !== "group") {

			row.modules.vdomHoz = {

				leftCol: this.leftCol,

				rightCol: this.rightCol

			};

			for (var _i7 = this.leftCol; _i7 <= this.rightCol; _i7++) {

				var column = this.columns[_i7];

				if (column && column.visible) {

					var cell = row.getCell(column);

					row.getElement().appendChild(cell.getElement());

					cell.cellRendered();
				}
			}
		}
	};

	VDomHoz.prototype.reinitializeRow = function (row, force) {

		if (row.type !== "group") {

			if (force || !row.modules.vdomHoz || row.modules.vdomHoz.leftCol !== this.leftCol || row.modules.vdomHoz.rightCol !== this.rightCol) {

				var rowEl = row.getElement();

				while (rowEl.firstChild) {
					rowEl.removeChild(rowEl.firstChild);
				}this.initializeRow(row);
			}
		}
	};

	//public row object

	var RowComponent = function RowComponent(row) {

		this._row = row;
	};

	RowComponent.prototype.getData = function (transform) {

		return this._row.getData(transform);
	};

	RowComponent.prototype.getElement = function () {

		return this._row.getElement();
	};

	RowComponent.prototype.getCells = function () {

		var cells = [];

		this._row.getCells().forEach(function (cell) {

			cells.push(cell.getComponent());
		});

		return cells;
	};

	RowComponent.prototype.getCell = function (column) {

		var cell = this._row.getCell(column);

		return cell ? cell.getComponent() : false;
	};

	RowComponent.prototype.getIndex = function () {

		return this._row.getData("data")[this._row.table.options.index];
	};

	RowComponent.prototype.getPosition = function (active) {

		return this._row.table.rowManager.getRowPosition(this._row, active);
	};

	RowComponent.prototype.delete = function () {

		return this._row.delete();
	};

	RowComponent.prototype.scrollTo = function () {

		return this._row.table.rowManager.scrollToRow(this._row);
	};

	RowComponent.prototype.pageTo = function () {

		if (this._row.table.modExists("page", true)) {

			return this._row.table.modules.page.setPageToRow(this._row);
		}
	};

	RowComponent.prototype.move = function (to, after) {

		this._row.moveToRow(to, after);
	};

	RowComponent.prototype.update = function (data) {

		return this._row.updateData(data);
	};

	RowComponent.prototype.normalizeHeight = function () {

		this._row.normalizeHeight(true);
	};

	RowComponent.prototype.select = function () {

		this._row.table.modules.selectRow.selectRows(this._row);
	};

	RowComponent.prototype.deselect = function () {

		this._row.table.modules.selectRow.deselectRows(this._row);
	};

	RowComponent.prototype.toggleSelect = function () {

		this._row.table.modules.selectRow.toggleRow(this._row);
	};

	RowComponent.prototype.isSelected = function () {

		return this._row.table.modules.selectRow.isRowSelected(this._row);
	};

	RowComponent.prototype._getSelf = function () {

		return this._row;
	};

	RowComponent.prototype.validate = function () {

		return this._row.validate();
	};

	RowComponent.prototype.freeze = function () {

		if (this._row.table.modExists("frozenRows", true)) {

			this._row.table.modules.frozenRows.freezeRow(this._row);
		}
	};

	RowComponent.prototype.unfreeze = function () {

		if (this._row.table.modExists("frozenRows", true)) {

			this._row.table.modules.frozenRows.unfreezeRow(this._row);
		}
	};

	RowComponent.prototype.isFrozen = function () {

		if (this._row.table.modExists("frozenRows", true)) {

			var index = this._row.table.modules.frozenRows.rows.indexOf(this._row);

			return index > -1;
		}

		return false;
	};

	RowComponent.prototype.treeCollapse = function () {

		if (this._row.table.modExists("dataTree", true)) {

			this._row.table.modules.dataTree.collapseRow(this._row);
		}
	};

	RowComponent.prototype.treeExpand = function () {

		if (this._row.table.modExists("dataTree", true)) {

			this._row.table.modules.dataTree.expandRow(this._row);
		}
	};

	RowComponent.prototype.treeToggle = function () {

		if (this._row.table.modExists("dataTree", true)) {

			this._row.table.modules.dataTree.toggleRow(this._row);
		}
	};

	RowComponent.prototype.getTreeParent = function () {

		if (this._row.table.modExists("dataTree", true)) {

			return this._row.table.modules.dataTree.getTreeParent(this._row);
		}

		return false;
	};

	RowComponent.prototype.getTreeChildren = function () {

		if (this._row.table.modExists("dataTree", true)) {

			return this._row.table.modules.dataTree.getTreeChildren(this._row, true);
		}

		return false;
	};

	RowComponent.prototype.addTreeChild = function (data, pos, index) {

		if (this._row.table.modExists("dataTree", true)) {

			return this._row.table.modules.dataTree.addTreeChildRow(this._row, data, pos, index);
		}

		return false;
	};

	RowComponent.prototype.reformat = function () {

		return this._row.reinitialize();
	};

	RowComponent.prototype.getGroup = function () {

		return this._row.getGroup().getComponent();
	};

	RowComponent.prototype.getTable = function () {

		return this._row.table;
	};

	RowComponent.prototype.getNextRow = function () {

		var row = this._row.nextRow();

		return row ? row.getComponent() : row;
	};

	RowComponent.prototype.getPrevRow = function () {

		var row = this._row.prevRow();

		return row ? row.getComponent() : row;
	};

	var Row = function Row(data, parent) {
		var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "row";


		this.table = parent.table;

		this.parent = parent;

		this.data = {};

		this.type = type; //type of element

		this.element = false;

		this.modules = {}; //hold module variables;

		this.cells = [];

		this.height = 0; //hold element height

		this.heightStyled = ""; //hold element height prestyled to improve render efficiency

		this.manualHeight = false; //user has manually set row height

		this.outerHeight = 0; //holde lements outer height

		this.initialized = false; //element has been rendered

		this.heightInitialized = false; //element has resized cells to fit


		this.component = null;

		this.created = false;

		this.setData(data);
	};

	Row.prototype.create = function () {

		if (!this.created) {

			this.created = true;

			this.generateElement();
		}
	};

	Row.prototype.createElement = function () {

		var el = document.createElement("div");

		el.classList.add("tabulator-row");

		el.setAttribute("role", "row");

		this.element = el;
	};

	Row.prototype.getElement = function () {

		this.create();

		return this.element;
	};

	Row.prototype.detachElement = function () {

		if (this.element && this.element.parentNode) {

			this.element.parentNode.removeChild(this.element);
		}
	};

	Row.prototype.generateElement = function () {

		var self = this,
		    dblTap,
		    tapHold,
		    tap;

		this.createElement();

		//set row selection characteristics

		if (self.table.options.selectable !== false && self.table.modExists("selectRow")) {

			self.table.modules.selectRow.initializeRow(this);
		}

		//setup movable rows

		if (self.table.options.movableRows !== false && self.table.modExists("moveRow")) {

			self.table.modules.moveRow.initializeRow(this);
		}

		//setup data tree

		if (self.table.options.dataTree !== false && self.table.modExists("dataTree")) {

			self.table.modules.dataTree.initializeRow(this);
		}

		//setup column colapse container

		if (self.table.options.responsiveLayout === "collapse" && self.table.modExists("responsiveLayout")) {

			self.table.modules.responsiveLayout.initializeRow(this);
		}

		//set column menu

		if ((self.table.options.rowContextMenu || self.table.options.rowClickMenu) && this.table.modExists("menu")) {

			self.table.modules.menu.initializeRow(this);
		}

		//handle row click events

		if (self.table.options.rowClick) {

			self.element.addEventListener("click", function (e) {

				self.table.options.rowClick(e, self.getComponent());
			});
		}

		if (self.table.options.rowDblClick) {

			self.element.addEventListener("dblclick", function (e) {

				self.table.options.rowDblClick(e, self.getComponent());
			});
		}

		if (self.table.options.rowContext) {

			self.element.addEventListener("contextmenu", function (e) {

				self.table.options.rowContext(e, self.getComponent());
			});
		}

		//handle mouse events

		if (self.table.options.rowMouseEnter) {

			self.element.addEventListener("mouseenter", function (e) {

				self.table.options.rowMouseEnter(e, self.getComponent());
			});
		}

		if (self.table.options.rowMouseLeave) {

			self.element.addEventListener("mouseleave", function (e) {

				self.table.options.rowMouseLeave(e, self.getComponent());
			});
		}

		if (self.table.options.rowMouseOver) {

			self.element.addEventListener("mouseover", function (e) {

				self.table.options.rowMouseOver(e, self.getComponent());
			});
		}

		if (self.table.options.rowMouseOut) {

			self.element.addEventListener("mouseout", function (e) {

				self.table.options.rowMouseOut(e, self.getComponent());
			});
		}

		if (self.table.options.rowMouseMove) {

			self.element.addEventListener("mousemove", function (e) {

				self.table.options.rowMouseMove(e, self.getComponent());
			});
		}

		if (self.table.options.rowTap) {

			tap = false;

			self.element.addEventListener("touchstart", function (e) {

				tap = true;
			}, { passive: true });

			self.element.addEventListener("touchend", function (e) {

				if (tap) {

					self.table.options.rowTap(e, self.getComponent());
				}

				tap = false;
			});
		}

		if (self.table.options.rowDblTap) {

			dblTap = null;

			self.element.addEventListener("touchend", function (e) {

				if (dblTap) {

					clearTimeout(dblTap);

					dblTap = null;

					self.table.options.rowDblTap(e, self.getComponent());
				} else {

					dblTap = setTimeout(function () {

						clearTimeout(dblTap);

						dblTap = null;
					}, 300);
				}
			});
		}

		if (self.table.options.rowTapHold) {

			tapHold = null;

			self.element.addEventListener("touchstart", function (e) {

				clearTimeout(tapHold);

				tapHold = setTimeout(function () {

					clearTimeout(tapHold);

					tapHold = null;

					tap = false;

					self.table.options.rowTapHold(e, self.getComponent());
				}, 1000);
			}, { passive: true });

			self.element.addEventListener("touchend", function (e) {

				clearTimeout(tapHold);

				tapHold = null;
			});
		}
	};

	Row.prototype.generateCells = function () {

		this.cells = this.table.columnManager.generateCells(this);
	};

	//functions to setup on first render

	Row.prototype.initialize = function (force) {
		var _this21 = this;

		this.create();

		if (!this.initialized || force) {

			this.deleteCells();

			while (this.element.firstChild) {
				this.element.removeChild(this.element.firstChild);
			} //handle frozen cells

			if (this.table.modExists("frozenColumns")) {

				this.table.modules.frozenColumns.layoutRow(this);
			}

			this.generateCells();

			if (this.table.options.virtualDomHoz && this.table.vdomHoz.initialized) {

				this.table.vdomHoz.initializeRow(this);
			} else {

				this.cells.forEach(function (cell) {

					_this21.element.appendChild(cell.getElement());

					cell.cellRendered();
				});
			}

			if (force) {

				this.normalizeHeight();
			}

			//setup movable rows

			if (this.table.options.dataTree && this.table.modExists("dataTree")) {

				this.table.modules.dataTree.layoutRow(this);
			}

			//setup column colapse container

			if (this.table.options.responsiveLayout === "collapse" && this.table.modExists("responsiveLayout")) {

				this.table.modules.responsiveLayout.layoutRow(this);
			}

			if (this.table.options.rowFormatter) {

				this.table.options.rowFormatter(this.getComponent());
			}

			//set resizable handles

			if (this.table.options.resizableRows && this.table.modExists("resizeRows")) {

				this.table.modules.resizeRows.initializeRow(this);
			}

			this.initialized = true;
		} else {

			if (this.table.options.virtualDomHoz) {

				this.table.vdomHoz.reinitializeRow(this);
			}
		}
	};

	Row.prototype.reinitializeHeight = function () {

		this.heightInitialized = false;

		if (this.element && this.element.offsetParent !== null) {

			this.normalizeHeight(true);
		}
	};

	Row.prototype.reinitialize = function (children) {

		this.initialized = false;

		this.heightInitialized = false;

		if (!this.manualHeight) {

			this.height = 0;

			this.heightStyled = "";
		}

		if (this.element && this.element.offsetParent !== null) {

			this.initialize(true);
		}

		if (this.table.options.dataTree && this.table.modExists("dataTree", true)) {

			this.table.modules.dataTree.getTreeChildren(this, false, true).forEach(function (child) {

				child.reinitialize(true);
			});
		}
	};

	//get heights when doing bulk row style calcs in virtual DOM

	Row.prototype.calcHeight = function (force) {

		var maxHeight = 0,
		    minHeight = this.table.options.resizableRows ? this.element.clientHeight : 0;

		this.cells.forEach(function (cell) {

			var height = cell.getHeight();

			if (height > maxHeight) {

				maxHeight = height;
			}
		});

		if (force) {

			this.height = Math.max(maxHeight, minHeight);
		} else {

			this.height = this.manualHeight ? this.height : Math.max(maxHeight, minHeight);
		}

		this.heightStyled = this.height ? this.height + "px" : "";

		this.outerHeight = this.element.offsetHeight;
	};

	//set of cells

	Row.prototype.setCellHeight = function () {

		this.cells.forEach(function (cell) {

			cell.setHeight();
		});

		this.heightInitialized = true;
	};

	Row.prototype.clearCellHeight = function () {

		this.cells.forEach(function (cell) {

			cell.clearHeight();
		});
	};

	//normalize the height of elements in the row

	Row.prototype.normalizeHeight = function (force) {

		if (force) {

			this.clearCellHeight();
		}

		this.calcHeight(force);

		this.setCellHeight();
	};

	// Row.prototype.setHeight = function(height){

	// 	this.height = height;


	// 	this.setCellHeight();

	// };


	//set height of rows

	Row.prototype.setHeight = function (height, force) {

		if (this.height != height || force) {

			this.manualHeight = true;

			this.height = height;

			this.heightStyled = height ? height + "px" : "";

			this.setCellHeight();

			// this.outerHeight = this.element.outerHeight();

			this.outerHeight = this.element.offsetHeight;
		}
	};

	//return rows outer height

	Row.prototype.getHeight = function () {

		return this.outerHeight;
	};

	//return rows outer Width

	Row.prototype.getWidth = function () {

		return this.element.offsetWidth;
	};

	//////////////// Cell Management /////////////////


	Row.prototype.deleteCell = function (cell) {

		var index = this.cells.indexOf(cell);

		if (index > -1) {

			this.cells.splice(index, 1);
		}
	};

	//////////////// Data Management /////////////////


	Row.prototype.setData = function (data) {

		if (this.table.modExists("mutator")) {

			data = this.table.modules.mutator.transformRow(data, "data");
		}

		this.data = data;

		if (this.table.options.reactiveData && this.table.modExists("reactiveData", true)) {

			this.table.modules.reactiveData.watchRow(this);
		}
	};

	//update the rows data

	Row.prototype.updateData = function (updatedData) {
		var _this22 = this;

		var visible = this.element && Tabulator.prototype.helpers.elVisible(this.element),
		    tempData = {},
		    newRowData;

		return new Promise(function (resolve, reject) {

			if (typeof updatedData === "string") {

				updatedData = JSON.parse(updatedData);
			}

			if (_this22.table.options.reactiveData && _this22.table.modExists("reactiveData", true)) {

				_this22.table.modules.reactiveData.block();
			}

			//mutate incomming data if needed

			if (_this22.table.modExists("mutator")) {

				tempData = Object.assign(tempData, _this22.data);

				tempData = Object.assign(tempData, updatedData);

				newRowData = _this22.table.modules.mutator.transformRow(tempData, "data", updatedData);
			} else {

				newRowData = updatedData;
			}

			//set data

			for (var attrname in newRowData) {

				_this22.data[attrname] = newRowData[attrname];
			}

			if (_this22.table.options.reactiveData && _this22.table.modExists("reactiveData", true)) {

				_this22.table.modules.reactiveData.unblock();
			}

			//update affected cells only

			for (var attrname in updatedData) {

				var columns = _this22.table.columnManager.getColumnsByFieldRoot(attrname);

				columns.forEach(function (column) {

					var cell = _this22.getCell(column.getField());

					if (cell) {

						var value = column.getFieldValue(newRowData);

						if (cell.getValue() != value) {

							cell.setValueProcessData(value);

							if (visible) {

								cell.cellRendered();
							}
						}
					}
				});
			}

			if (_this22.table.options.groupUpdateOnCellEdit && _this22.table.options.groupBy && _this22.table.modExists("groupRows")) {

				_this22.table.modules.groupRows.reassignRowToGroup(_this22.row);
			}

			//Partial reinitialization if visible

			if (visible) {

				_this22.normalizeHeight(true);

				if (_this22.table.options.rowFormatter) {

					_this22.table.options.rowFormatter(_this22.getComponent());
				}
			} else {

				_this22.initialized = false;

				_this22.height = 0;

				_this22.heightStyled = "";
			}

			if (_this22.table.options.dataTree !== false && _this22.table.modExists("dataTree") && _this22.table.modules.dataTree.redrawNeeded(updatedData)) {

				_this22.table.modules.dataTree.initializeRow(_this22);

				if (visible) {

					_this22.table.modules.dataTree.layoutRow(_this22);

					_this22.table.rowManager.refreshActiveData("tree", false, true);
				}
			}

			//this.reinitialize();


			_this22.table.options.rowUpdated.call(_this22.table, _this22.getComponent());

			if (_this22.table.options.dataChanged) {

				_this22.table.options.dataChanged.call(_this22.table, _this22.table.rowManager.getData());
			}

			resolve();
		});
	};

	Row.prototype.getData = function (transform) {

		if (transform) {

			if (this.table.modExists("accessor")) {

				return this.table.modules.accessor.transformRow(this, transform);
			}
		}

		return this.data;
	};

	Row.prototype.getCell = function (column) {

		var match = false;

		column = this.table.columnManager.findColumn(column);

		match = this.cells.find(function (cell) {

			return cell.column === column;
		});

		return match;
	};

	Row.prototype.getCellIndex = function (findCell) {

		return this.cells.findIndex(function (cell) {

			return cell === findCell;
		});
	};

	Row.prototype.findNextEditableCell = function (index) {

		var nextCell = false;

		if (index < this.cells.length - 1) {

			for (var i = index + 1; i < this.cells.length; i++) {

				var cell = this.cells[i];

				if (cell.column.modules.edit && Tabulator.prototype.helpers.elVisible(cell.getElement())) {

					var allowEdit = true;

					if (typeof cell.column.modules.edit.check == "function") {

						allowEdit = cell.column.modules.edit.check(cell.getComponent());
					}

					if (allowEdit) {

						nextCell = cell;

						break;
					}
				}
			}
		}

		return nextCell;
	};

	Row.prototype.findPrevEditableCell = function (index) {

		var prevCell = false;

		if (index > 0) {

			for (var i = index - 1; i >= 0; i--) {

				var cell = this.cells[i],
				    allowEdit = true;

				if (cell.column.modules.edit && Tabulator.prototype.helpers.elVisible(cell.getElement())) {

					if (typeof cell.column.modules.edit.check == "function") {

						allowEdit = cell.column.modules.edit.check(cell.getComponent());
					}

					if (allowEdit) {

						prevCell = cell;

						break;
					}
				}
			}
		}

		return prevCell;
	};

	Row.prototype.getCells = function () {

		return this.cells;
	};

	Row.prototype.nextRow = function () {

		var row = this.table.rowManager.nextDisplayRow(this, true);

		return row || false;
	};

	Row.prototype.prevRow = function () {

		var row = this.table.rowManager.prevDisplayRow(this, true);

		return row || false;
	};

	Row.prototype.moveToRow = function (to, before) {

		var toRow = this.table.rowManager.findRow(to);

		if (toRow) {

			this.table.rowManager.moveRowActual(this, toRow, !before);

			this.table.rowManager.refreshActiveData("display", false, true);
		} else {

			console.warn("Move Error - No matching row found:", to);
		}
	};

	Row.prototype.validate = function () {

		var invalid = [];

		this.cells.forEach(function (cell) {

			if (!cell.validate()) {

				invalid.push(cell.getComponent());
			}
		});

		return invalid.length ? invalid : true;
	};

	///////////////////// Actions  /////////////////////


	Row.prototype.delete = function () {
		var _this23 = this;

		return new Promise(function (resolve, reject) {

			var index, rows;

			if (_this23.table.options.history && _this23.table.modExists("history")) {

				if (_this23.table.options.groupBy && _this23.table.modExists("groupRows")) {

					rows = _this23.getGroup().rows;

					index = rows.indexOf(_this23);

					if (index) {

						index = rows[index - 1];
					}
				} else {

					index = _this23.table.rowManager.getRowIndex(_this23);

					if (index) {

						index = _this23.table.rowManager.rows[index - 1];
					}
				}

				_this23.table.modules.history.action("rowDelete", _this23, { data: _this23.getData(), pos: !index, index: index });
			}

			_this23.deleteActual();

			resolve();
		});
	};

	Row.prototype.deleteActual = function (blockRedraw) {

		var index = this.table.rowManager.getRowIndex(this);

		this.detatchModules();

		// if(this.table.options.dataTree && this.table.modExists("dataTree")){

		// 	this.table.modules.dataTree.collapseRow(this, true);

		// }


		//remove any reactive data watchers from row object

		if (this.table.options.reactiveData && this.table.modExists("reactiveData", true)) {}

		// this.table.modules.reactiveData.unwatchRow(this);

		//remove from group

		if (this.modules.group) {

			this.modules.group.removeRow(this);
		}

		this.table.rowManager.deleteRow(this, blockRedraw);

		this.deleteCells();

		this.initialized = false;

		this.heightInitialized = false;

		this.element = false;

		if (this.table.options.dataTree && this.table.modExists("dataTree", true)) {

			this.table.modules.dataTree.rowDelete(this);
		}

		//recalc column calculations if present

		if (this.table.modExists("columnCalcs")) {

			if (this.table.options.groupBy && this.table.modExists("groupRows")) {

				this.table.modules.columnCalcs.recalcRowGroup(this);
			} else {

				this.table.modules.columnCalcs.recalc(this.table.rowManager.activeRows);
			}
		}
	};

	Row.prototype.detatchModules = function () {

		//deselect row if it is selected

		if (this.table.modExists("selectRow")) {

			this.table.modules.selectRow._deselectRow(this, true);
		}

		//cancel edit if row is currently being edited

		if (this.table.modExists("edit")) {

			if (this.table.modules.edit.currentCell.row === this) {

				this.table.modules.edit.cancelEdit();
			}
		}

		if (this.table.modExists("frozenRows")) {

			this.table.modules.frozenRows.detachRow(this);
		}
	};

	Row.prototype.deleteCells = function () {

		var cellCount = this.cells.length;

		for (var _i8 = 0; _i8 < cellCount; _i8++) {

			this.cells[0].delete();
		}
	};

	Row.prototype.wipe = function () {

		this.detatchModules();

		this.deleteCells();

		if (this.element) {

			while (this.element.firstChild) {
				this.element.removeChild(this.element.firstChild);
			}if (this.element.parentNode) {

				this.element.parentNode.removeChild(this.element);
			}
		}

		this.element = false;

		this.modules = {};
	};

	Row.prototype.getGroup = function () {

		return this.modules.group || false;
	};

	//////////////// Object Generation /////////////////

	Row.prototype.getComponent = function () {

		if (!this.component) {

			this.component = new RowComponent(this);
		}

		return this.component;
	};

	//public row object

	var CellComponent = function CellComponent(cell) {

		this._cell = cell;
	};

	CellComponent.prototype.getValue = function () {

		return this._cell.getValue();
	};

	CellComponent.prototype.getOldValue = function () {

		return this._cell.getOldValue();
	};

	CellComponent.prototype.getInitialValue = function () {

		return this._cell.initialValue;
	};

	CellComponent.prototype.getElement = function () {

		return this._cell.getElement();
	};

	CellComponent.prototype.getRow = function () {

		return this._cell.row.getComponent();
	};

	CellComponent.prototype.getData = function () {

		return this._cell.row.getData();
	};

	CellComponent.prototype.getField = function () {

		return this._cell.column.getField();
	};

	CellComponent.prototype.getColumn = function () {

		return this._cell.column.getComponent();
	};

	CellComponent.prototype.setValue = function (value, mutate) {

		if (typeof mutate == "undefined") {

			mutate = true;
		}

		this._cell.setValue(value, mutate);
	};

	CellComponent.prototype.restoreOldValue = function () {

		this._cell.setValueActual(this._cell.getOldValue());
	};

	CellComponent.prototype.restoreInitialValue = function () {

		this._cell.setValueActual(this._cell.initialValue);
	};

	CellComponent.prototype.edit = function (force) {

		return this._cell.edit(force);
	};

	CellComponent.prototype.cancelEdit = function () {

		this._cell.cancelEdit();
	};

	CellComponent.prototype.isEdited = function () {

		return !!this._cell.modules.edit && this._cell.modules.edit.edited;
	};

	CellComponent.prototype.clearEdited = function () {

		if (self.table.modExists("edit", true)) {

			this._cell.table.modules.edit.clearEdited(this._cell);
		}
	};

	CellComponent.prototype.isValid = function () {

		return this._cell.modules.validate ? !this._cell.modules.validate.invalid : true;
	};

	CellComponent.prototype.validate = function () {

		return this._cell.validate();
	};

	CellComponent.prototype.clearValidation = function () {

		if (this._cell.table.modExists("validate", true)) {

			this._cell.table.modules.validate.clearValidation(this._cell);
		}
	};

	CellComponent.prototype.nav = function () {

		return this._cell.nav();
	};

	CellComponent.prototype.checkHeight = function () {

		this._cell.checkHeight();
	};

	CellComponent.prototype.getTable = function () {

		return this._cell.table;
	};

	CellComponent.prototype._getSelf = function () {

		return this._cell;
	};

	var Cell = function Cell(column, row) {

		this.table = column.table;

		this.column = column;

		this.row = row;

		this.element = null;

		this.value = null;

		this.initialValue;

		this.oldValue = null;

		this.modules = {};

		this.height = null;

		this.width = null;

		this.minWidth = null;

		this.component = null;

		this.loaded = false; //track if the cell has been added to the DOM yet


		this.build();
	};

	//////////////// Setup Functions /////////////////


	//generate element

	Cell.prototype.build = function () {

		this.generateElement();

		this.setWidth();

		this._configureCell();

		this.setValueActual(this.column.getFieldValue(this.row.data));

		this.initialValue = this.value;
	};

	Cell.prototype.generateElement = function () {

		this.element = document.createElement('div');

		this.element.className = "tabulator-cell";

		this.element.setAttribute("role", "gridcell");

		this.element = this.element;
	};

	Cell.prototype._configureCell = function () {

		var self = this,
		    cellEvents = self.column.cellEvents,
		    element = self.element,
		    field = this.column.getField(),
		    vertAligns = {

			top: "flex-start",

			bottom: "flex-end",

			middle: "center"

		},
		    hozAligns = {

			left: "flex-start",

			right: "flex-end",

			center: "center"

		};

		//set text alignment

		element.style.textAlign = self.column.hozAlign;

		if (self.column.vertAlign) {

			element.style.display = "inline-flex";

			element.style.alignItems = vertAligns[self.column.vertAlign] || "";

			if (self.column.hozAlign) {

				element.style.justifyContent = hozAligns[self.column.hozAlign] || "";
			}
		}

		if (field) {

			element.setAttribute("tabulator-field", field);
		}

		//add class to cell if needed

		if (self.column.definition.cssClass) {

			var classNames = self.column.definition.cssClass.split(" ");

			classNames.forEach(function (className) {

				element.classList.add(className);
			});
		}

		//update tooltip on mouse enter

		if (this.table.options.tooltipGenerationMode === "hover") {

			element.addEventListener("mouseenter", function (e) {

				self._generateTooltip();
			});
		}

		self._bindClickEvents(cellEvents);

		self._bindTouchEvents(cellEvents);

		self._bindMouseEvents(cellEvents);

		if (self.column.modules.edit) {

			self.table.modules.edit.bindEditor(self);
		}

		if (self.column.definition.rowHandle && self.table.options.movableRows !== false && self.table.modExists("moveRow")) {

			self.table.modules.moveRow.initializeCell(self);
		}

		//hide cell if not visible

		if (!self.column.visible) {

			self.hide();
		}
	};

	Cell.prototype._bindClickEvents = function (cellEvents) {

		var self = this,
		    element = self.element;

		//set event bindings

		if (cellEvents.cellClick || self.table.options.cellClick) {

			element.addEventListener("click", function (e) {

				var component = self.getComponent();

				if (cellEvents.cellClick) {

					cellEvents.cellClick.call(self.table, e, component);
				}

				if (self.table.options.cellClick) {

					self.table.options.cellClick.call(self.table, e, component);
				}
			});
		}

		if (cellEvents.cellDblClick || this.table.options.cellDblClick) {

			element.addEventListener("dblclick", function (e) {

				var component = self.getComponent();

				if (cellEvents.cellDblClick) {

					cellEvents.cellDblClick.call(self.table, e, component);
				}

				if (self.table.options.cellDblClick) {

					self.table.options.cellDblClick.call(self.table, e, component);
				}
			});
		} else {

			element.addEventListener("dblclick", function (e) {

				if (self.table.modExists("edit")) {

					if (self.table.modules.edit.currentCell === self) {

						return; //prevent instant selection of editor content
					}
				}

				e.preventDefault();

				try {

					if (document.selection) {
						// IE

						var range = document.body.createTextRange();

						range.moveToElementText(self.element);

						range.select();
					} else if (window.getSelection) {

						var range = document.createRange();

						range.selectNode(self.element);

						window.getSelection().removeAllRanges();

						window.getSelection().addRange(range);
					}
				} catch (e) {}
			});
		}

		if (cellEvents.cellContext || this.table.options.cellContext) {

			element.addEventListener("contextmenu", function (e) {

				var component = self.getComponent();

				if (cellEvents.cellContext) {

					cellEvents.cellContext.call(self.table, e, component);
				}

				if (self.table.options.cellContext) {

					self.table.options.cellContext.call(self.table, e, component);
				}
			});
		}
	};

	Cell.prototype._bindMouseEvents = function (cellEvents) {

		var self = this,
		    element = self.element;

		if (cellEvents.cellMouseEnter || self.table.options.cellMouseEnter) {

			element.addEventListener("mouseenter", function (e) {

				var component = self.getComponent();

				if (cellEvents.cellMouseEnter) {

					cellEvents.cellMouseEnter.call(self.table, e, component);
				}

				if (self.table.options.cellMouseEnter) {

					self.table.options.cellMouseEnter.call(self.table, e, component);
				}
			});
		}

		if (cellEvents.cellMouseLeave || self.table.options.cellMouseLeave) {

			element.addEventListener("mouseleave", function (e) {

				var component = self.getComponent();

				if (cellEvents.cellMouseLeave) {

					cellEvents.cellMouseLeave.call(self.table, e, component);
				}

				if (self.table.options.cellMouseLeave) {

					self.table.options.cellMouseLeave.call(self.table, e, component);
				}
			});
		}

		if (cellEvents.cellMouseOver || self.table.options.cellMouseOver) {

			element.addEventListener("mouseover", function (e) {

				var component = self.getComponent();

				if (cellEvents.cellMouseOver) {

					cellEvents.cellMouseOver.call(self.table, e, component);
				}

				if (self.table.options.cellMouseOver) {

					self.table.options.cellMouseOver.call(self.table, e, component);
				}
			});
		}

		if (cellEvents.cellMouseOut || self.table.options.cellMouseOut) {

			element.addEventListener("mouseout", function (e) {

				var component = self.getComponent();

				if (cellEvents.cellMouseOut) {

					cellEvents.cellMouseOut.call(self.table, e, component);
				}

				if (self.table.options.cellMouseOut) {

					self.table.options.cellMouseOut.call(self.table, e, component);
				}
			});
		}

		if (cellEvents.cellMouseMove || self.table.options.cellMouseMove) {

			element.addEventListener("mousemove", function (e) {

				var component = self.getComponent();

				if (cellEvents.cellMouseMove) {

					cellEvents.cellMouseMove.call(self.table, e, component);
				}

				if (self.table.options.cellMouseMove) {

					self.table.options.cellMouseMove.call(self.table, e, component);
				}
			});
		}
	};

	Cell.prototype._bindTouchEvents = function (cellEvents) {

		var self = this,
		    element = self.element,
		    dblTap,
		    tapHold,
		    tap;

		if (cellEvents.cellTap || this.table.options.cellTap) {

			tap = false;

			element.addEventListener("touchstart", function (e) {

				tap = true;
			}, { passive: true });

			element.addEventListener("touchend", function (e) {

				if (tap) {

					var component = self.getComponent();

					if (cellEvents.cellTap) {

						cellEvents.cellTap.call(self.table, e, component);
					}

					if (self.table.options.cellTap) {

						self.table.options.cellTap.call(self.table, e, component);
					}
				}

				tap = false;
			});
		}

		if (cellEvents.cellDblTap || this.table.options.cellDblTap) {

			dblTap = null;

			element.addEventListener("touchend", function (e) {

				if (dblTap) {

					clearTimeout(dblTap);

					dblTap = null;

					var component = self.getComponent();

					if (cellEvents.cellDblTap) {

						cellEvents.cellDblTap.call(self.table, e, component);
					}

					if (self.table.options.cellDblTap) {

						self.table.options.cellDblTap.call(self.table, e, component);
					}
				} else {

					dblTap = setTimeout(function () {

						clearTimeout(dblTap);

						dblTap = null;
					}, 300);
				}
			});
		}

		if (cellEvents.cellTapHold || this.table.options.cellTapHold) {

			tapHold = null;

			element.addEventListener("touchstart", function (e) {

				clearTimeout(tapHold);

				tapHold = setTimeout(function () {

					clearTimeout(tapHold);

					tapHold = null;

					tap = false;

					var component = self.getComponent();

					if (cellEvents.cellTapHold) {

						cellEvents.cellTapHold.call(self.table, e, component);
					}

					if (self.table.options.cellTapHold) {

						self.table.options.cellTapHold.call(self.table, e, component);
					}
				}, 1000);
			}, { passive: true });

			element.addEventListener("touchend", function (e) {

				clearTimeout(tapHold);

				tapHold = null;
			});
		}
	};

	//generate cell contents

	Cell.prototype._generateContents = function () {

		var val;

		if (this.table.modExists("format")) {

			val = this.table.modules.format.formatValue(this);
		} else {

			val = this.element.innerHTML = this.value;
		}

		switch (typeof val === 'undefined' ? 'undefined' : _typeof(val)) {

			case "object":

				if (val instanceof Node) {

					//clear previous cell contents

					while (this.element.firstChild) {
						this.element.removeChild(this.element.firstChild);
					}this.element.appendChild(val);
				} else {

					this.element.innerHTML = "";

					if (val != null) {

						console.warn("Format Error - Formatter has returned a type of object, the only valid formatter object return is an instance of Node, the formatter returned:", val);
					}
				}

				break;

			case "undefined":

			case "null":

				this.element.innerHTML = "";

				break;

			default:

				this.element.innerHTML = val;

		}
	};

	Cell.prototype.cellRendered = function () {

		if (this.table.modExists("format") && this.table.modules.format.cellRendered) {

			this.table.modules.format.cellRendered(this);
		}
	};

	//generate tooltip text

	Cell.prototype._generateTooltip = function () {

		var tooltip = this.column.tooltip;

		if (tooltip) {

			if (tooltip === true) {

				tooltip = this.value;
			} else if (typeof tooltip == "function") {

				tooltip = tooltip(this.getComponent());

				if (tooltip === false) {

					tooltip = "";
				}
			}

			if (typeof tooltip === "undefined") {

				tooltip = "";
			}

			this.element.setAttribute("title", tooltip);
		} else {

			this.element.setAttribute("title", "");
		}
	};

	//////////////////// Getters ////////////////////

	Cell.prototype.getElement = function (containerOnly) {

		if (!this.loaded) {

			this.loaded = true;

			if (!containerOnly) {

				this.layoutElement();
			}
		}

		return this.element;
	};

	Cell.prototype.getValue = function () {

		return this.value;
	};

	Cell.prototype.getOldValue = function () {

		return this.oldValue;
	};

	//////////////////// Actions ////////////////////


	Cell.prototype.setValue = function (value, mutate) {

		var changed = this.setValueProcessData(value, mutate),
		    component;

		if (changed) {

			if (this.table.options.history && this.table.modExists("history")) {

				this.table.modules.history.action("cellEdit", this, { oldValue: this.oldValue, newValue: this.value });
			}

			component = this.getComponent();

			if (this.column.cellEvents.cellEdited) {

				this.column.cellEvents.cellEdited.call(this.table, component);
			}

			if (this.table.options.groupUpdateOnCellEdit && this.table.options.groupBy && this.table.modExists("groupRows")) {

				this.table.modules.groupRows.reassignRowToGroup(this.row);
			}

			this.cellRendered();

			this.table.options.cellEdited.call(this.table, component);

			if (this.table.options.dataChanged) {

				this.table.options.dataChanged.call(this.table, this.table.rowManager.getData());
			}
		}
	};

	Cell.prototype.setValueProcessData = function (value, mutate) {

		var changed = false;

		if (this.value != value) {

			changed = true;

			if (mutate) {

				if (this.column.modules.mutate) {

					value = this.table.modules.mutator.transformCell(this, value);
				}
			}
		}

		this.setValueActual(value);

		if (changed && this.table.modExists("columnCalcs")) {

			if (this.column.definition.topCalc || this.column.definition.bottomCalc) {

				if (this.table.options.groupBy && this.table.modExists("groupRows")) {

					if (this.table.options.columnCalcs == "table" || this.table.options.columnCalcs == "both") {

						this.table.modules.columnCalcs.recalc(this.table.rowManager.activeRows);
					}

					if (this.table.options.columnCalcs != "table") {

						this.table.modules.columnCalcs.recalcRowGroup(this.row);
					}
				} else {

					this.table.modules.columnCalcs.recalc(this.table.rowManager.activeRows);
				}
			}
		}

		return changed;
	};

	Cell.prototype.setValueActual = function (value) {

		this.oldValue = this.value;

		this.value = value;

		if (this.table.options.reactiveData && this.table.modExists("reactiveData")) {

			this.table.modules.reactiveData.block();
		}

		this.column.setFieldValue(this.row.data, value);

		if (this.table.options.reactiveData && this.table.modExists("reactiveData")) {

			this.table.modules.reactiveData.unblock();
		}

		if (this.loaded) {

			this.layoutElement();
		}
	};

	Cell.prototype.layoutElement = function () {

		this._generateContents();

		this._generateTooltip();

		//set resizable handles

		if (this.table.options.resizableColumns && this.table.modExists("resizeColumns") && this.row.type === "row") {

			this.table.modules.resizeColumns.initializeColumn("cell", this.column, this.element);
		}

		if ((this.column.definition.contextMenu || this.column.definition.clickMenu) && this.table.modExists("menu")) {

			this.table.modules.menu.initializeCell(this);
		}

		//handle frozen cells

		if (this.table.modExists("frozenColumns")) {

			this.table.modules.frozenColumns.layoutElement(this.element, this.column);
		}
	};

	Cell.prototype.setWidth = function () {

		this.width = this.column.width;

		this.element.style.width = this.column.widthStyled;
	};

	Cell.prototype.clearWidth = function () {

		this.width = "";

		this.element.style.width = "";
	};

	Cell.prototype.getWidth = function () {

		return this.width || this.element.offsetWidth;
	};

	Cell.prototype.setMinWidth = function () {

		this.minWidth = this.column.minWidth;

		this.element.style.minWidth = this.column.minWidthStyled;
	};

	Cell.prototype.setMaxWidth = function () {

		this.maxWidth = this.column.maxWidth;

		this.element.style.maxWidth = this.column.maxWidthStyled;
	};

	Cell.prototype.checkHeight = function () {

		// var height = this.element.css("height");

		this.row.reinitializeHeight();
	};

	Cell.prototype.clearHeight = function () {

		this.element.style.height = "";

		this.height = null;
	};

	Cell.prototype.setHeight = function () {

		this.height = this.row.height;

		this.element.style.height = this.row.heightStyled;
	};

	Cell.prototype.getHeight = function () {

		return this.height || this.element.offsetHeight;
	};

	Cell.prototype.show = function () {

		this.element.style.display = this.column.vertAlign ? "inline-flex" : "";
	};

	Cell.prototype.hide = function () {

		this.element.style.display = "none";
	};

	Cell.prototype.edit = function (force) {

		if (this.table.modExists("edit", true)) {

			return this.table.modules.edit.editCell(this, force);
		}
	};

	Cell.prototype.cancelEdit = function () {

		if (this.table.modExists("edit", true)) {

			var editing = this.table.modules.edit.getCurrentCell();

			if (editing && editing._getSelf() === this) {

				this.table.modules.edit.cancelEdit();
			} else {

				console.warn("Cancel Editor Error - This cell is not currently being edited ");
			}
		}
	};

	Cell.prototype.validate = function () {

		if (this.column.modules.validate && this.table.modExists("validate", true)) {

			var valid = this.table.modules.validate.validate(this.column.modules.validate, this, this.getValue());

			return valid === true;
		} else {

			return true;
		}
	};

	Cell.prototype.delete = function () {

		if (!this.table.rowManager.redrawBlock && this.element.parentNode) {

			this.element.parentNode.removeChild(this.element);
		}

		if (this.modules.validate && this.modules.validate.invalid) {

			this.table.modules.validate.clearValidation(this);
		}

		if (this.modules.edit && this.modules.edit.edited) {

			this.table.modules.edit.clearEdited(this);
		}

		if (this.table.options.history) {

			this.table.modules.history.clearComponentHistory(this);
		}

		this.element = false;

		this.column.deleteCell(this);

		this.row.deleteCell(this);

		this.calcs = {};
	};

	//////////////// Navigation /////////////////


	Cell.prototype.nav = function () {

		var self = this,
		    nextCell = false,
		    index = this.row.getCellIndex(this);

		return {

			next: function next() {

				var nextCell = this.right(),
				    nextRow;

				if (!nextCell) {

					nextRow = self.table.rowManager.nextDisplayRow(self.row, true);

					if (nextRow) {

						nextCell = nextRow.findNextEditableCell(-1);

						if (nextCell) {

							nextCell.edit();

							return true;
						}
					}
				} else {

					return true;
				}

				return false;
			},

			prev: function prev() {

				var nextCell = this.left(),
				    prevRow;

				if (!nextCell) {

					prevRow = self.table.rowManager.prevDisplayRow(self.row, true);

					if (prevRow) {

						nextCell = prevRow.findPrevEditableCell(prevRow.cells.length);

						if (nextCell) {

							nextCell.edit();

							return true;
						}
					}
				} else {

					return true;
				}

				return false;
			},

			left: function left() {

				nextCell = self.row.findPrevEditableCell(index);

				if (nextCell) {

					nextCell.edit();

					return true;
				} else {

					return false;
				}
			},

			right: function right() {

				nextCell = self.row.findNextEditableCell(index);

				if (nextCell) {

					nextCell.edit();

					return true;
				} else {

					return false;
				}
			},

			up: function up() {

				var nextRow = self.table.rowManager.prevDisplayRow(self.row, true);

				if (nextRow) {

					nextRow.cells[index].edit();
				}
			},

			down: function down() {

				var nextRow = self.table.rowManager.nextDisplayRow(self.row, true);

				if (nextRow) {

					nextRow.cells[index].edit();
				}
			}

		};
	};

	Cell.prototype.getIndex = function () {

		this.row.getCellIndex(this);
	};

	//////////////// Object Generation /////////////////

	Cell.prototype.getComponent = function () {

		if (!this.component) {

			this.component = new CellComponent(this);
		}

		return this.component;
	};

	var FooterManager = function FooterManager(table) {

		this.table = table;

		this.active = false;

		this.element = this.createElement(); //containing element

		this.external = false;

		this.links = [];

		this._initialize();
	};

	FooterManager.prototype.createElement = function () {

		var el = document.createElement("div");

		el.classList.add("tabulator-footer");

		return el;
	};

	FooterManager.prototype._initialize = function (element) {

		if (this.table.options.footerElement) {

			switch (_typeof(this.table.options.footerElement)) {

				case "string":

					if (this.table.options.footerElement[0] === "<") {

						this.element.innerHTML = this.table.options.footerElement;
					} else {

						this.external = true;

						this.element = document.querySelector(this.table.options.footerElement);
					}

					break;

				default:

					this.element = this.table.options.footerElement;

					break;

			}
		}
	};

	FooterManager.prototype.getElement = function () {

		return this.element;
	};

	FooterManager.prototype.append = function (element, parent) {

		this.activate(parent);

		this.element.appendChild(element);

		this.table.rowManager.adjustTableSize();
	};

	FooterManager.prototype.prepend = function (element, parent) {

		this.activate(parent);

		this.element.insertBefore(element, this.element.firstChild);

		this.table.rowManager.adjustTableSize();
	};

	FooterManager.prototype.remove = function (element) {

		element.parentNode.removeChild(element);

		this.deactivate();
	};

	FooterManager.prototype.deactivate = function (force) {

		if (!this.element.firstChild || force) {

			if (!this.external) {

				this.element.parentNode.removeChild(this.element);
			}

			this.active = false;
		}

		// this.table.rowManager.adjustTableSize();
	};

	FooterManager.prototype.activate = function (parent) {

		if (!this.active) {

			this.active = true;

			if (!this.external) {

				this.table.element.appendChild(this.getElement());

				this.table.element.style.display = '';
			}
		}

		if (parent) {

			this.links.push(parent);
		}
	};

	FooterManager.prototype.redraw = function () {

		this.links.forEach(function (link) {

			link.footerRedraw();
		});
	};

	var Tabulator = function Tabulator(element, options) {

		this.options = {};

		this.columnManager = null; // hold Column Manager

		this.rowManager = null; //hold Row Manager

		this.footerManager = null; //holder Footer Manager

		this.vdomHoz = null; //holder horizontal virtual dom


		this.browser = ""; //hold current browser type

		this.browserSlow = false; //handle reduced functionality for slower browsers

		this.browserMobile = false; //check if running on moble, prevent resize cancelling edit on keyboard appearence

		this.rtl = false; //check if the table is in RTL mode


		this.modules = {}; //hold all modules bound to this table


		if (this.initializeElement(element)) {

			this.initializeOptions(options || {});

			this._create();
		}

		Tabulator.prototype.comms.register(this); //register table for inderdevice communication
	};

	//default setup options

	Tabulator.prototype.defaultOptions = {

		height: false, //height of tabulator

		minHeight: false, //minimum height of tabulator

		maxHeight: false, //maximum height of tabulator


		layout: "fitData", ///layout type "fitColumns" | "fitData"

		layoutColumnsOnNewData: false, //update column widths on setData


		columnMinWidth: 40, //minimum global width for a column

		columnMaxWidth: false, //minimum global width for a column

		columnHeaderVertAlign: "top", //vertical alignment of column headers

		columnVertAlign: false, // DEPRECATED - Left to allow warning


		resizableColumns: true, //resizable columns

		resizableRows: false, //resizable rows

		autoResize: true, //auto resize table


		columns: [], //store for colum header info


		cellHozAlign: "", //horizontal align columns

		cellVertAlign: "", //vertical align columns

		headerHozAlign: "", //horizontal header alignment


		data: [], //default starting data


		autoColumns: false, //build columns from data row structure

		autoColumnsDefinitions: false,

		reactiveData: false, //enable data reactivity


		nestedFieldSeparator: ".", //seperatpr for nested data


		tooltips: false, //Tool tip value

		tooltipsHeader: false, //Tool tip for headers

		tooltipGenerationMode: "load", //when to generate tooltips


		initialSort: false, //initial sorting criteria

		initialFilter: false, //initial filtering criteria

		initialHeaderFilter: false, //initial header filtering criteria


		columnHeaderSortMulti: true, //multiple or single column sorting


		sortOrderReverse: false, //reverse internal sort ordering


		headerSort: true, //set default global header sort

		headerSortTristate: false, //set default tristate header sorting

		headerSortElement: "<div class='tabulator-arrow'></div>", //header sort element


		footerElement: false, //hold footer element


		index: "id", //filed for row index


		textDirection: "auto",

		keybindings: [], //array for keybindings


		tabEndNewRow: false, //create new row when tab to end of table


		invalidOptionWarnings: true, //allow toggling of invalid option warnings


		clipboard: false, //enable clipboard

		clipboardCopyStyled: true, //formatted table data

		clipboardCopyConfig: false, //clipboard config

		clipboardCopyFormatter: false, //DEPRICATED - REMOVE in 5.0

		clipboardCopyRowRange: "active", //restrict clipboard to visible rows only

		clipboardPasteParser: "table", //convert pasted clipboard data to rows

		clipboardPasteAction: "insert", //how to insert pasted data into the table


		clipboardCopied: function clipboardCopied() {}, //data has been copied to the clipboard

		clipboardPasted: function clipboardPasted() {}, //data has been pasted into the table

		clipboardPasteError: function clipboardPasteError() {}, //data has not successfully been pasted into the table


		downloadDataFormatter: false, //function to manipulate table data before it is downloaded

		downloadReady: function downloadReady(data, blob) {
			return blob;
		}, //function to manipulate download data

		downloadComplete: false, //function to manipulate download data

		downloadConfig: {}, //download config

		downloadRowRange: "active", //restrict download to active rows only


		dataTree: false, //enable data tree

		dataTreeFilter: true, //filter child rows

		dataTreeSort: true, //sort child rows

		dataTreeElementColumn: false,

		dataTreeBranchElement: true, //show data tree branch element

		dataTreeChildIndent: 9, //data tree child indent in px

		dataTreeChildField: "_children", //data tre column field to look for child rows

		dataTreeCollapseElement: false, //data tree row collapse element

		dataTreeExpandElement: false, //data tree row expand element

		dataTreeStartExpanded: false,

		dataTreeRowExpanded: function dataTreeRowExpanded() {}, //row has been expanded

		dataTreeRowCollapsed: function dataTreeRowCollapsed() {}, //row has been collapsed

		dataTreeChildColumnCalcs: false, //include visible data tree rows in column calculations

		dataTreeSelectPropagate: false, //seleccting a parent row selects its children


		printAsHtml: false, //enable print as html

		printFormatter: false, //printing page formatter

		printHeader: false, //page header contents

		printFooter: false, //page footer contents

		printCopyStyle: true, //DEPRICATED - REMOVE in 5.0

		printStyled: true, //enable print as html styling

		printVisibleRows: true, //DEPRICATED - REMOVE in 5.0

		printRowRange: "visible", //restrict print to visible rows only

		printConfig: {}, //print config options


		addRowPos: "bottom", //position to insert blank rows, top|bottom


		selectable: "highlight", //highlight rows on hover

		selectableRangeMode: "drag", //highlight rows on hover

		selectableRollingSelection: true, //roll selection once maximum number of selectable rows is reached

		selectablePersistence: true, // maintain selection when table view is updated

		selectableCheck: function selectableCheck(data, row) {
			return true;
		}, //check wheather row is selectable


		headerFilterLiveFilterDelay: 300, //delay before updating column after user types in header filter

		headerFilterPlaceholder: false, //placeholder text to display in header filters


		headerVisible: true, //hide header


		history: false, //enable edit history


		locale: false, //current system language

		langs: {},

		virtualDom: true, //enable DOM virtualization

		virtualDomBuffer: 0, // set virtual DOM buffer size

		virtualDomHoz: false, //enable horizontal DOM virtualization


		persistentLayout: false, //DEPRICATED - REMOVE in 5.0

		persistentSort: false, //DEPRICATED - REMOVE in 5.0

		persistentFilter: false, //DEPRICATED - REMOVE in 5.0

		persistenceID: "", //key for persistent storage

		persistenceMode: true, //mode for storing persistence information

		persistenceReaderFunc: false, //function for handling persistence data reading

		persistenceWriterFunc: false, //function for handling persistence data writing


		persistence: false,

		responsiveLayout: false, //responsive layout flags

		responsiveLayoutCollapseStartOpen: true, //start showing collapsed data

		responsiveLayoutCollapseUseFormatters: true, //responsive layout collapse formatter

		responsiveLayoutCollapseFormatter: false, //responsive layout collapse formatter


		pagination: false, //set pagination type

		paginationSize: false, //set number of rows to a page

		paginationInitialPage: 1, //initail page to show on load

		paginationButtonCount: 5, // set count of page button

		paginationSizeSelector: false, //add pagination size selector element

		paginationElement: false, //element to hold pagination numbers

		paginationDataSent: {}, //pagination data sent to the server

		paginationDataReceived: {}, //pagination data received from the server

		paginationAddRow: "page", //add rows on table or page


		ajaxURL: false, //url for ajax loading

		ajaxURLGenerator: false,

		ajaxParams: {}, //params for ajax loading

		ajaxConfig: "get", //ajax request type

		ajaxContentType: "form", //ajax request type

		ajaxRequestFunc: false, //promise function

		ajaxLoader: true, //show loader

		ajaxLoaderLoading: false, //loader element

		ajaxLoaderError: false, //loader element

		ajaxFiltering: false,

		ajaxSorting: false,

		ajaxProgressiveLoad: false, //progressive loading

		ajaxProgressiveLoadDelay: 0, //delay between requests

		ajaxProgressiveLoadScrollMargin: 0, //margin before scroll begins


		groupBy: false, //enable table grouping and set field to group by

		groupStartOpen: true, //starting state of group

		groupValues: false,

		groupUpdateOnCellEdit: false,

		groupHeader: false, //header generation function

		groupHeaderPrint: null,

		groupHeaderClipboard: null,

		groupHeaderHtmlOutput: null,

		groupHeaderDownload: null,

		htmlOutputConfig: false, //html outypu config


		movableColumns: false, //enable movable columns


		movableRows: false, //enable movable rows

		movableRowsConnectedTables: false, //tables for movable rows to be connected to

		movableRowsConnectedElements: false, //other elements for movable rows to be connected to

		movableRowsSender: false,

		movableRowsReceiver: "insert",

		movableRowsSendingStart: function movableRowsSendingStart() {},

		movableRowsSent: function movableRowsSent() {},

		movableRowsSentFailed: function movableRowsSentFailed() {},

		movableRowsSendingStop: function movableRowsSendingStop() {},

		movableRowsReceivingStart: function movableRowsReceivingStart() {},

		movableRowsReceived: function movableRowsReceived() {},

		movableRowsReceivedFailed: function movableRowsReceivedFailed() {},

		movableRowsReceivingStop: function movableRowsReceivingStop() {},

		movableRowsElementDrop: function movableRowsElementDrop() {},

		scrollToRowPosition: "top",

		scrollToRowIfVisible: true,

		scrollToColumnPosition: "left",

		scrollToColumnIfVisible: true,

		rowFormatter: false,

		rowFormatterPrint: null,

		rowFormatterClipboard: null,

		rowFormatterHtmlOutput: null,

		placeholder: false,

		//table building callbacks

		tableBuilding: function tableBuilding() {},

		tableBuilt: function tableBuilt() {},

		//render callbacks

		renderStarted: function renderStarted() {},

		renderComplete: function renderComplete() {},

		//row callbacks

		rowClick: false,

		rowDblClick: false,

		rowContext: false,

		rowTap: false,

		rowDblTap: false,

		rowTapHold: false,

		rowMouseEnter: false,

		rowMouseLeave: false,

		rowMouseOver: false,

		rowMouseOut: false,

		rowMouseMove: false,

		rowContextMenu: false,

		rowClickMenu: false,

		rowAdded: function rowAdded() {},

		rowDeleted: function rowDeleted() {},

		rowMoved: function rowMoved() {},

		rowUpdated: function rowUpdated() {},

		rowSelectionChanged: function rowSelectionChanged() {},

		rowSelected: function rowSelected() {},

		rowDeselected: function rowDeselected() {},

		rowResized: function rowResized() {},

		//cell callbacks

		//row callbacks

		cellClick: false,

		cellDblClick: false,

		cellContext: false,

		cellTap: false,

		cellDblTap: false,

		cellTapHold: false,

		cellMouseEnter: false,

		cellMouseLeave: false,

		cellMouseOver: false,

		cellMouseOut: false,

		cellMouseMove: false,

		cellEditing: function cellEditing() {},

		cellEdited: function cellEdited() {},

		cellEditCancelled: function cellEditCancelled() {},

		//column callbacks

		columnMoved: false,

		columnResized: function columnResized() {},

		columnTitleChanged: function columnTitleChanged() {},

		columnVisibilityChanged: function columnVisibilityChanged() {},

		//HTML iport callbacks

		htmlImporting: function htmlImporting() {},

		htmlImported: function htmlImported() {},

		//data callbacks

		dataLoading: function dataLoading() {},

		dataLoaded: function dataLoaded() {},

		dataEdited: false, //DEPRECATED

		dataChanged: false,

		//ajax callbacks

		ajaxRequesting: function ajaxRequesting() {},

		ajaxResponse: false,

		ajaxError: function ajaxError() {},

		//filtering callbacks

		dataFiltering: false,

		dataFiltered: false,

		//sorting callbacks

		dataSorting: function dataSorting() {},

		dataSorted: function dataSorted() {},

		//grouping callbacks

		groupToggleElement: "arrow",

		groupClosedShowCalcs: false,

		dataGrouping: function dataGrouping() {},

		dataGrouped: false,

		groupVisibilityChanged: function groupVisibilityChanged() {},

		groupClick: false,

		groupDblClick: false,

		groupContext: false,

		groupContextMenu: false,

		groupClickMenu: false,

		groupTap: false,

		groupDblTap: false,

		groupTapHold: false,

		columnCalcs: true,

		//pagination callbacks

		pageLoaded: function pageLoaded() {},

		//localization callbacks

		localized: function localized() {},

		//validation callbacks

		validationMode: "blocking",

		validationFailed: function validationFailed() {},

		//history callbacks

		historyUndo: function historyUndo() {},

		historyRedo: function historyRedo() {},

		//scroll callbacks

		scrollHorizontal: function scrollHorizontal() {},

		scrollVertical: function scrollVertical() {}

	};

	Tabulator.prototype.initializeOptions = function (options) {

		//warn user if option is not available

		if (options.invalidOptionWarnings !== false) {

			for (var key in options) {

				if (typeof this.defaultOptions[key] === "undefined") {

					console.warn("Invalid table constructor option:", key);
				}
			}
		}

		//assign options to table

		for (var key in this.defaultOptions) {

			if (key in options) {

				this.options[key] = options[key];
			} else {

				if (Array.isArray(this.defaultOptions[key])) {

					this.options[key] = Object.assign([], this.defaultOptions[key]);
				} else if (_typeof(this.defaultOptions[key]) === "object" && this.defaultOptions[key] !== null) {

					this.options[key] = Object.assign({}, this.defaultOptions[key]);
				} else {

					this.options[key] = this.defaultOptions[key];
				}
			}
		}
	};

	Tabulator.prototype.initializeElement = function (element) {

		if (typeof HTMLElement !== "undefined" && element instanceof HTMLElement) {

			this.element = element;

			return true;
		} else if (typeof element === "string") {

			this.element = document.querySelector(element);

			if (this.element) {

				return true;
			} else {

				console.error("Tabulator Creation Error - no element found matching selector: ", element);

				return false;
			}
		} else {

			console.error("Tabulator Creation Error - Invalid element provided:", element);

			return false;
		}
	};

	Tabulator.prototype.rtlCheck = function () {

		var style = window.getComputedStyle(this.element);

		switch (this.options.textDirection) {

			case "auto":

				if (style.direction !== "rtl") {

					break;
				};

			case "rtl":

				this.element.classList.add("tabulator-rtl");

				this.rtl = true;

				break;

			case "ltr":

				this.element.classList.add("tabulator-ltr");

			default:

				this.rtl = false;

		}
	};

	//convert depricated functionality to new functions

	Tabulator.prototype._mapDepricatedFunctionality = function () {

		//map depricated persistance setup options

		if (this.options.persistentLayout || this.options.persistentSort || this.options.persistentFilter) {

			if (!this.options.persistence) {

				this.options.persistence = {};
			}
		}

		if (this.options.dataEdited) {

			console.warn("DEPRECATION WARNING - dataEdited option has been deprecated, please use the dataChanged option instead");

			this.options.dataChanged = this.options.dataEdited;
		}

		if (this.options.downloadDataFormatter) {

			console.warn("DEPRECATION WARNING - downloadDataFormatter option has been deprecated");
		}

		if (typeof this.options.clipboardCopyHeader !== "undefined") {

			this.options.columnHeaders = this.options.clipboardCopyHeader;

			console.warn("DEPRECATION WARNING - clipboardCopyHeader option has been deprecated, please use the columnHeaders property on the clipboardCopyConfig option");
		}

		if (this.options.printVisibleRows !== true) {

			console.warn("printVisibleRows option is deprecated, you should now use the printRowRange option");

			this.options.persistence.printRowRange = "active";
		}

		if (this.options.printCopyStyle !== true) {

			console.warn("printCopyStyle option is deprecated, you should now use the printStyled option");

			this.options.persistence.printStyled = this.options.printCopyStyle;
		}

		if (this.options.persistentLayout) {

			console.warn("persistentLayout option is deprecated, you should now use the persistence option");

			if (this.options.persistence !== true && typeof this.options.persistence.columns === "undefined") {

				this.options.persistence.columns = true;
			}
		}

		if (this.options.persistentSort) {

			console.warn("persistentSort option is deprecated, you should now use the persistence option");

			if (this.options.persistence !== true && typeof this.options.persistence.sort === "undefined") {

				this.options.persistence.sort = true;
			}
		}

		if (this.options.persistentFilter) {

			console.warn("persistentFilter option is deprecated, you should now use the persistence option");

			if (this.options.persistence !== true && typeof this.options.persistence.filter === "undefined") {

				this.options.persistence.filter = true;
			}
		}

		if (this.options.columnVertAlign) {

			console.warn("columnVertAlign option is deprecated, you should now use the columnHeaderVertAlign option");

			this.options.columnHeaderVertAlign = this.options.columnVertAlign;
		}
	};

	Tabulator.prototype._clearSelection = function () {

		this.element.classList.add("tabulator-block-select");

		if (window.getSelection) {

			if (window.getSelection().empty) {
				// Chrome

				window.getSelection().empty();
			} else if (window.getSelection().removeAllRanges) {
				// Firefox

				window.getSelection().removeAllRanges();
			}
		} else if (document.selection) {
			// IE?

			document.selection.empty();
		}

		this.element.classList.remove("tabulator-block-select");
	};

	//concreate table

	Tabulator.prototype._create = function () {

		this._clearObjectPointers();

		this._mapDepricatedFunctionality();

		this.bindModules();

		this.rtlCheck();

		if (this.element.tagName === "TABLE") {

			if (this.modExists("htmlTableImport", true)) {

				this.modules.htmlTableImport.parseTable();
			}
		}

		this.columnManager = new ColumnManager(this);

		this.rowManager = new RowManager(this);

		this.footerManager = new FooterManager(this);

		this.columnManager.setRowManager(this.rowManager);

		this.rowManager.setColumnManager(this.columnManager);

		if (this.options.virtualDomHoz) {

			this.vdomHoz = new VDomHoz(this);
		}

		this._buildElement();

		this._loadInitialData();
	};

	//clear pointers to objects in default config object

	Tabulator.prototype._clearObjectPointers = function () {

		this.options.columns = this.options.columns.slice(0);

		if (!this.options.reactiveData) {

			this.options.data = this.options.data.slice(0);
		}
	};

	//build tabulator element

	Tabulator.prototype._buildElement = function () {
		var _this24 = this;

		var element = this.element,
		    mod = this.modules,
		    options = this.options;

		options.tableBuilding.call(this);

		element.classList.add("tabulator");

		element.setAttribute("role", "grid");

		//empty element

		while (element.firstChild) {
			element.removeChild(element.firstChild);
		} //set table height

		if (options.height) {

			options.height = isNaN(options.height) ? options.height : options.height + "px";

			element.style.height = options.height;
		}

		//set table min height

		if (options.minHeight !== false) {

			options.minHeight = isNaN(options.minHeight) ? options.minHeight : options.minHeight + "px";

			element.style.minHeight = options.minHeight;
		}

		//set table maxHeight

		if (options.maxHeight !== false) {

			options.maxHeight = isNaN(options.maxHeight) ? options.maxHeight : options.maxHeight + "px";

			element.style.maxHeight = options.maxHeight;
		}

		this.columnManager.initialize();

		this.rowManager.initialize();

		this._detectBrowser();

		if (this.modExists("layout", true)) {

			mod.layout.initialize(options.layout);
		}

		//set localization


		mod.localize.initialize();

		if (options.headerFilterPlaceholder !== false) {

			mod.localize.setHeaderFilterPlaceholder(options.headerFilterPlaceholder);
		}

		for (var locale in options.langs) {

			mod.localize.installLang(locale, options.langs[locale]);
		}

		mod.localize.setLocale(options.locale);

		//configure placeholder element

		if (typeof options.placeholder == "string") {

			var el = document.createElement("div");

			el.classList.add("tabulator-placeholder");

			var span = document.createElement("span");

			span.innerHTML = options.placeholder;

			el.appendChild(span);

			options.placeholder = el;
		}

		//build table elements

		element.appendChild(this.columnManager.getElement());

		element.appendChild(this.rowManager.getElement());

		if (options.footerElement) {

			this.footerManager.activate();
		}

		if (options.persistence && this.modExists("persistence", true)) {

			mod.persistence.initialize();
		}

		if (options.movableRows && this.modExists("moveRow")) {

			mod.moveRow.initialize();
		}

		if (options.autoColumns && this.options.data) {

			this.columnManager.generateColumnsFromRowData(this.options.data);
		}

		if (this.modExists("columnCalcs")) {

			mod.columnCalcs.initialize();
		}

		this.columnManager.setColumns(options.columns);

		if (options.dataTree && this.modExists("dataTree", true)) {

			mod.dataTree.initialize();
		}

		if (this.modExists("frozenRows")) {

			this.modules.frozenRows.initialize();
		}

		if ((options.persistence && this.modExists("persistence", true) && mod.persistence.config.sort || options.initialSort) && this.modExists("sort", true)) {

			var sorters = [];

			if (options.persistence && this.modExists("persistence", true) && mod.persistence.config.sort) {

				sorters = mod.persistence.load("sort");

				if (sorters === false && options.initialSort) {

					sorters = options.initialSort;
				}
			} else if (options.initialSort) {

				sorters = options.initialSort;
			}

			mod.sort.setSort(sorters);
		}

		if ((options.persistence && this.modExists("persistence", true) && mod.persistence.config.filter || options.initialFilter) && this.modExists("filter", true)) {

			var filters = [];

			if (options.persistence && this.modExists("persistence", true) && mod.persistence.config.filter) {

				filters = mod.persistence.load("filter");

				if (filters === false && options.initialFilter) {

					filters = options.initialFilter;
				}
			} else if (options.initialFilter) {

				filters = options.initialFilter;
			}

			mod.filter.setFilter(filters);
		}

		if (options.initialHeaderFilter && this.modExists("filter", true)) {

			options.initialHeaderFilter.forEach(function (item) {

				var column = _this24.columnManager.findColumn(item.field);

				if (column) {

					mod.filter.setHeaderFilterValue(column, item.value);
				} else {

					console.warn("Column Filter Error - No matching column found:", item.field);

					return false;
				}
			});
		}

		if (this.modExists("ajax")) {

			mod.ajax.initialize();
		}

		if (options.pagination && this.modExists("page", true)) {

			mod.page.initialize();
		}

		if (options.groupBy && this.modExists("groupRows", true)) {

			mod.groupRows.initialize();
		}

		if (this.modExists("keybindings")) {

			mod.keybindings.initialize();
		}

		if (this.modExists("selectRow")) {

			mod.selectRow.clearSelectionData(true);
		}

		if (options.autoResize && this.modExists("resizeTable")) {

			mod.resizeTable.initialize();
		}

		if (this.modExists("clipboard")) {

			mod.clipboard.initialize();
		}

		if (options.printAsHtml && this.modExists("print")) {

			mod.print.initialize();
		}

		options.tableBuilt.call(this);
	};

	Tabulator.prototype._loadInitialData = function () {

		var self = this;

		if (self.options.pagination && self.modExists("page")) {

			self.modules.page.reset(true, true);

			if (self.options.pagination == "local") {

				if (self.options.data.length) {

					self.rowManager.setData(self.options.data, false, true);
				} else {

					if ((self.options.ajaxURL || self.options.ajaxURLGenerator) && self.modExists("ajax")) {

						self.modules.ajax.loadData(false, true).then(function () {}).catch(function () {

							if (self.options.paginationInitialPage) {

								self.modules.page.setPage(self.options.paginationInitialPage);
							}
						});

						return;
					} else {

						self.rowManager.setData(self.options.data, false, true);
					}
				}

				if (self.options.paginationInitialPage) {

					self.modules.page.setPage(self.options.paginationInitialPage);
				}
			} else {

				if (self.options.ajaxURL) {

					self.modules.page.setPage(self.options.paginationInitialPage).then(function () {}).catch(function () {});
				} else {

					self.rowManager.setData([], false, true);
				}
			}
		} else {

			if (self.options.data.length) {

				self.rowManager.setData(self.options.data);
			} else {

				if ((self.options.ajaxURL || self.options.ajaxURLGenerator) && self.modExists("ajax")) {

					self.modules.ajax.loadData(false, true).then(function () {}).catch(function () {});
				} else {

					self.rowManager.setData(self.options.data, false, true);
				}
			}
		}
	};

	//deconstructor

	Tabulator.prototype.destroy = function () {

		var element = this.element;

		Tabulator.prototype.comms.deregister(this); //deregister table from inderdevice communication


		if (this.options.reactiveData && this.modExists("reactiveData", true)) {

			this.modules.reactiveData.unwatchData();
		}

		//clear row data

		this.rowManager.rows.forEach(function (row) {

			row.wipe();
		});

		this.rowManager.rows = [];

		this.rowManager.activeRows = [];

		this.rowManager.displayRows = [];

		//clear event bindings

		if (this.options.autoResize && this.modExists("resizeTable")) {

			this.modules.resizeTable.clearBindings();
		}

		if (this.modExists("keybindings")) {

			this.modules.keybindings.clearBindings();
		}

		//clear DOM

		while (element.firstChild) {
			element.removeChild(element.firstChild);
		}element.classList.remove("tabulator");
	};

	Tabulator.prototype._detectBrowser = function () {

		var ua = navigator.userAgent || navigator.vendor || window.opera;

		if (ua.indexOf("Trident") > -1) {

			this.browser = "ie";

			this.browserSlow = true;
		} else if (ua.indexOf("Edge") > -1) {

			this.browser = "edge";

			this.browserSlow = true;
		} else if (ua.indexOf("Firefox") > -1) {

			this.browser = "firefox";

			this.browserSlow = false;
		} else {

			this.browser = "other";

			this.browserSlow = false;
		}

		this.browserMobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(ua) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0, 4));
	};

	////////////////// Data Handling //////////////////


	//block table redrawing

	Tabulator.prototype.blockRedraw = function () {

		return this.rowManager.blockRedraw();
	};

	//restore table redrawing

	Tabulator.prototype.restoreRedraw = function () {

		return this.rowManager.restoreRedraw();
	};

	//local data from local file

	Tabulator.prototype.setDataFromLocalFile = function (extensions) {
		var _this25 = this;

		return new Promise(function (resolve, reject) {

			var input = document.createElement("input");

			input.type = "file";

			input.accept = extensions || ".json,application/json";

			input.addEventListener("change", function (e) {

				var file = input.files[0],
				    reader = new FileReader(),
				    data;

				reader.readAsText(file);

				reader.onload = function (e) {

					try {

						data = JSON.parse(reader.result);
					} catch (e) {

						console.warn("File Load Error - File contents is invalid JSON", e);

						reject(e);

						return;
					}

					_this25.setData(data).then(function (data) {

						resolve(data);
					}).catch(function (err) {

						resolve(err);
					});
				};

				reader.onerror = function (e) {

					console.warn("File Load Error - Unable to read file");

					reject();
				};
			});

			input.click();
		});
	};

	//load data

	Tabulator.prototype.setData = function (data, params, config) {

		if (this.modExists("ajax")) {

			this.modules.ajax.blockActiveRequest();
		}

		return this._setData(data, params, config, false, true);
	};

	Tabulator.prototype._setData = function (data, params, config, inPosition, columnsChanged) {

		var self = this;

		if (typeof data === "string") {

			if (data.indexOf("{") == 0 || data.indexOf("[") == 0) {

				//data is a json encoded string

				return self.rowManager.setData(JSON.parse(data), inPosition, columnsChanged);
			} else {

				if (self.modExists("ajax", true)) {

					if (params) {

						self.modules.ajax.setParams(params);
					}

					if (config) {

						self.modules.ajax.setConfig(config);
					}

					self.modules.ajax.setUrl(data);

					if (self.options.pagination == "remote" && self.modExists("page", true)) {

						self.modules.page.reset(true, true);

						return self.modules.page.setPage(1);
					} else {

						//assume data is url, make ajax call to url to get data

						return self.modules.ajax.loadData(inPosition, columnsChanged);
					}
				}
			}
		} else {

			if (data) {

				//asume data is already an object

				return self.rowManager.setData(data, inPosition, columnsChanged);
			} else {

				//no data provided, check if ajaxURL is present;

				if (self.modExists("ajax") && (self.modules.ajax.getUrl || self.options.ajaxURLGenerator)) {

					if (self.options.pagination == "remote" && self.modExists("page", true)) {

						self.modules.page.reset(true, true);

						return self.modules.page.setPage(1);
					} else {

						return self.modules.ajax.loadData(inPosition, columnsChanged);
					}
				} else {

					//empty data

					return self.rowManager.setData([], inPosition, columnsChanged);
				}
			}
		}
	};

	//clear data

	Tabulator.prototype.clearData = function () {

		if (this.modExists("ajax")) {

			this.modules.ajax.blockActiveRequest();
		}

		this.rowManager.clearData();
	};

	//get table data array

	Tabulator.prototype.getData = function (active) {

		if (active === true) {

			console.warn("passing a boolean to the getData function is deprecated, you should now pass the string 'active'");

			active = "active";
		}

		return this.rowManager.getData(active);
	};

	//get table data array count

	Tabulator.prototype.getDataCount = function (active) {

		if (active === true) {

			console.warn("passing a boolean to the getDataCount function is deprecated, you should now pass the string 'active'");

			active = "active";
		}

		return this.rowManager.getDataCount(active);
	};

	//search for specific row components

	Tabulator.prototype.searchRows = function (field, type, value) {

		if (this.modExists("filter", true)) {

			return this.modules.filter.search("rows", field, type, value);
		}
	};

	//search for specific data

	Tabulator.prototype.searchData = function (field, type, value) {

		if (this.modExists("filter", true)) {

			return this.modules.filter.search("data", field, type, value);
		}
	};

	//get table html

	Tabulator.prototype.getHtml = function (visible, style, config) {

		if (this.modExists("export", true)) {

			return this.modules.export.getHtml(visible, style, config);
		}
	};

	//get print html

	Tabulator.prototype.print = function (visible, style, config) {

		if (this.modExists("print", true)) {

			return this.modules.print.printFullscreen(visible, style, config);
		}
	};

	//retrieve Ajax URL

	Tabulator.prototype.getAjaxUrl = function () {

		if (this.modExists("ajax", true)) {

			return this.modules.ajax.getUrl();
		}
	};

	//replace data, keeping table in position with same sort

	Tabulator.prototype.replaceData = function (data, params, config) {

		if (this.modExists("ajax")) {

			this.modules.ajax.blockActiveRequest();
		}

		return this._setData(data, params, config, true);
	};

	//update table data

	Tabulator.prototype.updateData = function (data) {
		var _this26 = this;

		var self = this;

		var responses = 0;

		return new Promise(function (resolve, reject) {

			if (_this26.modExists("ajax")) {

				_this26.modules.ajax.blockActiveRequest();
			}

			if (typeof data === "string") {

				data = JSON.parse(data);
			}

			if (data) {

				data.forEach(function (item) {

					var row = self.rowManager.findRow(item[self.options.index]);

					if (row) {

						responses++;

						row.updateData(item).then(function () {

							responses--;

							if (!responses) {

								resolve();
							}
						});
					}
				});
			} else {

				console.warn("Update Error - No data provided");

				reject("Update Error - No data provided");
			}
		});
	};

	Tabulator.prototype.addData = function (data, pos, index) {
		var _this27 = this;

		return new Promise(function (resolve, reject) {

			if (_this27.modExists("ajax")) {

				_this27.modules.ajax.blockActiveRequest();
			}

			if (typeof data === "string") {

				data = JSON.parse(data);
			}

			if (data) {

				_this27.rowManager.addRows(data, pos, index).then(function (rows) {

					var output = [];

					rows.forEach(function (row) {

						output.push(row.getComponent());
					});

					resolve(output);
				});
			} else {

				console.warn("Update Error - No data provided");

				reject("Update Error - No data provided");
			}
		});
	};

	//update table data

	Tabulator.prototype.updateOrAddData = function (data) {
		var _this28 = this;

		var self = this,
		    rows = [],
		    responses = 0;

		return new Promise(function (resolve, reject) {

			if (_this28.modExists("ajax")) {

				_this28.modules.ajax.blockActiveRequest();
			}

			if (typeof data === "string") {

				data = JSON.parse(data);
			}

			if (data) {

				data.forEach(function (item) {

					var row = self.rowManager.findRow(item[self.options.index]);

					responses++;

					if (row) {

						row.updateData(item).then(function () {

							responses--;

							rows.push(row.getComponent());

							if (!responses) {

								resolve(rows);
							}
						});
					} else {

						self.rowManager.addRows(item).then(function (newRows) {

							responses--;

							rows.push(newRows[0].getComponent());

							if (!responses) {

								resolve(rows);
							}
						});
					}
				});
			} else {

				console.warn("Update Error - No data provided");

				reject("Update Error - No data provided");
			}
		});
	};

	//get row object

	Tabulator.prototype.getRow = function (index) {

		var row = this.rowManager.findRow(index);

		if (row) {

			return row.getComponent();
		} else {

			console.warn("Find Error - No matching row found:", index);

			return false;
		}
	};

	//get row object

	Tabulator.prototype.getRowFromPosition = function (position, active) {

		var row = this.rowManager.getRowFromPosition(position, active);

		if (row) {

			return row.getComponent();
		} else {

			console.warn("Find Error - No matching row found:", position);

			return false;
		}
	};

	//delete row from table

	Tabulator.prototype.deleteRow = function (index) {
		var _this29 = this;

		return new Promise(function (resolve, reject) {

			var self = _this29,
			    count = 0,
			    successCount = 0,
			    foundRows = [];

			function doneCheck() {

				count++;

				if (count == index.length) {

					if (successCount) {

						self.rowManager.reRenderInPosition();

						resolve();
					}
				}
			}

			if (!Array.isArray(index)) {

				index = [index];
			}

			//find matching rows

			index.forEach(function (item) {

				var row = _this29.rowManager.findRow(item, true);

				if (row) {

					foundRows.push(row);
				} else {

					console.warn("Delete Error - No matching row found:", item);

					reject("Delete Error - No matching row found");

					doneCheck();
				}
			});

			//sort rows into correct order to ensure smooth delete from table

			foundRows.sort(function (a, b) {

				return _this29.rowManager.rows.indexOf(a) > _this29.rowManager.rows.indexOf(b) ? 1 : -1;
			});

			foundRows.forEach(function (row) {

				row.delete().then(function () {

					successCount++;

					doneCheck();
				}).catch(function (err) {

					doneCheck();

					reject(err);
				});
			});
		});
	};

	//add row to table

	Tabulator.prototype.addRow = function (data, pos, index) {
		var _this30 = this;

		return new Promise(function (resolve, reject) {

			if (typeof data === "string") {

				data = JSON.parse(data);
			}

			_this30.rowManager.addRows(data, pos, index).then(function (rows) {

				//recalc column calculations if present

				if (_this30.modExists("columnCalcs")) {

					_this30.modules.columnCalcs.recalc(_this30.rowManager.activeRows);
				}

				resolve(rows[0].getComponent());
			});
		});
	};

	//update a row if it exitsts otherwise create it

	Tabulator.prototype.updateOrAddRow = function (index, data) {
		var _this31 = this;

		return new Promise(function (resolve, reject) {

			var row = _this31.rowManager.findRow(index);

			if (typeof data === "string") {

				data = JSON.parse(data);
			}

			if (row) {

				row.updateData(data).then(function () {

					//recalc column calculations if present

					if (_this31.modExists("columnCalcs")) {

						_this31.modules.columnCalcs.recalc(_this31.rowManager.activeRows);
					}

					resolve(row.getComponent());
				}).catch(function (err) {

					reject(err);
				});
			} else {

				row = _this31.rowManager.addRows(data).then(function (rows) {

					//recalc column calculations if present

					if (_this31.modExists("columnCalcs")) {

						_this31.modules.columnCalcs.recalc(_this31.rowManager.activeRows);
					}

					resolve(rows[0].getComponent());
				}).catch(function (err) {

					reject(err);
				});
			}
		});
	};

	//update row data

	Tabulator.prototype.updateRow = function (index, data) {
		var _this32 = this;

		return new Promise(function (resolve, reject) {

			var row = _this32.rowManager.findRow(index);

			if (typeof data === "string") {

				data = JSON.parse(data);
			}

			if (row) {

				row.updateData(data).then(function () {

					resolve(row.getComponent());
				}).catch(function (err) {

					reject(err);
				});
			} else {

				console.warn("Update Error - No matching row found:", index);

				reject("Update Error - No matching row found");
			}
		});
	};

	//scroll to row in DOM

	Tabulator.prototype.scrollToRow = function (index, position, ifVisible) {
		var _this33 = this;

		return new Promise(function (resolve, reject) {

			var row = _this33.rowManager.findRow(index);

			if (row) {

				_this33.rowManager.scrollToRow(row, position, ifVisible).then(function () {

					resolve();
				}).catch(function (err) {

					reject(err);
				});
			} else {

				console.warn("Scroll Error - No matching row found:", index);

				reject("Scroll Error - No matching row found");
			}
		});
	};

	Tabulator.prototype.moveRow = function (from, to, after) {

		var fromRow = this.rowManager.findRow(from);

		if (fromRow) {

			fromRow.moveToRow(to, after);
		} else {

			console.warn("Move Error - No matching row found:", from);
		}
	};

	Tabulator.prototype.getRows = function (active) {

		if (active === true) {

			console.warn("passing a boolean to the getRows function is deprecated, you should now pass the string 'active'");

			active = "active";
		}

		return this.rowManager.getComponents(active);
	};

	//get position of row in table

	Tabulator.prototype.getRowPosition = function (index, active) {

		var row = this.rowManager.findRow(index);

		if (row) {

			return this.rowManager.getRowPosition(row, active);
		} else {

			console.warn("Position Error - No matching row found:", index);

			return false;
		}
	};

	//copy table data to clipboard

	Tabulator.prototype.copyToClipboard = function (selector) {

		if (this.modExists("clipboard", true)) {

			this.modules.clipboard.copy(selector);
		}
	};

	/////////////// Column Functions  ///////////////


	Tabulator.prototype.setColumns = function (definition) {

		this.columnManager.setColumns(definition);
	};

	Tabulator.prototype.getColumns = function (structured) {

		return this.columnManager.getComponents(structured);
	};

	Tabulator.prototype.getColumn = function (field) {

		var col = this.columnManager.findColumn(field);

		if (col) {

			return col.getComponent();
		} else {

			console.warn("Find Error - No matching column found:", field);

			return false;
		}
	};

	Tabulator.prototype.getColumnDefinitions = function () {

		return this.columnManager.getDefinitionTree();
	};

	Tabulator.prototype.getColumnLayout = function () {

		if (this.modExists("persistence", true)) {

			return this.modules.persistence.parseColumns(this.columnManager.getColumns());
		}
	};

	Tabulator.prototype.setColumnLayout = function (layout) {

		if (this.modExists("persistence", true)) {

			this.columnManager.setColumns(this.modules.persistence.mergeDefinition(this.options.columns, layout));

			return true;
		}

		return false;
	};

	Tabulator.prototype.showColumn = function (field) {

		var column = this.columnManager.findColumn(field);

		if (column) {

			column.show();

			if (this.options.responsiveLayout && this.modExists("responsiveLayout", true)) {

				this.modules.responsiveLayout.update();
			}
		} else {

			console.warn("Column Show Error - No matching column found:", field);

			return false;
		}
	};

	Tabulator.prototype.hideColumn = function (field) {

		var column = this.columnManager.findColumn(field);

		if (column) {

			column.hide();

			if (this.options.responsiveLayout && this.modExists("responsiveLayout", true)) {

				this.modules.responsiveLayout.update();
			}
		} else {

			console.warn("Column Hide Error - No matching column found:", field);

			return false;
		}
	};

	Tabulator.prototype.toggleColumn = function (field) {

		var column = this.columnManager.findColumn(field);

		if (column) {

			if (column.visible) {

				column.hide();
			} else {

				column.show();
			}
		} else {

			console.warn("Column Visibility Toggle Error - No matching column found:", field);

			return false;
		}
	};

	Tabulator.prototype.addColumn = function (definition, before, field) {
		var _this34 = this;

		return new Promise(function (resolve, reject) {

			var column = _this34.columnManager.findColumn(field);

			_this34.columnManager.addColumn(definition, before, column).then(function (column) {

				resolve(column.getComponent());
			}).catch(function (err) {

				reject(err);
			});
		});
	};

	Tabulator.prototype.deleteColumn = function (field) {
		var _this35 = this;

		return new Promise(function (resolve, reject) {

			var column = _this35.columnManager.findColumn(field);

			if (column) {

				column.delete().then(function () {

					resolve();
				}).catch(function (err) {

					reject(err);
				});
			} else {

				console.warn("Column Delete Error - No matching column found:", field);

				reject();
			}
		});
	};

	Tabulator.prototype.updateColumnDefinition = function (field, definition) {
		var _this36 = this;

		return new Promise(function (resolve, reject) {

			var column = _this36.columnManager.findColumn(field);

			if (column) {

				column.updateDefinition(definition).then(function (col) {

					resolve(col);
				}).catch(function (err) {

					reject(err);
				});
			} else {

				console.warn("Column Update Error - No matching column found:", field);

				reject();
			}
		});
	};

	Tabulator.prototype.moveColumn = function (from, to, after) {

		var fromColumn = this.columnManager.findColumn(from);

		var toColumn = this.columnManager.findColumn(to);

		if (fromColumn) {

			if (toColumn) {

				this.columnManager.moveColumn(fromColumn, toColumn, after);
			} else {

				console.warn("Move Error - No matching column found:", toColumn);
			}
		} else {

			console.warn("Move Error - No matching column found:", from);
		}
	};

	//scroll to column in DOM

	Tabulator.prototype.scrollToColumn = function (field, position, ifVisible) {
		var _this37 = this;

		return new Promise(function (resolve, reject) {

			var column = _this37.columnManager.findColumn(field);

			if (column) {

				_this37.columnManager.scrollToColumn(column, position, ifVisible).then(function () {

					resolve();
				}).catch(function (err) {

					reject(err);
				});
			} else {

				console.warn("Scroll Error - No matching column found:", field);

				reject("Scroll Error - No matching column found");
			}
		});
	};

	//////////// Localization Functions  ////////////

	Tabulator.prototype.setLocale = function (locale) {

		this.modules.localize.setLocale(locale);
	};

	Tabulator.prototype.getLocale = function () {

		return this.modules.localize.getLocale();
	};

	Tabulator.prototype.getLang = function (locale) {

		return this.modules.localize.getLang(locale);
	};

	//////////// General Public Functions ////////////


	//redraw list without updating data

	Tabulator.prototype.redraw = function (force) {

		this.columnManager.redraw(force);

		this.rowManager.redraw(force);
	};

	Tabulator.prototype.setHeight = function (height) {

		if (this.rowManager.renderMode !== "classic") {

			this.options.height = isNaN(height) ? height : height + "px";

			this.element.style.height = this.options.height;

			this.rowManager.setRenderMode();

			this.rowManager.redraw();
		} else {

			console.warn("setHeight function is not available in classic render mode");
		}
	};

	///////////////////// Sorting ////////////////////


	//trigger sort

	Tabulator.prototype.setSort = function (sortList, dir) {

		if (this.modExists("sort", true)) {

			this.modules.sort.setSort(sortList, dir);

			this.rowManager.sorterRefresh();
		}
	};

	Tabulator.prototype.getSorters = function () {

		if (this.modExists("sort", true)) {

			return this.modules.sort.getSort();
		}
	};

	Tabulator.prototype.clearSort = function () {

		if (this.modExists("sort", true)) {

			this.modules.sort.clear();

			this.rowManager.sorterRefresh();
		}
	};

	///////////////////// Filtering ////////////////////


	//set standard filters

	Tabulator.prototype.setFilter = function (field, type, value, params) {

		if (this.modExists("filter", true)) {

			this.modules.filter.setFilter(field, type, value, params);

			this.rowManager.filterRefresh();
		}
	};

	//set standard filters

	Tabulator.prototype.refreshFilter = function () {

		if (this.modExists("filter", true)) {

			this.rowManager.filterRefresh();
		}
	};

	//add filter to array

	Tabulator.prototype.addFilter = function (field, type, value, params) {

		if (this.modExists("filter", true)) {

			this.modules.filter.addFilter(field, type, value, params);

			this.rowManager.filterRefresh();
		}
	};

	//get all filters

	Tabulator.prototype.getFilters = function (all) {

		if (this.modExists("filter", true)) {

			return this.modules.filter.getFilters(all);
		}
	};

	Tabulator.prototype.setHeaderFilterFocus = function (field) {

		if (this.modExists("filter", true)) {

			var column = this.columnManager.findColumn(field);

			if (column) {

				this.modules.filter.setHeaderFilterFocus(column);
			} else {

				console.warn("Column Filter Focus Error - No matching column found:", field);

				return false;
			}
		}
	};

	Tabulator.prototype.getHeaderFilterValue = function (field) {

		if (this.modExists("filter", true)) {

			var column = this.columnManager.findColumn(field);

			if (column) {

				return this.modules.filter.getHeaderFilterValue(column);
			} else {

				console.warn("Column Filter Error - No matching column found:", field);
			}
		}
	};

	Tabulator.prototype.setHeaderFilterValue = function (field, value) {

		if (this.modExists("filter", true)) {

			var column = this.columnManager.findColumn(field);

			if (column) {

				this.modules.filter.setHeaderFilterValue(column, value);
			} else {

				console.warn("Column Filter Error - No matching column found:", field);

				return false;
			}
		}
	};

	Tabulator.prototype.getHeaderFilters = function () {

		if (this.modExists("filter", true)) {

			return this.modules.filter.getHeaderFilters();
		}
	};

	//remove filter from array

	Tabulator.prototype.removeFilter = function (field, type, value) {

		if (this.modExists("filter", true)) {

			this.modules.filter.removeFilter(field, type, value);

			this.rowManager.filterRefresh();
		}
	};

	//clear filters

	Tabulator.prototype.clearFilter = function (all) {

		if (this.modExists("filter", true)) {

			this.modules.filter.clearFilter(all);

			this.rowManager.filterRefresh();
		}
	};

	//clear header filters

	Tabulator.prototype.clearHeaderFilter = function () {

		if (this.modExists("filter", true)) {

			this.modules.filter.clearHeaderFilter();

			this.rowManager.filterRefresh();
		}
	};

	///////////////////// select ////////////////////

	Tabulator.prototype.selectRow = function (rows) {

		if (this.modExists("selectRow", true)) {

			if (rows === true) {

				console.warn("passing a boolean to the selectRowselectRow function is deprecated, you should now pass the string 'active'");

				rows = "active";
			}

			this.modules.selectRow.selectRows(rows);
		}
	};

	Tabulator.prototype.deselectRow = function (rows) {

		if (this.modExists("selectRow", true)) {

			this.modules.selectRow.deselectRows(rows);
		}
	};

	Tabulator.prototype.toggleSelectRow = function (row) {

		if (this.modExists("selectRow", true)) {

			this.modules.selectRow.toggleRow(row);
		}
	};

	Tabulator.prototype.getSelectedRows = function () {

		if (this.modExists("selectRow", true)) {

			return this.modules.selectRow.getSelectedRows();
		}
	};

	Tabulator.prototype.getSelectedData = function () {

		if (this.modExists("selectRow", true)) {

			return this.modules.selectRow.getSelectedData();
		}
	};

	///////////////////// validation  ////////////////////

	Tabulator.prototype.getInvalidCells = function () {

		if (this.modExists("validate", true)) {

			return this.modules.validate.getInvalidCells();
		}
	};

	Tabulator.prototype.clearCellValidation = function (cells) {
		var _this38 = this;

		if (this.modExists("validate", true)) {

			if (!cells) {

				cells = this.modules.validate.getInvalidCells();
			}

			if (!Array.isArray(cells)) {

				cells = [cells];
			}

			cells.forEach(function (cell) {

				_this38.modules.validate.clearValidation(cell._getSelf());
			});
		}
	};

	Tabulator.prototype.validate = function (cells) {

		var output = [];

		//clear row data

		this.rowManager.rows.forEach(function (row) {

			var valid = row.validate();

			if (valid !== true) {

				output = output.concat(valid);
			}
		});

		return output.length ? output : true;
	};

	//////////// Pagination Functions  ////////////


	Tabulator.prototype.setMaxPage = function (max) {

		if (this.options.pagination && this.modExists("page")) {

			this.modules.page.setMaxPage(max);
		} else {

			return false;
		}
	};

	Tabulator.prototype.setPage = function (page) {

		if (this.options.pagination && this.modExists("page")) {

			return this.modules.page.setPage(page);
		} else {

			return new Promise(function (resolve, reject) {
				reject();
			});
		}
	};

	Tabulator.prototype.setPageToRow = function (row) {
		var _this39 = this;

		return new Promise(function (resolve, reject) {

			if (_this39.options.pagination && _this39.modExists("page")) {

				row = _this39.rowManager.findRow(row);

				if (row) {

					_this39.modules.page.setPageToRow(row).then(function () {

						resolve();
					}).catch(function () {

						reject();
					});
				} else {

					reject();
				}
			} else {

				reject();
			}
		});
	};

	Tabulator.prototype.setPageSize = function (size) {

		if (this.options.pagination && this.modExists("page")) {

			this.modules.page.setPageSize(size);

			this.modules.page.setPage(1).then(function () {}).catch(function () {});
		} else {

			return false;
		}
	};

	Tabulator.prototype.getPageSize = function () {

		if (this.options.pagination && this.modExists("page", true)) {

			return this.modules.page.getPageSize();
		}
	};

	Tabulator.prototype.previousPage = function () {

		if (this.options.pagination && this.modExists("page")) {

			this.modules.page.previousPage();
		} else {

			return false;
		}
	};

	Tabulator.prototype.nextPage = function () {

		if (this.options.pagination && this.modExists("page")) {

			this.modules.page.nextPage();
		} else {

			return false;
		}
	};

	Tabulator.prototype.getPage = function () {

		if (this.options.pagination && this.modExists("page")) {

			return this.modules.page.getPage();
		} else {

			return false;
		}
	};

	Tabulator.prototype.getPageMax = function () {

		if (this.options.pagination && this.modExists("page")) {

			return this.modules.page.getPageMax();
		} else {

			return false;
		}
	};

	///////////////// Grouping Functions ///////////////


	Tabulator.prototype.setGroupBy = function (groups) {

		if (this.modExists("groupRows", true)) {

			this.options.groupBy = groups;

			this.modules.groupRows.initialize();

			this.rowManager.refreshActiveData("display");

			if (this.options.persistence && this.modExists("persistence", true) && this.modules.persistence.config.group) {

				this.modules.persistence.save("group");
			}
		} else {

			return false;
		}
	};

	Tabulator.prototype.setGroupValues = function (groupValues) {

		if (this.modExists("groupRows", true)) {

			this.options.groupValues = groupValues;

			this.modules.groupRows.initialize();

			this.rowManager.refreshActiveData("display");

			if (this.options.persistence && this.modExists("persistence", true) && this.modules.persistence.config.group) {

				this.modules.persistence.save("group");
			}
		} else {

			return false;
		}
	};

	Tabulator.prototype.setGroupStartOpen = function (values) {

		if (this.modExists("groupRows", true)) {

			this.options.groupStartOpen = values;

			this.modules.groupRows.initialize();

			if (this.options.groupBy) {

				this.rowManager.refreshActiveData("group");

				if (this.options.persistence && this.modExists("persistence", true) && this.modules.persistence.config.group) {

					this.modules.persistence.save("group");
				}
			} else {

				console.warn("Grouping Update - cant refresh view, no groups have been set");
			}
		} else {

			return false;
		}
	};

	Tabulator.prototype.setGroupHeader = function (values) {

		if (this.modExists("groupRows", true)) {

			this.options.groupHeader = values;

			this.modules.groupRows.initialize();

			if (this.options.groupBy) {

				this.rowManager.refreshActiveData("group");

				if (this.options.persistence && this.modExists("persistence", true) && this.modules.persistence.config.group) {

					this.modules.persistence.save("group");
				}
			} else {

				console.warn("Grouping Update - cant refresh view, no groups have been set");
			}
		} else {

			return false;
		}
	};

	Tabulator.prototype.getGroups = function (values) {

		if (this.modExists("groupRows", true)) {

			return this.modules.groupRows.getGroups(true);
		} else {

			return false;
		}
	};

	// get grouped table data in the same format as getData()

	Tabulator.prototype.getGroupedData = function () {

		if (this.modExists("groupRows", true)) {

			return this.options.groupBy ? this.modules.groupRows.getGroupedData() : this.getData();
		}
	};

	Tabulator.prototype.getEditedCells = function () {

		if (this.modExists("edit", true)) {

			return this.modules.edit.getEditedCells();
		}
	};

	Tabulator.prototype.clearCellEdited = function (cells) {
		var _this40 = this;

		if (this.modExists("edit", true)) {

			if (!cells) {

				cells = this.modules.edit.getEditedCells();
			}

			if (!Array.isArray(cells)) {

				cells = [cells];
			}

			cells.forEach(function (cell) {

				_this40.modules.edit.clearEdited(cell._getSelf());
			});
		}
	};

	///////////////// Column Calculation Functions ///////////////

	Tabulator.prototype.getCalcResults = function () {

		if (this.modExists("columnCalcs", true)) {

			return this.modules.columnCalcs.getResults();
		} else {

			return false;
		}
	};

	Tabulator.prototype.recalc = function () {

		if (this.modExists("columnCalcs", true)) {

			this.modules.columnCalcs.recalcAll(this.rowManager.activeRows);
		}
	};

	/////////////// Navigation Management //////////////


	Tabulator.prototype.navigatePrev = function () {

		var cell = false;

		if (this.modExists("edit", true)) {

			cell = this.modules.edit.currentCell;

			if (cell) {

				return cell.nav().prev();
			}
		}

		return false;
	};

	Tabulator.prototype.navigateNext = function () {

		var cell = false;

		if (this.modExists("edit", true)) {

			cell = this.modules.edit.currentCell;

			if (cell) {

				return cell.nav().next();
			}
		}

		return false;
	};

	Tabulator.prototype.navigateLeft = function () {

		var cell = false;

		if (this.modExists("edit", true)) {

			cell = this.modules.edit.currentCell;

			if (cell) {

				e.preventDefault();

				return cell.nav().left();
			}
		}

		return false;
	};

	Tabulator.prototype.navigateRight = function () {

		var cell = false;

		if (this.modExists("edit", true)) {

			cell = this.modules.edit.currentCell;

			if (cell) {

				e.preventDefault();

				return cell.nav().right();
			}
		}

		return false;
	};

	Tabulator.prototype.navigateUp = function () {

		var cell = false;

		if (this.modExists("edit", true)) {

			cell = this.modules.edit.currentCell;

			if (cell) {

				e.preventDefault();

				return cell.nav().up();
			}
		}

		return false;
	};

	Tabulator.prototype.navigateDown = function () {

		var cell = false;

		if (this.modExists("edit", true)) {

			cell = this.modules.edit.currentCell;

			if (cell) {

				e.preventDefault();

				return cell.nav().down();
			}
		}

		return false;
	};

	/////////////// History Management //////////////

	Tabulator.prototype.undo = function () {

		if (this.options.history && this.modExists("history", true)) {

			return this.modules.history.undo();
		} else {

			return false;
		}
	};

	Tabulator.prototype.redo = function () {

		if (this.options.history && this.modExists("history", true)) {

			return this.modules.history.redo();
		} else {

			return false;
		}
	};

	Tabulator.prototype.getHistoryUndoSize = function () {

		if (this.options.history && this.modExists("history", true)) {

			return this.modules.history.getHistoryUndoSize();
		} else {

			return false;
		}
	};

	Tabulator.prototype.getHistoryRedoSize = function () {

		if (this.options.history && this.modExists("history", true)) {

			return this.modules.history.getHistoryRedoSize();
		} else {

			return false;
		}
	};

	Tabulator.prototype.clearHistory = function () {

		if (this.options.history && this.modExists("history", true)) {

			return this.modules.history.clear();
		} else {

			return false;
		}
	};

	/////////////// Download Management //////////////


	Tabulator.prototype.download = function (type, filename, options, active) {

		if (this.modExists("download", true)) {

			this.modules.download.download(type, filename, options, active);
		}
	};

	Tabulator.prototype.downloadToTab = function (type, filename, options, active) {

		if (this.modExists("download", true)) {

			this.modules.download.download(type, filename, options, active, true);
		}
	};

	/////////// Inter Table Communications ///////////


	Tabulator.prototype.tableComms = function (table, module, action, data) {

		this.modules.comms.receive(table, module, action, data);
	};

	////////////// Extension Management //////////////


	//object to hold module

	Tabulator.prototype.moduleBindings = {};

	//extend module

	Tabulator.prototype.extendModule = function (name, property, values) {

		if (Tabulator.prototype.moduleBindings[name]) {

			var source = Tabulator.prototype.moduleBindings[name].prototype[property];

			if (source) {

				if ((typeof values === 'undefined' ? 'undefined' : _typeof(values)) == "object") {

					for (var key in values) {

						source[key] = values[key];
					}
				} else {

					console.warn("Module Error - Invalid value type, it must be an object");
				}
			} else {

				console.warn("Module Error - property does not exist:", property);
			}
		} else {

			console.warn("Module Error - module does not exist:", name);
		}
	};

	//add module to tabulator

	Tabulator.prototype.registerModule = function (name, module) {

		var self = this;

		Tabulator.prototype.moduleBindings[name] = module;
	};

	//ensure that module are bound to instantiated function

	Tabulator.prototype.bindModules = function () {

		this.modules = {};

		for (var name in Tabulator.prototype.moduleBindings) {

			this.modules[name] = new Tabulator.prototype.moduleBindings[name](this);
		}
	};

	//Check for module

	Tabulator.prototype.modExists = function (plugin, required) {

		if (this.modules[plugin]) {

			return true;
		} else {

			if (required) {

				console.error("Tabulator Module Not Installed: " + plugin);
			}

			return false;
		}
	};

	Tabulator.prototype.helpers = {

		elVisible: function elVisible(el) {

			return !(el.offsetWidth <= 0 && el.offsetHeight <= 0);
		},

		elOffset: function elOffset(el) {

			var box = el.getBoundingClientRect();

			return {

				top: box.top + window.pageYOffset - document.documentElement.clientTop,

				left: box.left + window.pageXOffset - document.documentElement.clientLeft

			};
		},

		deepClone: function deepClone(obj) {

			var clone = Object.assign(Array.isArray(obj) ? [] : {}, obj);

			for (var i in obj) {

				if (obj[i] != null && _typeof(obj[i]) === "object") {

					if (obj[i] instanceof Date) {

						clone[i] = new Date(obj[i]);
					} else {

						clone[i] = this.deepClone(obj[i]);
					}
				}
			}

			return clone;
		}

	};

	Tabulator.prototype.comms = {

		tables: [],

		register: function register(table) {

			Tabulator.prototype.comms.tables.push(table);
		},

		deregister: function deregister(table) {

			var index = Tabulator.prototype.comms.tables.indexOf(table);

			if (index > -1) {

				Tabulator.prototype.comms.tables.splice(index, 1);
			}
		},

		lookupTable: function lookupTable(query, silent) {

			var results = [],
			    matches,
			    match;

			if (typeof query === "string") {

				matches = document.querySelectorAll(query);

				if (matches.length) {

					for (var i = 0; i < matches.length; i++) {

						match = Tabulator.prototype.comms.matchElement(matches[i]);

						if (match) {

							results.push(match);
						}
					}
				}
			} else if (typeof HTMLElement !== "undefined" && query instanceof HTMLElement || query instanceof Tabulator) {

				match = Tabulator.prototype.comms.matchElement(query);

				if (match) {

					results.push(match);
				}
			} else if (Array.isArray(query)) {

				query.forEach(function (item) {

					results = results.concat(Tabulator.prototype.comms.lookupTable(item));
				});
			} else {

				if (!silent) {

					console.warn("Table Connection Error - Invalid Selector", query);
				}
			}

			return results;
		},

		matchElement: function matchElement(element) {

			return Tabulator.prototype.comms.tables.find(function (table) {

				return element instanceof Tabulator ? table === element : table.element === element;
			});
		}

	};

	Tabulator.prototype.findTable = function (query) {

		var results = Tabulator.prototype.comms.lookupTable(query, true);

		return Array.isArray(results) && !results.length ? false : results;
	};

	var Layout = function Layout(table) {

		this.table = table;

		this.mode = null;
	};

	//initialize layout system


	Layout.prototype.initialize = function (layout) {

		if (this.modes[layout]) {

			this.mode = layout;
		} else {

			console.warn("Layout Error - invalid mode set, defaulting to 'fitData' : " + layout);

			this.mode = 'fitData';
		}

		this.table.element.setAttribute("tabulator-layout", this.mode);
	};

	Layout.prototype.getMode = function () {

		return this.mode;
	};

	//trigger table layout


	Layout.prototype.layout = function () {

		this.modes[this.mode].call(this, this.table.columnManager.columnsByIndex);

		if (this.mode.indexOf("fitData") === 0 && this.table.options.persistence && this.table.modExists("persistence", true) && this.table.modules.persistence.config.columns) {

			this.table.modules.persistence.save("columns");
		}
	};

	//layout render functions


	Layout.prototype.modes = {

		//resize columns to fit data they contain


		"fitData": function fitData(columns) {

			if (this.table.options.virtualDomHoz) {

				this.table.vdomHoz.fitDataLayoutOverride();
			} else {

				columns.forEach(function (column) {

					column.reinitializeWidth();
				});
			}

			if (this.table.options.responsiveLayout && this.table.modExists("responsiveLayout", true)) {

				this.table.modules.responsiveLayout.update();
			}
		},

		//resize columns to fit data they contain and stretch row to fill table


		"fitDataFill": function fitDataFill(columns) {

			columns.forEach(function (column) {

				column.reinitializeWidth();
			});

			if (this.table.options.responsiveLayout && this.table.modExists("responsiveLayout", true)) {

				this.table.modules.responsiveLayout.update();
			}
		},

		//resize columns to fit data they contain


		"fitDataTable": function fitDataTable(columns) {

			columns.forEach(function (column) {

				column.reinitializeWidth();
			});

			if (this.table.options.responsiveLayout && this.table.modExists("responsiveLayout", true)) {

				this.table.modules.responsiveLayout.update();
			}
		},

		//resize columns to fit data the contain and stretch last column to fill table


		"fitDataStretch": function fitDataStretch(columns) {
			var _this41 = this;

			var colsWidth = 0,
			    tableWidth = this.table.rowManager.element.clientWidth,
			    gap = 0,
			    lastCol = false;

			columns.forEach(function (column, i) {

				if (!column.widthFixed) {

					column.reinitializeWidth();
				}

				if (_this41.table.options.responsiveLayout ? column.modules.responsive.visible : column.visible) {

					lastCol = column;
				}

				if (column.visible) {

					colsWidth += column.getWidth();
				}
			});

			if (lastCol) {

				gap = tableWidth - colsWidth + lastCol.getWidth();

				if (this.table.options.responsiveLayout && this.table.modExists("responsiveLayout", true)) {

					lastCol.setWidth(0);

					this.table.modules.responsiveLayout.update();
				}

				if (gap > 0) {

					lastCol.setWidth(gap);
				} else {

					lastCol.reinitializeWidth();
				}
			} else {

				if (this.table.options.responsiveLayout && this.table.modExists("responsiveLayout", true)) {

					this.table.modules.responsiveLayout.update();
				}
			}
		},

		//resize columns to fit


		"fitColumns": function fitColumns(columns) {

			var self = this;

			var totalWidth = self.table.element.clientWidth; //table element width


			var fixedWidth = 0; //total width of columns with a defined width


			var flexWidth = 0; //total width available to flexible columns


			var flexGrowUnits = 0; //total number of widthGrow blocks accross all columns


			var flexColWidth = 0; //desired width of flexible columns


			var flexColumns = []; //array of flexible width columns


			var fixedShrinkColumns = []; //array of fixed width columns that can shrink


			var flexShrinkUnits = 0; //total number of widthShrink blocks accross all columns


			var overflowWidth = 0; //horizontal overflow width


			var gapFill = 0; //number of pixels to be added to final column to close and half pixel gaps


			function calcWidth(width) {

				var colWidth;

				if (typeof width == "string") {

					if (width.indexOf("%") > -1) {

						colWidth = totalWidth / 100 * parseInt(width);
					} else {

						colWidth = parseInt(width);
					}
				} else {

					colWidth = width;
				}

				return colWidth;
			}

			//ensure columns resize to take up the correct amount of space


			function scaleColumns(columns, freeSpace, colWidth, shrinkCols) {

				var oversizeCols = [],
				    oversizeSpace = 0,
				    remainingSpace = 0,
				    nextColWidth = 0,
				    remainingFlexGrowUnits = flexGrowUnits,
				    gap = 0,
				    changeUnits = 0,
				    undersizeCols = [];

				function calcGrow(col) {

					return colWidth * (col.column.definition.widthGrow || 1);
				}

				function calcShrink(col) {

					return calcWidth(col.width) - colWidth * (col.column.definition.widthShrink || 0);
				}

				columns.forEach(function (col, i) {

					var width = shrinkCols ? calcShrink(col) : calcGrow(col);

					if (col.column.minWidth >= width) {

						oversizeCols.push(col);
					} else {

						if (col.column.maxWidth && col.column.maxWidth < width) {

							col.width = col.column.maxWidth;

							freeSpace -= col.column.maxWidth;

							remainingFlexGrowUnits -= shrinkCols ? col.column.definition.widthShrink || 1 : col.column.definition.widthGrow || 1;

							if (remainingFlexGrowUnits) {

								colWidth = Math.floor(freeSpace / remainingFlexGrowUnits);
							}
						} else {

							undersizeCols.push(col);

							changeUnits += shrinkCols ? col.column.definition.widthShrink || 1 : col.column.definition.widthGrow || 1;
						}
					}
				});

				if (oversizeCols.length) {

					oversizeCols.forEach(function (col) {

						oversizeSpace += shrinkCols ? col.width - col.column.minWidth : col.column.minWidth;

						col.width = col.column.minWidth;
					});

					remainingSpace = freeSpace - oversizeSpace;

					nextColWidth = changeUnits ? Math.floor(remainingSpace / changeUnits) : remainingSpace;

					gap = remainingSpace - nextColWidth * changeUnits;

					gap += scaleColumns(undersizeCols, remainingSpace, nextColWidth, shrinkCols);
				} else {

					gap = changeUnits ? freeSpace - Math.floor(freeSpace / changeUnits) * changeUnits : freeSpace;

					undersizeCols.forEach(function (column) {

						column.width = shrinkCols ? calcShrink(column) : calcGrow(column);
					});
				}

				return gap;
			}

			if (this.table.options.responsiveLayout && this.table.modExists("responsiveLayout", true)) {

				this.table.modules.responsiveLayout.update();
			}

			//adjust for vertical scrollbar if present


			if (this.table.rowManager.element.scrollHeight > this.table.rowManager.element.clientHeight) {

				totalWidth -= this.table.rowManager.element.offsetWidth - this.table.rowManager.element.clientWidth;
			}

			columns.forEach(function (column) {

				var width, minWidth, colWidth;

				if (column.visible) {

					width = column.definition.width;

					minWidth = parseInt(column.minWidth);

					if (width) {

						colWidth = calcWidth(width);

						fixedWidth += colWidth > minWidth ? colWidth : minWidth;

						if (column.definition.widthShrink) {

							fixedShrinkColumns.push({

								column: column,

								width: colWidth > minWidth ? colWidth : minWidth

							});

							flexShrinkUnits += column.definition.widthShrink;
						}
					} else {

						flexColumns.push({

							column: column,

							width: 0

						});

						flexGrowUnits += column.definition.widthGrow || 1;
					}
				}
			});

			//calculate available space


			flexWidth = totalWidth - fixedWidth;

			//calculate correct column size


			flexColWidth = Math.floor(flexWidth / flexGrowUnits);

			//generate column widths


			var gapFill = scaleColumns(flexColumns, flexWidth, flexColWidth, false);

			//increase width of last column to account for rounding errors


			if (flexColumns.length && gapFill > 0) {

				flexColumns[flexColumns.length - 1].width += +gapFill;
			}

			//caculate space for columns to be shrunk into


			flexColumns.forEach(function (col) {

				flexWidth -= col.width;
			});

			overflowWidth = Math.abs(gapFill) + flexWidth;

			//shrink oversize columns if there is no available space


			if (overflowWidth > 0 && flexShrinkUnits) {

				gapFill = scaleColumns(fixedShrinkColumns, overflowWidth, Math.floor(overflowWidth / flexShrinkUnits), true);
			}

			//decrease width of last column to account for rounding errors


			if (fixedShrinkColumns.length) {

				fixedShrinkColumns[fixedShrinkColumns.length - 1].width -= gapFill;
			}

			flexColumns.forEach(function (col) {

				col.column.setWidth(col.width);
			});

			fixedShrinkColumns.forEach(function (col) {

				col.column.setWidth(col.width);
			});
		}

	};

	Tabulator.prototype.registerModule("layout", Layout);

	var Localize = function Localize(table) {

		this.table = table; //hold Tabulator object

		this.locale = "default"; //current locale

		this.lang = false; //current language

		this.bindings = {}; //update events to call when locale is changed

		this.langList = {};
	};

	Localize.prototype.initialize = function () {

		this.langList = Tabulator.prototype.helpers.deepClone(this.langs);
	};

	//set header placehoder

	Localize.prototype.setHeaderFilterPlaceholder = function (placeholder) {

		this.langList.default.headerFilters.default = placeholder;
	};

	//set header filter placeholder by column

	Localize.prototype.setHeaderFilterColumnPlaceholder = function (column, placeholder) {

		this.langList.default.headerFilters.columns[column] = placeholder;

		if (this.lang && !this.lang.headerFilters.columns[column]) {

			this.lang.headerFilters.columns[column] = placeholder;
		}
	};

	//setup a lang description object

	Localize.prototype.installLang = function (locale, lang) {

		if (this.langList[locale]) {

			this._setLangProp(this.langList[locale], lang);
		} else {

			this.langList[locale] = lang;
		}
	};

	Localize.prototype._setLangProp = function (lang, values) {

		for (var key in values) {

			if (lang[key] && _typeof(lang[key]) == "object") {

				this._setLangProp(lang[key], values[key]);
			} else {

				lang[key] = values[key];
			}
		}
	};

	//set current locale

	Localize.prototype.setLocale = function (desiredLocale) {

		var self = this;

		desiredLocale = desiredLocale || "default";

		//fill in any matching languge values

		function traverseLang(trans, path) {

			for (var prop in trans) {

				if (_typeof(trans[prop]) == "object") {

					if (!path[prop]) {

						path[prop] = {};
					}

					traverseLang(trans[prop], path[prop]);
				} else {

					path[prop] = trans[prop];
				}
			}
		}

		//determing correct locale to load

		if (desiredLocale === true && navigator.language) {

			//get local from system

			desiredLocale = navigator.language.toLowerCase();
		}

		if (desiredLocale) {

			//if locale is not set, check for matching top level locale else use default

			if (!self.langList[desiredLocale]) {

				var prefix = desiredLocale.split("-")[0];

				if (self.langList[prefix]) {

					console.warn("Localization Error - Exact matching locale not found, using closest match: ", desiredLocale, prefix);

					desiredLocale = prefix;
				} else {

					console.warn("Localization Error - Matching locale not found, using default: ", desiredLocale);

					desiredLocale = "default";
				}
			}
		}

		self.locale = desiredLocale;

		//load default lang template

		self.lang = Tabulator.prototype.helpers.deepClone(self.langList.default || {});

		if (desiredLocale != "default") {

			traverseLang(self.langList[desiredLocale], self.lang);
		}

		self.table.options.localized.call(self.table, self.locale, self.lang);

		self._executeBindings();
	};

	//get current locale

	Localize.prototype.getLocale = function (locale) {

		return self.locale;
	};

	//get lang object for given local or current if none provided

	Localize.prototype.getLang = function (locale) {

		return locale ? this.langList[locale] : this.lang;
	};

	//get text for current locale

	Localize.prototype.getText = function (path, value) {

		var path = value ? path + "|" + value : path,
		    pathArray = path.split("|"),
		    text = this._getLangElement(pathArray, this.locale);

		// if(text === false){

		// 	console.warn("Localization Error - Matching localized text not found for given path: ", path);

		// }


		return text || "";
	};

	//traverse langs object and find localized copy

	Localize.prototype._getLangElement = function (path, locale) {

		var self = this;

		var root = self.lang;

		path.forEach(function (level) {

			var rootPath;

			if (root) {

				rootPath = root[level];

				if (typeof rootPath != "undefined") {

					root = rootPath;
				} else {

					root = false;
				}
			}
		});

		return root;
	};

	//set update binding

	Localize.prototype.bind = function (path, callback) {

		if (!this.bindings[path]) {

			this.bindings[path] = [];
		}

		this.bindings[path].push(callback);

		callback(this.getText(path), this.lang);
	};

	//itterate through bindings and trigger updates

	Localize.prototype._executeBindings = function () {

		var self = this;

		var _loop = function _loop(path) {

			self.bindings[path].forEach(function (binding) {

				binding(self.getText(path), self.lang);
			});
		};

		for (var path in self.bindings) {
			_loop(path);
		}
	};

	//Localized text listings

	Localize.prototype.langs = {

		"default": { //hold default locale text

			"groups": {

				"item": "item",

				"items": "items"

			},

			"columns": {},

			"ajax": {

				"loading": "Loading",

				"error": "Error"

			},

			"pagination": {

				"page_size": "Page Size",

				"page_title": "Show Page",

				"first": "First",

				"first_title": "First Page",

				"last": "Last",

				"last_title": "Last Page",

				"prev": "Prev",

				"prev_title": "Prev Page",

				"next": "Next",

				"next_title": "Next Page",

				"all": "All"

			},

			"headerFilters": {

				"default": "filter column...",

				"columns": {}

			}

		}

	};

	Tabulator.prototype.registerModule("localize", Localize);

	var Comms = function Comms(table) {

		this.table = table;
	};

	Comms.prototype.getConnections = function (selectors) {

		var self = this,
		    connections = [],
		    connection;

		connection = Tabulator.prototype.comms.lookupTable(selectors);

		connection.forEach(function (con) {

			if (self.table !== con) {

				connections.push(con);
			}
		});

		return connections;
	};

	Comms.prototype.send = function (selectors, module, action, data) {

		var self = this,
		    connections = this.getConnections(selectors);

		connections.forEach(function (connection) {

			connection.tableComms(self.table.element, module, action, data);
		});

		if (!connections.length && selectors) {

			console.warn("Table Connection Error - No tables matching selector found", selectors);
		}
	};

	Comms.prototype.receive = function (table, module, action, data) {

		if (this.table.modExists(module)) {

			return this.table.modules[module].commsReceived(table, action, data);
		} else {

			console.warn("Inter-table Comms Error - no such module:", module);
		}
	};

	Tabulator.prototype.registerModule("comms", Comms);

	var Accessor = function Accessor(table) {
		this.table = table; //hold Tabulator object
		this.allowedTypes = ["", "data", "download", "clipboard", "print", "htmlOutput"]; //list of accessor types
	};

	//initialize column accessor
	Accessor.prototype.initializeColumn = function (column) {
		var self = this,
		    match = false,
		    config = {};

		this.allowedTypes.forEach(function (type) {
			var key = "accessor" + (type.charAt(0).toUpperCase() + type.slice(1)),
			    accessor;

			if (column.definition[key]) {
				accessor = self.lookupAccessor(column.definition[key]);

				if (accessor) {
					match = true;

					config[key] = {
						accessor: accessor,
						params: column.definition[key + "Params"] || {}
					};
				}
			}
		});

		if (match) {
			column.modules.accessor = config;
		}
	};

	Accessor.prototype.lookupAccessor = function (value) {
		var accessor = false;

		//set column accessor
		switch (typeof value === 'undefined' ? 'undefined' : _typeof(value)) {
			case "string":
				if (this.accessors[value]) {
					accessor = this.accessors[value];
				} else {
					console.warn("Accessor Error - No such accessor found, ignoring: ", value);
				}
				break;

			case "function":
				accessor = value;
				break;
		}

		return accessor;
	};

	//apply accessor to row
	Accessor.prototype.transformRow = function (row, type) {
		var key = "accessor" + (type.charAt(0).toUpperCase() + type.slice(1)),
		    rowComponent = row.getComponent();

		//clone data object with deep copy to isolate internal data from returned result
		var data = Tabulator.prototype.helpers.deepClone(row.data || {});

		this.table.columnManager.traverse(function (column) {
			var value, accessor, params, colCompnent;

			if (column.modules.accessor) {

				accessor = column.modules.accessor[key] || column.modules.accessor.accessor || false;

				if (accessor) {
					value = column.getFieldValue(data);

					if (value != "undefined") {
						colCompnent = column.getComponent();
						params = typeof accessor.params === "function" ? accessor.params(value, data, type, colCompnent, rowComponent) : accessor.params;
						column.setFieldValue(data, accessor.accessor(value, data, type, params, colCompnent, rowComponent));
					}
				}
			}
		});

		return data;
	},

	//default accessors
	Accessor.prototype.accessors = {};

	Tabulator.prototype.registerModule("accessor", Accessor);
	var Ajax = function Ajax(table) {

		this.table = table; //hold Tabulator object
		this.config = false; //hold config object for ajax request
		this.url = ""; //request URL
		this.urlGenerator = false;
		this.params = false; //request parameters

		this.loaderElement = this.createLoaderElement(); //loader message div
		this.msgElement = this.createMsgElement(); //message element
		this.loadingElement = false;
		this.errorElement = false;
		this.loaderPromise = false;

		this.progressiveLoad = false;
		this.loading = false;

		this.requestOrder = 0; //prevent requests comming out of sequence if overridden by another load request
	};

	//initialize setup options
	Ajax.prototype.initialize = function () {
		var template;

		this.loaderElement.appendChild(this.msgElement);

		if (this.table.options.ajaxLoaderLoading) {
			if (typeof this.table.options.ajaxLoaderLoading == "string") {
				template = document.createElement('template');
				template.innerHTML = this.table.options.ajaxLoaderLoading.trim();
				this.loadingElement = template.content.firstChild;
			} else {
				this.loadingElement = this.table.options.ajaxLoaderLoading;
			}
		}

		this.loaderPromise = this.table.options.ajaxRequestFunc || this.defaultLoaderPromise;

		this.urlGenerator = this.table.options.ajaxURLGenerator || this.defaultURLGenerator;

		if (this.table.options.ajaxLoaderError) {
			if (typeof this.table.options.ajaxLoaderError == "string") {
				template = document.createElement('template');
				template.innerHTML = this.table.options.ajaxLoaderError.trim();
				this.errorElement = template.content.firstChild;
			} else {
				this.errorElement = this.table.options.ajaxLoaderError;
			}
		}

		if (this.table.options.ajaxParams) {
			this.setParams(this.table.options.ajaxParams);
		}

		if (this.table.options.ajaxConfig) {
			this.setConfig(this.table.options.ajaxConfig);
		}

		if (this.table.options.ajaxURL) {
			this.setUrl(this.table.options.ajaxURL);
		}

		if (this.table.options.ajaxProgressiveLoad) {
			if (this.table.options.pagination) {
				this.progressiveLoad = false;
				console.error("Progressive Load Error - Pagination and progressive load cannot be used at the same time");
			} else {
				if (this.table.modExists("page")) {
					this.progressiveLoad = this.table.options.ajaxProgressiveLoad;
					this.table.modules.page.initializeProgressive(this.progressiveLoad);
				} else {
					console.error("Pagination plugin is required for progressive ajax loading");
				}
			}
		}
	};

	Ajax.prototype.createLoaderElement = function () {
		var el = document.createElement("div");
		el.classList.add("tabulator-loader");
		return el;
	};

	Ajax.prototype.createMsgElement = function () {
		var el = document.createElement("div");

		el.classList.add("tabulator-loader-msg");
		el.setAttribute("role", "alert");

		return el;
	};

	//set ajax params
	Ajax.prototype.setParams = function (params, update) {
		if (update) {
			this.params = this.params || {};

			for (var key in params) {
				this.params[key] = params[key];
			}
		} else {
			this.params = params;
		}
	};

	Ajax.prototype.getParams = function () {
		return this.params || {};
	};

	//load config object
	Ajax.prototype.setConfig = function (config) {
		this._loadDefaultConfig();

		if (typeof config == "string") {
			this.config.method = config;
		} else {
			for (var key in config) {
				this.config[key] = config[key];
			}
		}
	};

	//create config object from default
	Ajax.prototype._loadDefaultConfig = function (force) {
		var self = this;
		if (!self.config || force) {

			self.config = {};

			//load base config from defaults
			for (var key in self.defaultConfig) {
				self.config[key] = self.defaultConfig[key];
			}
		}
	};

	//set request url
	Ajax.prototype.setUrl = function (url) {
		this.url = url;
	};

	//get request url
	Ajax.prototype.getUrl = function () {
		return this.url;
	};

	//lstandard loading function
	Ajax.prototype.loadData = function (inPosition, columnsChanged) {
		var self = this;

		if (this.progressiveLoad) {
			return this._loadDataProgressive();
		} else {
			return this._loadDataStandard(inPosition, columnsChanged);
		}
	};

	Ajax.prototype.nextPage = function (diff) {
		var margin;

		if (!this.loading) {

			margin = this.table.options.ajaxProgressiveLoadScrollMargin || this.table.rowManager.getElement().clientHeight * 2;

			if (diff < margin) {
				this.table.modules.page.nextPage().then(function () {}).catch(function () {});
			}
		}
	};

	Ajax.prototype.blockActiveRequest = function () {
		this.requestOrder++;
	};

	Ajax.prototype._loadDataProgressive = function () {
		this.table.rowManager.setData([]);
		return this.table.modules.page.setPage(1);
	};

	Ajax.prototype._loadDataStandard = function (inPosition, columnsChanged) {
		var _this42 = this;

		return new Promise(function (resolve, reject) {
			_this42.sendRequest(inPosition).then(function (data) {
				_this42.table.rowManager.setData(data, inPosition, columnsChanged).then(function () {
					resolve();
				}).catch(function (e) {
					reject(e);
				});
			}).catch(function (e) {
				reject(e);
			});
		});
	};

	Ajax.prototype.generateParamsList = function (data, prefix) {
		var self = this,
		    output = [];

		prefix = prefix || "";

		if (Array.isArray(data)) {
			data.forEach(function (item, i) {
				output = output.concat(self.generateParamsList(item, prefix ? prefix + "[" + i + "]" : i));
			});
		} else if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === "object") {
			for (var key in data) {
				output = output.concat(self.generateParamsList(data[key], prefix ? prefix + "[" + key + "]" : key));
			}
		} else {
			output.push({ key: prefix, value: data });
		}

		return output;
	};

	Ajax.prototype.serializeParams = function (params) {
		var output = this.generateParamsList(params),
		    encoded = [];

		output.forEach(function (item) {
			encoded.push(encodeURIComponent(item.key) + "=" + encodeURIComponent(item.value));
		});

		return encoded.join("&");
	};

	//send ajax request
	Ajax.prototype.sendRequest = function (silent) {
		var _this43 = this;

		var self = this,
		    url = self.url,
		    requestNo,
		    esc,
		    query;

		self.requestOrder++;
		requestNo = self.requestOrder;

		self._loadDefaultConfig();

		return new Promise(function (resolve, reject) {
			if (self.table.options.ajaxRequesting.call(_this43.table, self.url, self.params) !== false) {

				self.loading = true;

				if (!silent) {
					self.showLoader();
				}

				_this43.loaderPromise(url, self.config, self.params).then(function (data) {
					if (requestNo === self.requestOrder) {
						if (self.table.options.ajaxResponse) {
							data = self.table.options.ajaxResponse.call(self.table, self.url, self.params, data);
						}
						resolve(data);

						self.hideLoader();
						self.loading = false;
					} else {
						console.warn("Ajax Response Blocked - An active ajax request was blocked by an attempt to change table data while the request was being made");
					}
				}).catch(function (error) {
					console.error("Ajax Load Error: ", error);
					self.table.options.ajaxError.call(self.table, error);

					self.showError();

					setTimeout(function () {
						self.hideLoader();
					}, 3000);

					self.loading = false;

					reject(error);
				});
			} else {
				reject();
			}
		});
	};

	Ajax.prototype.showLoader = function () {
		var shouldLoad = typeof this.table.options.ajaxLoader === "function" ? this.table.options.ajaxLoader() : this.table.options.ajaxLoader;

		if (shouldLoad) {

			this.hideLoader();

			while (this.msgElement.firstChild) {
				this.msgElement.removeChild(this.msgElement.firstChild);
			}this.msgElement.classList.remove("tabulator-error");
			this.msgElement.classList.add("tabulator-loading");

			if (this.loadingElement) {
				this.msgElement.appendChild(this.loadingElement);
			} else {
				this.msgElement.innerHTML = this.table.modules.localize.getText("ajax|loading");
			}

			this.table.element.appendChild(this.loaderElement);
		}
	};

	Ajax.prototype.showError = function () {
		this.hideLoader();

		while (this.msgElement.firstChild) {
			this.msgElement.removeChild(this.msgElement.firstChild);
		}this.msgElement.classList.remove("tabulator-loading");
		this.msgElement.classList.add("tabulator-error");

		if (this.errorElement) {
			this.msgElement.appendChild(this.errorElement);
		} else {
			this.msgElement.innerHTML = this.table.modules.localize.getText("ajax|error");
		}

		this.table.element.appendChild(this.loaderElement);
	};

	Ajax.prototype.hideLoader = function () {
		if (this.loaderElement.parentNode) {
			this.loaderElement.parentNode.removeChild(this.loaderElement);
		}
	};

	//default ajax config object
	Ajax.prototype.defaultConfig = {
		method: "GET"
	};

	Ajax.prototype.defaultURLGenerator = function (url, config, params) {

		if (url) {
			if (params && Object.keys(params).length) {
				if (!config.method || config.method.toLowerCase() == "get") {
					config.method = "get";

					url += (url.includes("?") ? "&" : "?") + this.modules.ajax.serializeParams(params);
				}
			}
		}

		return url;
	};

	Ajax.prototype.defaultLoaderPromise = function (url, config, params) {
		var self = this,
		    contentType;

		return new Promise(function (resolve, reject) {

			//set url
			url = self.urlGenerator.call(self.table, url, config, params);

			//set body content if not GET request
			if (config.method.toUpperCase() != "GET") {
				contentType = _typeof(self.table.options.ajaxContentType) === "object" ? self.table.options.ajaxContentType : self.contentTypeFormatters[self.table.options.ajaxContentType];
				if (contentType) {

					for (var key in contentType.headers) {
						if (!config.headers) {
							config.headers = {};
						}

						if (typeof config.headers[key] === "undefined") {
							config.headers[key] = contentType.headers[key];
						}
					}

					config.body = contentType.body.call(self, url, config, params);
				} else {
					console.warn("Ajax Error - Invalid ajaxContentType value:", self.table.options.ajaxContentType);
				}
			}

			if (url) {

				//configure headers
				if (typeof config.headers === "undefined") {
					config.headers = {};
				}

				if (typeof config.headers.Accept === "undefined") {
					config.headers.Accept = "application/json";
				}

				if (typeof config.headers["X-Requested-With"] === "undefined") {
					config.headers["X-Requested-With"] = "XMLHttpRequest";
				}

				if (typeof config.mode === "undefined") {
					config.mode = "cors";
				}

				if (config.mode == "cors") {

					if (typeof config.headers["Access-Control-Allow-Origin"] === "undefined") {
						config.headers["Access-Control-Allow-Origin"] = window.location.origin;
					}

					if (typeof config.credentials === "undefined") {
						config.credentials = 'same-origin';
					}
				} else {
					if (typeof config.credentials === "undefined") {
						config.credentials = 'include';
					}
				}

				//send request
				fetch(url, config).then(function (response) {
					if (response.ok) {
						response.json().then(function (data) {
							resolve(data);
						}).catch(function (error) {
							reject(error);
							console.warn("Ajax Load Error - Invalid JSON returned", error);
						});
					} else {
						console.error("Ajax Load Error - Connection Error: " + response.status, response.statusText);
						reject(response);
					}
				}).catch(function (error) {
					console.error("Ajax Load Error - Connection Error: ", error);
					reject(error);
				});
			} else {
				console.warn("Ajax Load Error - No URL Set");
				resolve([]);
			}
		});
	};

	Ajax.prototype.contentTypeFormatters = {
		"json": {
			headers: {
				'Content-Type': 'application/json'
			},
			body: function body(url, config, params) {
				return JSON.stringify(params);
			}
		},
		"form": {
			headers: {},
			body: function body(url, config, params) {
				var output = this.generateParamsList(params),
				    form = new FormData();

				output.forEach(function (item) {
					form.append(item.key, item.value);
				});

				return form;
			}
		}
	};

	Tabulator.prototype.registerModule("ajax", Ajax);

	//public calc object
	var CalcComponent = function CalcComponent(row) {
		this._row = row;
	};

	CalcComponent.prototype.getData = function (transform) {
		return this._row.getData(transform);
	};

	CalcComponent.prototype.getElement = function () {
		return this._row.getElement();
	};

	CalcComponent.prototype.getTable = function () {
		return this._row.table;
	};

	CalcComponent.prototype.getCells = function () {
		var cells = [];

		this._row.getCells().forEach(function (cell) {
			cells.push(cell.getComponent());
		});

		return cells;
	};

	CalcComponent.prototype.getCell = function (column) {
		var cell = this._row.getCell(column);
		return cell ? cell.getComponent() : false;
	};

	CalcComponent.prototype._getSelf = function () {
		return this._row;
	};

	var ColumnCalcs = function ColumnCalcs(table) {
		this.table = table; //hold Tabulator object
		this.topCalcs = [];
		this.botCalcs = [];
		this.genColumn = false;
		this.topElement = this.createElement();
		this.botElement = this.createElement();
		this.topRow = false;
		this.botRow = false;
		this.topInitialized = false;
		this.botInitialized = false;

		this.initialize();
	};

	ColumnCalcs.prototype.createElement = function () {
		var el = document.createElement("div");
		el.classList.add("tabulator-calcs-holder");
		return el;
	};

	ColumnCalcs.prototype.initialize = function () {
		this.genColumn = new Column({ field: "value" }, this);
	};

	//dummy functions to handle being mock column manager
	ColumnCalcs.prototype.registerColumnField = function () {};

	//initialize column calcs
	ColumnCalcs.prototype.initializeColumn = function (column) {
		var def = column.definition;

		var config = {
			topCalcParams: def.topCalcParams || {},
			botCalcParams: def.bottomCalcParams || {}
		};

		if (def.topCalc) {

			switch (_typeof(def.topCalc)) {
				case "string":
					if (this.calculations[def.topCalc]) {
						config.topCalc = this.calculations[def.topCalc];
					} else {
						console.warn("Column Calc Error - No such calculation found, ignoring: ", def.topCalc);
					}
					break;

				case "function":
					config.topCalc = def.topCalc;
					break;

			}

			if (config.topCalc) {
				column.modules.columnCalcs = config;
				this.topCalcs.push(column);

				if (this.table.options.columnCalcs != "group") {
					this.initializeTopRow();
				}
			}
		}

		if (def.bottomCalc) {
			switch (_typeof(def.bottomCalc)) {
				case "string":
					if (this.calculations[def.bottomCalc]) {
						config.botCalc = this.calculations[def.bottomCalc];
					} else {
						console.warn("Column Calc Error - No such calculation found, ignoring: ", def.bottomCalc);
					}
					break;

				case "function":
					config.botCalc = def.bottomCalc;
					break;

			}

			if (config.botCalc) {
				column.modules.columnCalcs = config;
				this.botCalcs.push(column);

				if (this.table.options.columnCalcs != "group") {
					this.initializeBottomRow();
				}
			}
		}
	};

	ColumnCalcs.prototype.removeCalcs = function () {
		var changed = false;

		if (this.topInitialized) {
			this.topInitialized = false;
			this.topElement.parentNode.removeChild(this.topElement);
			changed = true;
		}

		if (this.botInitialized) {
			this.botInitialized = false;
			this.table.footerManager.remove(this.botElement);
			changed = true;
		}

		if (changed) {
			this.table.rowManager.adjustTableSize();
		}
	};

	ColumnCalcs.prototype.initializeTopRow = function () {
		if (!this.topInitialized) {
			this.table.columnManager.getElement().insertBefore(this.topElement, this.table.columnManager.headersElement.nextSibling);
			this.topInitialized = true;
		}
	};

	ColumnCalcs.prototype.initializeBottomRow = function () {
		if (!this.botInitialized) {
			this.table.footerManager.prepend(this.botElement);
			this.botInitialized = true;
		}
	};

	ColumnCalcs.prototype.scrollHorizontal = function (left) {
		if (this.botInitialized && this.botRow) {
			this.botRow.getElement().style.marginLeft = -left + "px";
		}
	};

	ColumnCalcs.prototype.recalc = function (rows) {
		var data, row;

		if (this.topInitialized || this.botInitialized) {
			data = this.rowsToData(rows);

			if (this.topInitialized) {
				if (this.topRow) {
					this.topRow.deleteCells();
				}

				row = this.generateRow("top", this.rowsToData(rows));
				this.topRow = row;
				while (this.topElement.firstChild) {
					this.topElement.removeChild(this.topElement.firstChild);
				}this.topElement.appendChild(row.getElement());
				row.initialize(true);
			}

			if (this.botInitialized) {
				if (this.botRow) {
					this.botRow.deleteCells();
				}

				row = this.generateRow("bottom", this.rowsToData(rows));
				this.botRow = row;
				while (this.botElement.firstChild) {
					this.botElement.removeChild(this.botElement.firstChild);
				}this.botElement.appendChild(row.getElement());
				row.initialize(true);
			}

			this.table.rowManager.adjustTableSize();

			//set resizable handles
			if (this.table.modExists("frozenColumns")) {
				this.table.modules.frozenColumns.layout();
			}
		}
	};

	ColumnCalcs.prototype.recalcRowGroup = function (row) {
		this.recalcGroup(this.table.modules.groupRows.getRowGroup(row));
	};

	ColumnCalcs.prototype.recalcAll = function () {
		var _this44 = this;

		if (this.topCalcs.length || this.botCalcs.length) {
			if (this.table.options.columnCalcs !== "group") {
				this.recalc(this.table.rowManager.activeRows);
			}

			if (this.table.options.groupBy && this.table.options.columnCalcs !== "table") {

				var groups = table.modules.groupRows.getChildGroups();

				groups.forEach(function (group) {
					_this44.recalcGroup(group);
				});
			}
		}
	};

	ColumnCalcs.prototype.recalcGroup = function (group) {
		var data, rowData;

		if (group) {
			if (group.calcs) {
				if (group.calcs.bottom) {
					data = this.rowsToData(group.rows);
					rowData = this.generateRowData("bottom", data);

					group.calcs.bottom.updateData(rowData);
					group.calcs.bottom.reinitialize();
				}

				if (group.calcs.top) {
					data = this.rowsToData(group.rows);
					rowData = this.generateRowData("top", data);

					group.calcs.top.updateData(rowData);
					group.calcs.top.reinitialize();
				}
			}
		}
	};

	//generate top stats row
	ColumnCalcs.prototype.generateTopRow = function (rows) {
		return this.generateRow("top", this.rowsToData(rows));
	};
	//generate bottom stats row
	ColumnCalcs.prototype.generateBottomRow = function (rows) {
		return this.generateRow("bottom", this.rowsToData(rows));
	};

	ColumnCalcs.prototype.rowsToData = function (rows) {
		var _this45 = this;

		var data = [];

		rows.forEach(function (row) {
			data.push(row.getData());

			if (_this45.table.options.dataTree && _this45.table.options.dataTreeChildColumnCalcs) {
				if (row.modules.dataTree.open) {
					var children = _this45.rowsToData(_this45.table.modules.dataTree.getFilteredTreeChildren(row));
					data = data.concat(children);
				}
			}
		});

		return data;
	};

	//generate stats row
	ColumnCalcs.prototype.generateRow = function (pos, data) {
		var self = this,
		    rowData = this.generateRowData(pos, data),
		    row;

		if (self.table.modExists("mutator")) {
			self.table.modules.mutator.disable();
		}

		row = new Row(rowData, this, "calc");

		if (self.table.modExists("mutator")) {
			self.table.modules.mutator.enable();
		}

		row.getElement().classList.add("tabulator-calcs", "tabulator-calcs-" + pos);

		row.component = false;

		row.getComponent = function () {
			if (!this.component) {
				this.component = new CalcComponent(this);
			}

			return this.component;
		};

		row.generateCells = function () {

			var cells = [];

			self.table.columnManager.columnsByIndex.forEach(function (column) {

				//set field name of mock column
				self.genColumn.setField(column.getField());
				self.genColumn.hozAlign = column.hozAlign;

				if (column.definition[pos + "CalcFormatter"] && self.table.modExists("format")) {
					self.genColumn.modules.format = {
						formatter: self.table.modules.format.getFormatter(column.definition[pos + "CalcFormatter"]),
						params: column.definition[pos + "CalcFormatterParams"] || {}
					};
				} else {
					self.genColumn.modules.format = {
						formatter: self.table.modules.format.getFormatter("plaintext"),
						params: {}
					};
				}

				//ensure css class defintion is replicated to calculation cell
				self.genColumn.definition.cssClass = column.definition.cssClass;

				//generate cell and assign to correct column
				var cell = new Cell(self.genColumn, row);
				cell.getElement();
				cell.column = column;
				cell.setWidth();

				column.cells.push(cell);
				cells.push(cell);

				if (!column.visible) {
					cell.hide();
				}
			});

			this.cells = cells;
		};

		return row;
	};

	//generate stats row
	ColumnCalcs.prototype.generateRowData = function (pos, data) {
		var rowData = {},
		    calcs = pos == "top" ? this.topCalcs : this.botCalcs,
		    type = pos == "top" ? "topCalc" : "botCalc",
		    params,
		    paramKey;

		calcs.forEach(function (column) {
			var values = [];

			if (column.modules.columnCalcs && column.modules.columnCalcs[type]) {
				data.forEach(function (item) {
					values.push(column.getFieldValue(item));
				});

				paramKey = type + "Params";
				params = typeof column.modules.columnCalcs[paramKey] === "function" ? column.modules.columnCalcs[paramKey](values, data) : column.modules.columnCalcs[paramKey];

				column.setFieldValue(rowData, column.modules.columnCalcs[type](values, data, params));
			}
		});

		return rowData;
	};

	ColumnCalcs.prototype.hasTopCalcs = function () {
		return !!this.topCalcs.length;
	};

	ColumnCalcs.prototype.hasBottomCalcs = function () {
		return !!this.botCalcs.length;
	};

	//handle table redraw
	ColumnCalcs.prototype.redraw = function () {
		if (this.topRow) {
			this.topRow.normalizeHeight(true);
		}
		if (this.botRow) {
			this.botRow.normalizeHeight(true);
		}
	};

	//return the calculated
	ColumnCalcs.prototype.getResults = function () {
		var self = this,
		    results = {},
		    groups;

		if (this.table.options.groupBy && this.table.modExists("groupRows")) {
			groups = this.table.modules.groupRows.getGroups(true);

			groups.forEach(function (group) {
				results[group.getKey()] = self.getGroupResults(group);
			});
		} else {
			results = {
				top: this.topRow ? this.topRow.getData() : {},
				bottom: this.botRow ? this.botRow.getData() : {}
			};
		}

		return results;
	};

	//get results from a group
	ColumnCalcs.prototype.getGroupResults = function (group) {
		var self = this,
		    groupObj = group._getSelf(),
		    subGroups = group.getSubGroups(),
		    subGroupResults = {},
		    results = {};

		subGroups.forEach(function (subgroup) {
			subGroupResults[subgroup.getKey()] = self.getGroupResults(subgroup);
		});

		results = {
			top: groupObj.calcs.top ? groupObj.calcs.top.getData() : {},
			bottom: groupObj.calcs.bottom ? groupObj.calcs.bottom.getData() : {},
			groups: subGroupResults
		};

		return results;
	};

	//default calculations
	ColumnCalcs.prototype.calculations = {
		"avg": function avg(values, data, calcParams) {
			var output = 0,
			    precision = typeof calcParams.precision !== "undefined" ? calcParams.precision : 2;

			if (values.length) {
				output = values.reduce(function (sum, value) {
					return Number(sum) + Number(value);
				});

				output = output / values.length;

				output = precision !== false ? output.toFixed(precision) : output;
			}

			return parseFloat(output).toString();
		},
		"max": function max(values, data, calcParams) {
			var output = null,
			    precision = typeof calcParams.precision !== "undefined" ? calcParams.precision : false;

			values.forEach(function (value) {

				value = Number(value);

				if (value > output || output === null) {
					output = value;
				}
			});

			return output !== null ? precision !== false ? output.toFixed(precision) : output : "";
		},
		"min": function min(values, data, calcParams) {
			var output = null,
			    precision = typeof calcParams.precision !== "undefined" ? calcParams.precision : false;

			values.forEach(function (value) {

				value = Number(value);

				if (value < output || output === null) {
					output = value;
				}
			});

			return output !== null ? precision !== false ? output.toFixed(precision) : output : "";
		},
		"sum": function sum(values, data, calcParams) {
			var output = 0,
			    precision = typeof calcParams.precision !== "undefined" ? calcParams.precision : false;

			if (values.length) {
				values.forEach(function (value) {
					value = Number(value);

					output += !isNaN(value) ? Number(value) : 0;
				});
			}

			return precision !== false ? output.toFixed(precision) : output;
		},
		"concat": function concat(values, data, calcParams) {
			var output = 0;

			if (values.length) {
				output = values.reduce(function (sum, value) {
					return String(sum) + String(value);
				});
			}

			return output;
		},
		"count": function count(values, data, calcParams) {
			var output = 0;

			if (values.length) {
				values.forEach(function (value) {
					if (value) {
						output++;
					}
				});
			}

			return output;
		}
	};

	Tabulator.prototype.registerModule("columnCalcs", ColumnCalcs);

	var Clipboard = function Clipboard(table) {
		this.table = table;
		this.mode = true;

		this.pasteParser = function () {};
		this.pasteAction = function () {};
		this.customSelection = false;
		this.rowRange = false;
		this.blocked = true; //block copy actions not originating from this command
	};

	Clipboard.prototype.initialize = function () {
		var _this46 = this;

		this.mode = this.table.options.clipboard;

		this.rowRange = this.table.options.clipboardCopyRowRange;

		if (this.mode === true || this.mode === "copy") {
			this.table.element.addEventListener("copy", function (e) {
				var plain, html, list;

				if (!_this46.blocked) {
					e.preventDefault();

					if (_this46.customSelection) {
						plain = _this46.customSelection;

						if (_this46.table.options.clipboardCopyFormatter) {
							plain = _this46.table.options.clipboardCopyFormatter("plain", plain);
						}
					} else {

						var list = _this46.table.modules.export.generateExportList(_this46.table.options.clipboardCopyConfig, _this46.table.options.clipboardCopyStyled, _this46.rowRange, "clipboard");

						html = _this46.table.modules.export.genereateHTMLTable(list);
						plain = html ? _this46.generatePlainContent(list) : "";

						if (_this46.table.options.clipboardCopyFormatter) {
							plain = _this46.table.options.clipboardCopyFormatter("plain", plain);
							html = _this46.table.options.clipboardCopyFormatter("html", html);
						}
					}

					if (window.clipboardData && window.clipboardData.setData) {
						window.clipboardData.setData('Text', plain);
					} else if (e.clipboardData && e.clipboardData.setData) {
						e.clipboardData.setData('text/plain', plain);
						if (html) {
							e.clipboardData.setData('text/html', html);
						}
					} else if (e.originalEvent && e.originalEvent.clipboardData.setData) {
						e.originalEvent.clipboardData.setData('text/plain', plain);
						if (html) {
							e.originalEvent.clipboardData.setData('text/html', html);
						}
					}

					_this46.table.options.clipboardCopied.call(_this46.table, plain, html);

					_this46.reset();
				}
			});
		}

		if (this.mode === true || this.mode === "paste") {
			this.table.element.addEventListener("paste", function (e) {
				_this46.paste(e);
			});
		}

		this.setPasteParser(this.table.options.clipboardPasteParser);
		this.setPasteAction(this.table.options.clipboardPasteAction);
	};

	Clipboard.prototype.reset = function () {
		this.blocked = true;
		this.customSelection = false;
	};

	Clipboard.prototype.generatePlainContent = function (list) {
		var output = [];

		list.forEach(function (row) {
			var rowData = [];

			row.columns.forEach(function (col) {
				var value = "";

				if (col) {

					if (row.type === "group") {
						col.value = col.component.getKey();
					}

					if (col.value === null) {
						value = "";
					} else {
						switch (_typeof(col.value)) {
							case "object":
								value = JSON.stringify(col.value);
								break;

							case "undefined":
								value = "";
								break;

							default:
								value = col.value;
						}
					}
				}

				rowData.push(value);
			});

			output.push(rowData.join("\t"));
		});

		return output.join("\n");
	};

	Clipboard.prototype.copy = function (range, internal) {
		var range, sel, textRange;
		this.blocked = false;
		this.customSelection = false;

		if (this.mode === true || this.mode === "copy") {

			this.rowRange = range || this.table.options.clipboardCopyRowRange;

			if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
				range = document.createRange();
				range.selectNodeContents(this.table.element);
				sel = window.getSelection();

				if (sel.toString() && internal) {
					this.customSelection = sel.toString();
				}

				sel.removeAllRanges();
				sel.addRange(range);
			} else if (typeof document.selection != "undefined" && typeof document.body.createTextRange != "undefined") {
				textRange = document.body.createTextRange();
				textRange.moveToElementText(this.table.element);
				textRange.select();
			}

			document.execCommand('copy');

			if (sel) {
				sel.removeAllRanges();
			}
		}
	};

	//PASTE EVENT HANDLING

	Clipboard.prototype.setPasteAction = function (action) {

		switch (typeof action === 'undefined' ? 'undefined' : _typeof(action)) {
			case "string":
				this.pasteAction = this.pasteActions[action];

				if (!this.pasteAction) {
					console.warn("Clipboard Error - No such paste action found:", action);
				}
				break;

			case "function":
				this.pasteAction = action;
				break;
		}
	};

	Clipboard.prototype.setPasteParser = function (parser) {
		switch (typeof parser === 'undefined' ? 'undefined' : _typeof(parser)) {
			case "string":
				this.pasteParser = this.pasteParsers[parser];

				if (!this.pasteParser) {
					console.warn("Clipboard Error - No such paste parser found:", parser);
				}
				break;

			case "function":
				this.pasteParser = parser;
				break;
		}
	};

	Clipboard.prototype.paste = function (e) {
		var data, rowData, rows;

		if (this.checkPaseOrigin(e)) {

			data = this.getPasteData(e);

			rowData = this.pasteParser.call(this, data);

			if (rowData) {
				e.preventDefault();

				if (this.table.modExists("mutator")) {
					rowData = this.mutateData(rowData);
				}

				rows = this.pasteAction.call(this, rowData);
				this.table.options.clipboardPasted.call(this.table, data, rowData, rows);
			} else {
				this.table.options.clipboardPasteError.call(this.table, data);
			}
		}
	};

	Clipboard.prototype.mutateData = function (data) {
		var self = this,
		    output = [];

		if (Array.isArray(data)) {
			data.forEach(function (row) {
				output.push(self.table.modules.mutator.transformRow(row, "clipboard"));
			});
		} else {
			output = data;
		}

		return output;
	};

	Clipboard.prototype.checkPaseOrigin = function (e) {
		var valid = true;

		if (e.target.tagName != "DIV" || this.table.modules.edit.currentCell) {
			valid = false;
		}

		return valid;
	};

	Clipboard.prototype.getPasteData = function (e) {
		var data;

		if (window.clipboardData && window.clipboardData.getData) {
			data = window.clipboardData.getData('Text');
		} else if (e.clipboardData && e.clipboardData.getData) {
			data = e.clipboardData.getData('text/plain');
		} else if (e.originalEvent && e.originalEvent.clipboardData.getData) {
			data = e.originalEvent.clipboardData.getData('text/plain');
		}

		return data;
	};

	Clipboard.prototype.pasteParsers = {
		table: function table(clipboard) {
			var data = [],
			    success = false,
			    headerFindSuccess = true,
			    columns = this.table.columnManager.columns,
			    columnMap = [],
			    rows = [];

			//get data from clipboard into array of columns and rows.
			clipboard = clipboard.split("\n");

			clipboard.forEach(function (row) {
				data.push(row.split("\t"));
			});

			if (data.length && !(data.length === 1 && data[0].length < 2)) {
				success = true;

				//check if headers are present by title
				data[0].forEach(function (value) {
					var column = columns.find(function (column) {
						return value && column.definition.title && value.trim() && column.definition.title.trim() === value.trim();
					});

					if (column) {
						columnMap.push(column);
					} else {
						headerFindSuccess = false;
					}
				});

				//check if column headers are present by field
				if (!headerFindSuccess) {
					headerFindSuccess = true;
					columnMap = [];

					data[0].forEach(function (value) {
						var column = columns.find(function (column) {
							return value && column.field && value.trim() && column.field.trim() === value.trim();
						});

						if (column) {
							columnMap.push(column);
						} else {
							headerFindSuccess = false;
						}
					});

					if (!headerFindSuccess) {
						columnMap = this.table.columnManager.columnsByIndex;
					}
				}

				//remove header row if found
				if (headerFindSuccess) {
					data.shift();
				}

				data.forEach(function (item) {
					var row = {};

					item.forEach(function (value, i) {
						if (columnMap[i]) {
							row[columnMap[i].field] = value;
						}
					});

					rows.push(row);
				});

				return rows;
			} else {
				return false;
			}
		}
	};

	Clipboard.prototype.pasteActions = {
		replace: function replace(rows) {
			return this.table.setData(rows);
		},
		update: function update(rows) {
			return this.table.updateOrAddData(rows);
		},
		insert: function insert(rows) {
			return this.table.addData(rows);
		}
	};

	Tabulator.prototype.registerModule("clipboard", Clipboard);

	var DataTree = function DataTree(table) {
		this.table = table;
		this.indent = 10;
		this.field = "";
		this.collapseEl = null;
		this.expandEl = null;
		this.branchEl = null;
		this.elementField = false;

		this.startOpen = function () {};

		this.displayIndex = 0;
	};

	DataTree.prototype.initialize = function () {
		var dummyEl = null,
		    firstCol = this.table.columnManager.getFirstVisibileColumn(),
		    options = this.table.options;

		this.field = options.dataTreeChildField;
		this.indent = options.dataTreeChildIndent;
		this.elementField = options.dataTreeElementColumn || (firstCol ? firstCol.field : false);

		if (options.dataTreeBranchElement) {

			if (options.dataTreeBranchElement === true) {
				this.branchEl = document.createElement("div");
				this.branchEl.classList.add("tabulator-data-tree-branch");
			} else {
				if (typeof options.dataTreeBranchElement === "string") {
					dummyEl = document.createElement("div");
					dummyEl.innerHTML = options.dataTreeBranchElement;
					this.branchEl = dummyEl.firstChild;
				} else {
					this.branchEl = options.dataTreeBranchElement;
				}
			}
		}

		if (options.dataTreeCollapseElement) {
			if (typeof options.dataTreeCollapseElement === "string") {
				dummyEl = document.createElement("div");
				dummyEl.innerHTML = options.dataTreeCollapseElement;
				this.collapseEl = dummyEl.firstChild;
			} else {
				this.collapseEl = options.dataTreeCollapseElement;
			}
		} else {
			this.collapseEl = document.createElement("div");
			this.collapseEl.classList.add("tabulator-data-tree-control");
			this.collapseEl.tabIndex = 0;
			this.collapseEl.innerHTML = "<div class='tabulator-data-tree-control-collapse'></div>";
		}

		if (options.dataTreeExpandElement) {
			if (typeof options.dataTreeExpandElement === "string") {
				dummyEl = document.createElement("div");
				dummyEl.innerHTML = options.dataTreeExpandElement;
				this.expandEl = dummyEl.firstChild;
			} else {
				this.expandEl = options.dataTreeExpandElement;
			}
		} else {
			this.expandEl = document.createElement("div");
			this.expandEl.classList.add("tabulator-data-tree-control");
			this.expandEl.tabIndex = 0;
			this.expandEl.innerHTML = "<div class='tabulator-data-tree-control-expand'></div>";
		}

		switch (_typeof(options.dataTreeStartExpanded)) {
			case "boolean":
				this.startOpen = function (row, index) {
					return options.dataTreeStartExpanded;
				};
				break;

			case "function":
				this.startOpen = options.dataTreeStartExpanded;
				break;

			default:
				this.startOpen = function (row, index) {
					return options.dataTreeStartExpanded[index];
				};
				break;
		}
	};

	DataTree.prototype.initializeRow = function (row) {
		var childArray = row.getData()[this.field];
		var isArray = Array.isArray(childArray);

		var children = isArray || !isArray && (typeof childArray === 'undefined' ? 'undefined' : _typeof(childArray)) === "object" && childArray !== null;

		if (!children && row.modules.dataTree && row.modules.dataTree.branchEl) {
			row.modules.dataTree.branchEl.parentNode.removeChild(row.modules.dataTree.branchEl);
		}

		if (!children && row.modules.dataTree && row.modules.dataTree.controlEl) {
			row.modules.dataTree.controlEl.parentNode.removeChild(row.modules.dataTree.controlEl);
		}

		row.modules.dataTree = {
			index: row.modules.dataTree ? row.modules.dataTree.index : 0,
			open: children ? row.modules.dataTree ? row.modules.dataTree.open : this.startOpen(row.getComponent(), 0) : false,
			controlEl: row.modules.dataTree && children ? row.modules.dataTree.controlEl : false,
			branchEl: row.modules.dataTree && children ? row.modules.dataTree.branchEl : false,
			parent: row.modules.dataTree ? row.modules.dataTree.parent : false,
			children: children
		};
	};

	DataTree.prototype.layoutRow = function (row) {
		var cell = this.elementField ? row.getCell(this.elementField) : row.getCells()[0],
		    el = cell.getElement(),
		    config = row.modules.dataTree;

		if (config.branchEl) {
			if (config.branchEl.parentNode) {
				config.branchEl.parentNode.removeChild(config.branchEl);
			}
			config.branchEl = false;
		}

		if (config.controlEl) {
			if (config.controlEl.parentNode) {
				config.controlEl.parentNode.removeChild(config.controlEl);
			}
			config.controlEl = false;
		}

		this.generateControlElement(row, el);

		row.getElement().classList.add("tabulator-tree-level-" + config.index);

		if (config.index) {
			if (this.branchEl) {
				config.branchEl = this.branchEl.cloneNode(true);
				el.insertBefore(config.branchEl, el.firstChild);

				if (this.table.rtl) {
					config.branchEl.style.marginRight = (config.branchEl.offsetWidth + config.branchEl.style.marginLeft) * (config.index - 1) + config.index * this.indent + "px";
				} else {
					config.branchEl.style.marginLeft = (config.branchEl.offsetWidth + config.branchEl.style.marginRight) * (config.index - 1) + config.index * this.indent + "px";
				}
			} else {

				if (this.table.rtl) {
					el.style.paddingRight = parseInt(window.getComputedStyle(el, null).getPropertyValue('padding-right')) + config.index * this.indent + "px";
				} else {
					el.style.paddingLeft = parseInt(window.getComputedStyle(el, null).getPropertyValue('padding-left')) + config.index * this.indent + "px";
				}
			}
		}
	};

	DataTree.prototype.generateControlElement = function (row, el) {
		var _this47 = this;

		var config = row.modules.dataTree,
		    el = el || row.getCells()[0].getElement(),
		    oldControl = config.controlEl;

		if (config.children !== false) {

			if (config.open) {
				config.controlEl = this.collapseEl.cloneNode(true);
				config.controlEl.addEventListener("click", function (e) {
					e.stopPropagation();
					_this47.collapseRow(row);
				});
			} else {
				config.controlEl = this.expandEl.cloneNode(true);
				config.controlEl.addEventListener("click", function (e) {
					e.stopPropagation();
					_this47.expandRow(row);
				});
			}

			config.controlEl.addEventListener("mousedown", function (e) {
				e.stopPropagation();
			});

			if (oldControl && oldControl.parentNode === el) {
				oldControl.parentNode.replaceChild(config.controlEl, oldControl);
			} else {
				el.insertBefore(config.controlEl, el.firstChild);
			}
		}
	};

	DataTree.prototype.setDisplayIndex = function (index) {
		this.displayIndex = index;
	};

	DataTree.prototype.getDisplayIndex = function () {
		return this.displayIndex;
	};

	DataTree.prototype.getRows = function (rows) {
		var _this48 = this;

		var output = [];

		rows.forEach(function (row, i) {
			var config, children;

			output.push(row);

			if (row instanceof Row) {

				row.create();

				config = row.modules.dataTree.children;

				if (!config.index && config.children !== false) {
					children = _this48.getChildren(row);

					children.forEach(function (child) {
						child.create();
						output.push(child);
					});
				}
			}
		});

		return output;
	};

	DataTree.prototype.getChildren = function (row, allChildren) {
		var _this49 = this;

		var config = row.modules.dataTree,
		    children = [],
		    output = [];

		if (config.children !== false && (config.open || allChildren)) {
			if (!Array.isArray(config.children)) {
				config.children = this.generateChildren(row);
			}

			if (this.table.modExists("filter") && this.table.options.dataTreeFilter) {
				children = this.table.modules.filter.filter(config.children);
			} else {
				children = config.children;
			}

			if (this.table.modExists("sort") && this.table.options.dataTreeSort) {
				this.table.modules.sort.sort(children);
			}

			children.forEach(function (child) {
				output.push(child);

				var subChildren = _this49.getChildren(child);

				subChildren.forEach(function (sub) {
					output.push(sub);
				});
			});
		}

		return output;
	};

	DataTree.prototype.generateChildren = function (row) {
		var _this50 = this;

		var children = [];

		var childArray = row.getData()[this.field];

		if (!Array.isArray(childArray)) {
			childArray = [childArray];
		}

		childArray.forEach(function (childData) {
			var childRow = new Row(childData || {}, _this50.table.rowManager);

			childRow.create();

			childRow.modules.dataTree.index = row.modules.dataTree.index + 1;
			childRow.modules.dataTree.parent = row;

			if (childRow.modules.dataTree.children) {
				childRow.modules.dataTree.open = _this50.startOpen(childRow.getComponent(), childRow.modules.dataTree.index);
			}
			children.push(childRow);
		});

		return children;
	};

	DataTree.prototype.expandRow = function (row, silent) {
		var config = row.modules.dataTree;

		if (config.children !== false) {
			config.open = true;

			row.reinitialize();

			this.table.rowManager.refreshActiveData("tree", false, true);

			this.table.options.dataTreeRowExpanded(row.getComponent(), row.modules.dataTree.index);
		}
	};

	DataTree.prototype.collapseRow = function (row) {
		var config = row.modules.dataTree;

		if (config.children !== false) {
			config.open = false;

			row.reinitialize();

			this.table.rowManager.refreshActiveData("tree", false, true);

			this.table.options.dataTreeRowCollapsed(row.getComponent(), row.modules.dataTree.index);
		}
	};

	DataTree.prototype.toggleRow = function (row) {
		var config = row.modules.dataTree;

		if (config.children !== false) {
			if (config.open) {
				this.collapseRow(row);
			} else {
				this.expandRow(row);
			}
		}
	};

	DataTree.prototype.getTreeParent = function (row) {
		return row.modules.dataTree.parent ? row.modules.dataTree.parent.getComponent() : false;
	};

	DataTree.prototype.getFilteredTreeChildren = function (row) {
		var config = row.modules.dataTree,
		    output = [],
		    children;

		if (config.children) {

			if (!Array.isArray(config.children)) {
				config.children = this.generateChildren(row);
			}

			if (this.table.modExists("filter") && this.table.options.dataTreeFilter) {
				children = this.table.modules.filter.filter(config.children);
			} else {
				children = config.children;
			}

			children.forEach(function (childRow) {
				if (childRow instanceof Row) {
					output.push(childRow);
				}
			});
		}

		return output;
	};

	DataTree.prototype.rowDelete = function (row) {
		var parent = row.modules.dataTree.parent,
		    childIndex;

		if (parent) {
			childIndex = this.findChildIndex(row, parent);

			if (childIndex !== false) {
				parent.data[this.field].splice(childIndex, 1);
			}

			if (!parent.data[this.field].length) {
				delete parent.data[this.field];
			}

			this.initializeRow(parent);
			this.layoutRow(parent);
		}

		this.table.rowManager.refreshActiveData("tree", false, true);
	};

	DataTree.prototype.addTreeChildRow = function (row, data, top, index) {
		var childIndex = false;

		if (typeof data === "string") {
			data = JSON.parse(data);
		}

		if (!Array.isArray(row.data[this.field])) {
			row.data[this.field] = [];

			row.modules.dataTree.open = this.startOpen(row.getComponent(), row.modules.dataTree.index);
		}

		if (typeof index !== "undefined") {
			childIndex = this.findChildIndex(index, row);

			if (childIndex !== false) {
				row.data[this.field].splice(top ? childIndex : childIndex + 1, 0, data);
			}
		}

		if (childIndex === false) {
			if (top) {
				row.data[this.field].unshift(data);
			} else {
				row.data[this.field].push(data);
			}
		}

		this.initializeRow(row);
		this.layoutRow(row);

		this.table.rowManager.refreshActiveData("tree", false, true);
	};

	DataTree.prototype.findChildIndex = function (subject, parent) {
		var _this51 = this;

		var match = false;

		if ((typeof subject === 'undefined' ? 'undefined' : _typeof(subject)) == "object") {

			if (subject instanceof Row) {
				//subject is row element
				match = subject.data;
			} else if (subject instanceof RowComponent) {
				//subject is public row component
				match = subject._getSelf().data;
			} else if (typeof HTMLElement !== "undefined" && subject instanceof HTMLElement) {
				if (parent.modules.dataTree) {
					match = parent.modules.dataTree.children.find(function (childRow) {
						return childRow instanceof Row ? childRow.element === subject : false;
					});

					if (match) {
						match = match.data;
					}
				}
			}
		} else if (typeof subject == "undefined" || subject === null) {
			match = false;
		} else {
			//subject should be treated as the index of the row
			match = parent.data[this.field].find(function (row) {
				return row.data[_this51.table.options.index] == subject;
			});
		}

		if (match) {

			if (Array.isArray(parent.data[this.field])) {
				match = parent.data[this.field].indexOf(match);
			}

			if (match == -1) {
				match = false;
			}
		}

		//catch all for any other type of input

		return match;
	};

	DataTree.prototype.getTreeChildren = function (row, component, recurse) {
		var _this52 = this;

		var config = row.modules.dataTree,
		    output = [];

		if (config.children) {

			if (!Array.isArray(config.children)) {
				config.children = this.generateChildren(row);
			}

			config.children.forEach(function (childRow) {
				if (childRow instanceof Row) {
					output.push(component ? childRow.getComponent() : childRow);

					if (recurse) {
						output = output.concat(_this52.getTreeChildren(childRow, component, recurse));
					}
				}
			});
		}

		return output;
	};

	DataTree.prototype.checkForRestyle = function (cell) {
		if (!cell.row.cells.indexOf(cell)) {
			cell.row.reinitialize();
		}
	};

	DataTree.prototype.getChildField = function () {
		return this.field;
	};

	DataTree.prototype.redrawNeeded = function (data) {
		return (this.field ? typeof data[this.field] !== "undefined" : false) || (this.elementField ? typeof data[this.elementField] !== "undefined" : false);
	};

	Tabulator.prototype.registerModule("dataTree", DataTree);

	var Download = function Download(table) {
		this.table = table; //hold Tabulator object
	};

	//trigger file download
	Download.prototype.download = function (type, filename, options, range, interceptCallback) {
		var self = this,
		    downloadFunc = false;

		function buildLink(data, mime) {
			if (interceptCallback) {
				if (interceptCallback === true) {
					self.triggerDownload(data, mime, type, filename, true);
				} else {
					interceptCallback(data);
				}
			} else {
				self.triggerDownload(data, mime, type, filename);
			}
		}

		if (typeof type == "function") {
			downloadFunc = type;
		} else {
			if (self.downloaders[type]) {
				downloadFunc = self.downloaders[type];
			} else {
				console.warn("Download Error - No such download type found: ", type);
			}
		}

		if (downloadFunc) {
			var list = this.generateExportList(range);

			downloadFunc.call(this.table, list, options || {}, buildLink);
		}
	};

	Download.prototype.generateExportList = function (range) {
		var list = this.table.modules.export.generateExportList(this.table.options.downloadConfig, false, range || this.table.options.downloadRowRange, "download");

		//assign group header formatter
		var groupHeader = this.table.options.groupHeaderDownload;

		if (groupHeader && !Array.isArray(groupHeader)) {
			groupHeader = [groupHeader];
		}

		list.forEach(function (row) {
			var group;

			if (row.type === "group") {
				group = row.columns[0];

				if (groupHeader && groupHeader[row.indent]) {
					group.value = groupHeader[row.indent](group.value, row.component._group.getRowCount(), row.component._group.getData(), row.component);
				}
			}
		});

		return list;
	};

	Download.prototype.triggerDownload = function (data, mime, type, filename, newTab) {
		var element = document.createElement('a'),
		    blob = new Blob([data], { type: mime }),
		    filename = filename || "Tabulator." + (typeof type === "function" ? "txt" : type);

		blob = this.table.options.downloadReady.call(this.table, data, blob);

		if (blob) {

			if (newTab) {
				window.open(window.URL.createObjectURL(blob));
			} else {
				if (navigator.msSaveOrOpenBlob) {
					navigator.msSaveOrOpenBlob(blob, filename);
				} else {
					element.setAttribute('href', window.URL.createObjectURL(blob));

					//set file title
					element.setAttribute('download', filename);

					//trigger download
					element.style.display = 'none';
					document.body.appendChild(element);
					element.click();

					//remove temporary link element
					document.body.removeChild(element);
				}
			}

			if (this.table.options.downloadComplete) {
				this.table.options.downloadComplete();
			}
		}
	};

	Download.prototype.commsReceived = function (table, action, data) {
		switch (action) {
			case "intercept":
				this.download(data.type, "", data.options, data.active, data.intercept);
				break;
		}
	};

	//downloaders
	Download.prototype.downloaders = {
		csv: function csv(list, options, setFileContents) {
			var delimiter = options && options.delimiter ? options.delimiter : ",",
			    fileContents = [],
			    headers = [];

			list.forEach(function (row) {
				var item = [];

				switch (row.type) {
					case "group":
						console.warn("Download Warning - CSV downloader cannot process row groups");
						break;

					case "calc":
						console.warn("Download Warning - CSV downloader cannot process column calculations");
						break;

					case "header":
						row.columns.forEach(function (col, i) {
							if (col && col.depth === 1) {
								headers[i] = typeof col.value == "undefined" || col.value === null ? "" : '"' + String(col.value).split('"').join('""') + '"';
							}
						});
						break;

					case "row":
						row.columns.forEach(function (col) {

							if (col) {

								switch (_typeof(col.value)) {
									case "object":
										col.value = JSON.stringify(col.value);
										break;

									case "undefined":
									case "null":
										col.value = "";
										break;
								}

								item.push('"' + String(col.value).split('"').join('""') + '"');
							}
						});

						fileContents.push(item.join(delimiter));
						break;
				}
			});

			if (headers.length) {
				fileContents.unshift(headers.join(delimiter));
			}

			fileContents = fileContents.join("\n");

			if (options.bom) {
				fileContents = '\uFEFF' + fileContents;
			}

			setFileContents(fileContents, "text/csv");
		},

		json: function json(list, options, setFileContents) {
			var fileContents = [];

			list.forEach(function (row) {
				var item = {};

				switch (row.type) {
					case "header":
						break;

					case "group":
						console.warn("Download Warning - JSON downloader cannot process row groups");
						break;

					case "calc":
						console.warn("Download Warning - JSON downloader cannot process column calculations");
						break;

					case "row":
						row.columns.forEach(function (col) {
							if (col) {
								item[col.component.getField()] = col.value;
							}
						});

						fileContents.push(item);
						break;
				}
			});

			fileContents = JSON.stringify(fileContents, null, '\t');

			setFileContents(fileContents, "application/json");
		},

		pdf: function pdf(list, options, setFileContents) {
			var header = [],
			    body = [],
			    autoTableParams = {},
			    rowGroupStyles = options.rowGroupStyles || {
				fontStyle: "bold",
				fontSize: 12,
				cellPadding: 6,
				fillColor: 220
			},
			    rowCalcStyles = options.rowCalcStyles || {
				fontStyle: "bold",
				fontSize: 10,
				cellPadding: 4,
				fillColor: 232
			},
			    jsPDFParams = options.jsPDF || {},
			    title = options && options.title ? options.title : "";

			if (!jsPDFParams.orientation) {
				jsPDFParams.orientation = options.orientation || "landscape";
			}

			if (!jsPDFParams.unit) {
				jsPDFParams.unit = "pt";
			}

			//parse row list
			list.forEach(function (row) {
				var item = {};

				switch (row.type) {
					case "header":
						header.push(parseRow(row));
						break;

					case "group":
						body.push(parseRow(row, rowGroupStyles));
						break;

					case "calc":
						body.push(parseRow(row, rowCalcStyles));
						break;

					case "row":
						body.push(parseRow(row));
						break;
				}
			});

			function parseRow(row, styles) {
				var rowData = [];

				row.columns.forEach(function (col) {
					var cell;

					if (col) {
						switch (_typeof(col.value)) {
							case "object":
								col.value = JSON.stringify(col.value);
								break;

							case "undefined":
							case "null":
								col.value = "";
								break;
						}

						cell = {
							content: col.value,
							colSpan: col.width,
							rowSpan: col.height
						};

						if (styles) {
							cell.styles = styles;
						}

						rowData.push(cell);
					} else {
						rowData.push("");
					}
				});

				return rowData;
			}

			//configure PDF
			var doc = new jsPDF(jsPDFParams); //set document to landscape, better for most tables

			if (options && options.autoTable) {
				if (typeof options.autoTable === "function") {
					autoTableParams = options.autoTable(doc) || {};
				} else {
					autoTableParams = options.autoTable;
				}
			}

			if (title) {
				autoTableParams.addPageContent = function (data) {
					doc.text(title, 40, 30);
				};
			}

			autoTableParams.head = header;
			autoTableParams.body = body;

			doc.autoTable(autoTableParams);

			if (options && options.documentProcessing) {
				options.documentProcessing(doc);
			}

			setFileContents(doc.output("arraybuffer"), "application/pdf");
		},

		xlsx: function xlsx(list, options, setFileContents) {
			var self = this,
			    sheetName = options.sheetName || "Sheet1",
			    workbook = XLSX.utils.book_new(),
			    output;

			workbook.SheetNames = [];
			workbook.Sheets = {};

			function generateSheet() {
				var rows = [],
				    merges = [],
				    worksheet = {},
				    range = { s: { c: 0, r: 0 }, e: { c: list[0] ? list[0].columns.reduce(function (a, b) {
							return a + (b && b.width ? b.width : 1);
						}, 0) : 0, r: list.length } };

				//parse row list
				list.forEach(function (row, i) {
					var rowData = [];

					row.columns.forEach(function (col, j) {

						if (col) {
							rowData.push(!(col.value instanceof Date) && _typeof(col.value) === "object" ? JSON.stringify(col.value) : col.value);

							if (col.width > 1 || col.height > -1) {
								merges.push({ s: { r: i, c: j }, e: { r: i + col.height - 1, c: j + col.width - 1 } });
							}
						} else {
							rowData.push("");
						}
					});

					rows.push(rowData);
				});

				//convert rows to worksheet
				XLSX.utils.sheet_add_aoa(worksheet, rows);

				worksheet['!ref'] = XLSX.utils.encode_range(range);

				if (merges.length) {
					worksheet["!merges"] = merges;
				}

				return worksheet;
			}

			if (options.sheetOnly) {
				setFileContents(generateSheet());
				return;
			}

			if (options.sheets) {
				for (var sheet in options.sheets) {

					if (options.sheets[sheet] === true) {
						workbook.SheetNames.push(sheet);
						workbook.Sheets[sheet] = generateSheet();
					} else {

						workbook.SheetNames.push(sheet);

						this.modules.comms.send(options.sheets[sheet], "download", "intercept", {
							type: "xlsx",
							options: { sheetOnly: true },
							active: self.active,
							intercept: function intercept(data) {
								workbook.Sheets[sheet] = data;
							}
						});
					}
				}
			} else {
				workbook.SheetNames.push(sheetName);
				workbook.Sheets[sheetName] = generateSheet();
			}

			if (options.documentProcessing) {
				workbook = options.documentProcessing(workbook);
			}

			//convert workbook to binary array
			function s2ab(s) {
				var buf = new ArrayBuffer(s.length);
				var view = new Uint8Array(buf);
				for (var i = 0; i != s.length; ++i) {
					view[i] = s.charCodeAt(i) & 0xFF;
				}return buf;
			}

			output = XLSX.write(workbook, { bookType: 'xlsx', bookSST: true, type: 'binary' });

			setFileContents(s2ab(output), "application/octet-stream");
		},

		html: function html(list, options, setFileContents) {
			if (this.modExists("export", true)) {
				setFileContents(this.modules.export.genereateHTMLTable(list), "text/html");
			}
		}

	};

	Tabulator.prototype.registerModule("download", Download);

	var Edit = function Edit(table) {
		this.table = table; //hold Tabulator object
		this.currentCell = false; //hold currently editing cell
		this.mouseClick = false; //hold mousedown state to prevent click binding being overriden by editor opening
		this.recursionBlock = false; //prevent focus recursion
		this.invalidEdit = false;
		this.editedCells = [];
	};

	//initialize column editor
	Edit.prototype.initializeColumn = function (column) {
		var self = this,
		    config = {
			editor: false,
			blocked: false,
			check: column.definition.editable,
			params: column.definition.editorParams || {}
		};

		//set column editor
		switch (_typeof(column.definition.editor)) {
			case "string":

				if (column.definition.editor === "tick") {
					column.definition.editor = "tickCross";
					console.warn("DEPRECATION WARNING - the tick editor has been deprecated, please use the tickCross editor");
				}

				if (self.editors[column.definition.editor]) {
					config.editor = self.editors[column.definition.editor];
				} else {
					console.warn("Editor Error - No such editor found: ", column.definition.editor);
				}
				break;

			case "function":
				config.editor = column.definition.editor;
				break;

			case "boolean":

				if (column.definition.editor === true) {

					if (typeof column.definition.formatter !== "function") {

						if (column.definition.formatter === "tick") {
							column.definition.formatter = "tickCross";
							console.warn("DEPRECATION WARNING - the tick editor has been deprecated, please use the tickCross editor");
						}

						if (self.editors[column.definition.formatter]) {
							config.editor = self.editors[column.definition.formatter];
						} else {
							config.editor = self.editors["input"];
						}
					} else {
						console.warn("Editor Error - Cannot auto lookup editor for a custom formatter: ", column.definition.formatter);
					}
				}
				break;
		}

		if (config.editor) {
			column.modules.edit = config;
		}
	};

	Edit.prototype.getCurrentCell = function () {
		return this.currentCell ? this.currentCell.getComponent() : false;
	};

	Edit.prototype.clearEditor = function (cancel) {
		var cell = this.currentCell,
		    cellEl;

		this.invalidEdit = false;

		if (cell) {
			this.currentCell = false;

			cellEl = cell.getElement();

			if (cancel) {
				cell.validate();
			} else {
				cellEl.classList.remove("tabulator-validation-fail");
			}

			cellEl.classList.remove("tabulator-editing");
			while (cellEl.firstChild) {
				cellEl.removeChild(cellEl.firstChild);
			}cell.row.getElement().classList.remove("tabulator-row-editing");
		}
	};

	Edit.prototype.cancelEdit = function () {

		if (this.currentCell) {
			var cell = this.currentCell;
			var component = this.currentCell.getComponent();

			this.clearEditor(true);
			cell.setValueActual(cell.getValue());
			cell.cellRendered();

			if (cell.column.definition.editor == "textarea" || cell.column.definition.variableHeight) {
				cell.row.normalizeHeight(true);
			}

			if (cell.column.cellEvents.cellEditCancelled) {
				cell.column.cellEvents.cellEditCancelled.call(this.table, component);
			}

			this.table.options.cellEditCancelled.call(this.table, component);
		}
	};

	//return a formatted value for a cell
	Edit.prototype.bindEditor = function (cell) {
		var self = this,
		    element = cell.getElement(true);

		element.setAttribute("tabindex", 0);

		element.addEventListener("click", function (e) {
			if (!element.classList.contains("tabulator-editing")) {
				element.focus({ preventScroll: true });
			}
		});

		element.addEventListener("mousedown", function (e) {
			if (e.button === 2) {
				e.preventDefault();
			} else {
				self.mouseClick = true;
			}
		});

		element.addEventListener("focus", function (e) {
			if (!self.recursionBlock) {
				self.edit(cell, e, false);
			}
		});
	};

	Edit.prototype.focusCellNoEvent = function (cell, block) {
		this.recursionBlock = true;
		if (!(block && this.table.browser === "ie")) {
			cell.getElement().focus({ preventScroll: true });
		}
		this.recursionBlock = false;
	};

	Edit.prototype.editCell = function (cell, forceEdit) {
		this.focusCellNoEvent(cell);
		this.edit(cell, false, forceEdit);
	};

	Edit.prototype.focusScrollAdjust = function (cell) {
		if (this.table.rowManager.getRenderMode() == "virtual") {
			var topEdge = this.table.rowManager.element.scrollTop,
			    bottomEdge = this.table.rowManager.element.clientHeight + this.table.rowManager.element.scrollTop,
			    rowEl = cell.row.getElement(),
			    offset = rowEl.offsetTop;

			if (rowEl.offsetTop < topEdge) {
				this.table.rowManager.element.scrollTop -= topEdge - rowEl.offsetTop;
			} else {
				if (rowEl.offsetTop + rowEl.offsetHeight > bottomEdge) {
					this.table.rowManager.element.scrollTop += rowEl.offsetTop + rowEl.offsetHeight - bottomEdge;
				}
			}

			var leftEdge = this.table.rowManager.element.scrollLeft,
			    rightEdge = this.table.rowManager.element.clientWidth + this.table.rowManager.element.scrollLeft,
			    cellEl = cell.getElement(),
			    offset = cellEl.offsetLeft;

			if (this.table.modExists("frozenColumns")) {
				leftEdge += parseInt(this.table.modules.frozenColumns.leftMargin);
				rightEdge -= parseInt(this.table.modules.frozenColumns.rightMargin);
			}

			if (this.table.options.virtualDomHoz) {
				leftEdge -= parseInt(this.table.vdomHoz.vDomPadLeft);
				rightEdge -= parseInt(this.table.vdomHoz.vDomPadLeft);
			}

			if (cellEl.offsetLeft < leftEdge) {

				this.table.rowManager.element.scrollLeft -= leftEdge - cellEl.offsetLeft;
			} else {
				if (cellEl.offsetLeft + cellEl.offsetWidth > rightEdge) {
					this.table.rowManager.element.scrollLeft += cellEl.offsetLeft + cellEl.offsetWidth - rightEdge;
				}
			}
		}
	};

	Edit.prototype.edit = function (cell, e, forceEdit) {
		var self = this,
		    allowEdit = true,
		    rendered = function rendered() {},
		    element = cell.getElement(),
		    cellEditor,
		    component,
		    params;

		//prevent editing if another cell is refusing to leave focus (eg. validation fail)
		if (this.currentCell) {
			if (!this.invalidEdit) {
				this.cancelEdit();
			}
			return;
		}

		//handle successfull value change
		function success(value) {
			if (self.currentCell === cell) {
				var valid = true;

				if (cell.column.modules.validate && self.table.modExists("validate") && self.table.options.validationMode != "manual") {
					valid = self.table.modules.validate.validate(cell.column.modules.validate, cell, value);
				}

				if (valid === true || self.table.options.validationMode === "highlight") {
					self.clearEditor();

					if (!cell.modules.edit) {
						cell.modules.edit = {};
					}

					cell.modules.edit.edited = true;

					if (self.editedCells.indexOf(cell) == -1) {
						self.editedCells.push(cell);
					}

					cell.setValue(value, true);

					if (self.table.options.dataTree && self.table.modExists("dataTree")) {
						self.table.modules.dataTree.checkForRestyle(cell);
					}

					if (valid !== true) {
						element.classList.add("tabulator-validation-fail");
						self.table.options.validationFailed.call(self.table, cell.getComponent(), value, valid);
						return false;
					}

					return true;
				} else {
					self.invalidEdit = true;
					element.classList.add("tabulator-validation-fail");
					self.focusCellNoEvent(cell, true);
					rendered();
					self.table.options.validationFailed.call(self.table, cell.getComponent(), value, valid);

					return false;
				}
			} else {
				// console.warn("Edit Success Error - cannot call success on a cell that is no longer being edited");
			}
		}

		//handle aborted edit
		function cancel() {
			if (self.currentCell === cell) {
				self.cancelEdit();

				if (self.table.options.dataTree && self.table.modExists("dataTree")) {
					self.table.modules.dataTree.checkForRestyle(cell);
				}
			} else {
				// console.warn("Edit Success Error - cannot call cancel on a cell that is no longer being edited");
			}
		}

		function onRendered(callback) {
			rendered = callback;
		}

		if (!cell.column.modules.edit.blocked) {
			if (e) {
				e.stopPropagation();
			}

			switch (_typeof(cell.column.modules.edit.check)) {
				case "function":
					allowEdit = cell.column.modules.edit.check(cell.getComponent());
					break;

				case "boolean":
					allowEdit = cell.column.modules.edit.check;
					break;
			}

			if (allowEdit || forceEdit) {

				self.cancelEdit();

				self.currentCell = cell;

				this.focusScrollAdjust(cell);

				component = cell.getComponent();

				if (this.mouseClick) {
					this.mouseClick = false;

					if (cell.column.cellEvents.cellClick) {
						cell.column.cellEvents.cellClick.call(this.table, e, component);
					}
				}

				if (cell.column.cellEvents.cellEditing) {
					cell.column.cellEvents.cellEditing.call(this.table, component);
				}

				self.table.options.cellEditing.call(this.table, component);

				params = typeof cell.column.modules.edit.params === "function" ? cell.column.modules.edit.params(component) : cell.column.modules.edit.params;

				cellEditor = cell.column.modules.edit.editor.call(self, component, onRendered, success, cancel, params);

				//if editor returned, add to DOM, if false, abort edit
				if (cellEditor !== false) {

					if (cellEditor instanceof Node) {
						element.classList.add("tabulator-editing");
						cell.row.getElement().classList.add("tabulator-row-editing");
						while (element.firstChild) {
							element.removeChild(element.firstChild);
						}element.appendChild(cellEditor);

						//trigger onRendered Callback
						rendered();

						//prevent editing from triggering rowClick event
						var children = element.children;

						for (var i = 0; i < children.length; i++) {
							children[i].addEventListener("click", function (e) {
								e.stopPropagation();
							});
						}
					} else {
						console.warn("Edit Error - Editor should return an instance of Node, the editor returned:", cellEditor);
						element.blur();
						return false;
					}
				} else {
					element.blur();
					return false;
				}

				return true;
			} else {
				this.mouseClick = false;
				element.blur();
				return false;
			}
		} else {
			this.mouseClick = false;
			element.blur();
			return false;
		}
	};

	Edit.prototype.maskInput = function (el, options) {
		var mask = options.mask,
		    maskLetter = typeof options.maskLetterChar !== "undefined" ? options.maskLetterChar : "A",
		    maskNumber = typeof options.maskNumberChar !== "undefined" ? options.maskNumberChar : "9",
		    maskWildcard = typeof options.maskWildcardChar !== "undefined" ? options.maskWildcardChar : "*",
		    success = false;

		function fillSymbols(index) {
			var symbol = mask[index];
			if (typeof symbol !== "undefined" && symbol !== maskWildcard && symbol !== maskLetter && symbol !== maskNumber) {
				el.value = el.value + "" + symbol;
				fillSymbols(index + 1);
			}
		}

		el.addEventListener("keydown", function (e) {
			var index = el.value.length,
			    char = e.key;

			if (e.keyCode > 46) {
				if (index >= mask.length) {
					e.preventDefault();
					e.stopPropagation();
					success = false;
					return false;
				} else {
					switch (mask[index]) {
						case maskLetter:
							if (char.toUpperCase() == char.toLowerCase()) {
								e.preventDefault();
								e.stopPropagation();
								success = false;
								return false;
							}
							break;

						case maskNumber:
							if (isNaN(char)) {
								e.preventDefault();
								e.stopPropagation();
								success = false;
								return false;
							}
							break;

						case maskWildcard:
							break;

						default:
							if (char !== mask[index]) {
								e.preventDefault();
								e.stopPropagation();
								success = false;
								return false;
							}
					}
				}

				success = true;
			}

			return;
		});

		el.addEventListener("keyup", function (e) {
			if (e.keyCode > 46) {
				if (options.maskAutoFill) {
					fillSymbols(el.value.length);
				}
			}
		});

		if (!el.placeholder) {
			el.placeholder = mask;
		}

		if (options.maskAutoFill) {
			fillSymbols(el.value.length);
		}
	};

	Edit.prototype.getEditedCells = function () {
		var output = [];

		this.editedCells.forEach(function (cell) {
			output.push(cell.getComponent());
		});

		return output;
	};

	Edit.prototype.clearEdited = function (cell) {
		var editIndex;

		if (cell.modules.edit && cell.modules.edit.edited) {
			cell.modules.edit.edited = false;

			if (cell.modules.validate) {
				cell.modules.validate.invalid = false;
			}
		}

		editIndex = this.editedCells.indexOf(cell);

		if (editIndex > -1) {
			this.editedCells.splice(editIndex, 1);
		}
	};

	//default data editors
	Edit.prototype.editors = {

		//input element
		input: function input(cell, onRendered, success, cancel, editorParams) {

			//create and style input
			var cellValue = cell.getValue(),
			    input = document.createElement("input");

			input.setAttribute("type", editorParams.search ? "search" : "text");

			input.style.padding = "4px";
			input.style.width = "100%";
			input.style.boxSizing = "border-box";

			if (editorParams.elementAttributes && _typeof(editorParams.elementAttributes) == "object") {
				for (var key in editorParams.elementAttributes) {
					if (key.charAt(0) == "+") {
						key = key.slice(1);
						input.setAttribute(key, input.getAttribute(key) + editorParams.elementAttributes["+" + key]);
					} else {
						input.setAttribute(key, editorParams.elementAttributes[key]);
					}
				}
			}

			input.value = typeof cellValue !== "undefined" ? cellValue : "";

			onRendered(function () {
				input.focus({ preventScroll: true });
				input.style.height = "100%";
			});

			function onChange(e) {
				if ((cellValue === null || typeof cellValue === "undefined") && input.value !== "" || input.value !== cellValue) {
					if (success(input.value)) {
						cellValue = input.value; //persist value if successfully validated incase editor is used as header filter
					}
				} else {
					cancel();
				}
			}

			//submit new value on blur or change
			input.addEventListener("change", onChange);
			input.addEventListener("blur", onChange);

			//submit new value on enter
			input.addEventListener("keydown", function (e) {
				switch (e.keyCode) {
					// case 9:
					case 13:
						onChange(e);
						break;

					case 27:
						cancel();
						break;

					case 35:
					case 36:
						e.stopPropagation();
						break;
				}
			});

			if (editorParams.mask) {
				this.table.modules.edit.maskInput(input, editorParams);
			}

			return input;
		},

		//resizable text area element
		textarea: function textarea(cell, onRendered, success, cancel, editorParams) {
			var self = this,
			    cellValue = cell.getValue(),
			    vertNav = editorParams.verticalNavigation || "hybrid",
			    value = String(cellValue !== null && typeof cellValue !== "undefined" ? cellValue : ""),
			    count = (value.match(/(?:\r\n|\r|\n)/g) || []).length + 1,
			    input = document.createElement("textarea"),
			    scrollHeight = 0;

			//create and style input
			input.style.display = "block";
			input.style.padding = "2px";
			input.style.height = "100%";
			input.style.width = "100%";
			input.style.boxSizing = "border-box";
			input.style.whiteSpace = "pre-wrap";
			input.style.resize = "none";

			if (editorParams.elementAttributes && _typeof(editorParams.elementAttributes) == "object") {
				for (var key in editorParams.elementAttributes) {
					if (key.charAt(0) == "+") {
						key = key.slice(1);
						input.setAttribute(key, input.getAttribute(key) + editorParams.elementAttributes["+" + key]);
					} else {
						input.setAttribute(key, editorParams.elementAttributes[key]);
					}
				}
			}

			input.value = value;

			onRendered(function () {
				input.focus({ preventScroll: true });
				input.style.height = "100%";

				input.scrollHeight;
				input.style.height = input.scrollHeight + "px";
				cell.getRow().normalizeHeight();
			});

			function onChange(e) {

				if ((cellValue === null || typeof cellValue === "undefined") && input.value !== "" || input.value !== cellValue) {

					if (success(input.value)) {
						cellValue = input.value; //persist value if successfully validated incase editor is used as header filter
					}

					setTimeout(function () {
						cell.getRow().normalizeHeight();
					}, 300);
				} else {
					cancel();
				}
			}

			//submit new value on blur or change
			input.addEventListener("change", onChange);
			input.addEventListener("blur", onChange);

			input.addEventListener("keyup", function () {

				input.style.height = "";

				var heightNow = input.scrollHeight;

				input.style.height = heightNow + "px";

				if (heightNow != scrollHeight) {
					scrollHeight = heightNow;
					cell.getRow().normalizeHeight();
				}
			});

			input.addEventListener("keydown", function (e) {

				switch (e.keyCode) {
					case 27:
						cancel();
						break;

					case 38:
						//up arrow
						if (vertNav == "editor" || vertNav == "hybrid" && input.selectionStart) {
							e.stopImmediatePropagation();
							e.stopPropagation();
						}

						break;

					case 40:
						//down arrow
						if (vertNav == "editor" || vertNav == "hybrid" && input.selectionStart !== input.value.length) {
							e.stopImmediatePropagation();
							e.stopPropagation();
						}
						break;

					case 35:
					case 36:
						e.stopPropagation();
						break;
				}
			});

			if (editorParams.mask) {
				this.table.modules.edit.maskInput(input, editorParams);
			}

			return input;
		},

		//input element with type of number
		number: function number(cell, onRendered, success, cancel, editorParams) {

			var cellValue = cell.getValue(),
			    vertNav = editorParams.verticalNavigation || "editor",
			    input = document.createElement("input");

			input.setAttribute("type", "number");

			if (typeof editorParams.max != "undefined") {
				input.setAttribute("max", editorParams.max);
			}

			if (typeof editorParams.min != "undefined") {
				input.setAttribute("min", editorParams.min);
			}

			if (typeof editorParams.step != "undefined") {
				input.setAttribute("step", editorParams.step);
			}

			//create and style input
			input.style.padding = "4px";
			input.style.width = "100%";
			input.style.boxSizing = "border-box";

			if (editorParams.elementAttributes && _typeof(editorParams.elementAttributes) == "object") {
				for (var key in editorParams.elementAttributes) {
					if (key.charAt(0) == "+") {
						key = key.slice(1);
						input.setAttribute(key, input.getAttribute(key) + editorParams.elementAttributes["+" + key]);
					} else {
						input.setAttribute(key, editorParams.elementAttributes[key]);
					}
				}
			}

			input.value = cellValue;

			var blurFunc = function blurFunc(e) {
				onChange();
			};

			onRendered(function () {
				//submit new value on blur
				input.removeEventListener("blur", blurFunc);

				input.focus({ preventScroll: true });
				input.style.height = "100%";

				//submit new value on blur
				input.addEventListener("blur", blurFunc);
			});

			function onChange() {
				var value = input.value;

				if (!isNaN(value) && value !== "") {
					value = Number(value);
				}

				if (value !== cellValue) {
					if (success(value)) {
						cellValue = value; //persist value if successfully validated incase editor is used as header filter
					}
				} else {
					cancel();
				}
			}

			//submit new value on enter
			input.addEventListener("keydown", function (e) {
				switch (e.keyCode) {
					case 13:
						// case 9:
						onChange();
						break;

					case 27:
						cancel();
						break;

					case 38: //up arrow
					case 40:
						//down arrow
						if (vertNav == "editor") {
							e.stopImmediatePropagation();
							e.stopPropagation();
						}
						break;

					case 35:
					case 36:
						e.stopPropagation();
						break;
				}
			});

			if (editorParams.mask) {
				this.table.modules.edit.maskInput(input, editorParams);
			}

			return input;
		},

		//input element with type of number
		range: function range(cell, onRendered, success, cancel, editorParams) {

			var cellValue = cell.getValue(),
			    input = document.createElement("input");

			input.setAttribute("type", "range");

			if (typeof editorParams.max != "undefined") {
				input.setAttribute("max", editorParams.max);
			}

			if (typeof editorParams.min != "undefined") {
				input.setAttribute("min", editorParams.min);
			}

			if (typeof editorParams.step != "undefined") {
				input.setAttribute("step", editorParams.step);
			}

			//create and style input
			input.style.padding = "4px";
			input.style.width = "100%";
			input.style.boxSizing = "border-box";

			if (editorParams.elementAttributes && _typeof(editorParams.elementAttributes) == "object") {
				for (var key in editorParams.elementAttributes) {
					if (key.charAt(0) == "+") {
						key = key.slice(1);
						input.setAttribute(key, input.getAttribute(key) + editorParams.elementAttributes["+" + key]);
					} else {
						input.setAttribute(key, editorParams.elementAttributes[key]);
					}
				}
			}

			input.value = cellValue;

			onRendered(function () {
				input.focus({ preventScroll: true });
				input.style.height = "100%";
			});

			function onChange() {
				var value = input.value;

				if (!isNaN(value) && value !== "") {
					value = Number(value);
				}

				if (value != cellValue) {
					if (success(value)) {
						cellValue = value; //persist value if successfully validated incase editor is used as header filter
					}
				} else {
					cancel();
				}
			}

			//submit new value on blur
			input.addEventListener("blur", function (e) {
				onChange();
			});

			//submit new value on enter
			input.addEventListener("keydown", function (e) {
				switch (e.keyCode) {
					case 13:
						// case 9:
						onChange();
						break;

					case 27:
						cancel();
						break;
				}
			});

			return input;
		},

		//select
		select: function select(cell, onRendered, success, cancel, editorParams) {
			var _this53 = this;

			var self = this,
			    cellEl = cell.getElement(),
			    initialValue = cell.getValue(),
			    vertNav = editorParams.verticalNavigation || "editor",
			    initialDisplayValue = typeof initialValue !== "undefined" || initialValue === null ? Array.isArray(initialValue) ? initialValue : [initialValue] : typeof editorParams.defaultValue !== "undefined" ? editorParams.defaultValue : [],
			    input = document.createElement("input"),
			    listEl = document.createElement("div"),
			    multiselect = editorParams.multiselect,
			    dataItems = [],
			    currentItem = {},
			    displayItems = [],
			    currentItems = [],
			    blurable = true,
			    blockListShow = false,
			    searchWord = "",
			    searchWordTimeout = null;

			if (Array.isArray(editorParams) || !Array.isArray(editorParams) && (typeof editorParams === 'undefined' ? 'undefined' : _typeof(editorParams)) === "object" && !editorParams.values) {
				console.warn("DEPRECATION WARNING - values for the select editor must now be passed into the values property of the editorParams object, not as the editorParams object");
				editorParams = { values: editorParams };
			}

			function getUniqueColumnValues(field) {
				var output = {},
				    data = self.table.getData(),
				    column;

				if (field) {
					column = self.table.columnManager.getColumnByField(field);
				} else {
					column = cell.getColumn()._getSelf();
				}

				if (column) {
					data.forEach(function (row) {
						var val = column.getFieldValue(row);

						if (val !== null && typeof val !== "undefined" && val !== "") {
							output[val] = true;
						}
					});
				} else {
					console.warn("unable to find matching column to create select lookup list:", field);
				}

				return Object.keys(output);
			}

			function parseItems(inputValues, curentValues) {
				var dataList = [];
				var displayList = [];

				function processComplexListItem(item) {
					var item = {
						label: item.label,
						value: item.value,
						itemParams: item.itemParams,
						elementAttributes: item.elementAttributes,
						element: false
					};

					// if(item.value === curentValue || (!isNaN(parseFloat(item.value)) && !isNaN(parseFloat(item.value)) && parseFloat(item.value) === parseFloat(curentValue))){
					// 	setCurrentItem(item);
					// }

					if (curentValues.indexOf(item.value) > -1) {
						setItem(item);
					}

					dataList.push(item);
					displayList.push(item);

					return item;
				}

				if (typeof inputValues == "function") {
					inputValues = inputValues(cell);
				}

				if (Array.isArray(inputValues)) {
					inputValues.forEach(function (value) {
						var item;

						if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === "object") {

							if (value.options) {
								item = {
									label: value.label,
									group: true,
									itemParams: value.itemParams,
									elementAttributes: value.elementAttributes,
									element: false
								};

								displayList.push(item);

								value.options.forEach(function (item) {
									processComplexListItem(item);
								});
							} else {
								processComplexListItem(value);
							}
						} else {

							item = {
								label: value,
								value: value,
								element: false
							};

							// if(item.value === curentValue || (!isNaN(parseFloat(item.value)) && !isNaN(parseFloat(item.value)) && parseFloat(item.value) === parseFloat(curentValue))){
							// 	setCurrentItem(item);
							// }

							if (curentValues.indexOf(item.value) > -1) {
								setItem(item);
							}

							dataList.push(item);
							displayList.push(item);
						}
					});
				} else {
					for (var key in inputValues) {
						var item = {
							label: inputValues[key],
							value: key,
							element: false
						};

						// if(item.value === curentValue || (!isNaN(parseFloat(item.value)) && !isNaN(parseFloat(item.value)) && parseFloat(item.value) === parseFloat(curentValue))){
						// 	setCurrentItem(item);
						// }

						if (curentValues.indexOf(item.value) > -1) {
							setItem(item);
						}

						dataList.push(item);
						displayList.push(item);
					}
				}

				if (editorParams.sortValuesList) {
					dataList.sort(function (a, b) {
						return a.label < b.label ? -1 : a.label > b.label ? 1 : 0;
					});

					displayList.sort(function (a, b) {
						return a.label < b.label ? -1 : a.label > b.label ? 1 : 0;
					});

					if (editorParams.sortValuesList !== "asc") {
						dataList.reverse();
						displayList.reverse();
					}
				}

				dataItems = dataList;
				displayItems = displayList;

				fillList();
			}

			function fillList() {
				while (listEl.firstChild) {
					listEl.removeChild(listEl.firstChild);
				}displayItems.forEach(function (item) {

					var el = item.element;

					if (!el) {
						el = document.createElement("div");
						item.label = editorParams.listItemFormatter ? editorParams.listItemFormatter(item.value, item.label, cell, el, item.itemParams) : item.label;
						if (item.group) {
							el.classList.add("tabulator-edit-select-list-group");
							el.tabIndex = 0;
							el.innerHTML = item.label === "" ? "&nbsp;" : item.label;
						} else {
							el.classList.add("tabulator-edit-select-list-item");
							el.tabIndex = 0;
							el.innerHTML = item.label === "" ? "&nbsp;" : item.label;

							el.addEventListener("click", function () {
								blockListShow = true;

								setTimeout(function () {
									blockListShow = false;
								}, 10);

								// setCurrentItem(item);
								// chooseItem();
								if (multiselect) {
									toggleItem(item);
									input.focus();
								} else {
									chooseItem(item);
								}
							});

							// if(item === currentItem){
							// 	el.classList.add("active");
							// }

							if (currentItems.indexOf(item) > -1) {
								el.classList.add("active");
							}
						}

						if (item.elementAttributes && _typeof(item.elementAttributes) == "object") {
							for (var key in item.elementAttributes) {
								if (key.charAt(0) == "+") {
									key = key.slice(1);
									el.setAttribute(key, input.getAttribute(key) + item.elementAttributes["+" + key]);
								} else {
									el.setAttribute(key, item.elementAttributes[key]);
								}
							}
						}
						el.addEventListener("mousedown", function () {
							blurable = false;

							setTimeout(function () {
								blurable = true;
							}, 10);
						});

						item.element = el;
					}

					listEl.appendChild(el);
				});
			}

			function setCurrentItem(item, active) {

				if (!multiselect && currentItem && currentItem.element) {
					currentItem.element.classList.remove("active");
				}

				if (currentItem && currentItem.element) {
					currentItem.element.classList.remove("focused");
				}

				currentItem = item;

				if (item.element) {
					item.element.classList.add("focused");
					if (active) {
						item.element.classList.add("active");
					}
				}

				if (item && item.element && item.element.scrollIntoView) {
					item.element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
				}
			}

			// function chooseItem(){
			// 	hideList();

			// 	if(initialValue !== currentItem.value){
			// 		initialValue = currentItem.value;
			// 		success(currentItem.value);
			// 	}else{
			// 		cancel();
			// 	}
			// }

			function setItem(item) {
				var index = currentItems.indexOf(item);

				if (index == -1) {
					currentItems.push(item);
					setCurrentItem(item, true);
				}

				fillInput();
			}

			function unsetItem(index) {
				var item = currentItems[index];

				if (index > -1) {
					currentItems.splice(index, 1);
					if (item.element) {
						item.element.classList.remove("active");
					}
				}
			}

			function toggleItem(item) {
				if (!item) {
					item = currentItem;
				}

				var index = currentItems.indexOf(item);

				if (index > -1) {
					unsetItem(index);
				} else {
					if (multiselect !== true && currentItems.length >= multiselect) {
						unsetItem(0);
					}

					setItem(item);
				}

				fillInput();
			}

			function chooseItem(item) {
				hideList();

				if (!item) {
					item = currentItem;
				}

				if (item) {
					input.value = item.label;
					success(item.value);
				}

				initialDisplayValue = [item.value];
			}

			function chooseItems(silent) {
				if (!silent) {
					hideList();
				}

				var output = [];

				currentItems.forEach(function (item) {
					output.push(item.value);
				});

				initialDisplayValue = output;

				success(output);
			}

			function fillInput() {
				var output = [];

				currentItems.forEach(function (item) {
					output.push(item.label);
				});

				input.value = output.join(", ");

				if (self.currentCell === false) {
					chooseItems(true);
				}
			}

			function unsetItems() {

				var len = currentItems.length;

				for (var _i9 = 0; _i9 < len; _i9++) {
					unsetItem(0);
				}
			}

			function cancelItem() {
				hideList();
				cancel();
			}

			function showList() {
				currentItems = [];

				if (!listEl.parentNode) {
					if (editorParams.values === true) {
						parseItems(getUniqueColumnValues(), initialDisplayValue);
					} else if (typeof editorParams.values === "string") {
						parseItems(getUniqueColumnValues(editorParams.values), initialDisplayValue);
					} else {
						parseItems(editorParams.values || [], initialDisplayValue);
					}

					var offset = Tabulator.prototype.helpers.elOffset(cellEl);

					listEl.style.minWidth = cellEl.offsetWidth + "px";

					listEl.style.top = offset.top + cellEl.offsetHeight + "px";
					listEl.style.left = offset.left + "px";

					listEl.addEventListener("mousedown", function (e) {
						blurable = false;

						setTimeout(function () {
							blurable = true;
						}, 10);
					});

					document.body.appendChild(listEl);
				}
			}

			function hideList() {
				if (listEl.parentNode) {
					listEl.parentNode.removeChild(listEl);
				}

				removeScrollListener();
			}

			function removeScrollListener() {
				self.table.rowManager.element.removeEventListener("scroll", cancelItem);
			}

			function scrollTovalue(char) {

				clearTimeout(searchWordTimeout);

				var character = String.fromCharCode(event.keyCode).toLowerCase();
				searchWord += character.toLowerCase();

				var match = dataItems.find(function (item) {
					return typeof item.label !== "undefined" && item.label.toLowerCase().startsWith(searchWord);
				});

				if (match) {
					setCurrentItem(match, !multiselect);
				}

				searchWordTimeout = setTimeout(function () {
					searchWord = "";
				}, 800);
			}

			//style input
			input.setAttribute("type", "text");

			input.style.padding = "4px";
			input.style.width = "100%";
			input.style.boxSizing = "border-box";
			input.style.cursor = "default";
			input.readOnly = this.currentCell != false;

			if (editorParams.elementAttributes && _typeof(editorParams.elementAttributes) == "object") {
				for (var key in editorParams.elementAttributes) {
					if (key.charAt(0) == "+") {
						key = key.slice(1);
						input.setAttribute(key, input.getAttribute(key) + editorParams.elementAttributes["+" + key]);
					} else {
						input.setAttribute(key, editorParams.elementAttributes[key]);
					}
				}
			}

			input.value = typeof initialValue !== "undefined" || initialValue === null ? initialValue : "";

			// if(editorParams.values === true){
			// 	parseItems(getUniqueColumnValues(), initialValue);
			// }else if(typeof editorParams.values === "string"){
			// 	parseItems(getUniqueColumnValues(editorParams.values), initialValue);
			// }else{
			// 	parseItems(editorParams.values || [], initialValue);
			// }

			input.addEventListener("search", function (e) {
				if (!input.value) {
					unsetItems();
					chooseItems();
				}
			});

			//allow key based navigation
			input.addEventListener("keydown", function (e) {
				var index;

				switch (e.keyCode) {
					case 38:
						//up arrow
						index = dataItems.indexOf(currentItem);

						if (vertNav == "editor" || vertNav == "hybrid" && index) {
							e.stopImmediatePropagation();
							e.stopPropagation();
							e.preventDefault();

							if (index > 0) {
								setCurrentItem(dataItems[index - 1], !multiselect);
							}
						}
						break;

					case 40:
						//down arrow
						index = dataItems.indexOf(currentItem);

						if (vertNav == "editor" || vertNav == "hybrid" && index < dataItems.length - 1) {
							e.stopImmediatePropagation();
							e.stopPropagation();
							e.preventDefault();

							if (index < dataItems.length - 1) {
								if (index == -1) {
									setCurrentItem(dataItems[0], !multiselect);
								} else {
									setCurrentItem(dataItems[index + 1], !multiselect);
								}
							}
						}
						break;

					case 37: //left arrow
					case 39:
						//right arrow
						e.stopImmediatePropagation();
						e.stopPropagation();
						e.preventDefault();
						break;

					case 13:
						//enter
						// chooseItem();

						if (multiselect) {
							toggleItem();
						} else {
							chooseItem();
						}

						break;

					case 27:
						//escape
						cancelItem();
						break;

					case 9:
						//tab
						break;

					default:
						if (self.currentCell === false) {
							e.preventDefault();
						}

						if (e.keyCode >= 38 && e.keyCode <= 90) {
							scrollTovalue(e.keyCode);
						}
				}
			});

			input.addEventListener("blur", function (e) {
				if (blurable) {
					if (multiselect) {
						chooseItems();
					} else {
						cancelItem();
					}
				}
			});

			input.addEventListener("focus", function (e) {
				if (!blockListShow) {
					showList();
				}
			});

			//style list element
			listEl = document.createElement("div");
			listEl.classList.add("tabulator-edit-select-list");

			onRendered(function () {
				input.style.height = "100%";
				input.focus({ preventScroll: true });
			});

			setTimeout(function () {
				_this53.table.rowManager.element.addEventListener("scroll", cancelItem);
			}, 10);

			return input;
		},

		//autocomplete
		autocomplete: function autocomplete(cell, onRendered, success, cancel, editorParams) {
			var _this54 = this;

			var self = this,
			    cellEl = cell.getElement(),
			    initialValue = cell.getValue(),
			    vertNav = editorParams.verticalNavigation || "editor",
			    initialDisplayValue = typeof initialValue !== "undefined" || initialValue === null ? initialValue : typeof editorParams.defaultValue !== "undefined" ? editorParams.defaultValue : "",
			    input = document.createElement("input"),
			    listEl = document.createElement("div"),
			    allItems = [],
			    displayItems = [],
			    values = [],
			    currentItem = false,
			    blurable = true,
			    uniqueColumnValues = false;

			//style input
			input.setAttribute("type", "search");

			input.style.padding = "4px";
			input.style.width = "100%";
			input.style.boxSizing = "border-box";

			if (editorParams.elementAttributes && _typeof(editorParams.elementAttributes) == "object") {
				for (var key in editorParams.elementAttributes) {
					if (key.charAt(0) == "+") {
						key = key.slice(1);
						input.setAttribute(key, input.getAttribute(key) + editorParams.elementAttributes["+" + key]);
					} else {
						input.setAttribute(key, editorParams.elementAttributes[key]);
					}
				}
			}

			//style list element
			listEl.classList.add("tabulator-edit-select-list");

			listEl.addEventListener("mousedown", function (e) {
				blurable = false;

				setTimeout(function () {
					blurable = true;
				}, 10);
			});

			function genUniqueColumnValues() {
				if (editorParams.values === true) {
					uniqueColumnValues = getUniqueColumnValues();
				} else if (typeof editorParams.values === "string") {
					uniqueColumnValues = getUniqueColumnValues(editorParams.values);
				}
			}

			function getUniqueColumnValues(field) {
				var output = {},
				    data = self.table.getData(),
				    column;

				if (field) {
					column = self.table.columnManager.getColumnByField(field);
				} else {
					column = cell.getColumn()._getSelf();
				}

				if (column) {
					data.forEach(function (row) {
						var val = column.getFieldValue(row);

						if (val !== null && typeof val !== "undefined" && val !== "") {
							output[val] = true;
						}
					});

					if (editorParams.sortValuesList) {
						if (editorParams.sortValuesList == "asc") {
							output = Object.keys(output).sort();
						} else {
							output = Object.keys(output).sort().reverse();
						}
					} else {
						output = Object.keys(output);
					}
				} else {
					console.warn("unable to find matching column to create autocomplete lookup list:", field);
				}

				return output;
			}

			function filterList(term, intialLoad) {
				var matches = [],
				    values,
				    items,
				    searchEl;

				//lookup base values list
				if (uniqueColumnValues) {
					values = uniqueColumnValues;
				} else {
					values = editorParams.values || [];
				}

				if (editorParams.searchFunc) {
					matches = editorParams.searchFunc(term, values);

					if (matches instanceof Promise) {

						addNotice(typeof editorParams.searchingPlaceholder !== "undefined" ? editorParams.searchingPlaceholder : "Searching...");

						matches.then(function (result) {
							fillListIfNotEmpty(parseItems(result), intialLoad);
						}).catch(function (err) {
							console.err("error in autocomplete search promise:", err);
						});
					} else {
						fillListIfNotEmpty(parseItems(matches), intialLoad);
					}
				} else {
					items = parseItems(values);

					if (term === "") {
						if (editorParams.showListOnEmpty) {
							matches = items;
						}
					} else {
						items.forEach(function (item) {
							if (item.value !== null || typeof item.value !== "undefined") {
								if (String(item.value).toLowerCase().indexOf(String(term).toLowerCase()) > -1 || String(item.title).toLowerCase().indexOf(String(term).toLowerCase()) > -1) {
									matches.push(item);
								}
							}
						});
					}

					fillListIfNotEmpty(matches, intialLoad);
				}
			}

			function addNotice(notice) {
				var searchEl = document.createElement("div");

				clearList();

				if (notice !== false) {
					searchEl.classList.add("tabulator-edit-select-list-notice");
					searchEl.tabIndex = 0;

					if (notice instanceof Node) {
						searchEl.appendChild(notice);
					} else {
						searchEl.innerHTML = notice;
					}

					listEl.appendChild(searchEl);
				}
			}

			function parseItems(inputValues) {
				var itemList = [];

				if (Array.isArray(inputValues)) {
					inputValues.forEach(function (value) {

						var item = {};

						if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === "object") {
							item.title = editorParams.listItemFormatter ? editorParams.listItemFormatter(value.value, value.label) : value.label;
							item.value = value.value;
						} else {
							item.title = editorParams.listItemFormatter ? editorParams.listItemFormatter(value, value) : value;
							item.value = value;
						}

						itemList.push(item);
					});
				} else {
					for (var key in inputValues) {
						var item = {
							title: editorParams.listItemFormatter ? editorParams.listItemFormatter(key, inputValues[key]) : inputValues[key],
							value: key
						};

						itemList.push(item);
					}
				}

				return itemList;
			}

			function clearList() {
				while (listEl.firstChild) {
					listEl.removeChild(listEl.firstChild);
				}
			}

			function fillListIfNotEmpty(items, intialLoad) {
				if (items.length) {
					fillList(items, intialLoad);
				} else {
					if (editorParams.emptyPlaceholder) {
						addNotice(editorParams.emptyPlaceholder);
					}
				}
			}

			function fillList(items, intialLoad) {
				var current = false;

				clearList();

				displayItems = items;

				displayItems.forEach(function (item) {
					var el = item.element;

					if (!el) {
						el = document.createElement("div");
						el.classList.add("tabulator-edit-select-list-item");
						el.tabIndex = 0;
						el.innerHTML = item.title;

						el.addEventListener("click", function (e) {
							setCurrentItem(item);
							chooseItem();
						});

						el.addEventListener("mousedown", function (e) {
							blurable = false;

							setTimeout(function () {
								blurable = true;
							}, 10);
						});

						item.element = el;

						if (intialLoad && item.value == initialValue) {
							input.value = item.title;
							item.element.classList.add("active");
							current = true;
						}

						if (item === currentItem) {
							item.element.classList.add("active");
							current = true;
						}
					}

					listEl.appendChild(el);
				});

				if (!current) {
					setCurrentItem(false);
				}
			}

			function chooseItem() {
				hideList();

				if (currentItem) {
					if (initialValue !== currentItem.value) {
						initialValue = currentItem.value;
						input.value = currentItem.title;
						success(currentItem.value);
					} else {
						cancel();
					}
				} else {
					if (editorParams.freetext) {
						initialValue = input.value;
						success(input.value);
					} else {
						if (editorParams.allowEmpty && input.value === "") {
							initialValue = input.value;
							success(input.value);
						} else {
							cancel();
						}
					}
				}
			}

			function showList() {
				if (!listEl.parentNode) {

					console.log("show", initialDisplayValue);
					while (listEl.firstChild) {
						listEl.removeChild(listEl.firstChild);
					}var offset = Tabulator.prototype.helpers.elOffset(cellEl);

					listEl.style.minWidth = cellEl.offsetWidth + "px";

					listEl.style.top = offset.top + cellEl.offsetHeight + "px";
					listEl.style.left = offset.left + "px";
					document.body.appendChild(listEl);
				}
			}

			function setCurrentItem(item, showInputValue) {
				if (currentItem && currentItem.element) {
					currentItem.element.classList.remove("active");
				}

				currentItem = item;

				if (item && item.element) {
					item.element.classList.add("active");
				}

				if (item && item.element && item.element.scrollIntoView) {
					item.element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
				}
			}

			function hideList() {
				if (listEl.parentNode) {
					listEl.parentNode.removeChild(listEl);
				}

				removeScrollListener();
			}

			function cancelItem() {
				hideList();
				cancel();
			}

			function removeScrollListener() {
				self.table.rowManager.element.removeEventListener("scroll", cancelItem);
			}

			//allow key based navigation
			input.addEventListener("keydown", function (e) {
				var index;

				switch (e.keyCode) {
					case 38:
						//up arrow
						index = displayItems.indexOf(currentItem);

						if (vertNav == "editor" || vertNav == "hybrid" && index) {
							e.stopImmediatePropagation();
							e.stopPropagation();
							e.preventDefault();

							if (index > 0) {
								setCurrentItem(displayItems[index - 1]);
							} else {
								setCurrentItem(false);
							}
						}
						break;

					case 40:
						//down arrow

						index = displayItems.indexOf(currentItem);

						if (vertNav == "editor" || vertNav == "hybrid" && index < displayItems.length - 1) {

							e.stopImmediatePropagation();
							e.stopPropagation();
							e.preventDefault();

							if (index < displayItems.length - 1) {
								if (index == -1) {
									setCurrentItem(displayItems[0]);
								} else {
									setCurrentItem(displayItems[index + 1]);
								}
							}
						}
						break;

					case 37: //left arrow
					case 39:
						//right arrow
						e.stopImmediatePropagation();
						e.stopPropagation();
						// e.preventDefault();
						break;

					case 13:
						//enter
						chooseItem();
						break;

					case 27:
						//escape
						cancelItem();
						break;

					case 36: //home
					case 35:
						//end
						//prevent table navigation while using input element
						e.stopImmediatePropagation();
						break;
				}
			});

			input.addEventListener("keyup", function (e) {

				switch (e.keyCode) {
					case 38: //up arrow
					case 37: //left arrow
					case 39: //up arrow
					case 40: //right arrow
					case 13: //enter
					case 27:
						//escape
						break;

					default:
						filterList(input.value);
				}
			});

			input.addEventListener("search", function (e) {
				filterList(input.value);
			});

			input.addEventListener("blur", function (e) {
				if (blurable) {
					chooseItem();
				}
			});

			input.addEventListener("focus", function (e) {
				var value = initialDisplayValue;
				genUniqueColumnValues();
				showList();
				input.value = value;
				filterList(value, true);
			});

			onRendered(function () {
				input.style.height = "100%";
				input.focus({ preventScroll: true });
			});

			if (editorParams.mask) {
				this.table.modules.edit.maskInput(input, editorParams);
			}

			setTimeout(function () {
				_this54.table.rowManager.element.addEventListener("scroll", cancelItem);
			}, 10);

			genUniqueColumnValues();
			input.value = initialDisplayValue;
			filterList(initialDisplayValue, true);

			return input;
		},

		//star rating
		star: function star(cell, onRendered, success, cancel, editorParams) {
			var self = this,
			    element = cell.getElement(),
			    value = cell.getValue(),
			    maxStars = element.getElementsByTagName("svg").length || 5,
			    size = element.getElementsByTagName("svg")[0] ? element.getElementsByTagName("svg")[0].getAttribute("width") : 14,
			    stars = [],
			    starsHolder = document.createElement("div"),
			    star = document.createElementNS('http://www.w3.org/2000/svg', "svg");

			//change star type
			function starChange(val) {
				stars.forEach(function (star, i) {
					if (i < val) {
						if (self.table.browser == "ie") {
							star.setAttribute("class", "tabulator-star-active");
						} else {
							star.classList.replace("tabulator-star-inactive", "tabulator-star-active");
						}

						star.innerHTML = '<polygon fill="#488CE9" stroke="#014AAE" stroke-width="37.6152" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="259.216,29.942 330.27,173.919 489.16,197.007 374.185,309.08 401.33,467.31 259.216,392.612 117.104,467.31 144.25,309.08 29.274,197.007 188.165,173.919 "/>';
					} else {
						if (self.table.browser == "ie") {
							star.setAttribute("class", "tabulator-star-inactive");
						} else {
							star.classList.replace("tabulator-star-active", "tabulator-star-inactive");
						}

						star.innerHTML = '<polygon fill="#010155" stroke="#686868" stroke-width="37.6152" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="259.216,29.942 330.27,173.919 489.16,197.007 374.185,309.08 401.33,467.31 259.216,392.612 117.104,467.31 144.25,309.08 29.274,197.007 188.165,173.919 "/>';
					}
				});
			}

			//build stars
			function buildStar(i) {

				var starHolder = document.createElement("span");
				var nextStar = star.cloneNode(true);

				stars.push(nextStar);

				starHolder.addEventListener("mouseenter", function (e) {
					e.stopPropagation();
					e.stopImmediatePropagation();
					starChange(i);
				});

				starHolder.addEventListener("mousemove", function (e) {
					e.stopPropagation();
					e.stopImmediatePropagation();
				});

				starHolder.addEventListener("click", function (e) {
					e.stopPropagation();
					e.stopImmediatePropagation();
					success(i);
					element.blur();
				});

				starHolder.appendChild(nextStar);
				starsHolder.appendChild(starHolder);
			}

			//handle keyboard navigation value change
			function changeValue(val) {
				value = val;
				starChange(val);
			}

			//style cell
			element.style.whiteSpace = "nowrap";
			element.style.overflow = "hidden";
			element.style.textOverflow = "ellipsis";

			//style holding element
			starsHolder.style.verticalAlign = "middle";
			starsHolder.style.display = "inline-block";
			starsHolder.style.padding = "4px";

			//style star
			star.setAttribute("width", size);
			star.setAttribute("height", size);
			star.setAttribute("viewBox", "0 0 512 512");
			star.setAttribute("xml:space", "preserve");
			star.style.padding = "0 1px";

			if (editorParams.elementAttributes && _typeof(editorParams.elementAttributes) == "object") {
				for (var key in editorParams.elementAttributes) {
					if (key.charAt(0) == "+") {
						key = key.slice(1);
						starsHolder.setAttribute(key, starsHolder.getAttribute(key) + editorParams.elementAttributes["+" + key]);
					} else {
						starsHolder.setAttribute(key, editorParams.elementAttributes[key]);
					}
				}
			}

			//create correct number of stars
			for (var i = 1; i <= maxStars; i++) {
				buildStar(i);
			}

			//ensure value does not exceed number of stars
			value = Math.min(parseInt(value), maxStars);

			// set initial styling of stars
			starChange(value);

			starsHolder.addEventListener("mousemove", function (e) {
				starChange(0);
			});

			starsHolder.addEventListener("click", function (e) {
				success(0);
			});

			element.addEventListener("blur", function (e) {
				cancel();
			});

			//allow key based navigation
			element.addEventListener("keydown", function (e) {
				switch (e.keyCode) {
					case 39:
						//right arrow
						changeValue(value + 1);
						break;

					case 37:
						//left arrow
						changeValue(value - 1);
						break;

					case 13:
						//enter
						success(value);
						break;

					case 27:
						//escape
						cancel();
						break;
				}
			});

			return starsHolder;
		},

		//draggable progress bar
		progress: function progress(cell, onRendered, success, cancel, editorParams) {
			var element = cell.getElement(),
			    max = typeof editorParams.max === "undefined" ? element.getElementsByTagName("div")[0].getAttribute("max") || 100 : editorParams.max,
			    min = typeof editorParams.min === "undefined" ? element.getElementsByTagName("div")[0].getAttribute("min") || 0 : editorParams.min,
			    percent = (max - min) / 100,
			    value = cell.getValue() || 0,
			    handle = document.createElement("div"),
			    bar = document.createElement("div"),
			    mouseDrag,
			    mouseDragWidth;

			//set new value
			function updateValue() {
				var style = window.getComputedStyle(element, null);

				var calcVal = percent * Math.round(bar.offsetWidth / ((element.clientWidth - parseInt(style.getPropertyValue("padding-left")) - parseInt(style.getPropertyValue("padding-right"))) / 100)) + min;
				success(calcVal);
				element.setAttribute("aria-valuenow", calcVal);
				element.setAttribute("aria-label", value);
			}

			//style handle
			handle.style.position = "absolute";
			handle.style.right = "0";
			handle.style.top = "0";
			handle.style.bottom = "0";
			handle.style.width = "5px";
			handle.classList.add("tabulator-progress-handle");

			//style bar
			bar.style.display = "inline-block";
			bar.style.position = "relative";
			// bar.style.top = "8px";
			// bar.style.bottom = "8px";
			// bar.style.left = "4px";
			// bar.style.marginRight = "4px";
			bar.style.height = "100%";
			bar.style.backgroundColor = "#488CE9";
			bar.style.maxWidth = "100%";
			bar.style.minWidth = "0%";

			if (editorParams.elementAttributes && _typeof(editorParams.elementAttributes) == "object") {
				for (var key in editorParams.elementAttributes) {
					if (key.charAt(0) == "+") {
						key = key.slice(1);
						bar.setAttribute(key, bar.getAttribute(key) + editorParams.elementAttributes["+" + key]);
					} else {
						bar.setAttribute(key, editorParams.elementAttributes[key]);
					}
				}
			}

			//style cell
			element.style.padding = "4px 4px";

			//make sure value is in range
			value = Math.min(parseFloat(value), max);
			value = Math.max(parseFloat(value), min);

			//workout percentage
			value = Math.round((value - min) / percent);
			// bar.style.right = value + "%";
			bar.style.width = value + "%";

			element.setAttribute("aria-valuemin", min);
			element.setAttribute("aria-valuemax", max);

			bar.appendChild(handle);

			handle.addEventListener("mousedown", function (e) {
				mouseDrag = e.screenX;
				mouseDragWidth = bar.offsetWidth;
			});

			handle.addEventListener("mouseover", function () {
				handle.style.cursor = "ew-resize";
			});

			element.addEventListener("mousemove", function (e) {
				if (mouseDrag) {
					bar.style.width = mouseDragWidth + e.screenX - mouseDrag + "px";
				}
			});

			element.addEventListener("mouseup", function (e) {
				if (mouseDrag) {
					e.stopPropagation();
					e.stopImmediatePropagation();

					mouseDrag = false;
					mouseDragWidth = false;

					updateValue();
				}
			});

			//allow key based navigation
			element.addEventListener("keydown", function (e) {
				switch (e.keyCode) {
					case 39:
						//right arrow
						e.preventDefault();
						bar.style.width = bar.clientWidth + element.clientWidth / 100 + "px";
						break;

					case 37:
						//left arrow
						e.preventDefault();
						bar.style.width = bar.clientWidth - element.clientWidth / 100 + "px";
						break;

					case 9: //tab
					case 13:
						//enter
						updateValue();
						break;

					case 27:
						//escape
						cancel();
						break;

				}
			});

			element.addEventListener("blur", function () {
				cancel();
			});

			return bar;
		},

		//checkbox
		tickCross: function tickCross(cell, onRendered, success, cancel, editorParams) {
			var value = cell.getValue(),
			    input = document.createElement("input"),
			    tristate = editorParams.tristate,
			    indetermValue = typeof editorParams.indeterminateValue === "undefined" ? null : editorParams.indeterminateValue,
			    indetermState = false;

			input.setAttribute("type", "checkbox");
			input.style.marginTop = "5px";
			input.style.boxSizing = "border-box";

			if (editorParams.elementAttributes && _typeof(editorParams.elementAttributes) == "object") {
				for (var key in editorParams.elementAttributes) {
					if (key.charAt(0) == "+") {
						key = key.slice(1);
						input.setAttribute(key, input.getAttribute(key) + editorParams.elementAttributes["+" + key]);
					} else {
						input.setAttribute(key, editorParams.elementAttributes[key]);
					}
				}
			}

			input.value = value;

			if (tristate && (typeof value === "undefined" || value === indetermValue || value === "")) {
				indetermState = true;
				input.indeterminate = true;
			}

			if (this.table.browser != "firefox") {
				//prevent blur issue on mac firefox
				onRendered(function () {
					input.focus({ preventScroll: true });
				});
			}

			input.checked = value === true || value === "true" || value === "True" || value === 1;

			onRendered(function () {
				input.focus();
			});

			function setValue(blur) {
				if (tristate) {
					if (!blur) {
						if (input.checked && !indetermState) {
							input.checked = false;
							input.indeterminate = true;
							indetermState = true;
							return indetermValue;
						} else {
							indetermState = false;
							return input.checked;
						}
					} else {
						if (indetermState) {
							return indetermValue;
						} else {
							return input.checked;
						}
					}
				} else {
					return input.checked;
				}
			}

			//submit new value on blur
			input.addEventListener("change", function (e) {
				success(setValue());
			});

			input.addEventListener("blur", function (e) {
				success(setValue(true));
			});

			//submit new value on enter
			input.addEventListener("keydown", function (e) {
				if (e.keyCode == 13) {
					success(setValue());
				}
				if (e.keyCode == 27) {
					cancel();
				}
			});

			return input;
		}
	};

	Tabulator.prototype.registerModule("edit", Edit);

	var ExportRow = function ExportRow(type, columns, component, indent) {
		this.type = type;
		this.columns = columns;
		this.component = component || false;
		this.indent = indent || 0;
	};

	var ExportColumn = function ExportColumn(value, component, width, height, depth) {
		this.value = value;
		this.component = component || false;
		this.width = width;
		this.height = height;
		this.depth = depth;
	};

	var Export = function Export(table) {
		this.table = table; //hold Tabulator object
		this.config = {};
		this.cloneTableStyle = true;
		this.colVisProp = "";
	};

	Export.prototype.generateExportList = function (config, style, range, colVisProp) {
		this.cloneTableStyle = style;
		this.config = config || {};
		this.colVisProp = colVisProp;

		var headers = this.config.columnHeaders !== false ? this.headersToExportRows(this.generateColumnGroupHeaders()) : [];
		var body = this.bodyToExportRows(this.rowLookup(range));

		return headers.concat(body);
	};

	Export.prototype.genereateTable = function (config, style, range, colVisProp) {
		var list = this.generateExportList(config, style, range, colVisProp);

		return this.genereateTableElement(list);
	};

	Export.prototype.rowLookup = function (range) {
		var _this55 = this;

		var rows = [];

		if (typeof range == "function") {
			range.call(this.table).forEach(function (row) {
				row = _this55.table.rowManager.findRow(row);

				if (row) {
					rows.push(row);
				}
			});
		} else {
			switch (range) {
				case true:
				case "visible":
					rows = this.table.rowManager.getVisibleRows(true);
					break;

				case "all":
					rows = this.table.rowManager.rows;
					break;

				case "selected":
					rows = this.table.modules.selectRow.selectedRows;
					break;

				case "active":
				default:
					if (this.table.options.pagination) {
						rows = this.table.rowManager.getDisplayRows(this.table.rowManager.displayRows.length - 2);
					} else {
						rows = this.table.rowManager.getDisplayRows();
					}
			}
		}

		return Object.assign([], rows);
	};

	Export.prototype.generateColumnGroupHeaders = function () {
		var _this56 = this;

		var output = [];

		var columns = this.config.columnGroups !== false ? this.table.columnManager.columns : this.table.columnManager.columnsByIndex;

		columns.forEach(function (column) {
			var colData = _this56.processColumnGroup(column);

			if (colData) {
				output.push(colData);
			}
		});

		return output;
	};

	Export.prototype.processColumnGroup = function (column) {
		var _this57 = this;

		var subGroups = column.columns,
		    maxDepth = 0,
		    title = column.definition["title" + (this.colVisProp.charAt(0).toUpperCase() + this.colVisProp.slice(1))] || column.definition.title;

		var groupData = {
			title: title,
			column: column,
			depth: 1
		};

		if (subGroups.length) {
			groupData.subGroups = [];
			groupData.width = 0;

			subGroups.forEach(function (subGroup) {
				var subGroupData = _this57.processColumnGroup(subGroup);

				if (subGroupData) {
					groupData.width += subGroupData.width;
					groupData.subGroups.push(subGroupData);

					if (subGroupData.depth > maxDepth) {
						maxDepth = subGroupData.depth;
					}
				}
			});

			groupData.depth += maxDepth;

			if (!groupData.width) {
				return false;
			}
		} else {
			if (this.columnVisCheck(column)) {
				groupData.width = 1;
			} else {
				return false;
			}
		}

		return groupData;
	};

	Export.prototype.columnVisCheck = function (column) {
		return column.definition[this.colVisProp] !== false && (column.visible || !column.visible && column.definition[this.colVisProp]);
	};

	Export.prototype.headersToExportRows = function (columns) {
		var headers = [],
		    headerDepth = 0,
		    exportRows = [];

		function parseColumnGroup(column, level) {

			var depth = headerDepth - level;

			if (typeof headers[level] === "undefined") {
				headers[level] = [];
			}

			column.height = column.subGroups ? 1 : depth - column.depth + 1;

			headers[level].push(column);

			if (column.height > 1) {
				for (var _i10 = 1; _i10 < column.height; _i10++) {

					if (typeof headers[level + _i10] === "undefined") {
						headers[level + _i10] = [];
					}

					headers[level + _i10].push(false);
				}
			}

			if (column.width > 1) {
				for (var _i11 = 1; _i11 < column.width; _i11++) {
					headers[level].push(false);
				}
			}

			if (column.subGroups) {
				column.subGroups.forEach(function (subGroup) {
					parseColumnGroup(subGroup, level + 1);
				});
			}
		}

		//calculate maximum header debth
		columns.forEach(function (column) {
			if (column.depth > headerDepth) {
				headerDepth = column.depth;
			}
		});

		columns.forEach(function (column) {
			parseColumnGroup(column, 0);
		});

		headers.forEach(function (header) {
			var columns = [];

			header.forEach(function (col) {
				if (col) {
					columns.push(new ExportColumn(col.title, col.column.getComponent(), col.width, col.height, col.depth));
				} else {
					columns.push(null);
				}
			});

			exportRows.push(new ExportRow("header", columns));
		});

		return exportRows;
	};

	Export.prototype.bodyToExportRows = function (rows) {
		var _this58 = this;

		var columns = [];
		var exportRows = [];

		this.table.columnManager.columnsByIndex.forEach(function (column) {
			if (_this58.columnVisCheck(column)) {
				columns.push(column.getComponent());
			}
		});

		if (this.config.columnCalcs !== false && this.table.modExists("columnCalcs")) {
			if (this.table.modules.columnCalcs.topInitialized) {
				rows.unshift(this.table.modules.columnCalcs.topRow);
			}

			if (this.table.modules.columnCalcs.botInitialized) {
				rows.push(this.table.modules.columnCalcs.botRow);
			}
		}

		rows = rows.filter(function (row) {
			switch (row.type) {
				case "group":
					return _this58.config.rowGroups !== false;
					break;

				case "calc":
					return _this58.config.columnCalcs !== false;
					break;

				case "row":
					return !(_this58.table.options.dataTree && _this58.config.dataTree === false && row.modules.dataTree.parent);
					break;
			}

			return true;
		});

		rows.forEach(function (row, i) {
			var rowData = row.getData(_this58.colVisProp);
			var exportCols = [];
			var indent = 0;

			switch (row.type) {
				case "group":
					indent = row.level;
					exportCols.push(new ExportColumn(row.key, row.getComponent(), columns.length, 1));
					break;

				case "calc":
				case "row":
					columns.forEach(function (col) {
						exportCols.push(new ExportColumn(col._column.getFieldValue(rowData), col, 1, 1));
					});

					if (_this58.table.options.dataTree && _this58.config.dataTree !== false) {
						indent = row.modules.dataTree.index;
					}
					break;
			}

			exportRows.push(new ExportRow(row.type, exportCols, row.getComponent(), indent));
		});

		return exportRows;
	};

	Export.prototype.genereateTableElement = function (list) {
		var _this59 = this;

		var table = document.createElement("table"),
		    headerEl = document.createElement("thead"),
		    bodyEl = document.createElement("tbody"),
		    styles = this.lookupTableStyles(),
		    rowFormatter = this.table.options["rowFormatter" + (this.colVisProp.charAt(0).toUpperCase() + this.colVisProp.slice(1))],
		    setup = {};

		setup.rowFormatter = rowFormatter !== null ? rowFormatter : this.table.options.rowFormatter;

		if (this.table.options.dataTree && this.config.dataTree !== false && this.table.modExists("columnCalcs")) {
			setup.treeElementField = this.table.modules.dataTree.elementField;
		}

		//assign group header formatter
		setup.groupHeader = this.table.options["groupHeader" + (this.colVisProp.charAt(0).toUpperCase() + this.colVisProp.slice(1))];

		if (setup.groupHeader && !Array.isArray(setup.groupHeader)) {
			setup.groupHeader = [setup.groupHeader];
		}

		table.classList.add("tabulator-print-table");

		this.mapElementStyles(this.table.columnManager.getHeadersElement(), headerEl, ["border-top", "border-left", "border-right", "border-bottom", "background-color", "color", "font-weight", "font-family", "font-size"]);

		if (list.length > 1000) {
			console.warn("It may take a long time to render an HTML table with more than 1000 rows");
		}

		list.forEach(function (row, i) {
			switch (row.type) {
				case "header":
					headerEl.appendChild(_this59.genereateHeaderElement(row, setup, styles));
					break;

				case "group":
					bodyEl.appendChild(_this59.genereateGroupElement(row, setup, styles));
					break;

				case "calc":
					bodyEl.appendChild(_this59.genereateCalcElement(row, setup, styles));
					break;

				case "row":
					var rowEl = _this59.genereateRowElement(row, setup, styles);
					_this59.mapElementStyles(i % 2 && styles.evenRow ? styles.evenRow : styles.oddRow, rowEl, ["border-top", "border-left", "border-right", "border-bottom", "color", "font-weight", "font-family", "font-size", "background-color"]);
					bodyEl.appendChild(rowEl);
					break;
			}
		});

		if (headerEl.innerHTML) {
			table.appendChild(headerEl);
		}

		table.appendChild(bodyEl);

		this.mapElementStyles(this.table.element, table, ["border-top", "border-left", "border-right", "border-bottom"]);
		return table;
	};

	Export.prototype.lookupTableStyles = function () {
		var styles = {};

		//lookup row styles
		if (this.cloneTableStyle && window.getComputedStyle) {
			styles.oddRow = this.table.element.querySelector(".tabulator-row-odd:not(.tabulator-group):not(.tabulator-calcs)");
			styles.evenRow = this.table.element.querySelector(".tabulator-row-even:not(.tabulator-group):not(.tabulator-calcs)");
			styles.calcRow = this.table.element.querySelector(".tabulator-row.tabulator-calcs");
			styles.firstRow = this.table.element.querySelector(".tabulator-row:not(.tabulator-group):not(.tabulator-calcs)");
			styles.firstGroup = this.table.element.getElementsByClassName("tabulator-group")[0];

			if (styles.firstRow) {
				styles.styleCells = styles.firstRow.getElementsByClassName("tabulator-cell");
				styles.firstCell = styles.styleCells[0];
				styles.lastCell = styles.styleCells[styles.styleCells.length - 1];
			}
		}

		return styles;
	};

	Export.prototype.genereateHeaderElement = function (row, setup, styles) {
		var _this60 = this;

		var rowEl = document.createElement("tr");

		row.columns.forEach(function (column) {
			if (column) {
				var cellEl = document.createElement("th");
				var classNames = column.component._column.definition.cssClass ? column.component._column.definition.cssClass.split(" ") : [];

				cellEl.colSpan = column.width;
				cellEl.rowSpan = column.height;

				cellEl.innerHTML = column.value;

				if (_this60.cloneTableStyle) {
					cellEl.style.boxSizing = "border-box";
				}

				classNames.forEach(function (className) {
					cellEl.classList.add(className);
				});

				_this60.mapElementStyles(column.component.getElement(), cellEl, ["text-align", "border-top", "border-left", "border-right", "border-bottom", "background-color", "color", "font-weight", "font-family", "font-size"]);
				_this60.mapElementStyles(column.component._column.contentElement, cellEl, ["padding-top", "padding-left", "padding-right", "padding-bottom"]);

				if (column.component._column.visible) {
					_this60.mapElementStyles(column.component.getElement(), cellEl, ["width"]);
				} else {
					if (column.component._column.definition.width) {
						cellEl.style.width = column.component._column.definition.width + "px";
					}
				}

				if (column.component._column.parent) {
					_this60.mapElementStyles(column.component._column.parent.groupElement, cellEl, ["border-top"]);
				}

				rowEl.appendChild(cellEl);
			}
		});

		return rowEl;
	};

	Export.prototype.genereateGroupElement = function (row, setup, styles) {

		var rowEl = document.createElement("tr"),
		    cellEl = document.createElement("td"),
		    group = row.columns[0];

		rowEl.classList.add("tabulator-print-table-row");

		if (setup.groupHeader && setup.groupHeader[row.indent]) {
			group.value = setup.groupHeader[row.indent](group.value, row.component._group.getRowCount(), row.component._group.getData(), row.component);
		} else {
			if (setup.groupHeader === false) {
				group.value = group.value;
			} else {
				group.value = row.component._group.generator(group.value, row.component._group.getRowCount(), row.component._group.getData(), row.component);
			}
		}

		cellEl.colSpan = group.width;
		cellEl.innerHTML = group.value;

		rowEl.classList.add("tabulator-print-table-group");
		rowEl.classList.add("tabulator-group-level-" + row.indent);

		if (group.component.isVisible()) {
			rowEl.classList.add("tabulator-group-visible");
		}

		this.mapElementStyles(styles.firstGroup, rowEl, ["border-top", "border-left", "border-right", "border-bottom", "color", "font-weight", "font-family", "font-size", "background-color"]);
		this.mapElementStyles(styles.firstGroup, cellEl, ["padding-top", "padding-left", "padding-right", "padding-bottom"]);

		rowEl.appendChild(cellEl);

		return rowEl;
	};

	Export.prototype.genereateCalcElement = function (row, setup, styles) {
		var rowEl = this.genereateRowElement(row, setup, styles);

		rowEl.classList.add("tabulator-print-table-calcs");
		this.mapElementStyles(styles.calcRow, rowEl, ["border-top", "border-left", "border-right", "border-bottom", "color", "font-weight", "font-family", "font-size", "background-color"]);

		return rowEl;
	};

	Export.prototype.genereateRowElement = function (row, setup, styles) {
		var _this61 = this;

		var rowEl = document.createElement("tr");

		rowEl.classList.add("tabulator-print-table-row");

		row.columns.forEach(function (col) {

			if (col) {
				var cellEl = document.createElement("td"),
				    column = col.component._column,
				    value = col.value;

				var cellWrapper = {
					modules: {},
					getValue: function getValue() {
						return value;
					},
					getField: function getField() {
						return column.definition.field;
					},
					getElement: function getElement() {
						return cellEl;
					},
					getColumn: function getColumn() {
						return column.getComponent();
					},
					getData: function getData() {
						return row.component.getData();
					},
					getRow: function getRow() {
						return row.component;
					},
					getComponent: function getComponent() {
						return cellWrapper;
					},
					column: column
				};

				var classNames = column.definition.cssClass ? column.definition.cssClass.split(" ") : [];

				classNames.forEach(function (className) {
					cellEl.classList.add(className);
				});

				if (_this61.table.modExists("format") && _this61.config.formatCells !== false) {
					value = _this61.table.modules.format.formatExportValue(cellWrapper, _this61.colVisProp);
				} else {
					switch (typeof value === 'undefined' ? 'undefined' : _typeof(value)) {
						case "object":
							value = JSON.stringify(value);
							break;

						case "undefined":
						case "null":
							value = "";
							break;

						default:
							value = value;
					}
				}

				if (value instanceof Node) {
					cellEl.appendChild(value);
				} else {
					cellEl.innerHTML = value;
				}

				if (styles.firstCell) {
					_this61.mapElementStyles(styles.firstCell, cellEl, ["padding-top", "padding-left", "padding-right", "padding-bottom", "border-top", "border-left", "border-right", "border-bottom", "color", "font-weight", "font-family", "font-size"]);

					if (column.definition.align) {
						cellEl.style.textAlign = column.definition.align;
					}
				}

				if (_this61.table.options.dataTree && _this61.config.dataTree !== false) {
					if (setup.treeElementField && setup.treeElementField == column.field || !setup.treeElementField && i == 0) {
						if (row.component._row.modules.dataTree.controlEl) {
							cellEl.insertBefore(row.component._row.modules.dataTree.controlEl.cloneNode(true), cellEl.firstChild);
						}
						if (row.component._row.modules.dataTree.branchEl) {
							cellEl.insertBefore(row.component._row.modules.dataTree.branchEl.cloneNode(true), cellEl.firstChild);
						}
					}
				}

				rowEl.appendChild(cellEl);

				if (cellWrapper.modules.format && cellWrapper.modules.format.renderedCallback) {
					cellWrapper.modules.format.renderedCallback();
				}

				if (setup.rowFormatter && _this61.config.formatCells !== false) {
					setup.rowFormatter(row.component);
				}
			}
		});

		return rowEl;
	};

	Export.prototype.genereateHTMLTable = function (list) {
		var holder = document.createElement("div");

		holder.appendChild(this.genereateTableElement(list));

		return holder.innerHTML;
	};

	Export.prototype.getHtml = function (visible, style, config, colVisProp) {
		var list = this.generateExportList(config || this.table.options.htmlOutputConfig, style, visible, colVisProp || "htmlOutput");

		return this.genereateHTMLTable(list);
	};

	Export.prototype.mapElementStyles = function (from, to, props) {
		if (this.cloneTableStyle && from && to) {

			var lookup = {
				"background-color": "backgroundColor",
				"color": "fontColor",
				"width": "width",
				"font-weight": "fontWeight",
				"font-family": "fontFamily",
				"font-size": "fontSize",
				"text-align": "textAlign",
				"border-top": "borderTop",
				"border-left": "borderLeft",
				"border-right": "borderRight",
				"border-bottom": "borderBottom",
				"padding-top": "paddingTop",
				"padding-left": "paddingLeft",
				"padding-right": "paddingRight",
				"padding-bottom": "paddingBottom"
			};

			if (window.getComputedStyle) {
				var fromStyle = window.getComputedStyle(from);

				props.forEach(function (prop) {
					to.style[lookup[prop]] = fromStyle.getPropertyValue(prop);
				});
			}
		}
	};

	Tabulator.prototype.registerModule("export", Export);

	var Filter = function Filter(table) {

		this.table = table; //hold Tabulator object

		this.filterList = []; //hold filter list
		this.headerFilters = {}; //hold column filters
		this.headerFilterColumns = []; //hold columns that use header filters

		this.prevHeaderFilterChangeCheck = "";
		this.prevHeaderFilterChangeCheck = "{}";

		this.changed = false; //has filtering changed since last render
	};

	//initialize column header filter
	Filter.prototype.initializeColumn = function (column, value) {
		var self = this,
		    field = column.getField(),
		    params;

		//handle successfull value change
		function success(value) {
			var filterType = column.modules.filter.tagType == "input" && column.modules.filter.attrType == "text" || column.modules.filter.tagType == "textarea" ? "partial" : "match",
			    type = "",
			    filterChangeCheck = "",
			    filterFunc;

			if (typeof column.modules.filter.prevSuccess === "undefined" || column.modules.filter.prevSuccess !== value) {

				column.modules.filter.prevSuccess = value;

				if (!column.modules.filter.emptyFunc(value)) {
					column.modules.filter.value = value;

					switch (_typeof(column.definition.headerFilterFunc)) {
						case "string":
							if (self.filters[column.definition.headerFilterFunc]) {
								type = column.definition.headerFilterFunc;
								filterFunc = function filterFunc(data) {
									var params = column.definition.headerFilterFuncParams || {};
									var fieldVal = column.getFieldValue(data);

									params = typeof params === "function" ? params(value, fieldVal, data) : params;

									return self.filters[column.definition.headerFilterFunc](value, fieldVal, data, params);
								};
							} else {
								console.warn("Header Filter Error - Matching filter function not found: ", column.definition.headerFilterFunc);
							}
							break;

						case "function":
							filterFunc = function filterFunc(data) {
								var params = column.definition.headerFilterFuncParams || {};
								var fieldVal = column.getFieldValue(data);

								params = typeof params === "function" ? params(value, fieldVal, data) : params;

								return column.definition.headerFilterFunc(value, fieldVal, data, params);
							};

							type = filterFunc;
							break;
					}

					if (!filterFunc) {
						switch (filterType) {
							case "partial":
								filterFunc = function filterFunc(data) {
									var colVal = column.getFieldValue(data);

									if (typeof colVal !== 'undefined' && colVal !== null) {
										return String(colVal).toLowerCase().indexOf(String(value).toLowerCase()) > -1;
									} else {
										return false;
									}
								};
								type = "like";
								break;

							default:
								filterFunc = function filterFunc(data) {
									return column.getFieldValue(data) == value;
								};
								type = "=";
						}
					}

					self.headerFilters[field] = { value: value, func: filterFunc, type: type, params: params || {} };
				} else {
					delete self.headerFilters[field];
				}

				filterChangeCheck = JSON.stringify(self.headerFilters);

				if (self.prevHeaderFilterChangeCheck !== filterChangeCheck) {
					self.prevHeaderFilterChangeCheck = filterChangeCheck;

					self.changed = true;
					self.table.rowManager.filterRefresh();
				}
			}

			return true;
		}

		column.modules.filter = {
			success: success,
			attrType: false,
			tagType: false,
			emptyFunc: false
		};

		this.generateHeaderFilterElement(column);
	};

	Filter.prototype.generateHeaderFilterElement = function (column, initialValue, reinitialize) {
		var _this62 = this;

		var self = this,
		    success = column.modules.filter.success,
		    field = column.getField(),
		    filterElement,
		    editor,
		    editorElement,
		    cellWrapper,
		    typingTimer,
		    searchTrigger,
		    params;

		//handle aborted edit
		function cancel() {}

		if (column.modules.filter.headerElement && column.modules.filter.headerElement.parentNode) {
			column.contentElement.removeChild(column.modules.filter.headerElement.parentNode);
		}

		if (field) {

			//set empty value function
			column.modules.filter.emptyFunc = column.definition.headerFilterEmptyCheck || function (value) {
				return !value && value !== "0" && value !== 0;
			};

			filterElement = document.createElement("div");
			filterElement.classList.add("tabulator-header-filter");

			//set column editor
			switch (_typeof(column.definition.headerFilter)) {
				case "string":
					if (self.table.modules.edit.editors[column.definition.headerFilter]) {
						editor = self.table.modules.edit.editors[column.definition.headerFilter];

						if ((column.definition.headerFilter === "tick" || column.definition.headerFilter === "tickCross") && !column.definition.headerFilterEmptyCheck) {
							column.modules.filter.emptyFunc = function (value) {
								return value !== true && value !== false;
							};
						}
					} else {
						console.warn("Filter Error - Cannot build header filter, No such editor found: ", column.definition.editor);
					}
					break;

				case "function":
					editor = column.definition.headerFilter;
					break;

				case "boolean":
					if (column.modules.edit && column.modules.edit.editor) {
						editor = column.modules.edit.editor;
					} else {
						if (column.definition.formatter && self.table.modules.edit.editors[column.definition.formatter]) {
							editor = self.table.modules.edit.editors[column.definition.formatter];

							if ((column.definition.formatter === "tick" || column.definition.formatter === "tickCross") && !column.definition.headerFilterEmptyCheck) {
								column.modules.filter.emptyFunc = function (value) {
									return value !== true && value !== false;
								};
							}
						} else {
							editor = self.table.modules.edit.editors["input"];
						}
					}
					break;
			}

			if (editor) {

				cellWrapper = {
					getValue: function getValue() {
						return typeof initialValue !== "undefined" ? initialValue : "";
					},
					getField: function getField() {
						return column.definition.field;
					},
					getElement: function getElement() {
						return filterElement;
					},
					getColumn: function getColumn() {
						return column.getComponent();
					},
					getRow: function getRow() {
						return {
							normalizeHeight: function normalizeHeight() {}
						};
					}
				};

				params = column.definition.headerFilterParams || {};

				params = typeof params === "function" ? params.call(self.table) : params;

				editorElement = editor.call(this.table.modules.edit, cellWrapper, function () {}, success, cancel, params);

				if (!editorElement) {
					console.warn("Filter Error - Cannot add filter to " + field + " column, editor returned a value of false");
					return;
				}

				if (!(editorElement instanceof Node)) {
					console.warn("Filter Error - Cannot add filter to " + field + " column, editor should return an instance of Node, the editor returned:", editorElement);
					return;
				}

				//set Placeholder Text
				if (field) {
					self.table.modules.localize.bind("headerFilters|columns|" + column.definition.field, function (value) {
						editorElement.setAttribute("placeholder", typeof value !== "undefined" && value ? value : self.table.modules.localize.getText("headerFilters|default"));
					});
				} else {
					self.table.modules.localize.bind("headerFilters|default", function (value) {
						editorElement.setAttribute("placeholder", typeof self.column.definition.headerFilterPlaceholder !== "undefined" && self.column.definition.headerFilterPlaceholder ? self.column.definition.headerFilterPlaceholder : value);
					});
				}

				//focus on element on click
				editorElement.addEventListener("click", function (e) {
					e.stopPropagation();
					editorElement.focus();
				});

				editorElement.addEventListener("focus", function (e) {
					var left = _this62.table.columnManager.element.scrollLeft;

					if (left !== _this62.table.rowManager.element.scrollLeft) {
						_this62.table.rowManager.scrollHorizontal(left);
						_this62.table.columnManager.scrollHorizontal(left);
					}
				});

				//live update filters as user types
				typingTimer = false;

				searchTrigger = function searchTrigger(e) {
					if (typingTimer) {
						clearTimeout(typingTimer);
					}

					typingTimer = setTimeout(function () {
						success(editorElement.value);
					}, self.table.options.headerFilterLiveFilterDelay);
				};

				column.modules.filter.headerElement = editorElement;
				column.modules.filter.attrType = editorElement.hasAttribute("type") ? editorElement.getAttribute("type").toLowerCase() : "";
				column.modules.filter.tagType = editorElement.tagName.toLowerCase();

				if (column.definition.headerFilterLiveFilter !== false) {

					if (!(column.definition.headerFilter === 'autocomplete' || column.definition.headerFilter === 'tickCross' || (column.definition.editor === 'autocomplete' || column.definition.editor === 'tickCross') && column.definition.headerFilter === true)) {
						editorElement.addEventListener("keyup", searchTrigger);
						editorElement.addEventListener("search", searchTrigger);

						//update number filtered columns on change
						if (column.modules.filter.attrType == "number") {
							editorElement.addEventListener("change", function (e) {
								success(editorElement.value);
							});
						}

						//change text inputs to search inputs to allow for clearing of field
						if (column.modules.filter.attrType == "text" && this.table.browser !== "ie") {
							editorElement.setAttribute("type", "search");
							// editorElement.off("change blur"); //prevent blur from triggering filter and preventing selection click
						}
					}

					//prevent input and select elements from propegating click to column sorters etc
					if (column.modules.filter.tagType == "input" || column.modules.filter.tagType == "select" || column.modules.filter.tagType == "textarea") {
						editorElement.addEventListener("mousedown", function (e) {
							e.stopPropagation();
						});
					}
				}

				filterElement.appendChild(editorElement);

				column.contentElement.appendChild(filterElement);

				if (!reinitialize) {
					self.headerFilterColumns.push(column);
				}
			}
		} else {
			console.warn("Filter Error - Cannot add header filter, column has no field set:", column.definition.title);
		}
	};

	//hide all header filter elements (used to ensure correct column widths in "fitData" layout mode)
	Filter.prototype.hideHeaderFilterElements = function () {
		this.headerFilterColumns.forEach(function (column) {
			if (column.modules.filter && column.modules.filter.headerElement) {
				column.modules.filter.headerElement.style.display = 'none';
			}
		});
	};

	//show all header filter elements (used to ensure correct column widths in "fitData" layout mode)
	Filter.prototype.showHeaderFilterElements = function () {
		this.headerFilterColumns.forEach(function (column) {
			if (column.modules.filter && column.modules.filter.headerElement) {
				column.modules.filter.headerElement.style.display = '';
			}
		});
	};

	//programatically set focus of header filter
	Filter.prototype.setHeaderFilterFocus = function (column) {
		if (column.modules.filter && column.modules.filter.headerElement) {
			column.modules.filter.headerElement.focus();
		} else {
			console.warn("Column Filter Focus Error - No header filter set on column:", column.getField());
		}
	};

	//programmatically get value of header filter
	Filter.prototype.getHeaderFilterValue = function (column) {
		if (column.modules.filter && column.modules.filter.headerElement) {
			return column.modules.filter.headerElement.value;
		} else {
			console.warn("Column Filter Error - No header filter set on column:", column.getField());
		}
	};

	//programatically set value of header filter
	Filter.prototype.setHeaderFilterValue = function (column, value) {
		if (column) {
			if (column.modules.filter && column.modules.filter.headerElement) {
				this.generateHeaderFilterElement(column, value, true);
				column.modules.filter.success(value);
			} else {
				console.warn("Column Filter Error - No header filter set on column:", column.getField());
			}
		}
	};

	Filter.prototype.reloadHeaderFilter = function (column) {
		if (column) {
			if (column.modules.filter && column.modules.filter.headerElement) {
				this.generateHeaderFilterElement(column, column.modules.filter.value, true);
			} else {
				console.warn("Column Filter Error - No header filter set on column:", column.getField());
			}
		}
	};

	//check if the filters has changed since last use
	Filter.prototype.hasChanged = function () {
		var changed = this.changed;
		this.changed = false;
		return changed;
	};

	//set standard filters
	Filter.prototype.setFilter = function (field, type, value, params) {
		var self = this;

		self.filterList = [];

		if (!Array.isArray(field)) {
			field = [{ field: field, type: type, value: value, params: params }];
		}

		self.addFilter(field);
	};

	//add filter to array
	Filter.prototype.addFilter = function (field, type, value, params) {
		var self = this;

		if (!Array.isArray(field)) {
			field = [{ field: field, type: type, value: value, params: params }];
		}

		field.forEach(function (filter) {

			filter = self.findFilter(filter);

			if (filter) {
				self.filterList.push(filter);

				self.changed = true;
			}
		});

		if (this.table.options.persistence && this.table.modExists("persistence", true) && this.table.modules.persistence.config.filter) {
			this.table.modules.persistence.save("filter");
		}
	};

	Filter.prototype.findFilter = function (filter) {
		var self = this,
		    column;

		if (Array.isArray(filter)) {
			return this.findSubFilters(filter);
		}

		var filterFunc = false;

		if (typeof filter.field == "function") {
			filterFunc = function filterFunc(data) {
				return filter.field(data, filter.type || {}); // pass params to custom filter function
			};
		} else {

			if (self.filters[filter.type]) {

				column = self.table.columnManager.getColumnByField(filter.field);

				if (column) {
					filterFunc = function filterFunc(data) {
						return self.filters[filter.type](filter.value, column.getFieldValue(data), data, filter.params || {});
					};
				} else {
					filterFunc = function filterFunc(data) {
						return self.filters[filter.type](filter.value, data[filter.field], data, filter.params || {});
					};
				}
			} else {
				console.warn("Filter Error - No such filter type found, ignoring: ", filter.type);
			}
		}

		filter.func = filterFunc;

		return filter.func ? filter : false;
	};

	Filter.prototype.findSubFilters = function (filters) {
		var self = this,
		    output = [];

		filters.forEach(function (filter) {
			filter = self.findFilter(filter);

			if (filter) {
				output.push(filter);
			}
		});

		return output.length ? output : false;
	};

	//get all filters
	Filter.prototype.getFilters = function (all, ajax) {
		var output = [];

		if (all) {
			output = this.getHeaderFilters();
		}

		if (ajax) {
			output.forEach(function (item) {
				if (typeof item.type == "function") {
					item.type = "function";
				}
			});
		}

		output = output.concat(this.filtersToArray(this.filterList, ajax));

		return output;
	};

	//filter to Object
	Filter.prototype.filtersToArray = function (filterList, ajax) {
		var _this63 = this;

		var output = [];

		filterList.forEach(function (filter) {
			var item;

			if (Array.isArray(filter)) {
				output.push(_this63.filtersToArray(filter, ajax));
			} else {
				item = { field: filter.field, type: filter.type, value: filter.value };

				if (ajax) {
					if (typeof item.type == "function") {
						item.type = "function";
					}
				}

				output.push(item);
			}
		});

		return output;
	};

	//get all filters
	Filter.prototype.getHeaderFilters = function () {
		var self = this,
		    output = [];

		for (var key in this.headerFilters) {
			output.push({ field: key, type: this.headerFilters[key].type, value: this.headerFilters[key].value });
		}

		return output;
	};

	//remove filter from array
	Filter.prototype.removeFilter = function (field, type, value) {
		var self = this;

		if (!Array.isArray(field)) {
			field = [{ field: field, type: type, value: value }];
		}

		field.forEach(function (filter) {
			var index = -1;

			if (_typeof(filter.field) == "object") {
				index = self.filterList.findIndex(function (element) {
					return filter === element;
				});
			} else {
				index = self.filterList.findIndex(function (element) {
					return filter.field === element.field && filter.type === element.type && filter.value === element.value;
				});
			}

			if (index > -1) {
				self.filterList.splice(index, 1);
				self.changed = true;
			} else {
				console.warn("Filter Error - No matching filter type found, ignoring: ", filter.type);
			}
		});

		if (this.table.options.persistence && this.table.modExists("persistence", true) && this.table.modules.persistence.config.filter) {
			this.table.modules.persistence.save("filter");
		}
	};

	//clear filters
	Filter.prototype.clearFilter = function (all) {
		this.filterList = [];

		if (all) {
			this.clearHeaderFilter();
		}

		this.changed = true;

		if (this.table.options.persistence && this.table.modExists("persistence", true) && this.table.modules.persistence.config.filter) {
			this.table.modules.persistence.save("filter");
		}
	};

	//clear header filters
	Filter.prototype.clearHeaderFilter = function () {
		var self = this;

		this.headerFilters = {};
		self.prevHeaderFilterChangeCheck = "{}";

		this.headerFilterColumns.forEach(function (column) {
			if (typeof column.modules.filter.value !== "undefined") {
				delete column.modules.filter.value;
			}
			column.modules.filter.prevSuccess = undefined;
			self.reloadHeaderFilter(column);
		});

		this.changed = true;
	};

	//search data and return matching rows
	Filter.prototype.search = function (searchType, field, type, value) {
		var self = this,
		    activeRows = [],
		    filterList = [];

		if (!Array.isArray(field)) {
			field = [{ field: field, type: type, value: value }];
		}

		field.forEach(function (filter) {
			filter = self.findFilter(filter);

			if (filter) {
				filterList.push(filter);
			}
		});

		this.table.rowManager.rows.forEach(function (row) {
			var match = true;

			filterList.forEach(function (filter) {
				if (!self.filterRecurse(filter, row.getData())) {
					match = false;
				}
			});

			if (match) {
				activeRows.push(searchType === "data" ? row.getData("data") : row.getComponent());
			}
		});

		return activeRows;
	};

	//filter row array
	Filter.prototype.filter = function (rowList, filters) {
		var self = this,
		    activeRows = [],
		    activeRowComponents = [];

		if (self.table.options.dataFiltering) {
			self.table.options.dataFiltering.call(self.table, self.getFilters());
		}

		if (!self.table.options.ajaxFiltering && (self.filterList.length || Object.keys(self.headerFilters).length)) {

			rowList.forEach(function (row) {
				if (self.filterRow(row)) {
					activeRows.push(row);
				}
			});
		} else {
			activeRows = rowList.slice(0);
		}

		if (self.table.options.dataFiltered) {

			activeRows.forEach(function (row) {
				activeRowComponents.push(row.getComponent());
			});

			self.table.options.dataFiltered.call(self.table, self.getFilters(), activeRowComponents);
		}

		return activeRows;
	};

	//filter individual row
	Filter.prototype.filterRow = function (row, filters) {
		var self = this,
		    match = true,
		    data = row.getData();

		self.filterList.forEach(function (filter) {
			if (!self.filterRecurse(filter, data)) {
				match = false;
			}
		});

		for (var field in self.headerFilters) {
			if (!self.headerFilters[field].func(data)) {
				match = false;
			}
		}

		return match;
	};

	Filter.prototype.filterRecurse = function (filter, data) {
		var self = this,
		    match = false;

		if (Array.isArray(filter)) {
			filter.forEach(function (subFilter) {
				if (self.filterRecurse(subFilter, data)) {
					match = true;
				}
			});
		} else {
			match = filter.func(data);
		}

		return match;
	};

	//list of available filters
	Filter.prototype.filters = {

		//equal to
		"=": function _(filterVal, rowVal, rowData, filterParams) {
			return rowVal == filterVal ? true : false;
		},

		//less than
		"<": function _(filterVal, rowVal, rowData, filterParams) {
			return rowVal < filterVal ? true : false;
		},

		//less than or equal to
		"<=": function _(filterVal, rowVal, rowData, filterParams) {
			return rowVal <= filterVal ? true : false;
		},

		//greater than
		">": function _(filterVal, rowVal, rowData, filterParams) {
			return rowVal > filterVal ? true : false;
		},

		//greater than or equal to
		">=": function _(filterVal, rowVal, rowData, filterParams) {
			return rowVal >= filterVal ? true : false;
		},

		//not equal to
		"!=": function _(filterVal, rowVal, rowData, filterParams) {
			return rowVal != filterVal ? true : false;
		},

		"regex": function regex(filterVal, rowVal, rowData, filterParams) {

			if (typeof filterVal == "string") {
				filterVal = new RegExp(filterVal);
			}

			return filterVal.test(rowVal);
		},

		//contains the string
		"like": function like(filterVal, rowVal, rowData, filterParams) {
			if (filterVal === null || typeof filterVal === "undefined") {
				return rowVal === filterVal ? true : false;
			} else {
				if (typeof rowVal !== 'undefined' && rowVal !== null) {
					return String(rowVal).toLowerCase().indexOf(filterVal.toLowerCase()) > -1;
				} else {
					return false;
				}
			}
		},

		//contains the keywords
		"keywords": function keywords(filterVal, rowVal, rowData, filterParams) {
			var keywords = filterVal.toLowerCase().split(typeof filterParams.separator === "undefined" ? " " : filterParams.separator),
			    value = String(rowVal === null || typeof rowVal === "undefined" ? "" : rowVal).toLowerCase(),
			    matches = [];

			keywords.forEach(function (keyword) {
				if (value.includes(keyword)) {
					matches.push(true);
				}
			});

			return filterParams.matchAll ? matches.length === keywords.length : !!matches.length;
		},

		//starts with the string
		"starts": function starts(filterVal, rowVal, rowData, filterParams) {
			if (filterVal === null || typeof filterVal === "undefined") {
				return rowVal === filterVal ? true : false;
			} else {
				if (typeof rowVal !== 'undefined' && rowVal !== null) {
					return String(rowVal).toLowerCase().startsWith(filterVal.toLowerCase());
				} else {
					return false;
				}
			}
		},

		//ends with the string
		"ends": function ends(filterVal, rowVal, rowData, filterParams) {
			if (filterVal === null || typeof filterVal === "undefined") {
				return rowVal === filterVal ? true : false;
			} else {
				if (typeof rowVal !== 'undefined' && rowVal !== null) {
					return String(rowVal).toLowerCase().endsWith(filterVal.toLowerCase());
				} else {
					return false;
				}
			}
		},

		//in array
		"in": function _in(filterVal, rowVal, rowData, filterParams) {
			if (Array.isArray(filterVal)) {
				return filterVal.length ? filterVal.indexOf(rowVal) > -1 : true;
			} else {
				console.warn("Filter Error - filter value is not an array:", filterVal);
				return false;
			}
		}
	};

	Tabulator.prototype.registerModule("filter", Filter);

	var Format = function Format(table) {
		this.table = table; //hold Tabulator object
	};

	//initialize column formatter
	Format.prototype.initializeColumn = function (column) {
		column.modules.format = this.lookupFormatter(column, "");

		if (typeof column.definition.formatterPrint !== "undefined") {
			column.modules.format.print = this.lookupFormatter(column, "Print");
		}

		if (typeof column.definition.formatterClipboard !== "undefined") {
			column.modules.format.clipboard = this.lookupFormatter(column, "Clipboard");
		}

		if (typeof column.definition.formatterHtmlOutput !== "undefined") {
			column.modules.format.htmlOutput = this.lookupFormatter(column, "HtmlOutput");
		}
	};

	Format.prototype.lookupFormatter = function (column, type) {
		var config = { params: column.definition["formatter" + type + "Params"] || {} },
		    formatter = column.definition["formatter" + type];

		//set column formatter
		switch (typeof formatter === 'undefined' ? 'undefined' : _typeof(formatter)) {
			case "string":

				if (formatter === "tick") {
					formatter = "tickCross";

					if (typeof config.params.crossElement == "undefined") {
						config.params.crossElement = false;
					}

					console.warn("DEPRECATION WARNING - the tick formatter has been deprecated, please use the tickCross formatter with the crossElement param set to false");
				}

				if (this.formatters[formatter]) {
					config.formatter = this.formatters[formatter];
				} else {
					console.warn("Formatter Error - No such formatter found: ", formatter);
					config.formatter = this.formatters.plaintext;
				}
				break;

			case "function":
				config.formatter = formatter;
				break;

			default:
				config.formatter = this.formatters.plaintext;
				break;
		}

		return config;
	};

	Format.prototype.cellRendered = function (cell) {
		if (cell.modules.format && cell.modules.format.renderedCallback && !cell.modules.format.rendered) {
			cell.modules.format.renderedCallback();
			cell.modules.format.rendered = true;
		}
	};

	//return a formatted value for a cell
	Format.prototype.formatValue = function (cell) {
		var component = cell.getComponent(),
		    params = typeof cell.column.modules.format.params === "function" ? cell.column.modules.format.params(component) : cell.column.modules.format.params;

		function onRendered(callback) {
			if (!cell.modules.format) {
				cell.modules.format = {};
			}

			cell.modules.format.renderedCallback = callback;
			cell.modules.format.rendered = false;
		}

		return cell.column.modules.format.formatter.call(this, component, params, onRendered);
	};

	Format.prototype.formatExportValue = function (cell, type) {
		var formatter = cell.column.modules.format[type],
		    params;

		if (formatter) {
			var onRendered = function onRendered(callback) {
				if (!cell.modules.format) {
					cell.modules.format = {};
				}

				cell.modules.format.renderedCallback = callback;
				cell.modules.format.rendered = false;
			};

			params = typeof formatter.params === "function" ? formatter.params(component) : formatter.params;

			return formatter.formatter.call(this, cell.getComponent(), params, onRendered);
		} else {
			return this.formatValue(cell);
		}
	};

	Format.prototype.sanitizeHTML = function (value) {
		if (value) {
			var entityMap = {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				"'": '&#39;',
				'/': '&#x2F;',
				'`': '&#x60;',
				'=': '&#x3D;'
			};

			return String(value).replace(/[&<>"'`=\/]/g, function (s) {
				return entityMap[s];
			});
		} else {
			return value;
		}
	};

	Format.prototype.emptyToSpace = function (value) {
		return value === null || typeof value === "undefined" || value === "" ? "&nbsp;" : value;
	};

	//get formatter for cell
	Format.prototype.getFormatter = function (formatter) {
		var formatter;

		switch (typeof formatter === 'undefined' ? 'undefined' : _typeof(formatter)) {
			case "string":
				if (this.formatters[formatter]) {
					formatter = this.formatters[formatter];
				} else {
					console.warn("Formatter Error - No such formatter found: ", formatter);
					formatter = this.formatters.plaintext;
				}
				break;

			case "function":
				formatter = formatter;
				break;

			default:
				formatter = this.formatters.plaintext;
				break;
		}

		return formatter;
	};

	//default data formatters
	Format.prototype.formatters = {
		//plain text value
		plaintext: function plaintext(cell, formatterParams, onRendered) {
			return this.emptyToSpace(this.sanitizeHTML(cell.getValue()));
		},

		//html text value
		html: function html(cell, formatterParams, onRendered) {
			return cell.getValue();
		},

		//multiline text area
		textarea: function textarea(cell, formatterParams, onRendered) {
			cell.getElement().style.whiteSpace = "pre-wrap";
			return this.emptyToSpace(this.sanitizeHTML(cell.getValue()));
		},

		//currency formatting
		money: function money(cell, formatterParams, onRendered) {
			var floatVal = parseFloat(cell.getValue()),
			    number,
			    integer,
			    decimal,
			    rgx;

			var decimalSym = formatterParams.decimal || ".";
			var thousandSym = formatterParams.thousand || ",";
			var symbol = formatterParams.symbol || "";
			var after = !!formatterParams.symbolAfter;
			var precision = typeof formatterParams.precision !== "undefined" ? formatterParams.precision : 2;

			if (isNaN(floatVal)) {
				return this.emptyToSpace(this.sanitizeHTML(cell.getValue()));
			}

			number = precision !== false ? floatVal.toFixed(precision) : floatVal;
			number = String(number).split(".");

			integer = number[0];
			decimal = number.length > 1 ? decimalSym + number[1] : "";

			rgx = /(\d+)(\d{3})/;

			while (rgx.test(integer)) {
				integer = integer.replace(rgx, "$1" + thousandSym + "$2");
			}

			return after ? integer + decimal + symbol : symbol + integer + decimal;
		},

		//clickable anchor tag
		link: function link(cell, formatterParams, onRendered) {
			var value = cell.getValue(),
			    urlPrefix = formatterParams.urlPrefix || "",
			    download = formatterParams.download,
			    label = value,
			    el = document.createElement("a"),
			    data;

			if (formatterParams.labelField) {
				data = cell.getData();
				label = data[formatterParams.labelField];
			}

			if (formatterParams.label) {
				switch (_typeof(formatterParams.label)) {
					case "string":
						label = formatterParams.label;
						break;

					case "function":
						label = formatterParams.label(cell);
						break;
				}
			}

			if (label) {
				if (formatterParams.urlField) {
					data = cell.getData();
					value = data[formatterParams.urlField];
				}

				if (formatterParams.url) {
					switch (_typeof(formatterParams.url)) {
						case "string":
							value = formatterParams.url;
							break;

						case "function":
							value = formatterParams.url(cell);
							break;
					}
				}

				el.setAttribute("href", urlPrefix + value);

				if (formatterParams.target) {
					el.setAttribute("target", formatterParams.target);
				}

				if (formatterParams.download) {

					if (typeof download == "function") {
						download = download(cell);
					} else {
						download = download === true ? "" : download;
					}

					el.setAttribute("download", download);
				}

				el.innerHTML = this.emptyToSpace(this.sanitizeHTML(label));

				return el;
			} else {
				return "&nbsp;";
			}
		},

		//image element
		image: function image(cell, formatterParams, onRendered) {
			var el = document.createElement("img"),
			    src = cell.getValue();

			if (formatterParams.urlPrefix) {
				src = formatterParams.urlPrefix + cell.getValue();
			}

			if (formatterParams.urlSuffix) {
				src = src + formatterParams.urlSuffix;
			}

			el.setAttribute("src", src);

			switch (_typeof(formatterParams.height)) {
				case "number":
					el.style.height = formatterParams.height + "px";
					break;

				case "string":
					el.style.height = formatterParams.height;
					break;
			}

			switch (_typeof(formatterParams.width)) {
				case "number":
					el.style.width = formatterParams.width + "px";
					break;

				case "string":
					el.style.width = formatterParams.width;
					break;
			}

			el.addEventListener("load", function () {
				cell.getRow().normalizeHeight();
			});

			return el;
		},

		//tick or cross
		tickCross: function tickCross(cell, formatterParams, onRendered) {
			var value = cell.getValue(),
			    element = cell.getElement(),
			    empty = formatterParams.allowEmpty,
			    truthy = formatterParams.allowTruthy,
			    tick = typeof formatterParams.tickElement !== "undefined" ? formatterParams.tickElement : '<svg enable-background="new 0 0 24 24" height="14" width="14" viewBox="0 0 24 24" xml:space="preserve" ><path fill="#2DC214" clip-rule="evenodd" d="M21.652,3.211c-0.293-0.295-0.77-0.295-1.061,0L9.41,14.34  c-0.293,0.297-0.771,0.297-1.062,0L3.449,9.351C3.304,9.203,3.114,9.13,2.923,9.129C2.73,9.128,2.534,9.201,2.387,9.351  l-2.165,1.946C0.078,11.445,0,11.63,0,11.823c0,0.194,0.078,0.397,0.223,0.544l4.94,5.184c0.292,0.296,0.771,0.776,1.062,1.07  l2.124,2.141c0.292,0.293,0.769,0.293,1.062,0l14.366-14.34c0.293-0.294,0.293-0.777,0-1.071L21.652,3.211z" fill-rule="evenodd"/></svg>',
			    cross = typeof formatterParams.crossElement !== "undefined" ? formatterParams.crossElement : '<svg enable-background="new 0 0 24 24" height="14" width="14"  viewBox="0 0 24 24" xml:space="preserve" ><path fill="#CE1515" d="M22.245,4.015c0.313,0.313,0.313,0.826,0,1.139l-6.276,6.27c-0.313,0.312-0.313,0.826,0,1.14l6.273,6.272  c0.313,0.313,0.313,0.826,0,1.14l-2.285,2.277c-0.314,0.312-0.828,0.312-1.142,0l-6.271-6.271c-0.313-0.313-0.828-0.313-1.141,0  l-6.276,6.267c-0.313,0.313-0.828,0.313-1.141,0l-2.282-2.28c-0.313-0.313-0.313-0.826,0-1.14l6.278-6.269  c0.313-0.312,0.313-0.826,0-1.14L1.709,5.147c-0.314-0.313-0.314-0.827,0-1.14l2.284-2.278C4.308,1.417,4.821,1.417,5.135,1.73  L11.405,8c0.314,0.314,0.828,0.314,1.141,0.001l6.276-6.267c0.312-0.312,0.826-0.312,1.141,0L22.245,4.015z"/></svg>';

			if (truthy && value || value === true || value === "true" || value === "True" || value === 1 || value === "1") {
				element.setAttribute("aria-checked", true);
				return tick || "";
			} else {
				if (empty && (value === "null" || value === "" || value === null || typeof value === "undefined")) {
					element.setAttribute("aria-checked", "mixed");
					return "";
				} else {
					element.setAttribute("aria-checked", false);
					return cross || "";
				}
			}
		},

		datetime: function datetime(cell, formatterParams, onRendered) {
			var inputFormat = formatterParams.inputFormat || "YYYY-MM-DD hh:mm:ss";
			var outputFormat = formatterParams.outputFormat || "DD/MM/YYYY hh:mm:ss";
			var invalid = typeof formatterParams.invalidPlaceholder !== "undefined" ? formatterParams.invalidPlaceholder : "";
			var value = cell.getValue();

			var newDatetime = moment(value, inputFormat);

			if (newDatetime.isValid()) {
				return formatterParams.timezone ? newDatetime.tz(formatterParams.timezone).format(outputFormat) : newDatetime.format(outputFormat);
			} else {

				if (invalid === true) {
					return value;
				} else if (typeof invalid === "function") {
					return invalid(value);
				} else {
					return invalid;
				}
			}
		},

		datetimediff: function datetime(cell, formatterParams, onRendered) {
			var inputFormat = formatterParams.inputFormat || "YYYY-MM-DD hh:mm:ss";
			var invalid = typeof formatterParams.invalidPlaceholder !== "undefined" ? formatterParams.invalidPlaceholder : "";
			var suffix = typeof formatterParams.suffix !== "undefined" ? formatterParams.suffix : false;
			var unit = typeof formatterParams.unit !== "undefined" ? formatterParams.unit : undefined;
			var humanize = typeof formatterParams.humanize !== "undefined" ? formatterParams.humanize : false;
			var date = typeof formatterParams.date !== "undefined" ? formatterParams.date : moment();
			var value = cell.getValue();

			var newDatetime = moment(value, inputFormat);

			if (newDatetime.isValid()) {
				if (humanize) {
					return moment.duration(newDatetime.diff(date)).humanize(suffix);
				} else {
					return newDatetime.diff(date, unit) + (suffix ? " " + suffix : "");
				}
			} else {

				if (invalid === true) {
					return value;
				} else if (typeof invalid === "function") {
					return invalid(value);
				} else {
					return invalid;
				}
			}
		},

		//select
		lookup: function lookup(cell, formatterParams, onRendered) {
			var value = cell.getValue();

			if (typeof formatterParams[value] === "undefined") {
				console.warn('Missing display value for ' + value);
				return value;
			}

			return formatterParams[value];
		},

		//star rating
		star: function star(cell, formatterParams, onRendered) {
			var value = cell.getValue(),
			    element = cell.getElement(),
			    maxStars = formatterParams && formatterParams.stars ? formatterParams.stars : 5,
			    stars = document.createElement("span"),
			    star = document.createElementNS('http://www.w3.org/2000/svg', "svg"),
			    starActive = '<polygon fill="#FFEA00" stroke="#C1AB60" stroke-width="37.6152" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="259.216,29.942 330.27,173.919 489.16,197.007 374.185,309.08 401.33,467.31 259.216,392.612 117.104,467.31 144.25,309.08 29.274,197.007 188.165,173.919 "/>',
			    starInactive = '<polygon fill="#D2D2D2" stroke="#686868" stroke-width="37.6152" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="259.216,29.942 330.27,173.919 489.16,197.007 374.185,309.08 401.33,467.31 259.216,392.612 117.104,467.31 144.25,309.08 29.274,197.007 188.165,173.919 "/>';

			//style stars holder
			stars.style.verticalAlign = "middle";

			//style star
			star.setAttribute("width", "14");
			star.setAttribute("height", "14");
			star.setAttribute("viewBox", "0 0 512 512");
			star.setAttribute("xml:space", "preserve");
			star.style.padding = "0 1px";

			value = value && !isNaN(value) ? parseInt(value) : 0;

			value = Math.max(0, Math.min(value, maxStars));

			for (var i = 1; i <= maxStars; i++) {
				var nextStar = star.cloneNode(true);
				nextStar.innerHTML = i <= value ? starActive : starInactive;

				stars.appendChild(nextStar);
			}

			element.style.whiteSpace = "nowrap";
			element.style.overflow = "hidden";
			element.style.textOverflow = "ellipsis";

			element.setAttribute("aria-label", value);

			return stars;
		},

		traffic: function traffic(cell, formatterParams, onRendered) {
			var value = this.sanitizeHTML(cell.getValue()) || 0,
			    el = document.createElement("span"),
			    max = formatterParams && formatterParams.max ? formatterParams.max : 100,
			    min = formatterParams && formatterParams.min ? formatterParams.min : 0,
			    colors = formatterParams && typeof formatterParams.color !== "undefined" ? formatterParams.color : ["red", "orange", "green"],
			    color = "#666666",
			    percent,
			    percentValue;

			if (isNaN(value) || typeof cell.getValue() === "undefined") {
				return;
			}

			el.classList.add("tabulator-traffic-light");

			//make sure value is in range
			percentValue = parseFloat(value) <= max ? parseFloat(value) : max;
			percentValue = parseFloat(percentValue) >= min ? parseFloat(percentValue) : min;

			//workout percentage
			percent = (max - min) / 100;
			percentValue = Math.round((percentValue - min) / percent);

			//set color
			switch (typeof colors === 'undefined' ? 'undefined' : _typeof(colors)) {
				case "string":
					color = colors;
					break;
				case "function":
					color = colors(value);
					break;
				case "object":
					if (Array.isArray(colors)) {
						var unit = 100 / colors.length;
						var index = Math.floor(percentValue / unit);

						index = Math.min(index, colors.length - 1);
						index = Math.max(index, 0);
						color = colors[index];
						break;
					}
			}

			el.style.backgroundColor = color;

			return el;
		},

		//progress bar
		progress: function progress(cell, formatterParams, onRendered) {
			//progress bar
			var value = this.sanitizeHTML(cell.getValue()) || 0,
			    element = cell.getElement(),
			    max = formatterParams && formatterParams.max ? formatterParams.max : 100,
			    min = formatterParams && formatterParams.min ? formatterParams.min : 0,
			    legendAlign = formatterParams && formatterParams.legendAlign ? formatterParams.legendAlign : "center",
			    percent,
			    percentValue,
			    color,
			    legend,
			    legendColor,
			    top,
			    left,
			    right,
			    bottom;

			//make sure value is in range
			percentValue = parseFloat(value) <= max ? parseFloat(value) : max;
			percentValue = parseFloat(percentValue) >= min ? parseFloat(percentValue) : min;

			//workout percentage
			percent = (max - min) / 100;
			percentValue = Math.round((percentValue - min) / percent);

			//set bar color
			switch (_typeof(formatterParams.color)) {
				case "string":
					color = formatterParams.color;
					break;
				case "function":
					color = formatterParams.color(value);
					break;
				case "object":
					if (Array.isArray(formatterParams.color)) {
						var unit = 100 / formatterParams.color.length;
						var index = Math.floor(percentValue / unit);

						index = Math.min(index, formatterParams.color.length - 1);
						index = Math.max(index, 0);
						color = formatterParams.color[index];
						break;
					}
				default:
					color = "#2DC214";
			}

			//generate legend
			switch (_typeof(formatterParams.legend)) {
				case "string":
					legend = formatterParams.legend;
					break;
				case "function":
					legend = formatterParams.legend(value);
					break;
				case "boolean":
					legend = value;
					break;
				default:
					legend = false;
			}

			//set legend color
			switch (_typeof(formatterParams.legendColor)) {
				case "string":
					legendColor = formatterParams.legendColor;
					break;
				case "function":
					legendColor = formatterParams.legendColor(value);
					break;
				case "object":
					if (Array.isArray(formatterParams.legendColor)) {
						var unit = 100 / formatterParams.legendColor.length;
						var index = Math.floor(percentValue / unit);

						index = Math.min(index, formatterParams.legendColor.length - 1);
						index = Math.max(index, 0);
						legendColor = formatterParams.legendColor[index];
					}
					break;
				default:
					legendColor = "#000";
			}

			element.style.minWidth = "30px";
			element.style.position = "relative";

			element.setAttribute("aria-label", percentValue);

			var barEl = document.createElement("div");
			barEl.style.display = "inline-block";
			barEl.style.position = "relative";
			barEl.style.width = percentValue + "%";
			barEl.style.backgroundColor = color;
			barEl.style.height = "100%";

			barEl.setAttribute('data-max', max);
			barEl.setAttribute('data-min', min);

			if (legend) {
				var legendEl = document.createElement("div");
				legendEl.style.position = "absolute";
				legendEl.style.top = "4px";
				legendEl.style.left = 0;
				legendEl.style.textAlign = legendAlign;
				legendEl.style.width = "100%";
				legendEl.style.color = legendColor;
				legendEl.innerHTML = legend;
			}

			onRendered(function () {

				//handle custom element needed if formatter is to be included in printed/downloaded output
				if (!(cell instanceof CellComponent)) {
					var holderEl = document.createElement("div");
					holderEl.style.position = "absolute";
					holderEl.style.top = "4px";
					holderEl.style.bottom = "4px";
					holderEl.style.left = "4px";
					holderEl.style.right = "4px";

					element.appendChild(holderEl);

					element = holderEl;
				}

				element.appendChild(barEl);

				if (legend) {
					element.appendChild(legendEl);
				}
			});

			return "";
		},

		//background color
		color: function color(cell, formatterParams, onRendered) {
			cell.getElement().style.backgroundColor = this.sanitizeHTML(cell.getValue());
			return "";
		},

		//tick icon
		buttonTick: function buttonTick(cell, formatterParams, onRendered) {
			return '<svg enable-background="new 0 0 24 24" height="14" width="14" viewBox="0 0 24 24" xml:space="preserve" ><path fill="#2DC214" clip-rule="evenodd" d="M21.652,3.211c-0.293-0.295-0.77-0.295-1.061,0L9.41,14.34  c-0.293,0.297-0.771,0.297-1.062,0L3.449,9.351C3.304,9.203,3.114,9.13,2.923,9.129C2.73,9.128,2.534,9.201,2.387,9.351  l-2.165,1.946C0.078,11.445,0,11.63,0,11.823c0,0.194,0.078,0.397,0.223,0.544l4.94,5.184c0.292,0.296,0.771,0.776,1.062,1.07  l2.124,2.141c0.292,0.293,0.769,0.293,1.062,0l14.366-14.34c0.293-0.294,0.293-0.777,0-1.071L21.652,3.211z" fill-rule="evenodd"/></svg>';
		},

		//cross icon
		buttonCross: function buttonCross(cell, formatterParams, onRendered) {
			return '<svg enable-background="new 0 0 24 24" height="14" width="14" viewBox="0 0 24 24" xml:space="preserve" ><path fill="#CE1515" d="M22.245,4.015c0.313,0.313,0.313,0.826,0,1.139l-6.276,6.27c-0.313,0.312-0.313,0.826,0,1.14l6.273,6.272  c0.313,0.313,0.313,0.826,0,1.14l-2.285,2.277c-0.314,0.312-0.828,0.312-1.142,0l-6.271-6.271c-0.313-0.313-0.828-0.313-1.141,0  l-6.276,6.267c-0.313,0.313-0.828,0.313-1.141,0l-2.282-2.28c-0.313-0.313-0.313-0.826,0-1.14l6.278-6.269  c0.313-0.312,0.313-0.826,0-1.14L1.709,5.147c-0.314-0.313-0.314-0.827,0-1.14l2.284-2.278C4.308,1.417,4.821,1.417,5.135,1.73  L11.405,8c0.314,0.314,0.828,0.314,1.141,0.001l6.276-6.267c0.312-0.312,0.826-0.312,1.141,0L22.245,4.015z"/></svg>';
		},

		//current row number
		rownum: function rownum(cell, formatterParams, onRendered) {
			return this.table.rowManager.activeRows.indexOf(cell.getRow()._getSelf()) + 1;
		},

		//row handle
		handle: function handle(cell, formatterParams, onRendered) {
			cell.getElement().classList.add("tabulator-row-handle");
			return "<div class='tabulator-row-handle-box'><div class='tabulator-row-handle-bar'></div><div class='tabulator-row-handle-bar'></div><div class='tabulator-row-handle-bar'></div></div>";
		},

		responsiveCollapse: function responsiveCollapse(cell, formatterParams, onRendered) {
			var self = this,
			    open = false,
			    el = document.createElement("div"),
			    config = cell.getRow()._row.modules.responsiveLayout;

			el.classList.add("tabulator-responsive-collapse-toggle");
			el.innerHTML = "<span class='tabulator-responsive-collapse-toggle-open'>+</span><span class='tabulator-responsive-collapse-toggle-close'>-</span>";

			cell.getElement().classList.add("tabulator-row-handle");

			function toggleList(isOpen) {
				var collapseEl = config.element;

				config.open = isOpen;

				if (collapseEl) {

					if (config.open) {
						el.classList.add("open");
						collapseEl.style.display = '';
					} else {
						el.classList.remove("open");
						collapseEl.style.display = 'none';
					}
				}
			}

			el.addEventListener("click", function (e) {
				e.stopImmediatePropagation();
				toggleList(!config.open);
			});

			toggleList(config.open);

			return el;
		},

		rowSelection: function rowSelection(cell, formatterParams, onRendered) {
			var _this64 = this;

			var checkbox = document.createElement("input");

			checkbox.type = 'checkbox';

			if (this.table.modExists("selectRow", true)) {

				checkbox.addEventListener("click", function (e) {
					e.stopPropagation();
				});

				if (typeof cell.getRow == 'function') {
					var row = cell.getRow();

					if (row instanceof RowComponent) {

						checkbox.addEventListener("change", function (e) {
							row.toggleSelect();
						});

						checkbox.checked = row.isSelected && row.isSelected();
						this.table.modules.selectRow.registerRowSelectCheckbox(row, checkbox);
					} else {
						checkbox = "";
					}
				} else {
					checkbox.addEventListener("change", function (e) {
						if (_this64.table.modules.selectRow.selectedRows.length) {
							_this64.table.deselectRow();
						} else {
							_this64.table.selectRow(formatterParams.rowRange);
						}
					});

					this.table.modules.selectRow.registerHeaderSelectCheckbox(checkbox);
				}
			}
			return checkbox;
		}
	};

	Tabulator.prototype.registerModule("format", Format);

	var FrozenColumns = function FrozenColumns(table) {
		this.table = table; //hold Tabulator object
		this.leftColumns = [];
		this.rightColumns = [];
		this.leftMargin = 0;
		this.rightMargin = 0;
		this.rightPadding = 0;
		this.initializationMode = "left";
		this.active = false;
		this.scrollEndTimer = false;
	};

	//reset initial state
	FrozenColumns.prototype.reset = function () {
		this.initializationMode = "left";
		this.leftColumns = [];
		this.rightColumns = [];
		this.leftMargin = 0;
		this.rightMargin = 0;
		this.rightMargin = 0;
		this.active = false;

		this.table.columnManager.headersElement.style.marginLeft = 0;
		this.table.columnManager.element.style.paddingRight = 0;
	};

	//initialize specific column
	FrozenColumns.prototype.initializeColumn = function (column) {
		var config = { margin: 0, edge: false };

		if (!column.isGroup) {

			if (this.frozenCheck(column)) {

				config.position = this.initializationMode;

				if (this.initializationMode == "left") {
					this.leftColumns.push(column);
				} else {
					this.rightColumns.unshift(column);
				}

				this.active = true;

				column.modules.frozen = config;
			} else {
				this.initializationMode = "right";
			}
		}
	};

	FrozenColumns.prototype.frozenCheck = function (column) {
		var frozen = false;

		if (column.parent.isGroup && column.definition.frozen) {
			console.warn("Frozen Column Error - Parent column group must be frozen, not individual columns or sub column groups");
		}

		if (column.parent.isGroup) {
			return this.frozenCheck(column.parent);
		} else {
			return column.definition.frozen;
		}

		return frozen;
	};

	//quick layout to smooth horizontal scrolling
	FrozenColumns.prototype.scrollHorizontal = function () {
		var _this65 = this;

		var rows;

		if (this.active) {
			clearTimeout(this.scrollEndTimer);

			//layout all rows after scroll is complete
			this.scrollEndTimer = setTimeout(function () {
				_this65.layout();
			}, 100);

			rows = this.table.rowManager.getVisibleRows();

			this.calcMargins();

			this.layoutColumnPosition();

			this.layoutCalcRows();

			rows.forEach(function (row) {
				if (row.type === "row") {
					_this65.layoutRow(row);
				}
			});

			this.table.rowManager.tableElement.style.marginRight = this.rightMargin;
		}
	};

	//calculate margins for rows
	FrozenColumns.prototype.calcMargins = function () {
		this.leftMargin = this._calcSpace(this.leftColumns, this.leftColumns.length) + "px";
		this.table.columnManager.headersElement.style.marginLeft = this.leftMargin;

		this.rightMargin = this._calcSpace(this.rightColumns, this.rightColumns.length) + "px";
		this.table.columnManager.element.style.paddingRight = this.rightMargin;

		//calculate right frozen columns
		this.rightPadding = this.table.rowManager.element.clientWidth + this.table.columnManager.scrollLeft;
	};

	//layout calculation rows
	FrozenColumns.prototype.layoutCalcRows = function () {
		if (this.table.modExists("columnCalcs")) {
			if (this.table.modules.columnCalcs.topInitialized && this.table.modules.columnCalcs.topRow) {
				this.layoutRow(this.table.modules.columnCalcs.topRow);
			}
			if (this.table.modules.columnCalcs.botInitialized && this.table.modules.columnCalcs.botRow) {
				this.layoutRow(this.table.modules.columnCalcs.botRow);
			}
		}
	};

	//calculate column positions and layout headers
	FrozenColumns.prototype.layoutColumnPosition = function (allCells) {
		var _this66 = this;

		var leftParents = [];

		this.leftColumns.forEach(function (column, i) {
			column.modules.frozen.margin = _this66._calcSpace(_this66.leftColumns, i) + _this66.table.columnManager.scrollLeft + "px";

			if (i == _this66.leftColumns.length - 1) {
				column.modules.frozen.edge = true;
			} else {
				column.modules.frozen.edge = false;
			}

			if (column.parent.isGroup) {
				var parentEl = _this66.getColGroupParentElement(column);
				if (!leftParents.includes(parentEl)) {
					_this66.layoutElement(parentEl, column);
					leftParents.push(parentEl);
				}

				if (column.modules.frozen.edge) {
					parentEl.classList.add("tabulator-frozen-" + column.modules.frozen.position);
				}
			} else {
				_this66.layoutElement(column.getElement(), column);
			}

			if (allCells) {
				column.cells.forEach(function (cell) {
					_this66.layoutElement(cell.getElement(true), column);
				});
			}
		});

		this.rightColumns.forEach(function (column, i) {
			column.modules.frozen.margin = _this66.rightPadding - _this66._calcSpace(_this66.rightColumns, i + 1) + "px";

			if (i == _this66.rightColumns.length - 1) {
				column.modules.frozen.edge = true;
			} else {
				column.modules.frozen.edge = false;
			}

			if (column.parent.isGroup) {
				_this66.layoutElement(_this66.getColGroupParentElement(column), column);
			} else {
				_this66.layoutElement(column.getElement(), column);
			}

			if (allCells) {
				column.cells.forEach(function (cell) {
					_this66.layoutElement(cell.getElement(true), column);
				});
			}
		});
	};

	FrozenColumns.prototype.getColGroupParentElement = function (column) {
		return column.parent.isGroup ? this.getColGroupParentElement(column.parent) : column.getElement();
	};

	//layout columns appropropriatly
	FrozenColumns.prototype.layout = function () {
		var self = this,
		    rightMargin = 0;

		if (self.active) {

			//calculate row padding
			this.calcMargins();

			// self.table.rowManager.activeRows.forEach(function(row){
			// 	self.layoutRow(row);
			// });

			// if(self.table.options.dataTree){
			self.table.rowManager.getDisplayRows().forEach(function (row) {
				if (row.type === "row") {
					self.layoutRow(row);
				}
			});
			// }

			this.layoutCalcRows();

			//calculate left columns
			this.layoutColumnPosition(true);

			// if(tableHolder.scrollHeight > tableHolder.clientHeight){
			// 	rightMargin -= tableHolder.offsetWidth - tableHolder.clientWidth;
			// }

			this.table.rowManager.tableElement.style.marginRight = this.rightMargin;
		}
	};

	FrozenColumns.prototype.layoutRow = function (row) {
		var _this67 = this;

		var rowEl = row.getElement();

		rowEl.style.paddingLeft = this.leftMargin;
		// rowEl.style.paddingRight = this.rightMargin + "px";

		this.leftColumns.forEach(function (column) {
			var cell = row.getCell(column);

			if (cell) {
				_this67.layoutElement(cell.getElement(true), column);
			}
		});

		this.rightColumns.forEach(function (column) {
			var cell = row.getCell(column);

			if (cell) {
				_this67.layoutElement(cell.getElement(true), column);
			}
		});
	};

	FrozenColumns.prototype.layoutElement = function (element, column) {

		if (column.modules.frozen) {
			element.style.position = "absolute";
			element.style.left = column.modules.frozen.margin;

			element.classList.add("tabulator-frozen");

			if (column.modules.frozen.edge) {
				element.classList.add("tabulator-frozen-" + column.modules.frozen.position);
			}
		}
	};

	FrozenColumns.prototype._calcSpace = function (columns, index) {
		var width = 0;

		for (var _i12 = 0; _i12 < index; _i12++) {
			if (columns[_i12].visible) {
				width += columns[_i12].getWidth();
			}
		}

		return width;
	};

	Tabulator.prototype.registerModule("frozenColumns", FrozenColumns);
	var FrozenRows = function FrozenRows(table) {
		this.table = table; //hold Tabulator object
		this.topElement = document.createElement("div");
		this.rows = [];
		this.displayIndex = 0; //index in display pipeline
	};

	FrozenRows.prototype.initialize = function () {
		this.rows = [];

		this.topElement.classList.add("tabulator-frozen-rows-holder");

		// this.table.columnManager.element.append(this.topElement);
		this.table.columnManager.getElement().insertBefore(this.topElement, this.table.columnManager.headersElement.nextSibling);
	};

	FrozenRows.prototype.setDisplayIndex = function (index) {
		this.displayIndex = index;
	};

	FrozenRows.prototype.getDisplayIndex = function () {
		return this.displayIndex;
	};

	FrozenRows.prototype.isFrozen = function () {
		return !!this.rows.length;
	};

	//filter frozen rows out of display data
	FrozenRows.prototype.getRows = function (rows) {
		var self = this,
		    frozen = [],
		    output = rows.slice(0);

		this.rows.forEach(function (row) {
			var index = output.indexOf(row);

			if (index > -1) {
				output.splice(index, 1);
			}
		});

		return output;
	};

	FrozenRows.prototype.freezeRow = function (row) {
		if (!row.modules.frozen) {
			row.modules.frozen = true;
			this.topElement.appendChild(row.getElement());
			row.initialize();
			row.normalizeHeight();
			this.table.rowManager.adjustTableSize();

			this.rows.push(row);

			this.table.rowManager.refreshActiveData("display");

			this.styleRows();
		} else {
			console.warn("Freeze Error - Row is already frozen");
		}
	};

	FrozenRows.prototype.unfreezeRow = function (row) {
		var index = this.rows.indexOf(row);

		if (row.modules.frozen) {

			row.modules.frozen = false;

			this.detachRow(row);

			this.table.rowManager.adjustTableSize();

			this.table.rowManager.refreshActiveData("display");

			if (this.rows.length) {
				this.styleRows();
			}
		} else {
			console.warn("Freeze Error - Row is already unfrozen");
		}
	};

	FrozenRows.prototype.detachRow = function (row) {
		var index = this.rows.indexOf(row);

		if (index > -1) {
			var rowEl = row.getElement();
			rowEl.parentNode.removeChild(rowEl);

			this.rows.splice(index, 1);
		}
	};

	FrozenRows.prototype.styleRows = function (row) {
		var self = this;

		this.rows.forEach(function (row, i) {
			self.table.rowManager.styleRow(row, i);
		});
	};

	Tabulator.prototype.registerModule("frozenRows", FrozenRows);

	//public group object
	var GroupComponent = function GroupComponent(group) {
		this._group = group;
		this.type = "GroupComponent";
	};

	GroupComponent.prototype.getKey = function () {
		return this._group.key;
	};

	GroupComponent.prototype.getField = function () {
		return this._group.field;
	};

	GroupComponent.prototype.getElement = function () {
		return this._group.element;
	};

	GroupComponent.prototype.getRows = function () {
		return this._group.getRows(true);
	};

	GroupComponent.prototype.getSubGroups = function () {
		return this._group.getSubGroups(true);
	};

	GroupComponent.prototype.getParentGroup = function () {
		return this._group.parent ? this._group.parent.getComponent() : false;
	};

	GroupComponent.prototype.getVisibility = function () {
		console.warn("getVisibility function is deprecated, you should now use the isVisible function");
		return this._group.visible;
	};

	GroupComponent.prototype.isVisible = function () {
		return this._group.visible;
	};

	GroupComponent.prototype.show = function () {
		this._group.show();
	};

	GroupComponent.prototype.hide = function () {
		this._group.hide();
	};

	GroupComponent.prototype.toggle = function () {
		this._group.toggleVisibility();
	};

	GroupComponent.prototype._getSelf = function () {
		return this._group;
	};

	GroupComponent.prototype.getTable = function () {
		return this._group.groupManager.table;
	};

	//////////////////////////////////////////////////
	//////////////// Group Functions /////////////////
	//////////////////////////////////////////////////

	var Group = function Group(groupManager, parent, level, key, field, generator, oldGroup) {

		this.groupManager = groupManager;
		this.parent = parent;
		this.key = key;
		this.level = level;
		this.field = field;
		this.hasSubGroups = level < groupManager.groupIDLookups.length - 1;
		this.addRow = this.hasSubGroups ? this._addRowToGroup : this._addRow;
		this.type = "group"; //type of element
		this.old = oldGroup;
		this.rows = [];
		this.groups = [];
		this.groupList = [];
		this.generator = generator;
		this.elementContents = false;
		this.height = 0;
		this.outerHeight = 0;
		this.initialized = false;
		this.calcs = {};
		this.initialized = false;
		this.modules = {};
		this.arrowElement = false;

		this.visible = oldGroup ? oldGroup.visible : typeof groupManager.startOpen[level] !== "undefined" ? groupManager.startOpen[level] : groupManager.startOpen[0];

		this.component = null;

		this.createElements();
		this.addBindings();

		this.createValueGroups();
	};

	Group.prototype.wipe = function () {
		if (this.groupList.length) {
			this.groupList.forEach(function (group) {
				group.wipe();
			});
		} else {
			this.element = false;
			this.arrowElement = false;
			this.elementContents = false;
		}
	};

	Group.prototype.createElements = function () {
		var arrow = document.createElement("div");
		arrow.classList.add("tabulator-arrow");

		this.element = document.createElement("div");
		this.element.classList.add("tabulator-row");
		this.element.classList.add("tabulator-group");
		this.element.classList.add("tabulator-group-level-" + this.level);
		this.element.setAttribute("role", "rowgroup");

		this.arrowElement = document.createElement("div");
		this.arrowElement.classList.add("tabulator-group-toggle");
		this.arrowElement.appendChild(arrow);

		//setup movable rows
		if (this.groupManager.table.options.movableRows !== false && this.groupManager.table.modExists("moveRow")) {
			this.groupManager.table.modules.moveRow.initializeGroupHeader(this);
		}
	};

	Group.prototype.createValueGroups = function () {
		var _this68 = this;

		var level = this.level + 1;
		if (this.groupManager.allowedValues && this.groupManager.allowedValues[level]) {
			this.groupManager.allowedValues[level].forEach(function (value) {
				_this68._createGroup(value, level);
			});
		}
	};

	Group.prototype.addBindings = function () {
		var self = this,
		    dblTap,
		    tapHold,
		    tap,
		    toggleElement;

		//handle group click events
		if (self.groupManager.table.options.groupClick) {
			self.element.addEventListener("click", function (e) {
				self.groupManager.table.options.groupClick.call(self.groupManager.table, e, self.getComponent());
			});
		}

		if (self.groupManager.table.options.groupDblClick) {
			self.element.addEventListener("dblclick", function (e) {
				self.groupManager.table.options.groupDblClick.call(self.groupManager.table, e, self.getComponent());
			});
		}

		if (self.groupManager.table.options.groupContext) {
			self.element.addEventListener("contextmenu", function (e) {
				self.groupManager.table.options.groupContext.call(self.groupManager.table, e, self.getComponent());
			});
		}

		if ((self.groupManager.table.options.groupContextMenu || self.groupManager.table.options.groupClickMenu) && self.groupManager.table.modExists("menu")) {
			self.groupManager.table.modules.menu.initializeGroup.call(self.groupManager.table.modules.menu, self);
		}

		if (self.groupManager.table.options.groupTap) {

			tap = false;

			self.element.addEventListener("touchstart", function (e) {
				tap = true;
			}, { passive: true });

			self.element.addEventListener("touchend", function (e) {
				if (tap) {
					self.groupManager.table.options.groupTap(e, self.getComponent());
				}

				tap = false;
			});
		}

		if (self.groupManager.table.options.groupDblTap) {

			dblTap = null;

			self.element.addEventListener("touchend", function (e) {

				if (dblTap) {
					clearTimeout(dblTap);
					dblTap = null;

					self.groupManager.table.options.groupDblTap(e, self.getComponent());
				} else {

					dblTap = setTimeout(function () {
						clearTimeout(dblTap);
						dblTap = null;
					}, 300);
				}
			});
		}

		if (self.groupManager.table.options.groupTapHold) {

			tapHold = null;

			self.element.addEventListener("touchstart", function (e) {
				clearTimeout(tapHold);

				tapHold = setTimeout(function () {
					clearTimeout(tapHold);
					tapHold = null;
					tap = false;
					self.groupManager.table.options.groupTapHold(e, self.getComponent());
				}, 1000);
			}, { passive: true });

			self.element.addEventListener("touchend", function (e) {
				clearTimeout(tapHold);
				tapHold = null;
			});
		}

		if (self.groupManager.table.options.groupToggleElement) {
			toggleElement = self.groupManager.table.options.groupToggleElement == "arrow" ? self.arrowElement : self.element;

			toggleElement.addEventListener("click", function (e) {
				e.stopPropagation();
				e.stopImmediatePropagation();
				self.toggleVisibility();
			});
		}
	};

	Group.prototype._createGroup = function (groupID, level) {
		var groupKey = level + "_" + groupID;
		var group = new Group(this.groupManager, this, level, groupID, this.groupManager.groupIDLookups[level].field, this.groupManager.headerGenerator[level] || this.groupManager.headerGenerator[0], this.old ? this.old.groups[groupKey] : false);

		this.groups[groupKey] = group;
		this.groupList.push(group);
	};

	Group.prototype._addRowToGroup = function (row) {

		var level = this.level + 1;

		if (this.hasSubGroups) {
			var groupID = this.groupManager.groupIDLookups[level].func(row.getData()),
			    groupKey = level + "_" + groupID;

			if (this.groupManager.allowedValues && this.groupManager.allowedValues[level]) {
				if (this.groups[groupKey]) {
					this.groups[groupKey].addRow(row);
				}
			} else {
				if (!this.groups[groupKey]) {
					this._createGroup(groupID, level);
				}

				this.groups[groupKey].addRow(row);
			}
		}
	};

	Group.prototype._addRow = function (row) {
		this.rows.push(row);
		row.modules.group = this;
	};

	Group.prototype.insertRow = function (row, to, after) {
		var data = this.conformRowData({});

		row.updateData(data);

		var toIndex = this.rows.indexOf(to);

		if (toIndex > -1) {
			if (after) {
				this.rows.splice(toIndex + 1, 0, row);
			} else {
				this.rows.splice(toIndex, 0, row);
			}
		} else {
			if (after) {
				this.rows.push(row);
			} else {
				this.rows.unshift(row);
			}
		}

		row.modules.group = this;

		this.generateGroupHeaderContents();

		if (this.groupManager.table.modExists("columnCalcs") && this.groupManager.table.options.columnCalcs != "table") {
			this.groupManager.table.modules.columnCalcs.recalcGroup(this);
		}

		this.groupManager.updateGroupRows(true);
	};

	Group.prototype.scrollHeader = function (left) {
		this.arrowElement.style.marginLeft = left;

		this.groupList.forEach(function (child) {
			child.scrollHeader(left);
		});
	};

	Group.prototype.getRowIndex = function (row) {};

	//update row data to match grouping contraints
	Group.prototype.conformRowData = function (data) {
		if (this.field) {
			data[this.field] = this.key;
		} else {
			console.warn("Data Conforming Error - Cannot conform row data to match new group as groupBy is a function");
		}

		if (this.parent) {
			data = this.parent.conformRowData(data);
		}

		return data;
	};

	Group.prototype.removeRow = function (row) {
		var index = this.rows.indexOf(row);
		var el = row.getElement();

		if (index > -1) {
			this.rows.splice(index, 1);
		}

		if (!this.groupManager.table.options.groupValues && !this.rows.length) {
			if (this.parent) {
				this.parent.removeGroup(this);
			} else {
				this.groupManager.removeGroup(this);
			}

			this.groupManager.updateGroupRows(true);
		} else {

			if (el.parentNode) {
				el.parentNode.removeChild(el);
			}

			this.generateGroupHeaderContents();

			if (this.groupManager.table.modExists("columnCalcs") && this.groupManager.table.options.columnCalcs != "table") {
				this.groupManager.table.modules.columnCalcs.recalcGroup(this);
			}
		}
	};

	Group.prototype.removeGroup = function (group) {
		var groupKey = group.level + "_" + group.key,
		    index;

		if (this.groups[groupKey]) {
			delete this.groups[groupKey];

			index = this.groupList.indexOf(group);

			if (index > -1) {
				this.groupList.splice(index, 1);
			}

			if (!this.groupList.length) {
				if (this.parent) {
					this.parent.removeGroup(this);
				} else {
					this.groupManager.removeGroup(this);
				}
			}
		}
	};

	Group.prototype.getHeadersAndRows = function (noCalc) {
		var output = [];

		output.push(this);

		this._visSet();

		if (this.visible) {
			if (this.groupList.length) {
				this.groupList.forEach(function (group) {
					output = output.concat(group.getHeadersAndRows(noCalc));
				});
			} else {
				if (!noCalc && this.groupManager.table.options.columnCalcs != "table" && this.groupManager.table.modExists("columnCalcs") && this.groupManager.table.modules.columnCalcs.hasTopCalcs()) {
					if (this.calcs.top) {
						this.calcs.top.detachElement();
						this.calcs.top.deleteCells();
					}

					this.calcs.top = this.groupManager.table.modules.columnCalcs.generateTopRow(this.rows);
					output.push(this.calcs.top);
				}

				output = output.concat(this.rows);

				if (!noCalc && this.groupManager.table.options.columnCalcs != "table" && this.groupManager.table.modExists("columnCalcs") && this.groupManager.table.modules.columnCalcs.hasBottomCalcs()) {
					if (this.calcs.bottom) {
						this.calcs.bottom.detachElement();
						this.calcs.bottom.deleteCells();
					}

					this.calcs.bottom = this.groupManager.table.modules.columnCalcs.generateBottomRow(this.rows);
					output.push(this.calcs.bottom);
				}
			}
		} else {
			if (!this.groupList.length && this.groupManager.table.options.columnCalcs != "table") {

				if (this.groupManager.table.modExists("columnCalcs")) {

					if (!noCalc && this.groupManager.table.modules.columnCalcs.hasTopCalcs()) {
						if (this.calcs.top) {
							this.calcs.top.detachElement();
							this.calcs.top.deleteCells();
						}

						if (this.groupManager.table.options.groupClosedShowCalcs) {
							this.calcs.top = this.groupManager.table.modules.columnCalcs.generateTopRow(this.rows);
							output.push(this.calcs.top);
						}
					}

					if (!noCalc && this.groupManager.table.modules.columnCalcs.hasBottomCalcs()) {
						if (this.calcs.bottom) {
							this.calcs.bottom.detachElement();
							this.calcs.bottom.deleteCells();
						}

						if (this.groupManager.table.options.groupClosedShowCalcs) {
							this.calcs.bottom = this.groupManager.table.modules.columnCalcs.generateBottomRow(this.rows);
							output.push(this.calcs.bottom);
						}
					}
				}
			}
		}

		return output;
	};

	Group.prototype.getData = function (visible, transform) {
		var self = this,
		    output = [];

		this._visSet();

		if (!visible || visible && this.visible) {
			this.rows.forEach(function (row) {
				output.push(row.getData(transform || "data"));
			});
		}

		return output;
	};

	// Group.prototype.getRows = function(){
	// 	this._visSet();

	// 	return this.visible ? this.rows : [];
	// };

	Group.prototype.getRowCount = function () {
		var count = 0;

		if (this.groupList.length) {
			this.groupList.forEach(function (group) {
				count += group.getRowCount();
			});
		} else {
			count = this.rows.length;
		}
		return count;
	};

	Group.prototype.toggleVisibility = function () {
		if (this.visible) {
			this.hide();
		} else {
			this.show();
		}
	};

	Group.prototype.hide = function () {
		this.visible = false;

		if (this.groupManager.table.rowManager.getRenderMode() == "classic" && !this.groupManager.table.options.pagination) {

			this.element.classList.remove("tabulator-group-visible");

			if (this.groupList.length) {
				this.groupList.forEach(function (group) {

					var rows = group.getHeadersAndRows();

					rows.forEach(function (row) {
						row.detachElement();
					});
				});
			} else {
				this.rows.forEach(function (row) {
					var rowEl = row.getElement();
					rowEl.parentNode.removeChild(rowEl);
				});
			}

			this.groupManager.table.rowManager.setDisplayRows(this.groupManager.updateGroupRows(), this.groupManager.getDisplayIndex());

			this.groupManager.table.rowManager.checkClassicModeGroupHeaderWidth();
		} else {
			this.groupManager.updateGroupRows(true);
		}

		this.groupManager.table.options.groupVisibilityChanged.call(this.table, this.getComponent(), false);
	};

	Group.prototype.show = function () {
		var self = this;

		self.visible = true;

		if (this.groupManager.table.rowManager.getRenderMode() == "classic" && !this.groupManager.table.options.pagination) {

			this.element.classList.add("tabulator-group-visible");

			var prev = self.getElement();

			if (this.groupList.length) {
				this.groupList.forEach(function (group) {
					var rows = group.getHeadersAndRows();

					rows.forEach(function (row) {
						var rowEl = row.getElement();
						prev.parentNode.insertBefore(rowEl, prev.nextSibling);
						row.initialize();
						prev = rowEl;
					});
				});
			} else {
				self.rows.forEach(function (row) {
					var rowEl = row.getElement();
					prev.parentNode.insertBefore(rowEl, prev.nextSibling);
					row.initialize();
					prev = rowEl;
				});
			}

			this.groupManager.table.rowManager.setDisplayRows(this.groupManager.updateGroupRows(), this.groupManager.getDisplayIndex());

			this.groupManager.table.rowManager.checkClassicModeGroupHeaderWidth();
		} else {
			this.groupManager.updateGroupRows(true);
		}

		this.groupManager.table.options.groupVisibilityChanged.call(this.table, this.getComponent(), true);
	};

	Group.prototype._visSet = function () {
		var data = [];

		if (typeof this.visible == "function") {

			this.rows.forEach(function (row) {
				data.push(row.getData());
			});

			this.visible = this.visible(this.key, this.getRowCount(), data, this.getComponent());
		}
	};

	Group.prototype.getRowGroup = function (row) {
		var match = false;
		if (this.groupList.length) {
			this.groupList.forEach(function (group) {
				var result = group.getRowGroup(row);

				if (result) {
					match = result;
				}
			});
		} else {
			if (this.rows.find(function (item) {
				return item === row;
			})) {
				match = this;
			}
		}

		return match;
	};

	Group.prototype.getSubGroups = function (component) {
		var output = [];

		this.groupList.forEach(function (child) {
			output.push(component ? child.getComponent() : child);
		});

		return output;
	};

	Group.prototype.getRows = function (compoment) {
		var output = [];

		this.rows.forEach(function (row) {
			output.push(compoment ? row.getComponent() : row);
		});

		return output;
	};

	Group.prototype.generateGroupHeaderContents = function () {
		var data = [];

		this.rows.forEach(function (row) {
			data.push(row.getData());
		});

		this.elementContents = this.generator(this.key, this.getRowCount(), data, this.getComponent());

		while (this.element.firstChild) {
			this.element.removeChild(this.element.firstChild);
		}if (typeof this.elementContents === "string") {
			this.element.innerHTML = this.elementContents;
		} else {
			this.element.appendChild(this.elementContents);
		}

		this.element.insertBefore(this.arrowElement, this.element.firstChild);
	};

	Group.prototype.getPath = function () {
		var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

		path.unshift(this.key);
		if (this.parent) {
			this.parent.getPath(path);
		}
		return path;
	};
	////////////// Standard Row Functions //////////////

	Group.prototype.getElement = function () {
		this.addBindingsd = false;

		this._visSet();

		if (this.visible) {
			this.element.classList.add("tabulator-group-visible");
		} else {
			this.element.classList.remove("tabulator-group-visible");
		}

		for (var i = 0; i < this.element.childNodes.length; ++i) {
			this.element.childNodes[i].parentNode.removeChild(this.element.childNodes[i]);
		}

		this.generateGroupHeaderContents();

		// this.addBindings();

		return this.element;
	};

	Group.prototype.detachElement = function () {
		if (this.element && this.element.parentNode) {
			this.element.parentNode.removeChild(this.element);
		}
	};

	//normalize the height of elements in the row
	Group.prototype.normalizeHeight = function () {
		this.setHeight(this.element.clientHeight);
	};

	Group.prototype.initialize = function (force) {
		if (!this.initialized || force) {
			this.normalizeHeight();
			this.initialized = true;
		}
	};

	Group.prototype.reinitialize = function () {
		this.initialized = false;
		this.height = 0;

		if (Tabulator.prototype.helpers.elVisible(this.element)) {
			this.initialize(true);
		}
	};

	Group.prototype.setHeight = function (height) {
		if (this.height != height) {
			this.height = height;
			this.outerHeight = this.element.offsetHeight;
		}
	};

	//return rows outer height
	Group.prototype.getHeight = function () {
		return this.outerHeight;
	};

	Group.prototype.getGroup = function () {
		return this;
	};

	Group.prototype.reinitializeHeight = function () {};
	Group.prototype.calcHeight = function () {};
	Group.prototype.setCellHeight = function () {};
	Group.prototype.clearCellHeight = function () {};

	//////////////// Object Generation /////////////////
	Group.prototype.getComponent = function () {
		if (!this.component) {
			this.component = new GroupComponent(this);
		}

		return this.component;
	};

	//////////////////////////////////////////////////
	////////////// Group Row Extension ///////////////
	//////////////////////////////////////////////////

	var GroupRows = function GroupRows(table) {

		this.table = table; //hold Tabulator object

		this.groupIDLookups = false; //enable table grouping and set field to group by
		this.startOpen = [function () {
			return false;
		}]; //starting state of group
		this.headerGenerator = [function () {
			return "";
		}];
		this.groupList = []; //ordered list of groups
		this.allowedValues = false;
		this.groups = {}; //hold row groups
		this.displayIndex = 0; //index in display pipeline
	};

	//initialize group configuration
	GroupRows.prototype.initialize = function () {
		var self = this,
		    groupBy = self.table.options.groupBy,
		    startOpen = self.table.options.groupStartOpen,
		    groupHeader = self.table.options.groupHeader;

		this.allowedValues = self.table.options.groupValues;

		if (Array.isArray(groupBy) && Array.isArray(groupHeader) && groupBy.length > groupHeader.length) {
			console.warn("Error creating group headers, groupHeader array is shorter than groupBy array");
		}

		self.headerGenerator = [function () {
			return "";
		}];
		this.startOpen = [function () {
			return false;
		}]; //starting state of group

		self.table.modules.localize.bind("groups|item", function (langValue, lang) {
			self.headerGenerator[0] = function (value, count, data) {
				//header layout function
				return (typeof value === "undefined" ? "" : value) + "<span>(" + count + " " + (count === 1 ? langValue : lang.groups.items) + ")</span>";
			};
		});

		this.groupIDLookups = [];

		if (Array.isArray(groupBy) || groupBy) {
			if (this.table.modExists("columnCalcs") && this.table.options.columnCalcs != "table" && this.table.options.columnCalcs != "both") {
				this.table.modules.columnCalcs.removeCalcs();
			}
		} else {
			if (this.table.modExists("columnCalcs") && this.table.options.columnCalcs != "group") {

				var cols = this.table.columnManager.getRealColumns();

				cols.forEach(function (col) {
					if (col.definition.topCalc) {
						self.table.modules.columnCalcs.initializeTopRow();
					}

					if (col.definition.bottomCalc) {
						self.table.modules.columnCalcs.initializeBottomRow();
					}
				});
			}
		}

		if (!Array.isArray(groupBy)) {
			groupBy = [groupBy];
		}

		groupBy.forEach(function (group, i) {
			var lookupFunc, column;

			if (typeof group == "function") {
				lookupFunc = group;
			} else {
				column = self.table.columnManager.getColumnByField(group);

				if (column) {
					lookupFunc = function lookupFunc(data) {
						return column.getFieldValue(data);
					};
				} else {
					lookupFunc = function lookupFunc(data) {
						return data[group];
					};
				}
			}

			self.groupIDLookups.push({
				field: typeof group === "function" ? false : group,
				func: lookupFunc,
				values: self.allowedValues ? self.allowedValues[i] : false
			});
		});

		if (startOpen) {

			if (!Array.isArray(startOpen)) {
				startOpen = [startOpen];
			}

			startOpen.forEach(function (level) {
				level = typeof level == "function" ? level : function () {
					return true;
				};
			});

			self.startOpen = startOpen;
		}

		if (groupHeader) {
			self.headerGenerator = Array.isArray(groupHeader) ? groupHeader : [groupHeader];
		}

		this.initialized = true;
	};

	GroupRows.prototype.setDisplayIndex = function (index) {
		this.displayIndex = index;
	};

	GroupRows.prototype.getDisplayIndex = function () {
		return this.displayIndex;
	};

	//return appropriate rows with group headers
	GroupRows.prototype.getRows = function (rows) {
		if (this.groupIDLookups.length) {

			this.table.options.dataGrouping.call(this.table);

			this.generateGroups(rows);

			if (this.table.options.dataGrouped) {
				this.table.options.dataGrouped.call(this.table, this.getGroups(true));
			}

			return this.updateGroupRows();
		} else {
			return rows.slice(0);
		}
	};

	GroupRows.prototype.getGroups = function (compoment) {
		var groupComponents = [];

		this.groupList.forEach(function (group) {
			groupComponents.push(compoment ? group.getComponent() : group);
		});

		return groupComponents;
	};

	GroupRows.prototype.getChildGroups = function (group) {
		var _this69 = this;

		var groupComponents = [];

		if (!group) {
			group = this;
		}

		group.groupList.forEach(function (child) {
			if (child.groupList.length) {
				groupComponents = groupComponents.concat(_this69.getChildGroups(child));
			} else {
				groupComponents.push(child);
			}
		});

		return groupComponents;
	};

	GroupRows.prototype.wipe = function () {
		this.groupList.forEach(function (group) {
			group.wipe();
		});
	};

	GroupRows.prototype.pullGroupListData = function (groupList) {
		var self = this;
		var groupListData = [];

		groupList.forEach(function (group) {
			var groupHeader = {};
			groupHeader.level = 0;
			groupHeader.rowCount = 0;
			groupHeader.headerContent = "";
			var childData = [];

			if (group.hasSubGroups) {
				childData = self.pullGroupListData(group.groupList);

				groupHeader.level = group.level;
				groupHeader.rowCount = childData.length - group.groupList.length; // data length minus number of sub-headers
				groupHeader.headerContent = group.generator(group.key, groupHeader.rowCount, group.rows, group);

				groupListData.push(groupHeader);
				groupListData = groupListData.concat(childData);
			} else {
				groupHeader.level = group.level;
				groupHeader.headerContent = group.generator(group.key, group.rows.length, group.rows, group);
				groupHeader.rowCount = group.getRows().length;

				groupListData.push(groupHeader);

				group.getRows().forEach(function (row) {
					groupListData.push(row.getData("data"));
				});
			}
		});

		return groupListData;
	};

	GroupRows.prototype.getGroupedData = function () {

		return this.pullGroupListData(this.groupList);
	};

	GroupRows.prototype.getRowGroup = function (row) {
		var match = false;

		this.groupList.forEach(function (group) {
			var result = group.getRowGroup(row);

			if (result) {
				match = result;
			}
		});

		return match;
	};

	GroupRows.prototype.countGroups = function () {
		return this.groupList.length;
	};

	GroupRows.prototype.generateGroups = function (rows) {
		var self = this,
		    oldGroups = self.groups;

		self.groups = {};
		self.groupList = [];

		if (this.allowedValues && this.allowedValues[0]) {
			this.allowedValues[0].forEach(function (value) {
				self.createGroup(value, 0, oldGroups);
			});

			rows.forEach(function (row) {
				self.assignRowToExistingGroup(row, oldGroups);
			});
		} else {
			rows.forEach(function (row) {
				self.assignRowToGroup(row, oldGroups);
			});
		}
	};

	GroupRows.prototype.createGroup = function (groupID, level, oldGroups) {
		var groupKey = level + "_" + groupID,
		    group;

		oldGroups = oldGroups || [];

		group = new Group(this, false, level, groupID, this.groupIDLookups[0].field, this.headerGenerator[0], oldGroups[groupKey]);

		this.groups[groupKey] = group;
		this.groupList.push(group);
	};

	// GroupRows.prototype.assignRowToGroup = function(row, oldGroups){
	// 	var groupID = this.groupIDLookups[0].func(row.getData()),
	// 	groupKey = "0_" + groupID;

	// 	if(!this.groups[groupKey]){
	// 		this.createGroup(groupID, 0, oldGroups);
	// 	}

	// 	this.groups[groupKey].addRow(row);
	// };

	GroupRows.prototype.assignRowToExistingGroup = function (row, oldGroups) {
		var groupID = this.groupIDLookups[0].func(row.getData()),
		    groupKey = "0_" + groupID;

		if (this.groups[groupKey]) {
			this.groups[groupKey].addRow(row);
		}
	};

	GroupRows.prototype.assignRowToGroup = function (row, oldGroups) {
		var groupID = this.groupIDLookups[0].func(row.getData()),
		    newGroupNeeded = !this.groups["0_" + groupID];

		if (newGroupNeeded) {
			this.createGroup(groupID, 0, oldGroups);
		}

		this.groups["0_" + groupID].addRow(row);

		return !newGroupNeeded;
	};

	GroupRows.prototype.reassignRowToGroup = function (row) {
		var oldRowGroup = row.getGroup(),
		    oldGroupPath = oldRowGroup.getPath(),
		    newGroupPath = this.getExpectedPath(row),
		    samePath = true;
		// figure out if new group path is the same as old group path
		var samePath = oldGroupPath.length == newGroupPath.length && oldGroupPath.every(function (element, index) {
			return element === newGroupPath[index];
		});
		// refresh if they new path and old path aren't the same (aka the row's groupings have changed)
		if (!samePath) {
			oldRowGroup.removeRow(row);
			this.assignRowToGroup(row, self.groups);
			this.table.rowManager.refreshActiveData("group", false, true);
		}
	};

	GroupRows.prototype.getExpectedPath = function (row) {
		var groupPath = [],
		    rowData = row.getData();
		this.groupIDLookups.forEach(function (groupId) {
			groupPath.push(groupId.func(rowData));
		});
		return groupPath;
	};

	GroupRows.prototype.updateGroupRows = function (force) {
		var self = this,
		    output = [],
		    oldRowCount;

		self.groupList.forEach(function (group) {
			output = output.concat(group.getHeadersAndRows());
		});

		//force update of table display
		if (force) {

			var displayIndex = self.table.rowManager.setDisplayRows(output, this.getDisplayIndex());

			if (displayIndex !== true) {
				this.setDisplayIndex(displayIndex);
			}

			self.table.rowManager.refreshActiveData("group", true, true);
		}

		return output;
	};

	GroupRows.prototype.scrollHeaders = function (left) {
		if (this.table.options.virtualDomHoz) {
			left -= this.table.vdomHoz.vDomPadLeft;
		}

		left = left + "px";

		this.groupList.forEach(function (group) {
			group.scrollHeader(left);
		});
	};

	GroupRows.prototype.removeGroup = function (group) {
		var groupKey = group.level + "_" + group.key,
		    index;

		if (this.groups[groupKey]) {
			delete this.groups[groupKey];

			index = this.groupList.indexOf(group);

			if (index > -1) {
				this.groupList.splice(index, 1);
			}
		}
	};

	Tabulator.prototype.registerModule("groupRows", GroupRows);
	var History = function History(table) {
		this.table = table; //hold Tabulator object

		this.history = [];
		this.index = -1;
	};

	History.prototype.clear = function () {
		this.history = [];
		this.index = -1;
	};

	History.prototype.action = function (type, component, data) {

		this.history = this.history.slice(0, this.index + 1);

		this.history.push({
			type: type,
			component: component,
			data: data
		});

		this.index++;
	};

	History.prototype.getHistoryUndoSize = function () {
		return this.index + 1;
	};

	History.prototype.getHistoryRedoSize = function () {
		return this.history.length - (this.index + 1);
	};

	History.prototype.clearComponentHistory = function (component) {
		var index = this.history.findIndex(function (item) {
			return item.component === component;
		});

		if (index > -1) {
			this.history.splice(index, 1);
			if (index <= this.index) {
				this.index--;
			}

			this.clearComponentHistory(component);
		}
	};

	History.prototype.undo = function () {

		if (this.index > -1) {
			var action = this.history[this.index];

			this.undoers[action.type].call(this, action);

			this.index--;

			this.table.options.historyUndo.call(this.table, action.type, action.component.getComponent(), action.data);

			return true;
		} else {
			console.warn("History Undo Error - No more history to undo");
			return false;
		}
	};

	History.prototype.redo = function () {
		if (this.history.length - 1 > this.index) {

			this.index++;

			var action = this.history[this.index];

			this.redoers[action.type].call(this, action);

			this.table.options.historyRedo.call(this.table, action.type, action.component.getComponent(), action.data);

			return true;
		} else {
			console.warn("History Redo Error - No more history to redo");
			return false;
		}
	};

	History.prototype.undoers = {
		cellEdit: function cellEdit(action) {
			action.component.setValueProcessData(action.data.oldValue);
		},

		rowAdd: function rowAdd(action) {
			action.component.deleteActual();
		},

		rowDelete: function rowDelete(action) {
			var newRow = this.table.rowManager.addRowActual(action.data.data, action.data.pos, action.data.index);

			if (this.table.options.groupBy && this.table.modExists("groupRows")) {
				this.table.modules.groupRows.updateGroupRows(true);
			}

			this._rebindRow(action.component, newRow);
		},

		rowMove: function rowMove(action) {
			this.table.rowManager.moveRowActual(action.component, this.table.rowManager.rows[action.data.posFrom], !action.data.after);
			this.table.rowManager.redraw();
		}
	};

	History.prototype.redoers = {
		cellEdit: function cellEdit(action) {
			action.component.setValueProcessData(action.data.newValue);
		},

		rowAdd: function rowAdd(action) {
			var newRow = this.table.rowManager.addRowActual(action.data.data, action.data.pos, action.data.index);

			if (this.table.options.groupBy && this.table.modExists("groupRows")) {
				this.table.modules.groupRows.updateGroupRows(true);
			}

			this._rebindRow(action.component, newRow);
		},

		rowDelete: function rowDelete(action) {
			action.component.deleteActual();
		},

		rowMove: function rowMove(action) {
			this.table.rowManager.moveRowActual(action.component, this.table.rowManager.rows[action.data.posTo], action.data.after);
			this.table.rowManager.redraw();
		}
	};

	//rebind rows to new element after deletion
	History.prototype._rebindRow = function (oldRow, newRow) {
		this.history.forEach(function (action) {
			if (action.component instanceof Row) {
				if (action.component === oldRow) {
					action.component = newRow;
				}
			} else if (action.component instanceof Cell) {
				if (action.component.row === oldRow) {
					var field = action.component.column.getField();

					if (field) {
						action.component = newRow.getCell(field);
					}
				}
			}
		});
	};

	Tabulator.prototype.registerModule("history", History);
	var HtmlTableImport = function HtmlTableImport(table) {
		this.table = table; //hold Tabulator object
		this.fieldIndex = [];
		this.hasIndex = false;
	};

	HtmlTableImport.prototype.parseTable = function () {
		var self = this,
		    element = self.table.element,
		    options = self.table.options,
		    columns = options.columns,
		    headers = element.getElementsByTagName("th"),
		    rows = element.getElementsByTagName("tbody")[0],
		    data = [],
		    newTable;

		self.hasIndex = false;

		self.table.options.htmlImporting.call(this.table);

		rows = rows ? rows.getElementsByTagName("tr") : [];

		//check for tablator inline options
		self._extractOptions(element, options);

		if (headers.length) {
			self._extractHeaders(headers, rows);
		} else {
			self._generateBlankHeaders(headers, rows);
		}

		//iterate through table rows and build data set
		for (var index = 0; index < rows.length; index++) {
			var row = rows[index],
			    cells = row.getElementsByTagName("td"),
			    item = {};

			//create index if the dont exist in table
			if (!self.hasIndex) {
				item[options.index] = index;
			}

			for (var i = 0; i < cells.length; i++) {
				var cell = cells[i];
				if (typeof this.fieldIndex[i] !== "undefined") {
					item[this.fieldIndex[i]] = cell.innerHTML;
				}
			}

			//add row data to item
			data.push(item);
		}

		//create new element
		var newElement = document.createElement("div");

		//transfer attributes to new element
		var attributes = element.attributes;

		// loop through attributes and apply them on div

		for (var i in attributes) {
			if (_typeof(attributes[i]) == "object") {
				newElement.setAttribute(attributes[i].name, attributes[i].value);
			}
		}

		// replace table with div element
		element.parentNode.replaceChild(newElement, element);

		options.data = data;

		self.table.options.htmlImported.call(this.table);

		// // newElement.tabulator(options);

		this.table.element = newElement;
	};

	//extract tabulator attribute options
	HtmlTableImport.prototype._extractOptions = function (element, options, defaultOptions) {
		var attributes = element.attributes;
		var optionsArr = defaultOptions ? Object.assign([], defaultOptions) : Object.keys(options);
		var optionsList = {};

		optionsArr.forEach(function (item) {
			optionsList[item.toLowerCase()] = item;
		});

		for (var index in attributes) {
			var attrib = attributes[index];
			var name;

			if (attrib && (typeof attrib === 'undefined' ? 'undefined' : _typeof(attrib)) == "object" && attrib.name && attrib.name.indexOf("tabulator-") === 0) {
				name = attrib.name.replace("tabulator-", "");

				if (typeof optionsList[name] !== "undefined") {
					options[optionsList[name]] = this._attribValue(attrib.value);
				}
			}
		}
	};

	//get value of attribute
	HtmlTableImport.prototype._attribValue = function (value) {
		if (value === "true") {
			return true;
		}

		if (value === "false") {
			return false;
		}

		return value;
	};

	//find column if it has already been defined
	HtmlTableImport.prototype._findCol = function (title) {
		var match = this.table.options.columns.find(function (column) {
			return column.title === title;
		});

		return match || false;
	};

	//extract column from headers
	HtmlTableImport.prototype._extractHeaders = function (headers, rows) {
		for (var index = 0; index < headers.length; index++) {
			var header = headers[index],
			    exists = false,
			    col = this._findCol(header.textContent),
			    width,
			    attributes;

			if (col) {
				exists = true;
			} else {
				col = { title: header.textContent.trim() };
			}

			if (!col.field) {
				col.field = header.textContent.trim().toLowerCase().replace(" ", "_");
			}

			width = header.getAttribute("width");

			if (width && !col.width) {
				col.width = width;
			}

			//check for tablator inline options
			attributes = header.attributes;

			// //check for tablator inline options
			this._extractOptions(header, col, Column.prototype.defaultOptionList);

			this.fieldIndex[index] = col.field;

			if (col.field == this.table.options.index) {
				this.hasIndex = true;
			}

			if (!exists) {
				this.table.options.columns.push(col);
			}
		}
	};

	//generate blank headers
	HtmlTableImport.prototype._generateBlankHeaders = function (headers, rows) {
		for (var index = 0; index < headers.length; index++) {
			var header = headers[index],
			    col = { title: "", field: "col" + index };

			this.fieldIndex[index] = col.field;

			var width = header.getAttribute("width");

			if (width) {
				col.width = width;
			}

			this.table.options.columns.push(col);
		}
	};

	Tabulator.prototype.registerModule("htmlTableImport", HtmlTableImport);
	var Keybindings = function Keybindings(table) {
		this.table = table; //hold Tabulator object
		this.watchKeys = null;
		this.pressedKeys = null;
		this.keyupBinding = false;
		this.keydownBinding = false;
	};

	Keybindings.prototype.initialize = function () {
		var bindings = this.table.options.keybindings,
		    mergedBindings = {};

		this.watchKeys = {};
		this.pressedKeys = [];

		if (bindings !== false) {

			for (var key in this.bindings) {
				mergedBindings[key] = this.bindings[key];
			}

			if (Object.keys(bindings).length) {

				for (var _key in bindings) {
					mergedBindings[_key] = bindings[_key];
				}
			}

			this.mapBindings(mergedBindings);
			this.bindEvents();
		}
	};

	Keybindings.prototype.mapBindings = function (bindings) {
		var _this70 = this;

		var self = this;

		var _loop2 = function _loop2(key) {

			if (_this70.actions[key]) {

				if (bindings[key]) {

					if (_typeof(bindings[key]) !== "object") {
						bindings[key] = [bindings[key]];
					}

					bindings[key].forEach(function (binding) {
						self.mapBinding(key, binding);
					});
				}
			} else {
				console.warn("Key Binding Error - no such action:", key);
			}
		};

		for (var key in bindings) {
			_loop2(key);
		}
	};

	Keybindings.prototype.mapBinding = function (action, symbolsList) {
		var self = this;

		var binding = {
			action: this.actions[action],
			keys: [],
			ctrl: false,
			shift: false,
			meta: false
		};

		var symbols = symbolsList.toString().toLowerCase().split(" ").join("").split("+");

		symbols.forEach(function (symbol) {
			switch (symbol) {
				case "ctrl":
					binding.ctrl = true;
					break;

				case "shift":
					binding.shift = true;
					break;

				case "meta":
					binding.meta = true;
					break;

				default:
					symbol = parseInt(symbol);
					binding.keys.push(symbol);

					if (!self.watchKeys[symbol]) {
						self.watchKeys[symbol] = [];
					}

					self.watchKeys[symbol].push(binding);
			}
		});
	};

	Keybindings.prototype.bindEvents = function () {
		var self = this;

		this.keyupBinding = function (e) {
			var code = e.keyCode;
			var bindings = self.watchKeys[code];

			if (bindings) {

				self.pressedKeys.push(code);

				bindings.forEach(function (binding) {
					self.checkBinding(e, binding);
				});
			}
		};

		this.keydownBinding = function (e) {
			var code = e.keyCode;
			var bindings = self.watchKeys[code];

			if (bindings) {

				var index = self.pressedKeys.indexOf(code);

				if (index > -1) {
					self.pressedKeys.splice(index, 1);
				}
			}
		};

		this.table.element.addEventListener("keydown", this.keyupBinding);

		this.table.element.addEventListener("keyup", this.keydownBinding);
	};

	Keybindings.prototype.clearBindings = function () {
		if (this.keyupBinding) {
			this.table.element.removeEventListener("keydown", this.keyupBinding);
		}

		if (this.keydownBinding) {
			this.table.element.removeEventListener("keyup", this.keydownBinding);
		}
	};

	Keybindings.prototype.checkBinding = function (e, binding) {
		var self = this,
		    match = true;

		if (e.ctrlKey == binding.ctrl && e.shiftKey == binding.shift && e.metaKey == binding.meta) {
			binding.keys.forEach(function (key) {
				var index = self.pressedKeys.indexOf(key);

				if (index == -1) {
					match = false;
				}
			});

			if (match) {
				binding.action.call(self, e);
			}

			return true;
		}

		return false;
	};

	//default bindings
	Keybindings.prototype.bindings = {
		navPrev: "shift + 9",
		navNext: 9,
		navUp: 38,
		navDown: 40,
		scrollPageUp: 33,
		scrollPageDown: 34,
		scrollToStart: 36,
		scrollToEnd: 35,
		undo: "ctrl + 90",
		redo: "ctrl + 89",
		copyToClipboard: "ctrl + 67"
	};

	//default actions
	Keybindings.prototype.actions = {
		keyBlock: function keyBlock(e) {
			e.stopPropagation();
			e.preventDefault();
		},
		scrollPageUp: function scrollPageUp(e) {
			var rowManager = this.table.rowManager,
			    newPos = rowManager.scrollTop - rowManager.height,
			    scrollMax = rowManager.element.scrollHeight;

			e.preventDefault();

			if (rowManager.displayRowsCount) {
				if (newPos >= 0) {
					rowManager.element.scrollTop = newPos;
				} else {
					rowManager.scrollToRow(rowManager.getDisplayRows()[0]);
				}
			}

			this.table.element.focus();
		},
		scrollPageDown: function scrollPageDown(e) {
			var rowManager = this.table.rowManager,
			    newPos = rowManager.scrollTop + rowManager.height,
			    scrollMax = rowManager.element.scrollHeight;

			e.preventDefault();

			if (rowManager.displayRowsCount) {
				if (newPos <= scrollMax) {
					rowManager.element.scrollTop = newPos;
				} else {
					rowManager.scrollToRow(rowManager.getDisplayRows()[rowManager.displayRowsCount - 1]);
				}
			}

			this.table.element.focus();
		},
		scrollToStart: function scrollToStart(e) {
			var rowManager = this.table.rowManager;

			e.preventDefault();

			if (rowManager.displayRowsCount) {
				rowManager.scrollToRow(rowManager.getDisplayRows()[0]);
			}

			this.table.element.focus();
		},
		scrollToEnd: function scrollToEnd(e) {
			var rowManager = this.table.rowManager;

			e.preventDefault();

			if (rowManager.displayRowsCount) {
				rowManager.scrollToRow(rowManager.getDisplayRows()[rowManager.displayRowsCount - 1]);
			}

			this.table.element.focus();
		},
		navPrev: function navPrev(e) {
			var cell = false;

			if (this.table.modExists("edit")) {
				cell = this.table.modules.edit.currentCell;

				if (cell) {
					e.preventDefault();
					cell.nav().prev();
				}
			}
		},

		navNext: function navNext(e) {
			var cell = false;
			var newRow = this.table.options.tabEndNewRow;
			var nav;

			if (this.table.modExists("edit")) {
				cell = this.table.modules.edit.currentCell;

				if (cell) {
					e.preventDefault();

					nav = cell.nav();

					if (!nav.next()) {
						if (newRow) {

							cell.getElement().firstChild.blur();

							if (newRow === true) {
								newRow = this.table.addRow({});
							} else {
								if (typeof newRow == "function") {
									newRow = this.table.addRow(newRow(cell.row.getComponent()));
								} else {
									newRow = this.table.addRow(Object.assign({}, newRow));
								}
							}

							newRow.then(function () {
								setTimeout(function () {
									nav.next();
								});
							});
						}
					}
				}
			}
		},

		navLeft: function navLeft(e) {
			var cell = false;

			if (this.table.modExists("edit")) {
				cell = this.table.modules.edit.currentCell;

				if (cell) {
					e.preventDefault();
					cell.nav().left();
				}
			}
		},

		navRight: function navRight(e) {
			var cell = false;

			if (this.table.modExists("edit")) {
				cell = this.table.modules.edit.currentCell;

				if (cell) {
					e.preventDefault();
					cell.nav().right();
				}
			}
		},

		navUp: function navUp(e) {
			var cell = false;

			if (this.table.modExists("edit")) {
				cell = this.table.modules.edit.currentCell;

				if (cell) {
					e.preventDefault();
					cell.nav().up();
				}
			}
		},

		navDown: function navDown(e) {
			var cell = false;

			if (this.table.modExists("edit")) {
				cell = this.table.modules.edit.currentCell;

				if (cell) {
					e.preventDefault();
					cell.nav().down();
				}
			}
		},

		undo: function undo(e) {
			var cell = false;
			if (this.table.options.history && this.table.modExists("history") && this.table.modExists("edit")) {

				cell = this.table.modules.edit.currentCell;

				if (!cell) {
					e.preventDefault();
					this.table.modules.history.undo();
				}
			}
		},

		redo: function redo(e) {
			var cell = false;
			if (this.table.options.history && this.table.modExists("history") && this.table.modExists("edit")) {

				cell = this.table.modules.edit.currentCell;

				if (!cell) {
					e.preventDefault();
					this.table.modules.history.redo();
				}
			}
		},

		copyToClipboard: function copyToClipboard(e) {
			if (!this.table.modules.edit.currentCell) {
				if (this.table.modExists("clipboard", true)) {
					this.table.modules.clipboard.copy(false, true);
				}
			}
		}
	};

	Tabulator.prototype.registerModule("keybindings", Keybindings);
	var Menu = function Menu(table) {
		this.table = table; //hold Tabulator object
		this.menuElements = [];
		this.blurEvent = this.hideMenu.bind(this);
		this.escEvent = this.escMenu.bind(this);
		this.nestedMenuBlock = false;
		this.positionReversedX = false;
	};

	Menu.prototype.initializeColumnHeader = function (column) {
		var _this71 = this;

		var headerMenuEl;

		if (column.definition.headerContextMenu) {
			column.getElement().addEventListener("contextmenu", this.LoadMenuEvent.bind(this, column, column.definition.headerContextMenu));
			this.tapHold(column, column.definition.headerContextMenu);
		}

		// if(column.definition.headerClickMenu){
		// 	column.getElement().addEventListener("click", this.LoadMenuEvent.bind(this, column, column.definition.headerClickMenu));
		// }

		if (column.definition.headerMenu) {

			headerMenuEl = document.createElement("span");
			headerMenuEl.classList.add("tabulator-header-menu-button");
			headerMenuEl.innerHTML = "&vellip;";

			headerMenuEl.addEventListener("click", function (e) {
				e.stopPropagation();
				e.preventDefault();

				_this71.LoadMenuEvent(column, column.definition.headerMenu, e);
			});

			column.titleElement.insertBefore(headerMenuEl, column.titleElement.firstChild);
		}
	};

	Menu.prototype.LoadMenuEvent = function (component, menu, e) {
		menu = typeof menu == "function" ? menu.call(this.table, component.getComponent(), e) : menu;

		// if(component instanceof Cell){
		// 	e.stopImmediatePropagation();
		// }

		this.loadMenu(e, component, menu);
	};

	Menu.prototype.tapHold = function (component, menu) {
		var _this72 = this;

		var element = component.getElement(),
		    tapHold = null,
		    loaded = false;

		element.addEventListener("touchstart", function (e) {
			clearTimeout(tapHold);
			loaded = false;

			tapHold = setTimeout(function () {
				clearTimeout(tapHold);
				tapHold = null;
				loaded = true;

				_this72.LoadMenuEvent(component, menu, e);
			}, 1000);
		}, { passive: true });

		element.addEventListener("touchend", function (e) {
			clearTimeout(tapHold);
			tapHold = null;

			if (loaded) {
				e.preventDefault();
			}
		});
	};

	Menu.prototype.initializeCell = function (cell) {
		if (cell.column.definition.contextMenu) {
			cell.getElement(true).addEventListener("contextmenu", this.LoadMenuEvent.bind(this, cell, cell.column.definition.contextMenu));
			this.tapHold(cell, cell.column.definition.contextMenu);
		}

		if (cell.column.definition.clickMenu) {
			cell.getElement(true).addEventListener("click", this.LoadMenuEvent.bind(this, cell, cell.column.definition.clickMenu));
		}
	};

	Menu.prototype.initializeRow = function (row) {
		if (this.table.options.rowContextMenu) {
			row.getElement().addEventListener("contextmenu", this.LoadMenuEvent.bind(this, row, this.table.options.rowContextMenu));
			this.tapHold(row, this.table.options.rowContextMenu);
		}

		if (this.table.options.rowClickMenu) {
			row.getElement().addEventListener("click", this.LoadMenuEvent.bind(this, row, this.table.options.rowClickMenu));
		}
	};

	Menu.prototype.initializeGroup = function (group) {
		if (this.table.options.groupContextMenu) {
			group.getElement().addEventListener("contextmenu", this.LoadMenuEvent.bind(this, group, this.table.options.groupContextMenu));
			this.tapHold(group, this.table.options.groupContextMenu);
		}

		if (this.table.options.groupClickMenu) {
			group.getElement().addEventListener("click", this.LoadMenuEvent.bind(this, group, this.table.options.groupClickMenu));
		}
	};

	Menu.prototype.loadMenu = function (e, component, menu, parentEl) {
		var _this73 = this;

		var touch = !(e instanceof MouseEvent);

		var menuEl = document.createElement("div");
		menuEl.classList.add("tabulator-menu");

		if (!touch) {
			e.preventDefault();
		}

		//abort if no menu set
		if (!menu || !menu.length) {
			return;
		}

		if (!parentEl) {
			if (this.nestedMenuBlock) {
				//abort if child menu already open
				if (this.isOpen()) {
					return;
				}
			} else {
				this.nestedMenuBlock = setTimeout(function () {
					_this73.nestedMenuBlock = false;
				}, 100);
			}

			this.hideMenu();
			this.menuElements = [];
		}

		menu.forEach(function (item) {
			var itemEl = document.createElement("div"),
			    label = item.label,
			    disabled = item.disabled;

			if (item.separator) {
				itemEl.classList.add("tabulator-menu-separator");
			} else {
				itemEl.classList.add("tabulator-menu-item");

				if (typeof label == "function") {
					label = label.call(_this73.table, component.getComponent());
				}

				if (label instanceof Node) {
					itemEl.appendChild(label);
				} else {
					itemEl.innerHTML = label;
				}

				if (typeof disabled == "function") {
					disabled = disabled.call(_this73.table, component.getComponent());
				}

				if (disabled) {
					itemEl.classList.add("tabulator-menu-item-disabled");
					itemEl.addEventListener("click", function (e) {
						e.stopPropagation();
					});
				} else {
					if (item.menu && item.menu.length) {
						itemEl.addEventListener("click", function (e) {
							e.stopPropagation();
							_this73.hideOldSubMenus(menuEl);
							_this73.loadMenu(e, component, item.menu, itemEl);
						});
					} else {
						if (item.action) {
							itemEl.addEventListener("click", function (e) {
								item.action(e, component.getComponent());
							});
						}
					}
				}

				if (item.menu && item.menu.length) {
					itemEl.classList.add("tabulator-menu-item-submenu");
				}
			}

			menuEl.appendChild(itemEl);
		});

		menuEl.addEventListener("click", function (e) {
			_this73.hideMenu();
		});

		this.menuElements.push(menuEl);
		this.positionMenu(menuEl, parentEl, touch, e);
	};

	Menu.prototype.hideOldSubMenus = function (menuEl) {
		var index = this.menuElements.indexOf(menuEl);

		if (index > -1) {
			for (var _i13 = this.menuElements.length - 1; _i13 > index; _i13--) {
				var el = this.menuElements[_i13];

				if (el.parentNode) {
					el.parentNode.removeChild(el);
				}

				this.menuElements.pop();
			}
		}
	};

	Menu.prototype.positionMenu = function (element, parentEl, touch, e) {
		var _this74 = this;

		var docHeight = Math.max(document.body.offsetHeight, window.innerHeight),
		    x,
		    y,
		    parentOffset;

		if (!parentEl) {
			x = touch ? e.touches[0].pageX : e.pageX;
			y = touch ? e.touches[0].pageY : e.pageY;

			this.positionReversedX = false;
		} else {
			parentOffset = Tabulator.prototype.helpers.elOffset(parentEl);
			x = parentOffset.left + parentEl.offsetWidth;
			y = parentOffset.top - 1;
		}

		element.style.top = y + "px";
		element.style.left = x + "px";

		setTimeout(function () {
			_this74.table.rowManager.element.addEventListener("scroll", _this74.blurEvent);
			document.body.addEventListener("click", _this74.blurEvent);
			document.body.addEventListener("contextmenu", _this74.blurEvent);
			window.addEventListener("resize", _this74.blurEvent);
			document.body.addEventListener("keydown", _this74.escEvent);
		}, 100);

		document.body.appendChild(element);

		//move menu to start on bottom edge if it is too close to the edge of the screen
		if (y + element.offsetHeight >= docHeight) {
			element.style.top = "";

			if (parentEl) {
				element.style.bottom = docHeight - parentOffset.top - parentEl.offsetHeight - 1 + "px";
			} else {
				element.style.bottom = docHeight - y + "px";
			}
		}

		//move menu to start on right edge if it is too close to the edge of the screen
		if (x + element.offsetWidth >= document.body.offsetWidth || this.positionReversedX) {
			element.style.left = "";

			if (parentEl) {
				element.style.right = document.documentElement.offsetWidth - parentOffset.left + "px";
			} else {
				element.style.right = document.documentElement.offsetWidth - x + "px";
			}

			this.positionReversedX = true;
		}
	};

	Menu.prototype.isOpen = function () {
		return !!this.menuElements.length;
	};

	Menu.prototype.escMenu = function (e) {
		if (e.keyCode == 27) {
			this.hideMenu();
		}
	};

	Menu.prototype.hideMenu = function () {
		this.menuElements.forEach(function (menuEl) {
			if (menuEl.parentNode) {
				menuEl.parentNode.removeChild(menuEl);
			}
		});

		document.body.removeEventListener("keydown", this.escEvent);
		document.body.removeEventListener("click", this.blurEvent);
		document.body.removeEventListener("contextmenu", this.blurEvent);
		window.removeEventListener("resize", this.blurEvent);
		this.table.rowManager.element.removeEventListener("scroll", this.blurEvent);
	};

	//default accessors
	Menu.prototype.menus = {};

	Tabulator.prototype.registerModule("menu", Menu);
	var MoveColumns = function MoveColumns(table) {
		this.table = table; //hold Tabulator object
		this.placeholderElement = this.createPlaceholderElement();
		this.hoverElement = false; //floating column header element
		this.checkTimeout = false; //click check timeout holder
		this.checkPeriod = 250; //period to wait on mousedown to consider this a move and not a click
		this.moving = false; //currently moving column
		this.toCol = false; //destination column
		this.toColAfter = false; //position of moving column relative to the desitnation column
		this.startX = 0; //starting position within header element
		this.autoScrollMargin = 40; //auto scroll on edge when within margin
		this.autoScrollStep = 5; //auto scroll distance in pixels
		this.autoScrollTimeout = false; //auto scroll timeout
		this.touchMove = false;

		this.moveHover = this.moveHover.bind(this);
		this.endMove = this.endMove.bind(this);
	};

	MoveColumns.prototype.createPlaceholderElement = function () {
		var el = document.createElement("div");

		el.classList.add("tabulator-col");
		el.classList.add("tabulator-col-placeholder");

		return el;
	};

	MoveColumns.prototype.initializeColumn = function (column) {
		var self = this,
		    config = {},
		    colEl;

		if (!column.modules.frozen) {

			colEl = column.getElement();

			config.mousemove = function (e) {
				if (column.parent === self.moving.parent) {
					if ((self.touchMove ? e.touches[0].pageX : e.pageX) - Tabulator.prototype.helpers.elOffset(colEl).left + self.table.columnManager.element.scrollLeft > column.getWidth() / 2) {
						if (self.toCol !== column || !self.toColAfter) {
							colEl.parentNode.insertBefore(self.placeholderElement, colEl.nextSibling);
							self.moveColumn(column, true);
						}
					} else {
						if (self.toCol !== column || self.toColAfter) {
							colEl.parentNode.insertBefore(self.placeholderElement, colEl);
							self.moveColumn(column, false);
						}
					}
				}
			}.bind(self);

			colEl.addEventListener("mousedown", function (e) {
				self.touchMove = false;
				if (e.which === 1) {
					self.checkTimeout = setTimeout(function () {
						self.startMove(e, column);
					}, self.checkPeriod);
				}
			});

			colEl.addEventListener("mouseup", function (e) {
				if (e.which === 1) {
					if (self.checkTimeout) {
						clearTimeout(self.checkTimeout);
					}
				}
			});

			self.bindTouchEvents(column);
		}

		column.modules.moveColumn = config;
	};

	MoveColumns.prototype.bindTouchEvents = function (column) {
		var self = this,
		    colEl = column.getElement(),
		    startXMove = false,
		    //shifting center position of the cell
		dir = false,
		    currentCol,
		    nextCol,
		    prevCol,
		    nextColWidth,
		    prevColWidth,
		    nextColWidthLast,
		    prevColWidthLast;

		colEl.addEventListener("touchstart", function (e) {
			self.checkTimeout = setTimeout(function () {
				self.touchMove = true;
				currentCol = column;
				nextCol = column.nextColumn();
				nextColWidth = nextCol ? nextCol.getWidth() / 2 : 0;
				prevCol = column.prevColumn();
				prevColWidth = prevCol ? prevCol.getWidth() / 2 : 0;
				nextColWidthLast = 0;
				prevColWidthLast = 0;
				startXMove = false;

				self.startMove(e, column);
			}, self.checkPeriod);
		}, { passive: true });

		colEl.addEventListener("touchmove", function (e) {
			var halfCol, diff, moveToCol;

			if (self.moving) {
				self.moveHover(e);

				if (!startXMove) {
					startXMove = e.touches[0].pageX;
				}

				diff = e.touches[0].pageX - startXMove;

				if (diff > 0) {
					if (nextCol && diff - nextColWidthLast > nextColWidth) {
						moveToCol = nextCol;

						if (moveToCol !== column) {
							startXMove = e.touches[0].pageX;
							moveToCol.getElement().parentNode.insertBefore(self.placeholderElement, moveToCol.getElement().nextSibling);
							self.moveColumn(moveToCol, true);
						}
					}
				} else {
					if (prevCol && -diff - prevColWidthLast > prevColWidth) {
						moveToCol = prevCol;

						if (moveToCol !== column) {
							startXMove = e.touches[0].pageX;
							moveToCol.getElement().parentNode.insertBefore(self.placeholderElement, moveToCol.getElement());
							self.moveColumn(moveToCol, false);
						}
					}
				}

				if (moveToCol) {
					currentCol = moveToCol;
					nextCol = moveToCol.nextColumn();
					nextColWidthLast = nextColWidth;
					nextColWidth = nextCol ? nextCol.getWidth() / 2 : 0;
					prevCol = moveToCol.prevColumn();
					prevColWidthLast = prevColWidth;
					prevColWidth = prevCol ? prevCol.getWidth() / 2 : 0;
				}
			}
		}, { passive: true });

		colEl.addEventListener("touchend", function (e) {
			if (self.checkTimeout) {
				clearTimeout(self.checkTimeout);
			}
			if (self.moving) {
				self.endMove(e);
			}
		});
	};

	MoveColumns.prototype.startMove = function (e, column) {
		var element = column.getElement();

		this.moving = column;
		this.startX = (this.touchMove ? e.touches[0].pageX : e.pageX) - Tabulator.prototype.helpers.elOffset(element).left;

		this.table.element.classList.add("tabulator-block-select");

		//create placeholder
		this.placeholderElement.style.width = column.getWidth() + "px";
		this.placeholderElement.style.height = column.getHeight() + "px";

		element.parentNode.insertBefore(this.placeholderElement, element);
		element.parentNode.removeChild(element);

		//create hover element
		this.hoverElement = element.cloneNode(true);
		this.hoverElement.classList.add("tabulator-moving");

		this.table.columnManager.getElement().appendChild(this.hoverElement);

		this.hoverElement.style.left = "0";
		this.hoverElement.style.bottom = "0";

		if (!this.touchMove) {
			this._bindMouseMove();

			document.body.addEventListener("mousemove", this.moveHover);
			document.body.addEventListener("mouseup", this.endMove);
		}

		this.moveHover(e);
	};

	MoveColumns.prototype._bindMouseMove = function () {
		this.table.columnManager.columnsByIndex.forEach(function (column) {
			if (column.modules.moveColumn.mousemove) {
				column.getElement().addEventListener("mousemove", column.modules.moveColumn.mousemove);
			}
		});
	};

	MoveColumns.prototype._unbindMouseMove = function () {
		this.table.columnManager.columnsByIndex.forEach(function (column) {
			if (column.modules.moveColumn.mousemove) {
				column.getElement().removeEventListener("mousemove", column.modules.moveColumn.mousemove);
			}
		});
	};

	MoveColumns.prototype.moveColumn = function (column, after) {
		var movingCells = this.moving.getCells();

		this.toCol = column;
		this.toColAfter = after;

		if (after) {
			column.getCells().forEach(function (cell, i) {
				var cellEl = cell.getElement(true);
				cellEl.parentNode.insertBefore(movingCells[i].getElement(), cellEl.nextSibling);
			});
		} else {
			column.getCells().forEach(function (cell, i) {
				var cellEl = cell.getElement(true);
				cellEl.parentNode.insertBefore(movingCells[i].getElement(), cellEl);
			});
		}
	};

	MoveColumns.prototype.endMove = function (e) {
		if (e.which === 1 || this.touchMove) {
			this._unbindMouseMove();

			this.placeholderElement.parentNode.insertBefore(this.moving.getElement(), this.placeholderElement.nextSibling);
			this.placeholderElement.parentNode.removeChild(this.placeholderElement);
			this.hoverElement.parentNode.removeChild(this.hoverElement);

			this.table.element.classList.remove("tabulator-block-select");

			if (this.toCol) {
				this.table.columnManager.moveColumnActual(this.moving, this.toCol, this.toColAfter);
			}

			this.moving = false;
			this.toCol = false;
			this.toColAfter = false;

			if (!this.touchMove) {
				document.body.removeEventListener("mousemove", this.moveHover);
				document.body.removeEventListener("mouseup", this.endMove);
			}
		}
	};

	MoveColumns.prototype.moveHover = function (e) {
		var self = this,
		    columnHolder = self.table.columnManager.getElement(),
		    scrollLeft = columnHolder.scrollLeft,
		    xPos = (self.touchMove ? e.touches[0].pageX : e.pageX) - Tabulator.prototype.helpers.elOffset(columnHolder).left + scrollLeft,
		    scrollPos;

		self.hoverElement.style.left = xPos - self.startX + "px";

		if (xPos - scrollLeft < self.autoScrollMargin) {
			if (!self.autoScrollTimeout) {
				self.autoScrollTimeout = setTimeout(function () {
					scrollPos = Math.max(0, scrollLeft - 5);
					self.table.rowManager.getElement().scrollLeft = scrollPos;
					self.autoScrollTimeout = false;
				}, 1);
			}
		}

		if (scrollLeft + columnHolder.clientWidth - xPos < self.autoScrollMargin) {
			if (!self.autoScrollTimeout) {
				self.autoScrollTimeout = setTimeout(function () {
					scrollPos = Math.min(columnHolder.clientWidth, scrollLeft + 5);
					self.table.rowManager.getElement().scrollLeft = scrollPos;
					self.autoScrollTimeout = false;
				}, 1);
			}
		}
	};

	Tabulator.prototype.registerModule("moveColumn", MoveColumns);

	var MoveRows = function MoveRows(table) {

		this.table = table; //hold Tabulator object
		this.placeholderElement = this.createPlaceholderElement();
		this.hoverElement = false; //floating row header element
		this.checkTimeout = false; //click check timeout holder
		this.checkPeriod = 150; //period to wait on mousedown to consider this a move and not a click
		this.moving = false; //currently moving row
		this.toRow = false; //destination row
		this.toRowAfter = false; //position of moving row relative to the desitnation row
		this.hasHandle = false; //row has handle instead of fully movable row
		this.startY = 0; //starting Y position within header element
		this.startX = 0; //starting X position within header element

		this.moveHover = this.moveHover.bind(this);
		this.endMove = this.endMove.bind(this);
		this.tableRowDropEvent = false;

		this.touchMove = false;

		this.connection = false;
		this.connectionSelectorsTables = false;
		this.connectionSelectorsElements = false;
		this.connectionElements = [];
		this.connections = [];

		this.connectedTable = false;
		this.connectedRow = false;
	};

	MoveRows.prototype.createPlaceholderElement = function () {
		var el = document.createElement("div");

		el.classList.add("tabulator-row");
		el.classList.add("tabulator-row-placeholder");

		return el;
	};

	MoveRows.prototype.initialize = function (handle) {
		this.connectionSelectorsTables = this.table.options.movableRowsConnectedTables;
		this.connectionSelectorsElements = this.table.options.movableRowsConnectedElements;

		this.connection = this.connectionSelectorsTables || this.connectionSelectorsElements;
	};

	MoveRows.prototype.setHandle = function (handle) {
		this.hasHandle = handle;
	};

	MoveRows.prototype.initializeGroupHeader = function (group) {
		var self = this,
		    config = {},
		    rowEl;

		//inter table drag drop
		config.mouseup = function (e) {
			self.tableRowDrop(e, row);
		}.bind(self);

		//same table drag drop
		config.mousemove = function (e) {
			if (e.pageY - Tabulator.prototype.helpers.elOffset(group.element).top + self.table.rowManager.element.scrollTop > group.getHeight() / 2) {
				if (self.toRow !== group || !self.toRowAfter) {
					var rowEl = group.getElement();
					rowEl.parentNode.insertBefore(self.placeholderElement, rowEl.nextSibling);
					self.moveRow(group, true);
				}
			} else {
				if (self.toRow !== group || self.toRowAfter) {
					var rowEl = group.getElement();
					if (rowEl.previousSibling) {
						rowEl.parentNode.insertBefore(self.placeholderElement, rowEl);
						self.moveRow(group, false);
					}
				}
			}
		}.bind(self);

		group.modules.moveRow = config;
	};

	MoveRows.prototype.initializeRow = function (row) {
		var self = this,
		    config = {},
		    rowEl;

		//inter table drag drop
		config.mouseup = function (e) {
			self.tableRowDrop(e, row);
		}.bind(self);

		//same table drag drop
		config.mousemove = function (e) {
			var rowEl = row.getElement();

			if (e.pageY - Tabulator.prototype.helpers.elOffset(rowEl).top + self.table.rowManager.element.scrollTop > row.getHeight() / 2) {
				if (self.toRow !== row || !self.toRowAfter) {
					rowEl.parentNode.insertBefore(self.placeholderElement, rowEl.nextSibling);
					self.moveRow(row, true);
				}
			} else {
				if (self.toRow !== row || self.toRowAfter) {
					rowEl.parentNode.insertBefore(self.placeholderElement, rowEl);
					self.moveRow(row, false);
				}
			}
		}.bind(self);

		if (!this.hasHandle) {

			rowEl = row.getElement();

			rowEl.addEventListener("mousedown", function (e) {
				if (e.which === 1) {
					self.checkTimeout = setTimeout(function () {
						self.startMove(e, row);
					}, self.checkPeriod);
				}
			});

			rowEl.addEventListener("mouseup", function (e) {
				if (e.which === 1) {
					if (self.checkTimeout) {
						clearTimeout(self.checkTimeout);
					}
				}
			});

			this.bindTouchEvents(row, row.getElement());
		}

		row.modules.moveRow = config;
	};

	MoveRows.prototype.initializeCell = function (cell) {
		var self = this,
		    cellEl = cell.getElement(true);

		cellEl.addEventListener("mousedown", function (e) {
			if (e.which === 1) {
				self.checkTimeout = setTimeout(function () {
					self.startMove(e, cell.row);
				}, self.checkPeriod);
			}
		});

		cellEl.addEventListener("mouseup", function (e) {
			if (e.which === 1) {
				if (self.checkTimeout) {
					clearTimeout(self.checkTimeout);
				}
			}
		});

		this.bindTouchEvents(cell.row, cellEl);
	};

	MoveRows.prototype.bindTouchEvents = function (row, element) {
		var self = this,
		    startYMove = false,
		    //shifting center position of the cell
		dir = false,
		    currentRow,
		    nextRow,
		    prevRow,
		    nextRowHeight,
		    prevRowHeight,
		    nextRowHeightLast,
		    prevRowHeightLast;

		element.addEventListener("touchstart", function (e) {
			self.checkTimeout = setTimeout(function () {
				self.touchMove = true;
				currentRow = row;
				nextRow = row.nextRow();
				nextRowHeight = nextRow ? nextRow.getHeight() / 2 : 0;
				prevRow = row.prevRow();
				prevRowHeight = prevRow ? prevRow.getHeight() / 2 : 0;
				nextRowHeightLast = 0;
				prevRowHeightLast = 0;
				startYMove = false;

				self.startMove(e, row);
			}, self.checkPeriod);
		}, { passive: true });
		this.moving, this.toRow, this.toRowAfter;
		element.addEventListener("touchmove", function (e) {

			var halfCol, diff, moveToRow;

			if (self.moving) {
				e.preventDefault();

				self.moveHover(e);

				if (!startYMove) {
					startYMove = e.touches[0].pageY;
				}

				diff = e.touches[0].pageY - startYMove;

				if (diff > 0) {
					if (nextRow && diff - nextRowHeightLast > nextRowHeight) {
						moveToRow = nextRow;

						if (moveToRow !== row) {
							startYMove = e.touches[0].pageY;
							moveToRow.getElement().parentNode.insertBefore(self.placeholderElement, moveToRow.getElement().nextSibling);
							self.moveRow(moveToRow, true);
						}
					}
				} else {
					if (prevRow && -diff - prevRowHeightLast > prevRowHeight) {
						moveToRow = prevRow;

						if (moveToRow !== row) {
							startYMove = e.touches[0].pageY;
							moveToRow.getElement().parentNode.insertBefore(self.placeholderElement, moveToRow.getElement());
							self.moveRow(moveToRow, false);
						}
					}
				}

				if (moveToRow) {
					currentRow = moveToRow;
					nextRow = moveToRow.nextRow();
					nextRowHeightLast = nextRowHeight;
					nextRowHeight = nextRow ? nextRow.getHeight() / 2 : 0;
					prevRow = moveToRow.prevRow();
					prevRowHeightLast = prevRowHeight;
					prevRowHeight = prevRow ? prevRow.getHeight() / 2 : 0;
				}
			}
		});

		element.addEventListener("touchend", function (e) {
			if (self.checkTimeout) {
				clearTimeout(self.checkTimeout);
			}
			if (self.moving) {
				self.endMove(e);
				self.touchMove = false;
			}
		});
	};

	MoveRows.prototype._bindMouseMove = function () {
		var self = this;

		self.table.rowManager.getDisplayRows().forEach(function (row) {
			if ((row.type === "row" || row.type === "group") && row.modules.moveRow.mousemove) {
				row.getElement().addEventListener("mousemove", row.modules.moveRow.mousemove);
			}
		});
	};

	MoveRows.prototype._unbindMouseMove = function () {
		var self = this;

		self.table.rowManager.getDisplayRows().forEach(function (row) {
			if ((row.type === "row" || row.type === "group") && row.modules.moveRow.mousemove) {
				row.getElement().removeEventListener("mousemove", row.modules.moveRow.mousemove);
			}
		});
	};

	MoveRows.prototype.startMove = function (e, row) {
		var element = row.getElement();

		this.setStartPosition(e, row);

		this.moving = row;

		this.table.element.classList.add("tabulator-block-select");

		//create placeholder
		this.placeholderElement.style.width = row.getWidth() + "px";
		this.placeholderElement.style.height = row.getHeight() + "px";

		if (!this.connection) {
			element.parentNode.insertBefore(this.placeholderElement, element);
			element.parentNode.removeChild(element);
		} else {
			this.table.element.classList.add("tabulator-movingrow-sending");
			this.connectToTables(row);
		}

		//create hover element
		this.hoverElement = element.cloneNode(true);
		this.hoverElement.classList.add("tabulator-moving");

		if (this.connection) {
			document.body.appendChild(this.hoverElement);
			this.hoverElement.style.left = "0";
			this.hoverElement.style.top = "0";
			this.hoverElement.style.width = this.table.element.clientWidth + "px";
			this.hoverElement.style.whiteSpace = "nowrap";
			this.hoverElement.style.overflow = "hidden";
			this.hoverElement.style.pointerEvents = "none";
		} else {
			this.table.rowManager.getTableElement().appendChild(this.hoverElement);

			this.hoverElement.style.left = "0";
			this.hoverElement.style.top = "0";

			this._bindMouseMove();
		}

		document.body.addEventListener("mousemove", this.moveHover);
		document.body.addEventListener("mouseup", this.endMove);

		this.moveHover(e);
	};

	MoveRows.prototype.setStartPosition = function (e, row) {
		var pageX = this.touchMove ? e.touches[0].pageX : e.pageX,
		    pageY = this.touchMove ? e.touches[0].pageY : e.pageY,
		    element,
		    position;

		element = row.getElement();
		if (this.connection) {
			position = element.getBoundingClientRect();

			this.startX = position.left - pageX + window.pageXOffset;
			this.startY = position.top - pageY + window.pageYOffset;
		} else {
			this.startY = pageY - element.getBoundingClientRect().top;
		}
	};

	MoveRows.prototype.endMove = function (e) {
		if (!e || e.which === 1 || this.touchMove) {
			this._unbindMouseMove();

			if (!this.connection) {
				this.placeholderElement.parentNode.insertBefore(this.moving.getElement(), this.placeholderElement.nextSibling);
				this.placeholderElement.parentNode.removeChild(this.placeholderElement);
			}

			this.hoverElement.parentNode.removeChild(this.hoverElement);

			this.table.element.classList.remove("tabulator-block-select");

			if (this.toRow) {
				this.table.rowManager.moveRow(this.moving, this.toRow, this.toRowAfter);
			}

			this.moving = false;
			this.toRow = false;
			this.toRowAfter = false;

			document.body.removeEventListener("mousemove", this.moveHover);
			document.body.removeEventListener("mouseup", this.endMove);

			if (this.connection) {
				this.table.element.classList.remove("tabulator-movingrow-sending");
				this.disconnectFromTables();
			}
		}
	};

	MoveRows.prototype.moveRow = function (row, after) {
		this.toRow = row;
		this.toRowAfter = after;
	};

	MoveRows.prototype.moveHover = function (e) {
		if (this.connection) {
			this.moveHoverConnections.call(this, e);
		} else {
			this.moveHoverTable.call(this, e);
		}
	};

	MoveRows.prototype.moveHoverTable = function (e) {
		var rowHolder = this.table.rowManager.getElement(),
		    scrollTop = rowHolder.scrollTop,
		    yPos = (this.touchMove ? e.touches[0].pageY : e.pageY) - rowHolder.getBoundingClientRect().top + scrollTop,
		    scrollPos;

		this.hoverElement.style.top = yPos - this.startY + "px";
	};

	MoveRows.prototype.moveHoverConnections = function (e) {
		this.hoverElement.style.left = this.startX + (this.touchMove ? e.touches[0].pageX : e.pageX) + "px";
		this.hoverElement.style.top = this.startY + (this.touchMove ? e.touches[0].pageY : e.pageY) + "px";
	};

	MoveRows.prototype.elementRowDrop = function (e, element, row) {
		if (this.table.options.movableRowsElementDrop) {
			this.table.options.movableRowsElementDrop(e, element, row ? row.getComponent() : false);
		}
	};

	//establish connection with other tables
	MoveRows.prototype.connectToTables = function (row) {
		var _this75 = this;

		var connectionTables;

		if (this.connectionSelectorsTables) {
			connectionTables = this.table.modules.comms.getConnections(this.connectionSelectorsTables);

			this.table.options.movableRowsSendingStart.call(this.table, connectionTables);

			this.table.modules.comms.send(this.connectionSelectorsTables, "moveRow", "connect", {
				row: row
			});
		}

		if (this.connectionSelectorsElements) {

			this.connectionElements = [];

			if (!Array.isArray(this.connectionSelectorsElements)) {
				this.connectionSelectorsElements = [this.connectionSelectorsElements];
			}

			this.connectionSelectorsElements.forEach(function (query) {
				if (typeof query === "string") {
					_this75.connectionElements = _this75.connectionElements.concat(Array.prototype.slice.call(document.querySelectorAll(query)));
				} else {
					_this75.connectionElements.push(query);
				}
			});

			this.connectionElements.forEach(function (element) {
				var dropEvent = function dropEvent(e) {
					_this75.elementRowDrop(e, element, _this75.moving);
				};

				element.addEventListener("mouseup", dropEvent);
				element.tabulatorElementDropEvent = dropEvent;

				element.classList.add("tabulator-movingrow-receiving");
			});
		}
	};

	//disconnect from other tables
	MoveRows.prototype.disconnectFromTables = function () {
		var connectionTables;

		if (this.connectionSelectorsTables) {
			connectionTables = this.table.modules.comms.getConnections(this.connectionSelectorsTables);

			this.table.options.movableRowsSendingStop.call(this.table, connectionTables);

			this.table.modules.comms.send(this.connectionSelectorsTables, "moveRow", "disconnect");
		}

		this.connectionElements.forEach(function (element) {
			element.classList.remove("tabulator-movingrow-receiving");
			element.removeEventListener("mouseup", element.tabulatorElementDropEvent);
			delete element.tabulatorElementDropEvent;
		});
	};

	//accept incomming connection
	MoveRows.prototype.connect = function (table, row) {
		var self = this;
		if (!this.connectedTable) {
			this.connectedTable = table;
			this.connectedRow = row;

			this.table.element.classList.add("tabulator-movingrow-receiving");

			self.table.rowManager.getDisplayRows().forEach(function (row) {
				if (row.type === "row" && row.modules.moveRow && row.modules.moveRow.mouseup) {
					row.getElement().addEventListener("mouseup", row.modules.moveRow.mouseup);
				}
			});

			self.tableRowDropEvent = self.tableRowDrop.bind(self);

			self.table.element.addEventListener("mouseup", self.tableRowDropEvent);

			this.table.options.movableRowsReceivingStart.call(this.table, row, table);

			return true;
		} else {
			console.warn("Move Row Error - Table cannot accept connection, already connected to table:", this.connectedTable);
			return false;
		}
	};

	//close incomming connection
	MoveRows.prototype.disconnect = function (table) {
		var self = this;
		if (table === this.connectedTable) {
			this.connectedTable = false;
			this.connectedRow = false;

			this.table.element.classList.remove("tabulator-movingrow-receiving");

			self.table.rowManager.getDisplayRows().forEach(function (row) {
				if (row.type === "row" && row.modules.moveRow && row.modules.moveRow.mouseup) {
					row.getElement().removeEventListener("mouseup", row.modules.moveRow.mouseup);
				}
			});

			self.table.element.removeEventListener("mouseup", self.tableRowDropEvent);

			this.table.options.movableRowsReceivingStop.call(this.table, table);
		} else {
			console.warn("Move Row Error - trying to disconnect from non connected table");
		}
	};

	MoveRows.prototype.dropComplete = function (table, row, success) {
		var sender = false;

		if (success) {

			switch (_typeof(this.table.options.movableRowsSender)) {
				case "string":
					sender = this.senders[this.table.options.movableRowsSender];
					break;

				case "function":
					sender = this.table.options.movableRowsSender;
					break;
			}

			if (sender) {
				sender.call(this, this.moving.getComponent(), row ? row.getComponent() : undefined, table);
			} else {
				if (this.table.options.movableRowsSender) {
					console.warn("Mover Row Error - no matching sender found:", this.table.options.movableRowsSender);
				}
			}

			this.table.options.movableRowsSent.call(this.table, this.moving.getComponent(), row ? row.getComponent() : undefined, table);
		} else {
			this.table.options.movableRowsSentFailed.call(this.table, this.moving.getComponent(), row ? row.getComponent() : undefined, table);
		}

		this.endMove();
	};

	MoveRows.prototype.tableRowDrop = function (e, row) {
		var receiver = false,
		    success = false;

		e.stopImmediatePropagation();

		switch (_typeof(this.table.options.movableRowsReceiver)) {
			case "string":
				receiver = this.receivers[this.table.options.movableRowsReceiver];
				break;

			case "function":
				receiver = this.table.options.movableRowsReceiver;
				break;
		}

		if (receiver) {
			success = receiver.call(this, this.connectedRow.getComponent(), row ? row.getComponent() : undefined, this.connectedTable);
		} else {
			console.warn("Mover Row Error - no matching receiver found:", this.table.options.movableRowsReceiver);
		}

		if (success) {
			this.table.options.movableRowsReceived.call(this.table, this.connectedRow.getComponent(), row ? row.getComponent() : undefined, this.connectedTable);
		} else {
			this.table.options.movableRowsReceivedFailed.call(this.table, this.connectedRow.getComponent(), row ? row.getComponent() : undefined, this.connectedTable);
		}

		this.table.modules.comms.send(this.connectedTable, "moveRow", "dropcomplete", {
			row: row,
			success: success
		});
	};

	MoveRows.prototype.receivers = {
		insert: function insert(fromRow, toRow, fromTable) {
			this.table.addRow(fromRow.getData(), undefined, toRow);
			return true;
		},

		add: function add(fromRow, toRow, fromTable) {
			this.table.addRow(fromRow.getData());
			return true;
		},

		update: function update(fromRow, toRow, fromTable) {
			if (toRow) {
				toRow.update(fromRow.getData());
				return true;
			}

			return false;
		},

		replace: function replace(fromRow, toRow, fromTable) {
			if (toRow) {
				this.table.addRow(fromRow.getData(), undefined, toRow);
				toRow.delete();
				return true;
			}

			return false;
		}
	};

	MoveRows.prototype.senders = {
		delete: function _delete(fromRow, toRow, toTable) {
			fromRow.delete();
		}
	};

	MoveRows.prototype.commsReceived = function (table, action, data) {
		switch (action) {
			case "connect":
				return this.connect(table, data.row);
				break;

			case "disconnect":
				return this.disconnect(table);
				break;

			case "dropcomplete":
				return this.dropComplete(table, data.row, data.success);
				break;
		}
	};

	Tabulator.prototype.registerModule("moveRow", MoveRows);
	var Mutator = function Mutator(table) {
		this.table = table; //hold Tabulator object
		this.allowedTypes = ["", "data", "edit", "clipboard"]; //list of muatation types
		this.enabled = true;
	};

	//initialize column mutator
	Mutator.prototype.initializeColumn = function (column) {
		var self = this,
		    match = false,
		    config = {};

		this.allowedTypes.forEach(function (type) {
			var key = "mutator" + (type.charAt(0).toUpperCase() + type.slice(1)),
			    mutator;

			if (column.definition[key]) {
				mutator = self.lookupMutator(column.definition[key]);

				if (mutator) {
					match = true;

					config[key] = {
						mutator: mutator,
						params: column.definition[key + "Params"] || {}
					};
				}
			}
		});

		if (match) {
			column.modules.mutate = config;
		}
	};

	Mutator.prototype.lookupMutator = function (value) {
		var mutator = false;

		//set column mutator
		switch (typeof value === 'undefined' ? 'undefined' : _typeof(value)) {
			case "string":
				if (this.mutators[value]) {
					mutator = this.mutators[value];
				} else {
					console.warn("Mutator Error - No such mutator found, ignoring: ", value);
				}
				break;

			case "function":
				mutator = value;
				break;
		}

		return mutator;
	};

	//apply mutator to row
	Mutator.prototype.transformRow = function (data, type, updatedData) {
		var self = this,
		    key = "mutator" + (type.charAt(0).toUpperCase() + type.slice(1)),
		    value;

		if (this.enabled) {

			self.table.columnManager.traverse(function (column) {
				var mutator, params, component;

				if (column.modules.mutate) {
					mutator = column.modules.mutate[key] || column.modules.mutate.mutator || false;

					if (mutator) {
						value = column.getFieldValue(typeof updatedData !== "undefined" ? updatedData : data);

						if (type == "data" || typeof value !== "undefined") {
							component = column.getComponent();
							params = typeof mutator.params === "function" ? mutator.params(value, data, type, component) : mutator.params;
							column.setFieldValue(data, mutator.mutator(value, data, type, params, component));
						}
					}
				}
			});
		}

		return data;
	};

	//apply mutator to new cell value
	Mutator.prototype.transformCell = function (cell, value) {
		var mutator = cell.column.modules.mutate.mutatorEdit || cell.column.modules.mutate.mutator || false,
		    tempData = {};

		if (mutator) {
			tempData = Object.assign(tempData, cell.row.getData());
			cell.column.setFieldValue(tempData, value);
			return mutator.mutator(value, tempData, "edit", mutator.params, cell.getComponent());
		} else {
			return value;
		}
	};

	Mutator.prototype.enable = function () {
		this.enabled = true;
	};

	Mutator.prototype.disable = function () {
		this.enabled = false;
	};

	//default mutators
	Mutator.prototype.mutators = {};

	Tabulator.prototype.registerModule("mutator", Mutator);
	var Page = function Page(table) {

		this.table = table; //hold Tabulator object

		this.mode = "local";
		this.progressiveLoad = false;

		this.size = 0;
		this.page = 1;
		this.count = 5;
		this.max = 1;

		this.displayIndex = 0; //index in display pipeline

		this.initialLoad = true;

		this.pageSizes = [];

		this.dataReceivedNames = {};
		this.dataSentNames = {};

		this.createElements();
	};

	Page.prototype.createElements = function () {

		var button;

		this.element = document.createElement("span");
		this.element.classList.add("tabulator-paginator");

		this.pagesElement = document.createElement("span");
		this.pagesElement.classList.add("tabulator-pages");

		button = document.createElement("button");
		button.classList.add("tabulator-page");
		button.setAttribute("type", "button");
		button.setAttribute("role", "button");
		button.setAttribute("aria-label", "");
		button.setAttribute("title", "");

		this.firstBut = button.cloneNode(true);
		this.firstBut.setAttribute("data-page", "first");

		this.prevBut = button.cloneNode(true);
		this.prevBut.setAttribute("data-page", "prev");

		this.nextBut = button.cloneNode(true);
		this.nextBut.setAttribute("data-page", "next");

		this.lastBut = button.cloneNode(true);
		this.lastBut.setAttribute("data-page", "last");

		if (this.table.options.paginationSizeSelector) {
			this.pageSizeSelect = document.createElement("select");
			this.pageSizeSelect.classList.add("tabulator-page-size");
		}
	};

	Page.prototype.generatePageSizeSelectList = function () {
		var _this76 = this;

		var pageSizes = [];

		if (this.pageSizeSelect) {

			if (Array.isArray(this.table.options.paginationSizeSelector)) {
				pageSizes = this.table.options.paginationSizeSelector;
				this.pageSizes = pageSizes;

				if (this.pageSizes.indexOf(this.size) == -1) {
					pageSizes.unshift(this.size);
				}
			} else {

				if (this.pageSizes.indexOf(this.size) == -1) {
					pageSizes = [];

					for (var _i14 = 1; _i14 < 5; _i14++) {
						pageSizes.push(this.size * _i14);
					}

					this.pageSizes = pageSizes;
				} else {
					pageSizes = this.pageSizes;
				}
			}

			while (this.pageSizeSelect.firstChild) {
				this.pageSizeSelect.removeChild(this.pageSizeSelect.firstChild);
			}pageSizes.forEach(function (item) {
				var itemEl = document.createElement("option");
				itemEl.value = item;

				if (item === true) {
					_this76.table.modules.localize.bind("pagination|all", function (value) {
						itemEl.innerHTML = value;
					});
				} else {
					itemEl.innerHTML = item;
				}

				_this76.pageSizeSelect.appendChild(itemEl);
			});

			this.pageSizeSelect.value = this.size;
		}
	};

	//setup pageination
	Page.prototype.initialize = function (hidden) {
		var self = this,
		    pageSelectLabel,
		    testElRow,
		    testElCell;

		//update param names
		this.dataSentNames = Object.assign({}, this.paginationDataSentNames);
		this.dataSentNames = Object.assign(this.dataSentNames, this.table.options.paginationDataSent);

		this.dataReceivedNames = Object.assign({}, this.paginationDataReceivedNames);
		this.dataReceivedNames = Object.assign(this.dataReceivedNames, this.table.options.paginationDataReceived);

		//build pagination element

		//bind localizations
		self.table.modules.localize.bind("pagination|first", function (value) {
			self.firstBut.innerHTML = value;
		});

		self.table.modules.localize.bind("pagination|first_title", function (value) {
			self.firstBut.setAttribute("aria-label", value);
			self.firstBut.setAttribute("title", value);
		});

		self.table.modules.localize.bind("pagination|prev", function (value) {
			self.prevBut.innerHTML = value;
		});

		self.table.modules.localize.bind("pagination|prev_title", function (value) {
			self.prevBut.setAttribute("aria-label", value);
			self.prevBut.setAttribute("title", value);
		});

		self.table.modules.localize.bind("pagination|next", function (value) {
			self.nextBut.innerHTML = value;
		});

		self.table.modules.localize.bind("pagination|next_title", function (value) {
			self.nextBut.setAttribute("aria-label", value);
			self.nextBut.setAttribute("title", value);
		});

		self.table.modules.localize.bind("pagination|last", function (value) {
			self.lastBut.innerHTML = value;
		});

		self.table.modules.localize.bind("pagination|last_title", function (value) {
			self.lastBut.setAttribute("aria-label", value);
			self.lastBut.setAttribute("title", value);
		});

		//click bindings
		self.firstBut.addEventListener("click", function () {
			self.setPage(1).then(function () {}).catch(function () {});
		});

		self.prevBut.addEventListener("click", function () {
			self.previousPage().then(function () {}).catch(function () {});
		});

		self.nextBut.addEventListener("click", function () {
			self.nextPage().then(function () {}).catch(function () {});
		});

		self.lastBut.addEventListener("click", function () {
			self.setPage(self.max).then(function () {}).catch(function () {});
		});

		if (self.table.options.paginationElement) {
			self.element = self.table.options.paginationElement;
		}

		if (this.pageSizeSelect) {
			pageSelectLabel = document.createElement("label");

			self.table.modules.localize.bind("pagination|page_size", function (value) {
				self.pageSizeSelect.setAttribute("aria-label", value);
				self.pageSizeSelect.setAttribute("title", value);
				pageSelectLabel.innerHTML = value;
			});

			self.element.appendChild(pageSelectLabel);
			self.element.appendChild(self.pageSizeSelect);

			self.pageSizeSelect.addEventListener("change", function (e) {
				self.setPageSize(self.pageSizeSelect.value == "true" ? true : self.pageSizeSelect.value);
				self.setPage(1).then(function () {}).catch(function () {});
			});
		}

		//append to DOM
		self.element.appendChild(self.firstBut);
		self.element.appendChild(self.prevBut);
		self.element.appendChild(self.pagesElement);
		self.element.appendChild(self.nextBut);
		self.element.appendChild(self.lastBut);

		if (!self.table.options.paginationElement && !hidden) {
			self.table.footerManager.append(self.element, self);
		}

		//set default values
		self.mode = self.table.options.pagination;

		if (self.table.options.paginationSize) {
			self.size = self.table.options.paginationSize;
		} else {
			testElRow = document.createElement("div");
			testElRow.classList.add("tabulator-row");
			testElRow.style.visibility = hidden;

			testElCell = document.createElement("div");
			testElCell.classList.add("tabulator-cell");
			testElCell.innerHTML = "Page Row Test";

			testElRow.appendChild(testElCell);

			self.table.rowManager.getTableElement().appendChild(testElRow);

			self.size = Math.floor(self.table.rowManager.getElement().clientHeight / testElRow.offsetHeight);

			self.table.rowManager.getTableElement().removeChild(testElRow);
		}

		// self.page = self.table.options.paginationInitialPage || 1;
		self.count = self.table.options.paginationButtonCount;

		self.generatePageSizeSelectList();
	};

	Page.prototype.initializeProgressive = function (mode) {
		this.initialize(true);
		this.mode = "progressive_" + mode;
		this.progressiveLoad = true;
	};

	Page.prototype.setDisplayIndex = function (index) {
		this.displayIndex = index;
	};

	Page.prototype.getDisplayIndex = function () {
		return this.displayIndex;
	};

	//calculate maximum page from number of rows
	Page.prototype.setMaxRows = function (rowCount) {
		if (!rowCount) {
			this.max = 1;
		} else {
			this.max = this.size === true ? 1 : Math.ceil(rowCount / this.size);
		}

		if (this.page > this.max) {
			this.page = this.max;
		}
	};

	//reset to first page without triggering action
	Page.prototype.reset = function (force, columnsChanged) {
		if (this.mode == "local" || force) {
			this.page = 1;
		}

		if (columnsChanged) {
			this.initialLoad = true;
		}

		return true;
	};

	//set the maxmum page
	Page.prototype.setMaxPage = function (max) {

		max = parseInt(max);

		this.max = max || 1;

		if (this.page > this.max) {
			this.page = this.max;
			this.trigger();
		}
	};

	//set current page number
	Page.prototype.setPage = function (page) {
		var _this77 = this;

		var self = this;

		switch (page) {
			case "first":
				return this.setPage(1);
				break;

			case "prev":
				return this.previousPage();
				break;

			case "next":
				return this.nextPage();
				break;

			case "last":
				return this.setPage(this.max);
				break;
		}

		return new Promise(function (resolve, reject) {

			page = parseInt(page);

			if (page > 0 && page <= _this77.max || _this77.mode !== "local") {
				_this77.page = page;
				_this77.trigger().then(function () {
					resolve();
				}).catch(function () {
					reject();
				});

				if (self.table.options.persistence && self.table.modExists("persistence", true) && self.table.modules.persistence.config.page) {
					self.table.modules.persistence.save("page");
				}
			} else {
				console.warn("Pagination Error - Requested page is out of range of 1 - " + _this77.max + ":", page);
				reject();
			}
		});
	};

	Page.prototype.setPageToRow = function (row) {
		var _this78 = this;

		return new Promise(function (resolve, reject) {

			var rows = _this78.table.rowManager.getDisplayRows(_this78.displayIndex - 1);
			var index = rows.indexOf(row);

			if (index > -1) {
				var page = _this78.size === true ? 1 : Math.ceil((index + 1) / _this78.size);

				_this78.setPage(page).then(function () {
					resolve();
				}).catch(function () {
					reject();
				});
			} else {
				console.warn("Pagination Error - Requested row is not visible");
				reject();
			}
		});
	};

	Page.prototype.setPageSize = function (size) {
		if (size !== true) {
			size = parseInt(size);
		}

		if (size > 0) {
			this.size = size;
		}

		if (this.pageSizeSelect) {
			// this.pageSizeSelect.value = size;
			this.generatePageSizeSelectList();
		}

		if (this.table.options.persistence && this.table.modExists("persistence", true) && this.table.modules.persistence.config.page) {
			this.table.modules.persistence.save("page");
		}
	};

	//setup the pagination buttons
	Page.prototype._setPageButtons = function () {
		var self = this;

		var leftSize = Math.floor((this.count - 1) / 2);
		var rightSize = Math.ceil((this.count - 1) / 2);
		var min = this.max - this.page + leftSize + 1 < this.count ? this.max - this.count + 1 : Math.max(this.page - leftSize, 1);
		var max = this.page <= rightSize ? Math.min(this.count, this.max) : Math.min(this.page + rightSize, this.max);

		while (self.pagesElement.firstChild) {
			self.pagesElement.removeChild(self.pagesElement.firstChild);
		}if (self.page == 1) {
			self.firstBut.disabled = true;
			self.prevBut.disabled = true;
		} else {
			self.firstBut.disabled = false;
			self.prevBut.disabled = false;
		}

		if (self.page == self.max) {
			self.lastBut.disabled = true;
			self.nextBut.disabled = true;
		} else {
			self.lastBut.disabled = false;
			self.nextBut.disabled = false;
		}

		for (var _i15 = min; _i15 <= max; _i15++) {
			if (_i15 > 0 && _i15 <= self.max) {
				self.pagesElement.appendChild(self._generatePageButton(_i15));
			}
		}

		this.footerRedraw();
	};

	Page.prototype._generatePageButton = function (page) {
		var self = this,
		    button = document.createElement("button");

		button.classList.add("tabulator-page");
		if (page == self.page) {
			button.classList.add("active");
		}

		button.setAttribute("type", "button");
		button.setAttribute("role", "button");

		self.table.modules.localize.bind("pagination|page_title", function (value) {
			button.setAttribute("aria-label", value + " " + page);
			button.setAttribute("title", value + " " + page);
		});

		button.setAttribute("data-page", page);
		button.textContent = page;

		button.addEventListener("click", function (e) {
			self.setPage(page).then(function () {}).catch(function () {});
		});

		return button;
	};

	//previous page
	Page.prototype.previousPage = function () {
		var _this79 = this;

		return new Promise(function (resolve, reject) {
			if (_this79.page > 1) {
				_this79.page--;
				_this79.trigger().then(function () {
					resolve();
				}).catch(function () {
					reject();
				});

				if (_this79.table.options.persistence && _this79.table.modExists("persistence", true) && _this79.table.modules.persistence.config.page) {
					_this79.table.modules.persistence.save("page");
				}
			} else {
				console.warn("Pagination Error - Previous page would be less than page 1:", 0);
				reject();
			}
		});
	};

	//next page
	Page.prototype.nextPage = function () {
		var _this80 = this;

		return new Promise(function (resolve, reject) {
			if (_this80.page < _this80.max) {
				_this80.page++;
				_this80.trigger().then(function () {
					resolve();
				}).catch(function () {
					reject();
				});

				if (_this80.table.options.persistence && _this80.table.modExists("persistence", true) && _this80.table.modules.persistence.config.page) {
					_this80.table.modules.persistence.save("page");
				}
			} else {
				if (!_this80.progressiveLoad) {
					console.warn("Pagination Error - Next page would be greater than maximum page of " + _this80.max + ":", _this80.max + 1);
				}
				reject();
			}
		});
	};

	//return current page number
	Page.prototype.getPage = function () {
		return this.page;
	};

	//return max page number
	Page.prototype.getPageMax = function () {
		return this.max;
	};

	Page.prototype.getPageSize = function (size) {
		return this.size;
	};

	Page.prototype.getMode = function () {
		return this.mode;
	};

	//return appropriate rows for current page
	Page.prototype.getRows = function (data) {
		var output, start, end;

		if (this.mode == "local") {
			output = [];

			if (this.size === true) {
				start = 0;
				end = data.length;
			} else {
				start = this.size * (this.page - 1);
				end = start + parseInt(this.size);
			}

			this._setPageButtons();

			for (var _i16 = start; _i16 < end; _i16++) {
				if (data[_i16]) {
					output.push(data[_i16]);
				}
			}

			return output;
		} else {

			this._setPageButtons();

			return data.slice(0);
		}
	};

	Page.prototype.trigger = function () {
		var _this81 = this;

		var left;

		return new Promise(function (resolve, reject) {

			switch (_this81.mode) {
				case "local":
					left = _this81.table.rowManager.scrollLeft;

					_this81.table.rowManager.refreshActiveData("page");
					_this81.table.rowManager.scrollHorizontal(left);

					_this81.table.options.pageLoaded.call(_this81.table, _this81.getPage());
					resolve();
					break;

				case "remote":
				case "progressive_load":
				case "progressive_scroll":
					_this81.table.modules.ajax.blockActiveRequest();
					_this81._getRemotePage().then(function () {
						resolve();
					}).catch(function () {
						reject();
					});
					break;

				default:
					console.warn("Pagination Error - no such pagination mode:", _this81.mode);
					reject();
			}
		});
	};

	Page.prototype._getRemotePage = function () {
		var _this82 = this;

		var self = this,
		    oldParams,
		    pageParams;

		return new Promise(function (resolve, reject) {

			if (!self.table.modExists("ajax", true)) {
				reject();
			}

			//record old params and restore after request has been made
			oldParams = Tabulator.prototype.helpers.deepClone(self.table.modules.ajax.getParams() || {});
			pageParams = self.table.modules.ajax.getParams();

			//configure request params
			pageParams[_this82.dataSentNames.page] = self.page;

			//set page size if defined
			if (_this82.size) {
				pageParams[_this82.dataSentNames.size] = _this82.size;
			}

			//set sort data if defined
			if (_this82.table.options.ajaxSorting && _this82.table.modExists("sort")) {
				var sorters = self.table.modules.sort.getSort();

				sorters.forEach(function (item) {
					delete item.column;
				});

				pageParams[_this82.dataSentNames.sorters] = sorters;
			}

			//set filter data if defined
			if (_this82.table.options.ajaxFiltering && _this82.table.modExists("filter")) {
				var filters = self.table.modules.filter.getFilters(true, true);
				pageParams[_this82.dataSentNames.filters] = filters;
			}

			self.table.modules.ajax.setParams(pageParams);

			self.table.modules.ajax.sendRequest(_this82.progressiveLoad).then(function (data) {
				self._parseRemoteData(data);
				resolve();
			}).catch(function (e) {
				reject();
			});

			self.table.modules.ajax.setParams(oldParams);
		});
	};

	Page.prototype._parseRemoteData = function (data) {
		var self = this,
		    left,
		    data,
		    margin;

		if (typeof data[this.dataReceivedNames.last_page] === "undefined") {
			console.warn("Remote Pagination Error - Server response missing '" + this.dataReceivedNames.last_page + "' property");
		}

		if (data[this.dataReceivedNames.data]) {
			this.max = parseInt(data[this.dataReceivedNames.last_page]) || 1;

			if (this.progressiveLoad) {
				switch (this.mode) {
					case "progressive_load":

						if (this.page == 1) {
							this.table.rowManager.setData(data[this.dataReceivedNames.data], false, this.initialLoad && this.page == 1);
						} else {
							this.table.rowManager.addRows(data[this.dataReceivedNames.data]);
						}

						if (this.page < this.max) {
							setTimeout(function () {
								self.nextPage().then(function () {}).catch(function () {});
							}, self.table.options.ajaxProgressiveLoadDelay);
						}
						break;

					case "progressive_scroll":
						data = this.table.rowManager.getData().concat(data[this.dataReceivedNames.data]);

						this.table.rowManager.setData(data, true, this.initialLoad && this.page == 1);

						margin = this.table.options.ajaxProgressiveLoadScrollMargin || this.table.rowManager.element.clientHeight * 2;

						if (self.table.rowManager.element.scrollHeight <= self.table.rowManager.element.clientHeight + margin) {
							self.nextPage().then(function () {}).catch(function () {});
						}
						break;
				}
			} else {
				left = this.table.rowManager.scrollLeft;

				this.table.rowManager.setData(data[this.dataReceivedNames.data], false, this.initialLoad && this.page == 1);

				this.table.rowManager.scrollHorizontal(left);

				this.table.columnManager.scrollHorizontal(left);

				this.table.options.pageLoaded.call(this.table, this.getPage());
			}

			this.initialLoad = false;
		} else {
			console.warn("Remote Pagination Error - Server response missing '" + this.dataReceivedNames.data + "' property");
		}
	};

	//handle the footer element being redrawn
	Page.prototype.footerRedraw = function () {
		var footer = this.table.footerManager.element;

		if (Math.ceil(footer.clientWidth) - footer.scrollWidth < 0) {
			this.pagesElement.style.display = 'none';
		} else {
			this.pagesElement.style.display = '';

			if (Math.ceil(footer.clientWidth) - footer.scrollWidth < 0) {
				this.pagesElement.style.display = 'none';
			}
		}
	};

	//set the paramter names for pagination requests
	Page.prototype.paginationDataSentNames = {
		"page": "page",
		"size": "size",
		"sorters": "sorters",
		// "sort_dir":"sort_dir",
		"filters": "filters"
		// "filter_value":"filter_value",
		// "filter_type":"filter_type",
	};

	//set the property names for pagination responses
	Page.prototype.paginationDataReceivedNames = {
		"current_page": "current_page",
		"last_page": "last_page",
		"data": "data"
	};

	Tabulator.prototype.registerModule("page", Page);

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

	var Print = function Print(table) {
		this.table = table; //hold Tabulator object
		this.element = false;
		this.manualBlock = false;
	};

	Print.prototype.initialize = function () {
		window.addEventListener("beforeprint", this.replaceTable.bind(this));
		window.addEventListener("afterprint", this.cleanup.bind(this));
	};

	Print.prototype.replaceTable = function () {
		if (!this.manualBlock) {
			this.element = document.createElement("div");
			this.element.classList.add("tabulator-print-table");

			this.element.appendChild(this.table.modules.export.genereateTable(this.table.options.printConfig, this.table.options.printStyled, this.table.options.printRowRange, "print"));

			this.table.element.style.display = "none";

			this.table.element.parentNode.insertBefore(this.element, this.table.element);
		}
	};

	Print.prototype.cleanup = function () {
		document.body.classList.remove("tabulator-print-fullscreen-hide");

		if (this.element && this.element.parentNode) {
			this.element.parentNode.removeChild(this.element);
			this.table.element.style.display = "";
		}
	};

	Print.prototype.printFullscreen = function (visible, style, config) {
		var scrollX = window.scrollX,
		    scrollY = window.scrollY,
		    headerEl = document.createElement("div"),
		    footerEl = document.createElement("div"),
		    tableEl = this.table.modules.export.genereateTable(typeof config != "undefined" ? config : this.table.options.printConfig, typeof style != "undefined" ? style : this.table.options.printStyled, visible, "print"),
		    headerContent,
		    footerContent;

		this.manualBlock = true;

		this.element = document.createElement("div");
		this.element.classList.add("tabulator-print-fullscreen");

		if (this.table.options.printHeader) {
			headerEl.classList.add("tabulator-print-header");

			headerContent = typeof this.table.options.printHeader == "function" ? this.table.options.printHeader.call(this.table) : this.table.options.printHeader;

			if (typeof headerContent == "string") {
				headerEl.innerHTML = headerContent;
			} else {
				headerEl.appendChild(headerContent);
			}

			this.element.appendChild(headerEl);
		}

		this.element.appendChild(tableEl);

		if (this.table.options.printFooter) {
			footerEl.classList.add("tabulator-print-footer");

			footerContent = typeof this.table.options.printFooter == "function" ? this.table.options.printFooter.call(this.table) : this.table.options.printFooter;

			if (typeof footerContent == "string") {
				footerEl.innerHTML = footerContent;
			} else {
				footerEl.appendChild(footerContent);
			}

			this.element.appendChild(footerEl);
		}

		document.body.classList.add("tabulator-print-fullscreen-hide");
		document.body.appendChild(this.element);

		if (this.table.options.printFormatter) {
			this.table.options.printFormatter(this.element, tableEl);
		}

		window.print();

		this.cleanup();

		window.scrollTo(scrollX, scrollY);

		this.manualBlock = false;
	};

	Tabulator.prototype.registerModule("print", Print);
	var ReactiveData = function ReactiveData(table) {
		this.table = table; //hold Tabulator object
		this.data = false;
		this.blocked = false; //block reactivity while performing update
		this.origFuncs = {}; // hold original data array functions to allow replacement after data is done with
		this.currentVersion = 0;
	};

	ReactiveData.prototype.watchData = function (data) {
		var self = this,
		    pushFunc,
		    version;

		this.currentVersion++;

		version = this.currentVersion;

		self.unwatchData();

		self.data = data;

		//override array push function
		self.origFuncs.push = data.push;

		Object.defineProperty(self.data, "push", {
			enumerable: false,
			configurable: true,
			value: function value() {
				var args = Array.from(arguments);

				if (!self.blocked && version === self.currentVersion) {
					args.forEach(function (arg) {
						self.table.rowManager.addRowActual(arg, false);
					});
				}

				return self.origFuncs.push.apply(data, arguments);
			}
		});

		//override array unshift function
		self.origFuncs.unshift = data.unshift;

		Object.defineProperty(self.data, "unshift", {
			enumerable: false,
			configurable: true,
			value: function value() {
				var args = Array.from(arguments);

				if (!self.blocked && version === self.currentVersion) {
					args.forEach(function (arg) {
						self.table.rowManager.addRowActual(arg, true);
					});
				}

				return self.origFuncs.unshift.apply(data, arguments);
			}
		});

		//override array shift function
		self.origFuncs.shift = data.shift;

		Object.defineProperty(self.data, "shift", {
			enumerable: false,
			configurable: true,
			value: function value() {
				var row;

				if (!self.blocked && version === self.currentVersion) {
					if (self.data.length) {
						row = self.table.rowManager.getRowFromDataObject(self.data[0]);

						if (row) {
							row.deleteActual();
						}
					}
				}

				return self.origFuncs.shift.call(data);
			}
		});

		//override array pop function
		self.origFuncs.pop = data.pop;

		Object.defineProperty(self.data, "pop", {
			enumerable: false,
			configurable: true,
			value: function value() {
				var row;
				if (!self.blocked && version === self.currentVersion) {
					if (self.data.length) {
						row = self.table.rowManager.getRowFromDataObject(self.data[self.data.length - 1]);

						if (row) {
							row.deleteActual();
						}
					}
				}
				return self.origFuncs.pop.call(data);
			}
		});

		//override array splice function
		self.origFuncs.splice = data.splice;

		Object.defineProperty(self.data, "splice", {
			enumerable: false,
			configurable: true,
			value: function value() {
				var args = Array.from(arguments),
				    start = args[0] < 0 ? data.length + args[0] : args[0],
				    end = args[1],
				    newRows = args[2] ? args.slice(2) : false,
				    startRow;

				if (!self.blocked && version === self.currentVersion) {

					//add new rows
					if (newRows) {
						startRow = data[start] ? self.table.rowManager.getRowFromDataObject(data[start]) : false;

						if (startRow) {
							newRows.forEach(function (rowData) {
								self.table.rowManager.addRowActual(rowData, true, startRow, true);
							});
						} else {
							newRows = newRows.slice().reverse();

							newRows.forEach(function (rowData) {
								self.table.rowManager.addRowActual(rowData, true, false, true);
							});
						}
					}

					//delete removed rows
					if (end !== 0) {
						var oldRows = data.slice(start, typeof args[1] === "undefined" ? args[1] : start + end);

						oldRows.forEach(function (rowData, i) {
							var row = self.table.rowManager.getRowFromDataObject(rowData);

							if (row) {
								row.deleteActual(i !== oldRows.length - 1);
							}
						});
					}

					if (newRows || end !== 0) {
						self.table.rowManager.reRenderInPosition();
					}
				}

				return self.origFuncs.splice.apply(data, arguments);
			}
		});
	};

	ReactiveData.prototype.unwatchData = function () {
		if (this.data !== false) {
			for (var key in this.origFuncs) {
				Object.defineProperty(this.data, key, {
					enumerable: true,
					configurable: true,
					writable: true,
					value: this.origFuncs.key
				});
			}
		}
	};

	ReactiveData.prototype.watchRow = function (row) {
		var data = row.getData();

		this.blocked = true;

		for (var key in data) {
			this.watchKey(row, data, key);
		}

		if (this.table.options.dataTree) {
			this.watchTreeChildren(row);
		}

		this.blocked = false;
	};

	ReactiveData.prototype.watchTreeChildren = function (row) {
		var self = this,
		    childField = row.getData()[this.table.options.dataTreeChildField],
		    origFuncs = {};

		function rebuildTree() {
			self.table.modules.dataTree.initializeRow(row);
			self.table.modules.dataTree.layoutRow(row);
			self.table.rowManager.refreshActiveData("tree", false, true);
		}

		if (childField) {

			origFuncs.push = childField.push;

			Object.defineProperty(childField, "push", {
				enumerable: false,
				configurable: true,
				value: function value() {
					var result = origFuncs.push.apply(childField, arguments);

					rebuildTree();

					return result;
				}
			});

			origFuncs.unshift = childField.unshift;

			Object.defineProperty(childField, "unshift", {
				enumerable: false,
				configurable: true,
				value: function value() {
					var result = origFuncs.unshift.apply(childField, arguments);

					rebuildTree();

					return result;
				}
			});

			origFuncs.shift = childField.shift;

			Object.defineProperty(childField, "shift", {
				enumerable: false,
				configurable: true,
				value: function value() {
					var result = origFuncs.shift.call(childField);

					rebuildTree();

					return result;
				}
			});

			origFuncs.pop = childField.pop;

			Object.defineProperty(childField, "pop", {
				enumerable: false,
				configurable: true,
				value: function value() {
					var result = origFuncs.pop.call(childField);

					rebuildTree();

					return result;
				}
			});

			origFuncs.splice = childField.splice;

			Object.defineProperty(childField, "splice", {
				enumerable: false,
				configurable: true,
				value: function value() {
					var result = origFuncs.splice.apply(childField, arguments);

					rebuildTree();

					return result;
				}
			});
		}
	};

	ReactiveData.prototype.watchKey = function (row, data, key) {
		var self = this,
		    props = Object.getOwnPropertyDescriptor(data, key),
		    value = data[key],
		    version = this.currentVersion;

		Object.defineProperty(data, key, {
			set: function set(newValue) {
				value = newValue;
				if (!self.blocked && version === self.currentVersion) {
					var update = {};
					update[key] = newValue;
					row.updateData(update);
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
	};

	ReactiveData.prototype.unwatchRow = function (row) {
		var data = row.getData();

		for (var key in data) {
			Object.defineProperty(data, key, {
				value: data[key]
			});
		}
	};

	ReactiveData.prototype.block = function () {
		this.blocked = true;
	};

	ReactiveData.prototype.unblock = function () {
		this.blocked = false;
	};

	Tabulator.prototype.registerModule("reactiveData", ReactiveData);

	var ResizeColumns = function ResizeColumns(table) {
		this.table = table; //hold Tabulator object
		this.startColumn = false;
		this.startX = false;
		this.startWidth = false;
		this.handle = null;
		this.prevHandle = null;
	};

	ResizeColumns.prototype.initializeColumn = function (type, column, element) {
		var self = this,
		    variableHeight = false,
		    mode = this.table.options.resizableColumns;

		//set column resize mode
		if (type === "header") {
			variableHeight = column.definition.formatter == "textarea" || column.definition.variableHeight;
			column.modules.resize = { variableHeight: variableHeight };
		}

		if (mode === true || mode == type) {

			var handle = document.createElement('div');
			handle.className = "tabulator-col-resize-handle";

			var prevHandle = document.createElement('div');
			prevHandle.className = "tabulator-col-resize-handle prev";

			handle.addEventListener("click", function (e) {
				e.stopPropagation();
			});

			var handleDown = function handleDown(e) {
				var nearestColumn = column.getLastColumn();

				if (nearestColumn && self._checkResizability(nearestColumn)) {
					self.startColumn = column;
					self._mouseDown(e, nearestColumn, handle);
				}
			};

			handle.addEventListener("mousedown", handleDown);
			handle.addEventListener("touchstart", handleDown, { passive: true });

			//reszie column on  double click
			handle.addEventListener("dblclick", function (e) {
				var col = column.getLastColumn();

				if (col && self._checkResizability(col)) {
					e.stopPropagation();
					col.reinitializeWidth(true);
				}
			});

			prevHandle.addEventListener("click", function (e) {
				e.stopPropagation();
			});

			var prevHandleDown = function prevHandleDown(e) {
				var nearestColumn, colIndex, prevColumn;

				nearestColumn = column.getFirstColumn();

				if (nearestColumn) {
					colIndex = self.table.columnManager.findColumnIndex(nearestColumn);
					prevColumn = colIndex > 0 ? self.table.columnManager.getColumnByIndex(colIndex - 1) : false;

					if (prevColumn && self._checkResizability(prevColumn)) {
						self.startColumn = column;
						self._mouseDown(e, prevColumn, prevHandle);
					}
				}
			};

			prevHandle.addEventListener("mousedown", prevHandleDown);
			prevHandle.addEventListener("touchstart", prevHandleDown, { passive: true });

			//resize column on double click
			prevHandle.addEventListener("dblclick", function (e) {
				var nearestColumn, colIndex, prevColumn;

				nearestColumn = column.getFirstColumn();

				if (nearestColumn) {
					colIndex = self.table.columnManager.findColumnIndex(nearestColumn);
					prevColumn = colIndex > 0 ? self.table.columnManager.getColumnByIndex(colIndex - 1) : false;

					if (prevColumn && self._checkResizability(prevColumn)) {
						e.stopPropagation();
						prevColumn.reinitializeWidth(true);
					}
				}
			});

			element.appendChild(handle);
			element.appendChild(prevHandle);
		}
	};

	ResizeColumns.prototype._checkResizability = function (column) {
		return typeof column.definition.resizable != "undefined" ? column.definition.resizable : this.table.options.resizableColumns;
	};

	ResizeColumns.prototype._mouseDown = function (e, column, handle) {
		var self = this;

		self.table.element.classList.add("tabulator-block-select");

		function mouseMove(e) {
			// self.table.columnManager.tempScrollBlock();

			if (self.table.rtl) {
				column.setWidth(self.startWidth - ((typeof e.screenX === "undefined" ? e.touches[0].screenX : e.screenX) - self.startX));
			} else {
				column.setWidth(self.startWidth + ((typeof e.screenX === "undefined" ? e.touches[0].screenX : e.screenX) - self.startX));
			}

			if (self.table.options.virtualDomHoz) {
				self.table.vdomHoz.reinitialize(true);
			}

			if (!self.table.browserSlow && column.modules.resize && column.modules.resize.variableHeight) {
				column.checkCellHeights();
			}
		}

		function mouseUp(e) {

			//block editor from taking action while resizing is taking place
			if (self.startColumn.modules.edit) {
				self.startColumn.modules.edit.blocked = false;
			}

			if (self.table.browserSlow && column.modules.resize && column.modules.resize.variableHeight) {
				column.checkCellHeights();
			}

			document.body.removeEventListener("mouseup", mouseUp);
			document.body.removeEventListener("mousemove", mouseMove);

			handle.removeEventListener("touchmove", mouseMove);
			handle.removeEventListener("touchend", mouseUp);

			self.table.element.classList.remove("tabulator-block-select");

			if (self.table.options.persistence && self.table.modExists("persistence", true) && self.table.modules.persistence.config.columns) {
				self.table.modules.persistence.save("columns");
			}

			self.table.options.columnResized.call(self.table, column.getComponent());
		}

		e.stopPropagation(); //prevent resize from interfereing with movable columns

		//block editor from taking action while resizing is taking place
		if (self.startColumn.modules.edit) {
			self.startColumn.modules.edit.blocked = true;
		}

		self.startX = typeof e.screenX === "undefined" ? e.touches[0].screenX : e.screenX;
		self.startWidth = column.getWidth();

		document.body.addEventListener("mousemove", mouseMove);
		document.body.addEventListener("mouseup", mouseUp);
		handle.addEventListener("touchmove", mouseMove, { passive: true });
		handle.addEventListener("touchend", mouseUp);
	};

	Tabulator.prototype.registerModule("resizeColumns", ResizeColumns);
	var ResizeRows = function ResizeRows(table) {
		this.table = table; //hold Tabulator object
		this.startColumn = false;
		this.startY = false;
		this.startHeight = false;
		this.handle = null;
		this.prevHandle = null;
	};

	ResizeRows.prototype.initializeRow = function (row) {
		var self = this,
		    rowEl = row.getElement();

		var handle = document.createElement('div');
		handle.className = "tabulator-row-resize-handle";

		var prevHandle = document.createElement('div');
		prevHandle.className = "tabulator-row-resize-handle prev";

		handle.addEventListener("click", function (e) {
			e.stopPropagation();
		});

		var handleDown = function handleDown(e) {
			self.startRow = row;
			self._mouseDown(e, row, handle);
		};

		handle.addEventListener("mousedown", handleDown);
		handle.addEventListener("touchstart", handleDown, { passive: true });

		prevHandle.addEventListener("click", function (e) {
			e.stopPropagation();
		});

		var prevHandleDown = function prevHandleDown(e) {
			var prevRow = self.table.rowManager.prevDisplayRow(row);

			if (prevRow) {
				self.startRow = prevRow;
				self._mouseDown(e, prevRow, prevHandle);
			}
		};

		prevHandle.addEventListener("mousedown", prevHandleDown);
		prevHandle.addEventListener("touchstart", prevHandleDown, { passive: true });

		rowEl.appendChild(handle);
		rowEl.appendChild(prevHandle);
	};

	ResizeRows.prototype._mouseDown = function (e, row, handle) {
		var self = this;

		self.table.element.classList.add("tabulator-block-select");

		function mouseMove(e) {
			row.setHeight(self.startHeight + ((typeof e.screenY === "undefined" ? e.touches[0].screenY : e.screenY) - self.startY));
		}

		function mouseUp(e) {

			// //block editor from taking action while resizing is taking place
			// if(self.startColumn.modules.edit){
			// 	self.startColumn.modules.edit.blocked = false;
			// }

			document.body.removeEventListener("mouseup", mouseMove);
			document.body.removeEventListener("mousemove", mouseMove);

			handle.removeEventListener("touchmove", mouseMove);
			handle.removeEventListener("touchend", mouseUp);

			self.table.element.classList.remove("tabulator-block-select");

			self.table.options.rowResized.call(this.table, row.getComponent());
		}

		e.stopPropagation(); //prevent resize from interfereing with movable columns

		//block editor from taking action while resizing is taking place
		// if(self.startColumn.modules.edit){
		// 	self.startColumn.modules.edit.blocked = true;
		// }

		self.startY = typeof e.screenY === "undefined" ? e.touches[0].screenY : e.screenY;
		self.startHeight = row.getHeight();

		document.body.addEventListener("mousemove", mouseMove);
		document.body.addEventListener("mouseup", mouseUp);

		handle.addEventListener("touchmove", mouseMove, { passive: true });
		handle.addEventListener("touchend", mouseUp);
	};

	Tabulator.prototype.registerModule("resizeRows", ResizeRows);
	var ResizeTable = function ResizeTable(table) {
		this.table = table; //hold Tabulator object
		this.binding = false;
		this.observer = false;
		this.containerObserver = false;

		this.tableHeight = 0;
		this.tableWidth = 0;
		this.containerHeight = 0;
		this.containerWidth = 0;

		this.autoResize = false;
	};

	ResizeTable.prototype.initialize = function (row) {
		var _this83 = this;

		var table = this.table,
		    tableStyle;

		this.tableHeight = table.element.clientHeight;
		this.tableWidth = table.element.clientWidth;

		if (table.element.parentNode) {
			this.containerHeight = table.element.parentNode.clientHeight;
			this.containerWidth = table.element.parentNode.clientWidth;
		}

		if (typeof ResizeObserver !== "undefined" && table.rowManager.getRenderMode() === "virtual") {

			this.autoResize = true;

			this.observer = new ResizeObserver(function (entry) {
				if (!table.browserMobile || table.browserMobile && !table.modules.edit.currentCell) {

					var nodeHeight = Math.floor(entry[0].contentRect.height);
					var nodeWidth = Math.floor(entry[0].contentRect.width);

					if (_this83.tableHeight != nodeHeight || _this83.tableWidth != nodeWidth) {
						_this83.tableHeight = nodeHeight;
						_this83.tableWidth = nodeWidth;

						if (table.element.parentNode) {
							_this83.containerHeight = table.element.parentNode.clientHeight;
							_this83.containerWidth = table.element.parentNode.clientWidth;
						}

						if (table.options.virtualDomHoz) {
							table.vdomHoz.reinitialize(true);
						}

						table.redraw();
					}
				}
			});

			this.observer.observe(table.element);

			tableStyle = window.getComputedStyle(table.element);

			if (this.table.element.parentNode && !this.table.rowManager.fixedHeight && (tableStyle.getPropertyValue("max-height") || tableStyle.getPropertyValue("min-height"))) {

				this.containerObserver = new ResizeObserver(function (entry) {
					if (!table.browserMobile || table.browserMobile && !table.modules.edit.currentCell) {

						var nodeHeight = Math.floor(entry[0].contentRect.height);
						var nodeWidth = Math.floor(entry[0].contentRect.width);

						if (_this83.containerHeight != nodeHeight || _this83.containerWidth != nodeWidth) {
							_this83.containerHeight = nodeHeight;
							_this83.containerWidth = nodeWidth;
							_this83.tableHeight = table.element.clientHeight;
							_this83.tableWidth = table.element.clientWidth;
						}

						if (table.options.virtualDomHoz) {
							table.vdomHoz.reinitialize(true);
						}

						table.redraw();
					}
				});

				this.containerObserver.observe(this.table.element.parentNode);
			}
		} else {
			this.binding = function () {
				if (!table.browserMobile || table.browserMobile && !table.modules.edit.currentCell) {
					if (table.options.virtualDomHoz) {
						table.vdomHoz.reinitialize(true);
					}

					table.redraw();
				}
			};

			window.addEventListener("resize", this.binding);
		}
	};

	ResizeTable.prototype.clearBindings = function (row) {
		if (this.binding) {
			window.removeEventListener("resize", this.binding);
		}

		if (this.observer) {
			this.observer.unobserve(this.table.element);
		}

		if (this.containerObserver) {
			this.containerObserver.unobserve(this.table.element.parentNode);
		}
	};

	Tabulator.prototype.registerModule("resizeTable", ResizeTable);
	var ResponsiveLayout = function ResponsiveLayout(table) {
		this.table = table; //hold Tabulator object
		this.columns = [];
		this.hiddenColumns = [];
		this.mode = "";
		this.index = 0;
		this.collapseFormatter = [];
		this.collapseStartOpen = true;
		this.collapseHandleColumn = false;
	};

	//generate resposive columns list
	ResponsiveLayout.prototype.initialize = function () {
		var self = this,
		    columns = [];

		this.mode = this.table.options.responsiveLayout;
		this.collapseFormatter = this.table.options.responsiveLayoutCollapseFormatter || this.formatCollapsedData;
		this.collapseStartOpen = this.table.options.responsiveLayoutCollapseStartOpen;
		this.hiddenColumns = [];

		//detemine level of responsivity for each column
		this.table.columnManager.columnsByIndex.forEach(function (column, i) {
			if (column.modules.responsive) {
				if (column.modules.responsive.order && column.modules.responsive.visible) {
					column.modules.responsive.index = i;
					columns.push(column);

					if (!column.visible && self.mode === "collapse") {
						self.hiddenColumns.push(column);
					}
				}
			}
		});

		//sort list by responsivity
		columns = columns.reverse();
		columns = columns.sort(function (a, b) {
			var diff = b.modules.responsive.order - a.modules.responsive.order;
			return diff || b.modules.responsive.index - a.modules.responsive.index;
		});

		this.columns = columns;

		if (this.mode === "collapse") {
			this.generateCollapsedContent();
		}

		//assign collapse column
		for (var _iterator = this.table.columnManager.columnsByIndex, _isArray = Array.isArray(_iterator), _i17 = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
			var _ref;

			if (_isArray) {
				if (_i17 >= _iterator.length) break;
				_ref = _iterator[_i17++];
			} else {
				_i17 = _iterator.next();
				if (_i17.done) break;
				_ref = _i17.value;
			}

			var col = _ref;

			if (col.definition.formatter == "responsiveCollapse") {
				this.collapseHandleColumn = col;
				break;
			}
		}

		if (this.collapseHandleColumn) {
			if (this.hiddenColumns.length) {
				this.collapseHandleColumn.show();
			} else {
				this.collapseHandleColumn.hide();
			}
		}
	};

	//define layout information
	ResponsiveLayout.prototype.initializeColumn = function (column) {
		var def = column.getDefinition();

		column.modules.responsive = { order: typeof def.responsive === "undefined" ? 1 : def.responsive, visible: def.visible === false ? false : true };
	};

	ResponsiveLayout.prototype.initializeRow = function (row) {
		var el;

		if (row.type !== "calc") {
			el = document.createElement("div");
			el.classList.add("tabulator-responsive-collapse");

			row.modules.responsiveLayout = {
				element: el,
				open: this.collapseStartOpen
			};

			if (!this.collapseStartOpen) {
				el.style.display = 'none';
			}
		}
	};

	ResponsiveLayout.prototype.layoutRow = function (row) {
		var rowEl = row.getElement();

		if (row.modules.responsiveLayout) {
			rowEl.appendChild(row.modules.responsiveLayout.element);
			this.generateCollapsedRowContent(row);
		}
	};

	//update column visibility
	ResponsiveLayout.prototype.updateColumnVisibility = function (column, visible) {
		var index;
		if (column.modules.responsive) {
			column.modules.responsive.visible = visible;
			this.initialize();
		}
	};

	ResponsiveLayout.prototype.hideColumn = function (column) {
		var colCount = this.hiddenColumns.length;

		column.hide(false, true);

		if (this.mode === "collapse") {
			this.hiddenColumns.unshift(column);
			this.generateCollapsedContent();

			if (this.collapseHandleColumn && !colCount) {
				this.collapseHandleColumn.show();
			}
		}
	};

	ResponsiveLayout.prototype.showColumn = function (column) {
		var index;

		column.show(false, true);
		//set column width to prevent calculation loops on uninitialized columns
		column.setWidth(column.getWidth());

		if (this.mode === "collapse") {
			index = this.hiddenColumns.indexOf(column);

			if (index > -1) {
				this.hiddenColumns.splice(index, 1);
			}

			this.generateCollapsedContent();

			if (this.collapseHandleColumn && !this.hiddenColumns.length) {
				this.collapseHandleColumn.hide();
			}
		}
	};

	//redraw columns to fit space
	ResponsiveLayout.prototype.update = function () {
		var self = this,
		    working = true;

		while (working) {

			var width = self.table.modules.layout.getMode() == "fitColumns" ? self.table.columnManager.getFlexBaseWidth() : self.table.columnManager.getWidth();

			var diff = (self.table.options.headerVisible ? self.table.columnManager.element.clientWidth : self.table.element.clientWidth) - width;

			if (diff < 0) {
				//table is too wide
				var column = self.columns[self.index];

				if (column) {
					self.hideColumn(column);
					self.index++;
				} else {
					working = false;
				}
			} else {

				//table has spare space
				var _column = self.columns[self.index - 1];

				if (_column) {
					if (diff > 0) {
						if (diff >= _column.getWidth()) {
							self.showColumn(_column);
							self.index--;
						} else {
							working = false;
						}
					} else {
						working = false;
					}
				} else {
					working = false;
				}
			}

			if (!self.table.rowManager.activeRowsCount) {
				self.table.rowManager.renderEmptyScroll();
			}
		}
	};

	ResponsiveLayout.prototype.generateCollapsedContent = function () {
		var self = this,
		    rows = this.table.rowManager.getDisplayRows();

		rows.forEach(function (row) {
			self.generateCollapsedRowContent(row);
		});
	};

	ResponsiveLayout.prototype.generateCollapsedRowContent = function (row) {
		var el, contents;

		if (row.modules.responsiveLayout) {
			el = row.modules.responsiveLayout.element;

			while (el.firstChild) {
				el.removeChild(el.firstChild);
			}contents = this.collapseFormatter(this.generateCollapsedRowData(row));
			if (contents) {
				el.appendChild(contents);
			}
		}
	};

	ResponsiveLayout.prototype.generateCollapsedRowData = function (row) {
		var self = this,
		    data = row.getData(),
		    output = [],
		    mockCellComponent;

		this.hiddenColumns.forEach(function (column) {
			var value = column.getFieldValue(data);

			if (column.definition.title && column.field) {
				if (column.modules.format && self.table.options.responsiveLayoutCollapseUseFormatters) {

					mockCellComponent = {
						value: false,
						data: {},
						getValue: function getValue() {
							return value;
						},
						getData: function getData() {
							return data;
						},
						getElement: function getElement() {
							return document.createElement("div");
						},
						getRow: function getRow() {
							return row.getComponent();
						},
						getColumn: function getColumn() {
							return column.getComponent();
						}
					};

					output.push({
						field: column.field,
						title: column.definition.title,
						value: column.modules.format.formatter.call(self.table.modules.format, mockCellComponent, column.modules.format.params)
					});
				} else {
					output.push({
						field: column.field,
						title: column.definition.title,
						value: value
					});
				}
			}
		});

		return output;
	};

	ResponsiveLayout.prototype.formatCollapsedData = function (data) {
		var list = document.createElement("table");

		data.forEach(function (item) {
			var row = document.createElement("tr");
			var titleData = document.createElement("td");
			var valueData = document.createElement("td");
			var node_content;

			var titleHighlight = document.createElement("strong");
			titleData.appendChild(titleHighlight);
			this.table.modules.localize.bind("columns|" + item.field, function (text) {
				titleHighlight.innerText = text || item.title;
			});

			if (item.value instanceof Node) {
				node_content = document.createElement("div");
				node_content.appendChild(item.value);
				valueData.appendChild(node_content);
			} else {
				valueData.innerHTML = item.value;
			}

			row.appendChild(titleData);
			row.appendChild(valueData);
			list.appendChild(row);
		}, this);

		return Object.keys(data).length ? list : "";
	};

	Tabulator.prototype.registerModule("responsiveLayout", ResponsiveLayout);

	var SelectRow = function SelectRow(table) {
		this.table = table; //hold Tabulator object
		this.selecting = false; //flag selecting in progress
		this.lastClickedRow = false; //last clicked row
		this.selectPrev = []; //hold previously selected element for drag drop selection
		this.selectedRows = []; //hold selected rows
		this.headerCheckboxElement = null; // hold header select element
	};

	SelectRow.prototype.clearSelectionData = function (silent) {
		this.selecting = false;
		this.lastClickedRow = false;
		this.selectPrev = [];
		this.selectedRows = [];

		if (!silent) {
			this._rowSelectionChanged();
		}
	};

	SelectRow.prototype.initializeRow = function (row) {
		var self = this,
		    element = row.getElement();

		// trigger end of row selection
		var endSelect = function endSelect() {

			setTimeout(function () {
				self.selecting = false;
			}, 50);

			document.body.removeEventListener("mouseup", endSelect);
		};

		row.modules.select = { selected: false };

		//set row selection class
		if (self.table.options.selectableCheck.call(this.table, row.getComponent())) {
			element.classList.add("tabulator-selectable");
			element.classList.remove("tabulator-unselectable");

			if (self.table.options.selectable && self.table.options.selectable != "highlight") {
				if (self.table.options.selectableRangeMode === "click") {
					element.addEventListener("click", function (e) {
						if (e.shiftKey) {
							self.table._clearSelection();
							self.lastClickedRow = self.lastClickedRow || row;

							var lastClickedRowIdx = self.table.rowManager.getDisplayRowIndex(self.lastClickedRow);
							var rowIdx = self.table.rowManager.getDisplayRowIndex(row);

							var fromRowIdx = lastClickedRowIdx <= rowIdx ? lastClickedRowIdx : rowIdx;
							var toRowIdx = lastClickedRowIdx >= rowIdx ? lastClickedRowIdx : rowIdx;

							var rows = self.table.rowManager.getDisplayRows().slice(0);
							var toggledRows = rows.splice(fromRowIdx, toRowIdx - fromRowIdx + 1);

							if (e.ctrlKey || e.metaKey) {
								toggledRows.forEach(function (toggledRow) {
									if (toggledRow !== self.lastClickedRow) {

										if (self.table.options.selectable !== true && !self.isRowSelected(row)) {
											if (self.selectedRows.length < self.table.options.selectable) {
												self.toggleRow(toggledRow);
											}
										} else {
											self.toggleRow(toggledRow);
										}
									}
								});
								self.lastClickedRow = row;
							} else {
								self.deselectRows(undefined, true);

								if (self.table.options.selectable !== true) {
									if (toggledRows.length > self.table.options.selectable) {
										toggledRows = toggledRows.slice(0, self.table.options.selectable);
									}
								}

								self.selectRows(toggledRows);
							}
							self.table._clearSelection();
						} else if (e.ctrlKey || e.metaKey) {
							self.toggleRow(row);
							self.lastClickedRow = row;
						} else {
							self.deselectRows(undefined, true);
							self.selectRows(row);
							self.lastClickedRow = row;
						}
					});
				} else {
					element.addEventListener("click", function (e) {
						if (!self.table.modExists("edit") || !self.table.modules.edit.getCurrentCell()) {
							self.table._clearSelection();
						}

						if (!self.selecting) {
							self.toggleRow(row);
						}
					});

					element.addEventListener("mousedown", function (e) {
						if (e.shiftKey) {
							self.table._clearSelection();

							self.selecting = true;

							self.selectPrev = [];

							document.body.addEventListener("mouseup", endSelect);
							document.body.addEventListener("keyup", endSelect);

							self.toggleRow(row);

							return false;
						}
					});

					element.addEventListener("mouseenter", function (e) {
						if (self.selecting) {
							self.table._clearSelection();
							self.toggleRow(row);

							if (self.selectPrev[1] == row) {
								self.toggleRow(self.selectPrev[0]);
							}
						}
					});

					element.addEventListener("mouseout", function (e) {
						if (self.selecting) {
							self.table._clearSelection();
							self.selectPrev.unshift(row);
						}
					});
				}
			}
		} else {
			element.classList.add("tabulator-unselectable");
			element.classList.remove("tabulator-selectable");
		}
	};

	//toggle row selection
	SelectRow.prototype.toggleRow = function (row) {
		if (this.table.options.selectableCheck.call(this.table, row.getComponent())) {
			if (row.modules.select && row.modules.select.selected) {
				this._deselectRow(row);
			} else {
				this._selectRow(row);
			}
		}
	};

	//select a number of rows
	SelectRow.prototype.selectRows = function (rows) {
		var _this84 = this;

		var rowMatch;

		switch (typeof rows === 'undefined' ? 'undefined' : _typeof(rows)) {
			case "undefined":
				this.table.rowManager.rows.forEach(function (row) {
					_this84._selectRow(row, true, true);
				});

				this._rowSelectionChanged();
				break;

			case "string":

				rowMatch = this.table.rowManager.findRow(rows);

				if (rowMatch) {
					this._selectRow(rowMatch, true, true);
				} else {
					this.table.rowManager.getRows(rows).forEach(function (row) {
						_this84._selectRow(row, true, true);
					});
				}

				this._rowSelectionChanged();
				break;

			default:
				if (Array.isArray(rows)) {
					rows.forEach(function (row) {
						_this84._selectRow(row, true, true);
					});

					this._rowSelectionChanged();
				} else {
					this._selectRow(rows, false, true);
				}
				break;
		}
	};

	//select an individual row
	SelectRow.prototype._selectRow = function (rowInfo, silent, force) {
		var index;

		//handle max row count
		if (!isNaN(this.table.options.selectable) && this.table.options.selectable !== true && !force) {
			if (this.selectedRows.length >= this.table.options.selectable) {
				if (this.table.options.selectableRollingSelection) {
					this._deselectRow(this.selectedRows[0]);
				} else {
					return false;
				}
			}
		}

		var row = this.table.rowManager.findRow(rowInfo);

		if (row) {
			if (this.selectedRows.indexOf(row) == -1) {
				row.getElement().classList.add("tabulator-selected");
				if (!row.modules.select) {
					row.modules.select = {};
				}

				row.modules.select.selected = true;
				if (row.modules.select.checkboxEl) {
					row.modules.select.checkboxEl.checked = true;
				}

				this.selectedRows.push(row);

				if (this.table.options.dataTreeSelectPropagate) {
					this.childRowSelection(row, true);
				}

				if (!silent) {
					this.table.options.rowSelected.call(this.table, row.getComponent());
				}

				this._rowSelectionChanged(silent);
			}
		} else {
			if (!silent) {
				console.warn("Selection Error - No such row found, ignoring selection:" + rowInfo);
			}
		}
	};

	SelectRow.prototype.isRowSelected = function (row) {
		return this.selectedRows.indexOf(row) !== -1;
	};

	//deselect a number of rows
	SelectRow.prototype.deselectRows = function (rows, silent) {
		var self = this,
		    rowCount;

		if (typeof rows == "undefined") {

			rowCount = self.selectedRows.length;

			for (var _i18 = 0; _i18 < rowCount; _i18++) {
				self._deselectRow(self.selectedRows[0], true);
			}

			self._rowSelectionChanged(silent);
		} else {
			if (Array.isArray(rows)) {
				rows.forEach(function (row) {
					self._deselectRow(row, true);
				});

				self._rowSelectionChanged(silent);
			} else {
				self._deselectRow(rows, silent);
			}
		}
	};

	//deselect an individual row
	SelectRow.prototype._deselectRow = function (rowInfo, silent) {
		var self = this,
		    row = self.table.rowManager.findRow(rowInfo),
		    index;

		if (row) {
			index = self.selectedRows.findIndex(function (selectedRow) {
				return selectedRow == row;
			});

			if (index > -1) {

				row.getElement().classList.remove("tabulator-selected");
				if (!row.modules.select) {
					row.modules.select = {};
				}

				row.modules.select.selected = false;
				if (row.modules.select.checkboxEl) {
					row.modules.select.checkboxEl.checked = false;
				}
				self.selectedRows.splice(index, 1);

				if (this.table.options.dataTreeSelectPropagate) {
					this.childRowSelection(row, false);
				}

				if (!silent) {
					self.table.options.rowDeselected.call(this.table, row.getComponent());
				}

				self._rowSelectionChanged(silent);
			}
		} else {
			if (!silent) {
				console.warn("Deselection Error - No such row found, ignoring selection:" + rowInfo);
			}
		}
	};

	SelectRow.prototype.getSelectedData = function () {
		var data = [];

		this.selectedRows.forEach(function (row) {
			data.push(row.getData());
		});

		return data;
	};

	SelectRow.prototype.getSelectedRows = function () {

		var rows = [];

		this.selectedRows.forEach(function (row) {
			rows.push(row.getComponent());
		});

		return rows;
	};

	SelectRow.prototype._rowSelectionChanged = function (silent) {
		if (this.headerCheckboxElement) {
			if (this.selectedRows.length === 0) {
				this.headerCheckboxElement.checked = false;
				this.headerCheckboxElement.indeterminate = false;
			} else if (this.table.rowManager.rows.length === this.selectedRows.length) {
				this.headerCheckboxElement.checked = true;
				this.headerCheckboxElement.indeterminate = false;
			} else {
				this.headerCheckboxElement.indeterminate = true;
				this.headerCheckboxElement.checked = false;
			}
		}

		if (!silent) {
			this.table.options.rowSelectionChanged.call(this.table, this.getSelectedData(), this.getSelectedRows());
		}
	};

	SelectRow.prototype.registerRowSelectCheckbox = function (row, element) {
		if (!row._row.modules.select) {
			row._row.modules.select = {};
		}

		row._row.modules.select.checkboxEl = element;
	};

	SelectRow.prototype.registerHeaderSelectCheckbox = function (element) {
		this.headerCheckboxElement = element;
	};

	SelectRow.prototype.childRowSelection = function (row, select) {
		var children = this.table.modules.dataTree.getChildren(row, true);

		if (select) {
			for (var _iterator2 = children, _isArray2 = Array.isArray(_iterator2), _i19 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
				var _ref2;

				if (_isArray2) {
					if (_i19 >= _iterator2.length) break;
					_ref2 = _iterator2[_i19++];
				} else {
					_i19 = _iterator2.next();
					if (_i19.done) break;
					_ref2 = _i19.value;
				}

				var child = _ref2;

				this._selectRow(child, true);
			}
		} else {
			for (var _iterator3 = children, _isArray3 = Array.isArray(_iterator3), _i20 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
				var _ref3;

				if (_isArray3) {
					if (_i20 >= _iterator3.length) break;
					_ref3 = _iterator3[_i20++];
				} else {
					_i20 = _iterator3.next();
					if (_i20.done) break;
					_ref3 = _i20.value;
				}

				var _child = _ref3;

				this._deselectRow(_child, true);
			}
		}
	};

	Tabulator.prototype.registerModule("selectRow", SelectRow);

	var Sort = function Sort(table) {
		this.table = table; //hold Tabulator object
		this.sortList = []; //holder current sort
		this.changed = false; //has the sort changed since last render
	};

	//initialize column header for sorting
	Sort.prototype.initializeColumn = function (column, content) {
		var self = this,
		    sorter = false,
		    colEl,
		    arrowEl;

		switch (_typeof(column.definition.sorter)) {
			case "string":
				if (self.sorters[column.definition.sorter]) {
					sorter = self.sorters[column.definition.sorter];
				} else {
					console.warn("Sort Error - No such sorter found: ", column.definition.sorter);
				}
				break;

			case "function":
				sorter = column.definition.sorter;
				break;
		}

		column.modules.sort = {
			sorter: sorter, dir: "none",
			params: column.definition.sorterParams || {},
			startingDir: column.definition.headerSortStartingDir || "asc",
			tristate: typeof column.definition.headerSortTristate !== "undefined" ? column.definition.headerSortTristate : this.table.options.headerSortTristate
		};

		if (typeof column.definition.headerSort === "undefined" ? this.table.options.headerSort !== false : column.definition.headerSort !== false) {

			colEl = column.getElement();

			colEl.classList.add("tabulator-sortable");

			arrowEl = document.createElement("div");
			arrowEl.classList.add("tabulator-col-sorter");

			if (_typeof(this.table.options.headerSortElement) == "object") {
				arrowEl.appendChild(this.table.options.headerSortElement);
			} else {
				arrowEl.innerHTML = this.table.options.headerSortElement;
			}

			//create sorter arrow
			content.appendChild(arrowEl);

			column.modules.sort.element = arrowEl;

			//sort on click
			colEl.addEventListener("click", function (e) {
				var dir = "",
				    sorters = [],
				    match = false;

				if (column.modules.sort) {
					if (column.modules.sort.tristate) {
						if (column.modules.sort.dir == "none") {
							dir = column.modules.sort.startingDir;
						} else {
							if (column.modules.sort.dir == column.modules.sort.startingDir) {
								dir = column.modules.sort.dir == "asc" ? "desc" : "asc";
							} else {
								dir = "none";
							}
						}
					} else {
						switch (column.modules.sort.dir) {
							case "asc":
								dir = "desc";
								break;

							case "desc":
								dir = "asc";
								break;

							default:
								dir = column.modules.sort.startingDir;
						}
					}

					if (self.table.options.columnHeaderSortMulti && (e.shiftKey || e.ctrlKey)) {
						sorters = self.getSort();

						match = sorters.findIndex(function (sorter) {
							return sorter.field === column.getField();
						});

						if (match > -1) {
							sorters[match].dir = dir;

							if (match != sorters.length - 1) {
								match = sorters.splice(match, 1)[0];
								if (dir != "none") {
									sorters.push(match);
								}
							}
						} else {
							if (dir != "none") {
								sorters.push({ column: column, dir: dir });
							}
						}

						//add to existing sort
						self.setSort(sorters);
					} else {
						if (dir == "none") {
							self.clear();
						} else {
							//sort by column only
							self.setSort(column, dir);
						}
					}

					self.table.rowManager.sorterRefresh(!self.sortList.length);
				}
			});
		}
	};

	//check if the sorters have changed since last use
	Sort.prototype.hasChanged = function () {
		var changed = this.changed;
		this.changed = false;
		return changed;
	};

	//return current sorters
	Sort.prototype.getSort = function () {
		var self = this,
		    sorters = [];

		self.sortList.forEach(function (item) {
			if (item.column) {
				sorters.push({ column: item.column.getComponent(), field: item.column.getField(), dir: item.dir });
			}
		});

		return sorters;
	};

	//change sort list and trigger sort
	Sort.prototype.setSort = function (sortList, dir) {
		var self = this,
		    newSortList = [];

		if (!Array.isArray(sortList)) {
			sortList = [{ column: sortList, dir: dir }];
		}

		sortList.forEach(function (item) {
			var column;

			column = self.table.columnManager.findColumn(item.column);

			if (column) {
				item.column = column;
				newSortList.push(item);
				self.changed = true;
			} else {
				console.warn("Sort Warning - Sort field does not exist and is being ignored: ", item.column);
			}
		});

		self.sortList = newSortList;

		if (this.table.options.persistence && this.table.modExists("persistence", true) && this.table.modules.persistence.config.sort) {
			this.table.modules.persistence.save("sort");
		}
	};

	//clear sorters
	Sort.prototype.clear = function () {
		this.setSort([]);
	};

	//find appropriate sorter for column
	Sort.prototype.findSorter = function (column) {
		var row = this.table.rowManager.activeRows[0],
		    sorter = "string",
		    field,
		    value;

		if (row) {
			row = row.getData();
			field = column.getField();

			if (field) {

				value = column.getFieldValue(row);

				switch (typeof value === 'undefined' ? 'undefined' : _typeof(value)) {
					case "undefined":
						sorter = "string";
						break;

					case "boolean":
						sorter = "boolean";
						break;

					default:
						if (!isNaN(value) && value !== "") {
							sorter = "number";
						} else {
							if (value.match(/((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+$/i)) {
								sorter = "alphanum";
							}
						}
						break;
				}
			}
		}

		return this.sorters[sorter];
	};

	//work through sort list sorting data
	Sort.prototype.sort = function (data) {
		var self = this,
		    sortList = this.table.options.sortOrderReverse ? self.sortList.slice().reverse() : self.sortList,
		    sortListActual = [],
		    rowComponents = [],
		    lastSort;

		if (self.table.options.dataSorting) {
			self.table.options.dataSorting.call(self.table, self.getSort());
		}

		self.clearColumnHeaders();

		if (!self.table.options.ajaxSorting) {

			//build list of valid sorters and trigger column specific callbacks before sort begins
			sortList.forEach(function (item, i) {
				var sortObj = item.column.modules.sort;

				if (item.column && sortObj) {

					//if no sorter has been defined, take a guess
					if (!sortObj.sorter) {
						sortObj.sorter = self.findSorter(item.column);
					}

					item.params = typeof sortObj.params === "function" ? sortObj.params(item.column.getComponent(), item.dir) : sortObj.params;

					sortListActual.push(item);
				}

				self.setColumnHeader(item.column, item.dir);
			});

			//sort data
			if (sortListActual.length) {
				self._sortItems(data, sortListActual);
			}
		} else {
			sortList.forEach(function (item, i) {
				self.setColumnHeader(item.column, item.dir);
			});
		}

		if (self.table.options.dataSorted) {
			data.forEach(function (row) {
				rowComponents.push(row.getComponent());
			});

			self.table.options.dataSorted.call(self.table, self.getSort(), rowComponents);
		}
	};

	//clear sort arrows on columns
	Sort.prototype.clearColumnHeaders = function () {
		this.table.columnManager.getRealColumns().forEach(function (column) {
			if (column.modules.sort) {
				column.modules.sort.dir = "none";
				column.getElement().setAttribute("aria-sort", "none");
			}
		});
	};

	//set the column header sort direction
	Sort.prototype.setColumnHeader = function (column, dir) {
		column.modules.sort.dir = dir;
		column.getElement().setAttribute("aria-sort", dir);
	};

	//sort each item in sort list
	Sort.prototype._sortItems = function (data, sortList) {
		var _this85 = this;

		var sorterCount = sortList.length - 1;

		data.sort(function (a, b) {
			var result;

			for (var i = sorterCount; i >= 0; i--) {
				var sortItem = sortList[i];

				result = _this85._sortRow(a, b, sortItem.column, sortItem.dir, sortItem.params);

				if (result !== 0) {
					break;
				}
			}

			return result;
		});
	};

	//process individual rows for a sort function on active data
	Sort.prototype._sortRow = function (a, b, column, dir, params) {
		var el1Comp, el2Comp, colComp;

		//switch elements depending on search direction
		var el1 = dir == "asc" ? a : b;
		var el2 = dir == "asc" ? b : a;

		a = column.getFieldValue(el1.getData());
		b = column.getFieldValue(el2.getData());

		a = typeof a !== "undefined" ? a : "";
		b = typeof b !== "undefined" ? b : "";

		el1Comp = el1.getComponent();
		el2Comp = el2.getComponent();

		return column.modules.sort.sorter.call(this, a, b, el1Comp, el2Comp, column.getComponent(), dir, params);
	};

	//default data sorters
	Sort.prototype.sorters = {

		//sort numbers
		number: function number(a, b, aRow, bRow, column, dir, params) {
			var alignEmptyValues = params.alignEmptyValues;
			var decimal = params.decimalSeparator;
			var thousand = params.thousandSeparator;
			var emptyAlign = 0;

			a = String(a);
			b = String(b);

			if (thousand) {
				a = a.split(thousand).join("");
				b = b.split(thousand).join("");
			}

			if (decimal) {
				a = a.split(decimal).join(".");
				b = b.split(decimal).join(".");
			}

			a = parseFloat(a);
			b = parseFloat(b);

			//handle non numeric values
			if (isNaN(a)) {
				emptyAlign = isNaN(b) ? 0 : -1;
			} else if (isNaN(b)) {
				emptyAlign = 1;
			} else {
				//compare valid values
				return a - b;
			}

			//fix empty values in position
			if (alignEmptyValues === "top" && dir === "desc" || alignEmptyValues === "bottom" && dir === "asc") {
				emptyAlign *= -1;
			}

			return emptyAlign;
		},

		//sort strings
		string: function string(a, b, aRow, bRow, column, dir, params) {
			var alignEmptyValues = params.alignEmptyValues;
			var emptyAlign = 0;
			var locale;

			//handle empty values
			if (!a) {
				emptyAlign = !b ? 0 : -1;
			} else if (!b) {
				emptyAlign = 1;
			} else {
				//compare valid values
				switch (_typeof(params.locale)) {
					case "boolean":
						if (params.locale) {
							locale = this.table.modules.localize.getLocale();
						}
						break;
					case "string":
						locale = params.locale;
						break;
				}

				return String(a).toLowerCase().localeCompare(String(b).toLowerCase(), locale);
			}

			//fix empty values in position
			if (alignEmptyValues === "top" && dir === "desc" || alignEmptyValues === "bottom" && dir === "asc") {
				emptyAlign *= -1;
			}

			return emptyAlign;
		},

		//sort date
		date: function date(a, b, aRow, bRow, column, dir, params) {
			if (!params.format) {
				params.format = "DD/MM/YYYY";
			}

			return this.sorters.datetime.call(this, a, b, aRow, bRow, column, dir, params);
		},

		//sort HH:mm formatted times
		time: function time(a, b, aRow, bRow, column, dir, params) {
			if (!params.format) {
				params.format = "HH:mm";
			}

			return this.sorters.datetime.call(this, a, b, aRow, bRow, column, dir, params);
		},

		//sort datetime
		datetime: function datetime(a, b, aRow, bRow, column, dir, params) {
			var format = params.format || "DD/MM/YYYY HH:mm:ss",
			    alignEmptyValues = params.alignEmptyValues,
			    emptyAlign = 0;

			if (typeof moment != "undefined") {
				a = moment(a, format);
				b = moment(b, format);

				if (!a.isValid()) {
					emptyAlign = !b.isValid() ? 0 : -1;
				} else if (!b.isValid()) {
					emptyAlign = 1;
				} else {
					//compare valid values
					return a - b;
				}

				//fix empty values in position
				if (alignEmptyValues === "top" && dir === "desc" || alignEmptyValues === "bottom" && dir === "asc") {
					emptyAlign *= -1;
				}

				return emptyAlign;
			} else {
				console.error("Sort Error - 'datetime' sorter is dependant on moment.js");
			}
		},

		//sort booleans
		boolean: function boolean(a, b, aRow, bRow, column, dir, params) {
			var el1 = a === true || a === "true" || a === "True" || a === 1 ? 1 : 0;
			var el2 = b === true || b === "true" || b === "True" || b === 1 ? 1 : 0;

			return el1 - el2;
		},

		//sort if element contains any data
		array: function array(a, b, aRow, bRow, column, dir, params) {
			var el1 = 0;
			var el2 = 0;
			var type = params.type || "length";
			var alignEmptyValues = params.alignEmptyValues;
			var emptyAlign = 0;

			function calc(value) {

				switch (type) {
					case "length":
						return value.length;
						break;

					case "sum":
						return value.reduce(function (c, d) {
							return c + d;
						});
						break;

					case "max":
						return Math.max.apply(null, value);
						break;

					case "min":
						return Math.min.apply(null, value);
						break;

					case "avg":
						return value.reduce(function (c, d) {
							return c + d;
						}) / value.length;
						break;
				}
			}

			//handle non array values
			if (!Array.isArray(a)) {
				alignEmptyValues = !Array.isArray(b) ? 0 : -1;
			} else if (!Array.isArray(b)) {
				alignEmptyValues = 1;
			} else {

				//compare valid values
				el1 = a ? calc(a) : 0;
				el2 = b ? calc(b) : 0;

				return el1 - el2;
			}

			//fix empty values in position
			if (alignEmptyValues === "top" && dir === "desc" || alignEmptyValues === "bottom" && dir === "asc") {
				emptyAlign *= -1;
			}

			return emptyAlign;
		},

		//sort if element contains any data
		exists: function exists(a, b, aRow, bRow, column, dir, params) {
			var el1 = typeof a == "undefined" ? 0 : 1;
			var el2 = typeof b == "undefined" ? 0 : 1;

			return el1 - el2;
		},

		//sort alpha numeric strings
		alphanum: function alphanum(as, bs, aRow, bRow, column, dir, params) {
			var a,
			    b,
			    a1,
			    b1,
			    i = 0,
			    L,
			    rx = /(\d+)|(\D+)/g,
			    rd = /\d/;
			var alignEmptyValues = params.alignEmptyValues;
			var emptyAlign = 0;

			//handle empty values
			if (!as && as !== 0) {
				emptyAlign = !bs && bs !== 0 ? 0 : -1;
			} else if (!bs && bs !== 0) {
				emptyAlign = 1;
			} else {

				if (isFinite(as) && isFinite(bs)) return as - bs;
				a = String(as).toLowerCase();
				b = String(bs).toLowerCase();
				if (a === b) return 0;
				if (!(rd.test(a) && rd.test(b))) return a > b ? 1 : -1;
				a = a.match(rx);
				b = b.match(rx);
				L = a.length > b.length ? b.length : a.length;
				while (i < L) {
					a1 = a[i];
					b1 = b[i++];
					if (a1 !== b1) {
						if (isFinite(a1) && isFinite(b1)) {
							if (a1.charAt(0) === "0") a1 = "." + a1;
							if (b1.charAt(0) === "0") b1 = "." + b1;
							return a1 - b1;
						} else return a1 > b1 ? 1 : -1;
					}
				}

				return a.length > b.length;
			}

			//fix empty values in position
			if (alignEmptyValues === "top" && dir === "desc" || alignEmptyValues === "bottom" && dir === "asc") {
				emptyAlign *= -1;
			}

			return emptyAlign;
		}
	};

	Tabulator.prototype.registerModule("sort", Sort);

	var Validate = function Validate(table) {
		this.table = table;
		this.invalidCells = [];
	};

	//validate
	Validate.prototype.initializeColumn = function (column) {
		var self = this,
		    config = [],
		    validator;

		if (column.definition.validator) {

			if (Array.isArray(column.definition.validator)) {
				column.definition.validator.forEach(function (item) {
					validator = self._extractValidator(item);

					if (validator) {
						config.push(validator);
					}
				});
			} else {
				validator = this._extractValidator(column.definition.validator);

				if (validator) {
					config.push(validator);
				}
			}

			column.modules.validate = config.length ? config : false;
		}
	};

	Validate.prototype._extractValidator = function (value) {
		var type, params, pos;

		switch (typeof value === 'undefined' ? 'undefined' : _typeof(value)) {
			case "string":
				pos = value.indexOf(':');

				if (pos > -1) {
					type = value.substring(0, pos);
					params = value.substring(pos + 1);
				} else {
					type = value;
				}

				return this._buildValidator(type, params);
				break;

			case "function":
				return this._buildValidator(value);
				break;

			case "object":
				return this._buildValidator(value.type, value.parameters);
				break;
		}
	};

	Validate.prototype._buildValidator = function (type, params) {

		var func = typeof type == "function" ? type : this.validators[type];

		if (!func) {
			console.warn("Validator Setup Error - No matching validator found:", type);
			return false;
		} else {
			return {
				type: typeof type == "function" ? "function" : type,
				func: func,
				params: params
			};
		}
	};

	Validate.prototype.validate = function (validators, cell, value) {
		var self = this,
		    valid = [],
		    invalidIndex = this.invalidCells.indexOf(cell);

		if (validators) {
			validators.forEach(function (item) {
				if (!item.func.call(self, cell.getComponent(), value, item.params)) {
					valid.push({
						type: item.type,
						parameters: item.params
					});
				}
			});
		}

		valid = valid.length ? valid : true;

		if (!cell.modules.validate) {
			cell.modules.validate = {};
		}

		if (valid === true) {
			cell.modules.validate.invalid = false;
			cell.getElement().classList.remove("tabulator-validation-fail");

			if (invalidIndex > -1) {
				this.invalidCells.splice(invalidIndex, 1);
			}
		} else {
			cell.modules.validate.invalid = true;

			if (this.table.options.validationMode !== "manual") {
				cell.getElement().classList.add("tabulator-validation-fail");
			}

			if (invalidIndex == -1) {
				this.invalidCells.push(cell);
			}
		}

		return valid;
	};

	Validate.prototype.getInvalidCells = function () {
		var output = [];

		this.invalidCells.forEach(function (cell) {
			output.push(cell.getComponent());
		});

		return output;
	};

	Validate.prototype.clearValidation = function (cell) {
		var invalidIndex;

		if (cell.modules.validate && cell.modules.validate.invalid) {

			cell.getElement().classList.remove("tabulator-validation-fail");
			cell.modules.validate.invalid = false;

			invalidIndex = this.invalidCells.indexOf(cell);

			if (invalidIndex > -1) {
				this.invalidCells.splice(invalidIndex, 1);
			}
		}
	};

	Validate.prototype.validators = {

		//is integer
		integer: function integer(cell, value, parameters) {
			if (value === "" || value === null || typeof value === "undefined") {
				return true;
			}
			value = Number(value);
			return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
		},

		//is float
		float: function float(cell, value, parameters) {
			if (value === "" || value === null || typeof value === "undefined") {
				return true;
			}
			value = Number(value);
			return typeof value === 'number' && isFinite(value) && value % 1 !== 0;
		},

		//must be a number
		numeric: function numeric(cell, value, parameters) {
			if (value === "" || value === null || typeof value === "undefined") {
				return true;
			}
			return !isNaN(value);
		},

		//must be a string
		string: function string(cell, value, parameters) {
			if (value === "" || value === null || typeof value === "undefined") {
				return true;
			}
			return isNaN(value);
		},

		//maximum value
		max: function max(cell, value, parameters) {
			if (value === "" || value === null || typeof value === "undefined") {
				return true;
			}
			return parseFloat(value) <= parameters;
		},

		//minimum value
		min: function min(cell, value, parameters) {
			if (value === "" || value === null || typeof value === "undefined") {
				return true;
			}
			return parseFloat(value) >= parameters;
		},

		//starts with  value
		starts: function starts(cell, value, parameters) {
			if (value === "" || value === null || typeof value === "undefined") {
				return true;
			}
			return String(value).toLowerCase().startsWith(String(parameters).toLowerCase());
		},

		//ends with  value
		ends: function ends(cell, value, parameters) {
			if (value === "" || value === null || typeof value === "undefined") {
				return true;
			}
			return String(value).toLowerCase().endsWith(String(parameters).toLowerCase());
		},

		//minimum string length
		minLength: function minLength(cell, value, parameters) {
			if (value === "" || value === null || typeof value === "undefined") {
				return true;
			}
			return String(value).length >= parameters;
		},

		//maximum string length
		maxLength: function maxLength(cell, value, parameters) {
			if (value === "" || value === null || typeof value === "undefined") {
				return true;
			}
			return String(value).length <= parameters;
		},

		//in provided value list
		in: function _in(cell, value, parameters) {
			if (value === "" || value === null || typeof value === "undefined") {
				return true;
			}
			if (typeof parameters == "string") {
				parameters = parameters.split("|");
			}

			return value === "" || parameters.indexOf(value) > -1;
		},

		//must match provided regex
		regex: function regex(cell, value, parameters) {
			if (value === "" || value === null || typeof value === "undefined") {
				return true;
			}
			var reg = new RegExp(parameters);

			return reg.test(value);
		},

		//value must be unique in this column
		unique: function unique(cell, value, parameters) {
			if (value === "" || value === null || typeof value === "undefined") {
				return true;
			}
			var unique = true;

			var cellData = cell.getData();
			var column = cell.getColumn()._getSelf();

			this.table.rowManager.rows.forEach(function (row) {
				var data = row.getData();

				if (data !== cellData) {
					if (value == column.getFieldValue(data)) {
						unique = false;
					}
				}
			});

			return unique;
		},

		//must have a value
		required: function required(cell, value, parameters) {
			return value !== "" && value !== null && typeof value !== "undefined";
		}
	};

	Tabulator.prototype.registerModule("validate", Validate);

	return Tabulator;
});