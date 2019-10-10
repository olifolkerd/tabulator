var Tabulator = require('../dist/js/tabulator');

describe('column-manager', function() {
  test('should be defined', () => {
      const element =  document.createElement('div');
      const instance = new Tabulator(element);
      expect(instance.columnManager).toBeDefined();
  });


  test('should create headers', () => {
    const element =  document.createElement('div');
    
    new Tabulator(element);

    expect(element.children.length).not.toBe(0);
    
    const header = element.children[0];
    expect(header.classList).toContain("tabulator-header")
});

});