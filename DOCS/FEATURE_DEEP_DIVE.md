# TitanGrid Pro — Feature Deep Dive

This document provides a comprehensive technical breakdown of every feature available in **TitanGrid Pro**.

---

## 1. Data Architecture & Matrix Logic

TitanGrid Pro is not a flat table — it is a **Matrix Renderer**. It takes a collection of Cell objects and places each one at the intersection of a Row and a Column, building a true pivot-style grid.

- **Association-Based Mapping**: The widget uses Mendix references to decide which cell belongs to which row/column. This is significantly faster than doing manual joins in microflows.
- **Fallback Indexing**: If associations are not provided, the widget can optionally fall back to index-based matching (Row 1, Column 1 → Cell 1), though association-based matching is recommended for reliability.
- **Custom Corner**: The top-left corner (where row and column headers meet) is fully customisable. You can show static text, dynamic text, or even a custom widget (such as a "Refresh" button).

---

## 2. Aggregation Engine (Totals & Summaries)

One of the grid's strongest features is its dual-axis aggregation engine.

- **Bidirectional Totals**: Show totals at the bottom (Row Aggregation) **and** on the right side (Column Aggregation) simultaneously.
- **Built-In Functions**: `Sum`, `Average`, `Count`, `Min`, `Max`, `First`, `Last`.
- **Multi-Attribute Mapping**: A powerful feature that allows you to aggregate multiple comma-separated attributes (e.g., `Total, Budget`) within a single cell or summary. The engine sums all valid attributes per row.
- **Value Extraction from Custom Widgets**: The grid is smart enough to extract numeric values even from Custom Widgets. If you place a text box inside a cell, the grid monitors the DOM and updates the totals as soon as the user finishes typing.
- **Grand Total**: When both row and column aggregations are enabled, the bottom-right cell automatically displays the "Grand Total".

---

## 3. Advanced Pinning (Sticky UI)

The grid supports independent pinning in all four directions:

- **Sticky Headers**: Keep your headers visible while scrolling vertically.
- **Multiple Pinning**: You can pin multiple rows or columns simultaneously (e.g., pin the first 2 columns).
- **Sticky Totals**: Pin the aggregation row/column so that even with hundreds of rows, the "Total" row always stays at the bottom of the visible viewport.

---

## 4. Runtime Management & UX

- **Column Reordering**: Users can drag and drop column headers to reorder them at runtime.
- **Column Hiding**: A built-in "Column Picker" allows users to toggle the visibility of specific columns to focus on what matters.
- **Global Search**: A fast search bar that filters the entire grid (rows, columns, and cells) in real-time.
- **Column Inline Filters**: Per-column filter popups for fine-grained filtering.
- **Tooltips**: Every cell, row header, and column header supports dynamic tooltips. You can use HTML for rich formatted tooltips.

---

## 5. Performance Optimisation

- **Custom Table Engine (`TitanTableEngine`)**: A bespoke in-house headless table engine replaces the `@tanstack/react-table` library. This results in zero third-party runtime dependencies and a significantly smaller bundle size.
- **Custom Row Virtualizer**: For datasets exceeding 500–1,000 rows, the grid only renders the rows currently visible in the viewport. The virtualizer is custom-built to replace `@tanstack/react-virtual`.
- **Jerk-Free Scrolling**: Dynamic height measurement (`measureElement`) and scroll-anchor suppression ensure that even with virtualization, the scrollbar and row positions remain perfectly stable without flickering.
- **Bidirectional Pagination**: Supports both **Row-Wise** and **Column-Wise** pagination. Column pagination allows you to cycle through horizontal data (like timelines) while keeping pinned columns (like row labels) perfectly static.
- **Overscan**: Configure "overscan" rows to ensure scrolling feels natural without white flashes at the edges.

---

## 6. Styling & Themes

- **Zero-Conflict CSS**: Styles are scoped to the specific widget instance using a unique `gridId` prefix, preventing them from leaking into the rest of your Mendix application.
- **Island UI Architecture**: The toolbar and pagination are designed as "floating cards", detached from the main grid for a premium, modern feel.
- **Dynamic CSS Variables**: The widget injects scoped CSS variables (e.g., `--dg-card-bg`, `--dg-text`) that automatically synchronise with the Mendix theme, providing adaptive support for Dark Mode and custom Mendix themes.
- **Dynamic CSS Classes**: Apply CSS classes to individual rows or cells based on Mendix expressions, enabling powerful conditional formatting.

---

## 7. Export & Reporting

- **Local Processing**: Exports are generated directly in the browser — much faster than server-side exports for large grids, with no round-trip to the Mendix server.
- **CSV Export**: One-click export of the current visible grid data as a UTF-8 encoded `.csv` file.
- **Excel Export (.xlsx)**: The Excel exporter is entirely custom-built (`ExcelExporter.ts`) — it replaces the `zipcelx` library and produces standard OOXML `.xlsx` files with no third-party dependencies. Basic column styling and the current sort/visibility state of the grid are honoured.
- **Print Optimisation**: A dedicated print mode strips away UI elements (buttons, scrollbars, pagination) to produce a clean, professional-looking printed document using `@media print` rules.
