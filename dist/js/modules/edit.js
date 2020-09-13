var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* Tabulator v4.8.1 (c) Oliver Folkerd */

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
	    element = cell.getElement();

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

	if (cell.modules.validate && cell.modules.edit && cell.modules.edit.edited) {
		cell.modules.validate.invalid = false;

		editIndex = this.editedCells.indexOf(cell);

		if (editIndex > -1) {
			this.editedCells.splice(editIndex, 1);
		}
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
		var _this = this;

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
		    blockListShow = false;

		if (Array.isArray(editorParams) || !Array.isArray(editorParams) && (typeof editorParams === "undefined" ? "undefined" : _typeof(editorParams)) === "object" && !editorParams.values) {
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
				console.warn("unable to find matching column to create select lookup list:", field);
			}

			return output;
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

					if ((typeof value === "undefined" ? "undefined" : _typeof(value)) === "object") {

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

			initialDisplayValue = input.value;
		}

		function chooseItems(silent) {
			if (!silent) {
				hideList();
			}

			var output = [];

			currentItems.forEach(function (item) {
				output.push(item.value);
			});

			initialDisplayValue = input.value;

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

			for (var i = 0; i < len; i++) {
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
			_this.table.rowManager.element.addEventListener("scroll", cancelItem);
		}, 10);

		return input;
	},

	//autocomplete
	autocomplete: function autocomplete(cell, onRendered, success, cancel, editorParams) {
		var _this2 = this;

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

					if ((typeof value === "undefined" ? "undefined" : _typeof(value)) === "object") {
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
			_this2.table.rowManager.element.addEventListener("scroll", cancelItem);
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
			var calcVal = percent * Math.round(bar.offsetWidth / (element.clientWidth / 100)) + min;
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