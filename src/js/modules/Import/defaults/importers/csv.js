function csvImporter(input){
    var data = [],
    row = 0, 
    col = 0,
    inQuote = false;
    
    //Iterate over each character
    for (let index = 0; index < input.length; index++) {
        let char = input[index], 
        nextChar = input[index+1];      
        
        //Initialize empty row
        if(!data[row]){
            data[row] = [];
        }

        //Initialize empty column
        if(!data[row][col]){
            data[row][col] = "";
        }
        
        //Handle quotation mark inside string
        if (char == '"' && inQuote && nextChar == '"') { 
            data[row][col] += char; 
            index++;
            continue; 
        }
        
        //Begin / End Quote
        if (char == '"') { 
            inQuote = !inQuote;
            continue;
        }
        
        //Next column (if not in quote)
        if (char == ',' && !inQuote) { 
            col++;
            continue; 
        }
        
        //New row if new line and not in quote (CRLF) 
        if (char == '\r' && nextChar == '\n' && !inQuote) { 
            col = 0; 
            row++; 
            index++; 
            continue; 
        }
        
        //New row if new line and not in quote (CR or LF) 
        if ((char == '\r' || char == '\n') && !inQuote) { 
            col = 0;
            row++;
            continue; 
        }

        //Normal Character, append to column
        data[row][col] += char;
    }

    return data;
}

export default csvImporter;