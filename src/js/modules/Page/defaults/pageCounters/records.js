export default function(pageSize, currentRow, currentPage, totalRows, totalPages){
    console.log("records", pageSize, currentRow, currentPage, totalRows, totalPages)
	return "Showing " + currentRow + "-" + Math.min((currentRow + pageSize - 1), totalRows) +  " of " + totalRows + " records";
};