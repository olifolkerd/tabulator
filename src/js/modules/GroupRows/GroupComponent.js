//public group object
class GroupComponent {
	constructor (group){
		this._group = group;
		this.type = "GroupComponent";

		return new Proxy(this, {
			get: function(target, name, receiver) {
				if (typeof target[name] !== "undefined") {
					return target[name];
				}else{
					return target._group.groupManager.table.componentFunctionBinder.handle("row", target._group, name)
				}
			}
		})
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