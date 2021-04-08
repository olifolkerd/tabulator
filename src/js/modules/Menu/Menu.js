import Module from '../../core/Module.js';
import Helpers from '../../core/tools/Helpers.js';

class Menu extends Module{

	constructor(table){
		super(table);

		this.menuElements = [];
		this.blurEvent = this.hideMenu.bind(this);
		this.escEvent = this.escMenu.bind(this);
		this.nestedMenuBlock = false;
		this.positionReversedX = false;

		this.registerTableOption("rowContextMenu", false);
		this.registerTableOption("rowClickMenu", false);
		this.registerTableOption("groupContextMenu", false);
		this.registerTableOption("groupClickMenu", false);
	}

	initialize(){
		this.subscribe("cell-layout", this.layoutCell.bind(this));
		this.subscribe("column-init", this.initializeColumn.bind(this));
		this.subscribe("row-init", this.initializeRow.bind(this));
	}

	layoutCell(cell){
		if(cell.column.definition.contextMenu || cell.column.definition.clickMenu){
			this.initializeCell(cell);
		}
	}

	initializeColumn(column){
		var def = column.definition;

		if(def.headerContextMenu || def.headerClickMenu || def.headerMenu){
			this.initializeColumnHeader(this);
		}
	}

	initializeColumnHeader(column){
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
				e.stopPropagation();
				e.preventDefault();

				this.LoadMenuEvent(column, column.definition.headerMenu, e);
			});

			column.titleElement.insertBefore(headerMenuEl, column.titleElement.firstChild);
		}
	}

	LoadMenuEvent(component, menu, e){
		menu = typeof menu == "function" ? menu.call(this.table, component.getComponent(), e) : menu;

		// if(component instanceof Cell){
		// 	e.stopImmediatePropagation();
		// }

		this.loadMenu(e, component, menu);
	}

	tapHold(component, menu){
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
	}

	initializeCell(cell){
		if(cell.column.definition.contextMenu){
			cell.getElement(true).addEventListener("contextmenu", this.LoadMenuEvent.bind(this, cell, cell.column.definition.contextMenu));
			this.tapHold(cell, cell.column.definition.contextMenu);
		}

		if(cell.column.definition.clickMenu){
			cell.getElement(true).addEventListener("click", this.LoadMenuEvent.bind(this, cell, cell.column.definition.clickMenu));
		}
	}

	initializeRow(row){
		if(this.table.options.rowContextMenu){
			row.getElement().addEventListener("contextmenu", this.LoadMenuEvent.bind(this, row, this.table.options.rowContextMenu));
			this.tapHold(row, this.table.options.rowContextMenu);
		}

		if(this.table.options.rowClickMenu){
			row.getElement().addEventListener("click", this.LoadMenuEvent.bind(this, row, this.table.options.rowClickMenu));
		}
	}

	initializeGroup (group){
		if(this.table.options.groupContextMenu){
			group.getElement().addEventListener("contextmenu", this.LoadMenuEvent.bind(this, group, this.table.options.groupContextMenu));
			this.tapHold(group, this.table.options.groupContextMenu);
		}

		if(this.table.options.groupClickMenu){
			group.getElement().addEventListener("click", this.LoadMenuEvent.bind(this, group, this.table.options.groupClickMenu));
		}
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
		var docHeight = Math.max(document.body.offsetHeight, window.innerHeight),
		x, y, parentOffset;

		if(!parentEl){
			x = touch ? e.touches[0].pageX : e.pageX;
			y = touch ? e.touches[0].pageY : e.pageY;

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

		document.body.appendChild(element);

		//move menu to start on bottom edge if it is too close to the edge of the screen
		if((y + element.offsetHeight) >= docHeight){
			element.style.top = "";

			if(parentEl){
				element.style.bottom = (docHeight - parentOffset.top - parentEl.offsetHeight - 1) + "px";
			}else{
				element.style.bottom = (docHeight - y) + "px";
			}
		}

		//move menu to start on right edge if it is too close to the edge of the screen
		if((x + element.offsetWidth) >= document.body.offsetWidth || this.positionReversedX){
			element.style.left = "";

			if(parentEl){
				element.style.right = (document.documentElement.offsetWidth - parentOffset.left) + "px";
			}else{
				element.style.right = (document.documentElement.offsetWidth - x) + "px";
			}

			this.positionReversedX = true;
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
	}
}

Menu.moduleName = "menu";

export default Menu;