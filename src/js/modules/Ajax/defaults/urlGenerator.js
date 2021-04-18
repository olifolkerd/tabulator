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

function serializeParams(params){
	var output = generateParamsList(params),
	encoded = [];

	output.forEach(function(item){
		encoded.push(encodeURIComponent(item.key) + "=" + encodeURIComponent(item.value));
	});

	return encoded.join("&");
}

export default function(url, config, params){
	if(url){
		if(params && Object.keys(params).length){
			if(!config.method || config.method.toLowerCase() == "get"){
				config.method = "get";

				url += (url.includes("?") ? "&" : "?") + serializeParams(params);
			}
		}
	}

	return url;
};