import Module from '../../core/Module.js';

class Menu extends Module{
	
	constructor(table){
		super(table);
		
		this.menuContainer = null;
		this.nestedMenuBlock = false;
		
		this.currentComponent = null;
		this.rootPopup = null;
		
		this.columnSubscribers = {};
		
		this.registerTableOption("rowContextMenu", false);
		this.registerTableOption("rowClickMenu", false);
		this.registerTableOption("groupContextMenu", false);
		this.registerTableOption("groupClickMenu", false);
		this.registerTableOption("menuContainer", undefined);
		
		this.registerColumnOption("headerContextMenu");
		this.registerColumnOption("headerClickMenu");
		this.registerColumnOption("headerMenu");
		this.registerColumnOption("contextMenu");
		this.registerColumnOption("clickMenu");

		this.registerColumnOption("headerContextPopup");
		this.registerColumnOption("headerClickPopup");
		this.registerColumnOption("headerPopup");
		this.registerColumnOption("contextPopup");
		this.registerColumnOption("clickPopup");
	}
	
	initialize(){
		this.deprecationCheck();
		this.initializeRowWatchers();
		this.initializeGroupWatchers();
		
		this.subscribe("column-init", this.initializeColumn.bind(this));
	}

	deprecationCheck(){
		if(typeof this.table.options.menuContainer !== "undefined"){
			console.warn("Use of the menuContainer option is now deprecated. Please use the popupContainer option instead");

			this.table.options.popupContainer = this.table.options.menuContainer;
		}
	}	
	
	initializeRowWatchers(){
		if(this.table.options.rowContextMenu){
			this.subscribe("row-contextmenu", this.loadEvent.bind(this, this.table.options.rowContextMenu, "loadMenu"));
			this.table.on("rowTapHold", this.loadEvent.bind(this, this.table.options.rowContextMenu, "loadMenu"));
		}
		
		if(this.table.options.rowClickMenu){
			this.subscribe("row-click", this.loadEvent.bind(this, this.table.options.rowClickMenu, "loadMenu"));
		}
	}
	
	initializeGroupWatchers(){
		if(this.table.options.groupContextMenu){
			this.subscribe("group-contextmenu", this.loadEvent.bind(this, this.table.options.groupContextMenu, "loadMenu"));
			this.table.on("groupTapHold", this.loadEvent.bind(this, this.table.options.groupContextMenu, "loadMenu"));
		}
		
		if(this.table.options.groupClickMenu){
			this.subscribe("group-click", this.loadEvent.bind(this, this.table.options.groupClickMenu, "loadMenu"));
		}
	}
	
	initializeColumn(column){
		var options = ["headerContextMenu", "headerClickMenu"],
		def = column.definition;
		
		//handle column events
		if(def.headerContextMenu && !this.columnSubscribers.headerContextMenu){
			this.columnSubscribers.headerContextMenu = this.loadMenuTableColumnEvent.bind(this, "headerContextMenu", "loadMenu");
			this.subscribe("column-contextmenu", this.columnSubscribers.headerContextMenu);
			this.table.on("headerTapHold", this.loadMenuTableColumnEvent.bind(this, "headerContextMenu"))
		}
		
		if(def.headerClickMenu && !this.columnSubscribers.headerClickMenu){
			this.columnSubscribers.headerClickMenu = this.loadMenuTableColumnEvent.bind(this, "headerClickMenu", "loadMenu");
			this.subscribe("column-click", this.columnSubscribers.headerClickMenu);
		}
		
		if(def.headerMenu){
			this.initializeColumnHeaderMenu(column);
		}
		
		//handle cell events
		if(def.contextMenu && !this.columnSubscribers.contextMenu){
			this.columnSubscribers.contextMenu = this.loadMenuTableCellEvent.bind(this, "contextMenu", "loadMenu");
			this.subscribe("cell-contextmenu", this.columnSubscribers.contextMenu);
			this.table.on("cellTapHold", this.loadMenuTableCellEvent.bind(this, "contextMenu"))
		}
		
		if(def.clickMenu && !this.columnSubscribers.clickMenu){
			this.columnSubscribers.clickMenu = this.loadMenuTableCellEvent.bind(this, "clickMenu", "loadMenu");
			this.subscribe("cell-click", this.columnSubscribers.clickMenu);
		}
	}
	
	initializeColumnHeaderMenu(column){
		var headerMenuEl;
		
		headerMenuEl = document.createElement("span");
		headerMenuEl.classList.add("tabulator-header-menu-button");
		headerMenuEl.innerHTML = "&vellip;";
		
		headerMenuEl.addEventListener("click", (e) => {
			e.stopPropagation();
			e.preventDefault();
			
			this.loadEvent(column.definition.headerMenu, "loadMenu", e, column);
		});
		
		column.titleElement.insertBefore(headerMenuEl, column.titleElement.firstChild);
	}
	
	loadMenuTableCellEvent(option, type, e, cell){
		if(cell._cell){
			cell = cell._cell;
		}
		
		if(cell.column.definition[option]){
			this.loadEvent(cell.column.definition[option], type, e, cell);
		}
	}
	
	loadMenuTableColumnEvent(option, type, e, column){
		if(column._column){
			column = column._column;
		}
		
		if(column.definition[option]){
			this.loadEvent(column.definition[option], type, e, column);
		}
	}
	
	loadEvent(value, type, e, component){
		if(component._group){
			component = component._group;
		}else if(component._row){
			component = component._row;
		}
		
		value = typeof value == "function" ? value.call(this.table, component.getComponent(), e) : value;
		
		this[type](e, component, value);
	}

	loadPopup(e, component, menu){
		console.log("popup");
	}
	
	loadMenu(e, component, menu, parentEl, parentPopup){
		var touch = !(e instanceof MouseEvent),		
		menuEl = document.createElement("div"),
		popup;
		
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
				if(this.rootPopup){
					return;
				}
			}else{
				this.nestedMenuBlock = setTimeout(() => {
					this.nestedMenuBlock = false;
				}, 100)
			}
			
			if(this.rootPopup){
				this.rootPopup.hide();	
			}
			
			this.rootPopup = popup = this.popup(menuEl);
			
		}else{
			popup = parentPopup.child(menuEl);
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
					label = label.call(this.table, component.getComponent());
				}
				
				if(label instanceof Node){
					itemEl.appendChild(label);
				}else{
					itemEl.innerHTML = label;
				}
				
				if(typeof disabled == "function"){
					disabled = disabled.call(this.table, component.getComponent());
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
							this.loadMenu(e, component, item.menu, itemEl, popup);
						});
					}else{
						if(item.action){
							itemEl.addEventListener("click", (e) => {
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
		
		menuEl.addEventListener("click", (e) => {
			this.rootPopup.hide();
		});
		
		popup.show(parentEl || e);
		
		if(popup === this.rootPopup){
			this.rootPopup.hideOnBlur(() => {
				this.rootPopup = null;
				
				if(this.currentComponent){
					this.dispatchExternal("menuClosed", this.currentComponent.getComponent());
					this.currentComponent = null;
				}
			});

			this.currentComponent = component;

			this.dispatchExternal("menuOpened", component.getComponent())
		}
	}
}

Menu.moduleName = "menu";

export default Menu;
