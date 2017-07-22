var FooterManager = function(table){
	this.table = table;
	this.active = false;
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
	this.activate();

	this.element.append(element);
	this.table.rowManager.adjustTableSize();
};

FooterManager.prototype.prepend = function(element){
	this.activate();

	this.element.prepend(element);
	this.table.rowManager.adjustTableSize();
};

FooterManager.prototype.activate = function(){
	if(!this.active){
		this.active = true;
		this.table.element.append(this.getElement());
	}
}