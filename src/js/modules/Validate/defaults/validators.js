export default {
	//is integer
	integer: function(cell, value, parameters){
		if(value === "" || value === null || typeof value === "undefined"){
			return true;
		}

		value = Number(value);

		return !isNaN(value) && isFinite(value) && Math.floor(value) === value;
	},

	//is float
	float: function(cell, value, parameters){
		if(value === "" || value === null || typeof value === "undefined"){
			return true;
		}
		
		value = Number(value);

		return !isNaN(value) && isFinite(value) && value % 1 !== 0;
	},

	//must be a number
	numeric: function(cell, value, parameters){
		if(value === "" || value === null || typeof value === "undefined"){
			return true;
		}
		return !isNaN(value);
	},

	//must be a string
	string: function(cell, value, parameters){
		if(value === "" || value === null || typeof value === "undefined"){
			return true;
		}
		return isNaN(value);
	},

	//must be alphanumeric
	alphanumeric: function(cell, value, parameters){
		if(value === "" || value === null || typeof value === "undefined"){
			return true;
		}

		var reg = new RegExp(/^[a-z0-9]+$/i);

		return reg.test(value);
	},

	//maximum value
	max: function(cell, value, parameters){
		if(value === "" || value === null || typeof value === "undefined"){
			return true;
		}
		return parseFloat(value) <= parameters;
	},

	//minimum value
	min: function(cell, value, parameters){
		if(value === "" || value === null || typeof value === "undefined"){
			return true;
		}
		return parseFloat(value) >= parameters;
	},

	//starts with  value
	starts: function(cell, value, parameters){
		if(value === "" || value === null || typeof value === "undefined"){
			return true;
		}
		return String(value).toLowerCase().startsWith(String(parameters).toLowerCase());
	},

	//ends with  value
	ends: function(cell, value, parameters){
		if(value === "" || value === null || typeof value === "undefined"){
			return true;
		}
		return String(value).toLowerCase().endsWith(String(parameters).toLowerCase());
	},


	//minimum string length
	minLength: function(cell, value, parameters){
		if(value === "" || value === null || typeof value === "undefined"){
			return true;
		}
		return String(value).length >= parameters;
	},

	//maximum string length
	maxLength: function(cell, value, parameters){
		if(value === "" || value === null || typeof value === "undefined"){
			return true;
		}
		return String(value).length <= parameters;
	},

	//in provided value list
	in: function(cell, value, parameters){
		if(value === "" || value === null || typeof value === "undefined"){
			return true;
		}

		if(typeof parameters == "string"){
			parameters = parameters.split("|");
		}

		return parameters.indexOf(value) > -1;
	},

	//must match provided regex
	regex: function(cell, value, parameters){
		if(value === "" || value === null || typeof value === "undefined"){
			return true;
		}
		var reg = new RegExp(parameters);

		return reg.test(value);
	},

	//value must be unique in this column
	unique: function(cell, value, parameters){
		if(value === "" || value === null || typeof value === "undefined"){
			return true;
		}

		var equals = parameters === "ignorecase"
			? (x, y) => x.toLowerCase() == y.toLowerCase()
			: (x, y) => x == y;

		var cellData = cell.getData();
		var column = cell.getColumn()._getSelf();

		return !this.table.rowManager.rows.some(function(row){
			var data = row.getData();

			if(data !== cellData){
				return equals(value, column.getFieldValue(data));
			}
		});
	},

	//must have a value
	required:function(cell, value, parameters){
		return value !== "" && value !== null && typeof value !== "undefined";
	},
};