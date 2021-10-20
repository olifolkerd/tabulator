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

	static deepClone(obj, clone, list = {}){
		if (!clone){
			clone = Object.assign(Array.isArray(obj) ? [] : {}, obj);
		}

		for(var i in obj) {
			let subject = obj[i];

			if(subject != null && typeof(subject)  === "object"){
				if (subject instanceof Date) {
					clone[i] = new Date(subject);
				} else {
					if(list[subject]){
						clone[i] = list[subject];
					}else{
						list[subject] = Object.assign(Array.isArray(obj) ? [] : {}, obj);
						clone[i] = this.deepClone(subject, list[subject], list);
					}

				}
			}
		}

		return clone;
	}
}