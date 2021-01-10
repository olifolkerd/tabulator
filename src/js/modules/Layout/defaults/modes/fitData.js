//resize columns to fit data they contain
export default function(columns){
	if(this.table.options.virtualDomHoz){
		this.table.vdomHoz.fitDataLayoutOverride();
	}else{
		columns.forEach(function(column){
			column.reinitializeWidth();
		});
	}

	if(this.table.options.responsiveLayout && this.table.modExists("responsiveLayout", true)){
		this.table.modules.responsiveLayout.update();
	}
};