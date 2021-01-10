export default function(cell, formatterParams, onRendered){
	var value = cell.getValue(),
	element = cell.getElement(),
	maxStars = formatterParams && formatterParams.stars ? formatterParams.stars : 5,
	stars = document.createElement("span"),
	star = document.createElementNS('http://www.w3.org/2000/svg', "svg"),
	starActive = '<polygon fill="#FFEA00" stroke="#C1AB60" stroke-width="37.6152" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="259.216,29.942 330.27,173.919 489.16,197.007 374.185,309.08 401.33,467.31 259.216,392.612 117.104,467.31 144.25,309.08 29.274,197.007 188.165,173.919 "/>',
	starInactive = '<polygon fill="#D2D2D2" stroke="#686868" stroke-width="37.6152" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="259.216,29.942 330.27,173.919 489.16,197.007 374.185,309.08 401.33,467.31 259.216,392.612 117.104,467.31 144.25,309.08 29.274,197.007 188.165,173.919 "/>';

	//style stars holder
	stars.style.verticalAlign = "middle";

	//style star
	star.setAttribute("width", "14");
	star.setAttribute("height", "14");
	star.setAttribute("viewBox", "0 0 512 512");
	star.setAttribute("xml:space", "preserve");
	star.style.padding = "0 1px";

	value = value && !isNaN(value) ? parseInt(value) : 0;

	value = Math.max(0, Math.min(value, maxStars));

	for(var i=1;i<= maxStars;i++){
		var nextStar = star.cloneNode(true);
		nextStar.innerHTML = i <= value ? starActive : starInactive;

		stars.appendChild(nextStar);
	}

	element.style.whiteSpace = "nowrap";
	element.style.overflow = "hidden";
	element.style.textOverflow = "ellipsis";

	element.setAttribute("aria-label", value);

	return stars;
};