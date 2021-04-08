import Helpers from '../../../../core/tools/Helpers.js';

//dropdown select editor
export default function(cell, onRendered, success, cancel, editorParams){
	var self = this,
	cellEl = cell.getElement(),
	initialValue = cell.getValue(),
	vertNav = editorParams.verticalNavigation || "editor",
	initialDisplayValue = typeof initialValue !== "undefined" || initialValue === null ? (Array.isArray(initialValue) ? initialValue : [initialValue]) : (typeof editorParams.defaultValue !== "undefined" ? editorParams.defaultValue : []),
	input = document.createElement("input"),
	listEl = document.createElement("div"),
	multiselect = editorParams.multiselect,
	dataItems = [],
	currentItem = {},
	displayItems = [],
	currentItems = [],
	blurable = true,
	blockListShow = false,
	searchWord = "",
	searchWordTimeout = null;

	if(Array.isArray(editorParams) || (!Array.isArray(editorParams) && typeof editorParams === "object" && !editorParams.values)){
		console.warn("DEPRECATION WARNING - values for the select editor must now be passed into the values property of the editorParams object, not as the editorParams object");
		editorParams = {values:editorParams};
	}

	function getUniqueColumnValues(field){
		var output = {},
		data = self.table.getData(),
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
		}

		return Object.keys(output);
	}

	function parseItems(inputValues, curentValues){
		var dataList = [];
		var displayList = [];

		function processComplexListItem(item){
			var item = {
				label:item.label,
				value:item.value,
				itemParams:item.itemParams,
				elementAttributes: item.elementAttributes,
				element:false,
			};

			// if(item.value === curentValue || (!isNaN(parseFloat(item.value)) && !isNaN(parseFloat(item.value)) && parseFloat(item.value) === parseFloat(curentValue))){
			// 	setCurrentItem(item);
			// }

			if(curentValues.indexOf(item.value) > -1){
				setItem(item);
			}

			dataList.push(item);
			displayList.push(item);

			return item;
		}

		if(typeof inputValues == "function"){
			inputValues = inputValues(cell);
		}

		if(Array.isArray(inputValues)){
			inputValues.forEach(function(value){
				var item;

				if(typeof value === "object"){

					if(value.options){
						item = {
							label:value.label,
							group:true,
							itemParams:value.itemParams,
							elementAttributes:value.elementAttributes,
							element:false,
						};

						displayList.push(item);

						value.options.forEach(function(item){
							processComplexListItem(item);
						});
					}else{
						processComplexListItem(value);
					}

				}else{

					item = {
						label:value,
						value:value,
						element:false,
					};

					// if(item.value === curentValue || (!isNaN(parseFloat(item.value)) && !isNaN(parseFloat(item.value)) && parseFloat(item.value) === parseFloat(curentValue))){
					// 	setCurrentItem(item);
					// }

					if(curentValues.indexOf(item.value) > -1){
						setItem(item);
					}

					dataList.push(item);
					displayList.push(item);
				}
			});
		}else{
			for(var key in inputValues){
				var item = {
					label:inputValues[key],
					value:key,
					element:false,
				};

				// if(item.value === curentValue || (!isNaN(parseFloat(item.value)) && !isNaN(parseFloat(item.value)) && parseFloat(item.value) === parseFloat(curentValue))){
				// 	setCurrentItem(item);
				// }

				if(curentValues.indexOf(item.value) > -1){
					setItem(item);
				}

				dataList.push(item);
				displayList.push(item);
			}
		}

		if(editorParams.sortValuesList){
			dataList.sort((a, b) => {
				return a.label < b.label ? -1 : (a.label > b.label ? 1 : 0);
			});

			displayList.sort((a, b) => {
				return a.label < b.label ? -1 : (a.label > b.label ? 1 : 0);
			});

			if(editorParams.sortValuesList !== "asc"){
				dataList.reverse();
				displayList.reverse();
			}
		}

		dataItems = dataList;
		displayItems = displayList;

		fillList();
	}

	function fillList(){
		while(listEl.firstChild) listEl.removeChild(listEl.firstChild);

		displayItems.forEach(function(item){

			var el = item.element;

			if(!el){
				el = document.createElement("div");
				item.label = editorParams.listItemFormatter ? editorParams.listItemFormatter(item.value, item.label, cell, el, item.itemParams) : item.label;
				if(item.group){
					el.classList.add("tabulator-edit-select-list-group");
					el.tabIndex = 0;
					el.innerHTML = item.label === "" ? "&nbsp;" : item.label;
				}else{
					el.classList.add("tabulator-edit-select-list-item");
					el.tabIndex = 0;
					el.innerHTML = item.label === "" ? "&nbsp;" : item.label;

					el.addEventListener("click", function(){
						blockListShow = true;

						setTimeout(() => {
							blockListShow = false;
						}, 10);

						// setCurrentItem(item);
						// chooseItem();
						if(multiselect){
							toggleItem(item);
							input.focus();
						}else{
							chooseItem(item);
						}

					});

					// if(item === currentItem){
					// 	el.classList.add("active");
					// }

					if(currentItems.indexOf(item) > -1){
						el.classList.add("active");
					}
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
				el.addEventListener("mousedown", function(){
					blurable = false;

					setTimeout(function(){
						blurable = true;
					}, 10);
				});

				item.element = el;


			}

			listEl.appendChild(el);
		});
	}


	function setCurrentItem(item, active){

		if(!multiselect && currentItem && currentItem.element){
			currentItem.element.classList.remove("active");
		}

		if(currentItem && currentItem.element){
			currentItem.element.classList.remove("focused");
		}

		currentItem = item;

		if(item.element){
			item.element.classList.add("focused");
			if(active){
				item.element.classList.add("active");
			}
		}

		if(item && item.element && item.element.scrollIntoView){
			item.element.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'start'});
		}
	}


	// function chooseItem(){
	// 	hideList();

	// 	if(initialValue !== currentItem.value){
	// 		initialValue = currentItem.value;
	// 		success(currentItem.value);
	// 	}else{
	// 		cancel();
	// 	}
	// }

	function setItem(item) {
		var index = currentItems.indexOf(item);

		if(index == -1){
			currentItems.push(item);
			setCurrentItem(item, true);
		}

		fillInput();
	}

	function unsetItem(index) {
		var item = currentItems[index];

		if(index > -1){
			currentItems.splice(index, 1);
			if(item.element){
				item.element.classList.remove("active");
			}
		}
	}

	function toggleItem(item) {
		if(!item){
			item = currentItem;
		}

		var index = currentItems.indexOf(item);

		if(index > -1){
			unsetItem(index);
		}else{
			if(multiselect !== true && currentItems.length >= multiselect){
				unsetItem(0);
			}

			setItem(item);
		}

		fillInput();

	}

	function chooseItem(item){
		hideList();

		if(!item){
			item = currentItem;
		}

		if(item){
			input.value = item.label;
			success(item.value);
		}

		initialDisplayValue = [item.value];
	}


	function chooseItems(silent){
		if(!silent){
			hideList();
		}

		var output = [];

		currentItems.forEach((item) => {
			output.push(item.value);
		});

		initialDisplayValue = output;

		success(output);
	}

	function fillInput(){
		var output = [];

		currentItems.forEach((item) => {
			output.push(item.label);
		});

		input.value = output.join(", ");

		if(self.currentCell === false){
			chooseItems(true);
		}
	}


	function unsetItems() {

		var len = currentItems.length;

		for(let i = 0; i < len; i++){
			unsetItem(0);
		}
	}

	function cancelItem(){
		hideList();
		cancel();
	}

	function showList(){
		currentItems = [];

		if(!listEl.parentNode){
			if(editorParams.values === true){
				parseItems(getUniqueColumnValues(), initialDisplayValue);
			}else if(typeof editorParams.values === "string"){
				parseItems(getUniqueColumnValues(editorParams.values), initialDisplayValue);
			}else{
				parseItems(editorParams.values || [], initialDisplayValue);
			}


			var offset = Helpers.elOffset(cellEl);

			listEl.style.minWidth = cellEl.offsetWidth + "px";

			listEl.style.top = (offset.top + cellEl.offsetHeight) + "px";
			listEl.style.left = offset.left + "px";


			listEl.addEventListener("mousedown", function(e){
				blurable = false;

				setTimeout(function(){
					blurable = true;
				}, 10);
			});

			document.body.appendChild(listEl);
		}
	}

	function hideList(){
		if(listEl.parentNode){
			listEl.parentNode.removeChild(listEl);
		}

		removeScrollListener();
	}

	function removeScrollListener() {
		self.table.rowManager.element.removeEventListener("scroll", cancelItem);
	}

	function scrollTovalue(char){

		clearTimeout(searchWordTimeout);

		var character = String.fromCharCode(event.keyCode).toLowerCase();
		searchWord += character.toLowerCase();

		var match = dataItems.find((item) => {
			return typeof item.label !== "undefined" && item.label.toLowerCase().startsWith(searchWord);
		});

		if(match){
			setCurrentItem(match, !multiselect);
		}

		searchWordTimeout = setTimeout(() => {
			searchWord = "";
		}, 800)
	}

	//style input
	input.setAttribute("type", "text");

	input.style.padding = "4px";
	input.style.width = "100%";
	input.style.boxSizing = "border-box";
	input.style.cursor = "default";
	input.readOnly = (this.currentCell != false);

	if(editorParams.elementAttributes && typeof editorParams.elementAttributes == "object"){
		for (let key in editorParams.elementAttributes){
			if(key.charAt(0) == "+"){
				key = key.slice(1);
				input.setAttribute(key, input.getAttribute(key) + editorParams.elementAttributes["+" + key]);
			}else{
				input.setAttribute(key, editorParams.elementAttributes[key]);
			}
		}
	}

	input.value = typeof initialValue !== "undefined" || initialValue === null ? initialValue : "";

	// if(editorParams.values === true){
	// 	parseItems(getUniqueColumnValues(), initialValue);
	// }else if(typeof editorParams.values === "string"){
	// 	parseItems(getUniqueColumnValues(editorParams.values), initialValue);
	// }else{
	// 	parseItems(editorParams.values || [], initialValue);
	// }

	input.addEventListener("search", function(e){
		if(!input.value){
			unsetItems();
			chooseItems();
		}
	});

	//allow key based navigation
	input.addEventListener("keydown", function(e){
		var index;

		switch(e.keyCode){
			case 38: //up arrow
			index = dataItems.indexOf(currentItem);

			if(vertNav == "editor" || (vertNav == "hybrid" && index)){
				e.stopImmediatePropagation();
				e.stopPropagation();
				e.preventDefault();

				if(index > 0){
					setCurrentItem(dataItems[index - 1], !multiselect);
				}
			}
			break;

			case 40: //down arrow
			index = dataItems.indexOf(currentItem);

			if(vertNav == "editor" || (vertNav == "hybrid" && index < dataItems.length - 1)){
				e.stopImmediatePropagation();
				e.stopPropagation();
				e.preventDefault();

				if(index < dataItems.length - 1){
					if(index == -1){
						setCurrentItem(dataItems[0], !multiselect);
					}else{
						setCurrentItem(dataItems[index + 1], !multiselect);
					}
				}
			}
			break;

			case 37: //left arrow
			case 39: //right arrow
			e.stopImmediatePropagation();
			e.stopPropagation();
			e.preventDefault();
			break;

			case 13: //enter
			// chooseItem();

			if(multiselect){
				toggleItem();
			}else{
				chooseItem();
			}

			break;

			case 27: //escape
			cancelItem();
			break;

			case 9: //tab
			break;

			default:
			if(self.currentCell === false){
				e.preventDefault();
			}

			if(e.keyCode >= 38 && e.keyCode <= 90){
				scrollTovalue(e.keyCode);
			}
		}
	});

	input.addEventListener("blur", function(e){
		if(blurable){
			if(multiselect){
				chooseItems();
			}else{
				cancelItem();
			}
		}
	});

	input.addEventListener("focus", function(e){
		if(!blockListShow){
			showList();
		}
	});

	//style list element
	listEl = document.createElement("div");
	listEl.classList.add("tabulator-edit-select-list");

	onRendered(function(){
		input.style.height = "100%";
		input.focus({preventScroll: true});
	});

	setTimeout(() => {
		this.table.rowManager.element.addEventListener("scroll", cancelItem);
	}, 10);

	return input;
};