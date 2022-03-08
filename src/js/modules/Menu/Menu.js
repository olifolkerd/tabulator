import Module from '../../core/Module.js';
import Helpers from '../../core/tools/Helpers.js';

class Menu extends Module{
	
	constructor(table){
		super(table);
		
		this.menuContainer = null;
		this.menuElements = [];
		this.blurEvent = this.hideMenu.bind(this);
		this.escEvent = this.escMenu.bind(this);
		this.nestedMenuBlock = false;
		this.positionReversedX = false;
		
		this.currentComponent = null;
		
		this.columnSubscribers = {};
		
		this.registerTableOption("rowContextMenu", false);
		this.registerTableOption("rowClickMenu", false);
		this.registerTableOption("groupContextMenu", false);
		this.registerTableOption("groupClickMenu", false);
		this.registerTableOption("menuContainer", false);
		
		this.registerColumnOption("headerContextMenu");
		this.registerColumnOption("headerClickMenu");
		this.registerColumnOption("headerMenu");
		this.registerColumnOption("contextMenu");
		this.registerColumnOption("clickMenu");
	}
	
	initialize(){
		this.lookupMenuContainer();
		
		this.initializeRowWatchers();
		this.initializeGroupWatchers();
		
		this.subscribe("column-init", this.initializeColumn.bind(this));
	}
	
	lookupMenuContainer(){
		
		this.menuContainer = this.table.options.menuContainer;
		
		if(typeof this.menuContainer === "string"){
			this.menuContainer = document.querySelector(this.menuContainer);
			
			if(!this.menuContainer){
				console.warn("Menu Error - no container element found matching selector:",  this.table.options.menuContainer , "(defaulting to document body)");
			}
		}else if (this.menuContainer === true){
			this.menuContainer = this.table.element;
		}
		
		if(this.menuContainer && !this.checkMenuContainerIsParent(this.menuContainer)){
			this.menuContainer = false;
			console.warn("Menu Error - container element does not contain this table:",  this.table.options.menuContainer , "(defaulting to document body)");
		}
		
		if(!this.menuContainer){
			this.menuContainer = document.body;
		}
	}
	
	checkMenuContainerIsParent(container, element = this.table.element){
		if(container === element){
			return true;
		}else{
			return element.parentNode ? this.checkMenuContainerIsParent(container, element.parentNode) : false;
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
	}
	
	initializeGroupWatchers(){
		if(this.table.options.groupContextMenu){
			this.subscribe("group-contextmenu", this.loadMenuEvent.bind(this, this.table.options.groupContextMenu));
			this.table.on("groupTapHold", this.loadMenuEvent.bind(this, this.table.options.groupContextMenu));
		}
		
		if(this.table.options.groupClickMenu){
			this.subscribe("group-click", this.loadMenuEvent.bind(this, this.table.options.groupClickMenu));
		}
	}
	
	initializeColumn(column){
		var options = ["headerContextMenu", "headerClickMenu"],
		def = column.definition;
		
		//handle column events
		if(def.headerContextMenu && !this.columnSubscribers.headerContextMenu){
			this.columnSubscribers.headerContextMenu = this.loadMenuTableColumnEvent.bind(this, "headerContextMenu");
			this.subscribe("column-contextmenu", this.columnSubscribers.headerContextMenu);
			this.table.on("headerTapHold", this.loadMenuTableColumnEvent.bind(this, "headerContextMenu"))
		}
		
		if(def.headerClickMenu && !this.columnSubscribers.headerClickMenu){
			this.columnSubscribers.headerClickMenu = this.loadMenuTableColumnEvent.bind(this, "headerClickMenu");
			this.subscribe("column-click", this.columnSubscribers.headerClickMenu);
		}
		
		if(def.headerMenu){
			this.initializeColumnHeaderMenu(column);
		}
		
		//handle cell events
		if(def.contextMenu && !this.columnSubscribers.contextMenu){
			this.columnSubscribers.contextMenu = this.loadMenuTableCellEvent.bind(this, "contextMenu");
			this.subscribe("cell-contextmenu", this.columnSubscribers.contextMenu);
			this.table.on("cellTapHold", this.loadMenuTableCellEvent.bind(this, "contextMenu"))
		}
		
		if(def.clickMenu && !this.columnSubscribers.clickMenu){
			this.columnSubscribers.clickMenu = this.loadMenuTableCellEvent.bind(this, "clickMenu");
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
		
		menu = typeof menu == "function" ? menu.call(this.table, component.getComponent(), e) : menu;
		
		this.loadMenu(e, component, menu);
	}
	
	loadMenu(e, component, menu, parentEl){
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
							this.hideOldSubMenus(menuEl);
							this.loadMenu(e, component, item.menu, itemEl);
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
			this.hideMenu();
		});
		
		this.menuElements.push(menuEl);
		this.positionMenu(menuEl, parentEl, touch, e);
		
		this.currentComponent = component
		
		this.dispatchExternal("menuOpened", component.getComponent())
	}
	
	hideOldSubMenus(menuEl){
		var index = this.menuElements.indexOf(menuEl);
		
		if(index > -1){
			for(let i = this.menuElements.length - 1; i > index; i--){
				var el = this.menuElements[i];
				
				if(el.parentNode){
					el.parentNode.removeChild(el);
				}
				
				this.menuElements.pop();
			}
		}
	}
	
	positionMenu(element, parentEl, touch, e){
		var x, y, parentOffset;
		
		if(!parentEl){
			x = touch ? e.touches[0].pageX : e.pageX;
			y = touch ? e.touches[0].pageY : e.pageY;
			
			if(this.menuContainer !== document.body){
				parentOffset = Helpers.elOffset(this.menuContainer);
				
				x -= parentOffset.left;
				y -= parentOffset.top;
			}
			
			this.positionReversedX = false;
		}else{
			parentOffset = Helpers.elOffset(parentEl);
			x = parentOffset.left + parentEl.offsetWidth;
			y = parentOffset.top - 1;
		}
		
		element.style.top = y + "px";
		element.style.left = x + "px";
		
		setTimeout(() => {
			this.table.rowManager.element.addEventListener("scroll", this.blurEvent);
			document.body.addEventListener("click", this.blurEvent);
			document.body.addEventListener("contextmenu", this.blurEvent);
			window.addEventListener("resize", this.blurEvent);
			document.body.addEventListener("keydown", this.escEvent);
		}, 100);
		
		this.menuContainer.appendChild(element);
		
		//move menu to start on right edge if it is too close to the edge of the screen
		if((x + element.offsetWidth) >= this.menuContainer.offsetWidth || this.positionReversedX){
			element.style.left = "";
			
			if(parentEl){
				element.style.right = (this.menuContainer.offsetWidth - parentOffset.left) + "px";
			}else{
				element.style.right = (this.menuContainer.offsetWidth - x) + "px";
			}
			
			this.positionReversedX = true;
		}
		
		//move menu to start on bottom edge if it is too close to the edge of the screen
		if((y + element.offsetHeight) > this.menuContainer.offsetHeight) {
			if(parentEl){
				element.style.top = (parseInt(element.style.top) - element.offsetHeight + parentEl.offsetHeight + 1) + "px";
			}else{
				element.style.top = (parseInt(element.style.top) - element.offsetHeight) + "px";
			}
		}
	}
	
	isOpen(){
		return !!this.menuElements.length;
	}
	
	escMenu(e){
		if(e.keyCode == 27){
			this.hideMenu();
		}
	}
	
	hideMenu(){	
		this.menuElements.forEach((menuEl) => {
			if(menuEl.parentNode){
				menuEl.parentNode.removeChild(menuEl);
			}
		});
		
		document.body.removeEventListener("keydown", this.escEvent);
		document.body.removeEventListener("click", this.blurEvent);
		document.body.removeEventListener("contextmenu", this.blurEvent);
		window.removeEventListener("resize", this.blurEvent);
		this.table.rowManager.element.removeEventListener("scroll", this.blurEvent);
		
		if(this.currentComponent){
			this.dispatchExternal("menuClosed", this.currentComponent.getComponent());
			this.currentComponent = null;
		}
	}
}

Menu.moduleName = "menu";

export default Menu;