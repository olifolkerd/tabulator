module.exports = function(cell, formatterParams, onRendered){
	cell.getElement().style.whiteSpace = "pre-wrap";
	return this.emptyToSpace(this.sanitizeHTML(cell.getValue()));
};