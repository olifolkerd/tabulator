var PersistentLayout = function(table){
	this.table = table; //hold Tabulator object
	this.mode = "";
	this.id = "";
	this.persistProps = ["field", "width", "visible"];
};

//setup parameters
PersistentLayout.prototype.initialize = function(mode, id){
	//determine persistent layout storage type
	this.mode = mode !== true ?  mode : (typeof window.localStorage !== 'undefined' ? "local" : "cookie");

	//set storage tag
	this.id = "tabulator-" + (id || (this.table.element.attr("id") || ""));
};

//load saved definitions
PersistentLayout.prototype.load = function(definition){

	var newDefinition = "";

	switch(this.mode){
		case "local":
		newDefinition = localStorage.getItem(this.id);
		break;

		case "cookie":

		//find cookie
		let cookie = document.cookie,
		cookiePos = cookie.indexOf(this.id + "="),
		end;

		//if cookie exists, decode and load column data into tabulator
		if(cookiePos > -1){
			cookie = cookie.substr(cookiePos);

			end = cookie.indexOf(";");

			if(end > -1){
				cookie = cookie.substr(0, end);
			}

			newDefinition = cookie.replace(this.id + "=", "");
		}
		break;

		default:
		console.warn("Persistance Load Error - invalid mode selected", this.mode);
	}

	if(newDefinition){
		newDefinition = JSON.parse(newDefinition);

		definition = this.mergeDefinition(definition, newDefinition);
	}

	return definition;
};

//merge old and new column defintions
PersistentLayout.prototype.mergeDefinition = function(oldCols, newCols){
	var self = this,
	output = [];

	newCols.forEach(function(column, to){

		var from = self._findColumn(oldCols, column);

		if(from){

			from.width = column.width;
			from.visible = column.visible;

			if(from.columns){
				from.columns = self.mergeDefinition(from.columns, column.columns);
			}

			output.push(from);
		}

	});

	return output;
};

//find matching columns
PersistentLayout.prototype._findColumn = function(columns, subject){
	var type = subject.columns ? "group" : (subject.field ? "field" : "object");

	return columns.find(function(col){
		switch(type){
			case "group":
			return col.title === subject.title && col.columns.length === subject.columns.length;
			break;

			case "field":
			return col.field === subject.field;
			break;

			case "object":
			return col === subject;
			break;
		}
	})
};

//save current definitions
PersistentLayout.prototype.save = function(){
	var definition = this.parseColumns(this.table.columnManager.getColumns()),
	data = JSON.stringify(definition);

	switch(this.mode){
		case "local":
		localStorage.setItem(this.id, data);
		break;

		case "cookie":
		let expireDate = new Date();
		expireDate.setDate(expireDate.getDate() + 10000);

		//save cookie
		document.cookie = this.id + "=" + data + "; expires=" + expireDate.toUTCString();
		break;

		default:
		console.warn("Persistance Save Error - invalid mode selected", this.mode);
	}
};

//build premission list
PersistentLayout.prototype.parseColumns = function(columns){
	var self = this,
	definitions = [];

	columns.forEach(function(column){
		var def = {};

		if(column.isGroup){
			def.title = column.getDefinition().title;
			def.columns = self.parseColumns(column.getColumns());
		}else{
			def.title = column.getDefinition().title;
			def.field = column.getField();
			def.width = column.getWidth();
			def.visible = column.visible;
		}

		definitions.push(def);
	});

	return definitions;
};

Tabulator.registerExtension("persistentLayout", PersistentLayout);