export default function(cell, formatterParams, onRendered){
	var checkbox = document.createElement("input");

	checkbox.type = 'checkbox';

	if(this.table.modExists("selectRow", true)){

		checkbox.addEventListener("click", (e) => {
			e.stopPropagation();
		});

		if(typeof cell.getRow == 'function'){
			var row = cell.getRow();

			if(row instanceof RowComponent){

				checkbox.addEventListener("change", (e) => {
					row.toggleSelect();
				});

				checkbox.checked = row.isSelected && row.isSelected();
				this.table.modules.selectRow.registerRowSelectCheckbox(row, checkbox);
			}else{
				checkbox = "";
			}
		}else {
			checkbox.addEventListener("change", (e) => {
				if(this.table.modules.selectRow.selectedRows.length){
					this.table.deselectRow();
				}else {
					this.table.selectRow(formatterParams.rowRange);
				}
			});

			this.table.modules.selectRow.registerHeaderSelectCheckbox(checkbox);
		}
	}

	return checkbox;
};