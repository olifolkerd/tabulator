//input element
export default function(cell, onRendered, success, cancel, editorParams){
	var inputFormat = editorParams.format,
	DT = inputFormat ? (window.DateTime || luxon.DateTime) : null, 
	newDatetime;

	//create and style input
	var cellValue = cell.getValue(),
	input = document.createElement("input");
	
	input.type = "time";
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
	
	cellValue = typeof cellValue !== "undefined" ? cellValue : "";
	
	if(inputFormat){
		if(DT){
			if(DT.isDateTime(cellValue)){
				newDatetime = cellValue;
			}else if(inputFormat === "iso"){
				newDatetime = DT.fromISO(String(cellValue));
			}else{
				newDatetime = DT.fromFormat(String(cellValue), inputFormat);
			}

			cellValue = newDatetime.toFormat("hh:mm");

		}else{
			console.error("Editor Error - 'date' editor 'inputFormat' param is dependant on luxon.js");
		}
	}

	input.value = cellValue;
	
	onRendered(function(){
		input.focus({preventScroll: true});
		input.style.height = "100%";
		
		if(editorParams.selectContents){
			input.select();
		}
	});
	
	function onChange(e){
		var value = input.value;

		if(((cellValue === null || typeof cellValue === "undefined") && value !== "") || value !== cellValue){

			if(value && inputFormat){
				value = DT.fromFormat(String(value), "hh:mm").toFormat(inputFormat);
			}

			if(success(value)){
				cellValue = input.value; //persist value if successfully validated incase editor is used as header filter
			}
		}else{
			cancel();
		}
	}
	
	//submit new value on blur or change
	input.addEventListener("change", onChange);
	input.addEventListener("blur", onChange);
	
	//submit new value on enter
	input.addEventListener("keydown", function(e){
		switch(e.keyCode){
			// case 9:
			case 13:
				onChange(e);
				break;
			
			case 27:
				cancel();
				break;
			
			case 35:
			case 36:
				e.stopPropagation();
				break;
		}
	});
	
	return input;
}