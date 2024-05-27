export default {
	rownum:function(value, data, type, params, column, row){
		return row.getPosition();
	}
};