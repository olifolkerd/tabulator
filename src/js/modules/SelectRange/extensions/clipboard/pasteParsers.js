export default {
	range:function(clipboard){
		var data = [],
		rows = [],
		range = this.table.modules.selectRange.activeRange,
		singleCell = false,
		bounds, startCell, colWidth, columnMap, startCol;
		
		if(range){
			bounds = range.getBounds();
			startCell = bounds.start;

			if(bounds.start === bounds.end){
				singleCell = true;
			}
			
			if(startCell){
				//get data from clipboard into array of columns and rows.
				clipboard = clipboard.split("\n");
				
				clipboard.forEach(function(row){
					data.push(row.split("\t"));
				});
				
				if(data.length){
					columnMap = this.table.columnManager.getVisibleColumnsByIndex();
					startCol = columnMap.indexOf(startCell.column);

					if(startCol > -1){
						if(singleCell){
							colWidth = data[0].length;
						}else{
							colWidth = (columnMap.indexOf(bounds.end.column) - startCol) + 1;
						}

						columnMap = columnMap.slice(startCol, startCol + colWidth);

						data.forEach((item) => {
							var row = {};
							var itemLength = item.length;

							columnMap.forEach(function(col, i){
								row[col.field] = item[i % itemLength];
							});
							
							rows.push(row);	
						});

						return rows;
					}				
				}
			}
		}
		
		return false;
	}
};