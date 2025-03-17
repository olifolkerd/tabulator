# Tabulator Development Guide

## Build Commands
- Build: `npm run build`
- Lint: `npm run lint`
- Development with watch:
  - All: `npm run dev`
  - CSS: `npm run dev:css`
  - ESM: `npm run dev:esm`
  - UMD: `npm run dev:umd`
  - Wrappers: `npm run dev:wrappers`

## Testing
- Run all tests: `npm test` (Runs Playwright tests in headless mode)
- Run browser tests manually: `npm run test:browser` (Serves test page)
- Run tests with UI: `npm run test:ui` (Opens Playwright UI for debugging)
- Debug specific test: `npm run test:debug` (Runs with debugger)
- Run single test: `npm run test:single "test name"` (Run specific test by name)

## Code Style Guidelines
- Indentation: Tabs (not spaces)
- Semicolons: Required at end of statements
- Variable declarations: Can be unindented within blocks
- Unused variables: Allowed for function parameters only
- Switch statements: Case statements indented 1 level, fallthrough allowed
- Library globals: Use predefined globals (luxon, XLSX, jspdf)
- Module format: ES modules with `export` statements
- Naming convention: camelCase for variables/methods, PascalCase for classes
- Error handling: Empty catch blocks allowed when appropriate

Code is organized in a modular structure with core functionality separated from optional modules. Follow existing patterns when adding new features or making changes.