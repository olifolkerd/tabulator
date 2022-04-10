export default class Edit{
    constructor(editor, cell, onRendered, success, cancel, editorParams){
        this.edit = editor;
        this.table = editor.table;
        this.cell = cell;
        this.params = this._initializeParams(editorParams);
        
        this.data = [];
        this.displayItems = [];
        this.currentItems = [];
        this.focusedItem = null;
        
        this.input = this._createInputElement();
        this.listEl = this._createListElement();
        
        this.initialValues = this.params.multiselect ? cell.getValue() : [cell.getValue()];
        
        this.filterTimeout = null;
        this.filterTerm = "";
        
        this.values = []; 
        this.popup = null;  
        
        this.blurable = true;
        
        this.actions = {
            success:success,
            cancel:cancel
        }
        
        onRendered(this._onRendered.bind(this));
    }
    
    _onRendered(){
        var cellEl = this.cell.getElement();
        
        function clickStop(e){
            e.stopPropagation();
        }
        
        this.input.style.height = "100%";
        this.input.focus({preventScroll: true});
        
        
        cellEl.addEventListener("click", clickStop);
        
        setTimeout(() => {
            cellEl.removeEventListener("click", clickStop);
        }, 1000)
    }
    
    _createListElement(){
        var listEl = document.createElement("div");
        listEl.classList.add("tabulator-edit-select-list");
        
        listEl.style.minWidth = this.cell.getElement().offsetWidth + "px";
        
        listEl.addEventListener("mousedown", this._preventBlur.bind(this));
        listEl.addEventListener("keydown", this._inputKeyDown.bind(this))
        
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
    
    _initializeParams(params){
        params = Object.assign({}, params);
        
        params.verticalNavigation = params.verticalNavigation || "editor";
        
        return params;
    }
    //////////////////////////////////////
    ////////// Event Handling ////////////
    //////////////////////////////////////
    
    _bindInputEvents(input){
        input.addEventListener("focus", this._inputFocus.bind(this))
        input.addEventListener("click", this._inputClick.bind(this))
        input.addEventListener("blur", this._inputBlur.bind(this))
        input.addEventListener("keydown", this._inputKeyDown.bind(this))
    }
    
    
    _inputFocus(e){
        this._generateOptions()
        .then(this._buildList.bind(this, this.data))
        .then(this._showList.bind(this))
    }
    
    _inputClick(e){
        e.stopPropagation();
    }
    
    _inputBlur(e){
        if(this.blurable && this.popup){
            this.popup.hide();
        }
    }
    
    _inputKeyDown(e){
        switch(e.keyCode){
            
            case 38: //up arrow
            this._keyUp(e);
            break
            
            case 40: //down arrow
            this._keyDown(e);
            break;
            
            case 37: //left arrow
            case 39: //right arrow
            this._keySide(e);
            break;
            
            case 13: //enter
            this._keyEnter();
            break;
            
            case 27: //escape
            this._keyEsc();
            break;
            
            case 36: //home
            case 35: //end
            this._keyHomeEnd(e);
            break;
            
            case 9: //tab
            break;
            
            default:
            this._keyLetter(e);
        }
    }
    
    _preventBlur(){
        this.blurable = false;
        
        setTimeout(function(){
            this.blurable = true;
        }, 10);
    }
    
    //////////////////////////////////////
    //////// Keyboard Navigation /////////
    //////////////////////////////////////
    
    _keyUp(e){
        var index = this.displayItems.indexOf(this.focusedItem);
        
        if(this.params.verticalNavigation == "editor" || (this.params.verticalNavigation == "hybrid" && index)){
            e.stopImmediatePropagation();
            e.stopPropagation();
            e.preventDefault();
            
            if(index > 0){
                this._focusItem(this.displayItems[index - 1]);
            }
        }
    }
    
    _keyDown(e){
        var index = this.displayItems.indexOf(this.focusedItem);
        
        if(this.params.verticalNavigation == "editor" || (this.params.verticalNavigation == "hybrid" && index < this.displayItems.length - 1)){
            e.stopImmediatePropagation();
            e.stopPropagation();
            e.preventDefault();
            
            if(index < this.displayItems.length - 1){
                if(index == -1){
                    this._focusItem(this.displayItems[0]);
                }else{
                    this._focusItem(this.displayItems[index + 1]);
                }
            }
        }
    }
    
    _keySide(e){
        e.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();
    }
    
    _keyEnter(e){
        if(this.focusedItem){
            this._chooseItem(this.focusedItem);
        }else{
            this.cancel();
        }
    }
    
    _keyEsc(e){
        this._cancel();
    }
    
    _keyHomeEnd(e){
        if(this.params.autocomplete){
            //prevent table navigation while using input element
            e.stopImmediatePropagation();
        }
    }
    
    _keyLetter(e){
        if(this.params.autocomplete){
            
        }else{
            if(this.edit.currentCell === false){
                e.preventDefault();
            }
            
            if(e.keyCode >= 38 && e.keyCode <= 90){
                this._scrollToValue(e.keyCode);
            }
        }
    }
    _scrollToValue(char){
        clearTimeout(this.filterTimeout);
        
        var character = String.fromCharCode(char).toLowerCase();
        this.filterTerm += character.toLowerCase();
        
        var match = this.displayItems.find((item) => {
            return typeof item.label !== "undefined" && item.label.toLowerCase().startsWith(this.filterTerm);
        });
        
        if(match){
            this._focusItem(match);
        }
        
        this.filterTimeout = setTimeout(() => {
            this.filterTerm = "";
        }, 800)
    }
    
    _focusItem(item){
        if(this.focusedItem && this.focusedItem.element){
            this.focusedItem.element.classList.remove("focused");
        }
        
        this.focusedItem = item;
        
        if(item && item.element){
            item.element.classList.add("focused");
            item.element.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'start'});
        }
    }
    
    
    //////////////////////////////////////
    /////// Data List Generation /////////
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
                value:option.value,
                itemParams:option.itemParams,
                elementAttributes: option.elementAttributes,
                element:false,
                selected:false,
            };
            
            data.push(item);
            
            if(this.initialValues && this.initialValues.indexOf(option.value) > -1){
                this._chooseItem(item, true);
            }
        }
    }
    
    _parseListGroup(option, data){
        var item = {
            label:option.label,
            group:true,
            itemParams:option.itemParams,
            elementAttributes:option.elementAttributes,
            element:false,
            options:[],
        };
        
        data.push(item);
        
        option.options.forEach((child) => {
            this._parseListItem(child, item.options);
        });
    }
    
    
    //////////////////////////////////////
    /////////// Display List /////////////
    //////////////////////////////////////
    
    _clearList(){
        while(this.listEl.firstChild) this.listEl.removeChild(this.listEl.firstChild);
        
        this.displayItems = [];
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
            el.addEventListener("mousedown", this._preventBlur.bind(this));
            
            item.element = el;
        }
        
        this._styleItem(item);
        
        this.listEl.appendChild(el);
        
        if(item.group){
            item.options.forEach((option) => {
                this._buildItem(option);
            });
        }else{
            this.displayItems.push(item);
        }
    }
    
    _showList(){
        if(!this.popup){
            this.popup = this.edit.popup(this.listEl);
        }
        
        if(!this.popup.isVisible()){
            this.popup.show(this.cell.getElement(), "bottom").hideOnBlur(this._resolveValue.bind(this));
        }
    }
    
    _styleItem(item){
        if(item && item.element){
            if(item.selected){
                item.element.classList.add("active");
            }else{
                item.element.classList.remove("active");
            }
        }
    }
    
    //////////////////////////////////////
    ///////// User Interaction ///////////
    //////////////////////////////////////
    
    _itemClick(item, e){
        //select element
        e.stopPropagation();
        
        this._chooseItem(item);
    }
    
    //////////////////////////////////////
    ////// Current Item Management ///////
    //////////////////////////////////////
    
    _cancel(){
        this.popup.hide(true);
        this.actions.cancel();
    }
    
    _chooseItem(item, silent){
        var index;
        
        if(this.params.multiselect){
            index = this.currentItems.indexOf(item);
            
            if(index > -1){
                this.currentItems.splice(index, 1);
                item.selected = false;
            }else{
                this.currentItems.push(item);
                item.selected = true;
            }
            
            this.input.value = this.currentItems.map(item => item.value).join(",");
            
            this._styleItem(item);
            
        }else{
            this.currentItems = [item];
            item.selected = true;
            
            this.input.value = item.value;
            
            if(!silent){
                this._resolveValue();
            }
        }
        
        this._focusItem(item);
    }
    
    _resolveValue(){
        this.popup.hide(true);
        
        if(this.params.multiselect){
            this.actions.success(this.currentItems.map(item => item.value));
        }else{
            this.actions.success(this.currentItems[0] ? this.currentItems[0].value : this.initialValues[0]);
        }
    }
    
}