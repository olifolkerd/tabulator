//draggable progress bar
export default function(cell, onRendered, success, cancel, editorParams){
	var element = cell.getElement(),
	max = typeof editorParams.max === "undefined" ? ((element.getElementsByTagName("div")[0] && element.getElementsByTagName("div")[0].getAttribute("max")) || 100) : editorParams.max,
	min = typeof editorParams.min === "undefined" ? ((element.getElementsByTagName("div")[0] && element.getElementsByTagName("div")[0].getAttribute("min")) || 0) : editorParams.min,
	percent = (max - min) / 100,
	value = cell.getValue() || 0,
	handle = document.createElement("div"),
	bar = document.createElement("div"),
	mouseDrag, mouseDragWidth;

	//set new value
	function updateValue(){
		var style = window.getComputedStyle(element, null);

		var calcVal = (percent * Math.round(bar.offsetWidth / ((element.clientWidth - parseInt(style.getPropertyValue("padding-left")) - parseInt(style.getPropertyValue("padding-right")))/100))) + min;
		success(calcVal);
		element.setAttribute("aria-valuenow", calcVal);
		element.setAttribute("aria-label", value);
	}

	//style handle
	handle.style.position = "absolute";
	handle.style.right = "0";
	handle.style.top = "0";
	handle.style.bottom = "0";
	handle.style.width = "5px";
	handle.classList.add("tabulator-progress-handle");

	//style bar
	bar.style.display = "inline-block";
	bar.style.position = "relative";
	// bar.style.top = "8px";
	// bar.style.bottom = "8px";
	// bar.style.left = "4px";
	// bar.style.marginRight = "4px";
	bar.style.height = "100%";
	bar.style.backgroundColor = "#488CE9";
	bar.style.maxWidth = "100%";
	bar.style.minWidth = "0%";

	if(editorParams.elementAttributes && typeof editorParams.elementAttributes == "object"){
		for (let key in editorParams.elementAttributes){
			if(key.charAt(0) == "+"){
				key = key.slice(1);
				bar.setAttribute(key, bar.getAttribute(key) + editorParams.elementAttributes["+" + key]);
			}else{
				bar.setAttribute(key, editorParams.elementAttributes[key]);
			}
		}
	}

	//style cell
	element.style.padding = "4px 4px";

	//make sure value is in range
	value = Math.min(parseFloat(value), max);
	value = Math.max(parseFloat(value), min);

	//workout percentage
	value = Math.round((value - min) / percent);
	// bar.style.right = value + "%";
	bar.style.width = value + "%";

	element.setAttribute("aria-valuemin", min);
	element.setAttribute("aria-valuemax", max);

	bar.appendChild(handle);

	handle.addEventListener("mousedown", function(e){
		mouseDrag = e.screenX;
		mouseDragWidth = bar.offsetWidth;
	});

	handle.addEventListener("mouseover", function(){
		handle.style.cursor = "ew-resize";
	});

	element.addEventListener("mousemove", function(e){
		if(mouseDrag){
			bar.style.width = (mouseDragWidth + e.screenX - mouseDrag) + "px";
		}
	});

	element.addEventListener("mouseup", function(e){
		if(mouseDrag){
			e.stopPropagation();
			e.stopImmediatePropagation();

			mouseDrag = false;
			mouseDragWidth = false;

			updateValue();
		}
	});

	//allow key based navigation
	element.addEventListener("keydown", function(e){
		switch(e.keyCode){
			case 39: //right arrow
			e.preventDefault();
			bar.style.width = (bar.clientWidth + element.clientWidth/100) + "px";
			break;

			case 37: //left arrow
			e.preventDefault();
			bar.style.width = (bar.clientWidth - element.clientWidth/100) + "px";
			break;

			case 9: //tab
			case 13: //enter
			updateValue();
			break;

			case 27: //escape
			cancel();
			break;

		}
	});

	element.addEventListener("blur", function(){
		cancel();
	});

	return bar;
};