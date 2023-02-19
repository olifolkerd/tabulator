import CoreFeature from './CoreFeature.js';
import Row from './row/Row.js';
import RowComponent from './row/RowComponent.js';
import Helpers from './tools/Helpers.js';

import RendererBasicVertical from './rendering/renderers/BasicVertical.js';
import RendererVirtualDomVertical from './rendering/renderers/VirtualDomVertical.js';

export default class RowManager extends CoreFeature{
	
	constructor(table){
		super(table);
		
		this.element = this.createHolderElement(); //containing element
		this.tableElement = this.createTableElement(); //table element
		this.heightFixer = this.createTableElement(); //table element
		this.placeholder = null; //placeholder element
		this.placeholderContents = null; //placeholder element
		
		this.firstRender = false; //handle first render
		this.renderMode = "virtual"; //current rendering mode
		this.fixedHeight = false; //current rendering mode
		
		this.rows = []; //hold row data objects
		this.activeRowsPipeline = []; //hold calculation of active rows
		this.activeRows = []; //rows currently available to on display in the table
		this.activeRowsCount = 0; //count of active rows
		
		this.displayRows = []; //rows currently on display in the table
		this.displayRowsCount = 0; //count of display rows
		
		this.scrollTop = 0;
		this.scrollLeft = 0;
		
		this.redrawBlock = false; //prevent redraws to allow multiple data manipulations before continuing
		this.redrawBlockRestoreConfig = false; //store latest redraw function calls for when redraw is needed
		this.redrawBlockRenderInPosition = false; //store latest redraw function calls for when redraw is needed
		
		this.dataPipeline = []; //hold data pipeline tasks
		this.displayPipeline = []; //hold data display pipeline tasks

		this.scrollbarWidth = 0;
		
		this.renderer = null;
	}
	
	//////////////// Setup Functions /////////////////
	
	createHolderElement (){
		var el = document.createElement("div");
		
		el.classList.add("tabulator-tableholder");
		el.setAttribute("tabindex", 0);
		// el.setAttribute("role", "rowgroup");
		
		return el;
	}
	
	createTableElement (){
		var el = document.createElement("div");
		
		el.classList.add("tabulator-table");
		el.setAttribute("role", "rowgroup");
		
		return el;
	}
	
	initializePlaceholder(){
		var placeholder = this.table.options.placeholder;

		//configure placeholder element
		if(placeholder){	
			let el = document.createElement("div");
			el.classList.add("tabulator-placeholder");

			if(typeof placeholder == "string"){
				let contents = document.createElement("div");
				contents.classList.add("tabulator-placeholder-contents");
				contents.innerHTML = placeholder;
				
				el.appendChild(contents);
				
				this.placeholderContents = contents;
				
			}else if(typeof HTMLElement !== "undefined" && placeholder instanceof HTMLElement){
				
				el.appendChild(placeholder);
				this.placeholderContents = placeholder;
			}else{
				console.warn("Invalid placeholder provided, must be string or HTML Element", placeholder);

				this.el = null;
			}

			this.placeholder = el;
		}
	}
	
	//return containing element
	getElement(){
		return this.element;
	}
	
	//return table element
	getTableElement(){
		return this.tableElement;
	}
	
	initialize(){
		this.initializePlaceholder();
		this.initializeRenderer();
		
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
				
				this.dispatch("scroll-horizontal", left, leftDir);
				this.dispatchExternal("scrollHorizontal", left, leftDir);
				
				this._positionPlaceholder();
			}
			
			//handle vertical scrolling
			if(this.scrollTop != top){
				this.scrollTop = top;
				
				this.renderer.scrollRows(top, topDir);
				
				this.dispatch("scroll-vertical", top, topDir);
				this.dispatchExternal("scrollVertical", top, topDir);
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
			}else if(subject === null){
				return false;
			}
		}else if(typeof subject == "undefined"){
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
	
	getRowFromPosition(position){
		return this.getDisplayRows().find((row) => {
			return row.getPosition() === position && row.isDisplayed();
		});
	}
	
	scrollToRow(row, position, ifVisible){
		return this.renderer.scrollToRowPosition(row, position, ifVisible);
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
				if(this.table.options.autoColumns && columnsChanged && this.table.initialized){
					this.table.columnManager.generateColumnsFromRowData(data);
				}
				this.resetScroll();
				
				this._setDataActual(data);
			}
			
			resolve();
		});
	}
	
	_setDataActual(data, renderInPosition){
		this.dispatchExternal("dataProcessing", data);
		
		this._wipeElements();
		
		if(Array.isArray(data)){
			this.dispatch("data-processing", data);
			
			data.forEach((def, i) => {
				if(def && typeof def === "object"){
					var row = new Row(def, this);
					this.rows.push(row);
				}else{
					console.warn("Data Loading Warning - Invalid row data detected and ignored, expecting object but received:", def);
				}
			});
			
			this.refreshActiveData(false, false, renderInPosition);
			
			this.dispatch("data-processed", data);
			this.dispatchExternal("dataProcessed", data);
		}else{
			console.error("Data Loading Error - Unable to process data due to invalid data type \nExpecting: array \nReceived: ", typeof data, "\nData:     ", data);
		}
	}
	
	_wipeElements(){
		this.dispatch("rows-wipe");
		
		this.destroy();
		
		this.adjustTableSize();

		this.dispatch("rows-wiped");
	}

	destroy(){
		this.rows.forEach((row) => {
			row.wipe();
		});

		this.rows = [];
		this.activeRows = [];
		this.activeRowsPipeline = [];
		this.activeRowsCount = 0;
		this.displayRows = [];
		this.displayRowsCount = 0;
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
		
		this.regenerateRowPositions();
		
		this.dispatchExternal("rowDeleted", row.getComponent());
		
		if(!this.displayRowsCount){
			this.tableEmpty();
		}
		
		if(this.subscribedExternal("dataChanged")){
			this.dispatchExternal("dataChanged", this.getData());
		}
	}
	
	addRow(data, pos, index, blockRedraw){
		var row = this.addRowActual(data, pos, index, blockRedraw);
		return row;
	}
	
	//add multiple rows
	addRows(data, pos, index, refreshDisplayOnly){
		var rows = [];
		
		return new Promise((resolve, reject) => {
			pos = this.findAddRowPos(pos);
			
			if(!Array.isArray(data)){
				data = [data];
			}
			
			if((typeof index == "undefined" && pos) || (typeof index !== "undefined" && !pos)){
				data.reverse();
			}
			
			data.forEach((item, i) => {
				var row = this.addRow(item, pos, index, true);
				rows.push(row);
				this.dispatch("row-added", row, item, pos, index);
			});

			this.refreshActiveData(refreshDisplayOnly ? "displayPipeline" : false, false, true);
			
			this.regenerateRowPositions();
			
			if(rows.length){
				this._clearPlaceholder();
			}
			
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
		activeIndex, chainResult;
		
		if(!index){
			chainResult = this.chain("row-adding-position", [row, top], null, {index, top});
			
			index = chainResult.index;
			top = chainResult.top;
		}
		
		if(typeof index !== "undefined"){
			index = this.findRow(index);
		}
		
		index = this.chain("row-adding-index", [row, index, top], null, index);
		
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
		
		this.dispatchExternal("rowAdded", row.getComponent());
		
		if(this.subscribedExternal("dataChanged")){
			this.dispatchExternal("dataChanged", this.table.rowManager.getData());
		}
		
		if(!blockRedraw){
			this.reRenderInPosition();
		}
		
		return row;
	}
	
	moveRow(from, to, after){
		this.dispatch("row-move", from, to, after);
		
		this.moveRowActual(from, to, after);
		
		this.regenerateRowPositions();
		
		this.dispatch("row-moved", from, to, after);
		this.dispatchExternal("rowMoved", from.getComponent());
	}
	
	moveRowActual(from, to, after){
		this.moveRowInArray(this.rows, from, to, after);
		this.moveRowInArray(this.activeRows, from, to, after);
		
		this.displayRowIterator((rows) => {
			this.moveRowInArray(rows, from, to, after);
		});
		
		this.dispatch("row-moving", from, to, after);
	}
	
	moveRowInArray(rows, from, to, after){
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
	
	scrollHorizontal(left){
		this.scrollLeft = left;
		this.element.scrollLeft = left;
		
		this.dispatch("scroll-horizontal", left);
	}
	
	registerDataPipelineHandler(handler, priority){
		if(typeof priority !== "undefined"){
			this.dataPipeline.push({handler, priority});
			this.dataPipeline.sort((a, b) => {
				return a.priority - b.priority;
			});
		}else{
			console.error("Data pipeline handlers must have a priority in order to be registered");
		}
	}
	
	registerDisplayPipelineHandler(handler, priority){
		if(typeof priority !== "undefined"){
			this.displayPipeline.push({handler, priority});
			this.displayPipeline.sort((a, b) => {
				return a.priority - b.priority;
			});
		}else{
			console.error("Display pipeline handlers must have a priority in order to be registered");
		}
	}
	
	//set active data set
	refreshActiveData(handler, skipStage, renderInPosition){
		var table = this.table,
		stage = "",
		index = 0,
		cascadeOrder = ["all", "dataPipeline", "display", "displayPipeline", "end"];
		
		if(!this.table.destroyed){
			if(typeof handler === "function"){
				index = this.dataPipeline.findIndex((item) => {
					return item.handler === handler;
				});
				
				if(index > -1){
					stage = "dataPipeline";
					
					if(skipStage){
						if(index == this.dataPipeline.length - 1){
							stage = "display";
						}else{
							index++;
						}
					}
				}else{
					index = this.displayPipeline.findIndex((item) => {
						return item.handler === handler;
					});
					
					if(index > -1){
						stage = "displayPipeline";
						
						if(skipStage){
							if(index == this.displayPipeline.length - 1){
								stage = "end";
							}else{
								index++;
							}
						}
					}else{
						console.error("Unable to refresh data, invalid handler provided", handler);
						return;
					}
				}
			}else{
				stage = handler || "all";
				index = 0;
			}
			
			if(this.redrawBlock){
				if(!this.redrawBlockRestoreConfig || (this.redrawBlockRestoreConfig && ((this.redrawBlockRestoreConfig.stage === stage && index < this.redrawBlockRestoreConfig.index) || (cascadeOrder.indexOf(stage) < cascadeOrder.indexOf(this.redrawBlockRestoreConfig.stage))))){
					this.redrawBlockRestoreConfig = {
						handler: handler,
						skipStage: skipStage,
						renderInPosition: renderInPosition,
						stage:stage,
						index:index,
					};
				}
				
				return;
			}else{
				if(Helpers.elVisible(this.element)){
					if(renderInPosition){
						this.reRenderInPosition(this.refreshPipelines.bind(this, handler, stage, index, renderInPosition));
					}else{
						this.refreshPipelines(handler, stage, index, renderInPosition);
						
						if(!handler){
							this.table.columnManager.renderer.renderColumns();
						}
						
						this.renderTable();
						
						if(table.options.layoutColumnsOnNewData){
							this.table.columnManager.redraw(true);
						}
					}
				}else{
					this.refreshPipelines(handler, stage, index, renderInPosition);
				}
				
				this.dispatch("data-refreshed");
			}
		}
	}
	
	refreshPipelines(handler, stage, index, renderInPosition){
		this.dispatch("data-refreshing");
		
		if(!handler){
			this.activeRowsPipeline[0] = this.rows.slice(0);
		}
		
		//cascade through data refresh stages
		switch(stage){
			case "all":
			//handle case where all data needs refreshing
			
			case "dataPipeline":
			
				for(let i = index; i < this.dataPipeline.length; i++){
					let result = this.dataPipeline[i].handler(this.activeRowsPipeline[i].slice(0));
					
					this.activeRowsPipeline[i + 1] = result || this.activeRowsPipeline[i].slice(0);
				}
				
				this.setActiveRows(this.activeRowsPipeline[this.dataPipeline.length]);
				
			case "display":
				index = 0;
				this.resetDisplayRows();
				
			case "displayPipeline":
				for(let i = index; i < this.displayPipeline.length; i++){
					let result = this.displayPipeline[i].handler((i ? this.getDisplayRows(i - 1) : this.activeRows).slice(0), renderInPosition);

					this.setDisplayRows(result || this.getDisplayRows(i - 1).slice(0), i);
				}
			
			case "end":
				//case to handle scenario when trying to skip past end stage
				this.regenerateRowPositions();
		}

		if(this.getDisplayRows().length){
			this._clearPlaceholder();
		}
	}
	
	//regenerate row positions
	regenerateRowPositions(){
		var rows = this.getDisplayRows();
		var index = 1;
		
		rows.forEach((row) => {
			if (row.type === "row"){
				row.setPosition(index);
				index++;
			}
		});
	}
	
	setActiveRows(activeRows){
		this.activeRows = this.activeRows = Object.assign([], activeRows);
		this.activeRowsCount = this.activeRows.length;
	}
	
	//reset display rows array
	resetDisplayRows(){
		this.displayRows = [];
		
		this.displayRows.push(this.activeRows.slice(0));
		
		this.displayRowsCount = this.displayRows[0].length;
	}
	
	//set display row pipeline data
	setDisplayRows(displayRows, index){
		this.displayRows[index] = displayRows;

		if(index == this.displayRows.length -1){
			this.displayRowsCount = this.displayRows[this.displayRows.length -1].length;
		}
	}
	
	getDisplayRows(index){
		if(typeof index == "undefined"){
			return this.displayRows.length ? this.displayRows[this.displayRows.length -1] : [];
		}else{
			return this.displayRows[index] || [];
		}
	}
	
	getVisibleRows(chain, viewable){
		var rows =  Object.assign([], this.renderer.visibleRows(!viewable));
		
		if(chain){
			rows = this.chain("rows-visible", [viewable], rows, rows);
		}
		
		return rows;
	}
	
	//repeat action across display rows
	displayRowIterator(callback){
		this.activeRowsPipeline.forEach(callback);
		this.displayRows.forEach(callback);
		
		this.displayRowsCount = this.displayRows[this.displayRows.length -1].length;
	}
	
	//return only actual rows (not group headers etc)
	getRows(type){
		var rows = [];

		switch(type){
			case "active":
				rows = this.activeRows;
				break;
			
			case "display":
				rows = this.table.rowManager.getDisplayRows();
				break;
				
			case "visible":
				rows = this.getVisibleRows(false, true);
				break;

			default:
				rows = this.chain("rows-retrieve", type, null, this.rows) || this.rows;
		}
		
		return rows;
	}
	
	///////////////// Table Rendering /////////////////
	//trigger rerender of table in current position
	reRenderInPosition(callback){
		if(this.redrawBlock){
			if(callback){
				callback();
			}else{
				this.redrawBlockRenderInPosition = true;
			}
		}else{
			this.dispatchExternal("renderStarted");
			
			this.renderer.rerenderRows(callback);

			if(!this.fixedHeight){
				this.adjustTableSize();
			}

			this.scrollBarCheck();
			
			this.dispatchExternal("renderComplete");
		}
	}

	scrollBarCheck(){
		var scrollbarWidth = 0;

		//adjust for vertical scrollbar moving table when present
		if(this.element.scrollHeight > this.element.clientHeight){
			scrollbarWidth = this.element.offsetWidth - this.element.clientWidth;
		}

		if(scrollbarWidth !== this.scrollbarWidth){
			this.scrollbarWidth = scrollbarWidth;
			this.dispatch("scrollbar-vertical", scrollbarWidth);
		}
	}
	
	initializeRenderer(){
		var renderClass;
		
		var renderers = {
			"virtual": RendererVirtualDomVertical,
			"basic": RendererBasicVertical,
		};
		
		if(typeof this.table.options.renderVertical === "string"){
			renderClass = renderers[this.table.options.renderVertical];
		}else{
			renderClass = this.table.options.renderVertical;
		}
		
		if(renderClass){
			this.renderMode = this.table.options.renderVertical;
			
			this.renderer = new renderClass(this.table, this.element, this.tableElement);
			this.renderer.initialize();
			
			if((this.table.element.clientHeight || this.table.options.height) && !(this.table.options.minHeight && this.table.options.maxHeight)){
				this.fixedHeight = true;
			}else{
				this.fixedHeight = false;
			}
		}else{
			console.error("Unable to find matching renderer:", this.table.options.renderVertical);
		}
	}
	
	getRenderMode(){
		return this.renderMode;
	}
	
	renderTable(){
		this.dispatchExternal("renderStarted");
		
		this.element.scrollTop = 0;
		
		this._clearTable();
		
		if(this.displayRowsCount){
			this.renderer.renderRows();
			
			if(this.firstRender){
				this.firstRender = false;

				if(!this.fixedHeight){
					this.adjustTableSize();
				}
				
				this.layoutRefresh(true);
			}
		}else{
			this.renderEmptyScroll();
		}
		
		if(!this.fixedHeight){
			this.adjustTableSize();
		}
		
		this.dispatch("table-layout");
		
		if(!this.displayRowsCount){
			this._showPlaceholder();
		}

		this.scrollBarCheck();
		
		this.dispatchExternal("renderComplete");
	}
	
	//show scrollbars on empty table div
	renderEmptyScroll(){
		if(this.placeholder){
			this.tableElement.style.display = "none";
		}else{
			this.tableElement.style.minWidth = this.table.columnManager.getWidth() + "px";
			// this.tableElement.style.minHeight = "1px";
			// this.tableElement.style.visibility = "hidden";
		}
	}
	
	_clearTable(){	
		this._clearPlaceholder();
		
		this.scrollTop = 0;
		this.scrollLeft = 0;
		
		this.renderer.clearRows();
	}

	tableEmpty(){
		this.renderEmptyScroll();
		this._showPlaceholder();
	}
	
	_showPlaceholder(){
		if(this.placeholder){
			this.placeholder.setAttribute("tabulator-render-mode", this.renderMode);
			
			this.getElement().appendChild(this.placeholder);
			this._positionPlaceholder();
		}
	}
	
	_clearPlaceholder(){
		if(this.placeholder && this.placeholder.parentNode){
			this.placeholder.parentNode.removeChild(this.placeholder);
		}

		// clear empty table placeholder min
		this.tableElement.style.minWidth = "";
		this.tableElement.style.display = "";
	}
	
	_positionPlaceholder(){
		if(this.placeholder && this.placeholder.parentNode){
			this.placeholder.style.width = this.table.columnManager.getWidth() + "px";
			this.placeholderContents.style.width = this.table.rowManager.element.clientWidth + "px";
			this.placeholderContents.style.marginLeft = this.scrollLeft + "px";
		}
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
	
	//normalize height of active rows
	normalizeHeight(){
		this.activeRows.forEach(function(row){
			row.normalizeHeight();
		});
	}
	
	//adjust the height of the table holder to fit in the Tabulator element
	adjustTableSize(){
		var initialHeight = this.element.clientHeight, minHeight;
		
		if(this.renderer.verticalFillMode === "fill"){
			let otherHeight =  Math.floor(this.table.columnManager.getElement().getBoundingClientRect().height + (this.table.footerManager && this.table.footerManager.active && !this.table.footerManager.external ? this.table.footerManager.getElement().getBoundingClientRect().height : 0));
			
			if(this.fixedHeight){
				minHeight = isNaN(this.table.options.minHeight) ? this.table.options.minHeight : this.table.options.minHeight + "px";
				
				this.element.style.minHeight = minHeight || "calc(100% - " + otherHeight + "px)";
				this.element.style.height = "calc(100% - " + otherHeight + "px)";
				this.element.style.maxHeight = "calc(100% - " + otherHeight + "px)";
			}else{
				this.element.style.height = "";
				this.element.style.height = (this.table.element.clientHeight - otherHeight) + "px";
				this.element.scrollTop = this.scrollTop;
			}
			
			this.renderer.resize();
			
			//check if the table has changed size when dealing with variable height tables
			if(!this.fixedHeight && initialHeight != this.element.clientHeight){
				if(this.subscribed("table-resize")){
					this.dispatch("table-resize");
				}else{
					this.redraw();
				}
			}

			this.scrollBarCheck();
		}
		
		this._positionPlaceholder();
	}
	
	//reinitialize all rows
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
			this.refreshActiveData(this.redrawBlockRestoreConfig.handler, this.redrawBlockRestoreConfig.skipStage, this.redrawBlockRestoreConfig.renderInPosition);
			
			this.redrawBlockRestoreConfig = false;
		}else{
			if(this.redrawBlockRenderInPosition){
				this.reRenderInPosition();
			}
		}
		
		this.redrawBlockRenderInPosition = false;
	}
	
	//redraw table
	redraw (force){
		var left = this.scrollLeft;
		
		this.adjustTableSize();
		
		this.table.tableWidth = this.table.element.clientWidth;
		
		if(!force){
			this.reRenderInPosition();
			this.scrollHorizontal(left);
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
