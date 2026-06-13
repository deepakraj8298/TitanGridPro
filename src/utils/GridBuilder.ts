/**
 * @file GridBuilder.ts
 * @description Constructs TitanTableEngine column definitions and row data arrays from the
 * Mendix data matrix produced by DataProcessor. Each function in this module has a single
 * responsibility:
 *   - `buildGridData`                   — entry point: assembles columns + rows
 *   - `buildColumns`                    — orchestrates column creation
 *   - `createRowHeaderColumn`           — creates the first "row label" column
 *   - `createDataColumn`                — creates a single data cell column
 *   - `createColumnAggregationColumn`   — creates the totals column
 *   - `buildColumnHeaderElement`        — renders the column `<th>` header content
 *   - `buildCellClickHandler`           — creates the click/double-click event handler for a cell
 *   - `renderAggregationCellContent`    — renders a cell when it is in the aggregation row
 *   - `buildDataCellElement`            — renders a normal data cell
 */

import { createColumnHelper, ColumnDef } from "../engine/TitanTableEngine";
import { createElement, ReactElement } from "react";
import { TitanGridContainerProps } from "../../typings/TitanGridProps";
import { DataProcessor, GridMatrixData } from "./DataProcessor";
import { ContentRenderer } from "./ContentRenderer";
import { AggregationProcessor } from "./AggregationProcessor";
import { EventHandler } from "./EventHandler";
import { CellWrapper } from "../hooks/CellWrapper";
import { Logger } from "./Logger";

/** Represents a single grid row passed to the TitanTableEngine data array. */
export interface GridRowData {
    /** Unique string id used by the engine for pinning, selection, and re-renders. */
    id: string;
    /** The original Mendix object for this row. */
    rowItem: any;
    /** Zero-based visual row index (used for row number rendering). */
    _index: number;
    /** True only for the built-in aggregation totals sentinel row. */
    _isAggregation?: boolean;
}

/**
 * Main entry point — assembles the column definitions and flat row data array
 * required by `useTableConfiguration` to create the TitanTableEngine instance.
 *
 * @param props      - All TitanGrid widget properties from Studio Pro.
 * @param matrixData - Pre-built matrix; if omitted, one is created from props.
 * @returns An object containing `tableData` (rows) and `columns` (defs).
 */
export function buildGridData(props: TitanGridContainerProps, matrixData?: GridMatrixData) {
    if (!matrixData) {
        matrixData = DataProcessor.createMatrix(props);
    }
    const columns = buildColumns(props, matrixData);
    const tableData = buildTableData(matrixData, props);
    return { tableData, columns };
}

/**
 * Returns true when the row aggregation is configured to use a custom Mendix content widget
 * rather than the built-in sum/average/count calculation.
 *
 * @param props - Widget configuration properties.
 */
export function shouldRenderCustomFooter(props: TitanGridContainerProps): boolean {
    return props.enableRowAggregation === true && props.rowAggregationType === "custom";
}

/**
 * Renders the custom footer content widget configured by the user in Studio Pro.
 * Falls back to a placeholder `<div>` when no content is configured, and to an
 * error `<div>` if rendering throws.
 *
 * @param props - Widget configuration properties.
 * @returns A ReactElement representing the custom footer content.
 */
export function renderCustomFooterContent(props: TitanGridContainerProps): ReactElement {
    try {
        if (!props.rowCustomAggregationContent) {
            return createElement(
                "div",
                { className: "custom-footer-placeholder" },
                props.rowAggregationLabel || "Custom Aggregation Footer"
            );
        }

        if (props.rowCustomAggregation && props.rowCustomAggregation.canExecute) {
            Logger.debug("Custom row aggregation microflow available in footer");
        }

        return createElement("div", { className: "custom-footer-content" }, props.rowCustomAggregationContent);
    } catch (renderError) {
        Logger.warn("Error rendering custom footer content", renderError);
        return createElement("div", { className: "custom-footer-error" }, "Error loading custom content");
    }
}

/**
 * Returns true when column aggregation uses a custom Mendix widget instead of
 * the built-in numeric aggregation.
 *
 * @param props - Widget configuration properties.
 */
export function shouldRenderCustomColumn(props: TitanGridContainerProps): boolean {
    return props.enableColumnAggregation === true && props.columnAggregationType === "custom";
}

export function renderCustomColumnContent(props: TitanGridContainerProps, _rowIndex?: number): ReactElement {
    try {
        if (!props.columnCustomAggregationContent) {
            return createElement(
                "div",
                {
                    className: "custom-column-placeholder"
                },
                props.columnAggregationLabel || "Custom Column"
            );
        }

        if (props.columnCustomAggregation && props.columnCustomAggregation.canExecute) {
            Logger.debug("Custom column aggregation microflow available");
        }

        return createElement(
            "div",
            {
                className: "custom-column-content"
            },
            props.columnCustomAggregationContent
        );
    } catch (error) {
        Logger.warn("Error rendering custom column content", error);
        return createElement(
            "div",
            {
                className: "custom-column-error"
            },
            "Error"
        );
    }
}

/**
 * Orchestrates column definition creation.
 * Builds the row header column first (if configured), then one data column per
 * matrix column, then the optional aggregation totals column.
 *
 * @param props      - Widget configuration properties.
 * @param matrixData - The grid matrix produced by DataProcessor.
 * @returns An array of TitanTableEngine column definitions.
 */
function buildColumns(props: TitanGridContainerProps, matrixData: GridMatrixData): Array<ColumnDef<any>> {
    const columnHelper = createColumnHelper<any>();
    const columnDefs: Array<ColumnDef<any>> = [];

    // Prepend a row header column when the widget is configured to show row labels
    if (props.showRowAs !== "none") {
        columnDefs.push(createRowHeaderColumn(columnHelper, props));
    }

    // Create one data column per column item from the matrix
    matrixData.sortedColumns.forEach((columnItem, columnIndex) => {
        columnDefs.push(createDataColumn(columnHelper, props, columnItem, columnIndex, matrixData));
    });

    // Append the aggregation totals column when column aggregation is enabled
    if (props.enableColumnAggregation) {
        columnDefs.push(createColumnAggregationColumn(columnHelper, props, matrixData));
    }

    return columnDefs;
}

function createRowHeaderColumn(columnHelper: any, props: TitanGridContainerProps) {
    return columnHelper.display({
        id: "row_header",
        header: () => {
            const headerTitle = getRowHeaderTitle(props);

            if (props.showRowColumnNameAs === "custom" && props.rowColumnNameWidgets) {
                return createElement("div", { className: "row-header-custom" }, headerTitle);
            }

            return createElement("div", { className: "row-header-text", title: headerTitle }, headerTitle);
        },
        cell: ({ row }: any) => {
            const rowTitle = props.rowAggregationLabel;
            if (row.original?._isAggregation) {
                return createElement(
                    "div",
                    {
                        className: "cell-data row-header aggregation-label",
                        title: rowTitle
                    },
                    createElement(
                        "div",
                        { className: "aggregation-value" },
                        createElement("span", { className: "agg-label" }, ""),
                        createElement("span", { className: "agg-value" }, rowTitle || "Total")
                    )
                );
            }

            const rowItem = row.original?.rowItem;
            if (!rowItem) {
                return "";
            }

            const additionalProps: any = {};
            if (props.onClickRow && props.showRowAs !== "custom") {
                additionalProps.onClick = (e: any) => {
                    e.preventDefault();
                    e.stopPropagation();

                    EventHandler.handleClick(
                        `row-${row.original?._index}`,
                        props.onClickRow,
                        rowItem,
                        props.onClickTrigger || "single"
                    );
                };
                additionalProps.style = { cursor: "pointer" };
            }

            return (
                ContentRenderer.renderContentWithWrapper(
                    rowItem,
                    props.showRowAs,
                    props.rowAttribute,
                    props.rowTextTemplate,
                    props.rowWidgets,
                    {
                        tag: "div",
                        className: "cell-data row-header",
                        tooltip: props.tooltipRow,
                        tooltipType: (props as any).tooltipRowType,
                        tooltipCustom: (props as any).tooltipRowCustom,
                        dynamicClass: props.rowClass,
                        additionalProps
                    }
                ) ||
                createElement("div", { className: "cell-data row-header" }, `Row ${(row.original?._index ?? 0) + 1}`)
            );
        },
        accessorFn: (row: GridRowData) => {
            if (row._isAggregation || !row.rowItem) {
                return null;
            }
            if (props.showRowAs === "custom") {
                return "";
            }
            const content = ContentRenderer.renderContent(
                row.rowItem,
                props.showRowAs,
                props.rowAttribute,
                props.rowTextTemplate,
                props.rowWidgets
            );
            return typeof content === "string" ? content : "";
        },
        enableSorting: (props as any).enableSorting ?? false,
        enableColumnFilter: (props as any).enableColumnFilter ?? false,
        enableGlobalFilter: true,
        filterFn: (row: any, _columnId: string, filterValue: string) => {
            if (row.id === "aggregation_row") {
                return true;
            }
            const value = row.getValue(_columnId);
            return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
        },
        enableResizing: props.columnWidthMode === "resizable",
        size: 150,
        meta: {
            displayName: getRowHeaderTitle(props) || "Row Header"
        }
    });
}

/**
 * Renders the `<th>` header element for a data column.
 * When `showHeaderAs === "custom"`, renders the widget-configured custom content.
 * Otherwise, renders a standard text label with an optional column-header click handler.
 *
 * @param columnItem  - The Mendix column object for this column.
 * @param columnKey   - The unique string key for this column.
 * @param columnIndex - Zero-based visual index of this column.
 * @param props       - Widget configuration properties.
 * @returns A ReactElement for the column header cell.
 */
function buildColumnHeaderElement(
    columnItem: any,
    columnKey: string,
    columnIndex: number,
    props: TitanGridContainerProps
): ReactElement {
    // Custom header — render the Studio Pro–configured widget
    if (props.showHeaderAs === "custom" && props.headerWidgets) {
        const customHeaderContent = ContentRenderer.renderContent(
            columnItem,
            props.showHeaderAs,
            props.headerAttribute,
            props.headerTextTemplate,
            props.headerWidgets
        );
        return (customHeaderContent ||
            createElement("div", { className: "column-header" }, `Column ${columnIndex + 1}`)) as ReactElement;
    }

    // Standard header — optional click handler when `onClickColumnHeader` is configured
    const columnHeaderClickProps = props.onClickColumnHeader
        ? {
              onClick: (clickEvent: any) => {
                  clickEvent.preventDefault();
                  clickEvent.stopPropagation();
                  EventHandler.handleClick(
                      `column-header-${columnKey}`,
                      props.onClickColumnHeader,
                      columnItem,
                      props.onClickTrigger || "single"
                  );
              },
              style: { cursor: "pointer" }
          }
        : {};

    return (ContentRenderer.renderContentWithWrapper(
        columnItem,
        props.showHeaderAs,
        props.headerAttribute,
        props.headerTextTemplate,
        props.headerWidgets,
        {
            tag: "div",
            className: "column-header",
            tooltip: props.tooltipColumn,
            tooltipType: (props as any).tooltipColumnType,
            tooltipCustom: (props as any).tooltipColumnCustom,
            dynamicClass: props.columnClass,
            additionalProps: columnHeaderClickProps
        }
    ) ||
        createElement(
            "div",
            { className: "column-header", ...columnHeaderClickProps },
            `Column ${columnIndex + 1}`
        )) as ReactElement;
}

/**
 * Builds the event handler function for a data cell.
 * Returns `undefined` for custom cells (event binding is handled by the widget content).
 * Otherwise returns a handler that triggers the configured `onClickCell` or `onClickColumn` action.
 *
 * @param props       - Widget configuration properties.
 * @param rowKey      - Unique key of the parent row.
 * @param columnKey   - Unique key of the column.
 * @param cellItem    - The Mendix cell object.
 * @param columnItem  - The Mendix column object.
 * @returns A click handler function, or `undefined` if none applies.
 */
function buildCellClickHandler(
    props: TitanGridContainerProps,
    rowKey: string,
    columnKey: string,
    cellItem: any,
    columnItem: any
): ((event: any) => void) | undefined {
    // Custom-content cells manage their own click events inside the widget content
    if (props.showCellAs === "custom") {
        return undefined;
    }

    return (clickEvent: any) => {
        clickEvent.preventDefault();
        clickEvent.stopPropagation();

        if (props.onClickCell) {
            EventHandler.handleClick(
                `cell-${rowKey}-${columnKey}`,
                props.onClickCell,
                cellItem,
                props.onClickTrigger || "single"
            );
        } else if (props.onClickColumn) {
            EventHandler.handleClick(
                `column-${columnKey}`,
                props.onClickColumn,
                columnItem,
                props.onClickTrigger || "single"
            );
        }
    };
}

/**
 * Renders the cell content for a row that is the built-in aggregation totals row.
 * Shows the computed column aggregation value with tooltip and dynamic class support.
 *
 * @param matrixData  - The grid matrix (used to compute the aggregation value).
 * @param columnKey   - Column key used to look up the aggregation value.
 * @param props       - Widget configuration properties.
 * @param filteredRows - Currently filtered rows from the table (used for live aggregation).
 * @returns A ReactElement showing the aggregation value.
 */
function renderAggregationCellContent(
    matrixData: GridMatrixData,
    columnKey: string,
    props: TitanGridContainerProps,
    filteredRows: any[]
): ReactElement {
    const aggregationValue = calculateColumnAggregation(matrixData, columnKey, props, undefined, filteredRows);
    const aggregationContext = { value: aggregationValue, aggregationType: "column", total: aggregationValue };

    // Compute tooltip for this aggregation cell
    let tooltipText = "";
    if (props.tooltipCell) {
        const tooltipResult = ContentRenderer.getTooltip(
            aggregationContext,
            props.tooltipCell,
            (props as any).tooltipCellType,
            (props as any).tooltipCellCustom
        );
        tooltipText = tooltipResult.content;
    }
    if (!tooltipText && aggregationValue) {
        tooltipText = `${aggregationValue}`;
    }

    // Compute dynamic CSS class for this aggregation cell
    let dynamicCssClass = "";
    if (props.cellClass) {
        dynamicCssClass = ContentRenderer.getDynamicClass(aggregationContext, props.cellClass);
    }

    const cellClassName = dynamicCssClass ? `aggregation-cell ${dynamicCssClass}`.trim() : "aggregation-cell";

    const cellDomProps: any = { className: cellClassName };
    if (tooltipText) {
        cellDomProps.title = tooltipText;
    }

    return createElement(
        "div",
        cellDomProps,
        createElement(
            "div",
            { className: "aggregation-cell-data" },
            createElement(
                "div",
                { className: "aggregation-value" },
                createElement("span", { className: "agg-value" }, aggregationValue)
            )
        )
    );
}

/**
 * Renders the content for a standard (non-aggregation) data cell.
 * Handles custom widget content, click events, and empty cell fallback.
 *
 * @param cellItem    - The Mendix object for this cell.
 * @param rowItem     - The Mendix object for the parent row.
 * @param columnKey   - The column's unique key.
 * @param columnItem  - The Mendix object for the column.
 * @param props       - Widget configuration properties.
 * @returns A ReactElement for the cell content.
 */
function buildDataCellElement(
    cellItem: any,
    rowItem: any,
    columnKey: string,
    columnItem: any,
    props: TitanGridContainerProps
): ReactElement {
    // Empty cell fallback — render a blank div
    if (!cellItem) {
        return createElement("div", { className: "cell-data cell-data-empty" }, "");
    }

    const rowKey = rowItem?.id || String(rowItem);
    const clickHandler = buildCellClickHandler(props, rowKey, columnKey, cellItem, columnItem);

    // Custom widget content — wrap in CellWrapper for event coordination
    if (props.showCellAs === "custom") {
        const customCellContent = ContentRenderer.renderContentWithWrapper(
            cellItem,
            props.showCellAs,
            props.cellAttribute,
            props.cellTextTemplate,
            props.cellWidgets,
            {
                tag: "div",
                className: "cell-data",
                tooltip: props.tooltipCell,
                tooltipType: (props as any).tooltipCellType,
                tooltipCustom: (props as any).tooltipCellCustom,
                dynamicClass: props.cellClass,
                additionalProps: {}
            }
        );

        return createElement(
            CellWrapper,
            { row: rowItem, col: columnKey, children: customCellContent },
            customCellContent
        );
    }

    // Standard attribute / text-template cell
    return (ContentRenderer.renderContentWithWrapper(
        cellItem,
        props.showCellAs,
        props.cellAttribute,
        props.cellTextTemplate,
        props.cellWidgets,
        {
            tag: "div",
            className: "cell-data",
            tooltip: props.tooltipCell,
            tooltipType: (props as any).tooltipCellType,
            tooltipCustom: (props as any).tooltipCellCustom,
            dynamicClass: props.cellClass,
            additionalProps: {
                onClick: clickHandler,
                style: {
                    cursor: props.onClickCell || props.onClickColumn ? "pointer" : "default"
                }
            }
        }
    ) || createElement("div", { className: "cell-data" }, "")) as ReactElement;
}

function createDataColumn(
    columnHelper: any,
    props: TitanGridContainerProps,
    columnItem: any,
    columnIndex: number,
    matrixData: GridMatrixData
) {
    /** Unique string key for this column, derived from the Mendix column object id. */
    const columnKey = columnItem?.id || String(columnItem);

    return columnHelper.display({
        id: `col_${columnKey}`,
        // Delegate header rendering to the dedicated helper
        header: () => buildColumnHeaderElement(columnItem, columnKey, columnIndex, props),
        cell: ({ row, table }: any) => {
            // Render the aggregation totals when this row is the aggregation sentinel
            if (row.original?._isAggregation && props.enableRowAggregation) {
                const liveFilteredRows = table.getFilteredRowModel().rows;
                return renderAggregationCellContent(matrixData, columnKey, props, liveFilteredRows);
            }

            // Resolve the data cell item from the matrix
            const rowItem = row.original?.rowItem;
            const rowKey = rowItem?.id || String(rowItem);
            const cellDataItem = matrixData.cellMatrix.get(rowKey)?.get(columnKey);

            return buildDataCellElement(cellDataItem, rowItem, columnKey, columnItem, props);
        },
        accessorFn: (rowEntry: GridRowData) => {
            // Aggregation sentinel rows have no real cell value
            if (rowEntry._isAggregation) {
                return null;
            }
            const rowKey = rowEntry.rowItem?.id || String(rowEntry.rowItem);
            const cellDataItem = matrixData.cellMatrix.get(rowKey)?.get(columnKey);
            if (!cellDataItem) {
                return "";
            }

            // For custom cells, try to read the aggregation attribute if configured
            if (props.showCellAs === "custom") {
                if (props.aggregationAttributeName) {
                    try {
                        const mendixObject = (cellDataItem as any)._mendixObject || cellDataItem.object;
                        if (mendixObject && mendixObject.get) {
                            return String(mendixObject.get(props.aggregationAttributeName) || "");
                        }
                    } catch (extractionError) {
                        // Silently ignore — the cell will render empty
                    }
                }
                return "";
            }

            // For attribute/template cells, return string value for sorting/filtering
            const renderedContent = ContentRenderer.renderContent(
                cellDataItem,
                props.showCellAs,
                props.cellAttribute,
                props.cellTextTemplate,
                props.cellWidgets
            );
            return typeof renderedContent === "string" ? renderedContent : "";
        },
        enableSorting: (props as any).enableSorting ?? false,
        enableColumnFilter: (props as any).enableColumnFilter ?? false,
        enableGlobalFilter: true,
        /** Custom filter that preserves the aggregation row through all column filters. */
        filterFn: (rowEntry: any, _columnId: string, filterValue: string) => {
            if (rowEntry.id === "aggregation_row") {
                return true;
            }
            const cellValue = rowEntry.getValue(_columnId);
            return String(cellValue).toLowerCase().includes(String(filterValue).toLowerCase());
        },
        enableResizing: true,
        minSize: 120,
        maxSize: 400,
        size: 120,
        meta: {
            /** Human-readable column name used in the column visibility toggle panel. */
            displayName: (function resolveDisplayName() {
                if (props.showHeaderAs === "attribute" || props.showHeaderAs === "dynamicText") {
                    const headerText = ContentRenderer.renderContent(
                        columnItem,
                        props.showHeaderAs,
                        props.headerAttribute,
                        props.headerTextTemplate,
                        null
                    );
                    return typeof headerText === "string" ? headerText : `Column ${columnIndex + 1}`;
                }
                return `Column ${columnIndex + 1}`;
            })()
        }
    });
}

function createColumnAggregationColumn(columnHelper: any, props: TitanGridContainerProps, matrixData: GridMatrixData) {
    return columnHelper.display({
        id: "column_aggregation",
        header: () => {
            if (shouldRenderCustomColumn(props)) {
                return renderCustomColumnContent(props);
            }
            const columnAggLabel = props.columnAggregationLabel || "Total";
            return createElement(
                "div",
                {
                    className: "column-header aggregation-header",
                    title: columnAggLabel
                },
                columnAggLabel
            );
        },
        cell: ({ row, table }: any) => {
            if (row.original?._isAggregation) {
                const filteredRows = table.getFilteredRowModel().rows;
                const grandTotal = calculateGrandTotal(matrixData, props, filteredRows);

                const grandTotalContext = {
                    value: grandTotal,
                    aggregationType: "grandTotal",
                    total: grandTotal
                };

                let tooltip = "";
                let dynamicClass = "";

                if (props.tooltipCell) {
                    const tooltipObj = ContentRenderer.getTooltip(
                        grandTotalContext,
                        props.tooltipCell,
                        (props as any).tooltipCellType,
                        (props as any).tooltipCellCustom
                    );
                    tooltip = tooltipObj.content;
                }
                if (!tooltip && props.tooltipRow) {
                    const tooltipObj = ContentRenderer.getTooltip(
                        grandTotalContext,
                        props.tooltipRow,
                        (props as any).tooltipRowType,
                        (props as any).tooltipRowCustom
                    );
                    tooltip = tooltipObj.content;
                }

                if (!tooltip && grandTotal) {
                    tooltip = `${grandTotal}`;
                }

                if (props.cellClass) {
                    dynamicClass = ContentRenderer.getDynamicClass(grandTotalContext, props.cellClass);
                }
                if (!dynamicClass && props.rowClass) {
                    dynamicClass = ContentRenderer.getDynamicClass(grandTotalContext, props.rowClass);
                }

                const className = dynamicClass
                    ? `aggregation-cell grand-total ${dynamicClass}`.trim()
                    : "aggregation-cell grand-total";

                const cellProps: any = { className };
                if (tooltip) {
                    cellProps.title = tooltip;
                }

                return createElement(
                    "div",
                    cellProps,
                    createElement(
                        "div",
                        { className: "aggregation-cell-data" },
                        createElement(
                            "div",
                            { className: "aggregation-value" },
                            createElement("span", { className: "agg-value" }, grandTotal)
                        )
                    )
                );
            }

            if (props.columnAggregationType === "custom") {
                return renderCustomColumnAggregation(props);
            } else {
                const rowItem = row.original?.rowItem;
                const rowKey = rowItem?.id || String(rowItem);
                const aggValue = calculateRowAggregation(matrixData, rowKey, props);

                let tooltip = "";
                let dynamicClass = "";

                const aggContext = {
                    value: aggValue,
                    aggregationType: "row",
                    total: aggValue,
                    rowIndex: row.original?._index,
                    originalRow: rowItem
                };

                if (props.tooltipRow) {
                    const tooltipObj = ContentRenderer.getTooltip(
                        aggContext,
                        props.tooltipRow,
                        (props as any).tooltipRowType,
                        (props as any).tooltipRowCustom
                    );
                    tooltip = tooltipObj.content;
                }

                if (!tooltip && aggValue) {
                    tooltip = `${aggValue}`;
                }

                if (props.rowClass && rowItem) {
                    dynamicClass = ContentRenderer.getDynamicClass(rowItem, props.rowClass);
                } else if (props.rowClass) {
                    dynamicClass = ContentRenderer.getDynamicClass(aggContext, props.rowClass);
                }

                const className = dynamicClass ? `aggregation-cell ${dynamicClass}`.trim() : "aggregation-cell";

                const cellProps: any = { className };
                if (tooltip) {
                    cellProps.title = tooltip;
                }

                return createElement(
                    "div",
                    cellProps,
                    createElement(
                        "div",
                        { className: "aggregation-cell-data" },
                        createElement(
                            "div",
                            { className: "aggregation-value" },
                            createElement("span", { className: "agg-value" }, aggValue)
                        )
                    )
                );
            }
        },
        enableResizing: props.columnWidthMode === "resizable",
        size: 120,
        meta: {
            displayName: props.columnAggregationLabel || "Total"
        }
    });
}

function renderCustomColumnAggregation(props: TitanGridContainerProps) {
    try {
        if (!props.columnCustomAggregationContent) {
            return createElement(
                "div",
                {
                    className: "aggregation-cell custom-aggregation"
                },
                props.columnAggregationLabel || "Custom"
            );
        }

        if (props.columnCustomAggregation && props.columnCustomAggregation.canExecute) {
            // console.log("🔧 Custom column aggregation microflow available");
        }

        return createElement(
            "div",
            {
                className: "aggregation-cell custom-column-aggregation"
            },
            props.columnCustomAggregationContent
        );
    } catch (error) {
        Logger.warn("Error rendering custom column aggregation", error);
        return createElement(
            "div",
            {
                className: "aggregation-cell custom-aggregation error"
            },
            "Error"
        );
    }
}

export function calculateColumnAggregation(
    matrixData: GridMatrixData,
    columnKey: string,
    props: TitanGridContainerProps,
    isMounted?: () => boolean,
    rows?: any[]
): string {
    if (
        props.showCellAs === "custom" &&
        !props.aggregationAttributeName &&
        !props.cellAttribute &&
        !props.cellTextTemplate
    ) {
        return "-";
    }
    const columnCellItems: any[] = [];

    if (rows) {
        rows.forEach(row => {
            const rowData = row.original || row;
            if (rowData._isAggregation) {
                return;
            }
            const rowKey = rowData.rowItem?.id || String(rowData.rowItem);
            const cellItem = matrixData.cellMatrix.get(rowKey)?.get(columnKey);
            if (cellItem) {
                columnCellItems.push(cellItem);
            }
        });
    } else {
        matrixData.cellMatrix.forEach(rowMap => {
            const cellItem = rowMap.get(columnKey);
            if (cellItem) {
                columnCellItems.push(cellItem);
            }
        });
    }

    const values = AggregationProcessor.collectValuesForAggregation(
        columnCellItems,
        props.showCellAs,
        props.cellAttribute,
        props.cellTextTemplate,
        props.cellWidgets,
        undefined,
        isMounted,
        props.aggregationAttributeName
    );

    if (values.length === 0) {
        return "-";
    }

    const aggResult = AggregationProcessor.calculate(values, props.columnAggregationFunction || "sum");

    return AggregationProcessor.formatValue(aggResult, props.columnAggregationFormat);
}

export function calculateRowAggregation(
    matrixData: GridMatrixData,
    rowKey: string,
    props: TitanGridContainerProps
): string {
    if (
        props.showCellAs === "custom" &&
        !props.aggregationAttributeName &&
        !props.cellAttribute &&
        !props.cellTextTemplate
    ) {
        return "-";
    }

    const rowCellItems: any[] = [];
    const rowMap = matrixData.cellMatrix.get(rowKey);

    if (rowMap) {
        matrixData.columnKeys.forEach(columnKey => {
            const cellItem = rowMap.get(columnKey);
            if (cellItem) {
                rowCellItems.push(cellItem);
            }
        });
    }

    const values = AggregationProcessor.collectValuesForAggregation(
        rowCellItems,
        props.showCellAs,
        props.cellAttribute,
        props.cellTextTemplate,
        props.cellWidgets,
        undefined,
        undefined,
        props.aggregationAttributeName
    );

    if (values.length === 0) {
        return "-";
    }

    const aggResult = AggregationProcessor.calculate(values, props.rowAggregationFunction || "sum");

    return AggregationProcessor.formatValue(aggResult, props.rowAggregationFormat);
}

function calculateGrandTotal(matrixData: GridMatrixData, props: TitanGridContainerProps, rows?: any[]): string {
    if (props.rowAggregationType === "custom" || props.columnAggregationType === "custom") {
        return "";
    }

    if (!props.enableRowAggregation || !props.enableColumnAggregation) {
        return "";
    }

    if (
        props.showCellAs === "custom" &&
        !props.aggregationAttributeName &&
        !props.cellAttribute &&
        !props.cellTextTemplate
    ) {
        return "";
    }

    const allCellItems: any[] = [];

    if (rows) {
        rows.forEach(row => {
            const rowData = row.original || row;
            if (rowData._isAggregation) {
                return;
            }
            const rowKey = rowData.rowItem?.id || String(rowData.rowItem);
            const rowMap = matrixData.cellMatrix.get(rowKey);
            if (rowMap) {
                rowMap.forEach(cellItem => {
                    if (cellItem) {
                        allCellItems.push(cellItem);
                    }
                });
            }
        });
    } else {
        matrixData.cellMatrix.forEach(rowMap => {
            rowMap.forEach(cellItem => {
                if (cellItem) {
                    allCellItems.push(cellItem);
                }
            });
        });
    }

    const values = AggregationProcessor.collectValuesForAggregation(
        allCellItems,
        props.showCellAs,
        props.cellAttribute,
        props.cellTextTemplate,
        props.cellWidgets,
        undefined,
        undefined,
        props.aggregationAttributeName
    );

    if (values.length === 0) {
        return "";
    }

    const aggResult = AggregationProcessor.calculate(values, props.rowAggregationFunction || "sum");

    return AggregationProcessor.formatValue(aggResult, props.rowAggregationFormat);
}

function buildTableData(matrixData: GridMatrixData, props: TitanGridContainerProps): GridRowData[] {
    const tableData: GridRowData[] = matrixData.sortedRows.map((rowItem, index) => ({
        id: `row_${rowItem?.id || index}`,
        rowItem,
        _index: index
    }));

    if (props.enableRowAggregation && !shouldRenderCustomFooter(props) && tableData.length > 0) {
        const aggregationRowPosition = props.aggregationPosition || "bottom";

        const aggregationRow: GridRowData = {
            id: "aggregation_row",
            rowItem: null,
            _index: aggregationRowPosition === "top" ? -1 : tableData.length,
            _isAggregation: true
        };

        if (aggregationRowPosition === "top") {
            tableData.unshift(aggregationRow);
            tableData.forEach((row, index) => {
                if (!row._isAggregation) {
                    row._index = index - 1;
                }
            });
        } else {
            tableData.push(aggregationRow);
        }
    }

    return tableData;
}

function getRowHeaderTitle(props: TitanGridContainerProps): string | any {
    if (props.showRowColumnNameAs === "dynamicText" && props.rowColumnNameTextTemplate) {
        try {
            return props.rowColumnNameTextTemplate.value || "";
        } catch (error) {
            return "Row";
        }
    } else if (props.showRowColumnNameAs === "custom" && props.rowColumnNameWidgets) {
        return props.rowColumnNameWidgets;
    }
    return "Row";
}

export type { GridMatrixData } from "./DataProcessor";
export { AggregationProcessor } from "./AggregationProcessor";
export { ContentRenderer } from "./ContentRenderer";
