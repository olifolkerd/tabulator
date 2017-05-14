var FooterManager = function(table){
	this.table = table;
	this.element = $("<div class='tabulator-footer'></div>"); //containing element
};

FooterManager.prototype.getElement = function(){
	return this.element;
};

FooterManager.prototype.append = function(element){
	this.element.append(element);
	this.table.rowManager.adjustTableSize();
};