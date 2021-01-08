import RowComponent from './RowComponent.js';

class Row {
	constructor (data, parent, type = "row"){
		this.table = parent.table;
		this.parent = parent;
		this.data = {};
		this.type = type; //type of element
		this.element = false;
		this.modules = {}; //hold module variables;
		this.cells = [];
		this.height = 0; //hold element height
		this.heightStyled = ""; //hold element height prestyled to improve render efficiency
		this.manualHeight = false; //user has manually set row height
		this.outerHeight = 0; //holde lements outer height
		this.initialized = false; //element has been rendered
		this.heightInitialized = false; //element has resized cells to fit

		this.component = null;

		this.created = false;

		this.setData(data);
	}

	create(){
		if(!this.created){
			this.created = true;
			this.generateElement();
		}
	}

	createElement (){
		var el = document.createElement("div");

		el.classList.add("tabulator-row");
		el.setAttribute("role", "row");

		this.element = el;
	}

	getElement(){
		this.create();
		return this.element;
	}

	detachElement(){
		if (this.element && this.element.parentNode){
			this.element.parentNode.removeChild(this.element);
		}
	}

	generateElement(){
		var self = this,
		dblTap,	tapHold, tap;

		this.createElement();

		//set row selection characteristics
		if(self.table.options.selectable !== false && self.table.modExists("selectRow")){
			self.table.modules.selectRow.initializeRow(this);
		}

		//setup movable rows
		if(self.table.options.movableRows !== false && self.table.modExists("moveRow")){
			self.table.modules.moveRow.initializeRow(this);
		}

		//setup data tree
		if(self.table.options.dataTree !== false && self.table.modExists("dataTree")){
			self.table.modules.dataTree.initializeRow(this);
		}

		//setup column colapse container
		if(self.table.options.responsiveLayout === "collapse" && self.table.modExists("responsiveLayout")){
			self.table.modules.responsiveLayout.initializeRow(this);
		}

		//set column menu
		if((self.table.options.rowContextMenu || self.table.options.rowClickMenu) && this.table.modExists("menu")){
			self.table.modules.menu.initializeRow(this);
		}

		//handle row click events
		if (self.table.options.rowClick){
			self.element.addEventListener("click", function(e){
				self.table.options.rowClick(e, self.getComponent());
			});
		}

		if (self.table.options.rowDblClick){
			self.element.addEventListener("dblclick", function(e){
				self.table.options.rowDblClick(e, self.getComponent());
			});
		}

		if (self.table.options.rowContext){
			self.element.addEventListener("contextmenu", function(e){
				self.table.options.rowContext(e, self.getComponent());
			});
		}

		//handle mouse events
		if (self.table.options.rowMouseEnter){
			self.element.addEventListener("mouseenter", function(e){
				self.table.options.rowMouseEnter(e, self.getComponent());
			});
		}

		if (self.table.options.rowMouseLeave){
			self.element.addEventListener("mouseleave", function(e){
				self.table.options.rowMouseLeave(e, self.getComponent());
			});
		}

		if (self.table.options.rowMouseOver){
			self.element.addEventListener("mouseover", function(e){
				self.table.options.rowMouseOver(e, self.getComponent());
			});
		}

		if (self.table.options.rowMouseOut){
			self.element.addEventListener("mouseout", function(e){
				self.table.options.rowMouseOut(e, self.getComponent());
			});
		}

		if (self.table.options.rowMouseMove){
			self.element.addEventListener("mousemove", function(e){
				self.table.options.rowMouseMove(e, self.getComponent());
			});
		}

		if (self.table.options.rowTap){

			tap = false;

			self.element.addEventListener("touchstart", function(e){
				tap = true;
			}, {passive: true});

			self.element.addEventListener("touchend", function(e){
				if(tap){
					self.table.options.rowTap(e, self.getComponent());
				}

				tap = false;
			});
		}

		if (self.table.options.rowDblTap){

			dblTap = null;

			self.element.addEventListener("touchend", function(e){

				if(dblTap){
					clearTimeout(dblTap);
					dblTap = null;

					self.table.options.rowDblTap(e, self.getComponent());
				}else{

					dblTap = setTimeout(function(){
						clearTimeout(dblTap);
						dblTap = null;
					}, 300);
				}

			});
		}

		if (self.table.options.rowTapHold){

			tapHold = null;

			self.element.addEventListener("touchstart", function(e){
				clearTimeout(tapHold);

				tapHold = setTimeout(function(){
					clearTimeout(tapHold);
					tapHold = null;
					tap = false;
					self.table.options.rowTapHold(e, self.getComponent());
				}, 1000);

			}, {passive: true});

			self.element.addEventListener("touchend", function(e){
				clearTimeout(tapHold);
				tapHold = null;
			});
		}
	}

	generateCells(){
		this.cells = this.table.columnManager.generateCells(this);
	}

	//functions to setup on first render
	initialize(force){
		this.create();

		if(!this.initialized || force){

			this.deleteCells();

			while(this.element.firstChild) this.element.removeChild(this.element.firstChild);

			//handle frozen cells
			if(this.table.modExists("frozenColumns")){
				this.table.modules.frozenColumns.layoutRow(this);
			}

			this.generateCells();

			if(this.table.options.virtualDomHoz && this.table.vdomHoz.initialized){
				this.table.vdomHoz.initializeRow(this);
			}else{
				this.cells.forEach((cell) => {
					this.element.appendChild(cell.getElement());
					cell.cellRendered();
				});
			}

			if(force){
				this.normalizeHeight();
			}

			//setup movable rows
			if(this.table.options.dataTree && this.table.modExists("dataTree")){
				this.table.modules.dataTree.layoutRow(this);
			}

			//setup column colapse container
			if(this.table.options.responsiveLayout === "collapse" && this.table.modExists("responsiveLayout")){
				this.table.modules.responsiveLayout.layoutRow(this);
			}

			if(this.table.options.rowFormatter){
				this.table.options.rowFormatter(this.getComponent());
			}

			//set resizable handles
			if(this.table.options.resizableRows && this.table.modExists("resizeRows")){
				this.table.modules.resizeRows.initializeRow(this);
			}

			this.initialized = true;
		}else{
			if(this.table.options.virtualDomHoz){
				this.table.vdomHoz.reinitializeRow(this);
			}
		}
	}

	reinitializeHeight(){
		this.heightInitialized = false;

		if(this.element && this.element.offsetParent !== null){
			this.normalizeHeight(true);
		}
	}

	reinitialize(children){
		this.initialized = false;
		this.heightInitialized = false;

		if(!this.manualHeight){
			this.height = 0;
			this.heightStyled = "";
		}

		if(this.element && this.element.offsetParent !== null){
			this.initialize(true);
		}

		if(this.table.options.dataTree && this.table.modExists("dataTree", true)){
			this.table.modules.dataTree.getTreeChildren(this, false, true).forEach(function(child){
				child.reinitialize(true);
			});
		}
	}

	//get heights when doing bulk row style calcs in virtual DOM
	calcHeight(force){

		var maxHeight = 0,
		minHeight = this.table.options.resizableRows ? this.element.clientHeight : 0;

		this.cells.forEach(function(cell){
			var height = cell.getHeight();
			if(height > maxHeight){
				maxHeight = height;
			}
		});

		if(force){
			this.height = Math.max(maxHeight, minHeight);
		}else{
			this.height = this.manualHeight ? this.height : Math.max(maxHeight, minHeight);
		}

		this.heightStyled = this.height ? this.height + "px" : "";
		this.outerHeight = this.element.offsetHeight;
	}

	//set of cells
	setCellHeight(){
		this.cells.forEach(function(cell){
			cell.setHeight();
		});

		this.heightInitialized = true;
	}

	clearCellHeight(){
		this.cells.forEach(function(cell){
			cell.clearHeight();
		});
	}

	//normalize the height of elements in the row
	normalizeHeight(force){

		if(force){
			this.clearCellHeight();
		}

		this.calcHeight(force);

		this.setCellHeight();
	}

	//set height of rows
	setHeight(height, force){
		if(this.height != height || force){

			this.manualHeight = true;

			this.height = height;
			this.heightStyled = height ? height + "px" : "";

			this.setCellHeight();

			// this.outerHeight = this.element.outerHeight();
			this.outerHeight = this.element.offsetHeight;
		}
	}

	//return rows outer height
	getHeight(){
		return this.outerHeight;
	}

	//return rows outer Width
	getWidth(){
		return this.element.offsetWidth;
	}

	//////////////// Cell Management /////////////////
	deleteCell(cell){
		var index = this.cells.indexOf(cell);

		if(index > -1){
			this.cells.splice(index, 1);
		}
	}

	//////////////// Data Management /////////////////
	setData(data){
		if(this.table.modExists("mutator")){
			data = this.table.modules.mutator.transformRow(data, "data");
		}

		this.data = data;

		if(this.table.options.reactiveData && this.table.modExists("reactiveData", true)){
			this.table.modules.reactiveData.watchRow(this);
		}
	}

	//update the rows data
	updateData(updatedData){
		var visible = this.element && Tabulator.prototype.helpers.elVisible(this.element),
		tempData = {},
		newRowData;

		return new Promise((resolve, reject) => {

			if(typeof updatedData === "string"){
				updatedData = JSON.parse(updatedData);
			}

			if(this.table.options.reactiveData && this.table.modExists("reactiveData", true)){
				this.table.modules.reactiveData.block();
			}

			//mutate incomming data if needed
			if(this.table.modExists("mutator")){

				tempData = Object.assign(tempData, this.data);
				tempData = Object.assign(tempData, updatedData);

				newRowData = this.table.modules.mutator.transformRow(tempData, "data", updatedData);
			}else{
				newRowData = updatedData;
			}

			//set data
			for (var attrname in newRowData) {
				this.data[attrname] = newRowData[attrname];
			}

			if(this.table.options.reactiveData && this.table.modExists("reactiveData", true)){
				this.table.modules.reactiveData.unblock();
			}

			//update affected cells only
			for (var attrname in updatedData) {

				let columns = this.table.columnManager.getColumnsByFieldRoot(attrname);

				columns.forEach((column) => {
					let cell = this.getCell(column.getField());

					if(cell){
						let value = column.getFieldValue(newRowData);
						if(cell.getValue() != value){
							cell.setValueProcessData(value);

							if(visible){
								cell.cellRendered();
							}
						}
					}
				});
			}

			if(this.table.options.groupUpdateOnCellEdit && this.table.options.groupBy && this.table.modExists("groupRows")) {
				this.table.modules.groupRows.reassignRowToGroup(this.row);
			}

			//Partial reinitialization if visible
			if(visible){
				this.normalizeHeight(true);

				if(this.table.options.rowFormatter){
					this.table.options.rowFormatter(this.getComponent());
				}
			}else{
				this.initialized = false;
				this.height = 0;
				this.heightStyled = "";
			}

			if(this.table.options.dataTree !== false && this.table.modExists("dataTree") && this.table.modules.dataTree.redrawNeeded(updatedData)){
				this.table.modules.dataTree.initializeRow(this);

				if(visible){
					this.table.modules.dataTree.layoutRow(this);
					this.table.rowManager.refreshActiveData("tree", false, true);
				}
			}


			//this.reinitialize();

			this.table.options.rowUpdated.call(this.table, this.getComponent());

			if(this.table.options.dataChanged){
				this.table.options.dataChanged.call(this.table, this.table.rowManager.getData());
			}

			resolve();
		});
	}

	getData(transform){
		if(transform){
			if(this.table.modExists("accessor")){
				return this.table.modules.accessor.transformRow(this, transform);
			}
		}

		return this.data;
	}

	getCell(column){
		var match = false;

		column = this.table.columnManager.findColumn(column);

		match = this.cells.find(function(cell){
			return cell.column === column;
		});

		return match;
	}

	getCellIndex(findCell){
		return this.cells.findIndex(function(cell){
			return cell === findCell;
		});
	}

	findNextEditableCell(index){
		var nextCell = false;

		if(index < this.cells.length-1){
			for(var i = index+1; i < this.cells.length; i++){
				let cell = this.cells[i];

				if(cell.column.modules.edit && Tabulator.prototype.helpers.elVisible(cell.getElement())){
					let allowEdit = true;

					if(typeof cell.column.modules.edit.check == "function"){
						allowEdit = cell.column.modules.edit.check(cell.getComponent());
					}

					if(allowEdit){
						nextCell = cell;
						break;
					}
				}
			}
		}

		return nextCell;
	}

	findPrevEditableCell(index){
		var prevCell = false;

		if(index > 0){
			for(var i = index-1; i >= 0; i--){
				let cell = this.cells[i],
				allowEdit = true;

				if(cell.column.modules.edit && Tabulator.prototype.helpers.elVisible(cell.getElement())){
					if(typeof cell.column.modules.edit.check == "function"){
						allowEdit = cell.column.modules.edit.check(cell.getComponent());
					}

					if(allowEdit){
						prevCell = cell;
						break;
					}
				}
			}
		}

		return prevCell;
	}

	getCells(){
		return this.cells;
	}

	nextRow(){
		var row = this.table.rowManager.nextDisplayRow(this, true);
		return row || false;
	}

	prevRow(){
		var row = this.table.rowManager.prevDisplayRow(this, true);
		return row || false;
	}

	moveToRow(to, before){
		var toRow = this.table.rowManager.findRow(to);

		if(toRow){
			this.table.rowManager.moveRowActual(this, toRow, !before);
			this.table.rowManager.refreshActiveData("display", false, true);
		}else{
			console.warn("Move Error - No matching row found:", to);
		}
	}

	validate(){
		var invalid = [];

		this.cells.forEach(function(cell){
			if(!cell.validate()){
				invalid.push(cell.getComponent());
			}
		});

		return invalid.length ? invalid : true;
	}

	///////////////////// Actions  /////////////////////
	delete(){
		return new Promise((resolve, reject) => {
			var index, rows;

			if(this.table.options.history && this.table.modExists("history")){

				if(this.table.options.groupBy && this.table.modExists("groupRows")){
					rows = this.getGroup().rows
					index = rows.indexOf(this);

					if(index){
						index = rows[index-1];
					}
				}else{
					index = this.table.rowManager.getRowIndex(this);

					if(index){
						index = this.table.rowManager.rows[index-1];
					}
				}

				this.table.modules.history.action("rowDelete", this, {data:this.getData(), pos:!index, index:index});
			}

			this.deleteActual();

			resolve();
		});
	}

	deleteActual(blockRedraw){
		var index = this.table.rowManager.getRowIndex(this);

		this.detatchModules();

		// if(this.table.options.dataTree && this.table.modExists("dataTree")){
		// 	this.table.modules.dataTree.collapseRow(this, true);
		// }

		//remove any reactive data watchers from row object
		if(this.table.options.reactiveData && this.table.modExists("reactiveData", true)){
			// this.table.modules.reactiveData.unwatchRow(this);
		}

		//remove from group
		if(this.modules.group){
			this.modules.group.removeRow(this);
		}

		this.table.rowManager.deleteRow(this, blockRedraw);

		this.deleteCells();

		this.initialized = false;
		this.heightInitialized = false;
		this.element = false;

		if(this.table.options.dataTree && this.table.modExists("dataTree", true)){
			this.table.modules.dataTree.rowDelete(this);
		}

		//recalc column calculations if present
		if(this.table.modExists("columnCalcs")){
			if(this.table.options.groupBy && this.table.modExists("groupRows")){
				this.table.modules.columnCalcs.recalcRowGroup(this);
			}else{
				this.table.modules.columnCalcs.recalc(this.table.rowManager.activeRows);
			}
		}
	}

	detatchModules(){
		//deselect row if it is selected
		if(this.table.modExists("selectRow")){
			this.table.modules.selectRow._deselectRow(this, true);
		}

		//cancel edit if row is currently being edited
		if(this.table.modExists("edit")){
			if(this.table.modules.edit.currentCell.row === this){
				this.table.modules.edit.cancelEdit();
			}
		}

		if(this.table.modExists("frozenRows")){
			this.table.modules.frozenRows.detachRow(this);
		}
	}

	deleteCells(){
		var cellCount = this.cells.length;

		for(let i = 0; i < cellCount; i++){
			this.cells[0].delete();
		}
	}

	wipe(){
		this.detatchModules();
		this.deleteCells();

		if(this.element){
			while(this.element.firstChild) this.element.removeChild(this.element.firstChild);

			if(this.element.parentNode){
				this.element.parentNode.removeChild(this.element);
			}
		}

		this.element = false;
		this.modules = {};
	}

	getGroup(){
		return this.modules.group || false;
	}

	//////////////// Object Generation /////////////////
	getComponent(){
		if(!this.component){
			this.component = new RowComponent(this);
		}

		return this.component;
	}
}