//sort alpha numeric strings
export default function(as, bs, aRow, bRow, column, dir, params){
	var a, b, a1, b1, i= 0, L, rx = /(\d+)|(\D+)/g, rd = /\d/;
	var alignEmptyValues = params.alignEmptyValues;
	var emptyAlign = 0;

	//handle empty values
	if(!as && as!== 0){
		emptyAlign =  !bs && bs!== 0 ? 0 : -1;
	}else if(!bs && bs!== 0){
		emptyAlign =  1;
	}else{

		if(isFinite(as) && isFinite(bs)) return as - bs;
		a = String(as).toLowerCase();
		b = String(bs).toLowerCase();
		if(a === b) return 0;
		if(!(rd.test(a) && rd.test(b))) return a > b ? 1 : -1;
		a = a.match(rx);
		b = b.match(rx);
		L = a.length > b.length ? b.length : a.length;
		while(i < L){
			a1= a[i];
			b1= b[i++];
			if(a1 !== b1){
				if(isFinite(a1) && isFinite(b1)){
					if(a1.charAt(0) === "0") a1 = "." + a1;
					if(b1.charAt(0) === "0") b1 = "." + b1;
					return a1 - b1;
				}
				else return a1 > b1 ? 1 : -1;
			}
		}

		return a.length > b.length;
	}

	//fix empty values in position
	if((alignEmptyValues === "top" && dir === "desc") || (alignEmptyValues === "bottom" && dir === "asc")){
		emptyAlign *= -1;
	}

	return emptyAlign;
}