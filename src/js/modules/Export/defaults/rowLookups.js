export default {
	visible:function(){
		return this.rowManager.getVisibleRows(false, true);
	},
	all:function(){
		return this.rowManager.rows;
	},
	selected:function(){
		return this.modules.selectRow.selectedRows;
	},
	active:function(){
		if(this.options.pagination){
			return this.rowManager.getDisplayRows(this.rowManager.displayRows.length - 2);
		}else{
			return this.rowManager.getDisplayRows();
		}
	},
};