import { createElement, ReactElement } from "react";
import { flexRender, Row, Cell } from "../../engine/TitanTableEngine";
import { TableComponentProps } from "../../types";

export function CardView({ table, props }: TableComponentProps): ReactElement {
    const rows = table.getRowModel().rows.filter(r => !r.original?._isAggregation);

    return (
        <div className="grid-card-view">
            {rows.map((row: Row<any>) => (
                <div key={row.id} className="grid-card">
                    {row.getVisibleCells().map((cell: Cell<any, unknown>) => {
                        const columnMeta = cell.column.columnDef.meta as any;
                        const label = columnMeta?.displayName || cell.column.id;

                        // Skip row header if it's just an index or empty
                        if (cell.column.id === "row_header" && !label) {
                            return null;
                        }

                        return (
                            <div key={cell.id} className="card-field">
                                <div className="field-label">{label}</div>
                                <div className="field-value">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}
            {rows.length === 0 && (
                <div className="grid-card-empty">{(props as any)?.emptyMessage?.value || "No data found"}</div>
            )}
        </div>
    );
}
