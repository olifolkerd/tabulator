import Module from '../../core/Module.js';
import Helpers from '../../core/tools/Helpers.js';

import defaultAccessors from './defaults/accessors.js';

export default class Accessor extends Module{
	
	static moduleName = "accessor";

	//load defaults
	static accessors = defaultAccessors;

	constructor(table){
		super(table);

		this.allowedTypes = ["", "data", "download", "clipboard", "print", "htmlOutput"]; //list of accessor types

		this.registerColumnOption("accessor");
		this.registerColumnOption("accessorParams");
		this.registerColumnOption("accessorData");
		this.registerColumnOption("accessorDataParams");
		this.registerColumnOption("accessorDownload");
		this.registerColumnOption("accessorDownloadParams");
		this.registerColumnOption("accessorClipboard");
		this.registerColumnOption("accessorClipboardParams");
		this.registerColumnOption("accessorPrint");
		this.registerColumnOption("accessorPrintParams");
		this.registerColumnOption("accessorHtmlOutput");
		this.registerColumnOption("accessorHtmlOutputParams");
	}

	initialize(){
		this.subscribe("column-layout", this.initializeColumn.bind(this));
		this.subscribe("row-data-retrieve", this.transformRow.bind(this));
	}

	//initialize column accessor
	initializeColumn(column){
		var match = false,
		config = {};

		this.allowedTypes.forEach((type) => {
			var key = "accessor" + (type.charAt(0).toUpperCase() + type.slice(1)),
			accessor;

			if(column.definition[key]){
				accessor = this.lookupAccessor(column.definition[key]);

				if(accessor){
					match = true;

					config[key] = {
						accessor:accessor,
						params: column.definition[key + "Params"] || {},
					};
				}
			}
		});

		if(match){
			column.modules.accessor = config;
		}
	}

	lookupAccessor(value){
		var accessor = false;

		//set column accessor
		switch(typeof value){
			case "string":
				if(Accessor.accessors[value]){
					accessor = Accessor.accessors[value];
				}else{
					console.warn("Accessor Error - No such accessor found, ignoring: ", value);
				}
				break;

			case "function":
				accessor = value;
				break;
		}

		return accessor;
	}

	//apply accessor to row
	transformRow(row, type){
		var key = "accessor" + (type.charAt(0).toUpperCase() + type.slice(1)),
		rowComponent = row.getComponent();

		//clone data object with deep copy to isolate internal data from returned result
		var data = Helpers.deepClone(row.data || {});

		this.table.columnManager.traverse(function(column){
			var value, accessor, params, colComponent;

			if(column.modules.accessor){

				accessor = column.modules.accessor[key] || column.modules.accessor.accessor || false;

				if(accessor){
					value = column.getFieldValue(data);

					if(value != "undefined"){
						colComponent = column.getComponent();
						params = typeof accessor.params === "function" ? accessor.params(value, data, type, colComponent, rowComponent) : accessor.params;
						column.setFieldValue(data, accessor.accessor(value, data, type, params, colComponent, rowComponent));
					}
				}
			}
		});

		return data;
	}
}