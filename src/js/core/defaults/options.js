export default {
	height:false, //height of tabulator
	minHeight:false, //minimum height of tabulator
	maxHeight:false, //maximum height of tabulator

	layout:"fitData", ///layout type "fitColumns" | "fitData"
	layoutColumnsOnNewData:false, //update column widths on setData

	columnMinWidth:40, //minimum global width for a column
	columnMaxWidth:false, //minimum global width for a column
	columnHeaderVertAlign:"top", //vertical alignment of column headers
	columnVertAlign:false, // DEPRECATED - Left to allow warning

	resizableColumns:true, //resizable columns
	resizableRows:false, //resizable rows
	autoResize:true, //auto resize table

	columns:[],//store for colum header info
	columnDefaults:false, //store column default props

	cellHozAlign:"", //horizontal align columns
	cellVertAlign:"", //vertical align columns
	headerHozAlign:"", //horizontal header alignment

	data:[], //default starting data

	autoColumns:false, //build columns from data row structure
	autoColumnsDefinitions:false,

	reactiveData:false, //enable data reactivity

	nestedFieldSeparator:".", //seperatpr for nested data

	tooltips: false, //Tool tip value
	tooltipsHeader: false, //Tool tip for headers
	tooltipGenerationMode:"load", //when to generate tooltips

	initialSort:false, //initial sorting criteria
	initialFilter:false, //initial filtering criteria
	initialHeaderFilter:false, //initial header filtering criteria

	columnHeaderSortMulti: true, //multiple or single column sorting

	sortOrderReverse:false, //reverse internal sort ordering

	headerSort:true, //set default global header sort
	headerSortTristate:false, //set default tristate header sorting
	headerSortElement:"<div class='tabulator-arrow'></div>", //header sort element

	footerElement:false, //hold footer element

	index:"id", //filed for row index

	textDirection:"auto",

	keybindings:[], //array for keybindings

	tabEndNewRow:false, //create new row when tab to end of table

	invalidOptionWarnings:true, //allow toggling of invalid option warnings

	clipboard:false, //enable clipboard
	clipboardCopyStyled:true, //formatted table data
	clipboardCopyConfig:false, //clipboard config
	clipboardCopyFormatter:false, //DEPRICATED - REMOVE in 5.0
	clipboardCopyRowRange:"active", //restrict clipboard to visible rows only
	clipboardPasteParser:"table", //convert pasted clipboard data to rows
	clipboardPasteAction:"insert", //how to insert pasted data into the table

	clipboardCopied:function(){}, //data has been copied to the clipboard
	clipboardPasted:function(){}, //data has been pasted into the table
	clipboardPasteError:function(){}, //data has not successfully been pasted into the table

	downloadDataFormatter:false, //function to manipulate table data before it is downloaded
	downloadReady:function(data, blob){return blob;}, //function to manipulate download data
	downloadComplete:false, //function to manipulate download data
	downloadConfig:{},	//download config
	downloadRowRange:"active", //restrict download to active rows only

	dataTree:false, //enable data tree
	dataTreeFilter:true, //filter child rows
	dataTreeSort:true, //sort child rows
	dataTreeElementColumn:false,
	dataTreeBranchElement: true, //show data tree branch element
	dataTreeChildIndent:9, //data tree child indent in px
	dataTreeChildField:"_children", //data tre column field to look for child rows
	dataTreeCollapseElement:false, //data tree row collapse element
	dataTreeExpandElement:false, //data tree row expand element
	dataTreeStartExpanded:false,
	dataTreeRowExpanded:function(){}, //row has been expanded
	dataTreeRowCollapsed:function(){}, //row has been collapsed
	dataTreeChildColumnCalcs:false, //include visible data tree rows in column calculations
	dataTreeSelectPropagate:false, //seleccting a parent row selects its children

	printAsHtml:false, //enable print as html
	printFormatter:false, //printing page formatter
	printHeader:false, //page header contents
	printFooter:false, //page footer contents
	printCopyStyle:true, //DEPRICATED - REMOVE in 5.0
	printStyled:true, //enable print as html styling
	printVisibleRows:true,  //DEPRICATED - REMOVE in 5.0
	printRowRange:"visible", //restrict print to visible rows only
	printConfig:{}, //print config options

	addRowPos:"bottom", //position to insert blank rows, top|bottom

	selectable:"highlight", //highlight rows on hover
	selectableRangeMode: "drag", //highlight rows on hover
	selectableRollingSelection:true, //roll selection once maximum number of selectable rows is reached
	selectablePersistence:true, // maintain selection when table view is updated
	selectableCheck:function(data, row){return true;}, //check wheather row is selectable

	headerFilterLiveFilterDelay: 300, //delay before updating column after user types in header filter
	headerFilterPlaceholder: false, //placeholder text to display in header filters

	headerVisible:true, //hide header

	history:false, //enable edit history

	locale:false, //current system language
	langs:{},

	virtualDom:true, //enable DOM virtualization
    virtualDomBuffer:0, // set virtual DOM buffer size
	virtualDomHoz:false, //enable horizontal DOM virtualization

    persistentLayout:false, //DEPRICATED - REMOVE in 5.0
    persistentSort:false, //DEPRICATED - REMOVE in 5.0
    persistentFilter:false, //DEPRICATED - REMOVE in 5.0
	persistenceID:"", //key for persistent storage
	persistenceMode:true, //mode for storing persistence information
	persistenceReaderFunc:false, //function for handling persistence data reading
	persistenceWriterFunc:false, //function for handling persistence data writing

	persistence:false,

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
	movableRowsSendingStart:function(){},
	movableRowsSent:function(){},
	movableRowsSentFailed:function(){},
	movableRowsSendingStop:function(){},
	movableRowsReceivingStart:function(){},
	movableRowsReceived:function(){},
	movableRowsReceivedFailed:function(){},
	movableRowsReceivingStop:function(){},
	movableRowsElementDrop:function(){},

	scrollToRowPosition:"top",
	scrollToRowIfVisible:true,

	scrollToColumnPosition:"left",
	scrollToColumnIfVisible:true,

	rowFormatter:false,
	rowFormatterPrint:null,
	rowFormatterClipboard:null,
	rowFormatterHtmlOutput:null,

	placeholder:false,

	//table building callbacks
	tableBuilding:function(){},
	tableBuilt:function(){},

	//render callbacks
	renderStarted:function(){},
	renderComplete:function(){},

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
	rowContextMenu:false,
	rowClickMenu:false,
	rowAdded:function(){},
	rowDeleted:function(){},
	rowMoved:function(){},
	rowUpdated:function(){},
	rowSelectionChanged:function(){},
	rowSelected:function(){},
	rowDeselected:function(){},
	rowResized:function(){},

	//cell callbacks
	//row callbacks
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
	cellEditing:function(){},
	cellEdited:function(){},
	cellEditCancelled:function(){},

	//column callbacks
	columnMoved:false,
	columnResized:function(){},
	columnTitleChanged:function(){},
	columnVisibilityChanged:function(){},

	//HTML iport callbacks
	htmlImporting:function(){},
	htmlImported:function(){},

	//data callbacks
	dataLoading:function(){},
	dataLoaded:function(){},
	dataEdited:false, //DEPRECATED
	dataChanged:false,

	//ajax callbacks
	ajaxRequesting:function(){},
	ajaxResponse:false,
	ajaxError:function(){},

	//filtering callbacks
	dataFiltering:false,
	dataFiltered:false,

	//sorting callbacks
	dataSorting:function(){},
	dataSorted:function(){},

	//grouping callbacks
	groupToggleElement:"arrow",
	groupClosedShowCalcs:false,
	dataGrouping:function(){},
	dataGrouped:false,
	groupVisibilityChanged:function(){},
	groupClick:false,
	groupDblClick:false,
	groupContext:false,
	groupContextMenu:false,
	groupClickMenu:false,
	groupTap:false,
	groupDblTap:false,
	groupTapHold:false,

	columnCalcs:true,

	//pagination callbacks
	pageLoaded:function(){},

	//localization callbacks
	localized:function(){},

	//validation callbacks
	validationMode:"blocking",
	validationFailed:function(){},

	//history callbacks
	historyUndo:function(){},
	historyRedo:function(){},

	//scroll callbacks
	scrollHorizontal:function(){},
	scrollVertical:function(){},
};