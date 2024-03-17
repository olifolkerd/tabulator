import Module from '../../core/Module.js';
import Cell from '../../core/cell/Cell.js';

export default class Tooltip extends Module{

	static moduleName = "tooltip";
	
	constructor(table){
		super(table);
		
		this.tooltipSubscriber = null,
		this.headerSubscriber = null,
		
		this.timeout = null;
		this.popupInstance = null;
		
		// this.registerTableOption("tooltipGenerationMode", undefined);  //deprecated
		this.registerTableOption("tooltipDelay", 300); 
		
		this.registerColumnOption("tooltip");
		this.registerColumnOption("headerTooltip");
	}
	
	initialize(){
		this.deprecatedOptionsCheck();
		
		this.subscribe("column-init", this.initializeColumn.bind(this));
	}
	
	deprecatedOptionsCheck(){
		// this.deprecationCheckMsg("tooltipGenerationMode", "This option is no longer needed as tooltips are always generated on hover now");
	}	
	
	initializeColumn(column){
		if(column.definition.headerTooltip && !this.headerSubscriber){
			this.headerSubscriber = true;
			
			this.subscribe("column-mousemove", this.mousemoveCheck.bind(this, "headerTooltip"));
			this.subscribe("column-mouseout", this.mouseoutCheck.bind(this, "headerTooltip"));
		}
		
		if(column.definition.tooltip && !this.tooltipSubscriber){
			this.tooltipSubscriber = true;
			
			this.subscribe("cell-mousemove", this.mousemoveCheck.bind(this, "tooltip"));
			this.subscribe("cell-mouseout", this.mouseoutCheck.bind(this, "tooltip"));
		}
	}
	
	mousemoveCheck(action, e, component){
		var tooltip = action === "tooltip" ? component.column.definition.tooltip : component.definition.headerTooltip;
		
		if(tooltip){
			this.clearPopup();
			this.timeout = setTimeout(this.loadTooltip.bind(this, e, component, tooltip), this.table.options.tooltipDelay);
		}
	}

	mouseoutCheck(action, e, component){
		if(!this.popupInstance){
			this.clearPopup();
		}
	}
	
	clearPopup(action, e, component){
		clearTimeout(this.timeout);
		this.timeout = null;
		
		if(this.popupInstance){
			this.popupInstance.hide();
		}
	}
	
	loadTooltip(e, component, tooltip){
		var contentsEl, renderedCallback, coords;

		function onRendered(callback){
			renderedCallback = callback;
		}
		
		if(typeof tooltip === "function"){
			tooltip = tooltip(e, component.getComponent(), onRendered);
		}
		
		if(tooltip instanceof HTMLElement){
			contentsEl = tooltip;
		}else{
			contentsEl = document.createElement("div");
			
			if(tooltip === true){
				if(component instanceof Cell){
					tooltip = component.value;
				}else{
					if(component.definition.field){
						this.langBind("columns|" + component.definition.field, (value) => {
							contentsEl.innerHTML = tooltip = value || component.definition.title;
						});
					}else{
						tooltip = component.definition.title;
					}
				}
			}
			
			contentsEl.innerHTML = tooltip;
		}
		
		if(tooltip || tooltip === 0 || tooltip === false){
			contentsEl.classList.add("tabulator-tooltip");

			contentsEl.addEventListener("mousemove", e => e.preventDefault());
			
			this.popupInstance = this.popup(contentsEl);
			
			if(typeof renderedCallback === "function"){
				this.popupInstance.renderCallback(renderedCallback);
			}

			coords = this.popupInstance.containerEventCoords(e);
			
			this.popupInstance.show(coords.x + 15, coords.y + 15).hideOnBlur(() => {
				this.dispatchExternal("TooltipClosed", component.getComponent());
				this.popupInstance = null;
			});
			
			this.dispatchExternal("TooltipOpened", component.getComponent());
		}
	}
}