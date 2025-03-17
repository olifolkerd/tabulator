# Tabulator Tests with Playwright

This directory contains tests for the Tabulator library using Playwright, a modern browser automation framework.

## Test Files

- `tabulator-test.js`: The main test file that tests basic Tabulator functionality.
  - Includes tests for table initialization, row manipulation, filtering, etc.
  - Uses a dynamically generated HTML file to test the library.

## Running Tests

To run the tests:

```bash
# Run all tests
npm test

# Run a specific test file
npx playwright test test/tabulator-test.js

# Run tests with UI (for debugging)
npm run test:ui
```

## Test Design

The tests use a self-contained approach where:

1. A temporary HTML file is created with Tabulator included
2. The test runs against this file in isolation
3. The file is cleaned up after tests complete

This approach avoids issues with web servers and ensures tests are reliable and consistent.

## Test Coverage

The tests cover the following core functionality:

- Table initialization
- Adding rows
- Filtering data
- Clearing filters
- Updating rows
- Deleting rows

## Future Improvements

Additional tests could be added for:
- Column operations
- Sorting (currently inconsistent in test environment)
- Other advanced features like tree data, grouping, etc.
