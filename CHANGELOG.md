# Changelog

All notable changes to **TitanGrid Pro** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-06-13

### 🎉 Initial Public Release

This is the first public release of **TitanGrid Pro** — a high-performance matrix data grid for Mendix.

---

### Added

#### Core Architecture
- **3-DataSource Matrix Joiner** — Natively joins three separate Mendix data sources (Cell, Row, Column) via associations in real-time without OQL or flat-table transformations
- **Custom Zero-Dependency Table Engine** (`TitanTableEngine`) — Bespoke in-house table engine replacing `@tanstack/react-table`, resulting in a significantly smaller runtime bundle and zero third-party dependencies
- **Custom Row Virtualizer** — Built-in dynamic-height virtualizer replacing `@tanstack/react-virtual`, with scroll-anchor suppression to prevent row-position flickering during fast scrolling
- **Custom Excel Exporter** (`ExcelExporter`) — Lightweight in-house `.xlsx` generation replacing `zipcelx`, with no third-party library bundled at runtime

#### Data Display
- **Flexible Cell Rendering** — Support for Attribute, Dynamic Text, and Custom Widget rendering modes
- **Flexible Row & Column Header Rendering** — Attribute, Dynamic Text, Custom Widget, and "First Row as Header" modes
- **Corner Cell** — Configurable top-left cell with Dynamic Text or Custom Widget content
- **Tooltip Support** — Default and custom HTML tooltips for cells, rows, and columns

#### Interactions
- **Click Actions** — Single and double-click triggers for Cell, Row, Row Header, Column, and Column Header
- **Sorting** — Multi-column ascending/descending sort on column headers
- **Global Search** — Real-time search bar filtering across all data
- **Column Inline Filters** — Per-column filter popup with text and dropdown modes
- **Column Reordering** — Drag-and-drop column reordering at runtime
- **Column Visibility Toggle** — Show/hide columns via toolbar panel
- **Column Resizing** — Drag-to-resize column borders

#### Aggregations
- **Row Aggregation** — Sum, Average, Count, Min, Max, First, Last with configurable position (top/bottom)
- **Column Aggregation** — Same functions with configurable position (left/right)
- **Grand Total** — Automatic grand-total cell when both row and column aggregation are enabled
- **Custom Aggregation** — Trigger a Mendix microflow for complex business logic
- **Custom Aggregation Content** — Render any Mendix widgets inside summary cells
- **Multi-Attribute Mapping** — Comma-separated attribute names for aggregating multiple fields per cell
- **Zero-Configuration Widget Aggregation** — Automatically introspects custom widgets to extract numeric values

#### Layout & Pinning
- **Sticky Row/Column Pinning** — Pin N rows to top/bottom, N columns to left/right
- **Sticky Totals** — Optionally stick the aggregation row or column so it is always in view
- **5 Visual Themes** — Alpine, Material, Bootstrap, Dark, Minimal
- **Custom Color Palette** — Override header, even/odd row, hover, and border colors
- **Typography** — Adjustable font sizes (10/12/14/16px) and header font weight
- **Border Styles** — All, Horizontal, Vertical, or No borders; Solid, Dashed, or Dotted lines
- **Alternating Row Colors** and **Row Hover** effects
- **Configurable Scrollbars** — Modern, Minimal, Classic, Hidden styles; Thin, Normal, Thick thickness
- **Flexible Sizing** — Width/Height with Min/Max constraints (%, px, vh, vw)
- **Column Width Modes** — Auto, Resizable, Manual, Equal Width
- **Row Height Modes** — Auto, Compact (24px), Comfortable (32px), Spacious (40px), Manual

#### Performance
- **Row Virtualization** — Custom virtualizer for smooth rendering of 1,000+ rows with dynamic height measurement and scroll-anchor suppression
- **Bidirectional Pagination** — Row-Wise or Column-Wise pagination for large datasets
- **Configurable Overscan** — Control the number of off-screen rows pre-rendered for smoother scrolling

#### Export & Reporting
- **CSV Export** — One-click export of visible grid data as a `.csv` file
- **Excel Export (.xlsx)** — Native zero-dependency XLSX generation
- **Export Placement** — Toolbar button, right-click context menu, or both
- **Dynamic Export Filenames** — Set filenames via Mendix expressions
- **Print** — Grid-optimized print mode accessible via toolbar or right-click menu

#### Mobile
- **Responsive Card View** — Automatic switch to card-based layout on small screens
- **Configurable Breakpoints** — 480px / 768px / 1024px presets or manual pixel value
- **Mobile Grid Height** — Dedicated height setting for mobile viewports

---

### Technical Notes
- Zero runtime npm dependencies — all table engine, virtualizer, and XLSX logic is custom-built
- Full TypeScript with strict mode enabled
- Mendix Pluggable Widget API v3+ compliant (requires Mendix 10.0+)
- All functions follow lowerCamelCase naming convention with JSDoc documentation
- Functions limited to ≤ 200 lines, each with a single responsibility
- CSS scoped per widget instance — zero style leakage into the host Mendix application
- Apache 2.0 licensed
