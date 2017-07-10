var Edit = function(table){
	this.table = table; //hold Tabulator object
	this.currentCell = false; //hold currently editing cell
};


//initialize column editor
Edit.prototype.initializeColumn = function(column){
	var self = this,
	config = {
		editor:false,
		blocked:false,
		check:column.definition.editable,
		params:column.definition.editorParams || {}
	};

	//set column editor
	switch(typeof column.definition.editor){
		case "string":
		if(self.editors[column.definition.editor]){
			config.editor = self.editors[column.definition.editor]
		}else{
			console.warn("Editor Error - No such editor found: ", column.definition.editor);
		}
		break;

		case "function":
		config.editor = column.definition.editor;
		break;

		case "boolean":

		if(column.definition.editor === true){

			if(typeof column.definition.formatter !== "function"){
				if(self.editors[column.definition.formatter]){
					config.editor = self.editors[column.definition.formatter];
				}else{
					config.editor = self.editors["input"];
				}
			}else{
				console.warn("Editor Error - Cannot auto lookup editor for a custom formatter: ", column.definition.formatter);
			}
		}
		break;
	}

	if(config.editor){
		column.extensions.edit = config;
	}
};

Edit.prototype.getCurrentCell = function(){
	return this.currentCell ? this.currentCell.getComponent() : false;
};

Edit.prototype.clearEditor = function(cell){
	this.currentCell = false;
	cell.getElement().removeClass("tabulator-editing").empty();
	cell.row.getElement().removeClass("tabulator-row-editing");
};

//return a formatted value for a cell
Edit.prototype.bindEditor = function(cell){
	var self = this,
	element = cell.getElement(),
	mouseClick = false;

	//handle successfull value change
	function success(value){
		self.clearEditor(cell);
		cell.setValue(value, true);
	};

	//handle aborted edit
	function cancel(){
		self.clearEditor(cell);
		cell.setValueActual(cell.getValue());
		self.table.options.cellEditCancelled(cell.getComponent())
	};

	element.attr("tabindex", 0);

	element.on("click", function(e){
		if(!$(this).hasClass("tabulator-editing")){
			$(this).focus();
		}
	});

	element.on("mousedown", function(e){
		mouseClick = true;
	});

	element.on("focus", function(e){
		var rendered = function(){},
		allowEdit = true,
		cellEditor;

		self.currentCell = cell;

		if(mouseClick){
			mouseClick = false;

			if(cell.column.cellEvents.cellClick){
				cell.column.cellEvents.cellClick(e, cell.getComponent());
			}
		}

		function onRendered(callback){
			rendered = callback;
		}

		if(!cell.column.extensions.edit.blocked){
			e.stopPropagation();

			if(typeof cell.column.extensions.edit.check == "function"){
				allowEdit = cell.column.extensions.edit.check(cell.getComponent());
			}

			if(allowEdit){

				self.table.options.cellEditing(cell.getComponent());

				cellEditor = cell.column.extensions.edit.editor.call(self, cell.getComponent(), onRendered, success, cancel, cell.column.extensions.edit.params);

				//if editor returned, add to DOM, if false, abort edit
				if(cellEditor !== false){
					element.addClass("tabulator-editing");
					cell.row.getElement().addClass("tabulator-row-editing");
					element.empty();
					element.append(cellEditor);

					//trigger onRendered Callback
					rendered();

					//prevent editing from triggering rowClick event
					element.children().click(function(e){
						e.stopPropagation();
					})
				}else{
					element.blur();
				}
			}else{
				element.blur();
			}
		}else{
			element.blur();
		}

	});
};

//default data editors
Edit.prototype.editors = {

	//input element
	input:function(cell, onRendered, success, cancel, editorParams){

		//create and style input
		var input = $("<input type='text'/>");

		input.css({
			"padding":"4px",
			"width":"100%",
			"box-sizing":"border-box",
		})
		.val(cell.getValue());

		onRendered(function(){
			input.focus();
			input.css("height","100%");
		});

		//submit new value on blur
		input.on("change blur", function(e){
			if(input.val() != cell.getValue()){
				success(input.val());
			}else{
				cancel();
			}
		});

		//submit new value on enter
		input.on("keydown", function(e){
			if(e.keyCode == 13){
				success(input.val());
			}
		});

		return input;
	},

	//resizable text area element
	textarea:function(cell, onRendered, success, cancel, editorParams){
		var self = this,
		cellValue = cell.getValue(),
		value = String(typeof cellValue == "null" || typeof cellValue == "undefined" ? "" : cellValue),
		count = (value.match(/(?:\r\n|\r|\n)/g) || []).length + 1,
		input = $("<textarea></textarea>"),
		scrollHeight = 0;

        //create and style input
        input.css({
        	"display":"block",
        	"height":"100%",
        	"width":"100%",
        	"padding":"2px",
        	"box-sizing":"border-box",
        	"white-space":"pre-wrap",
        	"resize": "none",
        })
        .val(value);

        onRendered(function(){
        	input.focus();
        	input.css("height","100%");
        });

        //submit new value on blur
        input.on("change blur", function(e){
        	if(input.val() != cell.getValue()){
        		success(input.val());
        		setTimeout(function(){
        			cell.getRow().normalizeHeight();
        		},300)
        	}else{
        		cancel();
        	}
        });

        input.on("keyup", function(){

        	input.css({"height": ""});

        	var heightNow = input[0].scrollHeight;
        	input.css({"height": heightNow});

        	if(heightNow != scrollHeight){
        		scrollHeight = heightNow;
        		cell.getRow().normalizeHeight();
        	}
        });

        return input;
    },

    //input element with type of number
    number:function(cell, onRendered, success, cancel, editorParams){
    	var input = $("<input type='number'/>");

		//create and style input
		input.css({
			"padding":"4px",
			"width":"100%",
			"box-sizing":"border-box",
		})
		.val(cell.getValue());

		onRendered(function(){
			input.focus();
			input.css("height","100%");
		});

		//submit new value on blur
		input.on("blur", function(e){
			var value = input.val();

			if(!isNaN(value)){
				value = Number(value);
			}

			if(value != cell.getValue()){
				success(value);
			}else{
				cancel();
			}
		});

		//submit new value on enter
		input.on("keydown", function(e){
			var value;

			if(e.keyCode == 13){
				value = input.val();

				if(!isNaN(value)){
					value = Number(value);
				}

				success(value);
			}
		});

		return input;
	},

	//start rating
	star:function(cell, onRendered, success, cancel, editorParams){
		var element = cell.getElement(),
		value = cell.getValue(),
		maxStars = $("svg", element).length || 5,
		size = $("svg:first", element).attr("width") || 14,
		stars=$("<div style='vertical-align:middle; padding:4px; display:inline-block; vertical-align:middle;'></div>"),
		starActive = $('<svg width="' + size + '" height="' + size + '" class="tabulator-star-active" viewBox="0 0 512 512" xml:space="preserve" style="padding:0 1px;"><polygon fill="#488CE9" stroke="#014AAE" stroke-width="37.6152" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="259.216,29.942 330.27,173.919 489.16,197.007 374.185,309.08 401.33,467.31 259.216,392.612 117.104,467.31 144.25,309.08 29.274,197.007 188.165,173.919 "/></svg>'),
		starInactive = $('<svg width="' + size + '" height="' + size + '" class="tabulator-star-inactive" viewBox="0 0 512 512" xml:space="preserve" style="padding:0 1px;"><polygon fill="#010155" stroke="#686868" stroke-width="37.6152" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="259.216,29.942 330.27,173.919 489.16,197.007 374.185,309.08 401.33,467.31 259.216,392.612 117.104,467.31 144.25,309.08 29.274,197.007 188.165,173.919 "/></svg>');


		//change number of active stars
		var starChange = function(element){
			if($(".tabulator-star-active", element.closest("div")).length != element.prevAll("svg").length + 1){
				element.prevAll("svg").replaceWith(starActive.clone());
				element.nextAll("svg").replaceWith(starInactive.clone());
				element.replaceWith(starActive.clone());
			}
		}

		value = parseInt(value) < maxStars ? parseInt(value) : maxStars;

		for(var i=1;i<= maxStars;i++){
			let nextStar = i <= value ? starActive : starInactive;
			stars.append(nextStar.clone());
		}

		stars.on("mouseover", "svg", function(e){
			e.stopPropagation();
			starChange($(this));
		});

		stars.on("mouseover", function(e){
			$("svg", $(this)).replaceWith(starInactive.clone());
		});

		stars.on("click", function(e){
			success(0);
		});

		stars.on("click", "svg", function(e){
			e.stopPropagation();
			success($(this).prevAll("svg").length + 1);
		});

		element.css({
			"white-space": "nowrap",
			"overflow": "hidden",
			"text-overflow": "ellipsis",
		});

		element.on("blur", function(){
			cancel();
		});

		//allow key based navigation
		element.on("keydown", function(e){
			switch(e.keyCode){
				case 39: //right arrow
				starChange($(".tabulator-star-inactive:first", stars));
				break;

				case 37: //left arrow
				let prevstar = $(".tabulator-star-active:last", stars).prev("svg");

				if(prevstar.length){
					starChange(prevstar);
				}else{
					$("svg", stars).replaceWith(starInactive.clone());
				}
				break;

				case 13: //enter
				success($(".tabulator-star-active", stars).length);
				break;

			}
		});

		return stars;
	},

	//draggable progress bar
	progress:function(cell, onRendered, success, cancel, editorParams){
		var element = cell.getElement(),
		max = $("div", element).data("max"),
		min = $("div", element).data("min"),
		percent = (max - min) / 100,
		value = cell.getValue() || 0,
		handle = $("<div class='tabulator-progress-handle' style='position:absolute; right:0; top:0; bottom:0; width:5px;'></div>"),
		bar;

		var newVal = function(){
			var calcVal = (percent * Math.round(bar.outerWidth() / (element.width()/100))) + min;
			success(calcVal);
			element.attr("aria-valuenow", calcVal).attr("aria-label", value);
		}

		//make sure value is in range
		value = parseFloat(value) <= max ? parseFloat(value) : max;
		value = parseFloat(value) >= min ? parseFloat(value) : min;

		//workout percentage
		value = 100 - Math.round((value - min) / percent);

		bar = $("<div style='position:absolute; top:8px; bottom:8px; left:4px; right:" + value + "%; margin-right:4px; background-color:#488CE9; display:inline-block; max-width:100%; min-width:0%;' data-max='" + max + "' data-min='" + min + "'></div>"),

		element.css({
			padding:"0 4px",
		});

		element.attr("aria-valuemin", min).attr("aria-valuemax", max);

		bar.append(handle);

		handle.on("mousedown", function(e){
			bar.data("mouseDrag", e.screenX);
			bar.data("mouseDragWidth", bar.outerWidth());
		});

		handle.on("mouseover", function(){$(this).css({cursor:"ew-resize"})});

		element.on("mousemove", function(e){
			if(bar.data("mouseDrag")){
				bar.css({width: bar.data("mouseDragWidth") + (e.screenX - bar.data("mouseDrag"))})
			}
		});

		element.on("mouseup", function(e){
			if(bar.data("mouseDrag")){
				e.stopPropagation();
				e.stopImmediatePropagation();

				bar.data("mouseDragOut", true);
				bar.data("mouseDrag", false);
				bar.data("mouseDragWidth", false);

				newVal();

			}
		});

		//allow key based navigation
		element.on("keydown", function(e){
			switch(e.keyCode){
				case 39: //right arrow
				bar.css({"width" : bar.width() + element.width()/100});
				break;

				case 37: //left arrow
				bar.css({"width" : bar.width() - element.width()/100});
				break;

				case 13: //enter
				newVal();
				break;

			}
		});

		element.on("blur", function(){
			cancel();
		});

		return bar;
	},

	//checkbox
	tickCross:function(cell, onRendered, success, cancel, editorParams){
		var value = cell.getValue(),
		input = $("<input type='checkbox'/>");

		//create and style input
		input.css({
			"margin-top":"5px",
			"box-sizing":"border-box",
		})
		.val(value);

		onRendered(function(){
			input.focus();
		});

		if(value === true || value === "true" || value === "True" || value === 1){
			input.prop("checked", true);
		}else{
			input.prop("checked", false);
		}

		//submit new value on blur
		input.on("change blur", function(e){
			success(input.is(":checked"));
		});

		//submit new value on enter
		input.on("keydown", function(e){
			if(e.keyCode == 13){
				success(input.is(":checked"));
			}
		});

		return input;
	},

	//checkbox
	tick:function(cell, onRendered, success, cancel, editorParams){
		var value = cell.getValue(),
		input = $("<input type='checkbox'/>");

		//create and style input
		input.css({
			"margin-top":"5px",
			"box-sizing":"border-box",
		})
		.val(value);

		onRendered(function(){
			input.focus();
		});

		if(value === true || value === "true" || value === "True" || value === 1){
			input.prop("checked", true);
		}else{
			input.prop("checked", false);
		}

		//submit new value on blur
		input.on("change blur", function(e){
			success(input.is(":checked"));
		});

		//submit new value on enter
		input.on("keydown", function(e){
			if(e.keyCode == 13){
				success(input.is(":checked"));
			}
		});

		return input;
	},
};

Tabulator.registerExtension("edit", Edit);