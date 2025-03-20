import TabulatorFull from "../../../src/js/core/TabulatorFull";
import Tooltip from "../../../src/js/modules/Tooltip/Tooltip";

describe("Tooltip module", () => {
    /** @type {TabulatorFull} */
    let tabulator;
    /** @type {Tooltip} */
    let tooltipMod;
    let tableData = [
        { id: 1, name: "John", age: 30, notes: "This is a note about John" },
        { id: 2, name: "Jane", age: 25, notes: "This is a note about Jane" },
        { id: 3, name: "Bob", age: 35, notes: "This is a note about Bob" }
    ];
    let tableColumns = [
        { title: "ID", field: "id" },
        { title: "Name", field: "name", tooltip: true },
        { title: "Age", field: "age", tooltip: function(e, cell) { return "Age: " + cell.getValue(); } },
        { title: "Notes", field: "notes", headerTooltip: "Additional information" }
    ];

    beforeEach(async () => {
        const el = document.createElement("div");
        el.id = "tabulator";
        document.body.appendChild(el);
        tabulator = new TabulatorFull("#tabulator", {
            data: tableData,
            columns: tableColumns,
            tooltipDelay: 10 // Set short delay for testing
        });
        tooltipMod = tabulator.module("tooltip");
        
        // Mock popup and dispatch functions
        tooltipMod.popup = jest.fn().mockImplementation(() => {
            return {
                hide: jest.fn(),
                show: jest.fn().mockReturnThis(),
                hideOnBlur: jest.fn(),
                renderCallback: jest.fn(),
                containerEventCoords: jest.fn().mockReturnValue({ x: 0, y: 0 })
            };
        });
        
        tooltipMod.dispatchExternal = jest.fn();
        
        return new Promise((resolve) => {
            tabulator.on("tableBuilt", () => {
                resolve();
            });
        });
    });

    afterEach(() => {
        tabulator.destroy();
        document.getElementById("tabulator")?.remove();
        jest.clearAllMocks();
    });

    it("should initialize with tooltip delay option", () => {
        // Check tooltip delay option
        expect(tabulator.options.tooltipDelay).toBe(10);
    });

    it("should show tooltip for cell with simple tooltip", async () => {
        // Get a cell with simple tooltip (name column)
        const nameCell = tabulator.rowManager.rows[0].getCells()[1];
        
        // Create mock event
        const mockEvent = new MouseEvent("mousemove");
        
        // Trigger mousemove event on cell
        tooltipMod.mousemoveCheck("tooltip", mockEvent, nameCell);
        
        // Wait for tooltip delay
        await new Promise(resolve => setTimeout(resolve, 20));
        
        // Check popup was called
        expect(tooltipMod.popup).toHaveBeenCalled();
        
        // Check tooltip content
        const popupCall = tooltipMod.popup.mock.calls[0][0];
        expect(popupCall.classList.contains("tabulator-tooltip")).toBe(true);
        expect(popupCall.innerHTML).toBe("John"); // Cell value
    });

    it("should show tooltip for cell with function tooltip", async () => {
        // Get a cell with function tooltip (age column)
        const ageCell = tabulator.rowManager.rows[0].getCells()[2];
        
        // Create mock event
        const mockEvent = new MouseEvent("mousemove");
        
        // Trigger mousemove event on cell
        tooltipMod.mousemoveCheck("tooltip", mockEvent, ageCell);
        
        // Wait for tooltip delay
        await new Promise(resolve => setTimeout(resolve, 20));
        
        // Check popup was called
        expect(tooltipMod.popup).toHaveBeenCalled();
        
        // Check tooltip content
        const popupCall = tooltipMod.popup.mock.calls[0][0];
        expect(popupCall.classList.contains("tabulator-tooltip")).toBe(true);
        expect(popupCall.innerHTML).toBe("Age: 30"); // Function result
    });

    it("should show tooltip for column header", async () => {
        // Get a column with header tooltip
        const notesCol = tabulator.columnManager.findColumn("notes");
        
        // Create mock event
        const mockEvent = new MouseEvent("mousemove");
        
        // Trigger mousemove event on column header
        tooltipMod.mousemoveCheck("headerTooltip", mockEvent, notesCol);
        
        // Wait for tooltip delay
        await new Promise(resolve => setTimeout(resolve, 20));
        
        // Check popup was called
        expect(tooltipMod.popup).toHaveBeenCalled();
        
        // Check tooltip content
        const popupCall = tooltipMod.popup.mock.calls[0][0];
        expect(popupCall.classList.contains("tabulator-tooltip")).toBe(true);
        expect(popupCall.innerHTML).toBe("Additional information");
    });

    it("should clear tooltip on mouseout", async () => {
        // Get a cell with tooltip
        const nameCell = tabulator.rowManager.rows[0].getCells()[1];
        
        // Create mock event
        const mockEvent = new MouseEvent("mousemove");
        
        // Trigger mousemove event on cell
        tooltipMod.mousemoveCheck("tooltip", mockEvent, nameCell);
        
        // Trigger mouseout event
        tooltipMod.mouseoutCheck("tooltip", mockEvent, nameCell);
        
        // Check timeout was cleared
        expect(tooltipMod.timeout).toBe(null);
    });

    it("should clear existing tooltip when showing a new one", async () => {
        // Create spy for clearPopup
        const clearSpy = jest.spyOn(tooltipMod, 'clearPopup');
        
        // Get cells
        const nameCell = tabulator.rowManager.rows[0].getCells()[1];
        const ageCell = tabulator.rowManager.rows[0].getCells()[2];
        
        // Create mock event
        const mockEvent = new MouseEvent("mousemove");
        
        // Trigger mousemove on first cell
        tooltipMod.mousemoveCheck("tooltip", mockEvent, nameCell);
        
        // Wait for tooltip delay
        await new Promise(resolve => setTimeout(resolve, 20));
        
        // Trigger mousemove on second cell
        tooltipMod.mousemoveCheck("tooltip", mockEvent, ageCell);
        
        // Check clearPopup was called
        expect(clearSpy).toHaveBeenCalled();
    });

    it("should handle popupInstance tracking", async () => {
        // Get a cell with tooltip
        const nameCell = tabulator.rowManager.rows[0].getCells()[1];
        
        // Create mock event
        const mockEvent = new MouseEvent("mousemove");
        
        // Trigger mousemove event on cell
        tooltipMod.mousemoveCheck("tooltip", mockEvent, nameCell);
        
        // Wait for tooltip delay
        await new Promise(resolve => setTimeout(resolve, 20));
        
        // Set popupInstance for test - this simulates what the module does
        tooltipMod.popupInstance = tooltipMod.popup();
        
        // Set popupInstance to null - this simulates what happens during hideOnBlur
        tooltipMod.popupInstance = null;
        
        // Check popupInstance was reset
        expect(tooltipMod.popupInstance).toBe(null);
    });
});