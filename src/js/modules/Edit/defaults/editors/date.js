//input element
export default function(cell, onRendered, success, cancel, editorParams){
	var inputFormat = editorParams.format,
	vertNav = editorParams.verticalNavigation || "editor",
	DT = inputFormat ? (window.DateTime || luxon.DateTime) : null;
	
	//create and style input
	var cellValue = cell.getValue(),
	input = document.createElement("input");
	
	function convertDate(value){
		var newDatetime;
		
		if(DT.isDateTime(value)){
			newDatetime = value;
		}else if(inputFormat === "iso"){
			newDatetime = DT.fromISO(String(value));
		}else{
			newDatetime = DT.fromFormat(String(value), inputFormat);
		}
		
		return newDatetime.toFormat("yyyy-MM-dd");
	}
	
	input.type = "date";
	input.style.padding = "4px";
	input.style.width = "100%";
	input.style.boxSizing = "border-box";

	if(editorParams.max){
		input.setAttribute("max", inputFormat ? convertDate(editorParams.max) : editorParams.max);
	}

	if(editorParams.min){
		input.setAttribute("min", inputFormat ? convertDate(editorParams.min) : editorParams.min);
	}
	
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
	
	cellValue = typeof cellValue !== "undefined" ? cellValue : "";
	
	if(inputFormat){
		if(DT){		
			cellValue = convertDate(cellValue);			
		}else{
			console.error("Editor Error - 'date' editor 'format' param is dependant on luxon.js");
		}
	}
	
	input.value = cellValue;
	
	onRendered(function(){
		if(cell.getType() === "cell"){
			input.focus({preventScroll: true});
			input.style.height = "100%";
			
			if(editorParams.selectContents){
				input.select();
			}
		}
	});
	
	function onChange(){
		var value = input.value,
		luxDate;
		
		if(((cellValue === null || typeof cellValue === "undefined") && value !== "") || value !== cellValue){
			
			if(value && inputFormat){
				luxDate = DT.fromFormat(String(value), "yyyy-MM-dd");

				switch(inputFormat){
					case true:
						value = luxDate;
						break;

					case "iso":
						value = luxDate.toISO();
						break;

					default:
						value = luxDate.toFormat(inputFormat);
				}
			}
			
			if(success(value)){
				cellValue = input.value; //persist value if successfully validated incase editor is used as header filter
			}
		}else{
			cancel();
		}
	}
	
	//submit new value on blur
	input.addEventListener("blur", function(e) {
		if (e.relatedTarget || e.rangeParent || e.explicitOriginalTarget !== input) {
			onChange(); // only on a "true" blur; not when focusing browser's date/time picker
		}
	});
	
	//submit new value on enter
	input.addEventListener("keydown", function(e){
		switch(e.keyCode){
			// case 9:
			case 13:
				onChange();
				break;
			
			case 27:
				cancel();
				break;
			
			case 35:
			case 36:
				e.stopPropagation();
				break;
			
			case 38: //up arrow
			case 40: //down arrow
				if(vertNav == "editor"){
					e.stopImmediatePropagation();
					e.stopPropagation();
				}
				break;
		}
	});
	
	return input;
}
