// Set up global mocks needed for testing
class Scriptly {
  constructor(id) {
    this.id = id;
  }
  
  runInThisContext(code) {
    // Simple eval wrapper for testing
    try {
      eval(code);
    } catch (e) {
      console.error("Error executing script:", e);
    }
  }
}

// Add the Scriptly constructor to the JSDOM window constructor
global.window = global.window || {};
global.window.constructor = global.window.constructor || {};
global.window.constructor.Scriptly = Scriptly;