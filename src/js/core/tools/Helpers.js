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

	static retrieveNestedData(separator, field, data){
		var structure = separator ? field.split(separator) : [field],
		length = structure.length,
		output;

		for(let i = 0; i < length; i++){

			data = data[structure[i]];

			output = data;

			if(!data){
				break;
			}
		}

		return output;
	}

	static deepClone(obj,clone, circularRefs = new WeakMap()){
		var objectProto = {}.__proto__,
		arrayProto = [].__proto__;

		if (!clone){
			clone = Object.assign(Array.isArray(obj) ? [] : {}, obj);
		}

		for(var i in obj) {
			let subject = obj[i];
			if(subject != null && typeof subject === "object" && (subject.__proto__ === objectProto || subject.__proto__ === arrayProto)){
				const match = circularRefs.get(subject);
				if(match){
					clone[i] = match;
				}else{
					const copy = Object.assign(Array.isArray(subject) ? [] : {}, subject);
					clone[i] = this.deepClone(subject, copy, circularRefs);
				}
			}
		}

		return clone;
	}
}
