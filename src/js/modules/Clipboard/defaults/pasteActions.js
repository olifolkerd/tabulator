export default {
	replace:function(data){
		return this.table.setData(data);
	},
	update:function(data){
		return this.table.updateOrAddData(data);
	},
	insert:function(data){
		return this.table.addData(data);
	},
};