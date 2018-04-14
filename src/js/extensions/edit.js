var Edit = function(table){
	this.table = table; //hold Tabulator object
	this.currentCell = false; //hold currently editing cell
	this.mouseClick = false; //hold mousedown state to prevent click binding being overriden by editor opening
	this.recursionBlock = false; //prevent focus recursion
	this.invalidEdit = false;
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

Edit.prototype.clearEditor = function(){
	var cell = this.currentCell;

	this.invalidEdit = false;

	if(cell){
		this.currentCell = false;
		cell.getElement().removeClass("tabulator-validation-fail");
		cell.getElement().removeClass("tabulator-editing").empty();
		cell.row.getElement().removeClass("tabulator-row-editing");
	}
};

Edit.prototype.cancelEdit = function(){

	if(this.currentCell){
		var cell = this.currentCell;
		var component = this.currentCell.getComponent();

		this.clearEditor();
		cell.setValueActual(cell.getValue());

		if(cell.column.cellEvents.cellEditCancelled){
			cell.column.cellEvents.cellEditCancelled(component);
		}

		this.table.options.cellEditCancelled(component);
	}
};

//return a formatted value for a cell
Edit.prototype.bindEditor = function(cell){
	var self = this,
	element = cell.getElement();

	element.attr("tabindex", 0);

	element.on("click", function(e){
		if(!$(this).hasClass("tabulator-editing")){
			$(this).focus();
		}
	});

	element.on("mousedown", function(e){
		self.mouseClick = true;
	});

	element.on("focus", function(e){
		if(!self.recursionBlock){
			self.edit(cell, e, false);
		}
	});
};

Edit.prototype.focusCellNoEvent = function(cell){
	this.recursionBlock = true;
	cell.getElement().focus();
	this.recursionBlock = false;
}

Edit.prototype.editCell = function(cell, forceEdit){
	this.focusCellNoEvent(cell);
	this.edit(cell, false, forceEdit);
}

Edit.prototype.edit = function(cell, e, forceEdit){
	var self = this,
	allowEdit = true,
	rendered = function(){},
	element = cell.getElement(),
	cellEditor, component;

	//prevent editing if another cell is refusing to leave focus (eg. validation fail)
	if(this.currentCell){
		if(!this.invalidEdit){
			this.cancelEdit();
		}else{
			return;
		}
		return
	}

	//handle successfull value change
	function success(value){

		if(self.currentCell === cell){
			var valid = true;

			if(cell.column.extensions.validate && self.table.extExists("validate")){
				valid = self.table.extensions.validate.validate(cell.column.extensions.validate, cell.getComponent(), value);
			}

			if(valid === true){
				self.clearEditor();
				cell.setValue(value, true);
			}else{
				self.invalidEdit = true;
				cell.getElement().addClass("tabulator-validation-fail");
				self.focusCellNoEvent(cell);
				rendered();
				self.table.options.validationFailed(cell.getComponent(), value, valid);
			}
		}else{
			console.warn("Edit Success Error - cannot call success on a cell that is no longer being edited");
		}
	};

	//handle aborted edit
	function cancel(){
		if(self.currentCell === cell){
			self.cancelEdit();
		}else{
			console.warn("Edit Success Error - cannot call cancel on a cell that is no longer being edited");
		}
	};

	function onRendered(callback){
		rendered = callback;
	}

	if(!cell.column.extensions.edit.blocked){
		if(e){
			e.stopPropagation();
		}

		switch(typeof cell.column.extensions.edit.check){
			case "function":
			allowEdit = cell.column.extensions.edit.check(cell.getComponent());
			break;

			case "boolean":
			allowEdit = cell.column.extensions.edit.check;
			break;
		}

		if(allowEdit || forceEdit){

			self.cancelEdit();

			self.currentCell = cell;

			component = cell.getComponent();

			if(this.mouseClick){
				this.mouseClick = false;

				if(cell.column.cellEvents.cellClick){
					cell.column.cellEvents.cellClick(component);
				}
			}

			if(cell.column.cellEvents.cellEditing){
				cell.column.cellEvents.cellEditing(component);
			}

			self.table.options.cellEditing(component);

			cellEditor = cell.column.extensions.edit.editor.call(self, component, onRendered, success, cancel, cell.column.extensions.edit.params);

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
				return false;
			}

			return true;
		}else{
			this.mouseClick = false;
			element.blur();
			return false;
		}
	}else{
		this.mouseClick = false;
		element.blur();
		return false;
	}
}

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

			if(e.keyCode == 27){
				cancel();
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

        input.on("keydown", function(e){
        	if(e.keyCode == 27){
        		cancel();
        	}
        });

        return input;
    },

    //input element with type of number
    number:function(cell, onRendered, success, cancel, editorParams){

    	var max = typeof editorParams.max != "undefined" ? "max='" + editorParams.max + "'" : "";
    	var min = typeof editorParams.min != "undefined" ? "min='" + editorParams.min + "'" : "";
    	var step = "step='" + (typeof editorParams.step != "undefined" ? editorParams.step : 1) + "'";
    	var input = $("<input type='number' " + max + " " + min + " " + step + "/>");

		//create and style input
		input.css({
			"padding":"4px",
			"width":"100%",
			"box-sizing":"border-box",
		})
		.val(cell.getValue());

		onRendered(function(){
			input.css("height","100%");
			setTimeout(function(){
				input.focus();
			}, 10);
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

			if(e.keyCode == 27){
				cancel();
			}
		});

		return input;
	},

    //input element with type of number
    range:function(cell, onRendered, success, cancel, editorParams){

    	var max =  "max='" + (typeof editorParams.max != "undefined" ? editorParams.max : 10) + "'" ;
    	var min =  "min='" + (typeof editorParams.min != "undefined" ? editorParams.min : 0) + "'" ;
    	var step = "step='" + (typeof editorParams.step != "undefined" ? editorParams.step : 1) + "'";
    	var input = $("<input type='range' " + max + " " + min + " " + step + "/>");

		//create and style input
		input.css({
			"padding":"4px",
			"width":"100%",
			"box-sizing":"border-box",
		})
		.val(cell.getValue());

		onRendered(function(){
			input.css("height","100%");
			setTimeout(function(){
				input.focus();
			}, 10);
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

			if(e.keyCode == 27){
				cancel();
			}
		});

		return input;
	},

	//select
	select: function (cell, onRendered, success, cancel, editorParams) {
		//create and style select
		var select = $("<select><select/>");
		var isArray = Array.isArray(editorParams);

		if(typeof editorParams == "function"){
			editorParams = editorParams(cell);
			isArray = Array.isArray(editorParams);
		}

		function optionAppend(element, label, value, disabled){

			var option = $("<option></option>").attr("value", value).text(label);

			if(disabled){
				option.prop("disabled", true);
			}

			element.append(option);
		}

		function processOption(element, option){
			var groupEl;

			if(option.options){
				groupEl = $("<optgroup></optgroup>").attr("label", option.label);

				option.options.forEach(function(item){
					processOption(groupEl, item);
				});

				element.append(groupEl);
			}else{
				optionAppend(element, typeof option.label == "undefined" ? option.value : option.label,  typeof option.value == "undefined" ? option.label : option.value, option.disabled);
			}
		}

		if(!isArray && typeof editorParams === "object"){
			for(var key in editorParams){
				optionAppend(select, editorParams[key], key)
			}
		}else if (isArray){
			editorParams.forEach(function(item){
				processOption(select, item);
			});
		}

		select.css({
			"padding":"4px",
			"width":"100%",
			"box-sizing":"border-box",
			"font-family":"",
		}).val(cell.getValue())

		onRendered(function () {
			select.focus().click();
		});

		//submit new value on blur
		select.on("change blur", function (e) {
			success(select.val());
		});

		//submit new value on enter
		select.on("keydown", function (e) {
			if (e.keyCode === 13) {
				success(select.val());
			}
		});
		return select;
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

				case 27: //escape
				cancel();
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

				case 27: //escape
				cancel();
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

		if(this.table.browser != "firefox"){ //prevent blur issue on mac firefox
			onRendered(function(){
				input.focus();
			});
		}

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
			if(e.keyCode == 27){
				cancel();
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

		if(this.table.browser != "firefox"){  //prevent blur issue on mac firefox
			onRendered(function(){
				input.focus();
			});
		}

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
			if(e.keyCode == 27){
				cancel();
			}
		});

		return input;
	},
};

Tabulator.registerExtension("edit", Edit);