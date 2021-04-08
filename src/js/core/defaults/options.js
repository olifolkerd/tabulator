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

	data:[], //default starting data

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

	persistence:false,
	persistenceID:"", //key for persistent storage
	persistenceMode:true, //mode for storing persistence information
	persistenceReaderFunc:false, //function for handling persistence data reading
	persistenceWriterFunc:false, //function for handling persistence data writing

	responsiveLayout:false, //responsive layout flags
	responsiveLayoutCollapseStartOpen:true, //start showing collapsed data
	responsiveLayoutCollapseUseFormatters:true, //responsive layout collapse formatter
	responsiveLayoutCollapseFormatter:false, //responsive layout collapse formatter

	pagination:false, //set pagination type
	paginationSize:false, //set number of rows to a page
	paginationInitialPage:1, //initail page to show on load
	paginationButtonCount: 5, // set count of page button
	paginationSizeSelector:false, //add pagination size selector element
	paginationElement:false, //element to hold pagination numbers
	paginationDataSent:{}, //pagination data sent to the server
	paginationDataReceived:{}, //pagination data received from the server
	paginationAddRow: "page", //add rows on table or page

	ajaxURL:false, //url for ajax loading
	ajaxURLGenerator:false,
	ajaxParams:{}, //params for ajax loading
	ajaxConfig:"get", //ajax request type
	ajaxContentType:"form", //ajax request type
	ajaxRequestFunc:false, //promise function
	ajaxLoader:true, //show loader
	ajaxLoaderLoading:false, //loader element
	ajaxLoaderError:false, //loader element
	ajaxFiltering:false,
	ajaxSorting:false,
	ajaxProgressiveLoad:false, //progressive loading
	ajaxProgressiveLoadDelay:0, //delay between requests
	ajaxProgressiveLoadScrollMargin:0, //margin before scroll begins

	groupBy:false, //enable table grouping and set field to group by
	groupStartOpen:true, //starting state of group
	groupValues:false,
	groupUpdateOnCellEdit:false,

	groupHeader:false, //header generation function
	groupHeaderPrint:null,
	groupHeaderClipboard:null,
	groupHeaderHtmlOutput:null,
	groupHeaderDownload:null,

	htmlOutputConfig:false, //html outypu config

	movableColumns:false, //enable movable columns

	movableRows:false, //enable movable rows
	movableRowsConnectedTables:false, //tables for movable rows to be connected to
	movableRowsConnectedElements:false, //other elements for movable rows to be connected to
	movableRowsSender:false,
	movableRowsReceiver:"insert",

	scrollToRowPosition:"top",
	scrollToRowIfVisible:true,

	scrollToColumnPosition:"left",
	scrollToColumnIfVisible:true,

	rowFormatter:false,
	rowFormatterPrint:null,
	rowFormatterClipboard:null,
	rowFormatterHtmlOutput:null,

	placeholder:false,

	rowContextMenu:false,
	rowClickMenu:false,

	//ajax callbacks
	ajaxRequesting:function(){},
	ajaxResponse:false,

	//grouping callbacks
	groupToggleElement:"arrow",
	groupClosedShowCalcs:false,
	groupContextMenu:false,
	groupClickMenu:false,
	groupTap:false,
	groupDblTap:false,
	groupTapHold:false,

	columnCalcs:true,

	//validation callbacks
	validationMode:"blocking",

	//////////////////////////////////////
	////////////// Events ////////////////
	//////////////////////////////////////

	//Table Setup
	tableBuilding:null,
	tableBuilt:null,

	//Render
	renderStarted:null,
	renderComplete:null,

	//Data
	dataLoading:null,
	dataLoaded:null,
	dataChanged:null,

	//Scroll
	scrollHorizontal:null,
	scrollVertical:null,

	//Row Manipulation
	rowAdded:null,
	rowDeleted:null,
	rowMoved:null,
	rowUpdated:null,
	rowSelectionChanged:null,
	rowSelected:null,
	rowDeselected:null,
	rowResized:null,

	//Cell Manipulation
	cellEditing:null,
	cellEdited:null,
	cellEditCancelled:null,

	//Column Manipulation
	columnMoved:null,
	columnResized:null,
	columnTitleChanged:null,
	columnVisibilityChanged:null,

	//HTML iport callbacks
	htmlImporting:null,
	htmlImported:null,

	//Ajax
	ajaxError:null,

	//Clipboard
	clipboardCopied:null, //data has been copied to the clipboard
	clipboardPasted:null, //data has been pasted into the table
	clipboardPasteError:null, //data has not successfully been pasted into the table

	//Download
	downloadComplete:null, //function to manipulate download data

	//Data Tree
	dataTreeRowExpanded:null, //row has been expanded
	dataTreeRowCollapsed:null, //row has been collapsed

	//Filtering
	dataFiltering:null,
	dataFiltered:null,

	//Sorting
	dataSorting:null,
	dataSorted:null,

	//Movable Rows
	movableRowsSendingStart:null,
	movableRowsSent:null,
	movableRowsSentFailed:null,
	movableRowsSendingStop:null,
	movableRowsReceivingStart:null,
	movableRowsReceived:null,
	movableRowsReceivedFailed:null,
	movableRowsReceivingStop:null,
	movableRowsElementDrop:null,

	//Grouped Rows
	dataGrouping:null,
	dataGrouped:null,
	groupVisibilityChanged:null,

	//Pagination
	pageLoaded:null,

	//Localization
	localized:null,

	//Validation
	validationFailed:null,

	//History
	historyUndo:null,
	historyRedo:null,

	//row callbacks
	rowClick:false,
	rowDblClick:false,
	rowContext:false,
	rowTap:false,
	rowDblTap:false,
	rowTapHold:false,
	rowMouseEnter:false,
	rowMouseLeave:false,
	rowMouseOver:false,
	rowMouseOut:false,
	rowMouseMove:false,

	//cell callbacks
	cellClick:false,
	cellDblClick:false,
	cellContext:false,
	cellTap:false,
	cellDblTap:false,
	cellTapHold:false,
	cellMouseEnter:false,
	cellMouseLeave:false,
	cellMouseOver:false,
	cellMouseOut:false,
	cellMouseMove:false,

	//column header callbacks
	headerClick:false,
	headerDblClick:false,
	headerContext:false,
	headerTap:false,
	headerDblTap:false,
	headerTapHold:false,
	headerMouseEnter:false,
	headerMouseLeave:false,
	headerMouseOver:false,
	headerMouseOut:false,
	headerMouseMove:false,

	//group header callbacks
	groupClick:false,
	groupDblClick:false,
	groupContext:false,
	groupTap:false,
	groupDblTap:false,
	groupTapHold:false,
	groupMouseEnter:false,
	groupMouseLeave:false,
	groupMouseOver:false,
	groupMouseOut:false,
	groupMouseMove:false,
}