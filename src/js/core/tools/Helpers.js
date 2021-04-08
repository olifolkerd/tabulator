export default class Helpers{

	static elVisible(el){
		return !(el.offsetWidth <= 0 && el.offsetHeight <= 0);
	}

	static elOffset(el){
		var box = el.getBoundingClientRect();

		return {
			top: box.top + window.pageYOffset - document.documentElement.clientTop,
			left: box.left + window.pageXOffset - document.documentElement.clientLeft
		};
	}

	static deepClone(obj){
		var clone = Object.assign(Array.isArray(obj) ? [] : {}, obj);

		for(var i in obj) {
			if(obj[i] != null && typeof(obj[i])  === "object"){
				if (obj[i] instanceof Date) {
					clone[i] = new Date(obj[i]);
				} else {
					clone[i] = this.deepClone(obj[i]);
				}
			}
		}
		return clone;
	}
}