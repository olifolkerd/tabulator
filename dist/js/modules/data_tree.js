/* Tabulator v4.1.0 (c) Oliver Folkerd */

var DataTree = function DataTree(table) {
	this.table = table;
	this.indent = 10;
	this.field = "";
	this.collapseEl = null;
	this.expandEl = null;
	this.branchEl = null;
};

DataTree.prototype.initialize = function () {
	var dummyEl = null,
	    options = this.table.options;

	this.field = options.dataTreeChildField;
	this.indent = options.dataTreeChildIndent;

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
		this.expandEl.innerHTML = "<div class='tabulator-data-tree-control-expand'></div>";
	}
};

DataTree.prototype.initializeRow = function (row) {
	row.modules.dataTable = {
		index: 0,
		open: false,
		controlEl: false,
		branchEl: false,
		children: typeof row.getData()[this.field] !== "undefined"
	};
};

DataTree.prototype.layoutRow = function (row) {
	var cell = row.getCells()[0],
	    el = cell.getElement();

	el.style.paddingLeft = parseInt(window.getComputedStyle(el, null).getPropertyValue('padding-left')) + row.modules.dataTable.index * this.indent + "px";

	if (row.modules.dataTable.branchEl) {
		row.modules.dataTable.branchEl.parentNode.removeChild(row.modules.dataTable.branchEl);
	}

	this.generateControlElement(row, el);

	if (row.modules.dataTable.index && this.branchEl) {
		row.modules.dataTable.branchEl = this.branchEl.cloneNode(true);
		el.insertBefore(row.modules.dataTable.branchEl, el.firstChild);
		el.style.paddingLeft = parseInt(el.style.paddingLeft) + (row.modules.dataTable.branchEl.offsetWidth + row.modules.dataTable.branchEl.style.marginRight) * (row.modules.dataTable.index - 1) + "px";
	}
};

DataTree.prototype.generateControlElement = function (row, el) {
	var _this = this;

	var config = row.modules.dataTable,
	    el = el || row.getCells()[0].getElement(),
	    oldControl = config.controlEl;

	if (config.children !== false) {

		if (config.open) {
			config.controlEl = this.collapseEl.cloneNode(true);
			config.controlEl.addEventListener("click", function () {
				_this.collapseRow(row);
			});
		} else {
			config.controlEl = this.expandEl.cloneNode(true);
			config.controlEl.addEventListener("click", function () {
				_this.expandRow(row);
			});
		}

		if (oldControl) {
			oldControl.parentNode.replaceChild(config.controlEl, oldControl);
		} else {
			el.insertBefore(config.controlEl, el.firstChild);
		}
	}
};

DataTree.prototype.expandRow = function (row) {
	var _this2 = this;

	var config = row.modules.dataTable,
	    promise;

	if (!Array.isArray(config.children)) {
		config.children = [];

		row.getData()[this.field].forEach(function (childData) {
			var childRow = new Row(childData || {}, _this2.table.rowManager);
			childRow.modules.dataTable.index = row.modules.dataTable.index + 1;
			config.children.push(childRow);
		});
	}

	promise = this.table.rowManager.addRows(config.children, false, row);

	promise.then(function (rows) {
		config.children = rows;
	});

	config.open = true;
	this.generateControlElement(row);
};

DataTree.prototype.collapseRow = function (row) {
	var config = row.modules.dataTable;

	if (Array.isArray(config.children)) {
		config.children.forEach(function (childRow) {
			childRow.delete();
		});

		config.open = false;
		this.generateControlElement(row);
	}
};

Tabulator.prototype.registerModule("dataTree", DataTree);