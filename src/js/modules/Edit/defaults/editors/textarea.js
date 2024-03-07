import maskInput from '../../inputMask.js';

//resizable text area element
export default function(cell, onRendered, success, cancel, editorParams){
	var cellValue = cell.getValue(),
	vertNav = editorParams.verticalNavigation || "hybrid",
	value = String(cellValue !== null && typeof cellValue !== "undefined"  ? cellValue : ""),
	input = document.createElement("textarea"),
	scrollHeight = 0;

	//create and style input
	input.style.display = "block";
	input.style.padding = "2px";
	input.style.height = "100%";
	input.style.width = "100%";
	input.style.boxSizing = "border-box";
	input.style.whiteSpace = "pre-wrap";
	input.style.resize = "none";

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

	input.value = value;

	onRendered(function(){
		if(cell.getType() === "cell"){
			input.focus({preventScroll: true});
			input.style.height = "100%";

			input.scrollHeight;
			input.style.height = input.scrollHeight + "px";
			cell.getRow().normalizeHeight();

			if(editorParams.selectContents){
				input.select();
			}
		}
	});

	function onChange(e){

		if(((cellValue === null || typeof cellValue === "undefined") && input.value !== "") || input.value !== cellValue){

			if(success(input.value)){
				cellValue = input.value; //persist value if successfully validated incase editor is used as header filter
			}

			setTimeout(function(){
				cell.getRow().normalizeHeight();
			},300);
		}else{
			cancel();
		}
	}

	//submit new value on blur or change
	input.addEventListener("change", onChange);
	input.addEventListener("blur", onChange);

	input.addEventListener("keyup", function(){

		input.style.height = "";

		var heightNow = input.scrollHeight;

		input.style.height = heightNow + "px";

		if(heightNow != scrollHeight){
			scrollHeight = heightNow;
			cell.getRow().normalizeHeight();
		}
	});

	input.addEventListener("keydown", function(e){

		switch(e.keyCode){

			case 13:
				if(e.shiftKey && editorParams.shiftEnterSubmit){
					onChange(e);
				}
				break;

			case 27:
				cancel();
				break;

			case 38: //up arrow
				if(vertNav == "editor" || (vertNav == "hybrid" && input.selectionStart)){
					e.stopImmediatePropagation();
					e.stopPropagation();
				}

				break;

			case 40: //down arrow
				if(vertNav == "editor" || (vertNav == "hybrid" && input.selectionStart !== input.value.length)){
					e.stopImmediatePropagation();
					e.stopPropagation();
				}
				break;

			case 35:
			case 36:
				e.stopPropagation();
				break;
		}
	});

	if(editorParams.mask){
		maskInput(input, editorParams);
	}

	return input;
}