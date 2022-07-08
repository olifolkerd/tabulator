import List from '../../List.js';

export default function(cell, onRendered, success, cancel, editorParams){

	this.deprecationMsg("The select editor has been deprecated, please use the new list editor");

	var list = new List(this, cell, onRendered, success, cancel, editorParams);

	return list.input;
}