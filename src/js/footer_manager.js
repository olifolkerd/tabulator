var FooterManager = function(table){
	this.table = table;
	this.active = false;
	this.element = $("<div class='tabulator-footer'></div>"); //containing element
	this.links = [];

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


FooterManager.prototype.append = function(element, parent){
	this.activate(parent);

	this.element.append(element);
	this.table.rowManager.adjustTableSize();
};

FooterManager.prototype.prepend = function(element, parent){
	this.activate(parent);

	this.element.prepend(element);
	this.table.rowManager.adjustTableSize();
};

FooterManager.prototype.activate = function(parent){
	if(!this.active){
		this.active = true;
		this.table.element.append(this.getElement());
	}

	if(parent){
		this.links.push(parent);
	}
}

FooterManager.prototype.redraw = function(){
	this.links.forEach(function(link){
		link.footerRedraw();
	});
};