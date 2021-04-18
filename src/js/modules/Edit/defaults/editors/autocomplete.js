import Helpers from '../../../../core/tools/Helpers.js';
import maskInput from '../../inputMask.js';

//autocomplete
export default function(cell, onRendered, success, cancel, editorParams){
	var self = this,
	cellEl = cell.getElement(),
	initialValue = cell.getValue(),
	vertNav = editorParams.verticalNavigation || "editor",
	initialDisplayValue = typeof initialValue !== "undefined" || initialValue === null ? initialValue : (typeof editorParams.defaultValue !== "undefined" ? editorParams.defaultValue : ""),
	input = document.createElement("input"),
	listEl = document.createElement("div"),
	allItems = [],
	displayItems = [],
	values = [],
	currentItem = false,
	blurable = true,
	uniqueColumnValues = false;

	//style input
	input.setAttribute("type", "search");

	input.style.padding = "4px";
	input.style.width = "100%";
	input.style.boxSizing = "border-box";

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

	//style list element
	listEl.classList.add("tabulator-edit-select-list");

	listEl.addEventListener("mousedown", function(e){
		blurable = false;

		setTimeout(function(){
			blurable = true;
		}, 10);
	});


	function genUniqueColumnValues(){
		if(editorParams.values === true){
			uniqueColumnValues = getUniqueColumnValues();
		}else if(typeof editorParams.values === "string"){
			uniqueColumnValues = getUniqueColumnValues(editorParams.values);
		}
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

			if(editorParams.sortValuesList){
				if(editorParams.sortValuesList == "asc"){
					output = Object.keys(output).sort();
				}else{
					output = Object.keys(output).sort().reverse();
				}
			}else{
				output = Object.keys(output);
			}
		}else{
			console.warn("unable to find matching column to create autocomplete lookup list:", field);
		}


		return output;
	}

	function filterList(term, intialLoad){
		var matches = [],
		values, items, searchEl;

		//lookup base values list
		if(uniqueColumnValues){
			values = uniqueColumnValues;
		}else{
			values = editorParams.values || [];
		}

		if(editorParams.searchFunc){
			matches = editorParams.searchFunc(term, values);

			if(matches instanceof Promise){

				addNotice(typeof editorParams.searchingPlaceholder !== "undefined" ? editorParams.searchingPlaceholder : "Searching...");

				matches.then((result) => {
					fillListIfNotEmpty(parseItems(result), intialLoad);
				}).catch((err) => {
					console.err("error in autocomplete search promise:", err);
				});

			}else{
				fillListIfNotEmpty(parseItems(matches), intialLoad);
			}
		}else{
			items = parseItems(values);

			if(term === ""){
				if(editorParams.showListOnEmpty){
					matches = items;
				}
			}else{
				items.forEach(function(item){
					if(item.value !== null || typeof item.value !== "undefined"){
						if(String(item.value).toLowerCase().indexOf(String(term).toLowerCase()) > -1 || String(item.title).toLowerCase().indexOf(String(term).toLowerCase()) > -1){
							matches.push(item);
						}
					}
				});
			}

			fillListIfNotEmpty(matches, intialLoad);
		}
	}

	function addNotice(notice){
		var searchEl = document.createElement("div");

		clearList();

		if(notice !== false){
			searchEl.classList.add("tabulator-edit-select-list-notice");
			searchEl.tabIndex = 0;

			if(notice instanceof Node){
				searchEl.appendChild(notice);
			}else{
				searchEl.innerHTML = notice;
			}

			listEl.appendChild(searchEl);
		}
	}

	function parseItems(inputValues){
		var itemList = [];

		if(Array.isArray(inputValues)){
			inputValues.forEach(function(value){

				var item = {};

				if(typeof value === "object"){
					item.title = editorParams.listItemFormatter ? editorParams.listItemFormatter(value.value, value.label) : value.label;
					item.value = value.value;
				}else{
					item.title = editorParams.listItemFormatter ? editorParams.listItemFormatter(value, value) : value;
					item.value = value;
				}

				itemList.push(item);
			});
		}else{
			for(var key in inputValues){
				var item = {
					title:editorParams.listItemFormatter ? editorParams.listItemFormatter(key, inputValues[key]) : inputValues[key],
					value:key,
				};

				itemList.push(item);
			}
		}

		return itemList;
	}

	function clearList(){
		while(listEl.firstChild) listEl.removeChild(listEl.firstChild);
	}

	function fillListIfNotEmpty(items, intialLoad){
		if(items.length){
			fillList(items, intialLoad);
		}else{
			if(editorParams.emptyPlaceholder){
				addNotice(editorParams.emptyPlaceholder);
			}
		}
	}

	function fillList(items, intialLoad){
		var current = false;

		clearList();

		displayItems = items;

		displayItems.forEach(function(item){
			var el = item.element;

			if(!el){
				el = document.createElement("div");
				el.classList.add("tabulator-edit-select-list-item");
				el.tabIndex = 0;
				el.innerHTML = item.title;

				el.addEventListener("click", function(e){
					setCurrentItem(item);
					chooseItem();
				});

				el.addEventListener("mousedown", function(e){
					blurable = false;

					setTimeout(function(){
						blurable = true;
					}, 10);
				});

				item.element = el;

				if(intialLoad && item.value == initialValue){
					input.value = item.title;
					item.element.classList.add("active");
					current = true;
				}

				if(item === currentItem){
					item.element.classList.add("active");
					current = true;
				}
			}

			listEl.appendChild(el);
		});

		if(!current){
			setCurrentItem(false);
		}
	}

	function chooseItem(){
		hideList();

		if(currentItem){
			if(initialValue !== currentItem.value){
				initialValue = currentItem.value;
				input.value = currentItem.title;
				success(currentItem.value);
			}else{
				cancel();
			}
		}else{
			if(editorParams.freetext){
				initialValue = input.value;
				success(input.value);
			}else{
				if(editorParams.allowEmpty && input.value === ""){
					initialValue = input.value;
					success(input.value);
				}else{
					cancel();
				}
			}
		}
	}

	function showList(){
		if(!listEl.parentNode){
			while(listEl.firstChild) listEl.removeChild(listEl.firstChild);

			var offset = Helpers.elOffset(cellEl);

			listEl.style.minWidth = cellEl.offsetWidth + "px";

			listEl.style.top = (offset.top + cellEl.offsetHeight) + "px";
			listEl.style.left = offset.left + "px";
			document.body.appendChild(listEl);
		}
	}

	function setCurrentItem(item, showInputValue){
		if(currentItem && currentItem.element){
			currentItem.element.classList.remove("active");
		}

		currentItem = item;

		if(item && item.element){
			item.element.classList.add("active");
		}

		if(item && item.element && item.element.scrollIntoView){
			item.element.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'start'});
		}
	}

	function hideList(){
		if(listEl.parentNode){
			listEl.parentNode.removeChild(listEl);
		}

		removeScrollListener();
	}


	function cancelItem(){
		hideList();
		cancel();
	}

	function removeScrollListener() {
		self.table.rowManager.element.removeEventListener("scroll", cancelItem);
	}

	//allow key based navigation
	input.addEventListener("keydown", function(e){
		var index;

		switch(e.keyCode){
			case 38: //up arrow
			index = displayItems.indexOf(currentItem);

			if(vertNav == "editor" || (vertNav == "hybrid" && index)){
				e.stopImmediatePropagation();
				e.stopPropagation();
				e.preventDefault();

				if(index > 0){
					setCurrentItem(displayItems[index - 1]);
				}else{
					setCurrentItem(false);
				}
			}
			break;

			case 40: //down arrow

			index = displayItems.indexOf(currentItem);

			if(vertNav == "editor" || (vertNav == "hybrid" && index < displayItems.length - 1)){

				e.stopImmediatePropagation();
				e.stopPropagation();
				e.preventDefault();

				if(index < displayItems.length - 1){
					if(index == -1){
						setCurrentItem(displayItems[0]);
					}else{
						setCurrentItem(displayItems[index + 1]);
					}
				}
			}
			break;


			case 37: //left arrow
			case 39: //right arrow
			e.stopImmediatePropagation();
			e.stopPropagation();
			// e.preventDefault();
			break;

			case 13: //enter
			chooseItem();
			break;

			case 27: //escape
			cancelItem();
			break;

			case 36: //home
			case 35: //end
			//prevent table navigation while using input element
			e.stopImmediatePropagation();
			break;
		}
	});

	input.addEventListener("keyup", function(e){

		switch(e.keyCode){
			case 38: //up arrow
			case 37: //left arrow
			case 39: //up arrow
			case 40: //right arrow
			case 13: //enter
			case 27: //escape
			break;

			default:
			filterList(input.value);
		}

	});

	input.addEventListener("search", function(e){
		filterList(input.value);
	});

	input.addEventListener("blur", function(e){
		if(blurable){
			chooseItem();
		}
	});

	input.addEventListener("focus", function(e){
		var value = initialDisplayValue;
		genUniqueColumnValues();
		showList();
		input.value = value;
		filterList(value, true);
	});


	onRendered(function(){
		input.style.height = "100%";
		input.focus({preventScroll: true});
	});

	if(editorParams.mask){
		maskInput(input, editorParams);
	}

	setTimeout(() => {
		this.table.rowManager.element.addEventListener("scroll", cancelItem);
	}, 10);

	genUniqueColumnValues();
	input.value = initialDisplayValue;
	filterList(initialDisplayValue, true);

	return input;
};