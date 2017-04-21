Tabulator.registerExtension("sort", {

	table:null, //hold Tbulator object

	sort:function(sortlist, dir){
		var self = this;

		// if(typeof sortlist == "string"){

		// }
	},

	//default data sorters
	sorters:{
		number:function(a, b){ //sort numbers
			return parseFloat(String(a).replace(",","")) - parseFloat(String(b).replace(",",""));
		},
		string:function(a, b){ //sort strings
			return String(a).toLowerCase().localeCompare(String(b).toLowerCase());
		},
		date:function(a, b){ //sort dates
			var self = this;

			return self._formatDate(a) - self._formatDate(b);
		},
		boolean:function(a, b){ //sort booleans
			var el1 = a === true || a === "true" || a === "True" || a === 1 ? 1 : 0;
			var el2 = b === true || b === "true" || b === "True" || b === 1 ? 1 : 0;

			return el1 - el2;
		},
		alphanum:function(as, bs){//sort alpha numeric strings
			var a, b, a1, b1, i= 0, L, rx = /(\d+)|(\D+)/g, rd = /\d/;

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
		},
		time:function(a, b){ //sort hh:mm formatted times
			a = a.split(":");
			b = b.split(":");

			a = (a[0]*60) + a[1];
			b = (b[0]*60) + b[1];
			return a > b;
		},
	},
});