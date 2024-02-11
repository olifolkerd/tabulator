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
	range:function(data){
		var rows = [],
		range = this.table.modules.selectRange.activeRange,
		startCell, startRow;
		
		if(range){
			startCell = range.getBounds().start;

			if(startCell){
				rows = this.table.rowManager.activeRows.slice();
				startRow = rows.indexOf(startCell.row);

				if(startRow >-1){
					this.table.blockRedraw();

					rows = rows.slice(startRow, startRow + data.length);

					rows.forEach((row, i) => {
						row.updateData(data[i]);
					});
				
					this.table.restoreRedraw();
				}
			}
		}
		
		return rows;
	}
};