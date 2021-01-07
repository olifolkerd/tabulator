module.exports = function(cell, formatterParams, onRendered){
	cell.getElement().style.backgroundColor = this.sanitizeHTML(cell.getValue());
	return "";
};