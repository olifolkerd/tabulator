//resize columns to fit data they contain and stretch row to fill table, also used for fitDataTable
export default function(columns){
	columns.forEach(function(column){
		column.reinitializeWidth();
	});

	if(this.table.options.responsiveLayout && this.table.modExists("responsiveLayout", true)){
		this.table.modules.responsiveLayout.update();
	}
};