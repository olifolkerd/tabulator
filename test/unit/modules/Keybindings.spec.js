import Keybindings from "../../../src/js/modules/Keybindings/Keybindings";

describe("Keybindings module", () => {
    /** @type {Keybindings} */
    let keybindingsMod;
    let mockTable;
    
    beforeEach(() => {
        // Create mock optionsList
        const mockOptionsList = {
            register: jest.fn(),
            generate: jest.fn().mockImplementation((defaults, options) => {
                return { ...defaults, ...options };
            })
        };
        
        // Create mock eventBus
        const mockEventBus = {
            subscribe: jest.fn(),
            unsubscribe: jest.fn(),
            subscribed: jest.fn(),
            subscriptionChange: jest.fn(),
            dispatch: jest.fn(),
            chain: jest.fn(),
            confirm: jest.fn()
        };
        
        // Create mock externalEvents
        const mockExternalEvents = {
            dispatch: jest.fn(),
            subscribed: jest.fn(),
            subscriptionChange: jest.fn()
        };
        
        // Create a simplified mock of the table
        mockTable = {
            options: {
                keybindings: false // Disable default keybindings for most tests
            },
            element: {
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                focus: jest.fn()
            },
            rowManager: {
                element: {
                    clientHeight: 200,
                    scrollHeight: 600,
                    scrollTop: 200
                },
                scrollToRow: jest.fn(),
                getDisplayRows: jest.fn().mockReturnValue([
                    { id: 1 }, 
                    { id: 2 }, 
                    { id: 3 }
                ]),
                displayRowsCount: 3
            },
            columnManager: {
                optionsList: mockOptionsList
            },
            optionsList: mockOptionsList,
            eventBus: mockEventBus,
            externalEvents: mockExternalEvents,
            registerTableFunction: jest.fn(),
            initGuard: jest.fn()
        };
        
        // Mock the prototype methods of the Module class
        jest.spyOn(Keybindings.prototype, 'registerTableOption').mockImplementation(function(key, value) {
            this.table.optionsList.register(key, value);
        });
        
        jest.spyOn(Keybindings.prototype, 'registerColumnOption').mockImplementation(function(key, value) {
            this.table.columnManager.optionsList.register(key, value);
        });
        
        // Mock subscribe method which is used in initialize
        jest.spyOn(Keybindings.prototype, 'subscribe').mockImplementation(function(key, callback) {
            return this.table.eventBus.subscribe(key, callback);
        });
        
        // Create an instance of the Keybindings module with the mock table
        keybindingsMod = new Keybindings(mockTable);
        
        // Mock the dispatch method
        keybindingsMod.dispatch = jest.fn();
        
        // Mock registerTableFunction
        keybindingsMod.registerTableFunction = function(name, callback) {
            mockTable.registerTableFunction(name, callback);
        };
        
        // Initialize the module
        keybindingsMod.initialize();
    });
    
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
    
    it("should initialize watchKeys and pressedKeys as empty when keybindings disabled", () => {
        // With keybindings:false, the module should initialize empty structures
        expect(keybindingsMod.watchKeys).toEqual({});
        expect(keybindingsMod.pressedKeys).toEqual([]);
    });

    it("should map default bindings when keybindings is enabled", () => {
        // Create a new instance with enabled keybindings
        mockTable.options.keybindings = {};
        keybindingsMod = new Keybindings(mockTable);
        keybindingsMod.dispatch = jest.fn();
        
        // Mock the mapBinding method to inspect what it's called with
        keybindingsMod.mapBinding = jest.fn();
        
        keybindingsMod.initialize();
        
        // Verify that mapBinding was called at least once
        expect(keybindingsMod.mapBinding).toHaveBeenCalled();
    });
    
    it("should map bindings through the public API", () => {
        // Create a separate instance to ensure clean state
        const instance = new Keybindings({...mockTable, options: {keybindings: false}});
        
        // Initialize the instance to set up watchKeys
        instance.initialize();
        
        // Add a spy to track key binding objects
        let capturedBindings = [];
        const originalMapBinding = instance.mapBinding;
        instance.mapBinding = jest.fn((action, binding) => {
            capturedBindings.push({action, binding});
            return originalMapBinding.call(instance, action, binding);
        });
        
        // Map a simple binding
        const bindings = {
            scrollToStart: "ctrl + home"
        };
        
        // Call the method
        instance.mapBindings(bindings);
        
        // Verify mapBinding was called with expected parameters
        expect(instance.mapBinding).toHaveBeenCalledWith("scrollToStart", "ctrl + home");
        expect(capturedBindings.length).toBeGreaterThan(0);
        
        // Verify the first binding was for scrollToStart
        const capturedBinding = capturedBindings[0];
        expect(capturedBinding.action).toBe("scrollToStart");
        expect(capturedBinding.binding).toBe("ctrl + home");
    });
    
    it("should handle key combinations correctly", () => {
        // Mock a key binding
        const binding = {
            action: jest.fn(),
            keys: [38], // UP arrow
            ctrl: true,
            shift: false,
            meta: false
        };
        
        // Create a mock event
        const event = {
            ctrlKey: true,
            shiftKey: false,
            metaKey: false
        };
        
        // Set pressed keys
        keybindingsMod.pressedKeys = [38];
        
        // Test binding check - should match
        const result = keybindingsMod.checkBinding(event, binding);
        expect(result).toBe(true);
        expect(binding.action).toHaveBeenCalled();
        
        // Test with non-matching modifiers
        event.shiftKey = true;
        const nonMatchResult = keybindingsMod.checkBinding(event, binding);
        expect(nonMatchResult).toBe(false);
    });
    
    it("should handle clearing bindings", () => {
        // Set up the binding references
        keybindingsMod.keyupBinding = jest.fn();
        keybindingsMod.keydownBinding = jest.fn();
        
        // Call clear bindings
        keybindingsMod.clearBindings();
        
        // Check that event listeners were removed
        expect(keybindingsMod.table.element.removeEventListener).toHaveBeenCalledWith("keydown", keybindingsMod.keyupBinding);
        expect(keybindingsMod.table.element.removeEventListener).toHaveBeenCalledWith("keyup", keybindingsMod.keydownBinding);
    });
    
    it("should execute scrollPageUp action by calling scrollToRow for first row when scroll would be negative", () => {
        // Create mock event
        const event = {
            preventDefault: jest.fn()
        };
        
        // Change scrollTop to a small value to trigger the "else" branch
        keybindingsMod.table.rowManager.element.scrollTop = 100;
        keybindingsMod.table.rowManager.element.clientHeight = 200;
        
        // Execute the action directly to test the scrollToRow path
        Keybindings.actions.scrollPageUp.call(keybindingsMod, event);
        
        // Check scrollToRow was called with first row
        expect(keybindingsMod.table.rowManager.scrollToRow).toHaveBeenCalledWith({ id: 1 });
        expect(event.preventDefault).toHaveBeenCalled();
        expect(keybindingsMod.table.element.focus).toHaveBeenCalled();
    });
    
    it("should execute scrollPageDown action by calling scrollToRow for last row", () => {
        // Create mock event
        const event = {
            preventDefault: jest.fn()
        };
        
        // Set scrollTop and scrollHeight to trigger the "else" branch
        keybindingsMod.table.rowManager.element.scrollTop = 500;
        keybindingsMod.table.rowManager.element.clientHeight = 200;
        keybindingsMod.table.rowManager.element.scrollHeight = 600;
        
        // Execute the action directly
        Keybindings.actions.scrollPageDown.call(keybindingsMod, event);
        
        // Check that the right methods were called
        expect(event.preventDefault).toHaveBeenCalled();
        expect(keybindingsMod.table.element.focus).toHaveBeenCalled();
        
        // Check scrollToRow was called with last row since we're at the bottom
        expect(keybindingsMod.table.rowManager.scrollToRow).toHaveBeenCalledWith({ id: 3 });
    });
    
    it("should execute scrollToStart action correctly", () => {
        // Create mock event
        const event = {
            preventDefault: jest.fn()
        };
        
        // Execute the action
        Keybindings.actions.scrollToStart.call(keybindingsMod, event);
        
        // Check that event was prevented
        expect(event.preventDefault).toHaveBeenCalled();
        
        // Check that focus was called
        expect(keybindingsMod.table.element.focus).toHaveBeenCalled();
        
        // Check scrollToRow was called with first row
        expect(keybindingsMod.table.rowManager.scrollToRow).toHaveBeenCalledWith({ id: 1 });
    });
    
    it("should execute scrollToEnd action correctly", () => {
        // Create mock event
        const event = {
            preventDefault: jest.fn()
        };
        
        // Execute the action
        Keybindings.actions.scrollToEnd.call(keybindingsMod, event);
        
        // Check that event was prevented
        expect(event.preventDefault).toHaveBeenCalled();
        
        // Check that focus was called
        expect(keybindingsMod.table.element.focus).toHaveBeenCalled();
        
        // Check scrollToRow was called with last row
        expect(keybindingsMod.table.rowManager.scrollToRow).toHaveBeenCalledWith({ id: 3 });
    });
    
    it("should execute keyBlock action correctly", () => {
        // Create mock event
        const event = {
            stopPropagation: jest.fn(),
            preventDefault: jest.fn()
        };
        
        // Execute the action
        Keybindings.actions.keyBlock.call(keybindingsMod, event);
        
        // Check that event methods were called
        expect(event.stopPropagation).toHaveBeenCalled();
        expect(event.preventDefault).toHaveBeenCalled();
    });
    
    it("should execute navigation actions correctly", () => {
        // Test all navigation actions
        const actions = ["navPrev", "navNext", "navUp", "navDown", "navLeft", "navRight"];
        const events = {};
        
        actions.forEach(action => {
            events[action] = { };
            Keybindings.actions[action].call(keybindingsMod, events[action]);
            expect(keybindingsMod.dispatch).toHaveBeenCalledWith(`keybinding-${action.replace("nav", "nav-").toLowerCase()}`, events[action]);
        });
    });
});
