import List from '../../List.js';

export default function(cell, onRendered, success, cancel, editorParams){
	var list = new List(this, cell, onRendered, success, cancel, editorParams);

	return list.input;
}