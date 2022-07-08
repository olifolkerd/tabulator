export default function(cell, formatterParams, onRendered){
	var el = document.createElement("img"),
	src = cell.getValue();

	if(formatterParams.urlPrefix){
		src = formatterParams.urlPrefix + cell.getValue();
	}

	if(formatterParams.urlSuffix){
		src = src + formatterParams.urlSuffix;
	}

	el.setAttribute("src", src);

	switch(typeof formatterParams.height){
		case "number":
			el.style.height = formatterParams.height + "px";
			break;

		case "string":
			el.style.height = formatterParams.height;
			break;
	}

	switch(typeof formatterParams.width){
		case "number":
			el.style.width = formatterParams.width + "px";
			break;

		case "string":
			el.style.width = formatterParams.width;
			break;
	}

	el.addEventListener("load", function(){
		cell.getRow().normalizeHeight();
	});

	return el;
}