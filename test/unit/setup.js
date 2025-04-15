/**
 * JSDOM test setup helpers
 * 
 * This file provides helper functions for common DOM element mocking
 * needs in Tabulator tests.
 */

// Create an element with automatic spy functions on common methods
global.createSpyElement = (tagName) => {
  const element = document.createElement(tagName);
  
  // Add spies to common DOM methods
  element.appendChild = jest.fn().mockImplementation(element.appendChild);
  element.addEventListener = jest.fn().mockImplementation(element.addEventListener);
  element.classList.add = jest.fn().mockImplementation(element.classList.add);
  element.classList.remove = jest.fn().mockImplementation(element.classList.remove);
  
  return element;
};

// Helper method to create mock events with required properties
global.createMockEvent = (type, props = {}) => {
  // Create appropriate event type
  let event;
  
  if (type === 'click' || type === 'mousedown' || type === 'mouseup') {
    event = new MouseEvent(type, { bubbles: true, cancelable: true, ...props });
  } else {
    event = new Event(type, { bubbles: true, cancelable: true, ...props });
  }
  
  // Add any additional properties
  Object.entries(props).forEach(([key, value]) => {
    if (!event[key]) {
      event[key] = value;
    }
  });
  
  // Add spy on preventDefault
  const originalPreventDefault = event.preventDefault;
  event.preventDefault = jest.fn().mockImplementation(() => originalPreventDefault.call(event));
  
  return event;
};

// Helper for column creation
global.createMockColumn = (definition = {}) => {
  return {
    definition,
    titleElement: {
      insertBefore: jest.fn(),
      firstChild: {}
    },
    getComponent: jest.fn().mockReturnValue({ column: true })
  };
};