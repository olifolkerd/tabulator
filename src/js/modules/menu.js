var Menu = function(table){
	this.table = table; //hold Tabulator object
	this.menuElements = [];
	this.blurEvent = this.hideMenu.bind(this);
	this.escEvent = this.escMenu.bind(this);
	this.nestedMenuBlock = false;
	this.positionReversedX = false;
};

Menu.prototype.initializeColumnHeader = function(column){
	var headerMenuEl;

	if(column.definition.headerContextMenu){
		column.getElement().addEventListener("contextmenu", this.LoadMenuEvent.bind(this, column, column.definition.headerContextMenu));
		this.tapHold(column, column.definition.headerContextMenu);
	}

	// if(column.definition.headerClickMenu){
	// 	column.getElement().addEventListener("click", this.LoadMenuEvent.bind(this, column, column.definition.headerClickMenu));
	// }

	if(column.definition.headerMenu){

		headerMenuEl = document.createElement("span");
		headerMenuEl.classList.add("tabulator-header-menu-button");
		headerMenuEl.innerHTML = "&vellip;";

		headerMenuEl.addEventListener("click", (e) => {
			var menu = typeof column.definition.headerMenu == "function" ? column.definition.headerMenu(column.getComponent(), e) : column.definition.headerMenu;
			e.stopPropagation();
			e.preventDefault();

			this.loadMenu(e, column, menu);
		});

		column.titleElement.insertBefore(headerMenuEl, column.titleElement.firstChild);
	}
};

Menu.prototype.LoadMenuEvent = function(component, menu, e){
	menu = typeof menu == "function" ? menu(component.getComponent(), e) : menu;

	// if(component instanceof Cell){
	// 	e.stopImmediatePropagation();
	// }

	this.loadMenu(e, component, menu);
};

Menu.prototype.tapHold = function(component, menu){
	var element = component.getElement(),
	tapHold = null,
	loaded = false;

	element.addEventListener("touchstart", (e) => {
		clearTimeout(tapHold);
		loaded = false;

		tapHold = setTimeout(() => {
			clearTimeout(tapHold);
			tapHold = null;
			loaded = true;

			this.LoadMenuEvent(component, menu, e);
		}, 1000);

	}, {passive: true});

	element.addEventListener("touchend", (e) => {
		clearTimeout(tapHold);
		tapHold = null;

		if(loaded){
			e.preventDefault();
		}
	});
};


Menu.prototype.initializeCell = function(cell){
	if(cell.column.definition.contextMenu){
		cell.getElement().addEventListener("contextmenu", this.LoadMenuEvent.bind(this, cell, cell.column.definition.contextMenu));
		this.tapHold(cell, cell.column.definition.contextMenu);
	}

	if(cell.column.definition.clickMenu){
		cell.getElement().addEventListener("click", this.LoadMenuEvent.bind(this, cell, cell.column.definition.clickMenu));
	}
};

Menu.prototype.initializeRow = function(row){
	if(this.table.options.rowContextMenu){
		row.getElement().addEventListener("contextmenu", this.LoadMenuEvent.bind(this, row, this.table.options.rowContextMenu));
		this.tapHold(row, this.table.options.rowContextMenu);
	}

	if(this.table.options.rowClickMenu){
		row.getElement().addEventListener("click", this.LoadMenuEvent.bind(this, row, this.table.options.rowClickMenu));
	}
};

Menu.prototype.initializeGroup = function (group){
	if(this.table.options.groupContextMenu){
		group.getElement().addEventListener("contextmenu", this.LoadMenuEvent.bind(this, group, this.table.options.groupContextMenu));
		this.tapHold(group, this.table.options.groupContextMenu);
	}

	if(this.table.options.groupClickMenu){
		group.getElement().addEventListener("click", this.LoadMenuEvent.bind(this, group, this.table.options.groupClickMenu));
	}
};

Menu.prototype.loadMenu = function(e, component, menu, parentEl){

	var touch = !(e instanceof MouseEvent);

	var menuEl = document.createElement("div");
	menuEl.classList.add("tabulator-menu");

	if(!touch){
		e.preventDefault();
	}

	//abort if no menu set
	if(!menu || !menu.length){
		return;
	}

	if(!parentEl){
		if(this.nestedMenuBlock){
			//abort if child menu already open
			if(this.isOpen()){
				return;
			}
		}else{
			this.nestedMenuBlock = setTimeout(() => {
				this.nestedMenuBlock = false;
			}, 100)
		}

		this.hideMenu();
		this.menuElements = [];
	}

	menu.forEach((item) => {
		var itemEl = document.createElement("div"),
		label = item.label,
		disabled = item.disabled;

		if(item.separator){
			itemEl.classList.add("tabulator-menu-separator");
		}else{
			itemEl.classList.add("tabulator-menu-item");

			if(typeof label == "function"){
				label = label(component.getComponent());
			}

			if(label instanceof Node){
				itemEl.appendChild(label);
			}else{
				itemEl.innerHTML = label;
			}

			if(typeof disabled == "function"){
				disabled = disabled(component.getComponent());
			}

			if(disabled){
				itemEl.classList.add("tabulator-menu-item-disabled");
				itemEl.addEventListener("click", (e) => {
					e.stopPropagation();
				});
			}else{
				if(item.menu && item.menu.length){
					itemEl.addEventListener("click", (e) => {
						e.stopPropagation();
						this.loadMenu(e, component, item.menu, itemEl);
					});
				}else{
					if(item.action){
						itemEl.addEventListener("click", (e) => {
							this.hideMenu();
							item.action(e, component.getComponent());
						});
					}
				}
			}

			if(item.menu && item.menu.length){
				itemEl.classList.add("tabulator-menu-item-submenu");
			}
		}

		menuEl.appendChild(itemEl);
	});

	this.menuElements.push(menuEl);
	this.positionMenu(menuEl, parentEl, touch, e);
};

Menu.prototype.positionMenu = function(element, parentEl, touch, e){
	var docHeight = Math.max(document.body.offsetHeight, window.innerHeight),
	x, y;

	if(!parentEl){
		x = touch ? e.touches[0].pageX : e.pageX;
		y = touch ? e.touches[0].pageY : e.pageY;

		this.positionReversedX = false;
	}else{
		x = Tabulator.prototype.helpers.elOffset(parentEl).left + parentEl.offsetWidth;
		y = Tabulator.prototype.helpers.elOffset(parentEl).top - 1;
	}

	element.style.top = y + "px";
	element.style.left = x + "px";

	setTimeout(() => {
		this.table.rowManager.element.addEventListener("scroll", this.blurEvent);
		document.body.addEventListener("click", this.blurEvent);
		document.body.addEventListener("contextmenu", this.blurEvent);
		document.body.addEventListener("keydown", this.escEvent);
	}, 100);

	document.body.appendChild(element);

	//move menu to start on right edge if it is too close to the edge of the screen
	if((x + element.offsetWidth) >= window.innerWidth || this.positionReversedX){
		element.style.left = "";

		if(parentEl){
			element.style.right = (window.innerWidth - Tabulator.prototype.helpers.elOffset(parentEl).left) + "px";
		}else{
			element.style.right = (window.innerWidth - x) + "px";
		}

		this.positionReversedX = true;
	}

	//move menu to start on bottom edge if it is too close to the edge of the screen
	if((y + element.offsetHeight) >= docHeight){
		element.style.top = "";

		if(parentEl){
			element.style.bottom = (docHeight - Tabulator.prototype.helpers.elOffset(parentEl).top - parentEl.offsetHeight - 1) + "px";
		}else{
			element.style.bottom = (docHeight - y) + "px";
		}
	}
};

Menu.prototype.isOpen = function(){
	return !!this.menuElements.length;
};

Menu.prototype.escMenu = function(e){
	if(e.keyCode == 27){
		this.hideMenu();
	}
};

Menu.prototype.hideMenu = function(){

	console.trace("hide")

	this.menuElements.forEach((menuEl) => {
		if(menuEl.parentNode){
			menuEl.parentNode.removeChild(menuEl);
		}
	});

	if(this.escEvent){
		document.body.removeEventListener("keydown", this.escEvent);
	}

	if(this.blurEvent){
		document.body.removeEventListener("click", this.blurEvent);
		document.body.removeEventListener("contextmenu", this.blurEvent);
		this.table.rowManager.element.removeEventListener("scroll", this.blurEvent);
	}
};

//default accessors
Menu.prototype.menus = {};

Tabulator.prototype.registerModule("menu", Menu);