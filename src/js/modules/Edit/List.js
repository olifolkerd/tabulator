import maskInput from './inputMask.js';
import urlBuilder from '../Ajax/defaults/urlGenerator.js';

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
		
		this.initialValues = null; 
		
		this.isFilter = !cell._getSelf;
		
		this.filterTimeout = null;
		this.filtered = false;
		this.typing = false;
		
		this.values = []; 
		this.popup = null;  
		
		this.listIteration = 0;
		
		this.lastAction="";
		this.filterTerm="";
		
		this.blurable = true;
		
		this.actions = {
			success:success,
			cancel:cancel
		};
		
		this._deprecatedOptionsCheck();
		this._initializeValue();
		
		onRendered(this._onRendered.bind(this));
	}
	
	_deprecatedOptionsCheck(){
		if(this.params.listItemFormatter){
			this.cell.getTable().deprecationAdvisor.msg("The listItemFormatter editor param has been deprecated, please see the latest editor documentation for updated options");
		}
		
		if(this.params.sortValuesList){
			this.cell.getTable().deprecationAdvisor.msg("The sortValuesList editor param has been deprecated, please see the latest editor documentation for updated options");
		}
		
		if(this.params.searchFunc){
			this.cell.getTable().deprecationAdvisor.msg("The searchFunc editor param has been deprecated, please see the latest editor documentation for updated options");
		}
		
		if(this.params.searchingPlaceholder){
			this.cell.getTable().deprecationAdvisor.msg("The searchingPlaceholder editor param has been deprecated, please see the latest editor documentation for updated options");
		}
	}
	
	_initializeValue(){
		var initialValue = this.cell.getValue();
		
		if(typeof initialValue === "undefined" && typeof this.params.defaultValue !== "undefined"){
			initialValue = this.params.defaultValue;
		}
		
		this.initialValues = this.params.multiselect ? initialValue : [initialValue];
		
		if(this.isFilter){
			this.input.value = this.initialValues ? this.initialValues.join(",") : "";
			this.headerFilterInitialListGen();            
		}
	}
	
	_onRendered(){
		var cellEl = this.cell.getElement();
		
		function clickStop(e){
			e.stopPropagation();
		}	
	
		if(!this.isFilter){
			this.input.style.height = "100%";
			this.input.focus({preventScroll: true});
		}
		
		
		cellEl.addEventListener("click", clickStop);
		
		setTimeout(() => {
			cellEl.removeEventListener("click", clickStop);
		}, 1000);
		
		this.input.addEventListener("mousedown", this._preventPopupBlur.bind(this));
	}
	
	_createListElement(){
		var listEl = document.createElement("div");
		listEl.classList.add("tabulator-edit-list");
		
		listEl.addEventListener("mousedown", this._preventBlur.bind(this));
		listEl.addEventListener("keydown", this._inputKeyDown.bind(this));
		
		return listEl;
	}
	
	_setListWidth(){
		var element = this.isFilter ? this.input : this.cell.getElement();
		
		this.listEl.style.minWidth = element.offsetWidth + "px";
		
		if(this.params.maxWidth){
			if(this.params.maxWidth === true){
				this.listEl.style.maxWidth = element.offsetWidth + "px";
			}else if(typeof this.params.maxWidth === "number"){
				this.listEl.style.maxWidth = this.params.maxWidth + "px";
			}else{
				this.listEl.style.maxWidth = this.params.maxWidth;
			}
		}
		
	}
	
	_createInputElement(){
		var attribs = this.params.elementAttributes;
		var input = document.createElement("input");
		
		input.setAttribute("type", this.params.clearable ? "search" : "text");
		
		input.style.padding = "4px";
		input.style.width = "100%";
		input.style.boxSizing = "border-box";
		
		if(!this.params.autocomplete){
			input.style.cursor = "default";
			input.style.caretColor = "transparent";
			// input.readOnly = (this.edit.currentCell != false);
		}
		
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
		
		if(this.params.mask){
			maskInput(input, this.params);
		}
		
		this._bindInputEvents(input);
		
		return input;
	}
	
	_initializeParams(params){
		var valueKeys = ["values", "valuesURL", "valuesLookup"],
		valueCheck;
		
		params = Object.assign({}, params);
		
		params.verticalNavigation = params.verticalNavigation || "editor";
		params.placeholderLoading = typeof params.placeholderLoading === "undefined" ? "Searching ..." : params.placeholderLoading;
		params.placeholderEmpty = typeof params.placeholderEmpty === "undefined" ? "No Results Found" : params.placeholderEmpty;
		params.filterDelay = typeof params.filterDelay === "undefined" ? 300 : params.filterDelay;
		
		params.emptyValue = Object.keys(params).includes("emptyValue") ? params.emptyValue : "";
		
		valueCheck = Object.keys(params).filter(key => valueKeys.includes(key)).length;
		
		if(!valueCheck){
			console.warn("list editor config error - either the values, valuesURL, or valuesLookup option must be set");
		}else if(valueCheck > 1){
			console.warn("list editor config error - only one of the values, valuesURL, or valuesLookup options can be set on the same editor");
		}
		
		if(params.autocomplete){
			if(params.multiselect){
				params.multiselect = false;
				console.warn("list editor config error - multiselect option is not available when autocomplete is enabled");
			}
		}else{
			if(params.freetext){
				params.freetext = false;
				console.warn("list editor config error - freetext option is only available when autocomplete is enabled");
			}
			
			if(params.filterFunc){
				params.filterFunc = false;
				console.warn("list editor config error - filterFunc option is only available when autocomplete is enabled");
			}
			
			if(params.filterRemote){
				params.filterRemote = false;
				console.warn("list editor config error - filterRemote option is only available when autocomplete is enabled");
			}
			
			if(params.mask){
				params.mask = false;
				console.warn("list editor config error - mask option is only available when autocomplete is enabled");
			}
			
			if(params.allowEmpty){
				params.allowEmpty = false;
				console.warn("list editor config error - allowEmpty option is only available when autocomplete is enabled");
			}
			
			if(params.listOnEmpty){
				params.listOnEmpty = false;
				console.warn("list editor config error - listOnEmpty option is only available when autocomplete is enabled");
			}
		}
		
		if(params.filterRemote && !(typeof params.valuesLookup === "function" || params.valuesURL)){
			params.filterRemote = false;
			console.warn("list editor config error - filterRemote option should only be used when values list is populated from a remote source");
		}
		return params;
	}
	//////////////////////////////////////
	////////// Event Handling ////////////
	//////////////////////////////////////
	
	_bindInputEvents(input){
		input.addEventListener("focus", this._inputFocus.bind(this));
		input.addEventListener("click", this._inputClick.bind(this));
		input.addEventListener("blur", this._inputBlur.bind(this));
		input.addEventListener("keydown", this._inputKeyDown.bind(this));
		input.addEventListener("search", this._inputSearch.bind(this));
		
		if(this.params.autocomplete){
			input.addEventListener("keyup", this._inputKeyUp.bind(this));
		}
	}
	
	
	_inputFocus(e){
		this.rebuildOptionsList();
	}
	
	_filter(){
		if(this.params.filterRemote){
			clearTimeout(this.filterTimeout);
			
			this.filterTimeout = setTimeout(() => {
				this.rebuildOptionsList();
			}, this.params.filterDelay);
		}else{
			this._filterList();
		}
	}
	
	_inputClick(e){
		e.stopPropagation();
	}
	
	_inputBlur(e){
		if(this.blurable){
			if(this.popup){
				this.popup.hide();
			}else{
				this._resolveValue(true);
			}
		}
	}
	
	_inputSearch(){
		this._clearChoices();
	}
	
	_inputKeyDown(e){
		switch(e.keyCode){
			
			case 38: //up arrow
				this._keyUp(e);
				break;
			
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
				this._keySelectLetter(e);
		}
	}
	
	_inputKeyUp(e){
		switch(e.keyCode){
			case 38: //up arrow
			case 37: //left arrow
			case 39: //up arrow
			case 40: //right arrow
			case 13: //enter
			case 27: //escape
				break;
			
			default:
				this._keyAutoCompLetter(e);
		}
	}
	
	_preventPopupBlur(){
		if(this.popup){
			this.popup.blockHide();
		}
		
		setTimeout(() =>{
			if(this.popup){
				this.popup.restoreHide();
			}
		}, 10);
	}
	
	_preventBlur(){
		this.blurable = false;
		
		setTimeout(() =>{
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
		if(!this.params.autocomplete){
			e.stopImmediatePropagation();
			e.stopPropagation();
			e.preventDefault();
		}
	}
	
	_keyEnter(e){
		if(this.params.autocomplete && this.lastAction === "typing"){
			this._resolveValue(true);
		}else{
			if(this.focusedItem){
				this._chooseItem(this.focusedItem);
			}
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
	
	_keySelectLetter(e){
		if(!this.params.autocomplete){
			// if(this.edit.currentCell === false){
			e.preventDefault();
			// }
			
			if(e.keyCode >= 38 && e.keyCode <= 90){
				this._scrollToValue(e.keyCode);
			}
		}
	}
	
	_keyAutoCompLetter(e){
		this._filter();
		this.lastAction = "typing";
		this.typing = true;
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
		}, 800);
	}
	
	_focusItem(item){
		this.lastAction = "focus";
		
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
	headerFilterInitialListGen(){
		this._generateOptions(true);
	}
	
	rebuildOptionsList(){
		this._generateOptions()
			.then(this._sortOptions.bind(this))
			.then(this._buildList.bind(this))
			.then(this._showList.bind(this))
			.catch((e) => {
				if(!Number.isInteger(e)){
					console.error("List generation error", e);
				}
			});
	}
	
	_filterList(){
		this._buildList(this._filterOptions());
		this._showList();
	}
	
	_generateOptions(silent){
		var values = [];
		var iteration = ++ this.listIteration;
		
		this.filtered = false;
		
		if(this.params.values){
			values = this.params.values;
		}else if (this.params.valuesURL){
			values = this._ajaxRequest(this.params.valuesURL, this.input.value);
		}else{
			if(typeof this.params.valuesLookup === "function"){
				values = this.params.valuesLookup(this.cell, this.input.value);
			}else if(this.params.valuesLookup){
				values = this._uniqueColumnValues(this.params.valuesLookupField);
			}
		}
		
		if(values instanceof Promise){
			if(!silent){
				this._addPlaceholder(this.params.placeholderLoading);
			}
			
			return values.then()
				.then((responseValues) => {
					if(this.listIteration === iteration){
						return this._parseList(responseValues);
					}else{
						return Promise.reject(iteration);
					}
				});
		}else{
			return Promise.resolve(this._parseList(values));
		}
	}
	
	_addPlaceholder(contents){
		var placeholder = document.createElement("div");
		
		if(typeof contents === "function"){
			contents = contents(this.cell.getComponent(), this.listEl);
		}
		
		if(contents){
			this._clearList();
			
			if(contents instanceof HTMLElement){
				placeholder = contents;
			}else{
				placeholder.classList.add("tabulator-edit-list-placeholder");
				placeholder.innerHTML = contents;
			}
			
			this.listEl.appendChild(placeholder);
			
			this._showList();
		}
	}
	
	_ajaxRequest(url, term){
		var params = this.params.filterRemote ? {term:term} : {};
		url = urlBuilder(url, {}, params);
		
		return fetch(url)
			.then((response)=>{
				if(response.ok) {
					return response.json()
						.catch((error)=>{
							console.warn("List Ajax Load Error - Invalid JSON returned", error);
							return Promise.reject(error);
						});
				}else{
					console.error("List Ajax Load Error - Connection Error: " + response.status, response.statusText);
					return Promise.reject(response);
				}
			})
			.catch((error)=>{
				console.error("List Ajax Load Error - Connection Error: ", error);
				return Promise.reject(error);
			});
	}
	
	_uniqueColumnValues(field){
		var output = {},
		data = this.table.getData(this.params.valuesLookup),
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
				};
			}
			
			this._parseListItem(value, data, 0);
		});
		
		if(!this.currentItems.length && this.params.freetext){
			this.input.value = this.initialValues;
			this.typing = true;
			this.lastAction = "typing";
		}
		
		this.data = data;
		
		return data;    
	}
	
	_parseListItem(option, data, level){
		var item = {};
		
		if(option.options){
			item = this._parseListGroup(option, level + 1);
		}else{
			item = {
				label:option.label,
				value:option.value,
				itemParams:option.itemParams,
				elementAttributes: option.elementAttributes,
				element:false,
				selected:false,
				visible:true,
				level:level,
				original:option,
			};
			
			if(this.initialValues && this.initialValues.indexOf(option.value) > -1){
				this._chooseItem(item, true);
			}
		}
		
		data.push(item);
	}
	
	_parseListGroup(option, level){
		var item = {
			label:option.label,
			group:true,
			itemParams:option.itemParams,
			elementAttributes:option.elementAttributes,
			element:false,
			visible:true,
			level:level,
			options:[],
			original:option,
		};
		
		option.options.forEach((child) => {
			this._parseListItem(child, item.options, level);
		});
		
		return item;
	}
	
	_sortOptions(options){
		var sorter;
		
		if(this.params.sort){
			sorter = typeof this.params.sort === "function" ? this.params.sort : this._defaultSortFunction.bind(this);
			
			this._sortGroup(sorter, options);
		}
		
		return options;
	}
	
	_sortGroup(sorter, options){
		options.sort((a,b) => {
			return sorter(a.label, b.label, a.value, b.value, a.original, b.original);
		});
		
		options.forEach((option) => {
			if(option.group){
				this._sortGroup(sorter, option.options);
			}
		});
	}
	
	_defaultSortFunction(as, bs){
		var a, b, a1, b1, i= 0, L, rx = /(\d+)|(\D+)/g, rd = /\d/;
		var emptyAlign = 0;
		
		if(this.params.sort === "desc"){
			[as, bs] = [bs, as];
		}
		
		//handle empty values
		if(!as && as!== 0){
			emptyAlign =  !bs && bs!== 0 ? 0 : -1;
		}else if(!bs && bs!== 0){
			emptyAlign =  1;
		}else{
			if(isFinite(as) && isFinite(bs)) return as - bs;
			a = String(as).toLowerCase();
			b = String(bs).toLowerCase();
			if(a === b) return 0;
			if(!(rd.test(a) && rd.test(b))) return a > b ? 1 : -1;
			a = a.match(rx);
			b = b.match(rx);
			L = a.length > b.length ? b.length : a.length;
			while(i < L){
				a1= a[i];
				b1= b[i++];
				if(a1 !== b1){
					if(isFinite(a1) && isFinite(b1)){
						if(a1.charAt(0) === "0") a1 = "." + a1;
						if(b1.charAt(0) === "0") b1 = "." + b1;
						return a1 - b1;
					}
					else return a1 > b1 ? 1 : -1;
				}
			}
			
			return a.length > b.length;
		}
		
		return emptyAlign;
	}
	
	_filterOptions(){
		var filterFunc = this.params.filterFunc || this._defaultFilterFunc,
		term = this.input.value;
		
		if(term){
			this.filtered = true;
			
			this.data.forEach((item) => {
				this._filterItem(filterFunc, term, item);
			});
		}else{
			this.filtered = false;
		}
		
		return this.data;
	}
	
	_filterItem(func, term, item){
		var matches = false;
		
		if(!item.group){
			item.visible = func(term, item.label, item.value, item.original);
		}else{
			item.options.forEach((option) => {
				if(this._filterItem(func, term, option)){
					matches = true;
				}
			});
			
			item.visible = matches;
		}
		
		return item.visible;
	}
	
	_defaultFilterFunc(term, label, value, item){
		term = String(term).toLowerCase();
		
		if(label !== null && typeof label !== "undefined"){
			if(String(label).toLowerCase().indexOf(term) > -1 || String(value).toLowerCase().indexOf(term) > -1){
				return true;
			}
		}
		
		return false;
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
		
		if(!this.displayItems.length){
			this._addPlaceholder(this.params.placeholderEmpty);
		}  
	}
	
	_buildItem(item){
		var el = item.element,
		contents;
		
		if(!this.filtered || item.visible){
			
			if(!el){
				el = document.createElement("div");
				el.tabIndex = 0;
				
				contents = this.params.itemFormatter ? this.params.itemFormatter(item.label, item.value, item.original, el) : item.label;
				
				if(contents instanceof HTMLElement){
					el.appendChild(contents);
				}else{
					el.innerHTML = contents;
				}
				
				if(item.group){
					el.classList.add("tabulator-edit-list-group");
				}else{
					el.classList.add("tabulator-edit-list-item");
				}
				
				el.classList.add("tabulator-edit-list-group-level-" + item.level);
				
				if(item.elementAttributes && typeof item.elementAttributes == "object"){
					for (let key in item.elementAttributes){
						if(key.charAt(0) == "+"){
							key = key.slice(1);
							el.setAttribute(key, this.input.getAttribute(key) + item.elementAttributes["+" + key]);
						}else{
							el.setAttribute(key, item.elementAttributes[key]);
						}
					}
				}
				
				if(item.group){
					el.addEventListener("click", this._groupClick.bind(this, item));
				}else{
					el.addEventListener("click", this._itemClick.bind(this, item));
				}
				
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
	}
	
	_showList(){
		var startVis = this.popup && this.popup.isVisible();
		
		if(this.input.parentNode){
			if(this.params.autocomplete && this.input.value === "" && !this.params.listOnEmpty){
				if(this.popup){
					this.popup.hide(true);
				}
				return;
			}
			
			this._setListWidth();
			
			if(!this.popup){
				this.popup = this.edit.popup(this.listEl);
			}
			
			this.popup.show(this.cell.getElement(), "bottom");
			
			if(!startVis){
				setTimeout(() => {
					this.popup.hideOnBlur(this._resolveValue.bind(this, true));
				}, 10);
			}
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
		e.stopPropagation();
		
		this._chooseItem(item);
	}
	
	_groupClick(item, e){
		e.stopPropagation();
	}
	
	
	//////////////////////////////////////
	////// Current Item Management ///////
	//////////////////////////////////////
	
	_cancel(){
		this.popup.hide(true);
		this.actions.cancel();
	}
	
	_clearChoices(){
		this.typing = true;
		
		this.currentItems.forEach((item) => {
			item.selected = false;
			this._styleItem(item);
		});
		
		this.currentItems = [];
		
		this.focusedItem = null;
	}
	
	_chooseItem(item, silent){
		var index;
		
		this.typing = false;
		
		if(this.params.multiselect){
			index = this.currentItems.indexOf(item);
			
			if(index > -1){
				this.currentItems.splice(index, 1);
				item.selected = false;
			}else{
				this.currentItems.push(item);
				item.selected = true;
			}
			
			this.input.value = this.currentItems.map(item => item.label).join(",");
			
			this._styleItem(item);
			
		}else{
			this.currentItems = [item];
			item.selected = true;
			
			this.input.value = item.label;
			
			this._styleItem(item);
			
			if(!silent){
				this._resolveValue();
			}
		}
		
		this._focusItem(item);
	}
	
	_resolveValue(blur){
		var output, initialValue;

		if(this.popup){
			this.popup.hide(true);
		}
		
		if(this.params.multiselect){
			output = this.currentItems.map(item => item.value);
		}else{
			if(blur && this.params.autocomplete && this.typing){
				if(this.params.freetext || (this.params.allowEmpty && this.input.value === "")){
					output = this.input.value;
				}else{
					this.actions.cancel();
					return;
				}
			}else{
				if(this.currentItems[0]){
					output = this.currentItems[0].value;
				}else{
					initialValue = Array.isArray(this.initialValues) ? this.initialValues[0] : this.initialValues;
					
					if(initialValue === null || typeof initialValue === "undefined" || initialValue === ""){
						output = initialValue;
					}else{
						output = this.params.emptyValue;
					}
				}
				
			}
		}
		
		if(output === ""){
			output = this.params.emptyValue;
		}
		
		this.actions.success(output);
		
		if(this.isFilter){
			this.initialValues = output && !Array.isArray(output) ? [output] : output;
			this.currentItems = [];
		}
	}
	
}
