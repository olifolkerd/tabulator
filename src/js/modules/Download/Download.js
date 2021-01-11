import Module from '../../core/Module.js';

import defaultDownloaders from './defaults/downloaders.js';

class Download extends Module{

	constructor(table){
		super(table);
	}

	//trigger file download
	download(type, filename, options, range, interceptCallback){
		var self = this,
		downloadFunc = false;

		function buildLink(data, mime){
			if(interceptCallback){
				if(interceptCallback === true){
					self.triggerDownload(data, mime, type, filename, true);
				}else{
					interceptCallback(data);
				}

			}else{
				self.triggerDownload(data, mime, type, filename);
			}
		}

		if(typeof type == "function"){
			downloadFunc = type;
		}else{
			if(Download.downloaders[type]){
				downloadFunc = Download.downloaders[type];
			}else{
				console.warn("Download Error - No such download type found: ", type);
			}
		}

		if(downloadFunc){
			var list = this.generateExportList(range);

			downloadFunc.call(this.table, list , options || {}, buildLink);
		}
	}

	generateExportList(range){
		var list = this.table.modules.export.generateExportList(this.table.options.downloadConfig, false, range || this.table.options.downloadRowRange, "download");

		//assign group header formatter
		var groupHeader = this.table.options.groupHeaderDownload;

		if(groupHeader && !Array.isArray(groupHeader)){
			groupHeader = [groupHeader];
		}

		list.forEach((row) => {
			var group;

			if(row.type === "group"){
				group = row.columns[0];

				if(groupHeader && groupHeader[row.indent]){
					group.value = groupHeader[row.indent](group.value, row.component._group.getRowCount(), row.component._group.getData(), row.component);
				}
			}
		});

		return list;
	}

	triggerDownload(data, mime, type, filename, newTab){
		var element = document.createElement('a'),
		blob = new Blob([data],{type:mime}),
		filename = filename || "Tabulator." + (typeof type === "function" ? "txt" : type);

		blob = this.table.options.downloadReady.call(this.table, data, blob);

		if(blob){

			if(newTab){
				window.open(window.URL.createObjectURL(blob));
			}else{
				if(navigator.msSaveOrOpenBlob){
					navigator.msSaveOrOpenBlob(blob, filename);
				}else{
					element.setAttribute('href', window.URL.createObjectURL(blob));

					//set file title
					element.setAttribute('download', filename);

					//trigger download
					element.style.display = 'none';
					document.body.appendChild(element);
					element.click();

					//remove temporary link element
					document.body.removeChild(element);
				}
			}


			if(this.table.options.downloadComplete){
				this.table.options.downloadComplete();
			}
		}
	}

	commsReceived(table, action, data){
		switch(action){
			case "intercept":
			this.download(data.type, "", data.options, data.active, data.intercept);
			break;
		}
	}
}

Download.moduleName = "download";

//load defaults
Download.downloaders = defaultDownloaders;

export default Download;