export default {
	replace:function(rows){
		return this.table.setData(rows);
	},
	update:function(rows){
		return this.table.updateOrAddData(rows);
	},
	insert:function(rows){
		return this.table.addData(rows);
	},
};