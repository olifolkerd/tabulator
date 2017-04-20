Column = function(def, parent){

	var col = {
		table:parent.table,
		definition:def, //column definition
		parent:parent, //hold parent object
		colums:[], //child columns
		element:$(""), //column header element
		groupElement:false, //column group holder element

		//return column header element
		getElement:function(){
			return this.groupElement;
		},

		//return colunm group element
		getGroupElement:function(){
			return this.groupElement;
		},

		//register column position with column manager
		registerColumnPosition:function(col){
			parent.registerColumnPosition(col);
		},
	};

	//initialize column
	if(def.columns){
		def.columns.forEach(function(def, i){
			var newCol = new Column(def, col);

			col.columns.push(newCol);
		});
	}else{
		parent.registerColumnPosition(col);
	}

	return col;
}