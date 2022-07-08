export default {
	table:function(clipboard){
		var data = [],
		headerFindSuccess = true,
		columns = this.table.columnManager.columns,
		columnMap = [],
		rows = [];

		//get data from clipboard into array of columns and rows.
		clipboard = clipboard.split("\n");

		clipboard.forEach(function(row){
			data.push(row.split("\t"));
		});

		if(data.length && !(data.length === 1 && data[0].length < 2)){

			//check if headers are present by title
			data[0].forEach(function(value){
				var column = columns.find(function(column){
					return value && column.definition.title && value.trim() && column.definition.title.trim() === value.trim();
				});

				if(column){
					columnMap.push(column);
				}else{
					headerFindSuccess = false;
				}
			});

			//check if column headers are present by field
			if(!headerFindSuccess){
				headerFindSuccess = true;
				columnMap = [];

				data[0].forEach(function(value){
					var column = columns.find(function(column){
						return value && column.field && value.trim() && column.field.trim() === value.trim();
					});

					if(column){
						columnMap.push(column);
					}else{
						headerFindSuccess = false;
					}
				});

				if(!headerFindSuccess){
					columnMap = this.table.columnManager.columnsByIndex;
				}
			}

			//remove header row if found
			if(headerFindSuccess){
				data.shift();
			}

			data.forEach(function(item){
				var row = {};

				item.forEach(function(value, i){
					if(columnMap[i]){
						row[columnMap[i].field] = value;
					}
				});

				rows.push(row);
			});

			return rows;
		}else{
			return false;
		}
	}
};