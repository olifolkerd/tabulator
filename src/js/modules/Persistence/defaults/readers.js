// read peristence information from storage
module.exports = {
	local:function(id, type){
		var data = localStorage.getItem(id + "-" + type);

		return data ? JSON.parse(data) : false;
	},
	cookie:function(id, type){
		var cookie = document.cookie,
		key = id + "-" + type,
		cookiePos = cookie.indexOf(key + "="),
		end, data;

		//if cookie exists, decode and load column data into tabulator
		if(cookiePos > -1){
			cookie = cookie.substr(cookiePos);

			end = cookie.indexOf(";");

			if(end > -1){
				cookie = cookie.substr(0, end);
			}

			data = cookie.replace(key + "=", "");
		}

		return data ? JSON.parse(data) : false;
	}
};