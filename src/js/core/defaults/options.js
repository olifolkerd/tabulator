export default {

	debugEvents:false, //flag to console log events
	debugEventsInternal:false, //flag to console log events
	debugInvalidOptions:true, //allow toggling of invalid option warnings

	height:false, //height of tabulator
	minHeight:false, //minimum height of tabulator
	maxHeight:false, //maximum height of tabulator

	columnMaxWidth:false, //minimum global width for a column
	columnHeaderVertAlign:"top", //vertical alignment of column headers

	columns:[],//store for colum header info
	columnDefaults:{}, //store column default props

	data:false, //default starting data

	autoColumns:false, //build columns from data row structure
	autoColumnsDefinitions:false,

	nestedFieldSeparator:".", //seperatpr for nested data

	tooltipGenerationMode:"load", //when to generate tooltips

	footerElement:false, //hold footer element

	index:"id", //filed for row index

	textDirection:"auto",

	addRowPos:"bottom", //position to insert blank rows, top|bottom

	headerVisible:true, //hide header

	virtualDom:true, //enable DOM virtualization
    virtualDomBuffer:0, // set virtual DOM buffer size
	virtualDomHoz:false, //enable horizontal DOM virtualization

	scrollToRowPosition:"top",
	scrollToRowIfVisible:true,

	scrollToColumnPosition:"left",
	scrollToColumnIfVisible:true,

	rowFormatter:false,
	rowFormatterPrint:null,
	rowFormatterClipboard:null,
	rowFormatterHtmlOutput:null,

	placeholder:false,

	dataLoader:true,
	dataLoaderLoading:false,
	dataLoaderError:false,

	dataSendParams:{},

	dataReceiveParams:{},
}