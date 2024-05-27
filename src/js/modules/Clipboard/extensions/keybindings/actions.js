export default {
	copyToClipboard:function(e){
		if(!this.table.modules.edit.currentCell){
			if(this.table.modExists("clipboard", true)){
				this.table.modules.clipboard.copy(false, true);
			}
		}
	},
};
