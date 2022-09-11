import Module from '../../core/Module.js';

class Popup extends Module{
	
	constructor(table){
		super(table);
		
		this.columnSubscribers = {};
		
		this.registerTableOption("rowContextPopup", false);
		this.registerTableOption("rowClickPopup", false);
		this.registerTableOption("rowDblClickPopup", false);
		this.registerTableOption("groupContextPopup", false);
		this.registerTableOption("groupClickPopup", false);
		this.registerTableOption("groupDblClickPopup", false);
		
		this.registerColumnOption("headerContextPopup");
		this.registerColumnOption("headerClickPopup");
		this.registerColumnOption("headerDblClickPopup");
		this.registerColumnOption("headerPopup");
		this.registerColumnOption("headerPopupIcon");
		this.registerColumnOption("contextPopup");
		this.registerColumnOption("clickPopup");
		this.registerColumnOption("dblClickPopup");

		this.registerComponentFunction("cell", "popup", this._componentPopupCall.bind(this));
		this.registerComponentFunction("column", "popup", this._componentPopupCall.bind(this));
		this.registerComponentFunction("row", "popup", this._componentPopupCall.bind(this));
		this.registerComponentFunction("group", "popup", this._componentPopupCall.bind(this));
		
	}
	
	initialize(){
		this.initializeRowWatchers();
		this.initializeGroupWatchers();
		
		this.subscribe("column-init", this.initializeColumn.bind(this));
	}

	_componentPopupCall(component, contents, position){
		this.loadPopupEvent(contents, null, component, position);
	}
	
	initializeRowWatchers(){
		if(this.table.options.rowContextPopup){
			this.subscribe("row-contextmenu", this.loadPopupEvent.bind(this, this.table.options.rowContextPopup));
			this.table.on("rowTapHold", this.loadPopupEvent.bind(this, this.table.options.rowContextPopup));
		}
		
		if(this.table.options.rowClickPopup){
			this.subscribe("row-click", this.loadPopupEvent.bind(this, this.table.options.rowClickPopup));
		}

		if(this.table.options.rowDblClickPopup){
			this.subscribe("row-dblclick", this.loadPopupEvent.bind(this, this.table.options.rowDblClickPopup));
		}
	}
	
	initializeGroupWatchers(){
		if(this.table.options.groupContextPopup){
			this.subscribe("group-contextmenu", this.loadPopupEvent.bind(this, this.table.options.groupContextPopup));
			this.table.on("groupTapHold", this.loadPopupEvent.bind(this, this.table.options.groupContextPopup));
		}
		
		if(this.table.options.groupClickPopup){
			this.subscribe("group-click", this.loadPopupEvent.bind(this, this.table.options.groupClickPopup));
		}

		if(this.table.options.groupDblClickPopup){
			this.subscribe("group-dblclick", this.loadPopupEvent.bind(this, this.table.options.groupDblClickPopup));
		}
	}
	
	initializeColumn(column){
		var def = column.definition;
		
		//handle column events
		if(def.headerContextPopup && !this.columnSubscribers.headerContextPopup){
			this.columnSubscribers.headerContextPopup = this.loadPopupTableColumnEvent.bind(this, "headerContextPopup");
			this.subscribe("column-contextmenu", this.columnSubscribers.headerContextPopup);
			this.table.on("headerTapHold", this.loadPopupTableColumnEvent.bind(this, "headerContextPopup"));
		}
		
		if(def.headerClickPopup && !this.columnSubscribers.headerClickPopup){
			this.columnSubscribers.headerClickPopup = this.loadPopupTableColumnEvent.bind(this, "headerClickPopup");
			this.subscribe("column-click", this.columnSubscribers.headerClickPopup);
		
		
		}if(def.headerDblClickPopup && !this.columnSubscribers.headerDblClickPopup){
			this.columnSubscribers.headerDblClickPopup = this.loadPopupTableColumnEvent.bind(this, "headerDblClickPopup");
			this.subscribe("column-dblclick", this.columnSubscribers.headerDblClickPopup);
		}
		
		if(def.headerPopup){
			this.initializeColumnHeaderPopup(column);
		}
		
		//handle cell events
		if(def.contextPopup && !this.columnSubscribers.contextPopup){
			this.columnSubscribers.contextPopup = this.loadPopupTableCellEvent.bind(this, "contextPopup");
			this.subscribe("cell-contextmenu", this.columnSubscribers.contextPopup);
			this.table.on("cellTapHold", this.loadPopupTableCellEvent.bind(this, "contextPopup"));
		}
		
		if(def.clickPopup && !this.columnSubscribers.clickPopup){
			this.columnSubscribers.clickPopup = this.loadPopupTableCellEvent.bind(this, "clickPopup");
			this.subscribe("cell-click", this.columnSubscribers.clickPopup);
		}

		if(def.dblClickPopup && !this.columnSubscribers.dblClickPopup){
			this.columnSubscribers.dblClickPopup = this.loadPopupTableCellEvent.bind(this, "dblClickPopup");
			this.subscribe("cell-click", this.columnSubscribers.dblClickPopup);
		}
	}
	
	initializeColumnHeaderPopup(column){
		var icon = column.definition.headerPopupIcon,
		headerPopupEl;
		
		headerPopupEl = document.createElement("span");
		headerPopupEl.classList.add("tabulator-header-popup-button");

		if(icon){
			if(typeof icon === "function"){
				icon = icon(column.getComponent());
			}

			if(icon instanceof HTMLElement){
				headerPopupEl.appendChild(icon);
			}else{
				headerPopupEl.innerHTML = icon;
			}
		}else{
			headerPopupEl.innerHTML = "&vellip;";
		}
		
		headerPopupEl.addEventListener("click", (e) => {
			e.stopPropagation();
			e.preventDefault();
			
			this.loadPopupEvent(column.definition.headerPopup, e, column);
		});
		
		column.titleElement.insertBefore(headerPopupEl, column.titleElement.firstChild);
	}
	
	loadPopupTableCellEvent(option, e, cell){
		if(cell._cell){
			cell = cell._cell;
		}
		
		if(cell.column.definition[option]){
			this.loadPopupEvent(cell.column.definition[option], e, cell);
		}
	}
	
	loadPopupTableColumnEvent(option, e, column){
		if(column._column){
			column = column._column;
		}
		
		if(column.definition[option]){
			this.loadPopupEvent(column.definition[option], e, column);
		}
	}
	
	loadPopupEvent(contents, e, component, position){
		var renderedCallback;

		function onRendered(callback){
			renderedCallback = callback;
		}
		
		if(component._group){
			component = component._group;
		}else if(component._row){
			component = component._row;
		}
		
		contents = typeof contents == "function" ? contents.call(this.table, e, component.getComponent(),  onRendered) : contents;
		
		this.loadPopup(e, component, contents, renderedCallback, position);
	}
	
	loadPopup(e, component, contents, renderedCallback, position){
		var touch = !(e instanceof MouseEvent),
		contentsEl, popup;
		
		if(contents instanceof HTMLElement){
			contentsEl = contents;
		}else{
			contentsEl = document.createElement("div");
			contentsEl.innerHTML = contents;
		}
		
		contentsEl.classList.add("tabulator-popup");

		contentsEl.addEventListener("click", (e) =>{
			e.stopPropagation();
		});

		if(!touch){
			e.preventDefault();
		}
		
		popup = this.popup(contentsEl);

		if(typeof renderedCallback === "function"){
			popup.renderCallback(renderedCallback);
		}

		if(e){
			popup.show(e);
		}else{
			popup.show(component.getElement(), position || "center");
		}

		
		popup.hideOnBlur(() => {
			this.dispatchExternal("popupClosed", component.getComponent());
		});



		this.dispatchExternal("popupOpened", component.getComponent());
	}
}

Popup.moduleName = "popup";

export default Popup;
