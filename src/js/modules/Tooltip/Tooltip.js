import Module from '../../core/Module.js';

class Tooltip extends Module{
	
	constructor(table){
		super(table);
		
		this.columnSubscribers = {};
		
		this.registerTableOption("tooltipGenerationMode", null);  //deprecated
		
		
		this.registerColumnOption("tooltip");
		this.registerColumnOption("headerTooltip");
	}
	
	initialize(){
		this.deprecationCheck();
		
		this.subscribe("column-init", this.initializeColumn.bind(this));
		this.subscribe("cell-init", this.initializeCell.bind(this));
	}
	
	deprecationCheck(){
		if(typeof this.table.options.tooltipGenerationMode){
			console.warn("Use of the tooltipGenerationMode option is now deprecated. This option is no longer needed as tooltips are always generated on hover now");
		}
	}	
	
	initializeColumn(column){
		var tooltip = column.definition.headerTooltip;
		
		if(tooltip){
			if(tooltip === true){
				if(column.definition.field){
					this.langBind("columns|" + column.definition.field, (value) => {
						column.element.setAttribute("title", value || column.definition.title);
					});
				}else{
					column.element.setAttribute("title", column.definition.title);
				}
				
			}else{
				if(typeof(tooltip) == "function"){
					tooltip = tooltip(column.getComponent());
					
					if(tooltip === false){
						tooltip = "";
					}
				}
				
				column.element.setAttribute("title", tooltip);
			}
			
		}else{
			column.element.setAttribute("title", "");
		}
	}
	
	initializeCell(cell){
		var tooltip = cell.column.definition.tooltip;
		
		if(tooltip){
			if(tooltip === true){
				tooltip = cell.value;
			}else if(typeof(tooltip) == "function"){
				tooltip = tooltip(cell.getComponent());
				
				if(tooltip === false){
					tooltip = "";
				}
			}
			
			if(typeof tooltip === "undefined"){
				tooltip = "";
			}
			
			cell.element.setAttribute("title", tooltip);
		}else{
			cell.element.setAttribute("title", "");
		}
	}
	
	loadTooltip(e, component, contents, renderedCallback){
		var touch = !(e instanceof MouseEvent),
		contentsEl, Tooltip;
		
		if(contents instanceof HTMLElement){
			contentsEl = contents;
		}else{
			contentsEl = document.createElement("div");
			contentsEl.innerHTML = contents;
		}
		
		contentsEl.classList.add("tabulator-Tooltip-contents");
		
		contentsEl.addEventListener("click", (e) =>{
			e.stopPropagation();
		});
		
		if(!touch){
			e.preventDefault();
		}
		
		Tooltip = this.Tooltip(contentsEl);
		
		if(typeof renderedCallback === "function"){
			Tooltip.renderCallback(renderedCallback);
		}
		
		Tooltip.show(e).hideOnBlur(() => {
			this.dispatchExternal("TooltipClosed", component.getComponent());
		});
		
		
		
		this.dispatchExternal("TooltipOpened", component.getComponent())
	}
}

Tooltip.moduleName = "tooltip";

export default Tooltip;
