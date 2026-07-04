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

	// Smart filter
	// Supports ., !, <, >, <=, >=, = and falls back to like filter
	"smart": function (filterVal, rowVal, rowData, filterParams) {
		const search = filterVal.trim();

		// searching . returns all non-empty cells
		if (search === ".") return !(rowVal === null || rowVal == "");
		// searching ! returns all empty cells
		if (search === "!") return rowVal === null || rowVal == "";
		
		// number comparisons - use existing filters
		if (search.indexOf("<=") === 0)
			return this["<="](
				parseFloat(search.substring(2)),
				rowVal,
				rowData,
				filterParams
			);
		if (search.indexOf(">=") === 0)
			return this[">="](
				parseFloat(search.substring(2)),
				rowVal,
				rowData,
				filterParams
			);
		if (search.indexOf("<") === 0)
			return this["<"](
				parseFloat(search.substring(1)),
				rowVal,
				rowData,
				filterParams
			);
		if (search.indexOf(">") === 0)
			return this[">"](
				parseFloat(search.substring(1)),
				rowVal,
				rowData,
				filterParams
			);
		if (search.indexOf("=") === 0)
			return this["="](search.substring(1).trim(), rowVal, rowData, filterParams);

		// we got a string like "ne ci"
		// convert this to "ne AND ci" to find "New York City"
		if (search.includes(" ")) {
			// Split by spaces and join with AND for fuzzy search
			const terms = search.split(/\s+/).filter((term) => term.length > 0);
			if (terms.length > 1) {
				const fuzzySearch = terms.join(" AND ");
				return this["smarter"](fuzzySearch, rowVal, rowData, filterParams);
			}
		}

		// otherwise we use the regular like filter
		return this["like"](search, rowVal, rowData, filterParams);
	},

	// Smarter filter
	// Just like the smart filter but you can combine multiple filters (AND/OR)
	// Examples:
	// - "john AND smith" - both terms must match
	// - "john OR jane" - either term must match
	// - ">100 AND <500" - value must be between 100 and 500
	// - "! OR foo" - either empty or foo
	"smarter": function (filterVal, rowVal, rowData, filterParams) {
		const search = filterVal.trim();

		// If no search value, show all rows
		if (!search) return true;

		// Split by AND/OR operators while preserving the operators
		const parts = search.split(/\s+(AND|OR)\s+/i);

		// If no operators found, use the original smart filter
		if (parts.length === 1) {
			return this["smart"](search, rowVal, rowData, filterParams);
		}

		// Process each part and operator
		let result = null;
		let currentOperator = null;

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i].trim();

			if (part === "AND" || part === "OR") {
				currentOperator = part;
				continue;
			}

			// Apply the smart filter to this part
			const partResult = this["smart"](part, rowVal, rowData, filterParams);

			// Combine results based on operator
			if (result === null) {
				result = partResult;
			} else if (currentOperator === "AND") {
				result = result && partResult;
			} else if (currentOperator === "OR") {
				result = result || partResult;
			}
		}

		return result !== null ? result : true;
	},

};
