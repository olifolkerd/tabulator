//input element
export default function(cell, onRendered, success, cancel, editorParams){
	var inputFormat = editorParams.format,
	vertNav = editorParams.verticalNavigation || "editor",
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
			console.error("Editor Error - 'date' editor 'format' param is dependant on luxon.js");
		}
	}
	
	input.value = cellValue;
	
	onRendered(function(){
		if(cell._getSelf){
			input.focus({preventScroll: true});
			input.style.height = "100%";
			
			if(editorParams.selectContents){
				input.select();
			}
		}
	});
	
	function onChange(){
		var value = input.value,
		luxTime;
		
		if(((cellValue === null || typeof cellValue === "undefined") && value !== "") || value !== cellValue){
			
			if(value && inputFormat){
				luxTime = DT.fromFormat(String(value), "hh:mm");

				switch(inputFormat){
					case true:
						value = luxTime;
						break;

					case "iso":
						value = luxTime.toISO();
						break;

					default:
						value = luxTime.toFormat(inputFormat);
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
