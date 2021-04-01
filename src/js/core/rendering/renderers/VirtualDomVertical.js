import Renderer from '../Renderer.js';

export default class VirtualDomVertical extends Renderer{
	constructor(table, element, tableElement){
		super(table, element);

		this.scrollTop = 0;
		this.scrollLeft = 0;

		this.vDomRowHeight = 20; //approximation of row heights for padding

		this.vDomTop = 0; //hold position for first rendered row in the virtual DOM
		this.vDomBottom = 0; //hold possition for last rendered row in the virtual DOM

		this.vDomScrollPosTop = 0; //last scroll position of the vDom top;
		this.vDomScrollPosBottom = 0; //last scroll position of the vDom bottom;

		this.vDomTopPad = 0; //hold value of padding for top of virtual DOM
		this.vDomBottomPad = 0; //hold value of padding for bottom of virtual DOM

		this.vDomMaxRenderChain = 90; //the maximum number of dom elements that can be rendered in 1 go

		this.vDomWindowBuffer = 0; //window row buffer before removing elements, to smooth scrolling

		this.vDomWindowMinTotalRows = 20; //minimum number of rows to be generated in virtual dom (prevent buffering issues on tables with tall rows)
		this.vDomWindowMinMarginRows = 5; //minimum number of rows to be generated in virtual dom margin

		this.vDomTopNewRows = []; //rows to normalize after appending to optimize render speed
		this.vDomBottomNewRows = []; //rows to normalize after appending to optimize render speed
	}

	clear(){

		var element = this.element;

		// element.children.detach();
		while(element.firstChild) element.removeChild(element.firstChild);

		element.style.paddingTop = "";
		element.style.paddingBottom = "";
		element.style.minWidth = "";
		element.style.minHeight = "";
		element.style.display = "";
		element.style.visibility = "";

		this.element.scrollTop = 0;
		this.element.scrollLeft = 0;

		this.scrollTop = 0;
		this.scrollLeft = 0;

		this.vDomTop = 0;
		this.vDomBottom = 0;
		this.vDomTopPad = 0;
		this.vDomBottomPad = 0;
	}

	render(){

	}
}