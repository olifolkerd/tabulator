module.exports = {
	"json":{
		headers:{
			'Content-Type': 'application/json',
		},
		body:function(url, config, params){
			return JSON.stringify(params);
		},
	},
	"form":{
		headers:{
		},
		body:function(url, config, params){
			var output = this.generateParamsList(params),
			form = new FormData();

			output.forEach(function(item){
				form.append(item.key, item.value);
			});

			return form;
		},
	},
};