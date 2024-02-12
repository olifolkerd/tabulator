import CoreFeature from '../CoreFeature.js';

export default class DeprecationAdvisor extends CoreFeature{
	
	constructor(table){
		super(table);
	}
	
	_warnUser(){
		if(this.options("debugDeprecation")){
			console.warn(...arguments);
		}
	}
	
	check(oldOption, newOption, convert){
		var msg = "";
		
		if(typeof this.options(oldOption) !== "undefined"){
			msg = "Deprecated Setup Option - Use of the %c" + oldOption + "%c option is now deprecated";
			
			if(newOption){
				msg = msg + ", Please use the %c" + newOption + "%c option instead";
				this._warnUser(msg, 'font-weight: bold;', 'font-weight: normal;', 'font-weight: bold;', 'font-weight: normal;');

				if(convert){
					this.table.options[newOption] = this.table.options[oldOption];
				}
			}else{
				this._warnUser(msg, 'font-weight: bold;', 'font-weight: normal;');
			}
			
			return false;
		}else{
			return true;
		}
	}
	
	checkMsg(oldOption, msg){
		if(typeof this.options(oldOption) !== "undefined"){
			this._warnUser("%cDeprecated Setup Option - Use of the %c" + oldOption + " %c option is now deprecated, " + msg, 'font-weight: normal;', 'font-weight: bold;', 'font-weight: normal;');
			
			return false;
		}else{
			return true;
		}
	}
	
	msg(msg){
		this._warnUser(msg);
	}
}