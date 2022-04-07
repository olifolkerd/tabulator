import CoreFeature from '../CoreFeature.js';
import Helpers from './Helpers.js';

export default class Popup extends CoreFeature{
    constructor(table, element, containerEl, parent){
        super(table);

        this.element = element;
        this.containerEl = containerEl;

        this.parent = parent;

        this.reversedX = false;
        this.child = null;
        this.blurable = false;
        this.blurCallback = null;

        this.element.classList.add("tabulator-popup");

        this.blurEvent = this.hide.bind(this);
		this.escEvent = this._escapeCheck.bind(this);
    }

    show(origin, originY){
        var x, y, parentEl, parentOffset, touch;

        console.log("origin", origin)

        if(origin instanceof HTMLElement){
            parentEl = origin;
            parentOffset = Helpers.elOffset(parentEl);
			x = parentOffset.left + parentEl.offsetWidth;
			y = parentOffset.top - 1;
        }else if(typeof origin === "number"){
            x = origin;
            y = originY;
        }else{
            touch = !(origin instanceof MouseEvent);

            x = touch ? origin.touches[0].pageX : origin.pageX;
			y = touch ? origin.touches[0].pageY : origin.pageY;
			
			if(this.containerEl !== document.body){
				parentOffset = Helpers.elOffset(this.containerEl);
				
				x -= parentOffset.left;
				y -= parentOffset.top;
			}
			
			this.reversedX = false;
        }

        this.element.style.top = y + "px";
		this.element.style.left = x + "px";

        this.containerEl.appendChild(this.element);

        this._fitToScreen(x, y, parentEl, parentOffset);
		
        return this;
    }

    _fitToScreen(x, y, parentEl, parentOffset){
        //move menu to start on right edge if it is too close to the edge of the screen
		if((x + this.element.offsetWidth) >= this.containerEl.offsetWidth || this.reversedX){
			this.element.style.left = "";
			
			if(parentEl){
				this.element.style.right = (this.containerEl.offsetWidth - parentOffset.left) + "px";
			}else{
				this.element.style.right = (this.containerEl.offsetWidth - x) + "px";
			}
			
			this.reversedX = true;
		}
		
		//move menu to start on bottom edge if it is too close to the edge of the screen
		if((y + this.element.offsetHeight) > this.containerEl.offsetHeight) {
			if(this.parent){
				this.element.style.top = (parseInt(this.element.style.top) - this.element.offsetHeight + parentEl.offsetHeight + 1) + "px";
			}else{
				this.element.style.top = (parseInt(this.element.style.top) - this.element.offsetHeight) + "px";
			}
		}
    }

    hideOnBlur(callback){
        this.blurable = true;

        setTimeout(() => {
			this.table.rowManager.element.addEventListener("scroll", this.blurEvent);
			this.subscribe("cell-editing", this.blurEvent);
			document.body.addEventListener("click", this.blurEvent);
			document.body.addEventListener("contextmenu", this.blurEvent);
			window.addEventListener("resize", this.blurEvent);
			document.body.addEventListener("keydown", this.escEvent);
		}, 100);

        this.blurCallback = callback;

        return this;
    }

    _escapeCheck(e){
        if(e.keyCode == 27){
			this.hide();
		}
    }

    hide(){
        if(this.blurable){
            document.body.removeEventListener("keydown", this.escEvent);
            document.body.removeEventListener("click", this.blurEvent);
            document.body.removeEventListener("contextmenu", this.blurEvent);
            window.removeEventListener("resize", this.blurEvent);
            this.table.rowManager.element.removeEventListener("scroll", this.blurEvent);
            this.unsubscribe("cell-editing", this.blurEvent);
        }

        if(this.child){
            child.hide();
        }

        if(this.parent){
            this.parent.child = null;
        }

        if(this.element.parentNode){
            this.element.parentNode.removeChild(this.element);
        }

        if(this.blurCallback){
            this.blurCallback();
        }

        return this;
    }

    child(element){
        var child = new Popup(element, this.containerEl, this);

        this.children.push(child);

        return child;
    }
}