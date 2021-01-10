//public group object
class GroupComponent {
	constructor (group){
		this._group = group;
		this.type = "GroupComponent";
	}

	getKey(){
		return this._group.key;
	}

	getField(){
		return this._group.field;
	}

	getElement(){
		return this._group.element;
	}

	getRows(){
		return this._group.getRows(true);
	}

	getSubGroups(){
		return this._group.getSubGroups(true);
	}

	getParentGroup(){
		return this._group.parent ? this._group.parent.getComponent() : false;
	}

	getVisibility(){
		console.warn("getVisibility function is deprecated, you should now use the isVisible function");
		return this._group.visible;
	}

	isVisible(){
		return this._group.visible;
	}

	show(){
		this._group.show();
	}

	hide(){
		this._group.hide();
	}

	toggle(){
		this._group.toggleVisibility();
	}

	_getSelf(){
		return this._group;
	}

	getTable(){
		return this._group.groupManager.table;
	}
}

export default GroupComponent;