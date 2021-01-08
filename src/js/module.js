class Module{

	constructor(table, name){
		this.table = table;
		this.moduleName = name;
	}

	register(){
		return this.moduleName;
	}
}

module.exports = Module;