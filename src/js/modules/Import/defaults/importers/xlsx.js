export default function(input){
	var workbook2 = XLSX.read(input);
	var sheet = workbook2.Sheets[workbook2.SheetNames[0]];
	
	return XLSX.utils.sheet_to_json(sheet, {header: 1 });
}