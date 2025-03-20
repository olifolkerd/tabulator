import Module from '../../../src/js/core/Module.js';
import Download from '../../../src/js/modules/Download/Download.js';

// Override the Module methods that interact with the table to avoid dependency issues
const originalRegisterTableOption = Module.prototype.registerTableOption;
Module.prototype.registerTableOption = function() {};

const originalRegisterColumnOption = Module.prototype.registerColumnOption;
Module.prototype.registerColumnOption = function() {};

const originalRegisterTableFunction = Module.prototype.registerTableFunction;
Module.prototype.registerTableFunction = function() {};

describe('Download', function(){
	// Restore original Module methods after all tests
	afterAll(() => {
		Module.prototype.registerTableOption = originalRegisterTableOption;
		Module.prototype.registerColumnOption = originalRegisterColumnOption;
		Module.prototype.registerTableFunction = originalRegisterTableFunction;
	});

	// Test direct functionality without a complete table instance
	describe('Functionality tests', function() {
		test('initialize registers table functions', function(){
			// Create mock table
			const mockTable = {
				options: {}
			};
			
			// Create a download instance
			const download = new Download(mockTable);
			
			// Mock the register function
			download.registerTableFunction = jest.fn();
			download.deprecatedOptionsCheck = jest.fn();
			
			// Initialize the module
			download.initialize();
			
			// Check that the table functions were registered
			expect(download.deprecatedOptionsCheck).toHaveBeenCalled();
			expect(download.registerTableFunction).toHaveBeenCalledWith("download", expect.any(Function));
			expect(download.registerTableFunction).toHaveBeenCalledWith("downloadToTab", expect.any(Function));
		});

		test('downloadToTab calls download with correct parameters', function(){
			// Create mock table
			const mockTable = {
				options: {}
			};
			
			// Create a download instance
			const download = new Download(mockTable);
			
			// Mock the download method
			download.download = jest.fn();
			
			// Call downloadToTab
			download.downloadToTab("csv", "test.csv", {delimiter: ","}, "active");
			
			// Check that download was called with the correct parameters
			expect(download.download).toHaveBeenCalledWith("csv", "test.csv", {delimiter: ","}, "active", true);
		});

		test('download warns when invalid type is provided', function(){
			// Create mock table with export module and options
			const mockTable = {
				modules: {
					export: {
						generateExportList: jest.fn().mockReturnValue([])
					}
				},
				options: {
					downloadConfig: {},
					downloadRowRange: "active"
				}
			};
			
			// Create a download instance
			const download = new Download(mockTable);
			download.table = mockTable;
			
			// Mock console.warn
			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			
			// Call download with invalid type
			download.download("invalidType", "test.file");
			
			// Check that warning was shown
			expect(consoleSpy).toHaveBeenCalledWith("Download Error - No such download type found: ", "invalidType");
			
			consoleSpy.mockRestore();
		});

		test('download calls downloader function with correct parameters', function(){
			// Create mock downloader function
			const mockDownloader = jest.fn();
			Download.downloaders = {
				csv: mockDownloader
			};
			
			// Create mock export list
			const mockExportList = [{type: "data", columns: []}];
			
			// Create mock table with export module
			const mockTable = {
				modules: {
					export: {
						generateExportList: jest.fn().mockReturnValue(mockExportList)
					}
				},
				options: {
					downloadConfig: {},
					downloadRowRange: "active"
				}
			};
			
			// Create a download instance
			const download = new Download(mockTable);
			download.table = mockTable;
			
			// Call download
			const options = {delimiter: ","};
			download.download("csv", "test.csv", options);
			
			// Check that generateExportList was called
			expect(mockTable.modules.export.generateExportList).toHaveBeenCalledWith(
				{}, false, "active", "download"
			);
			
			// Check that downloader was called with correct parameters
			expect(mockDownloader).toHaveBeenCalledWith(
				mockExportList, 
				options, 
				expect.any(Function)
			);
		});

		test('download accepts a custom function as a downloader', function(){
			// Create mock custom downloader function
			const customDownloader = jest.fn();
			
			// Create mock export list
			const mockExportList = [{type: "data", columns: []}];
			
			// Create mock table with export module
			const mockTable = {
				modules: {
					export: {
						generateExportList: jest.fn().mockReturnValue(mockExportList)
					}
				},
				options: {
					downloadConfig: {},
					downloadRowRange: "active"
				}
			};
			
			// Create a download instance
			const download = new Download(mockTable);
			download.table = mockTable;
			
			// Call download with custom function
			const options = {custom: true};
			download.download(customDownloader, "test.file", options);
			
			// Check that the custom downloader was called with correct parameters
			expect(customDownloader).toHaveBeenCalledWith(
				mockExportList, 
				options, 
				expect.any(Function)
			);
		});

		test('generateExportList handles group headers correctly', function(){
			// Create mock export list with a group row
			const mockComponent = {
				_group: {
					getRowCount: jest.fn().mockReturnValue(5),
					getData: jest.fn().mockReturnValue({id: "group1"})
				}
			};
			
			const mockExportList = [
				{
					type: "group", 
					indent: 0,
					columns: [{value: "Group 1"}],
					component: mockComponent
				}
			];
			
			// Create mock table with export module and group header formatter
			const groupHeaderFormatter = jest.fn().mockReturnValue("Custom Group Header");
			
			const mockTable = {
				modules: {
					export: {
						generateExportList: jest.fn().mockReturnValue(mockExportList)
					}
				},
				options: {
					downloadConfig: {},
					downloadRowRange: "active",
					groupHeaderDownload: groupHeaderFormatter
				}
			};
			
			// Create a download instance
			const download = new Download(mockTable);
			download.table = mockTable;
			
			// Call generateExportList
			const result = download.generateExportList();
			
			// Check that the group header formatter was called
			expect(groupHeaderFormatter).toHaveBeenCalledWith(
				"Group 1", 
				5, 
				{id: "group1"}, 
				mockComponent
			);
			
			// Check that the group value was updated
			expect(result[0].columns[0].value).toBe("Custom Group Header");
		});

		test('triggerDownload creates and triggers download element', function(){
			// Mock document methods
			const mockElement = {
				setAttribute: jest.fn(),
				style: {},
				click: jest.fn()
			};
			
			document.createElement = jest.fn().mockReturnValue(mockElement);
			document.body.appendChild = jest.fn();
			document.body.removeChild = jest.fn();
			
			// Mock URL.createObjectURL
			const mockURL = "blob:url";
			window.URL.createObjectURL = jest.fn().mockReturnValue(mockURL);
			
			// Create mock table with downloadEncoder
			const mockBlob = new Blob(["test data"], {type: "text/csv"});
			const mockTable = {
				options: {
					downloadEncoder: jest.fn().mockReturnValue(mockBlob)
				}
			};
			
			// Create a download instance
			const download = new Download(mockTable);
			download.table = mockTable;
			download.dispatchExternal = jest.fn();
			
			// Call triggerDownload
			download.triggerDownload("test data", "text/csv", "csv", "test.csv");
			
			// Check that downloadEncoder was called
			expect(mockTable.options.downloadEncoder).toHaveBeenCalledWith("test data", "text/csv");
			
			// Check that URL.createObjectURL was called with the blob
			expect(window.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
			
			// Check that the element was properly configured
			expect(mockElement.setAttribute).toHaveBeenCalledWith("href", mockURL);
			expect(mockElement.setAttribute).toHaveBeenCalledWith("download", "test.csv");
			expect(mockElement.style.display).toBe("none");
			
			// Check that the element was added, clicked, and removed
			expect(document.body.appendChild).toHaveBeenCalledWith(mockElement);
			expect(mockElement.click).toHaveBeenCalled();
			expect(document.body.removeChild).toHaveBeenCalledWith(mockElement);
			
			// Check that external event was dispatched
			expect(download.dispatchExternal).toHaveBeenCalledWith("downloadComplete");
		});

		test('triggerDownload opens in new tab when newTab is true', function(){
			// Mock window.open
			window.open = jest.fn();
			
			// Mock URL.createObjectURL
			const mockURL = "blob:url";
			window.URL.createObjectURL = jest.fn().mockReturnValue(mockURL);
			
			// Create mock table with downloadEncoder
			const mockBlob = new Blob(["test data"], {type: "text/csv"});
			const mockTable = {
				options: {
					downloadEncoder: jest.fn().mockReturnValue(mockBlob)
				}
			};
			
			// Create a download instance
			const download = new Download(mockTable);
			download.table = mockTable;
			download.dispatchExternal = jest.fn();
			
			// Call triggerDownload with newTab = true
			download.triggerDownload("test data", "text/csv", "csv", "test.csv", true);
			
			// Check that window.open was called with the blob URL
			expect(window.open).toHaveBeenCalledWith(mockURL);
			
			// Check that external event was dispatched
			expect(download.dispatchExternal).toHaveBeenCalledWith("downloadComplete");
		});
		
		test('commsReceived handles intercept action correctly', function(){
			// Create a download instance
			const download = new Download({});
			
			// Mock the download method
			download.download = jest.fn();
			
			// Call commsReceived with intercept action
			download.commsReceived(null, "intercept", {
				type: "csv",
				options: {delimiter: ","},
				active: true,
				intercept: true
			});
			
			// Check that download was called with the correct parameters
			expect(download.download).toHaveBeenCalledWith(
				"csv", "", {delimiter: ","}, true, true
			);
		});
	});
});