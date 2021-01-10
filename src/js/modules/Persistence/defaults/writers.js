//write persistence information to storage
export default {
	local:function(id, type, data){
		localStorage.setItem(id + "-" + type, JSON.stringify(data));
	},
	cookie:function(id, type, data){
		var expireDate = new Date();

		expireDate.setDate(expireDate.getDate() + 10000);

		document.cookie = id + "-" + type + "=" + JSON.stringify(data) + "; expires=" + expireDate.toUTCString();
	}
};