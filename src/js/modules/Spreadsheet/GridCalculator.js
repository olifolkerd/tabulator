export default class GridCalculator{
	constructor(columns, rows){
		this.columnCount = columns;
		this.rowCount = rows;

		this.columnString = [];
		this.columns = [];
		this.rows = [];
	}

	genColumns(data){
		var colCount = Math.max(this.columnCount, Math.max(...data.map(item => item.length)));

		this.columnString = [];
		this.columns = [];

		for(let i = 1; i <= colCount; i++){
			this.incrementChar(this.columnString.length - 1);
			this.columns.push(this.columnString.join(""));
		}

		return this.columns;
	}

	genRows(data){
		var rowCount = Math.max(this.rowCount, data.length);

		this.rows = [];

		for(let i = 1; i <= rowCount; i++){
			this.rows.push(i);
		}
		
		return this.rows;
	}

	incrementChar(i){
		let char = this.columnString[i];

		if(char){
			if(char !== "Z"){
				this.columnString[i] = String.fromCharCode(this.columnString[i].charCodeAt(0) + 1);
			}else{
				this.columnString[i] = "A";
				
				if(i){
					this.incrementChar(i-1);
				}else{
					this.columnString.push("A");
				}
			}
		}else{
			this.columnString.push("A");
		}
	}

	setRowCount(count){
		this.rowCount = count;
	}

	setColumnCount(count){
		this.columnCount = count;
	}
}