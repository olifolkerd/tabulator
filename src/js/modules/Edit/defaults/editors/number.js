import maskInput from '../../inputMask.js';

//input element with type of number
export default function(cell, onRendered, success, cancel, editorParams){
	var cellValue = cell.getValue(),
	vertNav = editorParams.verticalNavigation || "editor",
	input = document.createElement("input");

	input.setAttribute("type", "number");

	if(typeof editorParams.max != "undefined"){
		input.setAttribute("max", editorParams.max);
	}

	if(typeof editorParams.min != "undefined"){
		input.setAttribute("min", editorParams.min);
	}

	if(typeof editorParams.step != "undefined"){
		input.setAttribute("step", editorParams.step);
	}

	//create and style input
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

	input.value = cellValue;

	var blurFunc = function(e){
		onChange();
	};

	onRendered(function () {
		if(cell.getType() === "cell"){
			//submit new value on blur
			input.removeEventListener("blur", blurFunc);

			input.focus({preventScroll: true});
			input.style.height = "100%";

			//submit new value on blur
			input.addEventListener("blur", blurFunc);

			if(editorParams.selectContents){
				input.select();
			}
		}
	});

	function onChange(){
		var value = input.value;

		if(!isNaN(value) && value !==""){
			value = Number(value);
		}

		if(value !== cellValue){
			if(success(value)){
				cellValue = value; //persist value if successfully validated incase editor is used as header filter
			}
		}else{
			cancel();
		}
	}

	//submit new value on enter
	input.addEventListener("keydown", function(e){
		switch(e.keyCode){
			case 13:
			// case 9:
				onChange();
				break;

			case 27:
				cancel();
				break;

			case 38: //up arrow
			case 40: //down arrow
				if(vertNav == "editor"){
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