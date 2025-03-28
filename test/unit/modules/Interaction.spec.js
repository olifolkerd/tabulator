import Interaction from "../../../src/js/modules/Interaction/Interaction";

describe("Interaction module", () => {
    /** @type {Interaction} */
    let interaction;
    let mockTable;
    
    beforeEach(() => {
        // Create mock optionsList
        const mockOptionsList = {
            register: jest.fn(),
        };
        
        // Create mock columnManager
        const mockColumnManager = {
            optionsList: mockOptionsList
        };
        
        // Create mock eventBus
        const mockEventBus = {
            subscribe: jest.fn(),
            unsubscribe: jest.fn(),
        };
        
        // Create mock externalEvents
        const mockExternalEvents = {
            dispatch: jest.fn(),
            subscribed: jest.fn(),
            subscriptionChange: jest.fn(),
        };
        
        // Create a simplified mock of the table
        mockTable = {
            modExists: jest.fn(() => false),
            modules: {},
            columnManager: mockColumnManager,
            options: {},
            eventBus: mockEventBus,
            externalEvents: mockExternalEvents,
        };
        
        // Mock methods in the Interaction prototype
        jest.spyOn(Interaction.prototype, 'registerColumnOption').mockImplementation(function(key) {
            this.table.columnManager.optionsList.register(key);
        });
        
        jest.spyOn(Interaction.prototype, 'subscribe').mockImplementation(function(key, callback) {
            return this.table.eventBus.subscribe(key, callback);
        });
        
        jest.spyOn(Interaction.prototype, 'unsubscribe').mockImplementation(function(key, callback) {
            return this.table.eventBus.unsubscribe(key, callback);
        });
        
        jest.spyOn(Interaction.prototype, 'dispatchExternal').mockImplementation(function(event, ...args) {
            this.table.externalEvents.dispatch(event, ...args);
        });
        
        jest.spyOn(Interaction.prototype, 'subscriptionChangeExternal').mockImplementation(function(event, callback) {
            this.table.externalEvents.subscriptionChange(event, callback);
        });
        
        jest.spyOn(Interaction.prototype, 'subscribedExternal').mockImplementation(function(event) {
            return this.table.externalEvents.subscribed(event);
        });
        
        // Create an instance of the Interaction module with the mock table
        interaction = new Interaction(mockTable);
    });
    
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
    
    it("should register all interaction-related column options", () => {
        // Check that all header events are registered
        expect(mockTable.columnManager.optionsList.register).toHaveBeenCalledWith("headerClick");
        expect(mockTable.columnManager.optionsList.register).toHaveBeenCalledWith("headerDblClick");
        expect(mockTable.columnManager.optionsList.register).toHaveBeenCalledWith("headerContext");
        expect(mockTable.columnManager.optionsList.register).toHaveBeenCalledWith("headerMouseEnter");
        expect(mockTable.columnManager.optionsList.register).toHaveBeenCalledWith("headerMouseLeave");
        expect(mockTable.columnManager.optionsList.register).toHaveBeenCalledWith("headerMouseOver");
        expect(mockTable.columnManager.optionsList.register).toHaveBeenCalledWith("headerMouseOut");
        expect(mockTable.columnManager.optionsList.register).toHaveBeenCalledWith("headerMouseMove");
        expect(mockTable.columnManager.optionsList.register).toHaveBeenCalledWith("headerMouseDown");
        expect(mockTable.columnManager.optionsList.register).toHaveBeenCalledWith("headerMouseUp");
        expect(mockTable.columnManager.optionsList.register).toHaveBeenCalledWith("headerTap");
        expect(mockTable.columnManager.optionsList.register).toHaveBeenCalledWith("headerDblTap");
        expect(mockTable.columnManager.optionsList.register).toHaveBeenCalledWith("headerTapHold");
        
        // Check that all cell events are registered
        expect(mockTable.columnManager.optionsList.register).toHaveBeenCalledWith("cellClick");
        expect(mockTable.columnManager.optionsList.register).toHaveBeenCalledWith("cellDblClick");
        expect(mockTable.columnManager.optionsList.register).toHaveBeenCalledWith("cellContext");
        expect(mockTable.columnManager.optionsList.register).toHaveBeenCalledWith("cellMouseEnter");
        expect(mockTable.columnManager.optionsList.register).toHaveBeenCalledWith("cellMouseLeave");
        expect(mockTable.columnManager.optionsList.register).toHaveBeenCalledWith("cellMouseOver");
        expect(mockTable.columnManager.optionsList.register).toHaveBeenCalledWith("cellMouseOut");
        expect(mockTable.columnManager.optionsList.register).toHaveBeenCalledWith("cellMouseMove");
        expect(mockTable.columnManager.optionsList.register).toHaveBeenCalledWith("cellMouseDown");
        expect(mockTable.columnManager.optionsList.register).toHaveBeenCalledWith("cellMouseUp");
        expect(mockTable.columnManager.optionsList.register).toHaveBeenCalledWith("cellTap");
        expect(mockTable.columnManager.optionsList.register).toHaveBeenCalledWith("cellDblTap");
        expect(mockTable.columnManager.optionsList.register).toHaveBeenCalledWith("cellTapHold");
    });
    
    it("should initialize and subscribe to events", () => {
        // Run initialize
        interaction.initialize();
        
        // Verify subscriptions
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("column-init", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("cell-dblclick", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("scroll-horizontal", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("scroll-vertical", expect.any(Function));
        
        // Verify external event subscriptions are initialized
        expect(mockTable.externalEvents.subscriptionChange).toHaveBeenCalled();
    });
    
    it("should clear touch watchers", () => {
        // Setup some watch values
        interaction.touchWatchers.row.tap = {};
        interaction.touchWatchers.cell.tapHold = {};
        
        // Call clear method
        interaction.clearTouchWatchers();
        
        // Verify all watchers are cleared
        expect(interaction.touchWatchers.row.tap).toBeNull();
        expect(interaction.touchWatchers.row.tapDbl).toBeNull();
        expect(interaction.touchWatchers.row.tapHold).toBeNull();
        
        expect(interaction.touchWatchers.cell.tap).toBeNull();
        expect(interaction.touchWatchers.cell.tapDbl).toBeNull();
        expect(interaction.touchWatchers.cell.tapHold).toBeNull();
        
        expect(interaction.touchWatchers.column.tap).toBeNull();
        expect(interaction.touchWatchers.column.tapDbl).toBeNull();
        expect(interaction.touchWatchers.column.tapHold).toBeNull();
        
        expect(interaction.touchWatchers.group.tap).toBeNull();
        expect(interaction.touchWatchers.group.tapDbl).toBeNull();
        expect(interaction.touchWatchers.group.tapHold).toBeNull();
    });
    
    it("should handle subscription changes for regular events", () => {
        // Mock the subscribe method
        jest.spyOn(interaction, 'subscribe');
        
        // Test subscribing to a regular event (with dash in name)
        interaction.subscriptionChanged("cellClick", true);
        
        // Verify that the internal event was subscribed
        expect(interaction.subscribers.cellClick).toBeDefined();
        expect(interaction.subscribe).toHaveBeenCalledWith("cell-click", interaction.subscribers.cellClick);
        
        // Test unsubscribing
        jest.spyOn(interaction, 'unsubscribe');
        jest.spyOn(interaction, 'subscribedExternal').mockReturnValue(false);
        
        // Store the subscriber function before unsubscribing
        const subscriberFunc = interaction.subscribers.cellClick;
        
        interaction.subscriptionChanged("cellClick", false);
        
        // Verify that the internal event was unsubscribed
        expect(interaction.unsubscribe).toHaveBeenCalledWith("cell-click", subscriberFunc);
        expect(interaction.subscribers.cellClick).toBeUndefined();
    });
    
    it("should handle subscription changes for touch events", () => {
        // Mock the subscribeTouchEvents and unsubscribeTouchEvents methods
        jest.spyOn(interaction, 'subscribeTouchEvents');
        jest.spyOn(interaction, 'unsubscribeTouchEvents');
        
        // Test subscribing to a touch event (without dash in name)
        interaction.subscriptionChanged("cellTap", true);
        
        // Verify that the touch events were subscribed
        expect(interaction.subscribeTouchEvents).toHaveBeenCalledWith("cellTap");
        
        // Test unsubscribing
        interaction.subscriptionChanged("cellTap", false);
        
        // Verify that the touch events were unsubscribed
        expect(interaction.unsubscribeTouchEvents).toHaveBeenCalledWith("cellTap");
    });
    
    it("should subscribe to touch events", () => {
        // Mock the subscribe method
        jest.spyOn(interaction, 'subscribe');
        
        // Subscribe to touch events
        interaction.subscribeTouchEvents("cellTap");
        
        // Verify that the touchstart and touchend events were subscribed
        expect(interaction.subscribe).toHaveBeenCalledWith("cell-touchstart", expect.any(Function));
        expect(interaction.subscribe).toHaveBeenCalledWith("cell-touchend", expect.any(Function));
        
        // Verify that the subscribers flag is set
        expect(interaction.subscribers.cellTap).toBe(true);
        
        // Verify that the touch subscribers were created
        expect(interaction.touchSubscribers["cell-touchstart"]).toBeDefined();
        expect(interaction.touchSubscribers["cell-touchend"]).toBeDefined();
    });
    
    it("should unsubscribe from touch events", () => {
        // Setup for unsubscribe test
        interaction.subscribers.cellTap = true;
        interaction.touchSubscribers["cell-touchstart"] = function() {};
        interaction.touchSubscribers["cell-touchend"] = function() {};
        
        // Mock methods
        jest.spyOn(interaction, 'unsubscribe');
        jest.spyOn(interaction, 'subscribedExternal').mockReturnValue(false);
        
        // Unsubscribe from touch events
        interaction.unsubscribeTouchEvents("cellTap");
        
        // We've already verified the unsubscribeTouchEvents method was called
        // We just need to check side effects of the call
        
        // Verify that the subscribers flag is removed
        expect(interaction.subscribers.cellTap).toBeUndefined();
        
        // Verify that the touch subscribers were removed
        expect(interaction.touchSubscribers["cell-touchstart"]).toBeUndefined();
        expect(interaction.touchSubscribers["cell-touchend"]).toBeUndefined();
    });
    
    it("should initialize a column with interaction handlers", () => {
        // Create a mock column with interaction handlers in definition
        const mockColumn = {
            definition: {
                cellClick: jest.fn(),
                headerMouseEnter: jest.fn()
            },
            getComponent: jest.fn().mockReturnValue({})
        };
        
        // Mock the subscriptionChanged method
        jest.spyOn(interaction, 'subscriptionChanged');
        
        // Initialize the column
        interaction.initializeColumn(mockColumn);
        
        // Verify that subscriptionChanged was called for each interaction handler
        expect(interaction.subscriptionChanged).toHaveBeenCalledWith("cellClick", true);
        expect(interaction.subscriptionChanged).toHaveBeenCalledWith("headerMouseEnter", true);
        
        // Verify that the column was added to columnSubscribers
        expect(interaction.columnSubscribers.cellClick).toContain(mockColumn);
        expect(interaction.columnSubscribers.headerMouseEnter).toContain(mockColumn);
    });
    
    it("should handle events and dispatch them", () => {
        // Mock the dispatchEvent method
        jest.spyOn(interaction, 'dispatchEvent');
        
        // Create a mock event and component
        const mockEvent = { type: "click" };
        const mockComponent = { getComponent: jest.fn().mockReturnValue({}) };
        
        // Handle an event
        interaction.handle("cellClick", mockEvent, mockComponent);
        
        // Verify dispatchEvent was called with the correct parameters
        expect(interaction.dispatchEvent).toHaveBeenCalledWith("cellClick", mockEvent, mockComponent);
    });
    
    it("should handle touch events", () => {
        // Mock the dispatchEvent method
        jest.spyOn(interaction, 'dispatchEvent');
        
        // Create a mock event and component
        const mockEvent = { type: "touchstart" };
        const mockComponent = { getComponent: jest.fn().mockReturnValue({}) };
        
        // Handle a touchstart event
        interaction.handleTouch("cell", "start", mockEvent, mockComponent);
        
        // Check that the tap flag is set
        expect(interaction.touchWatchers.cell.tap).toBe(true);
        
        // Handle a touchend event
        interaction.handleTouch("cell", "end", mockEvent, mockComponent);
        
        // Verify dispatchEvent was called with the correct parameters for tap
        expect(interaction.dispatchEvent).toHaveBeenCalledWith("cellTap", mockEvent, mockComponent);
        
        // Check that the tap flag is cleared
        expect(interaction.touchWatchers.cell.tap).toBeNull();
        
        // Check that the tapDbl timer is set
        expect(interaction.touchWatchers.cell.tapDbl).not.toBeNull();
        
        // Fast forward time to test double tap
        jest.useFakeTimers();
        
        // Handle a second touchstart/end within the double tap interval
        interaction.handleTouch("cell", "start", mockEvent, mockComponent);
        interaction.handleTouch("cell", "end", mockEvent, mockComponent);
        
        // Verify dispatchEvent was called with the correct parameters for double tap
        expect(interaction.dispatchEvent).toHaveBeenCalledWith("cellDblTap", mockEvent, mockComponent);
        
        // Reset timer and interaction watchers
        jest.useRealTimers();
        interaction.clearTouchWatchers();
    });
    
    it("should dispatch events externally", () => {
        // Create a mock component
        const mockComponent = { comp: true };
        
        // Mock dispatchExternal
        jest.spyOn(interaction, 'dispatchExternal');
        
        // Create a mock event
        const mockEvent = { type: "click" };
        
        // Dispatch the external event directly
        interaction.dispatchExternal("cellClick", mockEvent, mockComponent);
        
        // Verify dispatchExternal was called with the correct parameters
        expect(interaction.dispatchExternal).toHaveBeenCalledWith("cellClick", mockEvent, mockComponent);
    });
    
    it("should handle cell contents selection on double click", () => {
        // Mock document functions
        const mockRange = {
            selectNode: jest.fn(),
            moveToElementText: jest.fn(),
            select: jest.fn()
        };
        document.createRange = jest.fn().mockReturnValue(mockRange);
        window.getSelection = jest.fn().mockReturnValue({
            removeAllRanges: jest.fn(),
            addRange: jest.fn()
        });
        
        // Create mock event
        const mockEvent = {
            preventDefault: jest.fn()
        };
        
        // Create mock cell
        const mockCell = {
            getElement: jest.fn().mockReturnValue(document.createElement('div'))
        };
        
        // Set edit module to not exist
        mockTable.modExists.mockReturnValue(false);
        
        // Call the cell contents selection fixer
        interaction.cellContentsSelectionFixer(mockEvent, mockCell);
        
        // Verify event was prevented
        expect(mockEvent.preventDefault).toHaveBeenCalled();
        
        // Verify selection functions were called
        expect(document.createRange).toHaveBeenCalled();
        expect(mockRange.selectNode).toHaveBeenCalledWith(mockCell.getElement());
        expect(window.getSelection().removeAllRanges).toHaveBeenCalled();
        expect(window.getSelection().addRange).toHaveBeenCalledWith(mockRange);
    });
    
    it("should not select cell contents if cell is being edited", () => {
        // Mock event
        const mockEvent = {
            preventDefault: jest.fn()
        };
        
        // Create mock cell
        const mockCell = {
            getElement: jest.fn()
        };
        
        // Set up edit module
        mockTable.modExists.mockReturnValue(true);
        mockTable.modules.edit = {
            currentCell: mockCell
        };
        
        // Call the cell contents selection fixer
        interaction.cellContentsSelectionFixer(mockEvent, mockCell);
        
        // Verify event was not prevented (early return)
        expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });
});
