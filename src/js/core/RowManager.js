import Row from './row/Row.js';
import Helpers from './Helpers.js';

export default class RowManager {

	constructor(table){
		this.table = table;
		this.element = this.createHolderElement(); //containing element
		this.tableElement = this.createTableElement(); //table element
		this.heightFixer = this.createTableElement(); //table element
		this.columnManager = null; //hold column manager object
		this.height = 0; //hold height of table element

		this.firstRender = false; //handle first render
		this.renderMode = "virtual"; //current rendering mode
		this.fixedHeight = false; //current rendering mode

		this.rows = []; //hold row data objects
		this.activeRows = []; //rows currently available to on display in the table
		this.activeRowsCount = 0; //count of active rows

		this.displayRows = []; //rows currently on display in the table
		this.displayRowsCount = 0; //count of display rows

		this.scrollTop = 0;
		this.scrollLeft = 0;

		this.vDomRowHeight = 20; //approximation of row heights for padding

		this.vDomTop = 0; //hold position for first rendered row in the virtual DOM
		this.vDomBottom = 0; //hold possition for last rendered row in the virtual DOM

		this.vDomScrollPosTop = 0; //last scroll position of the vDom top;
		this.vDomScrollPosBottom = 0; //last scroll position of the vDom bottom;

		this.vDomTopPad = 0; //hold value of padding for top of virtual DOM
		this.vDomBottomPad = 0; //hold value of padding for bottom of virtual DOM

		this.vDomMaxRenderChain = 90; //the maximum number of dom elements that can be rendered in 1 go

		this.vDomWindowBuffer = 0; //window row buffer before removing elements, to smooth scrolling

		this.vDomWindowMinTotalRows = 20; //minimum number of rows to be generated in virtual dom (prevent buffering issues on tables with tall rows)
		this.vDomWindowMinMarginRows = 5; //minimum number of rows to be generated in virtual dom margin

		this.vDomTopNewRows = []; //rows to normalize after appending to optimize render speed
		this.vDomBottomNewRows = []; //rows to normalize after appending to optimize render speed

		this.rowNumColumn = false; //hold column component for row number column

		this.redrawBlock = false; //prevent redraws to allow multiple data manipulations becore continuing
		this.redrawBlockRestoreConfig = false; //store latest redraw function calls for when redraw is needed
		this.redrawBlockRederInPosition = false; //store latest redraw function calls for when redraw is needed

		this._bindEvents();

	}

	//////////////// Setup Functions /////////////////

	_bindEvents(){

	}

	createHolderElement (){
		var el = document.createElement("div");

		el.classList.add("tabulator-tableHolder");
		el.setAttribute("tabindex", 0);

		return el;
	}

	createTableElement (){
		var el = document.createElement("div");

		el.classList.add("tabulator-table");

		return el;
	}

	//return containing element
	getElement(){
		return this.element;
	}

	//return table element
	getTableElement(){
		return this.tableElement;
	}

	//return position of row in table
	getRowPosition(row, active){
		if(active){
			return this.activeRows.indexOf(row);
		}else{
			return this.rows.indexOf(row);
		}
	}

	//link to column manager
	setColumnManager(manager){
		this.columnManager = manager;
	}

	initialize(){
		this.setRenderMode();

		//initialize manager
		this.element.appendChild(this.tableElement);

		this.firstRender = true;

		//scroll header along with table body
		this.element.addEventListener("scroll", () => {
			var left = this.element.scrollLeft,
			leftDir = this.scrollLeft > left,
			top = this.element.scrollTop,
			topDir = this.scrollTop > top;

			//handle horizontal scrolling
			if(this.scrollLeft != left){
				this.scrollLeft = left;

				this.table.eventBus.dispatch("scroll-horizontal", left, leftDir);
				this.table.externalEvents.dispatch("scrollHorizontal", left, leftDir);
			}

			//handle verical scrolling
			if(this.scrollTop != top){
				this.scrollTop = top;

				this.table.eventBus.dispatch("scroll-vertical", top, topDir);
				this.table.externalEvents.dispatch("scrollVertical", top, topDir);
			}
		});
	}

	////////////////// Row Manipulation //////////////////
	findRow(subject){
		if(typeof subject == "object"){
			if(subject instanceof Row){
				//subject is row element
				return subject;
			}else if(subject instanceof RowComponent){
				//subject is public row component
				return subject._getSelf() || false;
			}else if(typeof HTMLElement !== "undefined" && subject instanceof HTMLElement){
				//subject is a HTML element of the row
				let match = this.rows.find((row) => {
					return row.getElement() === subject;
				});

				return match || false;
			}
		}else if(typeof subject == "undefined" || subject === null){
			return false;
		}else{
			//subject should be treated as the index of the row
			let match = this.rows.find((row) => {
				return row.data[this.table.options.index] == subject;
			});

			return match || false;
		}

		//catch all for any other type of input
		return false;
	}

	getRowFromDataObject(data){
		var match = this.rows.find((row) => {
			return row.data === data;
		});

		return match || false;
	}

	getRowFromPosition(position, active){
		if(active){
			return this.activeRows[position];
		}else{
			return this.rows[position];
		}
	}

	scrollToRow(row, position, ifVisible){
		var rowIndex = this.getDisplayRows().indexOf(row),
		rowEl = row.getElement(),
		rowTop,
		offset = 0;

		return new Promise((resolve, reject) => {
			if(rowIndex > -1){

				if(typeof position === "undefined"){
					position = this.table.options.scrollToRowPosition;
				}

				if(typeof ifVisible === "undefined"){
					ifVisible = this.table.options.scrollToRowIfVisible;
				}


				if(position === "nearest"){
					switch(this.renderMode){
						case"classic":
						rowTop = Helpers.elOffset(rowEl).top;
						position = Math.abs(this.element.scrollTop - rowTop) > Math.abs(this.element.scrollTop + this.element.clientHeight - rowTop) ? "bottom" : "top";
						break;
						case"virtual":
						position = Math.abs(this.vDomTop - rowIndex) > Math.abs(this.vDomBottom - rowIndex) ? "bottom" : "top";
						break;
					}
				}

				//check row visibility
				if(!ifVisible){
					if(Helpers.elVisible(rowEl)){
						offset = Helpers.elOffset(rowEl).top - Helpers.elOffset(this.element).top;

						if(offset > 0 && offset < this.element.clientHeight - rowEl.offsetHeight){
							return false;
						}
					}
				}

				//scroll to row
				switch(this.renderMode){
					case"classic":
					this.element.scrollTop = Helpers.elOffset(rowEl).top - Helpers.elOffset(this.element).top + this.element.scrollTop;
					break;
					case"virtual":
					this._virtualRenderFill(rowIndex, true);
					break;
				}

				//align to correct position
				switch(position){
					case "middle":
					case "center":

					if(this.element.scrollHeight - this.element.scrollTop == this.element.clientHeight){
						this.element.scrollTop = this.element.scrollTop + (rowEl.offsetTop - this.element.scrollTop) - ((this.element.scrollHeight - rowEl.offsetTop) / 2);
					}else{
						this.element.scrollTop = this.element.scrollTop - (this.element.clientHeight / 2);
					}

					break;

					case "bottom":

					if(this.element.scrollHeight - this.element.scrollTop == this.element.clientHeight){
						this.element.scrollTop = this.element.scrollTop - (this.element.scrollHeight - rowEl.offsetTop) + rowEl.offsetHeight;
					}else{
						this.element.scrollTop = this.element.scrollTop - this.element.clientHeight + rowEl.offsetHeight;
					}

					break;
				}

				resolve();

			}else{
				console.warn("Scroll Error - Row not visible");
				reject("Scroll Error - Row not visible");
			}
		});
	}

	////////////////// Data Handling //////////////////
	setData(data, renderInPosition, columnsChanged){
		return new Promise((resolve, reject)=>{
			if(renderInPosition && this.getDisplayRows().length){
				if(this.table.options.pagination){
					this._setDataActual(data, true);
				}else{
					this.reRenderInPosition(() => {
						this._setDataActual(data);
					});
				}
			}else{
				if(this.table.options.autoColumns && columnsChanged){
					this.table.columnManager.generateColumnsFromRowData(data);
				}
				this.resetScroll();

				this._setDataActual(data);

			}

			resolve();
		});
	}

	_setDataActual(data, renderInPosition){
		this.table.externalEvents.dispatch("dataLoading", data);

		this._wipeElements();

		if(Array.isArray(data)){

			if(this.table.modExists("selectRow")){
				this.table.modules.selectRow.clearSelectionData();
			}

			if(this.table.options.reactiveData && this.table.modExists("reactiveData", true)){
				this.table.modules.reactiveData.watchData(data);
			}

			data.forEach((def, i) => {
				if(def && typeof def === "object"){
					var row = new Row(def, this);
					this.rows.push(row);
				}else{
					console.warn("Data Loading Warning - Invalid row data detected and ignored, expecting object but received:", def);
				}
			});

			this.refreshActiveData(false, false, renderInPosition);

			this.table.externalEvents.dispatch("dataLoaded", data);
		}else{
			console.error("Data Loading Error - Unable to process data due to invalid data type \nExpecting: array \nReceived: ", typeof data, "\nData:     ", data);
		}
	}

	_wipeElements(){
		this.table.eventBus.dispatch("rows-wipe");

		this.rows.forEach((row) => {
			row.wipe();
		});

		this.rows = [];
		this.activeRows = [];
		this.activeRowsCount = 0;
		this.displayRows = [];
		this.displayRowsCount = 0;

		this.adjustTableSize();
	}

	deleteRow(row, blockRedraw){
		var allIndex = this.rows.indexOf(row),
		activeIndex = this.activeRows.indexOf(row);

		if(activeIndex > -1){
			this.activeRows.splice(activeIndex, 1);
		}

		if(allIndex > -1){
			this.rows.splice(allIndex, 1);
		}

		this.setActiveRows(this.activeRows);

		this.displayRowIterator((rows) => {
			var displayIndex = rows.indexOf(row);

			if(displayIndex > -1){
				rows.splice(displayIndex, 1);
			}
		});

		if(!blockRedraw){
			this.reRenderInPosition();
		}

		this.regenerateRowNumbers();

		this.table.externalEvents.dispatch("rowDeleted", row.getComponent());

		if(this.table.externalEvents.subscribed("dataChanged")){
			this.table.externalEvents.dispatch("dataChanged", this.getData());
		}
	}

	addRow(data, pos, index, blockRedraw){
		var row = this.addRowActual(data, pos, index, blockRedraw);

		this.table.eventBus.dispatch("row-added", row, data, pos, index);

		return row;
	}

	//add multiple rows
	addRows(data, pos, index){
		var length = 0,
		rows = [];

		return new Promise((resolve, reject) => {
			pos = this.findAddRowPos(pos);

			if(!Array.isArray(data)){
				data = [data];
			}

			length = data.length - 1;

			if((typeof index == "undefined" && pos) || (typeof index !== "undefined" && !pos)){
				data.reverse();
			}

			data.forEach((item, i) => {
				var row = this.addRow(item, pos, index, true);
				rows.push(row);
			});

			if(this.table.eventBus.subscribed("row-added")){
				this.table.eventBus.dispatch("row-added", row, data, pos, index);
			}else{
				this.reRenderInPosition();
			}

			this.regenerateRowNumbers();

			resolve(rows);
		});
	}

	findAddRowPos(pos){
		if(typeof pos === "undefined"){
			pos = this.table.options.addRowPos;
		}

		if(pos === "pos"){
			pos = true;
		}

		if(pos === "bottom"){
			pos = false;
		}

		return pos;
	}

	addRowActual(data, pos, index, blockRedraw){
		var row = data instanceof Row ? data : new Row(data || {}, this),
		top = this.findAddRowPos(pos),
		allIndex = -1,
		activeIndex, dispRows;

		if(!index && this.table.options.pagination && this.table.options.paginationAddRow == "page"){
			dispRows = this.getDisplayRows();

			if(top){
				if(dispRows.length){
					index = dispRows[0];
				}else{
					if(this.activeRows.length){
						index = this.activeRows[this.activeRows.length-1];
						top = false;
					}
				}
			}else{
				if(dispRows.length){
					index = dispRows[dispRows.length - 1];
					top = dispRows.length < this.table.modules.page.getPageSize() ? false : true;
				}
			}
		}

		if(typeof index !== "undefined"){
			index = this.findRow(index);
		}

		if(this.table.options.groupBy && this.table.modExists("groupRows")){
			this.table.modules.groupRows.assignRowToGroup(row);

			var groupRows = row.getGroup().rows;

			if(groupRows.length > 1){

				if(!index || (index && groupRows.indexOf(index) == -1)){
					if(top){
						if(groupRows[0] !== row){
							index = groupRows[0];
							this._moveRowInArray(row.getGroup().rows, row, index, !top);
						}
					}else{
						if(groupRows[groupRows.length -1] !== row){
							index = groupRows[groupRows.length -1];
							this._moveRowInArray(row.getGroup().rows, row, index, !top);
						}
					}
				}else{
					this._moveRowInArray(row.getGroup().rows, row, index, !top);
				}
			}
		}

		if(index){
			allIndex = this.rows.indexOf(index);
		}

		if(index && allIndex > -1){
			activeIndex = this.activeRows.indexOf(index);

			this.displayRowIterator(function(rows){
				var displayIndex = rows.indexOf(index);

				if(displayIndex > -1){
					rows.splice((top ? displayIndex : displayIndex + 1), 0, row);
				}
			});

			if(activeIndex > -1){
				this.activeRows.splice((top ? activeIndex : activeIndex + 1), 0, row);
			}

			this.rows.splice((top ? allIndex : allIndex + 1), 0, row);

		}else{

			if(top){

				this.displayRowIterator(function(rows){
					rows.unshift(row);
				});

				this.activeRows.unshift(row);
				this.rows.unshift(row);
			}else{
				this.displayRowIterator(function(rows){
					rows.push(row);
				});

				this.activeRows.push(row);
				this.rows.push(row);
			}
		}

		this.setActiveRows(this.activeRows);

		this.table.externalEvents.dispatch("rowAdded", row.getComponent());

		if(this.table.externalEvents.subscribed("dataChanged")){
			this.table.externalEvents.dispatch("dataChanged", this.table.rowManager.getData());
		}

		if(!blockRedraw){
			this.reRenderInPosition();
		}

		return row;
	}

	moveRow(from, to, after){
		this.table.eventBus.dispatch("row-move", from, to, after);

		this.moveRowActual(from, to, after);

		this.regenerateRowNumbers();

		this.table.eventBus.dispatch("row-moved", from, to, after);
		this.table.externalEvents.dispatch("rowMoved", from.getComponent());
	}

	moveRowActual(from, to, after){
		this._moveRowInArray(this.rows, from, to, after);
		this._moveRowInArray(this.activeRows, from, to, after);

		this.displayRowIterator((rows) => {
			this._moveRowInArray(rows, from, to, after);
		});

		this.table.eventBus.dispatch("row-moving", from, to, after);
	}

	_moveRowInArray(rows, from, to, after){
		var	fromIndex, toIndex, start, end;

		if(from !== to){

			fromIndex = rows.indexOf(from);

			if (fromIndex > -1) {

				rows.splice(fromIndex, 1);

				toIndex = rows.indexOf(to);

				if (toIndex > -1) {

					if(after){
						rows.splice(toIndex+1, 0, from);
					}else{
						rows.splice(toIndex, 0, from);
					}

				}else{
					rows.splice(fromIndex, 0, from);
				}
			}

			//restyle rows
			if(rows === this.getDisplayRows()){

				start = fromIndex < toIndex ? fromIndex : toIndex;
				end = toIndex > fromIndex ? toIndex : fromIndex +1;

				for(let i = start; i <= end; i++){
					if(rows[i]){
						this.styleRow(rows[i], i);
					}
				}
			}
		}
	}

	clearData(){
		this.setData([]);
	}

	getRowIndex(row){
		return this.findRowIndex(row, this.rows);
	}

	getDisplayRowIndex(row){
		var index = this.getDisplayRows().indexOf(row);
		return index > -1 ? index : false;
	}

	nextDisplayRow(row, rowOnly){
		var index = this.getDisplayRowIndex(row),
		nextRow = false;


		if(index !== false && index < this.displayRowsCount -1){
			nextRow = this.getDisplayRows()[index+1];
		}

		if(nextRow && (!(nextRow instanceof Row) || nextRow.type != "row")){
			return this.nextDisplayRow(nextRow, rowOnly);
		}

		return nextRow;
	}

	prevDisplayRow(row, rowOnly){
		var index = this.getDisplayRowIndex(row),
		prevRow = false;

		if(index){
			prevRow = this.getDisplayRows()[index-1];
		}

		if(rowOnly && prevRow && (!(prevRow instanceof Row) || prevRow.type != "row")){
			return this.prevDisplayRow(prevRow, rowOnly);
		}

		return prevRow;
	}

	findRowIndex(row, list){
		var rowIndex;

		row = this.findRow(row);

		if(row){
			rowIndex = list.indexOf(row);

			if(rowIndex > -1){
				return rowIndex;
			}
		}

		return false;
	}

	getData(active, transform){
		var output = [],
		rows = this.getRows(active);

		rows.forEach(function(row){
			if(row.type == "row"){
				output.push(row.getData(transform || "data"));
			}
		});

		return output;
	}

	getComponents(active){
		var	output = [],
		rows = this.getRows(active);

		rows.forEach(function(row){
			output.push(row.getComponent());
		});

		return output;
	}

	getDataCount(active){
		var rows = this.getRows(active);

		return rows.length;
	}

	_genRemoteRequest(){
		var table = this.table,
		options = table.options,
		params = {};

		if(table.modExists("page")){
			//set sort data if defined
			if(options.ajaxSorting){
				let sorters = this.table.modules.sort.getSort();

				sorters.forEach(function(item){
					delete item.column;
				});

				params[this.table.modules.page.paginationDataSentNames.sorters] = sorters;
			}

			//set filter data if defined
			if(options.ajaxFiltering){
				let filters = this.table.modules.filter.getFilters(true, true);

				params[this.table.modules.page.paginationDataSentNames.filters] = filters;
			}


			this.table.modules.ajax.setParams(params, true);
		}

		table.modules.ajax.sendRequest()
		.then((data)=>{
			this._setDataActual(data, true);
		})
		.catch((e)=>{});
	}

	//choose the path to refresh data after a filter update
	filterRefresh(){
		var table = this.table,
		options = table.options,
		left = this.scrollLeft;

		if(options.ajaxFiltering){
			if(options.pagination == "remote" && table.modExists("page")){
				table.modules.page.reset(true);
				table.modules.page.setPage(1).then(()=>{}).catch(()=>{});
			}else if(options.ajaxProgressiveLoad){
				table.modules.ajax.loadData().then(()=>{}).catch(()=>{});
			}else{
				//assume data is url, make ajax call to url to get data
				this._genRemoteRequest();
			}
		}else{
			this.refreshActiveData("filter");
		}

		this.scrollHorizontal(left);
	}

	//choose the path to refresh data after a sorter update
	sorterRefresh(loadOrignalData){
		var table = this.table,
		options = this.table.options,
		left = this.scrollLeft;

		if(options.ajaxSorting){
			if((options.pagination == "remote" || options.progressiveLoad) && table.modExists("page")){
				table.modules.page.reset(true);
				table.modules.page.setPage(1).then(()=>{}).catch(()=>{});
			}else if(options.ajaxProgressiveLoad){
				table.modules.ajax.loadData().then(()=>{}).catch(()=>{});
			}else{
				//assume data is url, make ajax call to url to get data
				this._genRemoteRequest();
			}
		}else{
			this.refreshActiveData(loadOrignalData ? "filter" : "sort");
		}

		this.scrollHorizontal(left);
	}

	scrollHorizontal(left){
		this.scrollLeft = left;
		this.element.scrollLeft = left;

		if(this.table.options.groupBy){
			this.table.modules.groupRows.scrollHeaders(left);
		}

		if(this.table.modExists("columnCalcs")){
			this.table.modules.columnCalcs.scrollHorizontal(left);
		}
	}

	//set active data set
	refreshActiveData(stage, skipStage, renderInPosition){
		var table = this.table,
		cascadeOrder = ["all", "filter", "sort", "display", "freeze", "group", "tree", "page"],
		displayIndex;

		if(this.redrawBlock){

			if(!this.redrawBlockRestoreConfig || (cascadeOrder.indexOf(stage) < cascadeOrder.indexOf(this.redrawBlockRestoreConfig.stage))){
				this.redrawBlockRestoreConfig = {
					stage: stage,
					skipStage: skipStage,
					renderInPosition: renderInPosition,
				};
			}

			return;
		}else{

			if(this.table.modExists("edit")){
				this.table.modules.edit.cancelEdit();
			}

			if(!stage){
				stage = "all";
			}

			if(table.options.selectable && !table.options.selectablePersistence && table.modExists("selectRow")){
				table.modules.selectRow.deselectRows();
			}

			//cascade through data refresh stages
			switch(stage){
				case "all":

				case "filter":
				if(!skipStage){
					if(table.modExists("filter")){
						this.setActiveRows(table.modules.filter.filter(this.rows));
					}else{
						this.setActiveRows(this.rows.slice(0));
					}
				}else{
					skipStage = false;
				}

				case "sort":
				if(!skipStage){
					if(table.modExists("sort")){
						table.modules.sort.sort(this.activeRows);
					}
				}else{
					skipStage = false;
				}

				//regenerate row numbers for row number formatter if in use
				this.regenerateRowNumbers();

				//generic stage to allow for pipeline trigger after the data manipulation stage
				case "display":
				this.resetDisplayRows();

				case "freeze":
				if(!skipStage){
					if(this.table.modExists("frozenRows")){
						if(table.modules.frozenRows.isFrozen()){
							if(!table.modules.frozenRows.getDisplayIndex()){
								table.modules.frozenRows.setDisplayIndex(this.getNextDisplayIndex());
							}

							displayIndex = table.modules.frozenRows.getDisplayIndex();

							displayIndex = this.setDisplayRows(table.modules.frozenRows.getRows(this.getDisplayRows(displayIndex - 1)), displayIndex);

							if(displayIndex !== true){
								table.modules.frozenRows.setDisplayIndex(displayIndex);
							}
						}
					}
				}else{
					skipStage = false;
				}

				case "group":
				if(!skipStage){
					if(table.options.groupBy && table.modExists("groupRows")){

						if(!table.modules.groupRows.getDisplayIndex()){
							table.modules.groupRows.setDisplayIndex(this.getNextDisplayIndex());
						}

						displayIndex = table.modules.groupRows.getDisplayIndex();

						displayIndex = this.setDisplayRows(table.modules.groupRows.getRows(this.getDisplayRows(displayIndex - 1)), displayIndex);

						if(displayIndex !== true){
							table.modules.groupRows.setDisplayIndex(displayIndex);
						}
					}
				}else{
					skipStage = false;
				}

				case "tree":

				if(!skipStage){
					if(table.options.dataTree && table.modExists("dataTree")){
						if(!table.modules.dataTree.getDisplayIndex()){
							table.modules.dataTree.setDisplayIndex(this.getNextDisplayIndex());
						}

						displayIndex = table.modules.dataTree.getDisplayIndex();

						displayIndex = this.setDisplayRows(table.modules.dataTree.getRows(this.getDisplayRows(displayIndex - 1)), displayIndex);

						if(displayIndex !== true){
							table.modules.dataTree.setDisplayIndex(displayIndex);
						}
					}
				}else{
					skipStage = false;
				}

				if(table.options.pagination && table.modExists("page") && !renderInPosition){
					if(table.modules.page.getMode() == "local"){
						table.modules.page.reset();
					}
				}

				case "page":
				if(!skipStage){
					if(table.options.pagination && table.modExists("page")){

						if(!table.modules.page.getDisplayIndex()){
							table.modules.page.setDisplayIndex(this.getNextDisplayIndex());
						}

						displayIndex = table.modules.page.getDisplayIndex();

						if(table.modules.page.getMode() == "local"){
							table.modules.page.setMaxRows(this.getDisplayRows(displayIndex - 1).length);
						}


						displayIndex = this.setDisplayRows(table.modules.page.getRows(this.getDisplayRows(displayIndex - 1)), displayIndex);

						if(displayIndex !== true){
							table.modules.page.setDisplayIndex(displayIndex);
						}
					}
				}else{
					skipStage = false;
				}
			}


			if(Helpers.elVisible(this.element)){
				if(renderInPosition){
					this.reRenderInPosition();
				}else{

					if(stage === "all" && this.table.options.virtualDomHoz){
						this.table.vdomHoz.dataChange();
					}

					this.renderTable();

					if(table.options.layoutColumnsOnNewData){
						this.table.columnManager.redraw(true);
					}
				}
			}

			if(table.modExists("columnCalcs")){
				table.modules.columnCalcs.recalc(this.activeRows);
			}
		}
	}

	//regenerate row numbers for row number formatter if in use
	regenerateRowNumbers(){
		if(this.rowNumColumn){
			this.activeRows.forEach((row) => {
				var cell = row.getCell(this.rowNumColumn);

				if(cell){
					cell._generateContents();
				}
			});
		}
	}

	setActiveRows(activeRows){
		this.activeRows = activeRows;
		this.activeRowsCount = this.activeRows.length;
	}

	//reset display rows array
	resetDisplayRows(){
		this.displayRows = [];

		this.displayRows.push(this.activeRows.slice(0));

		this.displayRowsCount = this.displayRows[0].length;

		if(this.table.modExists("frozenRows")){
			this.table.modules.frozenRows.setDisplayIndex(0);
		}

		if(this.table.options.groupBy && this.table.modExists("groupRows")){
			this.table.modules.groupRows.setDisplayIndex(0);
		}

		if(this.table.options.pagination && this.table.modExists("page")){
			this.table.modules.page.setDisplayIndex(0);
		}
	}

	getNextDisplayIndex(){
		return this.displayRows.length;
	}

	//set display row pipeline data
	setDisplayRows(displayRows, index){

		var output = true;

		if(index && typeof this.displayRows[index] != "undefined"){
			this.displayRows[index] = displayRows;
			output = true;
		}else{
			this.displayRows.push(displayRows)
			output = index = this.displayRows.length -1;
		}

		if(index == this.displayRows.length -1){
			this.displayRowsCount = this.displayRows[this.displayRows.length -1].length;
		}

		return output;
	}

	getDisplayRows(index){
		if(typeof index == "undefined"){
			return this.displayRows.length ? this.displayRows[this.displayRows.length -1] : [];
		}else{
			return this.displayRows[index] || [];
		}

	}

	getVisibleRows(viewable){
		var topEdge = this.element.scrollTop,
		bottomEdge = this.element.clientHeight + topEdge,
		topFound = false,
		topRow = 0,
		bottomRow = 0,
		rows = this.getDisplayRows();

		if(viewable){

			this.getDisplayRows();
			for(var i = this.vDomTop; i <= this.vDomBottom; i++){
				if(rows[i]){
					if(!topFound){
						if((topEdge - rows[i].getElement().offsetTop) >= 0){
							topRow = i;
						}else{
							topFound = true;

							if(bottomEdge - rows[i].getElement().offsetTop >= 0){
								bottomRow = i;
							}else{
								break;
							}
						}
					}else{
						if(bottomEdge - rows[i].getElement().offsetTop >= 0){
							bottomRow = i;
						}else{
							break;
						}
					}
				}
			}
		}else{
			topRow = this.vDomTop;
			bottomRow = this.vDomBottom;
		}

		return rows.slice(topRow, bottomRow + 1);
	}

	//repeat action accross display rows
	displayRowIterator(callback){
		this.displayRows.forEach(callback);

		this.displayRowsCount = this.displayRows[this.displayRows.length -1].length;
	}

	//return only actual rows (not group headers etc)
	getRows(active){
		var rows;

		switch(active){
			case "active":
			rows = this.activeRows;
			break;

			case "display":
			rows = this.table.rowManager.getDisplayRows();
			break;

			case "visible":
			rows = this.getVisibleRows(true);
			break;

			case "selected":
			rows = this.table.modules.selectRow.selectedRows;
			break;

			default:
			rows = this.rows;
		}

		return rows;
	}

	///////////////// Table Rendering /////////////////
	//trigger rerender of table in current position
	reRenderInPosition(callback){
		if(this.getRenderMode() == "virtual"){

			if(this.redrawBlock){
				if(callback){
					callback();
				}else{
					this.redrawBlockRederInPosition = true;
				}
			}else{
				var scrollTop = this.element.scrollTop;
				var topRow = false;
				var topOffset = false;

				var left = this.scrollLeft;

				var rows = this.getDisplayRows();

				for(var i = this.vDomTop; i <= this.vDomBottom; i++){

					if(rows[i]){
						var diff = scrollTop - rows[i].getElement().offsetTop;

						if(topOffset === false || Math.abs(diff) < topOffset){
							topOffset = diff;
							topRow = i;
						}else{
							break;
						}
					}
				}

				if(callback){
					callback();
				}

				this._virtualRenderFill((topRow === false ? this.displayRowsCount - 1 : topRow), true, topOffset || 0);

				this.scrollHorizontal(left);
			}
		}else{
			this.renderTable();

			if(callback){
				callback();
			}
		}
	}

	setRenderMode(){
		if(this.table.options.virtualDom){
			this.renderMode = "virtual";

			if((this.table.element.clientHeight || this.table.options.height)){
				this.fixedHeight = true;
			}else{
				this.fixedHeight = false;
			}

			if(!this.table.eventBus.subscribed("scroll-vertical")){
				this.table.eventBus.subscribe("scroll-vertical", this.scrollVertical.bind(this));
			}

		}else{
			this.renderMode = "classic";
			if(this.table.eventBus.subscribed("scroll-vertical")){
				this.unsubscribe("scroll-vertical", this.scrollVertical.bind(this));
			}
		}
	}

	getRenderMode(){
		return this.renderMode;
	}

	renderTable(){

		this.table.externalEvents.dispatch("renderStarted");

		this.element.scrollTop = 0;

		switch(this.renderMode){
			case "classic":
			this._simpleRender();
			break;

			case "virtual":
			this._virtualRenderFill();
			break;
		}

		if(this.firstRender){
			if(this.displayRowsCount){
				this.firstRender = false;
				this.table.modules.layout.layout();
			}else{
				this.renderEmptyScroll();
			}
		}

		if(this.table.modExists("frozenColumns")){
			this.table.modules.frozenColumns.layout();
		}

		if(!this.displayRowsCount){
			if(this.table.options.placeholder){

				this.table.options.placeholder.setAttribute("tabulator-render-mode", this.renderMode);

				this.getElement().appendChild(this.table.options.placeholder);
				this.table.options.placeholder.style.width = this.table.columnManager.getWidth() + "px";
			}
		}

		this.table.externalEvents.dispatch("renderComplete");
	}

	//simple render on heightless table
	_simpleRender(){
		this._clearVirtualDom();

		if(this.displayRowsCount){
			this.checkClassicModeGroupHeaderWidth();
		}else{
			this.renderEmptyScroll();
		}
	}

	checkClassicModeGroupHeaderWidth(){
		var element = this.tableElement,
		onlyGroupHeaders = true;

		this.getDisplayRows().forEach((row, index) => {
			this.styleRow(row, index);
			element.appendChild(row.getElement());
			row.initialize(true);

			if(row.type !== "group"){
				onlyGroupHeaders = false;
			}
		});

		if(onlyGroupHeaders){
			element.style.minWidth = this.table.columnManager.getWidth() + "px";
		}else{
			element.style.minWidth = "";
		}
	}

	//show scrollbars on empty table div
	renderEmptyScroll(){
		if(this.table.options.placeholder){
			this.tableElement.style.display = "none";
		}else{
			this.tableElement.style.minWidth = this.table.columnManager.getWidth() + "px";
			// this.tableElement.style.minHeight = "1px";
			// this.tableElement.style.visibility = "hidden";
		}
	}

	_clearVirtualDom(){
		var element = this.tableElement;

		if(this.table.options.placeholder && this.table.options.placeholder.parentNode){
			this.table.options.placeholder.parentNode.removeChild(this.table.options.placeholder);
		}

		// element.children.detach();
		while(element.firstChild) element.removeChild(element.firstChild);

		element.style.paddingTop = "";
		element.style.paddingBottom = "";
		element.style.minWidth = "";
		element.style.minHeight = "";
		element.style.display = "";
		element.style.visibility = "";

		this.scrollTop = 0;
		this.scrollLeft = 0;
		this.vDomTop = 0;
		this.vDomBottom = 0;
		this.vDomTopPad = 0;
		this.vDomBottomPad = 0;
	}

	styleRow(row, index){
		var rowEl = row.getElement();

		if(index % 2){
			rowEl.classList.add("tabulator-row-even");
			rowEl.classList.remove("tabulator-row-odd");
		}else{
			rowEl.classList.add("tabulator-row-odd");
			rowEl.classList.remove("tabulator-row-even");
		}
	}

	//full virtual render
	_virtualRenderFill(position, forceMove, offset){
		var	element = this.tableElement,
		holder = this.element,
		topPad = 0,
		rowsHeight = 0,
		topPadHeight = 0,
		i = 0,
		onlyGroupHeaders = true,
		rows = this.getDisplayRows();

		position = position || 0;

		offset = offset || 0;

		if(!position){
			this._clearVirtualDom();
		}else{
			while(element.firstChild) element.removeChild(element.firstChild);

			//check if position is too close to bottom of table
			let heightOccupied  = (this.displayRowsCount - position + 1) * this.vDomRowHeight;

			if(heightOccupied  < this.height){
				position -= Math.ceil((this.height - heightOccupied ) / this.vDomRowHeight);

				if(position < 0){
					position = 0;
				}
			}

			//calculate initial pad
			topPad = Math.min(Math.max(Math.floor(this.vDomWindowBuffer / this.vDomRowHeight),  this.vDomWindowMinMarginRows), position);
			position -= topPad;
		}

		if(this.displayRowsCount && Helpers.elVisible(this.element)){
			this.vDomTop = position;

			this.vDomBottom = position -1;

			while ((rowsHeight <= this.height + this.vDomWindowBuffer || i < this.vDomWindowMinTotalRows) && this.vDomBottom < this.displayRowsCount -1){
				var index = this.vDomBottom + 1,
				row = rows[index],
				rowHeight = 0;

				this.styleRow(row, index);

				element.appendChild(row.getElement());

				row.initialize();

				if(!row.heightInitialized){
					row.normalizeHeight(true);
				}

				rowHeight = row.getHeight();

				if(i < topPad){
					topPadHeight += rowHeight;
				}else{
					rowsHeight += rowHeight;
				}

				if(rowHeight > this.vDomWindowBuffer){
					this.vDomWindowBuffer = rowHeight * 2;
				}

				if(row.type !== "group"){
					onlyGroupHeaders = false;
				}

				this.vDomBottom ++;
				i++;
			}

			if(!position){
				this.vDomTopPad = 0;
				//adjust rowheight to match average of rendered elements
				this.vDomRowHeight = Math.floor((rowsHeight + topPadHeight) / i);
				this.vDomBottomPad = this.vDomRowHeight * (this.displayRowsCount - this.vDomBottom -1);

				this.vDomScrollHeight = topPadHeight + rowsHeight + this.vDomBottomPad - this.height;
			}else{
				this.vDomTopPad = !forceMove ? this.scrollTop - topPadHeight : (this.vDomRowHeight * this.vDomTop) + offset;
				this.vDomBottomPad = this.vDomBottom == this.displayRowsCount-1 ? 0 : Math.max(this.vDomScrollHeight - this.vDomTopPad - rowsHeight - topPadHeight, 0);
			}

			element.style.paddingTop = this.vDomTopPad + "px";
			element.style.paddingBottom = this.vDomBottomPad + "px";

			if(forceMove){
				this.scrollTop = this.vDomTopPad + (topPadHeight) + offset - (this.element.scrollWidth > this.element.clientWidth ? this.element.offsetHeight - this.element.clientHeight : 0);
			}

			this.scrollTop = Math.min(this.scrollTop, this.element.scrollHeight - this.height);

			//adjust for horizontal scrollbar if present (and not at top of table)
			if(this.element.scrollWidth > this.element.offsetWidth && forceMove){
				this.scrollTop += this.element.offsetHeight - this.element.clientHeight;
			}

			this.vDomScrollPosTop = this.scrollTop;
			this.vDomScrollPosBottom = this.scrollTop;

			holder.scrollTop = this.scrollTop;

			element.style.minWidth = onlyGroupHeaders ? this.table.columnManager.getWidth() + "px" : "";

			if(this.table.options.groupBy){
				if(this.table.modules.layout.getMode() != "fitDataFill" && this.displayRowsCount == this.table.modules.groupRows.countGroups()){
					this.tableElement.style.minWidth = this.table.columnManager.getWidth();
				}
			}
		}else{
			this.renderEmptyScroll();
		}

		if(!this.fixedHeight){
			this.adjustTableSize();
		}
	}

	//handle vertical scrolling
	scrollVertical(top, dir){
		var topDiff = this.scrollTop - this.vDomScrollPosTop;
		var bottomDiff = this.scrollTop - this.vDomScrollPosBottom;
		var margin = this.vDomWindowBuffer * 2;

		if(-topDiff > margin || bottomDiff > margin){
			//if big scroll redraw table;
			var left = this.scrollLeft;
			this._virtualRenderFill(Math.floor((this.element.scrollTop / this.element.scrollHeight) * this.displayRowsCount));
			this.scrollHorizontal(left);
		}else{

			if(dir){
				//scrolling up
				if(topDiff < 0){

					this._addTopRow(-topDiff);
				}

				if(bottomDiff < 0){

					//hide bottom row if needed
					if(this.vDomScrollHeight - this.scrollTop > this.vDomWindowBuffer){
						this._removeBottomRow(-bottomDiff);
					}else{
						this.vDomScrollPosBottom = this.scrollTop;
					}
				}
			}else{
				//scrolling down
				if(topDiff >= 0){

					//hide top row if needed
					if(this.scrollTop > this.vDomWindowBuffer){

						this._removeTopRow(topDiff);
					}else{
						this.vDomScrollPosTop = this.scrollTop;
					}
				}

				if(bottomDiff >= 0){

					this._addBottomRow(bottomDiff);
				}
			}
		}
	}

	_addTopRow(topDiff, i=0){
		var table = this.tableElement,
		rows = this.getDisplayRows();

		if(this.vDomTop){
			let index = this.vDomTop -1,
			topRow = rows[index],
			topRowHeight = topRow.getHeight() || this.vDomRowHeight;

			//hide top row if needed
			if(topDiff >= topRowHeight){
				this.styleRow(topRow, index);
				table.insertBefore(topRow.getElement(), table.firstChild);
				if(!topRow.initialized || !topRow.heightInitialized){
					this.vDomTopNewRows.push(topRow);

					if(!topRow.heightInitialized){
						topRow.clearCellHeight();
					}
				}
				topRow.initialize();

				this.vDomTopPad -= topRowHeight;

				if(this.vDomTopPad < 0){
					this.vDomTopPad = index * this.vDomRowHeight;
				}

				if(!index){
					this.vDomTopPad = 0;
				}

				table.style.paddingTop = this.vDomTopPad + "px";
				this.vDomScrollPosTop -= topRowHeight;
				this.vDomTop--;
			}

			topDiff = -(this.scrollTop - this.vDomScrollPosTop);

			if(topRow.getHeight() > this.vDomWindowBuffer){
				this.vDomWindowBuffer = topRow.getHeight() * 2;
			}

			if(i < this.vDomMaxRenderChain && this.vDomTop && topDiff >= (rows[this.vDomTop -1].getHeight() || this.vDomRowHeight)){
				this._addTopRow(topDiff, i+1);
			}else{
				this._quickNormalizeRowHeight(this.vDomTopNewRows);
			}
		}
	}

	_removeTopRow(topDiff){
		var table = this.tableElement,
		topRow = this.getDisplayRows()[this.vDomTop],
		topRowHeight = topRow.getHeight() || this.vDomRowHeight;

		if(topDiff >= topRowHeight){

			var rowEl = topRow.getElement();
			rowEl.parentNode.removeChild(rowEl);

			this.vDomTopPad += topRowHeight;
			table.style.paddingTop = this.vDomTopPad + "px";
			this.vDomScrollPosTop += this.vDomTop ? topRowHeight : topRowHeight + this.vDomWindowBuffer;
			this.vDomTop++;

			topDiff = this.scrollTop - this.vDomScrollPosTop;

			this._removeTopRow(topDiff);
		}
	}

	_addBottomRow(bottomDiff, i=0){
		var table = this.tableElement,
		rows = this.getDisplayRows();

		if(this.vDomBottom < this.displayRowsCount -1){
			let index = this.vDomBottom + 1,
			bottomRow = rows[index],
			bottomRowHeight = bottomRow.getHeight() || this.vDomRowHeight;

			//hide bottom row if needed
			if(bottomDiff >= bottomRowHeight){
				this.styleRow(bottomRow, index);
				table.appendChild(bottomRow.getElement());

				if(!bottomRow.initialized || !bottomRow.heightInitialized){
					this.vDomBottomNewRows.push(bottomRow);

					if(!bottomRow.heightInitialized){
						bottomRow.clearCellHeight();
					}
				}

				bottomRow.initialize();

				this.vDomBottomPad -= bottomRowHeight;

				if(this.vDomBottomPad < 0 || index == this.displayRowsCount -1){
					this.vDomBottomPad = 0;
				}

				table.style.paddingBottom = this.vDomBottomPad + "px";
				this.vDomScrollPosBottom += bottomRowHeight;
				this.vDomBottom++;
			}

			bottomDiff = this.scrollTop - this.vDomScrollPosBottom;

			if(bottomRow.getHeight() > this.vDomWindowBuffer){
				this.vDomWindowBuffer = bottomRow.getHeight() * 2;
			}

			if(i < this.vDomMaxRenderChain && this.vDomBottom < this.displayRowsCount -1 && bottomDiff >= (rows[this.vDomBottom + 1].getHeight() || this.vDomRowHeight)){
				this._addBottomRow(bottomDiff, i+1);
			}else{
				this._quickNormalizeRowHeight(this.vDomBottomNewRows);
			}
		}
	}

	_removeBottomRow(bottomDiff){
		var table = this.tableElement,
		bottomRow = this.getDisplayRows()[this.vDomBottom],
		bottomRowHeight = bottomRow.getHeight() || this.vDomRowHeight;

		if(bottomDiff >= bottomRowHeight){

			var rowEl = bottomRow.getElement();

			if(rowEl.parentNode){
				rowEl.parentNode.removeChild(rowEl);
			}

			this.vDomBottomPad += bottomRowHeight;

			if(this.vDomBottomPad < 0){
				this.vDomBottomPad = 0;
			}

			table.style.paddingBottom = this.vDomBottomPad + "px";
			this.vDomScrollPosBottom -= bottomRowHeight;
			this.vDomBottom--;

			bottomDiff = -(this.scrollTop - this.vDomScrollPosBottom);

			this._removeBottomRow(bottomDiff);
		}
	}

	_quickNormalizeRowHeight(rows){
		rows.forEach(function(row){
			row.calcHeight();
		});

		rows.forEach(function(row){
			row.setCellHeight();
		});

		rows.length = 0;
	}

	//normalize height of active rows
	normalizeHeight(){
		this.activeRows.forEach(function(row){
			row.normalizeHeight();
		});
	}

	//adjust the height of the table holder to fit in the Tabulator element
	adjustTableSize(){
		var initialHeight = this.element.clientHeight,
		modExists;

		if(this.renderMode === "virtual"){

			let otherHeight =  Math.floor(this.columnManager.getElement().getBoundingClientRect().height + (this.table.footerManager && this.table.footerManager.active && !this.table.footerManager.external ? this.table.footerManager.getElement().getBoundingClientRect().height : 0));

			if(this.fixedHeight){
				this.element.style.minHeight = "calc(100% - " + otherHeight + "px)";
				this.element.style.height = "calc(100% - " + otherHeight + "px)";
				this.element.style.maxHeight = "calc(100% - " + otherHeight + "px)";
			}else{
				this.element.style.height = "";
				this.element.style.height = (this.table.element.clientHeight - otherHeight) + "px";
				this.element.scrollTop = this.scrollTop;
			}

			this.height = this.element.clientHeight;
			this.vDomWindowBuffer = this.table.options.virtualDomBuffer || this.height;

			//check if the table has changed size when dealing with variable height tables
			if(!this.fixedHeight && initialHeight != this.element.clientHeight){
				modExists = this.table.modExists("resizeTable");

				if((modExists && !this.table.modules.resizeTable.autoResize) || !modExists){
					this.redraw();
				}
			}

		}
	}

	//renitialize all rows
	reinitialize(){
		this.rows.forEach(function(row){
			row.reinitialize(true);
		});
	}

	//prevent table from being redrawn
	blockRedraw (){
		this.redrawBlock = true;
		this.redrawBlockRestoreConfig = false;
	}

	//restore table redrawing
	restoreRedraw (){
		this.redrawBlock = false;

		if(this.redrawBlockRestoreConfig){
			this.refreshActiveData(this.redrawBlockRestoreConfig.stage, this.redrawBlockRestoreConfig.skipStage, this.redrawBlockRestoreConfig.renderInPosition)

			this.redrawBlockRestoreConfig = false;
		}else{
			if(this.redrawBlockRederInPosition){
				this.reRenderInPosition();
			}
		}

		this.redrawBlockRederInPosition = false;
	}

	//redraw table
	redraw (force){
		var pos = 0,
		left = this.scrollLeft;

		this.adjustTableSize();

		this.table.tableWidth = this.table.element.clientWidth;

		if(!force){
			if(this.renderMode == "classic"){

				if(this.table.options.groupBy){
					this.refreshActiveData("group", false, false);
				}else{
					this._simpleRender();
				}

			}else{
				this.reRenderInPosition();
				this.scrollHorizontal(left);
			}

			if(!this.displayRowsCount){
				if(this.table.options.placeholder){
					this.getElement().appendChild(this.table.options.placeholder);
				}
			}

		}else{
			this.renderTable();
		}
	}

	resetScroll(){
		this.element.scrollLeft = 0;
		this.element.scrollTop = 0;

		if(this.table.browser === "ie"){
			var event = document.createEvent("Event");
			event.initEvent("scroll", false, true);
			this.element.dispatchEvent(event);
		}else{
			this.element.dispatchEvent(new Event('scroll'));
		}
	}
}