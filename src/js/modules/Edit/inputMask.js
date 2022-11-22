export default function maskInput(el, options){
	var mask = options.mask,
	maskLetter = typeof options.maskLetterChar !== "undefined" ? options.maskLetterChar : "A",
	maskNumber = typeof options.maskNumberChar !== "undefined" ? options.maskNumberChar : "9",
	maskWildcard = typeof options.maskWildcardChar !== "undefined" ? options.maskWildcardChar : "*";

	function fillSymbols(index){
		var symbol = mask[index];
		if(typeof symbol !== "undefined" && symbol !== maskWildcard && symbol !== maskLetter && symbol !== maskNumber){
			el.value = el.value + "" + symbol;
			fillSymbols(index+1);
		}
	}

	el.addEventListener("keydown", (e) => {
		var index = el.value.length,
		char = e.key;

		if(e.keyCode > 46 && !e.ctrlKey && !e.metaKey){
			if(index >= mask.length){
				e.preventDefault();
				e.stopPropagation();
				return false;
			}else{
				switch(mask[index]){
					case maskLetter:
						if(char.toUpperCase() == char.toLowerCase()){
							e.preventDefault();
							e.stopPropagation();
							return false;
						}
						break;

					case maskNumber:
						if(isNaN(char)){
							e.preventDefault();
							e.stopPropagation();
							return false;
						}
						break;

					case maskWildcard:
						break;

					default:
						if(char !== mask[index]){
							e.preventDefault();
							e.stopPropagation();
							return false;
						}
				}
			}
		}

		return;
	});

	el.addEventListener("keyup", (e) => {
		if(e.keyCode > 46){
			if(options.maskAutoFill){
				fillSymbols(el.value.length);
			}
		}
	});


	if(!el.placeholder){
		el.placeholder = mask;
	}

	if(options.maskAutoFill){
		fillSymbols(el.value.length);
	}
}