/**
 * @file GridToolbar.tsx
 * @description Toolbar rendered above the grid table. Contains the global search
 * input, the column-visibility toggle panel, and export / print action buttons.
 * Each section is only rendered when the corresponding widget property is enabled.
 */

import { createElement, ReactElement } from "react";
import { ColumnVisibilityToggle } from "./Toolbar/ColumnVisibilityToggle";
import { Table } from "../engine/TitanTableEngine";

/** Icon SVG for download / export actions. */
function DownloadIcon(): ReactElement {
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

/** Icon SVG for the print action. */
function PrinterIcon(): ReactElement {
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

interface GridToolbarProps {
    /** The live table instance used to read and update state. */
    table: Table<any>;
    /** All widget configuration properties from Studio Pro. */
    props: any;
    /** Callback to export the grid as CSV or XLSX. */
    onExport: (fileType: "csv" | "xlsx") => void;
    /** Callback to print the grid via the iframe mechanism. */
    onPrint: () => void;
}

/**
 * Renders the grid toolbar row above the table container.
 *
 * Contains (in order, left-to-right):
 *  1. Global filter input — shown when `enableGlobalFilter` is true.
 *  2. Column visibility toggle button — shown when `enableColumnHiding` is true.
 *  3. Export buttons (CSV / Excel) — shown based on `exportFormat` and `exportDisplay`.
 *  4. Print button — shown based on `printOption`.
 *
 * @param props - Toolbar configuration and callbacks.
 */
export function GridToolbar({ table, props, onExport, onPrint }: GridToolbarProps): ReactElement {
    /** Current value of the global search filter. */
    const globalFilterValue = table.getState().globalFilter ?? "";

    /** Flex alignment of the entire toolbar based on the widget property. */
    const toolbarAlignment = props.globalFilterAlignment === "left" ? "flex-start" : "flex-end";

    /** Whether the export buttons should appear in the toolbar (not just right-click). */
    const showExportButtons =
        props.exportFormat !== "none" && (props.exportDisplay === "button" || props.exportDisplay === "both");

    /** Whether the CSV export button should be shown. */
    const showCsvButton = showExportButtons && (props.exportFormat === "csv" || props.exportFormat === "both");

    /** Whether the Excel export button should be shown. */
    const showExcelButton = showExportButtons && (props.exportFormat === "excel" || props.exportFormat === "both");

    /** Whether the print button should appear in the toolbar. */
    const showPrintButton = props.printOption === "button" || props.printOption === "both";

    return createElement(
        "div",
        {
            className: "grid-toolbar",
            style: {
                display: "flex",
                justifyContent: toolbarAlignment,
                marginBottom: "8px",
                alignItems: "center",
                gap: "8px"
            }
        },
        /* Global search input */
        props.enableGlobalFilter &&
            createElement("input", {
                value: globalFilterValue,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => table.setGlobalFilter(String(e.target.value)),
                placeholder: "Search all columns...",
                className: "global-filter-input form-control",
                style: { padding: "4px 8px", width: "250px" }
            }),

        /* Column visibility toggle */
        props.enableColumnHiding && createElement(ColumnVisibilityToggle, { table }),

        /* Right-side action buttons group */
        createElement(
            "div",
            { style: { display: "flex", gap: "8px", marginLeft: "auto" } },
            showCsvButton &&
                createElement(
                    "button",
                    {
                        className: "btn mx-button btn-default",
                        onClick: () => onExport("csv"),
                        style: { display: "flex", alignItems: "center", gap: "6px" },
                        title: "Export to CSV"
                    },
                    createElement(DownloadIcon, null),
                    "CSV"
                ),
            showExcelButton &&
                createElement(
                    "button",
                    {
                        className: "btn mx-button btn-default",
                        onClick: () => onExport("xlsx"),
                        style: { display: "flex", alignItems: "center", gap: "6px" },
                        title: "Export to Excel"
                    },
                    createElement(DownloadIcon, null),
                    "Excel"
                ),
            showPrintButton &&
                createElement(
                    "button",
                    {
                        className: "btn mx-button btn-default",
                        onClick: onPrint,
                        style: { display: "flex", alignItems: "center", gap: "6px" },
                        title: "Print Grid"
                    },
                    createElement(PrinterIcon, null),
                    "Print"
                )
        )
    );
}
