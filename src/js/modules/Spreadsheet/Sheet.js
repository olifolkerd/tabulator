import CoreFeature from '../../core/CoreFeature.js';
// import SheetComponent from "./SheetComponent";

export default class Sheet extends CoreFeature{
	constructor(spreadsheetManager, definition) {
		super(spreadsheetManager.table);

		this.spreadsheetManager = spreadsheetManager;
		this.definition = definition;

		this.title = this.definition.title || "New Sheet";
		this.rowCount = this.definition.rows;
		this.columnCount = this.definition.columns;
		this.data = this.definition.data || [];

		this.columns = [];
		this.rows = [];

		this.initialize();
	}

	initialize(){
		this.initializeColumns();
		this.initializeRows();
	}

	initializeColumns(){

	}

	initializeRows(){

	}

	load(){
		this.table.blockRedraw();
		this.table.setData([]);
		this.table.setColumns(this.columns);
		this.table.setData(this.rows);
		this.table.restoreRedraw();
	}
}