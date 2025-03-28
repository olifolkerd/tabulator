import TabulatorFull from "../../../src/js/core/TabulatorFull";
import Menu from "../../../src/js/modules/Menu/Menu";

describe("Menu module", () => {
    /** @type {TabulatorFull} */
    let tabulator;
    /** @type {Menu} */
    let menuMod;
    let tableData = [
        { id: 1, name: "John", age: 30 },
        { id: 2, name: "Jane", age: 25 },
        { id: 3, name: "Bob", age: 35 }
    ];
    let tableColumns = [
        { 
            title: "ID", 
            field: "id",
            headerMenu: [
                {
                    label: "Header Action",
                    action: jest.fn()
                }
            ]
        },
        { 
            title: "Name", 
            field: "name", 
            contextMenu: [
                {
                    label: "Cell Action",
                    action: jest.fn()
                }
            ]
        },
        { 
            title: "Age", 
            field: "age",
            headerContextMenu: [
                {
                    label: "Header Context Action",
                    action: jest.fn()
                }
            ]
        }
    ];

    beforeEach(async () => {
        const el = document.createElement("div");
        el.id = "tabulator";
        document.body.appendChild(el);
        tabulator = new TabulatorFull("#tabulator", {
            data: tableData,
            columns: tableColumns,
            rowContextMenu: [
                {
                    label: "Row Action",
                    action: jest.fn()
                }
            ]
        });
        menuMod = tabulator.module("menu");
        
        // Mock dispatch function
        menuMod.dispatchExternal = jest.fn();
        menuMod.dispatch = jest.fn();
        
        // Mock popup function
        menuMod.popup = jest.fn().mockImplementation(() => {
            return {
                hide: jest.fn(),
                show: jest.fn().mockReturnThis(),
                hideOnBlur: jest.fn(),
                child: jest.fn().mockReturnValue({
                    hide: jest.fn(),
                    show: jest.fn().mockReturnThis(),
                })
            };
        });
        
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

    it("should initialize with menu options", () => {
        // Check row context menu option
        expect(Array.isArray(tabulator.options.rowContextMenu)).toBe(true);
        expect(tabulator.options.rowContextMenu[0].label).toBe("Row Action");
    });

    it("should handle row context menu", () => {
        // Get a row
        const row = tabulator.rowManager.rows[0];
        
        // Create mock event
        const mockEvent = new MouseEvent("contextmenu", {
            bubbles: true,
            cancelable: true
        });
        
        // Trigger context menu event
        menuMod.loadMenuEvent(tabulator.options.rowContextMenu, mockEvent, row);
        
        // Check popup was called
        expect(menuMod.popup).toHaveBeenCalled();
        
        // Check menu element creation
        const menuEl = menuMod.popup.mock.calls[0][0];
        expect(menuEl.classList.contains("tabulator-menu")).toBe(true);
        
        // Check menu items
        const menuItems = menuEl.querySelectorAll(".tabulator-menu-item");
        expect(menuItems.length).toBe(1);
        expect(menuItems[0].innerHTML).toBe("Row Action");
        
        // Check events were dispatched
        expect(menuMod.dispatch).toHaveBeenCalledWith("menu-opened", expect.anything(), expect.anything());
        expect(menuMod.dispatchExternal).toHaveBeenCalledWith("menuOpened", expect.anything());
    });

    it("should handle cell context menu", () => {
        // Get a cell with context menu
        const nameCell = tabulator.rowManager.rows[0].getCells()[1];
        
        // Create mock event
        const mockEvent = new MouseEvent("contextmenu", {
            bubbles: true,
            cancelable: true
        });
        
        // Trigger context menu event
        menuMod.loadMenuTableCellEvent("contextMenu", mockEvent, nameCell);
        
        // Check popup was called
        expect(menuMod.popup).toHaveBeenCalled();
        
        // Check menu element creation
        const menuEl = menuMod.popup.mock.calls[0][0];
        
        // Check menu items
        const menuItems = menuEl.querySelectorAll(".tabulator-menu-item");
        expect(menuItems.length).toBe(1);
        expect(menuItems[0].innerHTML).toBe("Cell Action");
    });

    it("should handle header context menu", () => {
        // Get a column with header context menu
        const ageCol = tabulator.columnManager.findColumn("age");
        
        // Create mock event
        const mockEvent = new MouseEvent("contextmenu", {
            bubbles: true,
            cancelable: true
        });
        
        // Trigger context menu event
        menuMod.loadMenuTableColumnEvent("headerContextMenu", mockEvent, ageCol);
        
        // Check popup was called
        expect(menuMod.popup).toHaveBeenCalled();
        
        // Check menu element creation
        const menuEl = menuMod.popup.mock.calls[0][0];
        
        // Check menu items
        const menuItems = menuEl.querySelectorAll(".tabulator-menu-item");
        expect(menuItems.length).toBe(1);
        expect(menuItems[0].innerHTML).toBe("Header Context Action");
    });

    it("should handle menu items with separators", () => {
        // Create menu with separator
        const menuWithSeparator = [
            {
                label: "Action 1",
                action: jest.fn()
            },
            {
                separator: true
            },
            {
                label: "Action 2",
                action: jest.fn()
            }
        ];
        
        // Get a row
        const row = tabulator.rowManager.rows[0];
        
        // Create mock event
        const mockEvent = new MouseEvent("click");
        
        // Trigger menu event
        menuMod.loadMenuEvent(menuWithSeparator, mockEvent, row);
        
        // Check menu element creation
        const menuEl = menuMod.popup.mock.calls[0][0];
        
        // Check menu items and separator
        const menuItems = menuEl.querySelectorAll(".tabulator-menu-item");
        const separators = menuEl.querySelectorAll(".tabulator-menu-separator");
        
        expect(menuItems.length).toBe(2);
        expect(separators.length).toBe(1);
    });

    it("should handle disabled menu items", () => {
        // Create menu with disabled item
        const menuWithDisabled = [
            {
                label: "Enabled Action",
                action: jest.fn()
            },
            {
                label: "Disabled Action",
                action: jest.fn(),
                disabled: true
            }
        ];
        
        // Get a row
        const row = tabulator.rowManager.rows[0];
        
        // Create mock event
        const mockEvent = new MouseEvent("click");
        
        // Trigger menu event
        menuMod.loadMenuEvent(menuWithDisabled, mockEvent, row);
        
        // Check menu element creation
        const menuEl = menuMod.popup.mock.calls[0][0];
        
        // Check enabled and disabled menu items
        const menuItems = menuEl.querySelectorAll(".tabulator-menu-item");
        const disabledItems = menuEl.querySelectorAll(".tabulator-menu-item-disabled");
        
        expect(menuItems.length).toBe(2);
        expect(disabledItems.length).toBe(1);
        expect(disabledItems[0].innerHTML).toBe("Disabled Action");
    });

    it("should create menu items with submenu class", () => {
        // Create menu with submenu
        const menuWithSubmenu = [
            {
                label: "Main Action",
                action: jest.fn()
            },
            {
                label: "Submenu",
                menu: [
                    {
                        label: "Submenu Action",
                        action: jest.fn()
                    }
                ]
            }
        ];
        
        // Get a row
        const row = tabulator.rowManager.rows[0];
        
        // Create mock event
        const mockEvent = new MouseEvent("click");
        
        // Create rootPopup mock
        menuMod.rootPopup = {
            hide: jest.fn()
        };
        
        // Trigger menu event
        menuMod.loadMenuEvent(menuWithSubmenu, mockEvent, row);
        
        // Check menu element creation
        const menuEl = menuMod.popup.mock.calls[0][0];
        
        // Check menu items
        const menuItems = menuEl.querySelectorAll(".tabulator-menu-item");
        const submenuItems = menuEl.querySelectorAll(".tabulator-menu-item-submenu");
        
        expect(menuItems.length).toBe(2);
        expect(submenuItems.length).toBe(1);
        expect(submenuItems[0].innerHTML).toBe("Submenu");
    });

    it("should handle menu click to hide", () => {
        // Create menu
        const menu = [
            {
                label: "Action",
                action: jest.fn()
            }
        ];
        
        // Get a row
        const row = tabulator.rowManager.rows[0];
        
        // Create mock event
        const mockEvent = new MouseEvent("click");
        
        // Create rootPopup mock
        menuMod.rootPopup = {
            hide: jest.fn()
        };
        
        // Trigger menu event
        menuMod.loadMenuEvent(menu, mockEvent, row);
        
        // Get menu element
        const menuEl = menuMod.popup.mock.calls[0][0];
        
        // Click on menu element (menu background)
        menuEl.click();
        
        // Check rootPopup hide was called
        expect(menuMod.rootPopup.hide).toHaveBeenCalled();
    });

    it("should track currentComponent", () => {
        // Create menu
        const menu = [
            {
                label: "Action",
                action: jest.fn()
            }
        ];
        
        // Get a row
        const row = tabulator.rowManager.rows[0];
        
        // Create mock event
        const mockEvent = new MouseEvent("click");
        
        // Setup rootPopup mock
        menuMod.rootPopup = null;
        
        // Trigger menu event
        menuMod.loadMenuEvent(menu, mockEvent, row);
        
        // Verify currentComponent was set
        expect(menuMod.currentComponent).not.toBeNull();
        
        // Reset currentComponent for next test
        menuMod.currentComponent = null;
        
        // Verify currentComponent was reset
        expect(menuMod.currentComponent).toBeNull();
    });
});