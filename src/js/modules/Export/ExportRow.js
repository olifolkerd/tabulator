export default class ExportRow{
	constructor(type, columns, component, indent){
		this.type = type;
		this.columns = columns;
		this.component = component || false;
		this.indent = indent || 0;
	}
}