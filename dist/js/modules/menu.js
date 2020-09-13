/* Tabulator v4.8.1 (c) Oliver Folkerd */

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
			var menu = typeof column.definition.headerMenu == "function" ? column.definition.headerMenu(column.getComponent(), e) : column.definition.headerMenu;
			e.stopPropagation();
			e.preventDefault();

			_this.loadMenu(e, column, menu);
		});

		column.titleElement.insertBefore(headerMenuEl, column.titleElement.firstChild);
	}
};

Menu.prototype.LoadMenuEvent = function (component, menu, e) {
	menu = typeof menu == "function" ? menu(component.getComponent(), e) : menu;

	// if(component instanceof Cell){
	// 	e.stopImmediatePropagation();
	// }

	this.loadMenu(e, component, menu);
};

Menu.prototype.tapHold = function (component, menu) {
	var _this2 = this;

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

			_this2.LoadMenuEvent(component, menu, e);
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
		cell.getElement().addEventListener("contextmenu", this.LoadMenuEvent.bind(this, cell, cell.column.definition.contextMenu));
		this.tapHold(cell, cell.column.definition.contextMenu);
	}

	if (cell.column.definition.clickMenu) {
		cell.getElement().addEventListener("click", this.LoadMenuEvent.bind(this, cell, cell.column.definition.clickMenu));
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

Menu.prototype.loadMenu = function (e, component, menu) {
	var _this3 = this;

	var docHeight = Math.max(document.body.offsetHeight, window.innerHeight),
	    touch = !(e instanceof MouseEvent);

	if (!touch) {
		e.preventDefault();
	}

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
			_this3.nestedMenuBlock = false;
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
					_this3.hideMenu();
					item.action(e, component.getComponent());
				});
			}
		}

		_this3.menuEl.appendChild(itemEl);
	});

	this.menuEl.style.top = (touch ? e.touches[0].pageY : e.pageY) + "px";
	this.menuEl.style.left = (touch ? e.touches[0].pageX : e.pageX) + "px";

	setTimeout(function () {
		_this3.table.rowManager.element.addEventListener("scroll", _this3.blurEvent);
		document.body.addEventListener("click", _this3.blurEvent);
		document.body.addEventListener("contextmenu", _this3.blurEvent);
		document.body.addEventListener("keydown", _this3.escEvent);
	}, 100);

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