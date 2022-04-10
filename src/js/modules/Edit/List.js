export default class Edit{
    constructor(table, cell, onRendered, success, cancel, editorParams){
        this.table = table;
        this.cell = cell;
        this.params = editorParams;
        
        this.dataList = [];
        this.displayList = [];
        
        this.input = this._createInputElement();
        this.listEl = this._createListElement();
        
        this.values = [];        
        
        this.actions = {
            success:success,
            cancel:cancel
        }
        
        onRendered(this._onRendered.bind(this));
    }
    
    _onRendered(){
        input.style.height = "100%";
        input.focus({preventScroll: true});
    }
    
    _createListElement(){
        var liElst = document.createElement("div");
        list.classList.add("tabulator-edit-select-list");
        
        return list;
    }
    
    _createInputElement(){
        var attribs = this.params.elementAttributes;
        var input = document.createElement("input");
        
        input.setAttribute("type", this.params.clearable ? "search" : "text");
        
        input.style.padding = "4px";
        input.style.width = "100%";
        input.style.boxSizing = "border-box";
        
        if(attribs && typeof attribs == "object"){
            for (let key in attribs){
                if(key.charAt(0) == "+"){
                    key = key.slice(1);
                    input.setAttribute(key, input.getAttribute(key) + attribs["+" + key]);
                }else{
                    input.setAttribute(key, attribs[key]);
                }
            }
        }
        
        this._bindInputEvents(input);
        
        return input;
    }
    
    //////////////////////////////////////
    ////////// Event Handling ////////////
    //////////////////////////////////////
    
    _bindInputEvents(input){
        input.addEventListener("focus", this._inputFocus.bind(this))
    }
    
    
    _inputFocus(){
        
    }
    
    //////////////////////////////////////
    /////// Value List Generation ////////
    //////////////////////////////////////
    
    _generateValueList(){
        var paramValues = this.params.values;
        
        if(typeof paramValues === "function"){
            paramValues = paramValues(cell);
        }
        
        if(paramValues instanceof Promise){
            paramValues.then(this._lookupValues.bind(this))
        }else{
            this._lookupValues(paramValues);
        }
    }
    
    _lookupValues(paramValues){
        if(paramValues === true){
            paramValues = this._uniqueColumnValues();//lookup this column
        }else if(typeof paramValues === "string"){
            paramValues = this._uniqueColumnValues(paramValues);//lookup specific column
        }
        
        this._parseList(paramValues);
    }
    
    _uniqueColumnValues(field){
        var output = {},
        data = this.table.getData(this.params.valueLookupRange),
        column;
        
        if(field){
            column = self.table.columnManager.getColumnByField(field);
        }else{
            column = cell.getColumn()._getSelf();
        }
        
        if(column){
            data.forEach(function(row){
                var val = column.getFieldValue(row);
                
                if(val !== null && typeof val !== "undefined" && val !== ""){
                    output[val] = true;
                }
            });
        }else{
            console.warn("unable to find matching column to create select lookup list:", field);
            output = [];
        }
        
        return Object.keys(output);
    }
    
    
    _parseList(inputValues){
        this.dataList = [];
        this.displayList = [];
        
        if(!Array.isArray(inputValues)){
            inputValues = Object.entries(inputValues).map(([key, value]) => {
                return {
                    label:value,
                    value:key,
                };
            });
        }
        
        inputValues.forEach(function(value){
            if(typeof value !== "object"){
                value = {
                    label:value,
                    value:value,
                    element:false,
                };
            }
            
            this._parseListItem(value);
        });
    }
    
    _parseListItem(value){
        var item = {};
        
        if(value.options){
            this._parseListGroup(value);
        }else{
            item = {
				label:value.label,
				value:this.params.listItemFormatter ? this.params.listItemFormatter(value.value, value.label) : value.label,
				itemParams:value.itemParams,
				elementAttributes: value.elementAttributes,
				element:false,
			};

            this.dataList.push(item);
			this.displayList.push(item);
        }
    }
    
    _parseListGroup(value){
        var item = {
            label:value.label,
            group:true,
            itemParams:value.itemParams,
            elementAttributes:value.elementAttributes,
            element:false,
        };
        
        this.displayList.push(item);
        
        value.options.forEach(function(item){
            this._parseListItem(item);
        });
    }
    
}