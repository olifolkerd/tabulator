var ResizeColumns = function(table){

	var extension = {
		table:table, //hold Tabulator object

		column:false,
		startX:false,
		startWidth:false,

		initializeColumn:function(column, element){
			var self = this;

			//create resize handle
			var handle = $("<div class='tabulator-col-resize-handle'></div>");
			var prevHandle = $("<div class='tabulator-col-resize-handle prev'></div>");

			element.append(handle)
			.append(prevHandle);

			handle.on("click", function(e){
				e.stopPropagation();
			});

			handle.on("mousedown", function(e){
				var nearestColumn = column.getLastColumn();

				if(nearestColumn){
					self._mouseDown(e, nearestColumn);
				}
			});

			prevHandle.on("mousedown", function(e){
				var nearestColumn, colIndex, prevColumn;

				nearestColumn = column.getFirstColumn();

				if(nearestColumn){
					colIndex = self.table.columnManager.findColumnIndex(nearestColumn);
					prevColumn = colIndex > 0 ? self.table.columnManager.getColumnByIndex(colIndex - 1) : false;

					if(prevColumn){
						self._mouseDown(e, prevColumn);
					}
				}
			});
		},

		_mouseDown:function(e, column){
			var self = this;

			function mouseMove(e){
				column.setWidth(self.startWidth + (e.screenX - self.startX))
			}

			function mouseUp(e){
				$("body").off("mouseup", mouseMove);
				$("body").off("mousemove", mouseMove);
			}

			e.stopPropagation(); //prevent resize from interfereing with movable columns

			self.column = column;
			self.startX = e.screenX;
			self.startWidth = column.getWidth();

			$("body").on("mousemove", mouseMove);

			$("body").on("mouseup", mouseUp);
		}
	}

	return extension;
}

Tabulator.registerExtension("resizeColumns", ResizeColumns);