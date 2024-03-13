export default class GridCalculator{
	constructor(columns, rows){
		this.columnCount = columns;
		this.rowCount = rows;

		this.columnString = [];
		this.columns = [];
		this.rows = [];
	}


	genColumns(){
		for(let i = 1; i <= this.columnCount; i++){
			this.incrementChar(this.columnString.length - 1);
			this.columns.push(this.columnString.join(""));
		}
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
}