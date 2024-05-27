export default{
	insert:function(fromRow, toRow, fromTable){
		this.table.addRow(fromRow.getData(), undefined, toRow);
		return true;
	},

	add:function(fromRow, toRow, fromTable){
		this.table.addRow(fromRow.getData());
		return true;
	},

	update:function(fromRow, toRow, fromTable){
		if(toRow){
			toRow.update(fromRow.getData());
			return true;
		}

		return false;
	},

	replace:function(fromRow, toRow, fromTable){
		if(toRow){
			this.table.addRow(fromRow.getData(), undefined, toRow);
			toRow.delete();
			return true;
		}

		return false;
	},
};