import CoreFeature from '../CoreFeature.js';

export default class Alert extends CoreFeature{
	constructor(table){
		super(table);
        
		this.element = this._createAlertElement();
		this.msgElement = this._createMsgElement();
		this.type = null;
        
		this.element.appendChild(this.msgElement);
	}
    
	_createAlertElement(){
		var el = document.createElement("div");
		el.classList.add("tabulator-alert");
		return el;
	}
    
	_createMsgElement(){
		var el = document.createElement("div");
		el.classList.add("tabulator-alert-msg");
		el.setAttribute("role", "alert");
		return el;
	}
    
	_typeClass(){
		return "tabulator-alert-state-" + this.type;
	}
    
	alert(content, type = "msg"){
		if(content){
			this.clear();
            
			this.type = type;
            
			while(this.msgElement.firstChild) this.msgElement.removeChild(this.msgElement.firstChild);
            
			this.msgElement.classList.add(this._typeClass());
            
			if(typeof content === "function"){
				content = content();
			}
            
			if(content instanceof HTMLElement){
				this.msgElement.appendChild(content);
			}else{
				this.msgElement.innerHTML = content;
			}
            
			this.table.element.appendChild(this.element);
		}
	}
    
	clear(){
		if(this.element.parentNode){
			this.element.parentNode.removeChild(this.element);
		}
        
		this.msgElement.classList.remove(this._typeClass());
	}
}