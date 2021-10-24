function generateParamsList(data, prefix){
	var output = [];

	prefix = prefix || "";

	if(Array.isArray(data)){
		data.forEach((item, i) => {
			output = output.concat(generateParamsList(item, prefix ? prefix + "[" + i + "]" : i));
		});
	}else if (typeof data === "object"){
		for (var key in data){
			output = output.concat(generateParamsList(data[key], prefix ? prefix + "[" + key + "]" : key));
		}
	}else{
		output.push({key:prefix, value:data});
	}

	return output;
}

export default {
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

			var output = generateParamsList(params),
			form = new FormData();

			output.forEach(function(item){
				form.append(item.key, item.value);
			});

			return form;
		},
	},
};