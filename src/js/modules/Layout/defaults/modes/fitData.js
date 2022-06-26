//resize columns to fit data they contain
export default function(columns, forced){
	if(forced){
		this.table.columnManager.renderer.reinitializeColumnWidths(columns);
	}
	
	if(this.table.options.responsiveLayout && this.table.modExists("responsiveLayout", true)){
		this.table.modules.responsiveLayout.update();
	}
}