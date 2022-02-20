export default function(cell, formatterParams, onRendered){
	return this.table.rowManager.activeRows.indexOf(cell.getRow()._getSelf()) + 1 || "";
};