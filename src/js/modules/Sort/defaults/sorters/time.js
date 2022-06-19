import datetime from './datetime.js';

//sort times
export default function(a, b, aRow, bRow, column, dir, params){
	if(!params.format){
		params.format = "HH:mm";
	}

	return datetime.call(this, a, b, aRow, bRow, column, dir, params);
}