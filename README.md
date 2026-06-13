# TitanGrid Pro for Mendix

> **High-performance matrix data grid** for complex pivot-style data visualization. The only Mendix widget that natively joins three data sources into a dynamic, fully-featured grid with virtual scrolling, bidirectional pagination, and zero external dependencies.

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Mendix](https://img.shields.io/badge/Mendix-10%2B-blue)](https://www.mendix.com)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](CHANGELOG.md)
[![Download](https://img.shields.io/badge/Download-.mpk-brightgreen?logo=mendix)](https://github.com/deepakraj8298/TitanGridPro/raw/main/widget/deera.TitanGrid.mpk)

<p align="center">
  <img src="./assets/grid.gif" alt="TitanGrid Pro — live demo" width="100%" />
</p>

---

## 🌟 What Makes TitanGrid Pro Unique?

TitanGrid Pro is engineered to solve the most complex data visualization challenges in Mendix. It offers several **exclusive technologies** not found in other Marketplace widgets:

- **🔗 3-DataSource Matrix Joiner** — Natively joins three separate data sources (Cell, Row, Column) via associations in real-time. No OQL, no flat-table transformations, no expensive microflows.
- **📊 Zero-Configuration Widget Aggregation** — Automatically introspects custom Mendix widgets inside cells to extract and sum their values for totals/averages without any extra coding.
- **🧩 Universal Cell Injection** — Drop **any Mendix widget** (Buttons, Inputs, Reference Selectors) into cells, headers, and footers without sacrificing performance.
- **↔️ Bidirectional Pagination** — First-of-its-kind: choose **Row-Wise** or **Column-Wise** pagination to navigate massive timelines or wide matrices.
- **➕ Multi-Attribute Mapping** — Map multiple comma-separated attributes to a single cell summary. The engine sums them on-the-fly across different entities.
- **⚡ Pro-Grade Virtualization** — Custom-built dynamic row height measurement with scroll-anchor suppression — no "jumping" during fast scrolling.
- **📦 Zero External Dependencies** — The entire table engine, virtualizer, and Excel exporter are custom-built. Nothing from npm is bundled at runtime.

---

## 🚀 Key Features

| Category | Features |
|----------|---------|
| **Data** | Attribute, Dynamic Text, Custom Widget cell/header rendering |
| **Interactions** | Sorting, Global Search, Column Filters, Click Actions (Single/Double) |
| **Layout** | 5 Themes, Custom Palette, Flexible Sizing, Sticky Pinning |
| **Aggregations** | Sum, Avg, Count, Min, Max — Row & Column, Custom logic |
| **Performance** | Virtual Scrolling, Bidirectional Pagination |
| **Export** | CSV & Excel (.xlsx) export, Print mode |
| **Mobile** | Responsive card layout with configurable breakpoints |
| **Reordering** | Drag-drop column reorder, Column hide/show, Column resize |

---

## 📋 Typical Usage Scenario

### Scenario 1: Sales Matrix (Most Common)
Display a pivot-table of monthly sales per product:

1. **Domain Model** — Create three entities:
   - `Product` (Row) — Name: String
   - `Month` (Column) — Title: String, SortOrder: Integer
   - `SalesValue` (Cell) — Amount: Decimal, with references to `Product` and `Month`
2. **Widget Setup** — Drop TitanGrid Pro on a page
3. **Data & Logic tab**:
   - Cell Data Source → XPath on `SalesValue`
   - Row Data Source → XPath on `Product`
   - Column Data Source → XPath on `Month` (sorted by SortOrder)
   - Row Association → `SalesValue_Product`
   - Column Association → `SalesValue_Month`
   - Display As → `Attribute` → select `Amount`
4. **Advanced tab** — Enable Row Aggregation → Sum → Label "Total"
5. **Advanced tab** — Set Sticky Left Columns: `1` to freeze row headers

**Result**: A dynamic sales matrix where rows = Products, columns = Months, and cells = sales amounts — with automatic column totals and sticky product names.

### Scenario 2: Budget vs. Actual Grid
Map multiple attributes per cell (Budget, Actual, Variance) using Multi-Attribute Mapping in the Aggregation section.

### Scenario 3: Inline Editing Grid
Set Display As → `Custom (Widgets)` and drop a Mendix Text Box into the Cell Widgets slot. The grid automatically tracks changes.

---

## ⬇️ Download

| File | Size | Link |
|------|------|------|
| `deera.TitanGrid.mpk` | ~75 KB | [**⬇ Download v1.0.0**](https://github.com/deepakraj8298/TitanGridPro/raw/main/widget/deera.TitanGrid.mpk) |

> Import the `.mpk` into Mendix Studio Pro via **App** → **Import Module Package**.

---

## 📦 Quick Start

1. **Download** — [deera.TitanGrid.mpk](https://github.com/deepakraj8298/TitanGridPro/raw/main/widget/deera.TitanGrid.mpk) and import into Studio Pro via **App** → **Import Module Package**
2. **Domain Model** — Create three entities: Row, Column, Cell (Cell must have references to both Row and Column)
3. **Drop** the widget on a page and configure the three data sources
4. **Set Associations** — Map `referenceRow` and `referenceColumn` to your entity references
5. **Run** your app

---

## 📖 Documentation

| Guide | Description |
|-------|-------------|
| 📘 [Setup Guide](./DOCS/SETUP_GUIDE.md) | Step-by-step walkthrough for first-time users |
| 📙 [Feature Guide](./DOCS/FEATURES.md) | Detailed breakdown of all widget properties |
| 🔬 [Feature Deep Dive](./DOCS/FEATURE_DEEP_DIVE.md) | Technical details on virtualization, aggregations |
| 📱 [Mobile Test Guide](./DOCS/MOBILE_TEST_GUIDE.md) | How to test the widget on phone and tablet |
| 🚀 [Roadmap](./DOCS/ROADMAP.md) | Planned future features |
| 📋 [Changelog](./CHANGELOG.md) | Version history and release notes |

---

## ⚠️ Known Limitations

- **Mendix Version** — Requires Mendix **10.0 or higher** (Pluggable Widget API v3+)
- **Platform** — Web only. Native mobile (iOS/Android) is not supported.
- **Cell Count** — For very large datasets (>10,000 cells), enable **Row Virtualization** and **Pagination** to maintain performance. Rendering all cells at once without these features may cause slowdowns.
- **Offline** — While `offlineCapable="true"` is set in the widget definition, full offline functionality depends on the Mendix offline profile configuration and data source constraints.
- **Column Aggregation with Custom Widgets** — When using `Custom (Widgets)` display mode, the **Attribute Mapping** field must be set for aggregations to work correctly, as the engine cannot automatically detect numeric values from arbitrary widget trees in all cases.
- **Column Resizing on Touch** — Drag-to-resize handles are not touch-friendly. Use `columnWidthMode = auto` on mobile pages.

---

## 📦 Dependencies

**Runtime dependencies: None.**

TitanGrid Pro has zero external npm dependencies bundled at runtime. All functionality — including the table engine, row virtualizer, and Excel (.xlsx) exporter — is implemented from scratch. This results in a minimal bundle footprint.

**Peer dependencies** (provided by Mendix, not bundled):
- `react` ^18.2.0
- `react-dom` ^18.2.0

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server (live-reload against a running Mendix app)
npm run dev

# Build for development (no minification)
npm run build

# Lint and format check
npm run lint

# Auto-fix lint and formatting issues
npm run lint:fix

# Create release package (.mpk) — runs lint first
npm run release
```

The release package is generated at `dist/1.0.0/deera.TitanGrid.mpk`.

---

## 🐛 Support & Issues

- **Bug Reports** — [Open an issue on GitHub](https://github.com/deepakraj8298/TitanGridPro/issues)
- **Questions** — Use the [Mendix Community Forum](https://community.mendix.com/)
- **Feature Requests** — See the [Roadmap](./DOCS/ROADMAP.md) and open a GitHub issue

---

## 📄 License

Licensed under the [Apache License 2.0](./LICENSE).

© Deepak 2026. All rights reserved.

---

*Created with ❤️ for the Mendix Community.*
