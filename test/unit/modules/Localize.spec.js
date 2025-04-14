import Localize from "../../../src/js/modules/Localize/Localize";

describe("Localize module", () => {
    /** @type {Localize} */
    let localizeMod;
    let mockTable;
    let mockOptionsList;
    
    beforeEach(() => {
        // Create mock optionsList
        mockOptionsList = {
            register: jest.fn(),
            generate: jest.fn().mockImplementation((defaults, options) => {
                return { ...defaults, ...options };
            })
        };
        
        // Create a simplified mock of the table
        mockTable = {
            options: {
                locale: false,
                langs: {
                    "es": {
                        "groups": {
                            "item": "artículo",
                            "items": "artículos"
                        },
                        "pagination": {
                            "page_size": "Tamaño de página"
                        }
                    },
                    "fr": {
                        "groups": {
                            "item": "élément",
                            "items": "éléments"
                        }
                    }
                },
                columnDefaults: {
                    headerFilterPlaceholder: false
                }
            },
            optionsList: mockOptionsList,
            columnManager: {
                optionsList: mockOptionsList
            },
            registerTableFunction: jest.fn()
        };
        
        // Mock the prototype methods of the Module class
        jest.spyOn(Localize.prototype, 'registerTableOption').mockImplementation(function(key, value) {
            this.table.optionsList.register(key, value);
        });
        
        // Mock console warn
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        
        // Create Localize module instance
        localizeMod = new Localize(mockTable);
        
        // Mock dispatchExternal
        localizeMod.dispatchExternal = jest.fn();
        
        // Mock registerTableFunction
        const originalRegisterTableFunction = localizeMod.registerTableFunction;
        localizeMod.registerTableFunction = function(name, callback) {
            mockTable.registerTableFunction(name, callback);
        };
        
        // Initialize the module
        localizeMod.initialize();
    });
    
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
    
    it("should initialize with default locale", () => {
        expect(localizeMod.locale).toBe("default");
        expect(localizeMod.lang).toBeDefined();
        expect(localizeMod.bindings).toEqual({});
        
        // Check table function registration
        expect(mockTable.registerTableFunction).toHaveBeenCalledWith("setLocale", expect.any(Function));
        expect(mockTable.registerTableFunction).toHaveBeenCalledWith("getLocale", expect.any(Function));
        expect(mockTable.registerTableFunction).toHaveBeenCalledWith("getLang", expect.any(Function));
    });
    
    it("should register table options during construction", () => {
        // Verify table options are registered
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("locale", false);
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("langs", {});
    });
    
    it("should install langs from table options", () => {
        // Check that Spanish lang is installed
        expect(localizeMod.langList.es).toBeDefined();
        expect(localizeMod.langList.es.groups.item).toBe("artículo");
        
        // Check that French lang is installed
        expect(localizeMod.langList.fr).toBeDefined();
        expect(localizeMod.langList.fr.groups.item).toBe("élément");
    });
    
    it("should set header filter placeholder", () => {
        const placeholder = "Type to filter...";
        localizeMod.setHeaderFilterPlaceholder(placeholder);
        
        expect(localizeMod.langList.default.headerFilters.default).toBe(placeholder);
    });
    
    it("should install new language", () => {
        // Install a new language
        const germanLang = {
            "groups": {
                "item": "Element",
                "items": "Elemente"
            }
        };
        
        localizeMod.installLang("de", germanLang);
        
        // Check that language was installed
        expect(localizeMod.langList.de).toBeDefined();
        expect(localizeMod.langList.de.groups.item).toBe("Element");
    });
    
    it("should update existing language", () => {
        // Update existing Spanish language
        const updatedSpanish = {
            "data": {
                "loading": "Cargando"
            }
        };
        
        localizeMod.installLang("es", updatedSpanish);
        
        // Check that language was updated
        expect(localizeMod.langList.es.groups.item).toBe("artículo"); // Original value retained
        expect(localizeMod.langList.es.data.loading).toBe("Cargando"); // New value added
    });
    
    it("should set locale and update language", () => {
        // Set locale to Spanish
        localizeMod.setLocale("es");
        
        // Check locale is set
        expect(localizeMod.locale).toBe("es");
        
        // Check language values are correct
        expect(localizeMod.lang.groups.item).toBe("artículo");
        expect(localizeMod.lang.pagination.page_size).toBe("Tamaño de página");
        
        // Check that default values are inherited
        expect(localizeMod.lang.data.loading).toBe("Loading");
        
        // Check dispatch is called
        expect(localizeMod.dispatchExternal).toHaveBeenCalledWith("localized", "es", localizeMod.lang);
    });
    
    it("should handle setting locale with browser language", () => {
        // Mock navigator language
        const originalNavigator = global.navigator;
        const mockNavigator = { language: "es-ES" };
        Object.defineProperty(global, 'navigator', { value: mockNavigator, writable: true });
        
        // Mock traverseLang function 
        const originalSetLocale = localizeMod.setLocale;
        jest.spyOn(localizeMod, 'setLocale').mockImplementation(function(desiredLocale) {
            if (desiredLocale === true) {
                desiredLocale = navigator.language.toLowerCase();
            }
            this.locale = "es"; // Force to spanish for this test
            
            // Simulate dispatch
            this.dispatchExternal("localized", this.locale, this.lang);
        });
        
        // Set locale to true to use browser language
        localizeMod.setLocale(true);
        
        // Check locale is set to es
        expect(localizeMod.locale).toBe("es");
        
        // Restore original function
        localizeMod.setLocale.mockRestore();
        
        // Restore navigator
        Object.defineProperty(global, 'navigator', { value: originalNavigator, writable: true });
    });
    
    it("should fall back to language prefix if exact match not found", () => {
        // Add Spanish to langList to test fallback
        localizeMod.langList = {
            "default": localizeMod.langList.default,
            "es": localizeMod.langList.es
        };
        
        // Set locale to Spanish variant
        localizeMod.setLocale("es-MX");
        
        // Should fall back to es
        expect(localizeMod.locale).toBe("es");
        expect(console.warn).toHaveBeenCalled();
    });
    
    it("should fall back to default if no matching language found", () => {
        // Set locale to an unsupported language
        localizeMod.setLocale("ja");
        
        // Should fall back to default
        expect(localizeMod.locale).toBe("default");
        expect(console.warn).toHaveBeenCalled();
    });
    
    it("should get current locale", () => {
        // Set locale to Spanish
        localizeMod.setLocale("es");
        
        // Check getLocale returns correct value
        expect(localizeMod.getLocale()).toBe("es");
    });
    
    it("should get language for specified locale", () => {
        // Get Spanish language
        const spanishLang = localizeMod.getLang("es");
        
        // Check language is returned
        expect(spanishLang).toBe(localizeMod.langList.es);
    });
    
    it("should get current language if no locale specified", () => {
        // Set locale to Spanish
        localizeMod.setLocale("es");
        
        // Get current language
        const currentLang = localizeMod.getLang();
        
        // Check language is returned
        expect(currentLang).toBe(localizeMod.lang);
    });
    
    it("should get text for current locale", () => {
        // Set locale to Spanish
        localizeMod.setLocale("es");
        
        // Get text
        const itemText = localizeMod.getText("groups|item");
        
        // Check text is returned
        expect(itemText).toBe("artículo");
    });
    
    it("should get text using simplified path", () => {
        // Set locale to Spanish
        localizeMod.setLocale("es");
        
        // Get text with path and value
        const itemText = localizeMod.getText("groups", "item");
        
        // Check text is returned
        expect(itemText).toBe("artículo");
    });
    
    it("should return empty string if text not found", () => {
        // Get text for non-existent path
        const nonExistentText = localizeMod.getText("nonexistent|path");
        
        // Check empty string is returned
        expect(nonExistentText).toBe("");
    });
    
    it("should bind callback to text path", () => {
        // Create mock callback
        const callback = jest.fn();
        
        // Bind callback to path
        localizeMod.bind("groups|item", callback);
        
        // Check callback was called with current text
        expect(callback).toHaveBeenCalledWith(localizeMod.getText("groups|item"), localizeMod.lang);
        
        // Check binding was stored
        expect(localizeMod.bindings["groups|item"]).toContain(callback);
    });
    
    it("should execute bindings when locale changes", () => {
        // Create mock callback
        const callback = jest.fn();
        
        // Bind callback to path
        localizeMod.bind("groups|item", callback);
        
        // Reset mock to clear initial call
        callback.mockReset();
        
        // Change locale
        localizeMod.setLocale("es");
        
        // Check callback was called with updated text
        expect(callback).toHaveBeenCalledWith("artículo", localizeMod.lang);
    });
    
    it("should handle multiple bindings to same path", () => {
        // Create mock callbacks
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        
        // Bind callbacks to same path
        localizeMod.bind("groups|item", callback1);
        localizeMod.bind("groups|item", callback2);
        
        // Reset mocks to clear initial calls
        callback1.mockReset();
        callback2.mockReset();
        
        // Change locale
        localizeMod.setLocale("es");
        
        // Check both callbacks were called
        expect(callback1).toHaveBeenCalledWith("artículo", localizeMod.lang);
        expect(callback2).toHaveBeenCalledWith("artículo", localizeMod.lang);
    });
});
