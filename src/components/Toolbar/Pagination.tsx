import { createElement, ReactElement } from "react";
import { Table } from "../../engine/TitanTableEngine";

interface PaginationProps {
    table: Table<any>;
    isColumnPagination?: boolean;
}

export function Pagination({ table, isColumnPagination }: PaginationProps): ReactElement {
    return (
        <div
            className="pagination-controls"
            style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}
        >
            <button
                className="btn mx-button btn-default btn-sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
            >
                {"<<"}
            </button>
            <button
                className="btn mx-button btn-default btn-sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
            >
                {"<"}
            </button>
            <button
                className="btn mx-button btn-default btn-sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
            >
                {">"}
            </button>
            <button
                className="btn mx-button btn-default btn-sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
            >
                {">>"}
            </button>
            <span className="pagination-info" style={{ marginLeft: "8px" }}>
                {isColumnPagination ? "Col Page" : "Page"} <strong>{table.getState().pagination.pageIndex + 1}</strong>{" "}
                of <strong>{table.getPageCount()}</strong>
            </span>
            <span
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    marginLeft: "8px",
                    color: "var(--dg-text)"
                }}
            >
                Go to page:
                <input
                    type="number"
                    defaultValue={table.getState().pagination.pageIndex + 1}
                    onChange={e => {
                        const page = e.target.value ? Number(e.target.value) - 1 : 0;
                        table.setPageIndex(page);
                    }}
                    className="form-control input-sm"
                    style={{ width: "60px", padding: "2px 4px", height: "28px" }}
                />
            </span>
            <select
                value={table.getState().pagination.pageSize}
                onChange={e => {
                    table.setPageSize(Number(e.target.value));
                }}
                className="form-control input-sm"
                style={{ width: "100px", padding: "2px 4px", height: "28px" }}
            >
                {[10, 20, 30, 40, 50, 100].map(pageSize => (
                    <option key={pageSize} value={pageSize}>
                        Show {pageSize}
                    </option>
                ))}
            </select>
        </div>
    );
}
