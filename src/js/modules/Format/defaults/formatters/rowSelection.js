import RowComponent from '../../../../core/row/RowComponent.js';

export default function(cell, formatterParams, onRendered){
	var checkbox = document.createElement("input");
	var blocked = false;

	checkbox.type = 'checkbox';

	checkbox.setAttribute("aria-label", "Select Row");
	
	if(this.table.modExists("selectRow", true)){

		checkbox.addEventListener("click", (e) => {
			e.stopPropagation();
		});

		if(typeof cell.getRow == 'function'){
			var row = cell.getRow();

			if(row instanceof RowComponent){

				checkbox.addEventListener("change", (e) => {
					if(this.table.options.selectableRowsRangeMode === "click"){
						if(!blocked){
							row.toggleSelect();
						}else{
							blocked = false;
						}
					}else{
						row.toggleSelect();
					}
				});

				if(this.table.options.selectableRowsRangeMode === "click"){
					checkbox.addEventListener("click", (e) => {
						blocked = true;
						this.table.modules.selectRow.handleComplexRowClick(row._row, e);
					});
				}

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
}