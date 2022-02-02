import Module from '../../core/Module.js';

import defaultImporters from './defaults/importers.js';

class Import extends Module{
    
    constructor(table){
        super(table);
        
        this.registerTableOption("importFormat");
        this.registerTableOption("importReader", "text");
    }
    
    initialize(){
        this.registerTableFunction("import", this.importFromFile.bind(this));

        if(this.table.options.importFormat){
            this.subscribe("data-loading", this.loadDataCheck.bind(this), 10);
            this.subscribe("data-load", this.loadData.bind(this), 10);
        }
    }

    loadDataCheck(data){
        return typeof data === "string";
    }

    loadData(data, params, config, silent, previousData){
        return this.importData(this.lookupImporter(), data)
        .then(this.structureData.bind(this))
        .catch((err) => {
            console.error("Import Error:", err || "Unable to import data")
            return Promise.reject(err);
        })
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
    
    importFromFile(importFormat, extension){
        var importer = this.lookupImporter(importFormat);
        
        if(importer){
            return this.pickFile(extension)
            .then(this.importData.bind(this, importer))
            .then(this.structureData.bind(this))
            .then(this.setData.bind(this))
            .catch((err) => {
                console.error("Import Error:", err || "Unable to import file")
                return Promise.reject(err);
            })
        }
    }
    
    pickFile(extensions){
        return new Promise((resolve, reject) => {
            var input = document.createElement("input");
            input.type = "file";
            input.accept = extensions;
            
            input.addEventListener("change", (e) => {
                var file = input.files[0],
                reader = new FileReader(),
                data;
                
                switch(this.table.options.importReader){
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
                    resolve(reader.result)
                };
                
                reader.onerror = (e) => {
                    console.warn("File Load Error - Unable to read file");
                    reject();
                };
            });
            
            input.click();
        });
    }
    
    importData(importer, fileContents){
        var data = importer.call(this.table, fileContents);
        
        if(data instanceof Promise){
            return data;
        }else{
            return data ? Promise.resolve(data) : Promise.reject();
        }
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

    structureArrayToObject(parsedData){
        var columns = parsedData.shift();

        var data = parsedData.map((values) => {
            var row = {};

            columns.forEach((key, i) => {
                row[key] = values[i];
            })

            return row;
        })

        return data;
    }

    structureArrayToColumns(parsedData){
        var data = [],
        columns = this.table.getColumns();

        //remove first row if it is the column names
        if(columns[0] && parsedData[0][0]){
            if(columns[0].getDefinition().title === parsedData[0][0]){
                parsedData.shift();
            }
        }
        
        //convert row arrays to objects
        parsedData.forEach((rowData) => {
            var row = {};

            rowData.forEach((value, index) => {
                var column = columns[index];

                if(column){
                    row[column.getField()] = value;
                }
            })

            data.push(row);
        });

        return data;
    }
    
    setData(data){
        return this.table.setData(data);
    }
}

Import.moduleName = "import";

//load defaults
Import.importers = defaultImporters;

export default Import;