export default class Edit{
    constructor(editor, cell, onRendered, success, cancel, editorParams){
        this.edit = editor;
        this.table = editor.table;
        this.cell = cell;
        this.params = editorParams;
        
        this.data = [];
        
        this.input = this._createInputElement();
        this.listEl = this._createListElement();
        
        this.values = []; 
        this.popup = null;      
        
        this.actions = {
            success:success,
            cancel:cancel
        }
        
        onRendered(this._onRendered.bind(this));
    }
    
    _onRendered(){
        this.input.style.height = "100%";
        this.input.focus({preventScroll: true});
    }
    
    _createListElement(){
        var listEl = document.createElement("div");
        listEl.classList.add("tabulator-edit-select-list");
        
        return listEl;
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
        this._generateOptions()
        .then(this._buildList.bind(this, this.data))
        .then(this._showList.bind(this))
    }
    
    //////////////////////////////////////
    /////// Data List Generation ////////
    //////////////////////////////////////
    
    _generateOptions(){
        var paramValues = this.params.values;
        
        if(typeof paramValues === "function"){
            paramValues = paramValues(cell);
        }
        
        if(paramValues instanceof Promise){
            return paramValues.then(this._lookupValues.bind(this))
        }else{
            return Promise.resolve(this._lookupValues(paramValues));
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
            column = this.table.columnManager.getColumnByField(field);
        }else{
            column = this.cell.getColumn()._getSelf();
        }
        
        if(column){
            data.forEach((row) => {
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
        var data = [];
        
        if(!Array.isArray(inputValues)){
            inputValues = Object.entries(inputValues).map(([key, value]) => {
                return {
                    label:value,
                    value:key,
                };
            });
        }
        
        inputValues.forEach((value) => {
            if(typeof value !== "object"){
                value = {
                    label:value,
                    value:value,
                    element:false,
                };
            }
            
            this._parseListItem(value, data);
            
            this.data = data;
        });
    }
    
    _parseListItem(option, data){
        var item = {};
        
        if(option.options){
            this._parseListGroup(option);
        }else{
            item = {
                label:option.label,
                value:option.option,
                itemParams:option.itemParams,
                elementAttributes: option.elementAttributes,
                element:false,
            };
            
            data.push(item);
        }
    }
    
    _parseListGroup(option){
        var item = {
            label:option.label,
            group:true,
            itemParams:option.itemParams,
            elementAttributes:option.elementAttributes,
            element:false,
            options:[],
        };
        
        this.displayList.push(item);
        
        option.options.forEach((child) => {
            this._parseListItem(child, item.options);
        });
    }
    
    
    //////////////////////////////////////
    /////////// Display List /////////////
    //////////////////////////////////////
    
    _clearList(){
        while(this.listEl.firstChild) this.listEl.removeChild(this.listEl.firstChild);
    }

    _buildList(data){
        this._clearList();

        data.forEach((option) => {
            this._buildItem(option);
        });
    }
    
    _buildItem(item){
        var el = item.element,
        contents;
        
        if(!el){
            el = document.createElement("div");
            el.tabIndex = 0;
            
            contents = this.params.listItemFormatter ? this.params.listItemFormatter(item, el) : item.label;
            
            if(contents instanceof HTMLElement){
                el.appendChild(contents)
            }else{
                el.innerHTML = contents;
            }
            
            if(item.group){
                el.classList.add("tabulator-edit-select-list-group");
            }else{
                el.classList.add("tabulator-edit-select-list-item");
            }
            
            if(item.elementAttributes && typeof item.elementAttributes == "object"){
                for (let key in item.elementAttributes){
                    if(key.charAt(0) == "+"){
                        key = key.slice(1);
                        el.setAttribute(key, input.getAttribute(key) + item.elementAttributes["+" + key]);
                    }else{
                        el.setAttribute(key, item.elementAttributes[key]);
                    }
                }
            }
            
            el.addEventListener("click", this._itemClick.bind(this, item));

            item.el = el;
        }

        this.listEl.appendChild(el);

        if(item.group){
            item.options.forEach((option) => {
                this._buildItem(option);
            });
        }
    }

    _showList(){
        if(!this.popup){
            this.popup = this.edit.popup(this.listEl);
        }

        this.popup.show(this.cell.getElement());
    }
    
    //////////////////////////////////////
    ///////// User Interaction ///////////
    //////////////////////////////////////
    
    _itemClick(item, e){
        //select element
    }
    
    _itemMousedown(item, e){
        //block blur
    }
    
}