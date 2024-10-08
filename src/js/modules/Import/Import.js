import Module from '../../core/Module.js';

import defaultImporters from './defaults/importers.js';

export default class Import extends Module{
	
	static moduleName = "import";
	
	//load defaults
	static importers = defaultImporters;
	
	constructor(table){
		super(table);
		
		this.registerTableOption("importFormat");
		this.registerTableOption("importReader", "text");
		this.registerTableOption("importHeaderTransform");
		this.registerTableOption("importValueTransform");
		this.registerTableOption("importDataValidator");
		this.registerTableOption("importFileValidator");
	}
	
	initialize(){
		this.registerTableFunction("import", this.importFromFile.bind(this));
		
		if(this.table.options.importFormat){
			this.subscribe("data-loading", this.loadDataCheck.bind(this), 10);
			this.subscribe("data-load", this.loadData.bind(this), 10);
		}
	}
	
	loadDataCheck(data){
		return this.table.options.importFormat && (typeof data === "string" || (Array.isArray(data) && data.length && Array.isArray(data)));
	}
	
	loadData(data, params, config, silent, previousData){
		return this.importData(this.lookupImporter(), data)
			.then(this.structureData.bind(this))
			.catch((err) => {
				console.error("Import Error:", err || "Unable to import data");
				return Promise.reject(err);
			});
	}
	
	lookupImporter(importFormat){
		var importer;
		
		if(!importFormat){
			importFormat = this.table.options.importFormat;
		}
		
		if(typeof importFormat === "string"){
			importer = Import.importers[importFormat];
		}else{
			importer = importFormat;
		}
		
		if(!importer){
			console.error("Import Error - Importer not found:", importFormat);
		}
		
		return importer;
	}
	
	importFromFile(importFormat, extension, importReader){
		var importer = this.lookupImporter(importFormat);
		
		if(importer){
			return this.pickFile(extension, importReader)
				.then(this.importData.bind(this, importer))
				.then(this.structureData.bind(this))
				.then(this.mutateData.bind(this))
				.then(this.validateData.bind(this))
				.then(this.setData.bind(this))
				.catch((err) => {
					this.dispatch("import-error", err);
					this.dispatchExternal("importError", err);
					
					console.error("Import Error:", err || "Unable to import file");
					
					this.table.dataLoader.alertError();

					setTimeout(() => {
						this.table.dataLoader.clearAlert();
					}, 3000);
					
					return Promise.reject(err);
				});
		}
	}
	
	pickFile(extensions, importReader){
		return new Promise((resolve, reject) => {
			var input = document.createElement("input");
			input.type = "file";
			input.accept = extensions;
			
			input.addEventListener("change", (e) => {
				var file = input.files[0],
				reader = new FileReader(),
				valid = this.validateFile(file);

				if(valid === true){
				
					this.dispatch("import-importing", input.files);
					this.dispatchExternal("importImporting", input.files);
				
					switch(importReader || this.table.options.importReader){
						case "buffer":
							reader.readAsArrayBuffer(file);
							break;
						
						case "binary":
							reader.readAsBinaryString(file);
							break;
						
						case "url":
							reader.readAsDataURL(file);
							break;
						
						case "text":
						default:
							reader.readAsText(file);
					}
					
					reader.onload = (e) => {
						resolve(reader.result);
					};
					
					reader.onerror = (e) => {
						console.warn("File Load Error - Unable to read file");
						reject(e);
					};
				}else{
					reject(valid);
				}
			});
			
			this.dispatch("import-choose");
			this.dispatchExternal("importChoose");
			input.click();
		});
	}
	
	importData(importer, fileContents){
		var data;
		
		this.table.dataLoader.alertLoader();
		
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				data = importer.call(this.table, fileContents);
				
				if(data instanceof Promise){
					resolve(data);
				}else{
					data ? resolve(data) : reject();
				}
			}, 10);
		});
	}
	
	structureData(parsedData){
		var data = [];
		
		if(Array.isArray(parsedData) && parsedData.length && Array.isArray(parsedData[0])){
			if(this.table.options.autoColumns){
				data = this.structureArrayToObject(parsedData);
			}else{
				data = this.structureArrayToColumns(parsedData);
			}
			
			return data;
		}else{
			return parsedData;
		}
	}
	
	mutateData(data){
		var output = [];
		
		if(Array.isArray(data)){
			data.forEach((row) => {
				output.push(this.table.modules.mutator.transformRow(row, "import"));
			});
		}else{
			output = data;
		}
		
		return output;
	}
	
	transformHeader(headers){
		var output = [];
		
		if(this.table.options.importHeaderTransform){
			headers.forEach((item) => {
				output.push(this.table.options.importHeaderTransform.call(this.table, item, headers));
			});
		}else{
			return headers;
		}
		
		return output;
	}
	
	transformData(row){
		var output = [];

		if(this.table.options.importValueTransform){
			row.forEach((item) => {
				output.push(this.table.options.importValueTransform.call(this.table, item, row));
			});
		}else{
			return row;
		}
		
		return output;
	}
	
	structureArrayToObject(parsedData){
		var columns = this.transformHeader(parsedData.shift());	
		
		var data = parsedData.map((values) => {
			var row = {};

			values = this.transformData(values);
			
			columns.forEach((key, i) => {
				row[key] = values[i];
			});
			
			return row;
		});
		
		return data;
	}
	
	structureArrayToColumns(parsedData){
		var data = [],
		firstRow = this.transformHeader(parsedData[0]),
		columns = this.table.getColumns();
		
		//remove first row if it is the column names
		if(columns[0] && firstRow[0]){
			if(columns[0].getDefinition().title === firstRow[0]){
				parsedData.shift();
			}
		}
		
		//convert row arrays to objects
		parsedData.forEach((rowData) => {
			var row = {};

			rowData = this.transformData(rowData);
			
			rowData.forEach((value, index) => {
				var column = columns[index];
				
				if(column){
					row[column.getField()] = value;
				}
			});
			
			data.push(row);
		});
		
		return data;
	}

	validateFile(file){
		if(this.table.options.importFileValidator){
			return this.table.options.importFileValidator.call(this.table, file);
		}

		return true;
	}

	validateData(data){
		var result;

		if(this.table.options.importDataValidator){
			result = this.table.options.importDataValidator.call(this.table, data);

			if(result === true){
				return data;
			}else{
				return Promise.reject(result);
			}
		}

		return data;
	}
	
	setData(data){
		this.dispatch("import-imported", data);
		this.dispatchExternal("importImported", data);
		
		this.table.dataLoader.clearAlert();
		
		return this.table.setData(data);
	}
}