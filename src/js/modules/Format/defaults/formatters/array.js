import Helpers from '../../../../core/tools/Helpers.js';

export default function(cell, formatterParams, onRendered){
	var delimiter = formatterParams.delimiter || ",",
	value = cell.getValue(),
	table = this.table,
	valueMap;
	
	if(formatterParams.valueMap){
		if(typeof formatterParams.valueMap === "string"){
			valueMap = function(value){
				return value.map((item) => {
					return Helpers.retrieveNestedData(table.options.nestedFieldSeparator, formatterParams.valueMap, item);
				});
			};
		}else{
			valueMap = formatterParams.valueMap;
		}
	}

	if(Array.isArray(value)){
		if(valueMap){
			value = valueMap(value);
		}

		return value.join(delimiter);
	}else{
		return value;
	}
}