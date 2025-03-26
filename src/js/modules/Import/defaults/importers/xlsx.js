export default function(input){
	var XLSXLib = this.dependencyRegistry.lookup("XLSX"),
	workbook2 = XLSXLib.read(input),
	sheet = workbook2.Sheets[workbook2.SheetNames[0]];
	
	return XLSXLib.utils.sheet_to_json(sheet, {header: 1 });
}