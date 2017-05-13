var ResizeColumns = function(table){

	var extension = {
		table:table, //hold Tabulator object

		startColumn:false,
		startX:false,
		startWidth:false,
		handle:$("<div class='tabulator-col-resize-handle'></div>"),
		prevHandle:$("<div class='tabulator-col-resize-handle prev'></div>"),

		initializeColumn:function(column, element){
			var self = this,
			handle = self.handle.clone(),
			prevHandle = self.prevHandle.clone();

			handle.on("click", function(e){
				e.stopPropagation();
			});

			prevHandle.on("click", function(e){
				e.stopPropagation();
			});

			handle.on("mousedown", function(e){
				var nearestColumn = column.getLastColumn();

				if(nearestColumn){
					self.startColumn = column;
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
						self.startColumn = column;
						self._mouseDown(e, prevColumn);
					}
				}
			});

			element.append(handle)
			.append(prevHandle);
		},

		_mouseDown:function(e, column){
			var self = this;

			self.table.element.addClass("tabulator-block-select");

			function mouseMove(e){
				column.setWidth(self.startWidth + (e.screenX - self.startX))
			}

			function mouseUp(e){

				//block editor from taking action while resizing is taking place
				if(self.startColumn.extensions.edit){
					self.startColumn.extensions.edit.blocked = false;
				}

				$("body").off("mouseup", mouseMove);
				$("body").off("mousemove", mouseMove);

				self.table.element.removeClass("tabulator-block-select");

				if(self.table.options.persistentLayout && self.table.extExists("persistentLayout", true)){
					self.table.extensions.persistentLayout.save();
				}
			}

			e.stopPropagation(); //prevent resize from interfereing with movable columns

			//block editor from taking action while resizing is taking place
			if(self.startColumn.extensions.edit){
				self.startColumn.extensions.edit.blocked = true;
			}

			self.startX = e.screenX;
			self.startWidth = column.getWidth();

			$("body").on("mousemove", mouseMove);

			$("body").on("mouseup", mouseUp);
		}
	}

	return extension;
}

Tabulator.registerExtension("resizeColumns", ResizeColumns);