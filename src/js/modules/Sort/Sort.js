import Module from '../../core/Module.js';

import defaultSorters from './defaults/sorters.js';

class Sort extends Module{

	constructor(table){
		super(table);

	 	this.sortList = []; //holder current sort
	 	this.changed = false; //has the sort changed since last render

	 	this.registerTableOption("sortMode", "local"); //local or remote sorting

	 	this.registerTableOption("initialSort", false); //initial sorting criteria
	 	this.registerTableOption("columnHeaderSortMulti", true); //multiple or single column sorting
	 	this.registerTableOption("sortOrderReverse", false); //reverse internal sort ordering
	 	this.registerTableOption("headerSortElement", "<div class='tabulator-arrow'></div>"); //header sort element

	 	this.registerColumnOption("sorter");
	 	this.registerColumnOption("sorterParams");

	 	this.registerColumnOption("headerSort", true);
	 	this.registerColumnOption("headerSortStartingDir");
	 	this.registerColumnOption("headerSortTristate");

	 }

	 initialize(){
	 	this.subscribe("column-layout", this.initializeColumn.bind(this));
	 	this.subscribe("table-built", this.tableBuilt.bind(this));
	 	this.registerDataHandler(this.sort.bind(this), 20);

	 	this.registerTableFunction("setSort", this.userSetSort.bind(this));
	 	this.registerTableFunction("getSorters", this.getSort.bind(this));
	 	this.registerTableFunction("clearSort", this.clearSort.bind(this));

	 	if(this.table.options.sortMode === "remote"){
	 		this.subscribe("data-params", this.remoteSortParams.bind(this));
	 	}
	 }

	 tableBuilt(){
	 	if(this.table.options.initialSort){
	 		this.setSort(this.table.options.initialSort);
	 	}
	 }

	 remoteSortParams(data, config, silent, params){
	 	var sorters = this.getSort();

	 	sorters.forEach((item) => {
	 		delete item.column;
	 	});

	 	params.sort = sorters;

	 	return params;
	 }


	///////////////////////////////////
	///////// Table Functions /////////
	///////////////////////////////////

	userSetSort(sortList, dir){
		this.setSort(sortList, dir);
		// this.table.rowManager.sorterRefresh();
		this.refreshSort();
	}

	clearSort(){
		this.clear();
		// this.table.rowManager.sorterRefresh();
		this.refreshSort();
	}


	///////////////////////////////////
	///////// Internal Logic //////////
	///////////////////////////////////

	//initialize column header for sorting
	initializeColumn(column){
		var sorter = false,
		colEl,
		arrowEl;

		switch(typeof column.definition.sorter){
			case "string":
			if(Sort.sorters[column.definition.sorter]){
				sorter = Sort.sorters[column.definition.sorter];
			}else{
				console.warn("Sort Error - No such sorter found: ", column.definition.sorter);
			}
			break;

			case "function":
			sorter = column.definition.sorter;
			break;
		}

		column.modules.sort = {
			sorter:sorter, dir:"none",
			params:column.definition.sorterParams || {},
			startingDir:column.definition.headerSortStartingDir || "asc",
			tristate: column.definition.headerSortTristate,
		};

		if(column.definition.headerSort !== false){

			colEl = column.getElement();

			colEl.classList.add("tabulator-sortable");


			arrowEl = document.createElement("div");
			arrowEl.classList.add("tabulator-col-sorter");

			if(typeof this.table.options.headerSortElement == "object"){
				arrowEl.appendChild(this.table.options.headerSortElement);
			}else{
				arrowEl.innerHTML = this.table.options.headerSortElement;
			}

			//create sorter arrow
			column.titleHolderElement.appendChild(arrowEl);

			column.modules.sort.element = arrowEl;

			//sort on click
			colEl.addEventListener("click", (e) => {
				var dir = "",
				sorters=[],
				match = false;

				if(column.modules.sort){
					if(column.modules.sort.tristate){
						if(column.modules.sort.dir == "none"){
							dir = column.modules.sort.startingDir;
						}else{
							if(column.modules.sort.dir == column.modules.sort.startingDir){
								dir = column.modules.sort.dir == "asc" ? "desc" : "asc";
							}else{
								dir = "none";
							}
						}
					}else{
						switch(column.modules.sort.dir){
							case "asc":
							dir = "desc";
							break;

							case "desc":
							dir = "asc";
							break;

							default:
							dir = column.modules.sort.startingDir;
						}
					}


					if (this.table.options.columnHeaderSortMulti && (e.shiftKey || e.ctrlKey)) {
						sorters = this.getSort();

						match = sorters.findIndex((sorter) => {
							return sorter.field === column.getField();
						});

						if(match > -1){
							sorters[match].dir = dir;

							if(match != sorters.length -1){
								match = sorters.splice(match, 1)[0];
								if(dir != "none"){
									sorters.push(match);
								}
							}
						}else{
							if(dir != "none"){
								sorters.push({column:column, dir:dir});
							}
						}

						//add to existing sort
						this.setSort(sorters);
					}else{
						if(dir == "none"){
							this.clear();
						}else{
							//sort by column only
							this.setSort(column, dir);
						}

					}

					// this.table.rowManager.sorterRefresh(!this.sortList.length);
					this.refreshSort();
				}
			});
		}
	}

	refreshSort(){
		if(this.table.options.sortMode === "remote"){
			this.reloadData(null, false, false);
		}else{
			this.refreshData(true);
		}

		//TODO - Persist left position of row manager
		// left = this.scrollLeft;
		// this.scrollHorizontal(left);
	}

	//check if the sorters have changed since last use
	hasChanged(){
		var changed = this.changed;
		this.changed = false;
		return changed;
	}

	//return current sorters
	getSort(){
		var self = this,
		sorters = [];

		self.sortList.forEach(function(item){
			if(item.column){
				sorters.push({column:item.column.getComponent(), field:item.column.getField(), dir:item.dir});
			}
		});

		return sorters;
	}

	//change sort list and trigger sort
	setSort(sortList, dir){
		var self = this,
		newSortList = [];

		if(!Array.isArray(sortList)){
			sortList = [{column: sortList, dir:dir}];
		}

		sortList.forEach(function(item){
			var column;

			column = self.table.columnManager.findColumn(item.column);

			if(column){
				item.column = column;
				newSortList.push(item);
				self.changed = true;
			}else{
				console.warn("Sort Warning - Sort field does not exist and is being ignored: ", item.column);
			}

		});

		self.sortList = newSortList;

		this.dispatch("sort-changed");
	}

	//clear sorters
	clear(){
		this.setSort([]);
	}

	//find appropriate sorter for column
	findSorter(column){
		var row = this.table.rowManager.activeRows[0],
		sorter = "string",
		field, value;

		if(row){
			row = row.getData();
			field = column.getField();

			if(field){

				value = column.getFieldValue(row);

				switch(typeof value){
					case "undefined":
					sorter = "string";
					break;

					case "boolean":
					sorter = "boolean";
					break;

					default:
					if(!isNaN(value) && value !== ""){
						sorter = "number";
					}else{
						if(value.match(/((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+$/i)){
							sorter = "alphanum";
						}
					}
					break;
				}
			}
		}

		return Sort.sorters[sorter];
	}

	//work through sort list sorting data
	sort(data){
		var self = this,
		sortList = this.table.options.sortOrderReverse ? self.sortList.slice().reverse() : self.sortList,
		sortListActual = [],
		rowComponents = [],
		lastSort;

		if(this.subscribedExternal("dataSorting")){
			this.dispatchExternal("dataSorting", self.getSort());
		}

		self.clearColumnHeaders();

		if(this.table.options.sortMode !== "remote"){

			//build list of valid sorters and trigger column specific callbacks before sort begins
			sortList.forEach(function(item, i){
				var sortObj = item.column.modules.sort;

				if(item.column && sortObj){

					//if no sorter has been defined, take a guess
					if(!sortObj.sorter){
						sortObj.sorter = self.findSorter(item.column);
					}

					item.params = typeof sortObj.params === "function" ? sortObj.params(item.column.getComponent(), item.dir) : sortObj.params;

					sortListActual.push(item);
				}

				self.setColumnHeader(item.column, item.dir);
			});

			//sort data
			if (sortListActual.length) {
				self._sortItems(data, sortListActual);
			}

		}else{
			sortList.forEach(function(item, i){
				self.setColumnHeader(item.column, item.dir);
			});
		}

		if(this.subscribedExternal("dataSorted")){
			data.forEach((row) => {
				rowComponents.push(row.getComponent());
			});

			this.dispatchExternal("dataSorted", self.getSort(), rowComponents);
		}

		return data;
	}

	//clear sort arrows on columns
	clearColumnHeaders(){
		this.table.columnManager.getRealColumns().forEach(function(column){
			if(column.modules.sort){
				column.modules.sort.dir = "none";
				column.getElement().setAttribute("aria-sort", "none");
			}
		});
	}

	//set the column header sort direction
	setColumnHeader(column, dir){
		column.modules.sort.dir = dir;
		column.getElement().setAttribute("aria-sort", dir === "asc" ? "ascending" : "descending");
	}

	//sort each item in sort list
	_sortItems(data, sortList){
		var sorterCount = sortList.length - 1;

		data.sort((a, b) => {
			var result;

			for(var i = sorterCount; i>= 0; i--){
				let sortItem = sortList[i];

				result = this._sortRow(a, b, sortItem.column, sortItem.dir, sortItem.params);

				if(result !== 0){
					break;
				}
			}

			return result;
		});
	}

	//process individual rows for a sort function on active data
	_sortRow(a, b, column, dir, params){
		var el1Comp, el2Comp, colComp;

		//switch elements depending on search direction
		var el1 = dir == "asc" ? a : b;
		var el2 = dir == "asc" ? b : a;

		a = column.getFieldValue(el1.getData());
		b = column.getFieldValue(el2.getData());

		a = typeof a !== "undefined" ? a : "";
		b = typeof b !== "undefined" ? b : "";

		el1Comp = el1.getComponent();
		el2Comp = el2.getComponent();

		return column.modules.sort.sorter.call(this, a, b, el1Comp, el2Comp, column.getComponent(), dir, params);
	}
}

Sort.moduleName = "sort";

//load defaults
Sort.sorters = defaultSorters;

export default Sort;