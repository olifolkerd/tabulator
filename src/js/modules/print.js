var Print = function(table){
	this.table = table; //hold Tabulator object
	this.element = false;
	this.manualBlock = false;
};

Print.prototype.initialize = function(){
	window.addEventListener("beforeprint", this.replaceTable.bind(this));
	window.addEventListener("afterprint", this.cleanup.bind(this));
};

Print.prototype.replaceTable = function(){
	if(!this.manualBlock){
		this.element = document.createElement("div");
		this.element.classList.add("tabulator-print-table");

		this.element.appendChild(this.table.modules.htmlTableExport.genereateTable(this.table.options.printConfig, this.table.options.printCopyStyle, this.table.options.printVisibleRows, "print"));

		this.table.element.style.display = "none";

		this.table.element.parentNode.insertBefore(this.element, this.table.element);
	}
};

Print.prototype.cleanup = function(){
	document.body.classList.remove("tabulator-print-fullscreen-hide");

	if(this.element && this.element.parentNode){
		this.element.parentNode.removeChild(this.element);
		this.table.element.style.display = "";
	}
};

Print.prototype.printFullscreen = function(visible, style, config){
	var scrollX = window.scrollX,
	scrollY = window.scrollY,
	headerEl = document.createElement("div"),
	footerEl = document.createElement("div"),
	tableEl = this.table.modules.htmlTableExport.genereateTable(typeof config != "undefined" ? config : this.table.options.printConfig, typeof style != "undefined" ? style : this.table.options.printCopyStyle, visible, "print");

	this.manualBlock = true;

	this.element = document.createElement("div");
	this.element.classList.add("tabulator-print-fullscreen");

	if(this.table.options.printHeader){
		headerEl.classList.add("tabulator-print-header");

		if(typeof this.table.options.printHeader == "string"){
			headerEl.innerHTML = this.table.options.printHeader;
		}else{
			headerEl.appendChild(this.table.options.printHeader);
		}

		this.element.appendChild(headerEl);
	}

	this.element.appendChild(tableEl);

	if(this.table.options.printFooter){
		footerEl.classList.add("tabulator-print-footer");

		if(typeof this.table.options.printFooter == "string"){
			footerEl.innerHTML = this.table.options.printFooter;
		}else{
			footerEl.appendChild(this.table.options.printFooter);
		}

		this.element.appendChild(footerEl);
	}

	document.body.classList.add("tabulator-print-fullscreen-hide");
	document.body.appendChild(this.element);

	this.table.options.printFormatter(this.element, tableEl);

	window.print();

	this.cleanup();

	window.scrollTo(scrollX, scrollY);

	this.manualBlock = false;
};

Tabulator.prototype.registerModule("print", Print);