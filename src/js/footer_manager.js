var FooterManager = function(table){

	var manager = {
		table:table,
		element:$("<div class='tabulator-footer'></div>"), //containing element

		getElement:function(){
			return this.element;
		},

		append:function(element){
			this.element.append(element);
			this.table.rowManager.adjustTableSize();
		},
	}

	return manager;
}