import Module from '../../core/Module.js';

import Row from '../../core/row/Row.js';

import RowComponent from '../../core/row/RowComponent.js';

export default class DataTree extends Module{

	static moduleName = "dataTree";

	constructor(table){
		super(table);

		this.indent = 10;
		this.field = "";
		this.collapseEl = null;
		this.expandEl = null;
		this.branchEl = null;
		this.elementField = false;

		this.startOpen = function(){};

		this.registerTableOption("dataTree", false); //enable data tree
		this.registerTableOption("dataTreeFilter", true); //filter child rows
		this.registerTableOption("dataTreeSort", true); //sort child rows
		this.registerTableOption("dataTreeElementColumn", false);
		this.registerTableOption("dataTreeBranchElement", true);//show data tree branch element
		this.registerTableOption("dataTreeChildIndent", 9); //data tree child indent in px
		this.registerTableOption("dataTreeChildField", "_children");//data tre column field to look for child rows
		this.registerTableOption("dataTreeCollapseElement", false);//data tree row collapse element
		this.registerTableOption("dataTreeExpandElement", false);//data tree row expand element
		this.registerTableOption("dataTreeStartExpanded", false);
		this.registerTableOption("dataTreeChildColumnCalcs", false);//include visible data tree rows in column calculations
		this.registerTableOption("dataTreeSelectPropagate", false);//selecting a parent row selects its children

		//register component functions
		this.registerComponentFunction("row", "treeCollapse", this.collapseRow.bind(this));
		this.registerComponentFunction("row", "treeExpand", this.expandRow.bind(this));
		this.registerComponentFunction("row", "treeToggle", this.toggleRow.bind(this));
		this.registerComponentFunction("row", "getTreeParent", this.getTreeParent.bind(this));
		this.registerComponentFunction("row", "getTreeChildren", this.getRowChildren.bind(this));
		this.registerComponentFunction("row", "addTreeChild", this.addTreeChildRow.bind(this));
		this.registerComponentFunction("row", "isTreeExpanded", this.isRowExpanded.bind(this));
	}

	initialize(){
		if(this.table.options.dataTree){
			var dummyEl = null,
			options = this.table.options;

			this.field = options.dataTreeChildField;
			this.indent = options.dataTreeChildIndent;

			if(this.options("movableRows")){
				console.warn("The movableRows option is not available with dataTree enabled, moving of child rows could result in unpredictable behavior");
			}

			if(options.dataTreeBranchElement){

				if(options.dataTreeBranchElement === true){
					this.branchEl = document.createElement("div");
					this.branchEl.classList.add("tabulator-data-tree-branch");
				}else{
					if(typeof options.dataTreeBranchElement === "string"){
						dummyEl = document.createElement("div");
						dummyEl.innerHTML = options.dataTreeBranchElement;
						this.branchEl = dummyEl.firstChild;
					}else{
						this.branchEl = options.dataTreeBranchElement;
					}
				}
			}else{
				this.branchEl = document.createElement("div");
				this.branchEl.classList.add("tabulator-data-tree-branch-empty");
			}

			if(options.dataTreeCollapseElement){
				if(typeof options.dataTreeCollapseElement === "string"){
					dummyEl = document.createElement("div");
					dummyEl.innerHTML = options.dataTreeCollapseElement;
					this.collapseEl = dummyEl.firstChild;
				}else{
					this.collapseEl = options.dataTreeCollapseElement;
				}
			}else{
				this.collapseEl = document.createElement("div");
				this.collapseEl.classList.add("tabulator-data-tree-control");
				this.collapseEl.tabIndex = 0;
				this.collapseEl.innerHTML = "<div class='tabulator-data-tree-control-collapse'></div>";
			}

			if(options.dataTreeExpandElement){
				if(typeof options.dataTreeExpandElement === "string"){
					dummyEl = document.createElement("div");
					dummyEl.innerHTML = options.dataTreeExpandElement;
					this.expandEl = dummyEl.firstChild;
				}else{
					this.expandEl = options.dataTreeExpandElement;
				}
			}else{
				this.expandEl = document.createElement("div");
				this.expandEl.classList.add("tabulator-data-tree-control");
				this.expandEl.tabIndex = 0;
				this.expandEl.innerHTML = "<div class='tabulator-data-tree-control-expand'></div>";
			}


			switch(typeof options.dataTreeStartExpanded){
				case "boolean":
					this.startOpen = function(row, index){
						return options.dataTreeStartExpanded;
					};
					break;

				case "function":
					this.startOpen = options.dataTreeStartExpanded;
					break;

				default:
					this.startOpen = function(row, index){
						return options.dataTreeStartExpanded[index];
					};
					break;
			}

			this.subscribe("row-init", this.initializeRow.bind(this));
			this.subscribe("row-layout-after", this.layoutRow.bind(this));
			this.subscribe("row-deleted", this.rowDelete.bind(this),0);
			this.subscribe("row-data-changed", this.rowDataChanged.bind(this), 10);
			this.subscribe("cell-value-updated", this.cellValueChanged.bind(this));
			this.subscribe("edit-cancelled", this.cellValueChanged.bind(this));
			this.subscribe("column-moving-rows", this.columnMoving.bind(this));
			this.subscribe("table-built", this.initializeElementField.bind(this));
			this.subscribe("table-redrawing", this.tableRedrawing.bind(this));

			this.registerDisplayHandler(this.getRows.bind(this), 30);
		}
	}

	tableRedrawing(force){
		var rows;

		if(force){
			rows = this.table.rowManager.getRows();
			
			rows.forEach((row) => {
				this.reinitializeRowChildren(row);
			});
		}
	}

	initializeElementField(){
		var firstCol = this.table.columnManager.getFirstVisibleColumn();

		this.elementField = this.table.options.dataTreeElementColumn || (firstCol ? firstCol.field : false);
	}
	
	getRowChildren(row){
		return this.getTreeChildren(row, true);
	}

	columnMoving(){
		var rows = [];

		this.table.rowManager.rows.forEach((row) => {
			rows = rows.concat(this.getTreeChildren(row, false, true));
		});

		return rows;
	}

	rowDataChanged(row, visible, updatedData){
		if(this.redrawNeeded(updatedData)){
			this.initializeRow(row);

			if(visible){
				this.layoutRow(row);
				this.refreshData(true);
			}
		}
	}

	cellValueChanged(cell){
		var field = cell.column.getField();

		if(field === this.elementField){
			this.layoutRow(cell.row);
		}
	}

	initializeRow(row){
		var childArray = row.getData()[this.field];
		var isArray = Array.isArray(childArray);

		var children = isArray || (!isArray && typeof childArray === "object" && childArray !== null);

		if(!children && row.modules.dataTree && row.modules.dataTree.branchEl){
			row.modules.dataTree.branchEl.parentNode.removeChild(row.modules.dataTree.branchEl);
		}

		if(!children && row.modules.dataTree && row.modules.dataTree.controlEl){
			row.modules.dataTree.controlEl.parentNode.removeChild(row.modules.dataTree.controlEl);
		}

		row.modules.dataTree = {
			index: row.modules.dataTree ? row.modules.dataTree.index : 0,
			open: children ? (row.modules.dataTree ? row.modules.dataTree.open : this.startOpen(row.getComponent(), 0)) : false,
			controlEl: row.modules.dataTree && children ? row.modules.dataTree.controlEl : false,
			branchEl: row.modules.dataTree && children ? row.modules.dataTree.branchEl : false,
			parent: row.modules.dataTree ? row.modules.dataTree.parent : false,
			children:children,
		};
	}

	reinitializeRowChildren(row){
		var children = this.getTreeChildren(row, false, true);

		children.forEach(function(child){
			child.reinitialize(true);
		});
	}

	layoutRow(row){
		var cell = this.elementField ? row.getCell(this.elementField) : row.getCells()[0],
		el = cell.getElement(),
		config = row.modules.dataTree;

		if(config.branchEl){
			if(config.branchEl.parentNode){
				config.branchEl.parentNode.removeChild(config.branchEl);
			}
			config.branchEl = false;
		}

		if(config.controlEl){
			if(config.controlEl.parentNode){
				config.controlEl.parentNode.removeChild(config.controlEl);
			}
			config.controlEl = false;
		}

		this.generateControlElement(row, el);

		row.getElement().classList.add("tabulator-tree-level-" + config.index);

		if(config.index){
			if(this.branchEl){
				config.branchEl = this.branchEl.cloneNode(true);
				el.insertBefore(config.branchEl, el.firstChild);

				if(this.table.rtl){
					config.branchEl.style.marginRight = (((config.branchEl.offsetWidth + config.branchEl.style.marginLeft) * (config.index - 1)) + (config.index * this.indent)) + "px";
				}else{
					config.branchEl.style.marginLeft = (((config.branchEl.offsetWidth + config.branchEl.style.marginRight) * (config.index - 1)) + (config.index * this.indent)) + "px";
				}
			}else{

				if(this.table.rtl){
					el.style.paddingRight = parseInt(window.getComputedStyle(el, null).getPropertyValue('padding-right')) + (config.index * this.indent) + "px";
				}else{
					el.style.paddingLeft = parseInt(window.getComputedStyle(el, null).getPropertyValue('padding-left')) + (config.index * this.indent) + "px";
				}
			}
		}
	}

	generateControlElement(row, el){
		var config = row.modules.dataTree,
		oldControl = config.controlEl;

		el = el || row.getCells()[0].getElement();

		if(config.children !== false){

			if(config.open){
				config.controlEl = this.collapseEl.cloneNode(true);
				config.controlEl.addEventListener("click", (e) => {
					e.stopPropagation();
					this.collapseRow(row);
				});
			}else{
				config.controlEl = this.expandEl.cloneNode(true);
				config.controlEl.addEventListener("click", (e) => {
					e.stopPropagation();
					this.expandRow(row);
				});
			}

			config.controlEl.addEventListener("mousedown", (e) => {
				e.stopPropagation();
			});

			if(oldControl && oldControl.parentNode === el){
				oldControl.parentNode.replaceChild(config.controlEl,oldControl);
			}else{
				el.insertBefore(config.controlEl, el.firstChild);
			}
		}
	}

	getRows(rows){
		var output = [];

		rows.forEach((row, i) => {
			var config, children;

			output.push(row);

			if(row instanceof Row){

				row.create();

				config = row.modules.dataTree;

				if(!config.index && config.children !== false){
					children = this.getChildren(row, false, true);

					children.forEach((child) => {
						child.create();
						output.push(child);
					});
				}
			}
		});

		return output;
	}

	getChildren(row, allChildren, sortOnly){
		var config = row.modules.dataTree,
		children = [],
		output = [];

		if(config.children !== false && (config.open || allChildren)){
			if(!Array.isArray(config.children)){
				config.children = this.generateChildren(row);
			}

			if(this.table.modExists("filter") && this.table.options.dataTreeFilter){
				children = this.table.modules.filter.filter(config.children);
			}else{
				children = config.children;
			}

			if(this.table.modExists("sort") && this.table.options.dataTreeSort){
				this.table.modules.sort.sort(children, sortOnly);
			}

			children.forEach((child) => {
				output.push(child);

				var subChildren = this.getChildren(child, false, true);

				subChildren.forEach((sub) => {
					output.push(sub);
				});
			});
		}

		return output;
	}

	generateChildren(row){
		var children = [];

		var childArray = row.getData()[this.field];

		if(!Array.isArray(childArray)){
			childArray = [childArray];
		}

		childArray.forEach((childData) => {
			var childRow = new Row(childData || {}, this.table.rowManager);

			childRow.create();

			childRow.modules.dataTree.index = row.modules.dataTree.index + 1;
			childRow.modules.dataTree.parent = row;

			if(childRow.modules.dataTree.children){
				childRow.modules.dataTree.open = this.startOpen(childRow.getComponent(), childRow.modules.dataTree.index);
			}
			children.push(childRow);
		});

		return children;
	}

	expandRow(row, silent){
		var config = row.modules.dataTree;

		if(config.children !== false){
			config.open = true;

			row.reinitialize();

			this.refreshData(true);

			this.dispatchExternal("dataTreeRowExpanded", row.getComponent(), row.modules.dataTree.index);
		}
	}

	collapseRow(row){
		var config = row.modules.dataTree;

		if(config.children !== false){
			config.open = false;

			row.reinitialize();

			this.refreshData(true);

			this.dispatchExternal("dataTreeRowCollapsed", row.getComponent(), row.modules.dataTree.index);
		}
	}

	toggleRow(row){
		var config = row.modules.dataTree;

		if(config.children !== false){
			if(config.open){
				this.collapseRow(row);
			}else{
				this.expandRow(row);
			}
		}
	}

	isRowExpanded(row){
		return row.modules.dataTree.open;
	}

	getTreeParent(row){
		return row.modules.dataTree.parent ? row.modules.dataTree.parent.getComponent() : false;
	}

	getTreeParentRoot(row){
		return row.modules.dataTree && row.modules.dataTree.parent ? this.getTreeParentRoot(row.modules.dataTree.parent) : row;
	}

	getFilteredTreeChildren(row){
		var config = row.modules.dataTree,
		output = [], children;

		if(config.children){

			if(!Array.isArray(config.children)){
				config.children = this.generateChildren(row);
			}

			if(this.table.modExists("filter") && this.table.options.dataTreeFilter){
				children = this.table.modules.filter.filter(config.children);
			}else{
				children = config.children;
			}

			children.forEach((childRow) => {
				if(childRow instanceof Row){
					output.push(childRow);
				}
			});
		}

		return output;
	}

	rowDelete(row){
		var parent = row.modules.dataTree.parent,
		childIndex;

		if(parent){
			childIndex = this.findChildIndex(row, parent);

			if(childIndex !== false){
				parent.data[this.field].splice(childIndex, 1);
			}

			if(!parent.data[this.field].length){
				delete parent.data[this.field];
			}

			this.initializeRow(parent);
			this.layoutRow(parent);
		}

		this.refreshData(true);
	}

	addTreeChildRow(row, data, top, index){
		var childIndex = false;

		if(typeof data === "string"){
			data = JSON.parse(data);
		}

		if(!Array.isArray(row.data[this.field])){
			row.data[this.field] = [];

			row.modules.dataTree.open = this.startOpen(row.getComponent(), row.modules.dataTree.index);
		}

		if(typeof index !== "undefined"){
			childIndex = this.findChildIndex(index, row);

			if(childIndex !== false){
				row.data[this.field].splice((top ? childIndex : childIndex + 1), 0, data);
			}
		}

		if(childIndex === false){
			if(top){
				row.data[this.field].unshift(data);
			}else{
				row.data[this.field].push(data);
			}
		}

		this.initializeRow(row);
		this.layoutRow(row);

		this.refreshData(true);
	}

	findChildIndex(subject, parent){
		var match = false;

		if(typeof subject == "object"){

			if(subject instanceof Row){
				//subject is row element
				match = subject.data;
			}else if(subject instanceof RowComponent){
				//subject is public row component
				match = subject._getSelf().data;
			}else if(typeof HTMLElement !== "undefined" && subject instanceof HTMLElement){
				if(parent.modules.dataTree){
					match = parent.modules.dataTree.children.find((childRow) => {
						return childRow instanceof Row ? childRow.element === subject : false;
					});

					if(match){
						match = match.data;
					}
				}
			}else if(subject === null){
				match = false;
			}

		}else if(typeof subject == "undefined"){
			match = false;
		}else{
			//subject should be treated as the index of the row
			match = parent.data[this.field].find((row) => {
				return row.data[this.table.options.index] == subject;
			});
		}

		if(match){

			if(Array.isArray(parent.data[this.field])){
				match = parent.data[this.field].indexOf(match);
			}

			if(match == -1){
				match = false;
			}
		}

		//catch all for any other type of input

		return match;
	}

	getTreeChildren(row, component, recurse){
		var config = row.modules.dataTree,
		output = [];

		if(config && config.children){

			if(!Array.isArray(config.children)){
				config.children = this.generateChildren(row);
			}

			config.children.forEach((childRow) => {
				if(childRow instanceof Row){
					output.push(component ? childRow.getComponent() : childRow);

					if(recurse){
						this.getTreeChildren(childRow, component, recurse).forEach(child => {
							output.push(child);
						});
					}
				}
			});
		}

		return output;
	}

	getChildField(){
		return this.field;
	}

	redrawNeeded(data){
		return (this.field ? typeof data[this.field] !== "undefined" : false) || (this.elementField ? typeof data[this.elementField] !== "undefined" : false);
	}
}