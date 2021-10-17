class ExportColumn{
	constructor(value, component, width, height, depth){
		this.value = value;
		this.component = component || false;
		this.width = width;
		this.height = height;
		this.depth = depth;
	}
}

export default ExportColumn;