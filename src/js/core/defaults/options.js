export default {

	debugEvents:false, //flag to console log events
	debugEventsInternal:false, //flag to console log events
	invalidOptionWarnings:true, //allow toggling of invalid option warnings

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

	//////////////////////////////////////
	////////////// Events ////////////////
	//////////////////////////////////////

	//Table Setup
	// tableBuilding:null,
	// tableBuilt:null,

	//Render
	// renderStarted:null,
	// renderComplete:null,

	//Data
	dataLoading:null,
	dataLoaded:null,
	dataChanged:null,

	//Scroll
	// scrollHorizontal:null,
	// scrollVertical:null,

	//Row Manipulation
	// rowAdded:null,
	// rowDeleted:null,
	// rowMoved:null,
	// rowUpdated:null,
	// rowSelectionChanged:null,
	// rowSelected:null,
	// rowDeselected:null,
	// rowResized:null,

	//Cell Manipulation
	// cellEditing:null,
	// cellEdited:null,
	// cellEditCancelled:null,

	//Column Manipulation
	// columnMoved:null,
	// columnResized:null,
	// columnTitleChanged:null,
	// columnVisibilityChanged:null,

	//HTML iport callbacks
	// htmlImporting:null,
	// htmlImported:null,

	//Ajax
	ajaxError:null,

	//Clipboard
	// clipboardCopied:null, //data has been copied to the clipboard
	// clipboardPasted:null, //data has been pasted into the table
	// clipboardPasteError:null, //data has not successfully been pasted into the table

	//Download
	// downloadComplete:null, //function to manipulate download data

	//Data Tree
	// dataTreeRowExpanded:null, //row has been expanded
	// dataTreeRowCollapsed:null, //row has been collapsed

	//Filtering
	// dataFiltering:null,
	// dataFiltered:null,

	// //Sorting
	// dataSorting:null,
	// dataSorted:null,

	//Movable Rows
	// movableRowsSendingStart:null,
	// movableRowsSent:null,
	// movableRowsSentFailed:null,
	// movableRowsSendingStop:null,
	// movableRowsReceivingStart:null,
	// movableRowsReceived:null,
	// movableRowsReceivedFailed:null,
	// movableRowsReceivingStop:null,
	// movableRowsElementDrop:null,

	//Grouped Rows
	// dataGrouping:null,
	// dataGrouped:null,
	// groupVisibilityChanged:null,

	//Pagination
	// pageLoaded:null,

	//Localization
	// localized:null,

	//Validation
	// validationFailed:null,

	//History
	// historyUndo:null,
	// historyRedo:null,

	//row callbacks
	// rowClick:false,
	// rowDblClick:false,
	// rowContext:false,
	// rowTap:false,
	// rowDblTap:false,
	// rowTapHold:false,
	// rowMouseEnter:false,
	// rowMouseLeave:false,
	// rowMouseOver:false,
	// rowMouseOut:false,
	// rowMouseMove:false,

	//cell callbacks
	// cellClick:false,
	// cellDblClick:false,
	// cellContext:false,
	// cellTap:false,
	// cellDblTap:false,
	// cellTapHold:false,
	// cellMouseEnter:false,
	// cellMouseLeave:false,
	// cellMouseOver:false,
	// cellMouseOut:false,
	// cellMouseMove:false,

	//column header callbacks
	// headerClick:false,
	// headerDblClick:false,
	// headerContext:false,
	// headerTap:false,
	// headerDblTap:false,
	// headerTapHold:false,
	// headerMouseEnter:false,
	// headerMouseLeave:false,
	// headerMouseOver:false,
	// headerMouseOut:false,
	// headerMouseMove:false,

	//group header callbacks
	// groupClick:false,
	// groupDblClick:false,
	// groupContext:false,
	// groupTap:false,
	// groupDblTap:false,
	// groupTapHold:false,
	// groupMouseEnter:false,
	// groupMouseLeave:false,
	// groupMouseOver:false,
	// groupMouseOut:false,
	// groupMouseMove:false,

}