var Menu = function(table){
	this.table = table; //hold Tabulator object
	this.menuEl = false;
	this.blurEvent = this.hideMenu.bind(this);
	this.escEvent = this.escMenu.bind(this);
	this.nestedMenuBlock = false;
};

Menu.prototype.initializeColumnHeader = function(column){
	var headerMenuEl;

	if(column.definition.headerContextMenu){
		column.getElement().addEventListener("contextmenu", (e) => {
			var menu = typeof column.definition.headerContextMenu == "function" ? column.definition.headerContextMenu(column.getComponent()) : column.definition.headerContextMenu;

			e.preventDefault();

			this.loadMenu(e, column, menu);
		});
	}

	if(column.definition.headerMenu){

		headerMenuEl = document.createElement("span");
		headerMenuEl.classList.add("tabulator-header-menu-button");
		headerMenuEl.innerHTML = "&vellip;";

		headerMenuEl.addEventListener("click", (e) => {
			var menu = typeof column.definition.headerMenu == "function" ? column.definition.headerMenu(column.getComponent()) : column.definition.headerMenu;
			e.stopPropagation();
			e.preventDefault();

			this.loadMenu(e, column, menu);
		});

		column.titleElement.insertBefore(headerMenuEl, column.titleElement.firstChild);
	}
};

Menu.prototype.initializeCell = function(cell){
	cell.getElement().addEventListener("contextmenu", (e) => {
		var menu = typeof cell.column.definition.contextMenu == "function" ? cell.column.definition.contextMenu(cell.getComponent()) : cell.column.definition.contextMenu;

		if(menu){
			e.stopImmediatePropagation();
		}

		this.loadMenu(e, cell, menu);
	});
};

Menu.prototype.initializeRow = function(row){
	row.getElement().addEventListener("contextmenu", (e) => {
		var menu = typeof this.table.options.rowContextMenu == "function" ? this.table.options.rowContextMenu(row.getComponent()) : this.table.options.rowContextMenu;

		this.loadMenu(e, row, menu);
	});
};

Menu.prototype.initializeGroup = function (group){
	group.getElement().addEventListener("contextmenu", (e) => {
		var menu = typeof this.table.options.groupContextMenu == "function" ? this.table.options.groupContextMenu(group.getComponent()) : this.table.options.groupContextMenu;

		this.loadMenu(e, group, menu);
	});
};


Menu.prototype.loadMenu = function(e, component, menu){

	var docHeight = Math.max(document.body.offsetHeight, window.innerHeight);

	e.preventDefault();

	//abort if no menu set
	if(!menu || !menu.length){
		return;
	}

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

	document.body.addEventListener("keydown", this.escEvent);

	document.body.appendChild(this.menuEl);

	//move menu to start on right edge if it is too close to the edge of the screen
	if((e.pageX + this.menuEl.offsetWidth) >= document.body.offsetWidth){
		this.menuEl.style.left = "";
		this.menuEl.style.right = (document.body.offsetWidth - e.pageX) + "px";
	}

	//move menu to start on bottom edge if it is too close to the edge of the screen
	if((e.pageY + this.menuEl.offsetHeight) >= docHeight){
		this.menuEl.style.top = "";
		this.menuEl.style.bottom = (docHeight - e.pageY) + "px";
	}
};

Menu.prototype.isOpen = function(){
	return !!this.menuEl.parentNode;
};

Menu.prototype.escMenu = function(e){
	if(e.keyCode == 27){
		this.hideMenu();
	}
};

Menu.prototype.hideMenu = function(){
	if(this.menuEl.parentNode){
		this.menuEl.parentNode.removeChild(this.menuEl);
	}

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