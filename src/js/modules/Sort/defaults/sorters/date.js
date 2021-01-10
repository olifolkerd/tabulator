import datetime from './datetime.js';

//sort date
export default function(a, b, aRow, bRow, column, dir, params){
	if(!params.format){
		params.format = "DD/MM/YYYY";
	}

	return datetime.call(this, a, b, aRow, bRow, column, dir, params);
};