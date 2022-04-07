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
        
        this.element.classList.add("tabulator-popup");
        
        this.blurEvent = this.hide.bind(this);
        this.escEvent = this._escapeCheck.bind(this);
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
    
    show(origin, originY){
        var x, y, parentEl, parentOffset, containerOffset, touch;

        if(origin instanceof HTMLElement){
            parentEl = origin;
            parentOffset = Helpers.elOffset(parentEl);
            
            if(this.container !== document.body){
                containerOffset = Helpers.elOffset(this.container);

                parentOffset.left -= containerOffset.left;
                parentOffset.top -= containerOffset.top;
            }
                   
            x = parentOffset.left + parentEl.offsetWidth;
            y = parentOffset.top - 1;
        }else if(typeof origin === "number"){
            parentOffset = {top:0, left:0};
            x = origin;
            y = originY;
        }else{
            touch = !(origin instanceof MouseEvent);
            
            x = touch ? origin.touches[0].pageX : origin.pageX;
            y = touch ? origin.touches[0].pageY : origin.pageY;
            
            if(this.container !== document.body){
                parentOffset = Helpers.elOffset(this.container);
                
                x -= parentOffset.left;
                y -= parentOffset.top;
            }
            
            this.reversedX = false;
        }
        
        this.element.style.top = y + "px";
        this.element.style.left = x + "px";
  
        this.container.appendChild(this.element);
    
        this._fitToScreen(x, y, parentEl, parentOffset);
        
        return this;
    }
    
    _fitToScreen(x, y, parentEl, parentOffset){
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
        if((y + this.element.offsetHeight) > this.container.offsetHeight) {
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
        
        if(this.childPopup){
            this.childPopup.hide();
        }
        
        if(this.parent){
            this.parent.childPopup = null;
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
        if(this.childPopup){
            this.childPopup.hide();
        }
        
        this.childPopup = new Popup(this.table, element, this);
        
        return this.childPopup;
    }
}