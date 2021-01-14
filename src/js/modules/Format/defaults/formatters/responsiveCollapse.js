export default function(cell, formatterParams, onRendered){
	var open = false,
	el = document.createElement("div"),
	config = cell.getRow()._row.modules.responsiveLayout;

	el.classList.add("tabulator-responsive-collapse-toggle");
	el.innerHTML = "<span class='tabulator-responsive-collapse-toggle-open'>+</span><span class='tabulator-responsive-collapse-toggle-close'>-</span>";

	cell.getElement().classList.add("tabulator-row-handle");

	function toggleList(isOpen){
		var collapseEl = config.element;

		config.open = isOpen;

		if(collapseEl){

			if(config.open){
				el.classList.add("open");
				collapseEl.style.display = '';
			}else{
				el.classList.remove("open");
				collapseEl.style.display = 'none';
			}
		}
	}

	el.addEventListener("click", function(e){
		e.stopImmediatePropagation();
		toggleList(!config.open);
	});

	toggleList(config.open);

	return el;
};