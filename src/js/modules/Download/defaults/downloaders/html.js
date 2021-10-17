export default function(list, options, setFileContents){
	if(this.modExists("export", true)){
		setFileContents(this.modules.export.genereateHTMLTable(list), "text/html");
	}
};