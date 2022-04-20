import List from '../../List.js';

export default function(cell, onRendered, success, cancel, editorParams){

	console.warn("The autocomplete editor has been deprecated, please use the new list editor with the 'autocomplete' editorParam");

	editorParams.autocomplete = true;

    var list = new List(this, cell, onRendered, success, cancel, editorParams);

    return list.input;
}