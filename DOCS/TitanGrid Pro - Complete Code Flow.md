# TitanGrid Pro — Complete Code Flow

This document describes the full data and rendering flow of TitanGrid Pro from initial component mount through to the final DOM output.

---

## 1. Component Initialisation Flow

### `TitanGrid.tsx` (Main Entry Point)

```
User loads a Mendix page containing the TitanGrid Pro widget
↓
TitanGrid functional component mounts
↓
useTableConfiguration() hook runs with dependency tracking on:
  - dataSourceCell, dataSourceRow, dataSourceColumn
  - referenceRow, referenceColumn
  - cellAttribute, headerAttribute, rowAttribute
  - showCellAs, showRowAs, showHeaderAs
  - enableRowAggregation, enableColumnAggregation
  - aggregation functions, labels, and positions
↓
Calls buildGridData(props) → returns { tableData, columns }
↓
Creates TitanTableEngine instance via createTitanTable()
```

---

## 2. Data Processing Flow

### `GridBuilder.ts` → `DataProcessor.ts`

```
buildGridData() called
↓
Step 1: DataProcessor.createMatrix(props)
├── Reads cellItems, rowItems, columnItems from Mendix data sources
├── Creates cellMatrix: Map<rowKey, Map<columnKey, cellItem>>
├── Creates uniqueRows and uniqueColumns sets
├── For each cellItem:
│   ├── Resolves associatedRow via referenceRow.get(cellItem)
│   ├── Extracts entityId using ValueStatus.Available check
│   ├── Finds matching row in rowItems array
│   ├── Repeats the same process for associatedColumn
│   ├── Falls back to index-based matching if associations are unavailable
│   └── Stores cellMatrix[rowKey][columnKey] = cellItem
├── Converts sets to sorted arrays (sortedRows, sortedColumns)
└── Returns { cellMatrix, sortedRows, sortedColumns, columnKeys }
```

---

## 3. Column Building Flow

### `GridBuilder.ts` — Column Definition Creation

```
Step 2: buildColumns(props, matrixData)
↓
Initialises columnHelper from TitanTableEngine and empty columnDefs array
↓
IF showRowAs !== "none":
├── createRowHeaderColumn(columnHelper, props)
│   ├── Cell renderer checks row.original._isAggregation
│   ├── If aggregation row: renders rowAggregationLabel with CSS classes
│   └── If regular row: delegates to ContentRenderer.renderContentWithWrapper()
└── Pushes to columnDefs
↓
FOR each columnItem in sortedColumns:
├── createDataColumn(columnHelper, props, columnItem, columnIndex, matrixData)
│   ├── header: delegates to buildColumnHeaderElement()
│   ├── cell:
│   │   ├── IF aggregation row: delegates to renderAggregationCellContent()
│   │   └── ELSE: resolves cellItem from matrix and delegates to buildDataCellElement()
│   └── accessorFn: returns string value for sorting/filtering
└── Pushes to columnDefs
↓
IF enableColumnAggregation:
├── createColumnAggregationColumn(columnHelper, props, matrixData)
│   ├── Header shows columnAggregationLabel
│   ├── Cell: IF aggregation row → calculateGrandTotal()
│   └── Cell: ELSE → calculateRowAggregation()
└── Pushes to columnDefs
↓
Returns complete columnDefs array
```

**Helper functions extracted from `createDataColumn`:**

| Function | Responsibility |
|---|---|
| `buildColumnHeaderElement()` | Renders the `<th>` content — custom widget or standard label |
| `buildCellClickHandler()` | Builds the click/double-click event handler for a cell |
| `renderAggregationCellContent()` | Renders a cell when it is in the aggregation totals row |
| `buildDataCellElement()` | Renders a standard data cell (custom widget or attribute) |

---

## 4. Table Data Building Flow

### `GridBuilder.ts` — Row Array Creation

```
Step 3: buildTableData(matrixData, props)
↓
Maps sortedRows to GridRowData objects:
├── id:            "row_{rowItem.id}"
├── rowItem:       the Mendix row entity object
├── _index:        zero-based visual row index
└── _isAggregation: undefined (regular rows)
↓
IF enableRowAggregation:
├── Creates the aggregation sentinel row:
│   ├── id:            "aggregation_row"
│   ├── rowItem:       null
│   └── _isAggregation: true
├── IF aggregationPosition === "top": unshift to beginning of array
└── ELSE: push to end of array
↓
Returns complete tableData array
```

---

## 5. Table Engine Integration Flow

### `TitanTableEngine.ts` — Custom Headless Table

```
buildGridData returns { tableData, columns }
↓
createTitanTable({
  data:    tableData,
  columns: columns,
  ...sorting, filtering, pagination options
})
↓
Returns a TitanTable instance with:
├── getHeaderGroups()       — for rendering <thead>
├── getFilteredRowModel()   — for live filtering + aggregation recalc
├── getPaginatedRowModel()  — for rendering the visible page of rows
├── Column resize state
└── Sort and filter state
```

---

## 6. Style Injection Flow

### `useTableStyles.ts` → `StyleGenerator.ts`

```
useTableStyles(props, gridId) hook runs
↓
useMemo computes full CSS string from four named generator functions:
├── generateGridStyles(props, gridId)       — base layout, themes, borders
├── generateAggregationStyles(props, gridId) — aggregation row/column styles
├── generateScrollbarStyles(gridId, props)  — webkit + Firefox scrollbar rules
└── generateInteractionStyles(props, gridId) — hover, focus, selection styles
↓
useEffect injects a <style id="style-{gridId}"> element into <head>
↓
On unmount: removes the <style> element to prevent style leaks
```

---

## 7. Rendering Flow

### `GridRenderer.tsx` — Component Tree

```
<GridRenderer table={table} props={props} />
↓
<div id={gridId} className="titan-grid-wrapper">
  <GridToolbar />         ← search, export buttons, column visibility toggle
  <div className="titan-grid-scroll-container">
    <table className="titan-grid">
      <thead>
        Maps table.getHeaderGroups() → <tr> → <th> (via column.columnDef.header)
      </thead>
      <tbody>
        Maps getPaginatedRowModel().rows
        ├── Checks row.original._isAggregation
        ├── Applies "aggregation-footer" class when true
        └── Maps row.getVisibleCells() → <td> (via cell.column.columnDef.cell)
      </tbody>
    </table>
  </div>
  <GridEmptyState />      ← shown when no rows match the current filter
  <GridContextMenu />     ← right-click context menu (export, print)
</div>
```

---

## 8. Aggregation Calculation Flow

### `AggregationProcessor.ts`

```
WHEN an aggregation cell renders:
↓
calculateColumnAggregation() OR calculateRowAggregation()
↓
Collects values from the matrix:
├── Column aggregation: iterates all rows for a specific column
├── Row aggregation:    iterates all columns for a specific row
├── Reads cellItem from cellMatrix[rowKey][columnKey]
├── Extracts value via props.cellAttribute.get(cellItem)
├── Handles Mendix value objects (displayValue / value)
└── Filters out null and undefined values
↓
AggregationProcessor.calculate(values, functionName)
├── Converts values to numbers
├── Selects function: sum / avg / count / min / max / first / last
└── Returns the calculated result
↓
AggregationProcessor.formatValue(result, formatString)
├── null / undefined results → "-"
├── Applies optional format string
└── Returns the formatted display string
```

---

## 9. Content Rendering Flow

### `ContentRenderer.ts`

```
ContentRenderer.renderContent(item, showAs, attribute, textTemplate, widgets)
↓
SWITCH showAs:
├── "attribute":
│   ├── attribute.get(item)
│   ├── Extracts displayValue || value || String(value)
│   └── Returns string
├── "dynamicText":
│   ├── textTemplate.get(item)
│   ├── Extracts value?.value || String(value)
│   └── Returns string
├── "custom":
│   ├── widgets.get(item)
│   └── Returns ReactElement
└── DEFAULT: returns ""
```

---

## 10. Re-render & Update Flow

### Dependency Change Handling

```
Mendix data source updates or widget property changes in Studio Pro
↓
TitanGrid functional component re-renders with new props
↓
useTableConfiguration useMemo dependencies trigger a rebuild:
├── Data source changes      → full matrix + column rebuild
├── Association changes      → full matrix + column rebuild
├── Content type changes     → column definition rebuild
├── Aggregation changes      → tableData rebuild (add/remove sentinel row)
└── Label / format changes   → aggregation cells re-render in place
↓
New TitanTable instance created
↓
React reconciles the DOM efficiently
```

---

## 11. Error Handling Flow

### Graceful Degradation

```
AT EACH PROCESSING STEP:
├── DataProcessor:      try/catch around association access — falls back to index-based matching
├── ContentRenderer:    try/catch around attribute access — falls back to empty string
├── AggregationProcessor: filters invalid/non-numeric values before calculation
├── ExcelExporter:      try/catch per cell — skips unparseable values
└── StyleGenerator:     always returns a valid CSS string — invalid values use safe defaults

Logger.warn() is emitted for:
├── Failed association lookups
├── Attribute access errors
├── Unsupported aggregation function names
└── Invalid or non-numeric cell values
```

---

## 12. Key Data Transformations Summary

| Step | Input | Output | Module |
|------|-------|--------|--------|
| 1 | Mendix entities | Cell matrix (`Map<rowKey, Map<colKey, cell>>`) | `DataProcessor` |
| 2 | Cell matrix + props | Column definitions (`ColumnDef[]`) | `GridBuilder` |
| 3 | Sorted row arrays | Table row data (`GridRowData[]`) | `GridBuilder` |
| 4 | Raw cell values | Aggregated results (string) | `AggregationProcessor` |
| 5 | Data + render config | React elements | `ContentRenderer` |
| 6 | Table instance | DOM `<table>` tree | `GridRenderer` |
| 7 | Props + gridId | Scoped CSS stylesheet | `StyleGenerator` |

### State Management Flow

```
Props Changes → useTableConfiguration → buildGridData → TitanTableEngine → Render
     ↑                                                                       ↓
     └────── User Interaction ←── DOM Events ←── Component Tree ←───────────┘
```

This modular architecture ensures **clean separation of concerns**, **easy testability**, **maintainable code**, and **efficient re-rendering** while supporting the complex matrix data relationships and aggregation functionality that TitanGrid Pro provides.
