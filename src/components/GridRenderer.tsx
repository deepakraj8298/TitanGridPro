/**
 * @file GridRenderer.tsx
 * @description Root rendering component for TitanGrid Pro. Orchestrates the full
 * grid UI: toolbar, table/card view, pagination, context menu, and tooltip.
 *
 * This component is intentionally kept thin — all complex sub-behaviours are
 * delegated to focused hooks and sub-components:
 *  - `usePrintGrid`       — iframe-based print logic
 *  - `useExportHandlers`  — CSV / Excel export logic
 *  - `GridToolbar`        — search, column toggle, export/print buttons
 *  - `GridContextMenu`    — right-click floating menu
 *  - `GridEmptyState`     — empty data placeholder row
 *  - `GridHeader`         — `<thead>` with sorting and filter icons
 *  - `GridBody`           — `<tbody>` with virtualized rows
 *  - `GridFooter`         — `<tfoot>` aggregation row
 *  - `CardView`           — mobile card-based layout
 *  - `Pagination`         — row-wise or column-wise page controls
 *  - `HtmlTooltip`        — global tooltip singleton
 */

import { createElement, ReactElement, useState, useRef } from "react";
import { GridRendererProps } from "../types";

// Table sub-components
import { GridHeader } from "./Table/GridHeader";
import { GridBody } from "./Table/TableBody";
import { GridFooter } from "./Table/TableFooter";

// Toolbar and action components
import { GridToolbar } from "./GridToolbar";
import { GridContextMenu, ContextMenuState } from "./GridContextMenu";
import { GridEmptyState } from "./GridEmptyState";

// Mobile layout
import { CardView } from "./Mobile/CardView";

// Pagination and tooltip
import { Pagination } from "./Toolbar/Pagination";
import { HtmlTooltip } from "./Tooltip/HtmlTooltip";

// Hooks
import { useWindowSize } from "../hooks/useWindowSize";
import { usePrintGrid } from "../hooks/usePrintGrid";
import { useExportHandlers } from "../hooks/useExportHandlers";

/**
 * Renders the complete TitanGrid Pro grid UI.
 *
 * Switches between a standard `<table>` layout and the responsive `<CardView>`
 * based on the `enableMobileView` property and current window width.
 *
 * @param table  - The live table instance from `useTableConfiguration`.
 * @param props  - All TitanGrid widget configuration properties from Studio Pro.
 */
export function GridRenderer({ table, props }: GridRendererProps): ReactElement {
    /** Ref to the outermost wrapper — used by the export hook to locate the table DOM. */
    const gridRef = useRef<HTMLDivElement>(null);

    /** Ref to the scrollable table container — passed to GridBody for virtualizer anchoring. */
    const tableContainerRef = useRef<HTMLDivElement>(null);

    // Guard: if props are not yet provided by the Mendix runtime, render nothing
    if (!props) {
        return createElement("div", { className: "dynamic-grid-wrapper" });
    }

    /** Current viewport width — used to decide whether to render the mobile card view. */
    const { width: viewportWidth } = useWindowSize();

    /** True when the viewport is narrower than the configured mobile breakpoint. */
    const isMobileView = (props as any)?.enableMobileView && viewportWidth <= ((props as any)?.mobileBreakpoint || 768);

    /** State for the right-click context menu position and visibility. */
    const [contextMenuState, setContextMenuState] = useState<ContextMenuState | null>(null);

    /** Resolved filename for export (falls back to "Export" if the expression is empty). */
    const resolvedExportFileName = (props as any)?.exportFileName?.value || "Export";

    /** Closes the context menu by clearing its state. */
    const closeContextMenu = (): void => setContextMenuState(null);

    // --- Hooks for print and export ---
    const { printGridToIframe } = usePrintGrid();
    const { triggerFileExport } = useExportHandlers(gridRef, resolvedExportFileName, closeContextMenu);

    /**
     * Opens the context menu at the cursor position when the user right-clicks.
     * Only shows the menu if at least one context-menu action is configured.
     */
    const handleTableContextMenu = (e: React.MouseEvent): void => {
        const exportFormat = (props as any)?.exportFormat;
        const exportDisplay = (props as any)?.exportDisplay;
        const printOption = (props as any)?.printOption;

        const shouldShowExport =
            exportFormat && exportFormat !== "none" && (exportDisplay === "rightClick" || exportDisplay === "both");
        const shouldShowPrint = printOption === "rightClick" || printOption === "both";

        if (shouldShowExport || shouldShowPrint) {
            e.preventDefault();
            setContextMenuState({ isVisible: true, xPosition: e.clientX, yPosition: e.clientY });
        }
    };

    /** Flex alignment of the pagination bar based on the widget property. */
    const paginationFlexAlignment =
        (props as any)?.paginationAlignment === "center"
            ? "center"
            : (props as any)?.paginationAlignment === "left"
            ? "flex-start"
            : "flex-end";

    /** Rows that are not the internal aggregation row — used to decide whether to show the empty state. */
    const nonAggregationRows = table.getRowModel().rows.filter(row => !row.original?._isAggregation);

    return createElement(
        "div",
        {
            ref: gridRef,
            className: "dynamic-grid-wrapper",
            style: { display: "flex", flexDirection: "column", height: "100%" }
        },

        /* ── Toolbar: search, column toggle, export/print buttons ── */
        createElement(GridToolbar, {
            table,
            props: props as any,
            onExport: triggerFileExport,
            onPrint: () => {
                closeContextMenu();
                printGridToIframe();
            }
        }),

        /* ── Right-click context menu (portal, rendered on document.body) ── */
        createElement(GridContextMenu, {
            contextMenuState,
            props: props as any,
            onExport: triggerFileExport,
            onPrint: () => {
                closeContextMenu();
                printGridToIframe();
            },
            onClose: closeContextMenu
        }),

        /* ── Table container: switches between card view (mobile) and standard table ── */
        createElement(
            "div",
            {
                ref: tableContainerRef,
                className: "table-container",
                onContextMenu: handleTableContextMenu
            },
            isMobileView
                ? createElement(CardView, { table, props })
                : createElement(
                      "table",
                      { className: "dynamic-grid", style: { minWidth: table.getTotalSize() } },
                      createElement(GridHeader, { table, props }),
                      nonAggregationRows.length > 0
                          ? createElement(GridBody, { table, props, containerRef: tableContainerRef })
                          : createElement(GridEmptyState, {
                                visibleColumnCount: table.getVisibleLeafColumns().length,
                                props
                            }),
                      createElement(GridFooter, { table, props })
                  )
        ),

        /* ── Pagination bar (row-wise or column-wise) ── */
        (props as any)?.paginationMode !== "none" &&
            createElement(
                "div",
                { className: "pagination-toolbar", style: { justifyContent: paginationFlexAlignment } },
                createElement(Pagination, {
                    table,
                    isColumnPagination: (props as any).paginationMode === "column"
                })
            ),

        /* ── Global tooltip singleton — listens for custom tooltip events ── */
        createElement(HtmlTooltip, null)
    );
}
