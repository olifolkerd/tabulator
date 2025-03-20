import TabulatorFull from "../../../src/js/core/TabulatorFull";
import Validate from "../../../src/js/modules/Validate/Validate";

describe("Validate module", () => {
    /** @type {TabulatorFull} */
    let tabulator;
    /** @type {Validate} */
    let validateMod;
    let tableData = [
        { id: 1, name: "John", age: 30, email: "john@example.com", status: "active" },
        { id: 2, name: "Jane", age: 25, email: "jane@example.com", status: "pending" },
        { id: 3, name: "Bob", age: 35, email: "bob@example.com", status: "inactive" }
    ];
    let tableColumns = [
        { title: "ID", field: "id", validator: "integer" },
        { title: "Name", field: "name", editor: "input", validator: "required" },
        { title: "Age", field: "age", editor: "number", validator: ["min:18", "max:100"] },
        { title: "Email", field: "email", editor: "input", validator: "regex:^\\S+@\\S+\\.\\S+$" },
        { title: "Status", field: "status", editor: "input", validator: "in:active|pending|inactive" }
    ];

    beforeEach(async () => {
        const el = document.createElement("div");
        el.id = "tabulator";
        document.body.appendChild(el);
        tabulator = new TabulatorFull("#tabulator", {
            data: tableData,
            columns: tableColumns
        });
        validateMod = tabulator.module("validate");
        return new Promise((resolve) => {
            tabulator.on("tableBuilt", () => {
                resolve();
            });
        });
    });

    afterEach(() => {
        // Clean up DOM without destroying tabulator to avoid dispatch errors
        if (document.getElementById("tabulator")) {
            document.getElementById("tabulator").remove();
        }
    });

    it("should initialize with no invalid cells", () => {
        const invalidCells = validateMod.getInvalidCells();
        expect(invalidCells.length).toBe(0);
    });

    it("should validate a cell with integer validator", () => {
        const idCell = tabulator.rowManager.rows[0].getCells()[0]; // ID cell
        
        // Valid test
        let result = validateMod.cellValidate(idCell);
        expect(result).toBe(true);
        
        // Invalid test - set to non-integer
        idCell.setValue("abc");
        result = validateMod.cellValidate(idCell);
        expect(Array.isArray(result)).toBe(true);
        expect(result[0].type).toBe("integer");
        
        // Check that the cell is marked as invalid
        expect(idCell.getElement().classList.contains("tabulator-validation-fail")).toBe(true);
        
        // Cell should be in invalid cells list
        const invalidCells = validateMod.getInvalidCells();
        expect(invalidCells.length).toBe(1);
    });

    it("should validate a cell with required validator", () => {
        const nameCell = tabulator.rowManager.rows[0].getCells()[1]; // Name cell
        
        // Valid test
        let result = validateMod.cellValidate(nameCell);
        expect(result).toBe(true);
        
        // Invalid test - set to empty
        nameCell.setValue("");
        result = validateMod.cellValidate(nameCell);
        expect(Array.isArray(result)).toBe(true);
        expect(result[0].type).toBe("required");
    });

    it("should validate a cell with multiple validators", () => {
        const ageCell = tabulator.rowManager.rows[0].getCells()[2]; // Age cell
        
        // Valid test
        let result = validateMod.cellValidate(ageCell);
        expect(result).toBe(true);
        
        // Invalid test - below minimum
        ageCell.setValue(15);
        result = validateMod.cellValidate(ageCell);
        expect(Array.isArray(result)).toBe(true);
        expect(result[0].type).toBe("min");
        
        // Invalid test - above maximum
        ageCell.setValue(150);
        result = validateMod.cellValidate(ageCell);
        expect(Array.isArray(result)).toBe(true);
        expect(result[0].type).toBe("max");
    });

    it("should validate a cell with regex validator", () => {
        const emailCell = tabulator.rowManager.rows[0].getCells()[3]; // Email cell
        
        // Valid test
        let result = validateMod.cellValidate(emailCell);
        expect(result).toBe(true);
        
        // Invalid test - not an email
        emailCell.setValue("not-an-email");
        result = validateMod.cellValidate(emailCell);
        expect(Array.isArray(result)).toBe(true);
        expect(result[0].type).toBe("regex");
    });

    it("should validate a cell with in validator", () => {
        const statusCell = tabulator.rowManager.rows[0].getCells()[4]; // Status cell
        
        // Valid test
        let result = validateMod.cellValidate(statusCell);
        expect(result).toBe(true);
        
        // Invalid test - not in list
        statusCell.setValue("unknown");
        result = validateMod.cellValidate(statusCell);
        expect(Array.isArray(result)).toBe(true);
        expect(result[0].type).toBe("in");
    });

    it("should validate an entire column", () => {
        // All cells are initially valid
        const nameColumn = tabulator.columnManager.findColumn("name");
        let result = validateMod.columnValidate(nameColumn);
        expect(result).toBe(true);
        
        // Make one cell invalid
        tabulator.rowManager.rows[1].getCells()[1].setValue(""); // Set Jane's name to empty
        result = validateMod.columnValidate(nameColumn);
        
        // Result should be an array with one invalid cell
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(1);
    });

    it("should have row validation method", () => {
        const row = tabulator.rowManager.rows[0];
        
        // Make sure row component has a validate function
        expect(typeof row.getComponent().validate).toBe('function');
        
        // Verify the rowValidate method exists
        expect(typeof validateMod.rowValidate).toBe('function');
    });

    it("should have table validation method", () => {
        // Verify table validation methods exist
        expect(typeof validateMod.userValidate).toBe('function');
    });
    
    it("should track invalid cells", () => {
        // Verify the invalidCells array exists
        expect(Array.isArray(validateMod.invalidCells)).toBe(true);
        expect(validateMod.invalidCells.length).toBe(0);
        
        // Verify getInvalidCells method exists
        expect(typeof validateMod.getInvalidCells).toBe('function');
        
        // In the real implementation, the invalidCells array contains cell components
        // that already have getComponent defined, but we're not testing that here
        
        // We just want to test that getInvalidCells returns the current invalid cells
        const emptyResult = validateMod.getInvalidCells();
        expect(Array.isArray(emptyResult)).toBe(true);
        expect(emptyResult.length).toBe(0);
    });

    it("should manually clear validation for a cell", () => {
        // Make a cell invalid
        const idCell = tabulator.rowManager.rows[0].getCells()[0]; // ID cell
        idCell.setValue("abc");
        validateMod.cellValidate(idCell);
        
        // Check cell is invalid
        expect(validateMod.getInvalidCells().length).toBe(1);
        
        // Clear validation
        validateMod.clearValidation(idCell);
        
        // Check cell is no longer marked as invalid
        expect(idCell.getElement().classList.contains("tabulator-validation-fail")).toBe(false);
        expect(validateMod.getInvalidCells().length).toBe(0);
    });

    it("should clear validation for all invalid cells", () => {
        // Make multiple cells invalid
        tabulator.rowManager.rows[0].getCells()[1].setValue(""); // Set John's name to empty
        tabulator.rowManager.rows[1].getCells()[2].setValue(15); // Set Jane's age below minimum
        
        // Validate cells manually
        validateMod.cellValidate(tabulator.rowManager.rows[0].getCells()[1]);
        validateMod.cellValidate(tabulator.rowManager.rows[1].getCells()[2]);
        
        // Check cells are invalid
        expect(validateMod.getInvalidCells().length).toBe(2);
        
        // Clear all validation
        validateMod.userClearCellValidation();
        
        // Check all cells are now valid
        expect(validateMod.getInvalidCells().length).toBe(0);
    });
});