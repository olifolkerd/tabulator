import Module from '../../core/Module.js';

import defaultValidators from './defaults/validators.js';

export default class Validate extends Module{

	static moduleName = "validate";

	//load defaults
	static validators = defaultValidators;
	
	constructor(table){
		super(table);
		
		this.invalidCells = [];
		
		this.registerTableOption("validationMode", "blocking");
		
		this.registerColumnOption("validator");
		
		this.registerTableFunction("getInvalidCells", this.getInvalidCells.bind(this));
		this.registerTableFunction("clearCellValidation", this.userClearCellValidation.bind(this));
		this.registerTableFunction("validate", this.userValidate.bind(this));
		
		this.registerComponentFunction("cell", "isValid", this.cellIsValid.bind(this));
		this.registerComponentFunction("cell", "clearValidation", this.clearValidation.bind(this));
		this.registerComponentFunction("cell", "validate", this.cellValidate.bind(this));
		
		this.registerComponentFunction("column", "validate", this.columnValidate.bind(this));
		this.registerComponentFunction("row", "validate", this.rowValidate.bind(this));
	}
	
	
	initialize(){
		this.subscribe("cell-delete", this.clearValidation.bind(this));
		this.subscribe("column-layout", this.initializeColumnCheck.bind(this));
		
		this.subscribe("edit-success", this.editValidate.bind(this));
		this.subscribe("edit-editor-clear", this.editorClear.bind(this));
		this.subscribe("edit-edited-clear", this.editedClear.bind(this));
	}
	
	///////////////////////////////////
	///////// Event Handling //////////
	///////////////////////////////////
	
	editValidate(cell, value, previousValue){
		var valid = this.table.options.validationMode !== "manual" ? this.validate(cell.column.modules.validate, cell, value) : true;
		
		// allow time for editor to make render changes then style cell
		if(valid !== true){
			setTimeout(() => {
				cell.getElement().classList.add("tabulator-validation-fail");
				this.dispatchExternal("validationFailed", cell.getComponent(), value, valid);
			});
		}
		
		return valid;
	}
	
	editorClear(cell, cancelled){
		if(cancelled){
			if(cell.column.modules.validate){
				this.cellValidate(cell);
			}
		}

		cell.getElement().classList.remove("tabulator-validation-fail");
	}
	
	editedClear(cell){
		if(cell.modules.validate){
			cell.modules.validate.invalid = false;
		}
	}
	
	///////////////////////////////////
	////////// Cell Functions /////////
	///////////////////////////////////
	
	cellIsValid(cell){
		return cell.modules.validate ? (cell.modules.validate.invalid || true) : true;
	}
	
	cellValidate(cell){
		return this.validate(cell.column.modules.validate, cell, cell.getValue());
	}
	
	///////////////////////////////////
	///////// Column Functions ////////
	///////////////////////////////////
	
	columnValidate(column){
		var invalid = [];
		
		column.cells.forEach((cell) => {
			if(this.cellValidate(cell) !== true){
				invalid.push(cell.getComponent());
			}
		});
		
		return invalid.length ? invalid : true;
	}
	
	///////////////////////////////////
	////////// Row Functions //////////
	///////////////////////////////////
	
	rowValidate(row){
		var invalid = [];
		
		row.cells.forEach((cell) => {
			if(this.cellValidate(cell) !== true){
				invalid.push(cell.getComponent());
			}
		});
		
		return invalid.length ? invalid : true;
	}
	
	///////////////////////////////////
	///////// Table Functions /////////
	///////////////////////////////////
	
	
	userClearCellValidation(cells){
		if(!cells){
			cells = this.getInvalidCells();
		}
		
		if(!Array.isArray(cells)){
			cells = [cells];
		}
		
		cells.forEach((cell) => {
			this.clearValidation(cell._getSelf());
		});
	}
	
	userValidate(cells){
		var output = [];
		
		//clear row data
		this.table.rowManager.rows.forEach((row) => {
			row = row.getComponent();
			
			var valid = row.validate();
			
			if(valid !== true){
				output = output.concat(valid);
			}
		});
		
		return output.length ? output : true;
	}
	
	///////////////////////////////////
	///////// Internal Logic //////////
	///////////////////////////////////
	
	initializeColumnCheck(column){
		if(typeof column.definition.validator !== "undefined"){
			this.initializeColumn(column);
		}
	}
	
	//validate
	initializeColumn(column){
		var self = this,
		config = [],
		validator;
		
		if(column.definition.validator){
			
			if(Array.isArray(column.definition.validator)){
				column.definition.validator.forEach((item) => {
					validator = self._extractValidator(item);
					
					if(validator){
						config.push(validator);
					}
				});
				
			}else{
				validator = this._extractValidator(column.definition.validator);
				
				if(validator){
					config.push(validator);
				}
			}
			
			column.modules.validate = config.length ? config : false;
		}
	}
	
	_extractValidator(value){
		var type, params, pos;
		
		switch(typeof value){
			case "string":
				pos = value.indexOf(':');
			
				if(pos > -1){
					type = value.substring(0,pos);
					params = value.substring(pos+1);
				}else{
					type = value;
				}
			
				return this._buildValidator(type, params);
			
			case "function":
				return this._buildValidator(value);
			
			case "object":
				return this._buildValidator(value.type, value.parameters);
		}
	}
	
	_buildValidator(type, params){
		
		var func = typeof type == "function" ? type : Validate.validators[type];
		
		if(!func){
			console.warn("Validator Setup Error - No matching validator found:", type);
			return false;
		}else{
			return {
				type:typeof type == "function" ? "function" : type,
				func:func,
				params:params,
			};
		}
	}
	
	validate(validators, cell, value){
		var self = this,
		failedValidators = [],
		invalidIndex = this.invalidCells.indexOf(cell);
		
		if(validators){
			validators.forEach((item) => {
				if(!item.func.call(self, cell.getComponent(), value, item.params)){
					failedValidators.push({
						type:item.type,
						parameters:item.params
					});
				}
			});
		}
		
		if(!cell.modules.validate){
			cell.modules.validate = {};
		}
		
		if(!failedValidators.length){
			cell.modules.validate.invalid = false;
			cell.getElement().classList.remove("tabulator-validation-fail");
			
			if(invalidIndex > -1){
				this.invalidCells.splice(invalidIndex, 1);
			}
		}else{
			cell.modules.validate.invalid = failedValidators;
			
			if(this.table.options.validationMode !== "manual"){
				cell.getElement().classList.add("tabulator-validation-fail");
			}
			
			if(invalidIndex == -1){
				this.invalidCells.push(cell);
			}
		}
		
		return failedValidators.length ? failedValidators : true;
	}
	
	getInvalidCells(){
		var output = [];
		
		this.invalidCells.forEach((cell) => {
			output.push(cell.getComponent());
		});
		
		return output;
	}
	
	clearValidation(cell){
		var invalidIndex;
		
		if(cell.modules.validate && cell.modules.validate.invalid){
			
			cell.getElement().classList.remove("tabulator-validation-fail");
			cell.modules.validate.invalid = false;
			
			invalidIndex = this.invalidCells.indexOf(cell);
			
			if(invalidIndex > -1){
				this.invalidCells.splice(invalidIndex, 1);
			}
		}
	}
}