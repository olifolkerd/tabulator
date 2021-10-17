export default function(url, config, params){
	var contentType;

	return new Promise((resolve, reject) => {
		//set url
		url = this.urlGenerator.call(this.table, url, config, params);

		//set body content if not GET request
		if(config.method.toUpperCase() != "GET"){
			contentType = typeof this.table.options.ajaxContentType === "object" ?  this.table.options.ajaxContentType : this.contentTypeFormatters[this.table.options.ajaxContentType];
			if(contentType){

				for(var key in contentType.headers){
					if(!config.headers){
						config.headers = {};
					}

					if(typeof config.headers[key] === "undefined"){
						config.headers[key] = contentType.headers[key];
					}
				}

				config.body = contentType.body.call(this, url, config, params);

			}else{
				console.warn("Ajax Error - Invalid ajaxContentType value:", this.table.options.ajaxContentType);
			}
		}

		if(url){
			//configure headers
			if(typeof config.headers === "undefined"){
				config.headers = {};
			}

			if(typeof config.headers.Accept === "undefined"){
				config.headers.Accept = "application/json";
			}

			if(typeof config.headers["X-Requested-With"] === "undefined"){
				config.headers["X-Requested-With"] = "XMLHttpRequest";
			}

			if(typeof config.mode === "undefined"){
				config.mode = "cors";
			}

			if(config.mode == "cors"){
				if(typeof config.headers["Origin"] === "undefined"){
					config.headers["Origin"] = window.location.origin;
				}
        
				if(typeof config.credentials === "undefined"){
					config.credentials = 'same-origin';
				}
			}else{
				if(typeof config.credentials === "undefined"){
					config.credentials = 'include';
				}
			}

			//send request
			fetch(url, config)
			.then((response)=>{
				if(response.ok) {
					response.json()
					.then((data)=>{
						resolve(data);
					}).catch((error)=>{
						reject(error);
						console.warn("Ajax Load Error - Invalid JSON returned", error);
					});
				}else{
					console.error("Ajax Load Error - Connection Error: " + response.status, response.statusText);
					reject(response);
				}
			})
			.catch((error)=>{
				console.error("Ajax Load Error - Connection Error: ", error);
				reject(error);
			});
		}else{
			console.warn("Ajax Load Error - No URL Set");
			resolve([]);
		}
	});
};