import CoreFeature from '../CoreFeature.js';
import Helpers from './Helpers.js';

export default class Popup extends CoreFeature{
	constructor(table, element, parent){
		super(table);
		
		this.element = element;
		this.container = this._lookupContainer();
		
		this.parent = parent;
		
		this.reversedX = false;
		this.childPopup = null;
		this.blurable = false;
		this.blurCallback = null;
		this.blurEventsBound = false;
		this.renderedCallback = null;
		
		this.visible = false;
		this.hideable = true;
		
		this.element.classList.add("tabulator-popup-container");
		
		this.blurEvent = this.hide.bind(this, false);
		this.escEvent = this._escapeCheck.bind(this);
		
		this.destroyBinding = this.tableDestroyed.bind(this);
		this.destroyed = false;
	}
	
	tableDestroyed(){
		this.destroyed = true;
		this.hide(true);
	}
	
	_lookupContainer(){
		var container = this.table.options.popupContainer;
		
		if(typeof container === "string"){
			container = document.querySelector(container);
			
			if(!container){
				console.warn("Menu Error - no container element found matching selector:",  this.table.options.popupContainer , "(defaulting to document body)");
			}
		}else if (container === true){
			container = this.table.element;
		}
		
		if(container && !this._checkContainerIsParent(container)){
			container = false;
			console.warn("Menu Error - container element does not contain this table:",  this.table.options.popupContainer , "(defaulting to document body)");
		}
		
		if(!container){
			container = document.body;
		}
		
		return container;
	}
	
	_checkContainerIsParent(container, element = this.table.element){
		if(container === element){
			return true;
		}else{
			return element.parentNode ? this._checkContainerIsParent(container, element.parentNode) : false;
		}
	}
	
	renderCallback(callback){
		this.renderedCallback = callback;
	}
	
	containerEventCoords(e){
		var touch = !(e instanceof MouseEvent);
		
		var x = touch ? e.touches[0].pageX : e.pageX;
		var y = touch ? e.touches[0].pageY : e.pageY;
		
		if(this.container !== document.body){
			let parentOffset = Helpers.elOffset(this.container);
			
			x -= parentOffset.left;
			y -= parentOffset.top;
		}
		
		return {x, y};
	}
	
	elementPositionCoords(element, position = "right"){
		var offset = Helpers.elOffset(element),
		containerOffset, x, y;
		
		if(this.container !== document.body){
			containerOffset = Helpers.elOffset(this.container);
			
			offset.left -= containerOffset.left;
			offset.top -= containerOffset.top;
		}
		
		switch(position){
			case "right":
				x = offset.left + element.offsetWidth;
				y = offset.top - 1;
				break;
			
			case "bottom":
				x = offset.left;
				y = offset.top + element.offsetHeight;
				break;
			
			case "left":
				x = offset.left;
				y = offset.top - 1;
				break;
			
			case "top":
				x = offset.left;
				y = offset.top;
				break;
			
			case "center":
				x = offset.left + (element.offsetWidth / 2);
				y = offset.top + (element.offsetHeight / 2);
				break;
			
		}
		
		return {x, y, offset};
	}
	
	show(origin, position){
		var x, y, parentEl, parentOffset, coords;
		
		if(this.destroyed || this.table.destroyed){
			return this;
		}
		
		if(origin instanceof HTMLElement){
			parentEl = origin;
			coords = this.elementPositionCoords(origin, position);
			
			parentOffset = coords.offset;
			x = coords.x;
			y = coords.y;
			
		}else if(typeof origin === "number"){
			parentOffset = {top:0, left:0};
			x = origin;
			y = position;
		}else{
			coords = this.containerEventCoords(origin);
			
			x = coords.x;
			y = coords.y;
			
			this.reversedX = false;
		}
		
		this.element.style.top = y + "px";
		this.element.style.left = x + "px";
		
		this.container.appendChild(this.element);
		
		if(typeof this.renderedCallback === "function"){
			this.renderedCallback();
		}
		
		this._fitToScreen(x, y, parentEl, parentOffset, position);
		
		this.visible = true;
		
		this.subscribe("table-destroy", this.destroyBinding);
		
		this.element.addEventListener("mousedown", (e) => {
			e.stopPropagation();
		});
		
		return this;
	}
	
	_fitToScreen(x, y, parentEl, parentOffset, position){
		var scrollTop = this.container === document.body ? document.documentElement.scrollTop : this.container.scrollTop;
		
		//move menu to start on right edge if it is too close to the edge of the screen
		if((x + this.element.offsetWidth) >= this.container.offsetWidth || this.reversedX){
			this.element.style.left = "";
			
			if(parentEl){
				this.element.style.right = (this.container.offsetWidth - parentOffset.left) + "px";
			}else{
				this.element.style.right = (this.container.offsetWidth - x) + "px";
			}
			
			this.reversedX = true;
		}
		
		//move menu to start on bottom edge if it is too close to the edge of the screen
		if((y + this.element.offsetHeight) > Math.max(this.container.offsetHeight, scrollTop ? this.container.scrollHeight : 0)) {
			if(parentEl){
				switch(position){
					case "bottom":
						this.element.style.top = (parseInt(this.element.style.top) - this.element.offsetHeight - parentEl.offsetHeight - 1) + "px";
						break;
					
					default:
						this.element.style.top = (parseInt(this.element.style.top) - this.element.offsetHeight + parentEl.offsetHeight + 1) + "px";
				}
				
			}else{
				this.element.style.top = (parseInt(this.element.style.top) - this.element.offsetHeight) + "px";
			}
		}
	}
	
	isVisible(){
		return this.visible;
	}
	
	hideOnBlur(callback){
		this.blurable = true;
		
		if(this.visible){
			setTimeout(() => {
				if(this.visible){
					this.table.rowManager.element.addEventListener("scroll", this.blurEvent);
					this.subscribe("cell-editing", this.blurEvent);
					document.body.addEventListener("click", this.blurEvent);
					document.body.addEventListener("contextmenu", this.blurEvent);
					document.body.addEventListener("mousedown", this.blurEvent);
					window.addEventListener("resize", this.blurEvent);
					document.body.addEventListener("keydown", this.escEvent);

					this.blurEventsBound = true;
				}
			}, 100);
			
			this.blurCallback = callback;
		}
		
		return this;
	}
	
	_escapeCheck(e){
		if(e.keyCode == 27){
			this.hide();
		}
	}
	
	blockHide(){
		this.hideable = false;
	}
	
	restoreHide(){
		this.hideable = true;
	}
	
	hide(silent = false){
		if(this.visible && this.hideable){
			if(this.blurable && this.blurEventsBound){
				document.body.removeEventListener("keydown", this.escEvent);
				document.body.removeEventListener("click", this.blurEvent);
				document.body.removeEventListener("contextmenu", this.blurEvent);
				document.body.removeEventListener("mousedown", this.blurEvent);
				window.removeEventListener("resize", this.blurEvent);
				this.table.rowManager.element.removeEventListener("scroll", this.blurEvent);
				this.unsubscribe("cell-editing", this.blurEvent);

				this.blurEventsBound = false;
			}
			
			if(this.childPopup){
				this.childPopup.hide();
			}
			
			if(this.parent){
				this.parent.childPopup = null;
			}
			
			if(this.element.parentNode){
				this.element.parentNode.removeChild(this.element);
			}
			
			this.visible = false;
			
			if(this.blurCallback && !silent){
				this.blurCallback();
			}
			
			this.unsubscribe("table-destroy", this.destroyBinding);
		}
		
		return this;
	}
	
	child(element){
		if(this.childPopup){
			this.childPopup.hide();
		}
		
		this.childPopup = new Popup(this.table, element, this);
		
		return this.childPopup;
	}
}