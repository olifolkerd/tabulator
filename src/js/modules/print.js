var Print = function(table){
	this.table = table; //hold Tabulator object
	this.element = false;
};

Print.prototype.initialize = function(){

	this.element = document.createElement("div");
	this.element.classList.add("tabulator-print-table");

	window.addEventListener("beforeprint", this.replaceTable.bind(this));
	window.addEventListener("afterprint", this.cleanup.bind(this));
}

Print.prototype.replaceTable = function(){

	this.element.innerHTML = "";

	this.element.appendChild(this.table.modules.htmlTableExport.genereateTable());

	this.table.element.style.display = "none";

	this.table.element.parentNode.insertBefore(this.element, this.table.element);
}


Print.prototype.cleanup = function(){
	this.element.parentNode.removeChild(this.element);
	this.table.element.style.display = "";
}

Tabulator.prototype.registerModule("print", Print);