# TitanGrid Pro — Roadmap

Here is a comprehensive list of planned features for future versions of **TitanGrid Pro**, categorised by their impact on user experience and functionality.

> [!NOTE]
> Items listed here are planned and subject to change based on community feedback. To vote on or request a feature, open a [GitHub issue](https://github.com/deepakraj8298/TitanGridPro/issues).

---

### 📊 1. Data & Analytics

- **Multi-Row Aggregation** — Show multiple aggregation rows simultaneously (e.g., `Sum` **and** `Average` in the same footer).
- **Advanced Formatting Rules** — Conditional formatting / heatmaps where cell background intensity changes based on configurable value thresholds.
- **Server-Side Filtering & Sorting** — Push filter and sort parameters back to Mendix data sources for large-dataset performance without loading all data client-side.

---

### 🖱️ 2. Interactivity & UX

- **Single / Multi-Row Selection** — Allow users to select one or more rows, synchronised back to Mendix via an attribute or association.
- **Cell Editing Shortcut** — Quick-edit mode to update a cell value inline without opening a separate Mendix form.
- **Row / Column Expansion** — Accordion-style expandable rows for nested or detail-level data.
- **Keyboard Navigation** — Arrow-key cell navigation and Enter-to-edit support for accessibility and power users.

---

### 🏗️ 3. Advanced Layout & Performance

- **Row Grouping** — Group rows by a specific attribute (e.g., Region, Year) with collapsible group headers.
- **Dynamic Row Pinning** — Allow users to pin or unpin rows directly from the UI at runtime (not only via widget configuration).
- **Horizontal Virtualization** — Extend virtual scrolling to columns as well as rows for very wide datasets.

---

### 💾 4. Utility & Integration

- **State Persistence** — Save a user's column widths, sort order, and visibility preferences to the Mendix database so settings survive page refreshes.
- **Deep-Link / Bookmark State** — Encode the grid state (active filters, sort column, current page) in the URL for shareable views.
- **PDF Export** — Direct PDF generation of the grid with a print-optimised layout, without requiring the browser print dialog.

---

### 🎨 5. Styling & Visuals

- **Icon Support** — Integration with Mendix icons and FontAwesome directly within cell and header templates.
- **Progress Bars / Sparklines** — Built-in mini-chart components renderable inside cells without custom widgets.
- **Custom Tooltip Templates** — Use full Mendix widgets (not just static text) as rich interactive cell tooltips.
