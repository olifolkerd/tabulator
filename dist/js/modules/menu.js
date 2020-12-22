/* Tabulator v4.9.3 (c) Oliver Folkerd */

var Menu = function Menu(table) {
	this.table = table; //hold Tabulator object
	this.menuElements = [];
	this.blurEvent = this.hideMenu.bind(this);
	this.escEvent = this.escMenu.bind(this);
	this.nestedMenuBlock = false;
	this.positionReversedX = false;
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
			e.stopPropagation();
			e.preventDefault();

			_this.LoadMenuEvent(column, column.definition.headerMenu, e);
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
	var _this3 = this;

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
				_this3.nestedMenuBlock = false;
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
				label = label.call(_this3.table, component.getComponent());
			}

			if (label instanceof Node) {
				itemEl.appendChild(label);
			} else {
				itemEl.innerHTML = label;
			}

			if (typeof disabled == "function") {
				disabled = disabled.call(_this3.table, component.getComponent());
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
						_this3.hideOldSubMenus(menuEl);
						_this3.loadMenu(e, component, item.menu, itemEl);
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
		_this3.hideMenu();
	});

	this.menuElements.push(menuEl);
	this.positionMenu(menuEl, parentEl, touch, e);
};

Menu.prototype.hideOldSubMenus = function (menuEl) {
	var index = this.menuElements.indexOf(menuEl);

	if (index > -1) {
		for (var i = this.menuElements.length - 1; i > index; i--) {
			var el = this.menuElements[i];

			if (el.parentNode) {
				el.parentNode.removeChild(el);
			}

			this.menuElements.pop();
		}
	}
};

Menu.prototype.positionMenu = function (element, parentEl, touch, e) {
	var _this4 = this;

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
		_this4.table.rowManager.element.addEventListener("scroll", _this4.blurEvent);
		document.body.addEventListener("click", _this4.blurEvent);
		document.body.addEventListener("contextmenu", _this4.blurEvent);
		window.addEventListener("resize", _this4.blurEvent);
		document.body.addEventListener("keydown", _this4.escEvent);
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