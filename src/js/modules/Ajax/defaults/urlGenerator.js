export default function(url, config, params){
	if(url){
		if(params && Object.keys(params).length){
			if(!config.method || config.method.toLowerCase() == "get"){
				config.method = "get";

				url += (url.includes("?") ? "&" : "?") + this.modules.ajax.serializeParams(params);
			}
		}
	}

	return url;
};