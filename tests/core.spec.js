var Tabulator = require('../dist/js/tabulator');

describe('Core', function() {
    test('should define Tabulator', () => {
        var element =  document.createElement('div');
        var instance = new Tabulator(element);
        expect(instance).toBeDefined();
    });
});