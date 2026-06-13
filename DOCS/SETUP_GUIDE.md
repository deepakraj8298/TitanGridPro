# TitanGrid Pro — Step-by-Step Setup Guide

This guide walks you through setting up the **TitanGrid Pro** widget in your Mendix application from scratch, from domain model design to first run.

---

## 🏗️ Phase 1: Domain Model Setup

TitanGrid Pro requires a specific entity structure to function correctly. You need **three entities**:

1. **Row Entity** (e.g., `Product`) — Represents your vertical axis (one row per object).
2. **Column Entity** (e.g., `Month`) — Represents your horizontal axis (one column per object).
3. **Cell Entity** (e.g., `SalesValue`) — Represents the data point at each intersection.

### Required Associations

Each Cell entity must reference both its parent Row and its parent Column:

- `SalesValue` ➡️ `Product` — Many-to-One (Reference)
- `SalesValue` ➡️ `Month` — Many-to-One (Reference)

> [!IMPORTANT]
> Both associations are **required**. Without them, the widget cannot map cells to their correct row/column positions. Association-based mapping is faster and more reliable than index-based fallback.

---

## ⚙️ Phase 2: Widget Configuration

### Tab 1 — Data & Logic

- **Cell Data Source** — Select an XPath or Database source for your `SalesValue` entity.
- **Display As**:
  - `Attribute` — Select the decimal or string attribute to show in each cell.
  - `Dynamic Text` — Use a Mendix text template for formatted display.
  - `Custom (Widgets)` — A widget drop zone appears in each cell; place any Mendix widget there.
- **Row Data Source** — Select the data source for your `Product` entity.
- **Column Data Source** — Select the data source for your `Month` entity.
- **Row Association** — Map the `referenceRow` property to `SalesValue_Product`.
- **Column Association** — Map the `referenceColumn` property to `SalesValue_Month`.

### Tab 2 — Look & Feel

- **Grid Theme** — Start with `Alpine (Clean)` for a modern, neutral look.
- **Grid Height** — Set a fixed height (e.g., `500px`) so that scrollbars appear correctly and the grid doesn't stretch the page.
- **Column Width Mode**:
  - `Resizable` — Users can drag column borders to adjust widths at runtime.
  - `Auto` — The grid calculates widths based on content.

### Tab 3 — Advanced Grid Tools

- **Sticky Pinning**:
  - **Sticky Left Columns** — Set to `1` to keep your row headers visible while scrolling horizontally.
  - **Sticky Top Rows** — Set to `1` to keep your column headers visible while scrolling vertically.
- **Aggregation (Totals)**:
  - Enable **Row Aggregation** to see totals at the bottom of the grid.
  - Set **Row Function** to `Sum` or `Average`.

> [!IMPORTANT]
> If you are using **Custom Widgets** in your cells but want built-in aggregation to work, you **must** set the **Attribute Mapping** field to the name of the numeric attribute in your Cell entity. The engine cannot automatically detect numeric values from arbitrary widget trees without this hint.

---

## 🛠️ Phase 3: Advanced Usage Scenarios

### Scenario A: Inline Editing

To enable editing directly within the grid cells:

1. Set **Display As** to `Custom (Widgets)`.
2. In the **Cell Widgets** drop zone, place a Mendix **Text Box** or **Number Input**.
3. Map the input to the correct attribute of the Cell data source.
4. The grid automatically detects DOM-level changes and refreshes aggregation totals in real-time.

### Scenario B: Conditional Cell Styling

To highlight specific cells based on their value:

1. Go to the **Cell Class** property (in the Data & Logic tab).
2. Use a Mendix expression: `if $currentObject/Value > 1000 then 'high-value' else 'normal-value'`
3. Define the CSS classes in your app's custom CSS file (or a Mendix theme module).

### Scenario C: Interactive Column Headers

To place a button or action directly inside a column header:

1. Set **Column Header** to `Custom Content`.
2. Place a **Button** or **Action Button** in the **Header Widgets** drop zone.
3. Users can now trigger Mendix actions directly from the column header.

---

## 💡 Top Tips for Success

| Topic | Recommendation |
|-------|----------------|
| **Pagination** | Use `Row Wise` for standard large lists; use `Column Wise` if you have many columns (e.g., 52 weeks). Set **Per Page** to `20`–`50` for best performance. |
| **Virtualization** | Enable **Row Virtualization** when you have more than 500 rows to maintain smooth scrolling. |
| **Mobile** | The grid automatically switches to a **Card View** on small screens. Adjust **Mobile Breakpoint** to control when this transition occurs. See the [Mobile Test Guide](./MOBILE_TEST_GUIDE.md) for how to test this. |
| **Aggregation** | Always set **Attribute Mapping** when using Custom Widget cells with aggregation enabled. |
| **Performance** | Keep data sources constrained with XPath constraints wherever possible to limit the total number of objects loaded. |
