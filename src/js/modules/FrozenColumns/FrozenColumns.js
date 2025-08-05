import Module from '../../core/Module.js';

export default class FrozenColumns extends Module{

	static moduleName = "frozenColumns";
	
	constructor(table){
		super(table);
		
		this.leftColumns = [];
		this.rightColumns = [];
		this.initializationMode = "left";
		this.active = false;
		this.blocked = true;
		
		this.registerColumnOption("frozen");
	}
	
	//reset initial state
	reset(){
		this.initializationMode = "left";
		this.leftColumns = [];
		this.rightColumns = [];
		this.active = false;
	}
	
	initialize(){
		this.subscribe("cell-layout", this.layoutCell.bind(this));
		this.subscribe("column-init", this.initializeColumn.bind(this));
		this.subscribe("column-width", this.layout.bind(this));
		this.subscribe("row-layout-after", this.layoutRow.bind(this));
		this.subscribe("table-layout", this.layout.bind(this));
		this.subscribe("columns-loading", this.reset.bind(this));
		
		this.subscribe("column-add", this.reinitializeColumns.bind(this));
		this.subscribe("column-deleted", this.reinitializeColumns.bind(this));
		this.subscribe("column-hide", this.reinitializeColumns.bind(this));
		this.subscribe("column-show", this.reinitializeColumns.bind(this));
		this.subscribe("columns-loaded", this.reinitializeColumns.bind(this));
		
		this.subscribe("table-redraw", this.layout.bind(this));
		this.subscribe("layout-refreshing", this.blockLayout.bind(this));
		this.subscribe("layout-refreshed", this.unblockLayout.bind(this));
		this.subscribe("scrollbar-vertical", this.adjustForScrollbar.bind(this));
	}
	
	blockLayout(){
		this.blocked = true;
	}
	
	unblockLayout(){
		this.blocked = false;
	}
	
	layoutCell(cell){
		this.layoutElement(cell.element, cell.column);
	}
	
	reinitializeColumns(){
		this.reset();
		
		this.table.columnManager.columnsByIndex.forEach((column) => {
			this.initializeColumn(column);
		});

		this.layout();
	}
	
	//initialize specific column
	initializeColumn(column){
		var config = {margin:0, edge:false};
		
		if(!column.isGroup){			
			if(this.frozenCheck(column)){
				config.position = this.initializationMode;
				
				if(this.initializationMode == "left"){
					this.leftColumns.push(column);
				}else{
					this.rightColumns.unshift(column);
				}
				
				this.active = true;
				
				column.modules.frozen = config;
			}else{
				this.initializationMode = "right";
			}
		}
	}
	
	frozenCheck(column){
		if(column.parent.isGroup && column.definition.frozen){
			console.warn("Frozen Column Error - Parent column group must be frozen, not individual columns or sub column groups");
		}
		
		if(column.parent.isGroup){
			return this.frozenCheck(column.parent);
		}else{
			return column.definition.frozen;
		}
	}
	
	//layout calculation rows
	layoutCalcRows(){
		if(this.table.modExists("columnCalcs")){
			if(this.table.modules.columnCalcs.topInitialized && this.table.modules.columnCalcs.topRow){
				this.layoutRow(this.table.modules.columnCalcs.topRow);
			}
			
			if(this.table.modules.columnCalcs.botInitialized && this.table.modules.columnCalcs.botRow){
				this.layoutRow(this.table.modules.columnCalcs.botRow);
			}
			
			if(this.table.modExists("groupRows")){
				this.layoutGroupCalcs(this.table.modules.groupRows.getGroups());
			}
		}
	}
	
	layoutGroupCalcs(groups){
		groups.forEach((group) => {
			if(group.calcs.top){
				this.layoutRow(group.calcs.top);
			}
			
			if(group.calcs.bottom){
				this.layoutRow(group.calcs.bottom);
			}
			
			if(group.groupList && group.groupList.length){
				this.layoutGroupCalcs(group.groupList);
			}
		});
	}
	
	//calculate column positions and layout headers
	layoutColumnPosition(allCells){
		var leftParents = [];
		var rightParents = [];
		
		var leftMargin = 0;
		var rightMargin = 0;
		
		this.leftColumns.forEach((column, i) => {	
			column.modules.frozen.marginValue = leftMargin;
			column.modules.frozen.margin = column.modules.frozen.marginValue + "px";
			
			if(column.visible){
				leftMargin += column.getWidth();
			}
			
			if(i == this.leftColumns.length - 1){
				column.modules.frozen.edge = true;
			}else{
				column.modules.frozen.edge = false;
			}
			
			if(column.parent.isGroup){
				var parentEl = this.getColGroupParentElement(column);
				if(!leftParents.includes(parentEl)){
					this.layoutElement(parentEl, column);
					leftParents.push(parentEl);
				}
				
				parentEl.classList.toggle("tabulator-frozen-left",  column.modules.frozen.edge && column.modules.frozen.position === "left");
				parentEl.classList.toggle("tabulator-frozen-right", column.modules.frozen.edge && column.modules.frozen.position === "right");
			}else{
				this.layoutElement(column.getElement(), column);
			}
			
			if(allCells){
				column.cells.forEach((cell) => {
					this.layoutElement(cell.getElement(true), column);
				});
			}
		});
		
		this.rightColumns.forEach((column, i) => {
			
			column.modules.frozen.marginValue = rightMargin;
			column.modules.frozen.margin = column.modules.frozen.marginValue + "px";
			
			if(column.visible){
				rightMargin += column.getWidth();
			}
			
			if(i == this.rightColumns.length - 1){
				column.modules.frozen.edge = true;
			}else{
				column.modules.frozen.edge = false;
			}
			
			if(column.parent.isGroup){
				var parentEl = this.getColGroupParentElement(column);
				if(!rightParents.includes(parentEl)){
					this.layoutElement(parentEl, column);
					rightParents.push(parentEl);
				}

				if(column.modules.frozen.edge){
					parentEl.classList.add("tabulator-frozen-" + column.modules.frozen.position);
				}
			}else{
				this.layoutElement(column.getElement(), column);
			}
			
			if(allCells){
				column.cells.forEach((cell) => {
					this.layoutElement(cell.getElement(true), column);
				});
			}
		});
	}
	
	getColGroupParentElement(column){
		return column.parent.isGroup ? this.getColGroupParentElement(column.parent) : column.getElement();
	}
	
	//layout columns appropriately
	layout(){	
		if(this.active && !this.blocked){
			//calculate left columns
			this.layoutColumnPosition();
			
			this.reinitializeRows();
			
			this.layoutCalcRows();
		}
	}
	
	reinitializeRows(){
		var visibleRows = this.table.rowManager.getVisibleRows(true);
		var otherRows = this.table.rowManager.getRows().filter(row => !visibleRows.includes(row));
		
		otherRows.forEach((row) =>{
			row.deinitialize();
		});
		
		visibleRows.forEach((row) =>{
			if(row.type === "row"){
				this.layoutRow(row);
			}
		});
	}
	
	layoutRow(row){
		if(this.table.options.layout === "fitDataFill" && this.rightColumns.length){
			this.table.rowManager.getTableElement().style.minWidth = "calc(100% - " + this.rightMargin + ")";
		}
		
		this.leftColumns.forEach((column) => {
			var cell = row.getCell(column);
			
			if(cell){
				this.layoutElement(cell.getElement(true), column);
			}
		});
		
		this.rightColumns.forEach((column) => {
			var cell = row.getCell(column);
			
			if(cell){
				this.layoutElement(cell.getElement(true), column);
			}
		});
	}
	
	layoutElement(element, column){
		var position;
		
		if(column.modules.frozen && element){
			element.style.position = "sticky";

			if(this.table.rtl){
				position = column.modules.frozen.position === "left" ? "right" : "left";
			}else{
				position = column.modules.frozen.position;
			}
		
			element.style[position] = column.modules.frozen.margin;

			element.classList.add("tabulator-frozen");
			
			element.classList.toggle("tabulator-frozen-left",  column.modules.frozen.edge && column.modules.frozen.position === "left");
			element.classList.toggle("tabulator-frozen-right", column.modules.frozen.edge && column.modules.frozen.position === "right");
		}
	}

	adjustForScrollbar(width){
		if(this.rightColumns.length){
			this.table.columnManager.getContentsElement().style.width = "calc(100% - " + width + "px)";
		}
	}

	getFrozenColumns(){
		return this.leftColumns.concat(this.rightColumns);
	}
	
	_calcSpace(columns, index){
		var width = 0;
		
		for (let i = 0; i < index; i++){
			if(columns[i].visible){
				width += columns[i].getWidth();
			}
		}
		
		return width;
	}
}