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

	static deepClone(obj, clone, list = []){
		var objectProto = {}.__proto__,
		arrayProto = [].__proto__;

		if (!clone){
			clone = Object.assign(Array.isArray(obj) ? [] : {}, obj);
		}

		for(var i in obj) {
			let subject = obj[i],
			match, copy;

			if(subject != null && typeof subject === "object" && (subject.__proto__ === objectProto || subject.__proto__ === arrayProto)){
				match = list.findIndex((item) => {
					return item.subject === subject;
				});

				if(match > -1){
					clone[i] = list[match].copy;
				}else{
					copy = Object.assign(Array.isArray(subject) ? [] : {}, subject);

					list.unshift({subject, copy});

					clone[i] = this.deepClone(subject, copy, list);
				}
			}
		}

		return clone;
	}
}