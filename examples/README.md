# Tabulator Examples

A small, curated gallery of standalone HTML examples for [Tabulator](https://tabulator.info).
They serve two purposes:

1. **Learning** — copy-paste-friendly demos of escalating complexity, from a basic table
   up to a full-featured grid.
2. **Release validation** — a quick way for maintainers to smoke-test a freshly built
   library in a real browser before publishing.

## Important: these load the *locally built* library

Each example links the library from `../dist/`, **not** the npm package. You must build
the repo first:

```bash
# from the repo root
npm install      # first time only
npm run build    # generates dist/js/tabulator.js and dist/css/tabulator.css
```

Then open the gallery:

```bash
# simplest: just open the file in a browser
open examples/index.html        # macOS
xdg-open examples/index.html    # Linux

# or serve the folder with any static server
npx serve examples
```

The examples work straight off the `file://` protocol — no server required — because all
data is inline (no AJAX).

## The examples

| # | File | Demonstrates |
|---|------|--------------|
| 1 | `01-basic-table.html` | Array data, column definitions, fit-to-width layout, click-to-sort |
| 2 | `02-formatters.html` | Built-in formatters: progress, star, tickCross, money, color, link |
| 3 | `03-sorting-filtering.html` | Multi-column sort, header filters, programmatic filtering |
| 4 | `04-editing.html` | Inline editors (input, number, list, star, tickCross, date) + validators |
| 5 | `05-pagination.html` | Local pagination, page-size selector, row counter |
| 6 | `06-grouping-calculations.html` | Grouping by field, top/bottom column calculations |
| 7 | `07-selection.html` | Row selection with checkbox column and live readout |
| 8 | `08-frozen-responsive.html` | Frozen, movable, resizable and responsive-collapse columns |
| 9 | `09-tree-data.html` | Nested tree data (`_children`), expand/collapse, tree-wide totals |
| 10 | `10-full-demo.html` | Kitchen sink: editing, grouping, calcs, selection, add/delete, download, persistence |

## Dependencies

The examples are intentionally close to a real, dependency-free Tabulator deployment:

- **Tabulator** — loaded from your local `../dist/` build. Zero runtime dependencies.
- **[Bootstrap 5](https://getbootstrap.com)** — loaded from a CDN for page styling, paired
  with Tabulator's matching `tabulator_bootstrap5` theme (`../dist/css/tabulator_bootstrap5.css`)
  so the table and the page chrome share a consistent look. The Bootstrap CDN is the only
  external asset; Tabulator itself stays dependency-free.

Features that would require heavy third-party libraries (XLSX/PDF export, luxon-based date
handling) are deliberately omitted so the demos stay lightweight. The download example uses
Tabulator's built-in, dependency-free CSV / JSON / HTML downloaders.
