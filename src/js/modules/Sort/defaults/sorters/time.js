import datetime from './datetime.js';

//sort times
module.exports = function(a, b, aRow, bRow, column, dir, params){
	if(!params.format){
		params.format = "HH:mm";
	}

	return datetime.call(this, a, b, aRow, bRow, column, dir, params);
};