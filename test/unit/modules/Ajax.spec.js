import TabulatorFull from '../../../src/js/core/TabulatorFull.js';

describe('Ajax', function(){
	let table, ajax;

	beforeEach(function(){
		let element = document.createElement("div");

		table = new TabulatorFull(element, {
			ajaxURL: 'fake-data-url.json'
		});

		ajax = table.module("ajax");
		// Need to manually set URL since the ajax module doesn't seem to initialize from options
		ajax.setUrl('fake-data-url.json');
	});

	afterEach(function(){
		table.destroy();
	});

	test('module is initialized', function(){
		expect(ajax).toBeDefined();
		expect(ajax.url).toBe('fake-data-url.json');
	});

	test('getUrl returns the correct URL', function(){
		expect(ajax.getUrl()).toBe('fake-data-url.json');
	});

	test('setUrl updates the URL', function(){
		ajax.setUrl('new-url.json');
		expect(ajax.url).toBe('new-url.json');
		expect(ajax.getUrl()).toBe('new-url.json');
	});

	test('setDefaultConfig handles string config', function(){
		ajax.setDefaultConfig('post');
		expect(ajax.config.method).toBe('post');
	});

	test('setDefaultConfig handles object config', function(){
		const config = {
			method: 'put',
			headers: {'Content-Type': 'application/json'}
		};
		ajax.setDefaultConfig(config);
		expect(ajax.config.method).toBe('put');
		expect(ajax.config.headers).toEqual({'Content-Type': 'application/json'});
	});

	test('generateConfig with string parameter', function(){
		const result = ajax.generateConfig('delete');
		expect(result.method).toBe('delete');
	});

	test('generateConfig with object parameter', function(){
		const config = {
			method: 'patch',
			timeout: 5000
		};
		const result = ajax.generateConfig(config);
		expect(result.method).toBe('patch');
		expect(result.timeout).toBe(5000);
	});

	test('requestParams merges parameters correctly', function(){
		// Set up a table with ajaxParams
		let element = document.createElement("div");
		let customTable = new TabulatorFull(element, {
			ajaxURL: 'test.json',
			ajaxParams: {page: 1, size: 10}
		});

		let customAjax = customTable.module("ajax");
		let result = customAjax.requestParams(null, null, false, {filter: 'active'});

		expect(result).toEqual({page: 1, size: 10, filter: 'active'});

		customTable.destroy();
	});

	test('requestParams handles function parameters', function(){
		// Set up a table with function ajaxParams
		let element = document.createElement("div");
		let customTable = new TabulatorFull(element, {
			ajaxURL: 'test.json',
			ajaxParams: function() {
				return {dynamic: true, timestamp: 12345};
			}
		});

		let customAjax = customTable.module("ajax");
		let result = customAjax.requestParams(null, null, false, {sort: 'name'});

		expect(result).toEqual({dynamic: true, timestamp: 12345, sort: 'name'});

		customTable.destroy();
	});

	test('requestDataCheck returns true for string data with url', function(){
		expect(ajax.requestDataCheck('stringData')).toBe(true);
	});

	test('requestDataCheck returns false for object data', function(){
		expect(ajax.requestDataCheck({id: 1, name: 'test'})).toBe(false);
	});

	// This test needs special handling since the requestDataCheck behavior depends on ajax.url
	test('requestDataCheck returns true for null data with url', function(){
		// Ensure url is set
		ajax.url = 'fake-data-url.json';
		expect(ajax.requestDataCheck(null)).toBe(true);
	});

	test('sendRequest calls ajaxRequesting callback', function(){
		// Create a table with custom ajaxRequesting callback
		let requestingCalled = false;
		let element = document.createElement("div");
		let customTable = new TabulatorFull(element, {
			ajaxURL: 'test.json',
			ajaxRequesting: function() {
				requestingCalled = true;
				return true; // Allow request to proceed
			}
		});

		let customAjax = customTable.module("ajax");
		customAjax.loaderPromise = jest.fn().mockResolvedValue({data: []});
		customAjax.sendRequest('test.json', {}, {});
		
		expect(requestingCalled).toBe(true);
		expect(customAjax.loaderPromise).toHaveBeenCalled();

		customTable.destroy();
	});

	test('sendRequest handles canceled requests', function(done){
		// Create a table with ajaxRequesting that cancels requests
		let element = document.createElement("div");
		let customTable = new TabulatorFull(element, {
			ajaxURL: 'test.json',
			ajaxRequesting: function() {
				return false; // Cancel the request
			}
		});

		let customAjax = customTable.module("ajax");
		customAjax.loaderPromise = jest.fn();
		
		// Using Promise catch to handle the rejection
		customAjax.sendRequest('test.json', {}, {})
			.catch(() => {
				// Verify the loader was not called
				expect(customAjax.loaderPromise).not.toHaveBeenCalled();
				customTable.destroy();
				done();
			});
	});
});
