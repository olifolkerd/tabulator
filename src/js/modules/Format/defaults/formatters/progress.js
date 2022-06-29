import CellComponent from '../../../../core/cell/CellComponent.js';

export default function(cell, formatterParams = {}, onRendered){ //progress bar
	var value = this.sanitizeHTML(cell.getValue()) || 0,
	element = cell.getElement(),
	max = formatterParams.max ? formatterParams.max : 100,
	min = formatterParams.min ? formatterParams.min : 0,
	legendAlign = formatterParams.legendAlign ? formatterParams.legendAlign : "center",
	percent, percentValue, color, legend, legendColor;

	//make sure value is in range
	percentValue = parseFloat(value) <= max ? parseFloat(value) : max;
	percentValue = parseFloat(percentValue) >= min ? parseFloat(percentValue) : min;

	//workout percentage
	percent = (max - min) / 100;
	percentValue = Math.round((percentValue - min) / percent);

	//set bar color
	switch(typeof formatterParams.color){
		case "string":
			color = formatterParams.color;
			break;
		case "function":
			color = formatterParams.color(value);
			break;
		case "object":
			if(Array.isArray(formatterParams.color)){
				let unit = 100 / formatterParams.color.length;
				let index = Math.floor(percentValue / unit);

				index = Math.min(index, formatterParams.color.length - 1);
				index = Math.max(index, 0);
				color = formatterParams.color[index];
				break;
			}
		default:
			color = "#2DC214";
	}

	//generate legend
	switch(typeof formatterParams.legend){
		case "string":
			legend = formatterParams.legend;
			break;
		case "function":
			legend = formatterParams.legend(value);
			break;
		case "boolean":
			legend = value;
			break;
		default:
			legend = false;
	}

	//set legend color
	switch(typeof formatterParams.legendColor){
		case "string":
			legendColor = formatterParams.legendColor;
			break;
		case "function":
			legendColor = formatterParams.legendColor(value);
			break;
		case "object":
			if(Array.isArray(formatterParams.legendColor)){
				let unit = 100 / formatterParams.legendColor.length;
				let index = Math.floor(percentValue / unit);

				index = Math.min(index, formatterParams.legendColor.length - 1);
				index = Math.max(index, 0);
				legendColor = formatterParams.legendColor[index];
			}
			break;
		default:
			legendColor = "#000";
	}

	element.style.minWidth = "30px";
	element.style.position = "relative";

	element.setAttribute("aria-label", percentValue);

	var barEl = document.createElement("div");
	barEl.style.display = "inline-block";
	barEl.style.width = percentValue + "%";
	barEl.style.backgroundColor = color;
	barEl.style.height = "100%";

	barEl.setAttribute('data-max', max);
	barEl.setAttribute('data-min', min);

	var barContainer = document.createElement("div");
	barContainer.style.position = "relative";
	barContainer.style.width = "100%";
	barContainer.style.height = "100%";

	if(legend){
		var legendEl = document.createElement("div");
		legendEl.style.position = "absolute";
		legendEl.style.top = 0;
		legendEl.style.left = 0;
		legendEl.style.textAlign = legendAlign;
		legendEl.style.width = "100%";
		legendEl.style.color = legendColor;
		legendEl.innerHTML = legend;
	}

	onRendered(function(){

		//handle custom element needed if formatter is to be included in printed/downloaded output
		if(!(cell instanceof CellComponent)){
			var holderEl = document.createElement("div");
			holderEl.style.position = "absolute";
			holderEl.style.top = "4px";
			holderEl.style.bottom = "4px";
			holderEl.style.left = "4px";
			holderEl.style.right = "4px";

			element.appendChild(holderEl);

			element = holderEl;
		}

		element.appendChild(barContainer);
		barContainer.appendChild(barEl);

		if(legend){
			barContainer.appendChild(legendEl);
		}
	});

	return "";
}