var FooterManager = function(table){
	this.table = table;
	this.active = false;
	this.element = this.createElement(); //containing element
	this.links = [];

	this._initialize();
};

FooterManager.prototype.createElement = function (){
	var el = document.createElement("div");

	el.classList.add("tabulator-footer");

	return el;
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

	this.element.appendChild(element);
	this.table.rowManager.adjustTableSize();
};

FooterManager.prototype.prepend = function(element, parent){
	this.activate(parent);

	this.element.insertBefore(element, this.element.firstChild);
	this.table.rowManager.adjustTableSize();
};

FooterManager.prototype.remove = function(element){
	element.remove();
	this.deactivate();
};

FooterManager.prototype.deactivate = function(force){
	if(this.element.is(":empty") || force){
		this.element.parentNode.removeChild(this.element)
		this.active = false;
	}

	// this.table.rowManager.adjustTableSize();
}

FooterManager.prototype.activate = function(parent){
	if(!this.active){
		this.active = true;
		this.table.element.appendChild(this.getElement());
		this.table.element.style.display = '';
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