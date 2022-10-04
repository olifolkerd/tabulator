import Module from '../../core/Module.js';

class Menu extends Module{
	
	constructor(table){
		super(table);
		
		this.menuContainer = null;
		this.nestedMenuBlock = false;
		
		this.currentComponent = null;
		this.rootPopup = null;
		
		this.columnSubscribers = {};
		
		this.registerTableOption("menuContainer", undefined); //deprecated
		
		this.registerTableOption("rowContextMenu", false);
		this.registerTableOption("rowClickMenu", false);
		this.registerTableOption("rowDblClickMenu", false);
		this.registerTableOption("groupContextMenu", false);
		this.registerTableOption("groupClickMenu", false);
		this.registerTableOption("groupDblClickMenu", false);
		
		this.registerColumnOption("headerContextMenu");
		this.registerColumnOption("headerClickMenu");
		this.registerColumnOption("headerDblClickMenu");
		this.registerColumnOption("headerMenu");
		this.registerColumnOption("headerMenuIcon");
		this.registerColumnOption("contextMenu");
		this.registerColumnOption("clickMenu");
		this.registerColumnOption("dblClickMenu");
		
	}
	
	initialize(){
		this.deprecatedOptionsCheck();
		this.initializeRowWatchers();
		this.initializeGroupWatchers();
		
		this.subscribe("column-init", this.initializeColumn.bind(this));
	}
	
	deprecatedOptionsCheck(){
		if(!this.deprecationCheck("menuContainer", "popupContainer")){
			this.table.options.popupContainer = this.table.options.menuContainer;
		}
	}	
	
	initializeRowWatchers(){
		if(this.table.options.rowContextMenu){
			this.subscribe("row-contextmenu", this.loadMenuEvent.bind(this, this.table.options.rowContextMenu));
			this.table.on("rowTapHold", this.loadMenuEvent.bind(this, this.table.options.rowContextMenu));
		}
		
		if(this.table.options.rowClickMenu){
			this.subscribe("row-click", this.loadMenuEvent.bind(this, this.table.options.rowClickMenu));
		}
		
		if(this.table.options.rowDblClickMenu){
			this.subscribe("row-dblclick", this.loadMenuEvent.bind(this, this.table.options.rowDblClickMenu));
		}
	}
	
	initializeGroupWatchers(){
		if(this.table.options.groupContextMenu){
			this.subscribe("group-contextmenu", this.loadMenuEvent.bind(this, this.table.options.groupContextMenu));
			this.table.on("groupTapHold", this.loadMenuEvent.bind(this, this.table.options.groupContextMenu));
		}
		
		if(this.table.options.groupClickMenu){
			this.subscribe("group-click", this.loadMenuEvent.bind(this, this.table.options.groupClickMenu));
		}
		
		if(this.table.options.groupDblClickMenu){
			this.subscribe("group-dblclick", this.loadMenuEvent.bind(this, this.table.options.groupDblClickMenu));
		}
	}
	
	initializeColumn(column){
		var	def = column.definition;
		
		//handle column events
		if(def.headerContextMenu && !this.columnSubscribers.headerContextMenu){
			this.columnSubscribers.headerContextMenu = this.loadMenuTableColumnEvent.bind(this, "headerContextMenu");
			this.subscribe("column-contextmenu", this.columnSubscribers.headerContextMenu);
			this.table.on("headerTapHold", this.loadMenuTableColumnEvent.bind(this, "headerContextMenu"));
		}
		
		if(def.headerClickMenu && !this.columnSubscribers.headerClickMenu){
			this.columnSubscribers.headerClickMenu = this.loadMenuTableColumnEvent.bind(this, "headerClickMenu");
			this.subscribe("column-click", this.columnSubscribers.headerClickMenu);
		}
		
		if(def.headerDblClickMenu && !this.columnSubscribers.headerDblClickMenu){
			this.columnSubscribers.headerDblClickMenu = this.loadMenuTableColumnEvent.bind(this, "headerDblClickMenu");
			this.subscribe("column-dblclick", this.columnSubscribers.headerDblClickMenu);
		}
		
		if(def.headerMenu){
			this.initializeColumnHeaderMenu(column);
		}
		
		//handle cell events
		if(def.contextMenu && !this.columnSubscribers.contextMenu){
			this.columnSubscribers.contextMenu = this.loadMenuTableCellEvent.bind(this, "contextMenu");
			this.subscribe("cell-contextmenu", this.columnSubscribers.contextMenu);
			this.table.on("cellTapHold", this.loadMenuTableCellEvent.bind(this, "contextMenu"));
		}
		
		if(def.clickMenu && !this.columnSubscribers.clickMenu){
			this.columnSubscribers.clickMenu = this.loadMenuTableCellEvent.bind(this, "clickMenu");
			this.subscribe("cell-click", this.columnSubscribers.clickMenu);
		}
		
		if(def.dblClickMenu && !this.columnSubscribers.dblClickMenu){
			this.columnSubscribers.dblClickMenu = this.loadMenuTableCellEvent.bind(this, "dblClickMenu");
			this.subscribe("cell-dblclick", this.columnSubscribers.dblClickMenu);
		}
	}
	
	initializeColumnHeaderMenu(column){
		var icon = column.definition.headerMenuIcon,
		headerMenuEl;
		
		headerMenuEl = document.createElement("span");
		headerMenuEl.classList.add("tabulator-header-popup-button");
		
		if(icon){
			if(typeof icon === "function"){
				icon = icon(column.getComponent());
			}
			
			if(icon instanceof HTMLElement){
				headerMenuEl.appendChild(icon);
			}else{
				headerMenuEl.innerHTML = icon;
			}
		}else{
			headerMenuEl.innerHTML = "&vellip;";
		}
		
		headerMenuEl.addEventListener("click", (e) => {
			e.stopPropagation();
			e.preventDefault();
			
			this.loadMenuEvent(column.definition.headerMenu, e, column);
		});
		
		column.titleElement.insertBefore(headerMenuEl, column.titleElement.firstChild);
	}
	
	loadMenuTableCellEvent(option, e, cell){
		if(cell._cell){
			cell = cell._cell;
		}
		
		if(cell.column.definition[option]){
			this.loadMenuEvent(cell.column.definition[option], e, cell);
		}
	}
	
	loadMenuTableColumnEvent(option, e, column){
		if(column._column){
			column = column._column;
		}
		
		if(column.definition[option]){
			this.loadMenuEvent(column.definition[option], e, column);
		}
	}
	
	loadMenuEvent(menu, e, component){
		if(component._group){
			component = component._group;
		}else if(component._row){
			component = component._row;
		}
		
		menu = typeof menu == "function" ? menu.call(this.table, e, component.getComponent()) : menu;
		
		this.loadMenu(e, component, menu);
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
				}, 100);
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
			if(this.rootPopup){
				this.rootPopup.hide();
			}
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
			
			this.dispatchExternal("menuOpened", component.getComponent());
		}
	}
}

Menu.moduleName = "menu";

export default Menu;
