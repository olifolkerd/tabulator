
//polyfill for Array.find method
if (!Array.prototype.find) {
	Array.prototype.find = function (predicate, thisValue) {
		var arr = Object(this);
		if (typeof predicate !== 'function') {
			throw new TypeError();
		}
		for(var i=0; i < arr.length; i++) {
			if (i in arr) {
				var elem = arr[i];
				if (predicate.call(thisValue, elem, i, arr)) {
					return elem;
				}
			}
		}
		return undefined;
	}
}
