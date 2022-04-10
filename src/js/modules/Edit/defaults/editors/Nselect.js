import List from '../../List.js';

export default function(cell, onRendered, success, cancel, editorParams){
    var list = new List(this, cell, onRendered, success, cancel, editorParams);

    list.input.style.cursor = "default";
	list.input.readOnly = (this.currentCell != false);

    return list.input;
}