import Module from '../../core/Module.js';

export default class Print extends Module{

	static moduleName = "print";

	constructor(table){
		super(table);

		this.element = false;
		this.manualBlock = false;
		this.beforeprintEventHandler = null;
		this.afterprintEventHandler = null;

		this.registerTableOption("printAsHtml", false); //enable print as html
		this.registerTableOption("printFormatter", false); //printing page formatter
		this.registerTableOption("printHeader", false); //page header contents
		this.registerTableOption("printFooter", false); //page footer contents
		this.registerTableOption("printStyled", true); //enable print as html styling
		this.registerTableOption("printRowRange", "visible"); //restrict print to visible rows only
		this.registerTableOption("printConfig", {}); //print config options

		this.registerColumnOption("print");
		this.registerColumnOption("titlePrint");
	}

	initialize(){
		if(this.table.options.printAsHtml){
			this.beforeprintEventHandler = this.replaceTable.bind(this);
			this.afterprintEventHandler = this.cleanup.bind(this);

			window.addEventListener("beforeprint", this.beforeprintEventHandler );
			window.addEventListener("afterprint", this.afterprintEventHandler);
			this.subscribe("table-destroy", this.destroy.bind(this));
		}

		this.registerTableFunction("print", this.printFullscreen.bind(this));
	}

	destroy(){
		if(this.table.options.printAsHtml){
			window.removeEventListener( "beforeprint", this.beforeprintEventHandler );
			window.removeEventListener( "afterprint", this.afterprintEventHandler );
		}
	}

	///////////////////////////////////
	///////// Table Functions /////////
	///////////////////////////////////

	///////////////////////////////////
	///////// Internal Logic //////////
	///////////////////////////////////

	replaceTable(){
		if(!this.manualBlock){
			this.element = document.createElement("div");
			this.element.classList.add("tabulator-print-table");

			this.element.appendChild(this.table.modules.export.generateTable(this.table.options.printConfig, this.table.options.printStyled, this.table.options.printRowRange, "print"));

			this.table.element.style.display = "none";

			this.table.element.parentNode.insertBefore(this.element, this.table.element);
		}
	}

	cleanup(){
		document.body.classList.remove("tabulator-print-fullscreen-hide");

		if(this.element && this.element.parentNode){
			this.element.parentNode.removeChild(this.element);
			this.table.element.style.display = "";
		}
	}

	printFullscreen(visible, style, config){
		var scrollX = window.scrollX,
		scrollY = window.scrollY,
		headerEl = document.createElement("div"),
		footerEl = document.createElement("div"),
		tableEl = this.table.modules.export.generateTable(typeof config != "undefined" ? config : this.table.options.printConfig, typeof style != "undefined" ? style : this.table.options.printStyled, visible || this.table.options.printRowRange, "print"),
		headerContent, footerContent;

		this.manualBlock = true;

		this.element = document.createElement("div");
		this.element.classList.add("tabulator-print-fullscreen");

		if(this.table.options.printHeader){
			headerEl.classList.add("tabulator-print-header");

			headerContent = typeof this.table.options.printHeader == "function" ? this.table.options.printHeader.call(this.table) : this.table.options.printHeader;

			if(typeof headerContent == "string"){
				headerEl.innerHTML = headerContent;
			}else{
				headerEl.appendChild(headerContent);
			}

			this.element.appendChild(headerEl);
		}

		this.element.appendChild(tableEl);

		if(this.table.options.printFooter){
			footerEl.classList.add("tabulator-print-footer");

			footerContent = typeof this.table.options.printFooter == "function" ? this.table.options.printFooter.call(this.table) : this.table.options.printFooter;


			if(typeof footerContent == "string"){
				footerEl.innerHTML = footerContent;
			}else{
				footerEl.appendChild(footerContent);
			}

			this.element.appendChild(footerEl);
		}

		document.body.classList.add("tabulator-print-fullscreen-hide");
		document.body.appendChild(this.element);

		if(this.table.options.printFormatter){
			this.table.options.printFormatter(this.element, tableEl);
		}

		window.print();

		this.cleanup();

		window.scrollTo(scrollX, scrollY);

		this.manualBlock = false;
	}
}