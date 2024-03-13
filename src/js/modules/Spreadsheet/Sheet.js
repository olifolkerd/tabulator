import CoreFeature from '../../core/CoreFeature.js';
import GridCalculator from "./GridCalculator";
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

		this.grid = new GridCalculator(this.columnCount, this.rowCount);

		this.defaultColumnDefinition = {width:100, headerHozAlign:"center", headerSort:false};
		this.columnDefinition = Object.assign(this.defaultColumnDefinition, this.options("spreadsheetDefinition"));

		this.columnDefs = [];
		this.columns = [];
		this.rows = [];

		this.initialize();
	}

	initialize(){
		
		this.initializeColumns();
		this.initializeRows();
	}

	initializeColumns(){
		var refs = this.grid.genColumns();

		refs.forEach((ref) => {
			var def = Object.assign({}, this.columnDefinition);
			def.field = ref;
			def.title = ref;

			this.columnDefs.push(def);
		});
	}

	initializeRows(){
		var refs = this.grid.genRows();

		refs.forEach((ref) => {
			this.rows.push({"_id":ref});
		});
	}

	load(){
		this.table.blockRedraw();
		this.table.setData([]);
		this.table.setColumns(this.columnDefs);
		this.table.setData(this.rows);
		this.table.restoreRedraw();
	}
}