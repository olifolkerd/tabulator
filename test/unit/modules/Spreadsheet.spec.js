import TabulatorFull from "../../../src/js/core/TabulatorFull";
import Spreadsheet from "../../../src/js/modules/Spreadsheet/Spreadsheet";
import SheetComponent from "../../../src/js/modules/Spreadsheet/SheetComponent";

describe("Spreadsheet module", () => {
    /** @type {TabulatorFull} */
    let tabulator;
    /** @type {Spreadsheet} */
    let spreadsheetMod;

    beforeEach(async () => {
        const el = document.createElement("div");
        el.id = "tabulator";
        document.body.appendChild(el);
    });

    afterEach(() => {
        if (tabulator) {
            tabulator.destroy();
        }
        document.getElementById("tabulator")?.remove();
    });

    describe("basic functionality", () => {
        beforeEach(async () => {
            tabulator = new TabulatorFull("#tabulator", {
                spreadsheet: true,
                spreadsheetRows: 10,
                spreadsheetColumns: 10
            });
            
            spreadsheetMod = tabulator.module("spreadsheet");
            
            return new Promise((resolve) => {
                tabulator.on("tableBuilt", () => {
                    resolve();
                });
            });
        });

        it("should initialize properly", () => {
            expect(spreadsheetMod).toBeDefined();
            expect(Array.isArray(spreadsheetMod.sheets)).toBe(true);
            // In test environment, sheets might not be auto-created
            // until data is explicitly loaded
        });

        it("should add new sheets", () => {
            const initialSheetCount = spreadsheetMod.sheets.length;
            
            // Add a new sheet
            const sheetComponent = spreadsheetMod.addSheet({
                title: "Test Sheet",
                rows: 5,
                columns: 5
            });
            
            // Check sheet was added
            expect(spreadsheetMod.sheets.length).toBe(initialSheetCount + 1);
            expect(sheetComponent instanceof SheetComponent).toBe(true);
            expect(spreadsheetMod.sheets[spreadsheetMod.sheets.length - 1].title).toBe("Test Sheet");
        });

        it("should get sheet definitions", () => {
            // Add a sheet with some data
            spreadsheetMod.addSheet({
                title: "Data Sheet",
                rows: 3,
                columns: 3,
                data: [
                    [1, 2, 3],
                    [4, 5, 6],
                    [7, 8, 9]
                ]
            });
            
            const definitions = spreadsheetMod.getSheetDefinitions();
            
            // Check definitions format
            expect(Array.isArray(definitions)).toBe(true);
            expect(definitions.length).toBe(spreadsheetMod.sheets.length);
            
            // Check data sheet definition
            const dataSheetDef = definitions.find(def => def.title === "Data Sheet");
            expect(dataSheetDef).toBeDefined();
            expect(dataSheetDef.data).toEqual([
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9]
            ]);
            expect(dataSheetDef.rows).toBe(3);
            expect(dataSheetDef.columns).toBe(3);
        });

        it("should switch active sheet", () => {
            // Add second sheet
            const sheetComponent = spreadsheetMod.addSheet({
                title: "Active Test"
            });
            
            // Get initial active sheet
            const initialActiveSheet = spreadsheetMod.activeSheet;
            
            // Activate the new sheet
            spreadsheetMod.activeSheetFunc(sheetComponent);
            
            // Check that active sheet changed
            expect(spreadsheetMod.activeSheet).not.toBe(initialActiveSheet);
            expect(spreadsheetMod.activeSheet.title).toBe("Active Test");
        });

        it("should manage sheets", () => {
            // Create new sheet with data
            const testData = [
                ["A", "B", "C"],
                [1, 2, 3],
                [4, 5, 6]
            ];
            
            // First create a sheet
            const sheet = spreadsheetMod.addSheet({
                title: "Test Sheet",
                data: testData
            });
            
            expect(sheet).toBeDefined();
            expect(typeof sheet.getData).toBe('function');
            expect(typeof sheet.setData).toBe('function');
        });

        it("should remove sheets", () => {
            // Add several sheets
            const sheet1 = spreadsheetMod.addSheet({ title: "Sheet 1" });
            const sheet2 = spreadsheetMod.addSheet({ title: "Sheet 2" });
            const sheet3 = spreadsheetMod.addSheet({ title: "Sheet 3" });
            
            const initialCount = spreadsheetMod.sheets.length;
            
            // Remove a sheet
            spreadsheetMod.removeSheetFunc(sheet2);
            
            // Check sheet was removed
            expect(spreadsheetMod.sheets.length).toBe(initialCount - 1);
            expect(spreadsheetMod.sheets.some(s => s.title === "Sheet 2")).toBe(false);
            
            // Check we can't remove last sheet
            const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            while (spreadsheetMod.sheets.length > 1) {
                spreadsheetMod.removeSheetFunc(spreadsheetMod.sheets[0]);
            }
            
            // Try to remove last sheet
            spreadsheetMod.removeSheetFunc(spreadsheetMod.sheets[0]);
            
            // Should still have one sheet and warning should be logged
            expect(spreadsheetMod.sheets.length).toBe(1);
            expect(spy).toHaveBeenCalled();
            
            spy.mockRestore();
        });
    });

    describe("with initial data", () => {
        const initialData = [
            ["Name", "Age", "City"],
            ["John", 30, "New York"],
            ["Jane", 25, "Boston"],
            ["Bob", 40, "Chicago"]
        ];

        beforeEach(async () => {
            tabulator = new TabulatorFull("#tabulator", {
                spreadsheet: true,
                spreadsheetData: initialData
            });
            
            spreadsheetMod = tabulator.module("spreadsheet");
            
            return new Promise((resolve) => {
                tabulator.on("tableBuilt", () => {
                    resolve();
                });
            });
        });

        it("should load initial data", () => {
            const data = spreadsheetMod.getSheetData();
            expect(data).toEqual(initialData);
        });

        it("should clear sheet data", () => {
            // Clear the sheet
            spreadsheetMod.clearSheet();
            
            // Get data and verify it's empty
            const data = spreadsheetMod.getSheetData();
            expect(data).toEqual([]);
        });
    });
});
