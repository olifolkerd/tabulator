export default function(cell, formatterParams, onRendered){
	var value = this.sanitizeHTML(cell.getValue()) || 0,
	el = document.createElement("span"),
	max = formatterParams && formatterParams.max ? formatterParams.max : 100,
	min = formatterParams && formatterParams.min ? formatterParams.min : 0,
	colors = formatterParams && typeof formatterParams.color !== "undefined" ? formatterParams.color : ["red", "orange", "green"],
	color = "#666666",
	percent, percentValue;

	if(isNaN(value) || typeof cell.getValue() === "undefined"){
		return;
	}

	el.classList.add("tabulator-traffic-light");

	//make sure value is in range
	percentValue = parseFloat(value) <= max ? parseFloat(value) : max;
	percentValue = parseFloat(percentValue) >= min ? parseFloat(percentValue) : min;

	//workout percentage
	percent = (max - min) / 100;
	percentValue = Math.round((percentValue - min) / percent);

	//set color
	switch(typeof colors){
		case "string":
			color = colors;
			break;
		case "function":
			color = colors(value);
			break;
		case "object":
			if(Array.isArray(colors)){
				var unit = 100 / colors.length;
				var index = Math.floor(percentValue / unit);

				index = Math.min(index, colors.length - 1);
				index = Math.max(index, 0);
				color = colors[index];
				break;
			}
	}

	el.style.backgroundColor = color;

	return el;
}