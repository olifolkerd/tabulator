var Menu = function(table){
	this.table = table; //hold Tabulator object
	this.menuEl = false;
	this.blurEvent = this.hideMenu.bind(this);
};

Menu.prototype.initializeColumnHeader = function(column){
	var headerMenuEl;

	if(column.definition.headerContextMenu){
		column.getElement().addEventListener("contextmenu", (e) => {
			var menu = typeof column.definition.headerContextMenu == "function" ? column.definition.headerContextMenu() : column.definition.headerContextMenu;

			e.preventDefault();

			this.loadMenu(e, column, menu);
		});
	}

	if(column.definition.headerMenu){

		headerMenuEl = document.createElement("span");
		headerMenuEl.classList.add("tabulator-header-menu-button");
		headerMenuEl.innerHTML = "&vellip;";

		headerMenuEl.addEventListener("click", (e) => {
			var menu = typeof column.definition.headerMenu == "function" ? column.definition.headerMenu() : column.definition.headerMenu;
			e.stopPropagation();
			e.preventDefault();

			this.loadMenu(e, column, menu);
		});

		column.titleElement.insertBefore(headerMenuEl, column.titleElement.firstChild);
	}
};

Menu.prototype.initializeCell = function(cell){
	cell.getElement().addEventListener("contextmenu", (e) => {
		var menu = typeof cell.column.definition.contextMenu == "function" ? cell.column.definition.contextMenu() : cell.column.definition.contextMenu;

		e.preventDefault();

		this.loadMenu(e, cell, menu);
	});
};

Menu.prototype.initializeRow = function(row){
	row.getElement().addEventListener("contextmenu", (e) => {
		var menu = typeof this.table.options.rowContextMenu == "function" ? this.table.options.rowContextMenu() : this.table.options.rowContextMenu;

		e.preventDefault();

		this.loadMenu(e, row, menu);
	});
};


Menu.prototype.loadMenu = function(e, component, menu){

	//abort if no menu set
	if(!menu || !menu.length){
		return;
	}

	this.hideMenu();

	this.menuEl = document.createElement("div");
	this.menuEl.classList.add("tabulator-menu");

	menu.forEach((item) => {
		var itemEl = document.createElement("div");
		var label = item.label
		var disabled = item.disabled;

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
				itemEl.addEventListener("click", (e) => {
					this.hideMenu();
					item.action(e, component.getComponent());
				});
			}
		}

		this.menuEl.appendChild(itemEl);
	});

	this.menuEl.style.top = e.pageY + "px";
	this.menuEl.style.left = e.pageX + "px";

	document.body.addEventListener("click", this.blurEvent);
	this.table.rowManager.element.addEventListener("scroll", this.blurEvent);

	setTimeout(() => {
		document.body.addEventListener("contextmenu", this.blurEvent);
	}, 100);

	document.body.appendChild(this.menuEl);

	//move menu to start on right edge if it is too close to the edge of the screen
	if((e.pageX + this.menuEl.offsetWidth) >= document.body.offsetWidth){
		this.menuEl.style.left = "";
		this.menuEl.style.right = (document.body.offsetWidth - e.pageX) + "px";
	}
};

Menu.prototype.hideMenu = function(){
	if(this.menuEl.parentNode){
		this.menuEl.parentNode.removeChild(this.menuEl);
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