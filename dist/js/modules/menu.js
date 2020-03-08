/* Tabulator v4.5.3 (c) Oliver Folkerd */

var Menu = function Menu(table) {
	this.table = table; //hold Tabulator object
	this.menuEl = false;
	this.blurEvent = this.hideMenu.bind(this);
};

Menu.prototype.initializeColumnHeader = function (column) {
	var _this = this;

	column.getElement().addEventListener("contextmenu", function (e) {
		var menu = typeof column.definition.headerContextMenu == "function" ? column.definition.headerContextMenu() : column.definition.headerContextMenu;

		e.preventDefault();

		_this.loadMenu(e, column, menu);
	});
};

Menu.prototype.initializeColumnCell = function (cell) {
	var _this2 = this;

	cell.getElement().addEventListener("contextmenu", function (e) {
		var menu = typeof cell.column.definition.contextMenu == "function" ? cell.column.definition.contextMenu() : cell.column.definition.contextMenu;

		e.preventDefault();

		_this2.loadMenu(e, cell, menu);
	});
};

Menu.prototype.loadMenu = function (e, component, menu) {
	var _this3 = this;

	//abort if no menu set
	if (!menu || !menu.length) {
		return;
	}

	this.hideMenu();

	this.menuEl = document.createElement("div");
	this.menuEl.classList.add("tabulator-menu");

	menu.forEach(function (item) {
		var itemEl = document.createElement("div");

		if (item.separator) {
			itemEl.classList.add("tabulator-menu-separator");
		} else {
			itemEl.classList.add("tabulator-menu-item");

			if (item.label instanceof Node) {
				itemEl.appendChild(item.label);
			} else {
				itemEl.innerHTML = item.label;
			}

			if (item.disabled) {
				itemEl.classList.add("tabulator-menu-item-disabled");
			} else {
				itemEl.addEventListener("click", function () {
					_this3.hideMenu();
					item.action(component.getComponent());
				});
			}
		}

		_this3.menuEl.appendChild(itemEl);
	});

	this.menuEl.style.top = e.pageY + "px";
	this.menuEl.style.left = e.pageX + "px";

	document.body.addEventListener("click", this.blurEvent);
	this.table.rowManager.element.addEventListener("scroll", this.blurEvent);

	setTimeout(function () {
		document.body.addEventListener("contextmenu", _this3.blurEvent);
	}, 100);

	document.body.appendChild(this.menuEl);
};

Menu.prototype.hideMenu = function () {
	if (this.menuEl.parentNode) {
		this.menuEl.parentNode.removeChild(this.menuEl);
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