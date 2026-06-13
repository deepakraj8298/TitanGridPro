/**
 * @file useExportHandlers.ts
 * @description Custom React hook that encapsulates CSV and Excel export logic.
 * Extracts table data directly from the rendered DOM (so what-you-see-is-what-you-get)
 * and triggers a file download without involving the Mendix server.
 */

import { useCallback } from "react";

/** Shape of data extracted from the rendered grid DOM. */
interface GridExportData {
    /** Array of column header labels, one per visible column. */
    headers: string[];
    /** Array of rows, each row being an array of cell text values. */
    dataRows: string[][];
}

/**
 * Returns handlers for exporting the grid to CSV or Excel (.xlsx).
 *
 * @param gridRef - React ref pointing to the outer grid wrapper `<div>`.
 * @param exportFileName - The base filename (without extension) for the download.
 * @param onExportStart - Optional callback invoked before the export begins (e.g., to close a context menu).
 * @returns {{ triggerFileExport: (fileType: "csv" | "xlsx") => void }}
 */
export function useExportHandlers(
    gridRef: React.RefObject<HTMLDivElement>,
    exportFileName: string,
    onExportStart?: () => void
): { triggerFileExport: (fileType: "csv" | "xlsx") => void } {
    /**
     * Walks the rendered `<table>` DOM inside the grid ref and extracts header
     * labels and cell text content. Handles `colSpan` by inserting empty strings
     * for spanned cells so column alignment stays correct in exports.
     *
     * @returns The extracted export data, or `null` if the grid table is not found.
     */
    const extractExportTableData = useCallback((): GridExportData | null => {
        const tableElement = gridRef.current?.querySelector(".dynamic-grid") as HTMLTableElement;
        if (!tableElement) {
            return null;
        }

        // --- Extract column headers ---
        const headers: string[] = [];
        tableElement.querySelectorAll("thead tr th").forEach(headerCell => {
            // Prefer the inner `.sorting-header` span text (excludes sort icon characters)
            const sortingSpan = headerCell.querySelector(".sorting-header") as HTMLElement;
            const headerLabel = sortingSpan
                ? sortingSpan.innerText.trim()
                : (headerCell as HTMLElement).innerText.trim() || "Column";
            headers.push(headerLabel);
        });

        // --- Extract body and footer rows ---
        const dataRows: string[][] = [];
        const allTableRows = [
            ...Array.from(tableElement.querySelectorAll("tbody tr")),
            ...Array.from(tableElement.querySelectorAll("tfoot tr"))
        ];

        allTableRows.forEach(tableRow => {
            const rowCells: string[] = [];
            tableRow.querySelectorAll("td").forEach(tableCell => {
                const cellElement = tableCell as HTMLTableCellElement;
                // Add the cell text value
                rowCells.push(cellElement.innerText.trim());
                // For merged cells (colSpan > 1), pad with empty strings to maintain alignment
                const additionalCols = (cellElement.colSpan || 1) - 1;
                for (let spanIndex = 0; spanIndex < additionalCols; spanIndex++) {
                    rowCells.push("");
                }
            });

            if (rowCells.length > 0) {
                dataRows.push(rowCells);
            }
        });

        return { headers, dataRows };
    }, [gridRef]);

    /**
     * Wraps a cell value string in CSV-safe quoting.
     * Cells containing commas, double-quotes, or newlines are wrapped in double-quotes,
     * with any internal double-quotes escaped by doubling them ("").
     *
     * @param cellValue - The raw cell string to escape.
     * @returns A CSV-safe string.
     */
    const escapeCsvCell = (cellValue: string): string => {
        const needsQuoting = cellValue.includes(",") || cellValue.includes('"') || cellValue.includes("\n");
        return needsQuoting ? `"${cellValue.replace(/"/g, '""')}"` : cellValue;
    };

    /**
     * Builds a CSV string from the export data and triggers a browser download.
     *
     * @param exportData - The headers and data rows to serialise.
     * @param fileName - The base filename (without `.csv` extension).
     */
    const downloadAsCsv = useCallback((exportData: GridExportData, fileName: string): void => {
        // Build CSV content: header row + data rows, all cells quoted/escaped
        const csvContent = [
            exportData.headers.map(h => `"${h.replace(/"/g, '""')}"`).join(","),
            ...exportData.dataRows.map(row => row.map(escapeCsvCell).join(","))
        ].join("\n");

        // Create a blob URL and trigger a click on a temporary anchor element
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const downloadUrl = URL.createObjectURL(blob);
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", downloadUrl);
        downloadAnchor.setAttribute("download", `${fileName}.csv`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
        URL.revokeObjectURL(downloadUrl);
    }, []);

    /**
     * Determines the correct output filename, extracts DOM data, and dispatches
     * to either the CSV or Excel (.xlsx) export path.
     *
     * @param fileType - `"csv"` for comma-separated values, `"xlsx"` for Excel.
     */
    const triggerFileExport = useCallback(
        (fileType: "csv" | "xlsx"): void => {
            // Notify parent (e.g., to close context menu) before starting export
            onExportStart?.();

            const exportData = extractExportTableData();
            if (!exportData) {
                return;
            }

            if (fileType === "csv") {
                downloadAsCsv(exportData, exportFileName);
            } else {
                // Dynamically require the Excel exporter to keep it out of the initial bundle
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { exportToExcel } = require("../utils/ExcelExporter");
                exportToExcel(exportData.headers, exportData.dataRows, exportFileName);
            }
        },
        [exportFileName, extractExportTableData, downloadAsCsv, onExportStart]
    );

    return { triggerFileExport };
}
