module.exports = function(cell, formatterParams, onRendered){
	return this.emptyToSpace(this.sanitizeHTML(cell.getValue()));
};