var FooterManager = function(table){
	this.table = table;
	this.element = $("<div class='tabulator-footer'></div>"); //containing element

	this._initialize();
};

FooterManager.prototype._initialize = function(element){
	if(this.table.options.footerElement){
		this.element = this.table.options.footerElement;
	}
};

FooterManager.prototype.getElement = function(){
	return this.element;
};

FooterManager.prototype.append = function(element){
	this.element.append(element);
	this.table.rowManager.adjustTableSize();
};

