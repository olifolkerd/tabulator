export default function(cell, formatterParams, onRendered){
	var value = cell.getValue(),
	urlPrefix = formatterParams.urlPrefix || "",
	download = formatterParams.download,
	label = value,
	el = document.createElement("a"),
	data;

	if(formatterParams.labelField){
		data = cell.getData();
		label = data[formatterParams.labelField];
	}

	if(formatterParams.label){
		switch(typeof formatterParams.label){
			case "string":
			label = formatterParams.label;
			break;

			case "function":
			label = formatterParams.label(cell);
			break;
		}
	}

	if(label){
		if(formatterParams.urlField){
			data = cell.getData();
			value = data[formatterParams.urlField];
		}

		if(formatterParams.url){
			switch(typeof formatterParams.url){
				case "string":
				value = formatterParams.url;
				break;

				case "function":
				value = formatterParams.url(cell);
				break;
			}
		}

		el.setAttribute("href", urlPrefix + value);

		if(formatterParams.target){
			el.setAttribute("target", formatterParams.target);
		}

		if(formatterParams.download){

			if(typeof download == "function"){
				download = download(cell);
			}else{
				download = download === true ? "" : download;
			}

			el.setAttribute("download", download);
		}

		el.innerHTML = this.emptyToSpace(this.sanitizeHTML(label));

		return el;
	}else{
		return "&nbsp;";
	}
};