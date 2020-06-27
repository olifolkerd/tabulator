/* Tabulator v4.7.1 (c) Oliver Folkerd */

var Menu = function Menu(table) {
	this.table = table; //hold Tabulator object
	this.menuEl = false;
	this.blurEvent = this.hideMenu.bind(this);
	this.escEvent = this.escMenu.bind(this);
	this.nestedMenuBlock = false;
};

Menu.prototype.initializeColumnHeader = function (column) {
	var _this = this;

	var headerMenuEl;

	if (column.definition.headerContextMenu) {
		column.getElement().addEventListener("contextmenu", function (e) {
			var menu = typeof column.definition.headerContextMenu == "function" ? column.definition.headerContextMenu(column.getComponent()) : column.definition.headerContextMenu;

			e.preventDefault();

			_this.loadMenu(e, column, menu);
		});
	}

	if (column.definition.headerMenu) {

		headerMenuEl = document.createElement("span");
		headerMenuEl.classList.add("tabulator-header-menu-button");
		headerMenuEl.innerHTML = "&vellip;";

		headerMenuEl.addEventListener("click", function (e) {
			var menu = typeof column.definition.headerMenu == "function" ? column.definition.headerMenu(column.getComponent()) : column.definition.headerMenu;
			e.stopPropagation();
			e.preventDefault();

			_this.loadMenu(e, column, menu);
		});

		column.titleElement.insertBefore(headerMenuEl, column.titleElement.firstChild);
	}
};

Menu.prototype.initializeCell = function (cell) {
	var _this2 = this;

	cell.getElement().addEventListener("contextmenu", function (e) {
		var menu = typeof cell.column.definition.contextMenu == "function" ? cell.column.definition.contextMenu(cell.getComponent()) : cell.column.definition.contextMenu;

		if (menu) {
			e.stopImmediatePropagation();
		}

		_this2.loadMenu(e, cell, menu);
	});
};

Menu.prototype.initializeRow = function (row) {
	var _this3 = this;

	row.getElement().addEventListener("contextmenu", function (e) {
		var menu = typeof _this3.table.options.rowContextMenu == "function" ? _this3.table.options.rowContextMenu(row.getComponent()) : _this3.table.options.rowContextMenu;

		_this3.loadMenu(e, row, menu);
	});
};

Menu.prototype.initializeGroup = function (group) {
	var _this4 = this;

	group.getElement().addEventListener("contextmenu", function (e) {
		var menu = typeof _this4.table.options.groupContextMenu == "function" ? _this4.table.options.groupContextMenu(group.getComponent()) : _this4.table.options.groupContextMenu;

		_this4.loadMenu(e, group, menu);
	});
};

Menu.prototype.loadMenu = function (e, component, menu) {
	var _this5 = this;

	var docHeight = Math.max(document.body.offsetHeight, window.innerHeight);

	e.preventDefault();

	//abort if no menu set
	if (!menu || !menu.length) {
		return;
	}

	if (this.nestedMenuBlock) {
		//abort if child menu already open
		if (this.isOpen()) {
			return;
		}
	} else {
		this.nestedMenuBlock = setTimeout(function () {
			_this5.nestedMenuBlock = false;
		}, 100);
	}

	this.hideMenu();

	this.menuEl = document.createElement("div");
	this.menuEl.classList.add("tabulator-menu");

	menu.forEach(function (item) {
		var itemEl = document.createElement("div");
		var label = item.label;
		var disabled = item.disabled;

		if (item.separator) {
			itemEl.classList.add("tabulator-menu-separator");
		} else {
			itemEl.classList.add("tabulator-menu-item");

			if (typeof label == "function") {
				label = label(component.getComponent());
			}

			if (label instanceof Node) {
				itemEl.appendChild(label);
			} else {
				itemEl.innerHTML = label;
			}

			if (typeof disabled == "function") {
				disabled = disabled(component.getComponent());
			}

			if (disabled) {
				itemEl.classList.add("tabulator-menu-item-disabled");
				itemEl.addEventListener("click", function (e) {
					e.stopPropagation();
				});
			} else {
				itemEl.addEventListener("click", function (e) {
					_this5.hideMenu();
					item.action(e, component.getComponent());
				});
			}
		}

		_this5.menuEl.appendChild(itemEl);
	});

	this.menuEl.style.top = e.pageY + "px";
	this.menuEl.style.left = e.pageX + "px";

	document.body.addEventListener("click", this.blurEvent);
	this.table.rowManager.element.addEventListener("scroll", this.blurEvent);

	setTimeout(function () {
		document.body.addEventListener("contextmenu", _this5.blurEvent);
	}, 100);

	document.body.addEventListener("keydown", this.escEvent);

	document.body.appendChild(this.menuEl);

	//move menu to start on right edge if it is too close to the edge of the screen
	if (e.pageX + this.menuEl.offsetWidth >= document.body.offsetWidth) {
		this.menuEl.style.left = "";
		this.menuEl.style.right = document.body.offsetWidth - e.pageX + "px";
	}

	//move menu to start on bottom edge if it is too close to the edge of the screen
	if (e.pageY + this.menuEl.offsetHeight >= docHeight) {
		this.menuEl.style.top = "";
		this.menuEl.style.bottom = docHeight - e.pageY + "px";
	}
};

Menu.prototype.isOpen = function () {
	return !!this.menuEl.parentNode;
};

Menu.prototype.escMenu = function (e) {
	if (e.keyCode == 27) {
		this.hideMenu();
	}
};

Menu.prototype.hideMenu = function () {
	if (this.menuEl.parentNode) {
		this.menuEl.parentNode.removeChild(this.menuEl);
	}

	if (this.escEvent) {
		document.body.removeEventListener("keydown", this.escEvent);
	}

	if (this.blurEvent) {
		document.body.removeEventListener("click", this.blurEvent);
		document.body.removeEventListener("contextmenu", this.blurEvent);
		this.table.rowManager.element.removeEventListener("scroll", this.blurEvent);
	}
};

//default accessors
Menu.prototype.menus = {};

Tabulator.prototype.registerModule("menu", Menu);