import Module from '../../module.js';

import defaultValidators from './defaults/validators.js';

class Validate extends Module{

	static moduleName = "validate";

	//load defaults
	static validators = defaultValidators;

	constructor(table){
		super(table);

		this.invalidCells = [];
	}

	//validate
	initializeColumn(column){
		var self = this,
		config = [],
		validator;

		if(column.definition.validator){

			if(Array.isArray(column.definition.validator)){
				column.definition.validator.forEach(function(item){
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
			break;

			case "function":
			return this._buildValidator(value);
			break;

			case "object":
			return this._buildValidator(value.type, value.parameters);
			break;
		}
	}

	_buildValidator(type, params){

		var func = typeof type == "function" ? type : this.validators[type];

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
		valid = [],
		invalidIndex = this.invalidCells.indexOf(cell);

		if(validators){
			validators.forEach(function(item){
				if(!item.func.call(self, cell.getComponent(), value, item.params)){
					valid.push({
						type:item.type,
						parameters:item.params
					});
				}
			});
		}

		valid = valid.length ? valid : true;

		if(!cell.modules.validate){
			cell.modules.validate = {};
		}

		if(valid === true){
			cell.modules.validate.invalid = false;
			cell.getElement().classList.remove("tabulator-validation-fail");

			if(invalidIndex > -1){
				this.invalidCells.splice(invalidIndex, 1);
			}
		}else{
			cell.modules.validate.invalid = true;

			if(this.table.options.validationMode !== "manual"){
				cell.getElement().classList.add("tabulator-validation-fail");
			}

			if(invalidIndex == -1){
				this.invalidCells.push(cell);
			}
		}

		return valid;
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

// Tabulator.prototype.registerModule("validate", Validate);
module.exports = Validate;