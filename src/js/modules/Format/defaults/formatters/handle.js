export default function(cell, formatterParams, onRendered){
	cell.getElement().classList.add("tabulator-row-handle");
	return "<div class='tabulator-row-handle-box'><div class='tabulator-row-handle-bar'></div><div class='tabulator-row-handle-bar'></div><div class='tabulator-row-handle-bar'></div></div>";
};