import Module from '../../core/Module.js';

class ResizeTable extends Module{

	constructor(table){
		super(table);

		this.binding = false;
		this.observer = false;
		this.containerObserver = false;

		this.tableHeight = 0;
		this.tableWidth = 0;
		this.containerHeight = 0;
		this.containerWidth = 0;

		this.autoResize = false;

		this.registerTableOption("autoResize", true); //auto resize table
	}

	initialize(){
		if(this.table.options.autoResize){
			var table = this.table,
			tableStyle;

			this.tableHeight = table.element.clientHeight;
			this.tableWidth = table.element.clientWidth;

			if(table.element.parentNode){
				this.containerHeight = table.element.parentNode.clientHeight;
				this.containerWidth = table.element.parentNode.clientWidth;
			}

			if(typeof ResizeObserver !== "undefined" && table.rowManager.getRenderMode() === "virtual"){

				this.autoResize = true;

				this.observer = new ResizeObserver((entry) => {
					if(!table.browserMobile || (table.browserMobile &&!table.modules.edit.currentCell)){

						var nodeHeight = Math.floor(entry[0].contentRect.height);
						var nodeWidth = Math.floor(entry[0].contentRect.width);

						if(this.tableHeight != nodeHeight || this.tableWidth != nodeWidth){
							this.tableHeight = nodeHeight;
							this.tableWidth = nodeWidth;

							if(table.element.parentNode){
								this.containerHeight = table.element.parentNode.clientHeight;
								this.containerWidth = table.element.parentNode.clientWidth;
							}

							this.table.columnManager.renderer.rerenderColumns(true);

							table.redraw();
						}

					}
				});

				this.observer.observe(table.element);

				tableStyle = window.getComputedStyle(table.element);

				if(this.table.element.parentNode && !this.table.rowManager.fixedHeight && (tableStyle.getPropertyValue("max-height") || tableStyle.getPropertyValue("min-height"))){

					this.containerObserver = new ResizeObserver((entry) => {
						if(!table.browserMobile || (table.browserMobile &&!table.modules.edit.currentCell)){

							var nodeHeight = Math.floor(entry[0].contentRect.height);
							var nodeWidth = Math.floor(entry[0].contentRect.width);

							if(this.containerHeight != nodeHeight || this.containerWidth != nodeWidth){
								this.containerHeight = nodeHeight;
								this.containerWidth = nodeWidth;
								this.tableHeight = table.element.clientHeight;
								this.tableWidth = table.element.clientWidth;
							}

							table.columnManager.renderer.rerenderColumns(true);

							table.redraw();
						}
					});

					this.containerObserver.observe(this.table.element.parentNode);
				}

				this.subscribe("table-resize", this.tableResized.bind(this));

			}else{
				this.binding = function(){
					if(!table.browserMobile || (table.browserMobile && !table.modules.edit.currentCell)){

						table.columnManager.renderer.rerenderColumns(true);

						table.redraw();
					}
				};

				window.addEventListener("resize", this.binding);
			}

			this.subscribe("table-destroy", this.clearBindings.bind(this));
		}
	}

	tableResized(){
		this.table.rowManager.redraw();
	}

	clearBindings(){
		if(this.binding){
			window.removeEventListener("resize", this.binding);
		}

		if(this.observer){
			this.observer.unobserve(this.table.element);
		}

		if(this.containerObserver){
			this.containerObserver.unobserve(this.table.element.parentNode);
		}
	}
}

ResizeTable.moduleName = "resizeTable";

export default ResizeTable;