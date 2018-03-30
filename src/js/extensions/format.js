var Format = function(table){
	this.table = table; //hold Tabulator object
};

//initialize column formatter
Format.prototype.initializeColumn = function(column){
	var self = this,
	config = {params:column.definition.formatterParams || {}};

	//set column formatter
	switch(typeof column.definition.formatter){
		case "string":
		if(self.formatters[column.definition.formatter]){
			config.formatter = self.formatters[column.definition.formatter]

			if(column.definition.formatter === "email"){
				console.warn("The%c email%c formatter has been depricated and will be removed in version 4.0, use the %clink %cformatter with %cformatterParams:{urlPrefix:'mailto:'} %cinstead.", "font-weight:bold;", "font-weight:regular;", "font-weight:bold;", "font-weight:regular;", "font-weight:bold;", "font-weight:regular;");
			}
		}else{
			console.warn("Formatter Error - No such formatter found: ", column.definition.formatter);
			config.formatter = self.formatters.plaintext;
		}
		break;

		case "function":
		config.formatter = column.definition.formatter;
		break;

		default:
		config.formatter = self.formatters.plaintext;
		break;
	}

	column.extensions.format = config;
};

//return a formatted value for a cell
Format.prototype.formatValue = function(cell){
	return cell.column.extensions.format.formatter.call(this, cell.getComponent(), cell.column.extensions.format.params);
};


Format.prototype.sanitizeHTML = function(value){
	if(value){
		var entityMap = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;',
			'/': '&#x2F;',
			'`': '&#x60;',
			'=': '&#x3D;'
		};

		return String(value).replace(/[&<>"'`=\/]/g, function (s) {
			return entityMap[s];
		});
	}else{
		return value;
	}
};

Format.prototype.emptyToSpace = function(value){
	return value === null ? "&nbsp" : value;
};

//get formatter for cell
Format.prototype.getFormatter = function(formatter){
	var formatter;

	switch(typeof formatter){
		case "string":
		if(this.formatters[formatter]){
			formatter = this.formatters[formatter]
		}else{
			console.warn("Formatter Error - No such formatter found: ", formatter);
			formatter = this.formatters.plaintext;
		}
		break;

		case "function":
		formatter = formatter;
		break;

		default:
		formatter = this.formatters.plaintext;
		break;
	}

	return formatter;

};

//default data formatters
Format.prototype.formatters = {
	//plain text value
	plaintext:function(cell, formatterParams){
		return this.emptyToSpace(this.sanitizeHTML(cell.getValue()));
	},

	//html text value
	html:function(cell, formatterParams){
		return cell.getValue();
	},

	//multiline text area
	textarea:function(cell, formatterParams){
		cell.getElement().css({"white-space":"pre-wrap"});
		return this.emptyToSpace(this.sanitizeHTML(cell.getValue()));
	},

	//currency formatting
	money:function(cell, formatterParams){
		var floatVal = parseFloat(cell.getValue()),
		number, integer, decimal, rgx;

		var decimalSym = formatterParams.decimal || ".";
		var thousandSym = formatterParams.thousand || ",";
		var symbol = formatterParams.symbol || "";
		var after = !!formatterParams.symbolAfter;
		var precision = typeof formatterParams.precision !== "undefined" ? formatterParams.precision : 2;

		if(isNaN(floatVal)){
			return this.emptyToSpace(this.sanitizeHTML(cell.getValue()));
		}

		number = precision !== false ? floatVal.toFixed(precision) : floatVal;
		number = number.split(".");

		integer = number[0];
		decimal = number.length > 1 ? decimalSym + number[1] : "";

		rgx = /(\d+)(\d{3})/;

		while (rgx.test(integer)){
			integer = integer.replace(rgx, "$1" + thousandSym + "$2");
		}

		return after ? integer + decimal + symbol : symbol + integer + decimal;
	},

	//clickable mailto link
	email:function(cell, formatterParams){
		var value = this.sanitizeHTML(cell.getValue());
		return "<a href='mailto:" + value + "'>" + this.emptyToSpace(value) + "</a>";
	},

	//clickable anchor tag
	link:function(cell, formatterParams){
		var value = this.sanitizeHTML(cell.getValue()),
		urlPrefix = formatterParams.urlPrefix || "",
		label = this.emptyToSpace(value),
		data;

		if(formatterParams.labelField){
			data = cell.getData();
			label = data[formatterParams.labelField];
		}

		if(formatterParams.label){
			switch(typeof formatterParams.label){
				case "string":
				label = formatterParams.label;
				break;

				case "function":
				label = formatterParams.label(cell);
				break;
			}
		}

		if(formatterParams.urlField){
			data = cell.getData();
			value = data[formatterParams.urlField];
		}

		if(formatterParams.url){
			switch(typeof formatterParams.url){
				case "string":
				value = formatterParams.url;
				break;

				case "function":
				value = formatterParams.url(cell);
				break;
			}
		}

		return "<a href='" + urlPrefix + value + "'>" + label + "</a>";
	},

	//image element
	image:function(cell, formatterParams){
		var value = this.sanitizeHTML(cell.getValue());

		var el = $("<img src='" + value + "'/>");

		el.on("load", function(){
			cell.getRow().normalizeHeight();
		});

		return el;
	},

	//tick or empty cell
	tick:function(cell, formatterParams){
		var value = cell.getValue(),
		element = cell.getElement();

		var tick = '<svg enable-background="new 0 0 24 24" height="14" width="14" viewBox="0 0 24 24" xml:space="preserve" ><path fill="#2DC214" clip-rule="evenodd" d="M21.652,3.211c-0.293-0.295-0.77-0.295-1.061,0L9.41,14.34  c-0.293,0.297-0.771,0.297-1.062,0L3.449,9.351C3.304,9.203,3.114,9.13,2.923,9.129C2.73,9.128,2.534,9.201,2.387,9.351  l-2.165,1.946C0.078,11.445,0,11.63,0,11.823c0,0.194,0.078,0.397,0.223,0.544l4.94,5.184c0.292,0.296,0.771,0.776,1.062,1.07  l2.124,2.141c0.292,0.293,0.769,0.293,1.062,0l14.366-14.34c0.293-0.294,0.293-0.777,0-1.071L21.652,3.211z" fill-rule="evenodd"/></svg>';

		if(value === true || value === "true" || value === "True" || value === 1 || value === "1"){
			element.attr("aria-checked", true);
			return tick;
		}else{
			element.attr("aria-checked", false);
			return "";
		}
	},

	//tick or cross
	tickCross:function(cell, formatterParams){
		var value = cell.getValue(),
		element = cell.getElement(),
		tick = '<svg enable-background="new 0 0 24 24" height="14" width="14" viewBox="0 0 24 24" xml:space="preserve" ><path fill="#2DC214" clip-rule="evenodd" d="M21.652,3.211c-0.293-0.295-0.77-0.295-1.061,0L9.41,14.34  c-0.293,0.297-0.771,0.297-1.062,0L3.449,9.351C3.304,9.203,3.114,9.13,2.923,9.129C2.73,9.128,2.534,9.201,2.387,9.351  l-2.165,1.946C0.078,11.445,0,11.63,0,11.823c0,0.194,0.078,0.397,0.223,0.544l4.94,5.184c0.292,0.296,0.771,0.776,1.062,1.07  l2.124,2.141c0.292,0.293,0.769,0.293,1.062,0l14.366-14.34c0.293-0.294,0.293-0.777,0-1.071L21.652,3.211z" fill-rule="evenodd"/></svg>',
		cross = '<svg enable-background="new 0 0 24 24" height="14" width="14"  viewBox="0 0 24 24" xml:space="preserve" ><path fill="#CE1515" d="M22.245,4.015c0.313,0.313,0.313,0.826,0,1.139l-6.276,6.27c-0.313,0.312-0.313,0.826,0,1.14l6.273,6.272  c0.313,0.313,0.313,0.826,0,1.14l-2.285,2.277c-0.314,0.312-0.828,0.312-1.142,0l-6.271-6.271c-0.313-0.313-0.828-0.313-1.141,0  l-6.276,6.267c-0.313,0.313-0.828,0.313-1.141,0l-2.282-2.28c-0.313-0.313-0.313-0.826,0-1.14l6.278-6.269  c0.313-0.312,0.313-0.826,0-1.14L1.709,5.147c-0.314-0.313-0.314-0.827,0-1.14l2.284-2.278C4.308,1.417,4.821,1.417,5.135,1.73  L11.405,8c0.314,0.314,0.828,0.314,1.141,0.001l6.276-6.267c0.312-0.312,0.826-0.312,1.141,0L22.245,4.015z"/></svg>';

		if(value === true || value === "true" || value === "True" || value === 1 || value === "1"){
			element.attr("aria-checked", true);
			return tick;
		}else{
			element.attr("aria-checked", false);
			return cross;
		}
	},

	//select
	lookup: function (cell, formatterParams) {
		var value = cell.getValue();

		if (typeof formatterParams[value] === "undefined") {
			console.warn('Missing display value for ' + value);
			return value;
		}

		return formatterParams[value];
	},

	//star rating
	star:function(cell, formatterParams){
		var value = cell.getValue(),
		element = cell.getElement(),
		maxStars = formatterParams && formatterParams.stars ? formatterParams.stars : 5,
		stars = $("<span style='vertical-align:middle;'></span>"),
		starActive = $('<svg width="14" height="14" viewBox="0 0 512 512" xml:space="preserve" style="margin:0 1px;"><polygon fill="#FFEA00" stroke="#C1AB60" stroke-width="37.6152" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="259.216,29.942 330.27,173.919 489.16,197.007 374.185,309.08 401.33,467.31 259.216,392.612 117.104,467.31 144.25,309.08 29.274,197.007 188.165,173.919 "/></svg>'),
		starInactive = $('<svg width="14" height="14" viewBox="0 0 512 512" xml:space="preserve" style="margin:0 1px;"><polygon fill="#D2D2D2" stroke="#686868" stroke-width="37.6152" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="259.216,29.942 330.27,173.919 489.16,197.007 374.185,309.08 401.33,467.31 259.216,392.612 117.104,467.31 144.25,309.08 29.274,197.007 188.165,173.919 "/></svg>');

		value = parseInt(value) < maxStars ? parseInt(value) : maxStars;

		for(var i=1;i<= maxStars;i++){

			var nextStar = i <= value ? starActive : starInactive;

			stars.append(nextStar.clone());
		}

		element.css({
			"white-space": "nowrap",
			"overflow": "hidden",
			"text-overflow": "ellipsis",
		});

		element.attr("aria-label", value);

		return stars.html();
	},

	//progress bar
	progress:function(cell, formatterParams){ //progress bar
		var value = this.sanitizeHTML(cell.getValue()) || 0,
		element = cell.getElement(),
		max = formatterParams && formatterParams.max ? formatterParams.max : 100,
		min = formatterParams && formatterParams.min ? formatterParams.min : 0,
		legendAlign = formatterParams && formatterParams.legendAlign ? formatterParams.legendAlign : "center",
		percent, percentValue, color, legend, legendColor, top, left, right, bottom;

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
				var unit = 100 / formatterParams.color.length;
				var index = Math.floor(percentValue / unit);

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
				var unit = 100 / formatterParams.legendColor.length;
				var index = Math.floor(percentValue / unit);

				index = Math.min(index, formatterParams.legendColor.length - 1);
				index = Math.max(index, 0);
				legendColor = formatterParams.legendColor[index];
				break;
			}
			default:
			legendColor = "#000";
		}

		element.css({
			"min-width":"30px",
			"position":"relative",
		});

		element.attr("aria-label", percentValue);

		return "<div style='position:absolute; top:8px; bottom:8px; left:4px; right:4px;'  data-max='" + max + "' data-min='" + min + "'><div style='position:relative; height:100%; width:calc(" + percentValue + "%); background-color:" + color + "; display:inline-block;'></div></div>" + (legend ? "<div style='position:absolute; top:4px; left:0; text-align:" + legendAlign + "; width:100%; color:" + legendColor + ";'>" + legend + "</div>" : "");
	},

	//background color
	color:function(cell, formatterParams){
		cell.getElement().css({"background-color":this.sanitizeHTML(cell.getValue())});
		return "";
	},

	//tick icon
	buttonTick:function(cell, formatterParams){
		return '<svg enable-background="new 0 0 24 24" height="14" width="14" viewBox="0 0 24 24" xml:space="preserve" ><path fill="#2DC214" clip-rule="evenodd" d="M21.652,3.211c-0.293-0.295-0.77-0.295-1.061,0L9.41,14.34  c-0.293,0.297-0.771,0.297-1.062,0L3.449,9.351C3.304,9.203,3.114,9.13,2.923,9.129C2.73,9.128,2.534,9.201,2.387,9.351  l-2.165,1.946C0.078,11.445,0,11.63,0,11.823c0,0.194,0.078,0.397,0.223,0.544l4.94,5.184c0.292,0.296,0.771,0.776,1.062,1.07  l2.124,2.141c0.292,0.293,0.769,0.293,1.062,0l14.366-14.34c0.293-0.294,0.293-0.777,0-1.071L21.652,3.211z" fill-rule="evenodd"/></svg>';
	},

	//cross icon
	buttonCross:function(cell, formatterParams){
		return '<svg enable-background="new 0 0 24 24" height="14" width="14" viewBox="0 0 24 24" xml:space="preserve" ><path fill="#CE1515" d="M22.245,4.015c0.313,0.313,0.313,0.826,0,1.139l-6.276,6.27c-0.313,0.312-0.313,0.826,0,1.14l6.273,6.272  c0.313,0.313,0.313,0.826,0,1.14l-2.285,2.277c-0.314,0.312-0.828,0.312-1.142,0l-6.271-6.271c-0.313-0.313-0.828-0.313-1.141,0  l-6.276,6.267c-0.313,0.313-0.828,0.313-1.141,0l-2.282-2.28c-0.313-0.313-0.313-0.826,0-1.14l6.278-6.269  c0.313-0.312,0.313-0.826,0-1.14L1.709,5.147c-0.314-0.313-0.314-0.827,0-1.14l2.284-2.278C4.308,1.417,4.821,1.417,5.135,1.73  L11.405,8c0.314,0.314,0.828,0.314,1.141,0.001l6.276-6.267c0.312-0.312,0.826-0.312,1.141,0L22.245,4.015z"/></svg>';
	},

	//current row number
	rownum:function(cell, formatterParams){
		return this.table.rowManager.activeRows.indexOf(cell.getRow()._getSelf()) + 1;
	},

	//row handle
	handle:function(cell, formatterParams){
		cell.getElement().addClass("tabulator-row-handle");
		return "<div class='tabulator-row-handle-box'><div class='tabulator-row-handle-bar'></div><div class='tabulator-row-handle-bar'></div><div class='tabulator-row-handle-bar'></div></div>";
	},

	responsiveCollapse:function(cell, formatterParams){
		var self = this,
		el = $("<div class='tabulator-responsive-collapse-toggle'><span class='tabulator-responsive-collapse-toggle-open'>+</span><span class='tabulator-responsive-collapse-toggle-close'>-</span></div>");

		cell.getElement().addClass("tabulator-row-handle");

		if(self.table.options.responsiveLayoutCollapseStartOpen){
			el.addClass("open");
		}

		el.click(function(){
			$(this).toggleClass("open");
			$(this).closest(".tabulator-row").find(".tabulator-responsive-collapse").toggle();
		})

		return el;
	},
};

Tabulator.registerExtension("format", Format);