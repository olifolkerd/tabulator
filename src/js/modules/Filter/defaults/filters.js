export default {

	//equal to
	"=":function(filterVal, rowVal, rowData, filterParams){
		return rowVal == filterVal ? true : false;
	},

	//less than
	"<":function(filterVal, rowVal, rowData, filterParams){
		return rowVal < filterVal ? true : false;
	},

	//less than or equal to
	"<=":function(filterVal, rowVal, rowData, filterParams){
		return rowVal <= filterVal ? true : false;
	},

	//greater than
	">":function(filterVal, rowVal, rowData, filterParams){
		return rowVal > filterVal ? true : false;
	},

	//greater than or equal to
	">=":function(filterVal, rowVal, rowData, filterParams){
		return rowVal >= filterVal ? true : false;
	},

	//not equal to
	"!=":function(filterVal, rowVal, rowData, filterParams){
		return rowVal != filterVal ? true : false;
	},

	"regex":function(filterVal, rowVal, rowData, filterParams){

		if(typeof filterVal == "string"){
			filterVal = new RegExp(filterVal);
		}

		return filterVal.test(rowVal);
	},

	//contains the string
	"like":function(filterVal, rowVal, rowData, filterParams){
		if(filterVal === null || typeof filterVal === "undefined"){
			return rowVal === filterVal ? true : false;
		}else{
			if(typeof rowVal !== 'undefined' && rowVal !== null){
				return String(rowVal).toLowerCase().indexOf(filterVal.toLowerCase()) > -1;
			}
			else{
				return false;
			}
		}
	},

	//contains the keywords
	"keywords":function(filterVal, rowVal, rowData, filterParams){
		var keywords = filterVal.toLowerCase().split(typeof filterParams.separator === "undefined" ? " " : filterParams.separator),
		value = String(rowVal === null || typeof rowVal === "undefined" ? "" : rowVal).toLowerCase(),
		matches = [];

		keywords.forEach((keyword) =>{
			if(value.includes(keyword)){
				matches.push(true);
			}
		});

		return filterParams.matchAll ? matches.length === keywords.length : !!matches.length;
	},

	//starts with the string
	"starts":function(filterVal, rowVal, rowData, filterParams){
		if(filterVal === null || typeof filterVal === "undefined"){
			return rowVal === filterVal ? true : false;
		}else{
			if(typeof rowVal !== 'undefined' && rowVal !== null){
				return String(rowVal).toLowerCase().startsWith(filterVal.toLowerCase());
			}
			else{
				return false;
			}
		}
	},

	//ends with the string
	"ends":function(filterVal, rowVal, rowData, filterParams){
		if(filterVal === null || typeof filterVal === "undefined"){
			return rowVal === filterVal ? true : false;
		}else{
			if(typeof rowVal !== 'undefined' && rowVal !== null){
				return String(rowVal).toLowerCase().endsWith(filterVal.toLowerCase());
			}
			else{
				return false;
			}
		}
	},

	//in array
	"in":function(filterVal, rowVal, rowData, filterParams){
		if(Array.isArray(filterVal)){
			return filterVal.length ? filterVal.indexOf(rowVal) > -1 : true;
		}else{
			console.warn("Filter Error - filter value is not an array:", filterVal);
			return false;
		}
	},
};