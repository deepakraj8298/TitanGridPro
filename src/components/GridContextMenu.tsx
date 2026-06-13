/**
 * @file GridContextMenu.tsx
 * @description Right-click context menu rendered as a portal at the cursor position.
 * Provides export (CSV / Excel) and print actions that mirror the toolbar buttons,
 * allowing users to trigger these actions directly from within the grid body.
 *
 * The menu is rendered via React Portal so it is positioned relative to the viewport
 * and not clipped by the grid's `overflow: hidden` container.
 */

import { createElement, Fragment, ReactElement } from "react";
import { createPortal } from "react-dom";

/** Position and visibility state for the context menu. */
export interface ContextMenuState {
    /** Whether the menu is currently open. */
    isVisible: boolean;
    /** Horizontal cursor position (pixels from the left of the viewport). */
    xPosition: number;
    /** Vertical cursor position (pixels from the top of the viewport). */
    yPosition: number;
}

/** Icon SVG for download / export items. */
function DownloadMenuIcon(): ReactElement {
    return createElement(
        "svg",
        {
            width: "16",
            height: "16",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round"
        },
        createElement("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
        createElement("polyline", { points: "7 10 12 15 17 10" }),
        createElement("line", { x1: "12", y1: "15", x2: "12", y2: "3" })
    );
}

/** Icon SVG for the print item. */
function PrintMenuIcon(): ReactElement {
    return createElement(
        "svg",
        {
            width: "16",
            height: "16",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round"
        },
        createElement("polyline", { points: "6 9 6 2 18 2 18 9" }),
        createElement("path", {
            d: "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
        }),
        createElement("rect", { x: "6", y: "14", width: "12", height: "8" })
    );
}

interface GridContextMenuProps {
    /** Current context menu position and visibility. `null` means hidden. */
    contextMenuState: ContextMenuState | null;
    /** All widget configuration properties from Studio Pro. */
    props: any;
    /** Callback to export grid data as CSV or XLSX. */
    onExport: (fileType: "csv" | "xlsx") => void;
    /** Callback to print the grid. */
    onPrint: () => void;
    /** Callback to close the context menu (called on backdrop click or action trigger). */
    onClose: () => void;
}

/**
 * Renders a floating context menu at the position of a right-click event.
 *
 * Uses `ReactDOM.createPortal` to attach the menu to `document.body`, which
 * prevents it from being clipped by any parent `overflow: hidden` element.
 *
 * A transparent backdrop `<div>` intercepts both left-clicks and right-clicks
 * to close the menu when the user clicks anywhere outside of it.
 *
 * @param props - Context menu state, widget config, and action callbacks.
 * @returns A portal rendering the context menu, or `null` if the menu is closed.
 */
export function GridContextMenu({
    contextMenuState,
    props,
    onExport,
    onPrint,
    onClose
}: GridContextMenuProps): ReactElement | null {
    // Do not render anything when the menu is not open
    if (!contextMenuState?.isVisible) {
        return null;
    }

    /** Whether export items should appear in the context menu. */
    const showExportItems =
        props.exportFormat !== "none" && (props.exportDisplay === "rightClick" || props.exportDisplay === "both");

    /** Whether the CSV export item should be shown. */
    const showCsvItem = showExportItems && (props.exportFormat === "csv" || props.exportFormat === "both");

    /** Whether the Excel export item should be shown. */
    const showExcelItem = showExportItems && (props.exportFormat === "excel" || props.exportFormat === "both");

    /** Whether the print item should appear in the context menu. */
    const showPrintItem = props.printOption === "rightClick" || props.printOption === "both";

    /** Divider line style shown between export and print items when both are present. */
    const printItemStyle = showExportItems ? { borderTop: "1px solid #eee" } : {};

    return createPortal(
        createElement(
            Fragment,
            null,
            /* Transparent backdrop — closes menu on outside click */
            createElement("div", {
                style: { position: "fixed", inset: 0, zIndex: 99998 },
                onClick: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    onClose();
                },
                onContextMenu: (e: React.MouseEvent) => {
                    e.preventDefault();
                    onClose();
                }
            }),
            /* Floating menu popup positioned at the cursor coordinates */
            createElement(
                "div",
                {
                    className: "context-menu-popup",
                    onClick: (e: React.MouseEvent) => e.stopPropagation(),
                    style: {
                        position: "fixed",
                        top: contextMenuState.yPosition,
                        left: contextMenuState.xPosition,
                        backgroundColor: "#fff",
                        border: "1px solid #ccc",
                        padding: "4px 0",
                        zIndex: 99999,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        borderRadius: "4px",
                        minWidth: "150px",
                        color: "#333"
                    }
                },
                showCsvItem &&
                    createElement(
                        "div",
                        {
                            onClick: () => onExport("csv"),
                            className: "context-menu-item"
                        },
                        createElement(DownloadMenuIcon, null),
                        "Export as CSV"
                    ),
                showExcelItem &&
                    createElement(
                        "div",
                        {
                            onClick: () => onExport("xlsx"),
                            className: "context-menu-item"
                        },
                        createElement(DownloadMenuIcon, null),
                        "Export as Excel"
                    ),
                showPrintItem &&
                    createElement(
                        "div",
                        {
                            onClick: onPrint,
                            className: "context-menu-item",
                            style: printItemStyle
                        },
                        createElement(PrintMenuIcon, null),
                        "Print Grid"
                    )
            )
        ),
        document.body
    );
}
