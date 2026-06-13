import { createElement, ReactElement } from "react";
import { flexRender, HeaderGroup, Header } from "../../engine/TitanTableEngine";
import { TableComponentProps } from "../../types";
import { getPinningStyles, getRowPinningStyles } from "../../utils/GridStyles";
import { FilterIcon } from "../Filters/FilterIcon";
import { TableRow } from "./TableRow";

export function GridHeader({ table, props }: TableComponentProps): ReactElement {
    const enableReorder = (props as any)?.enableColumnReordering;
    const topRows = table.getTopRows();

    const handleDragStart = (e: React.DragEvent, columnId: string) => {
        e.dataTransfer.setData("text/plain", columnId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
        e.preventDefault();
        const sourceColumnId = e.dataTransfer.getData("text/plain");
        if (sourceColumnId && sourceColumnId !== targetColumnId) {
            const currentOrder = table.getState().columnOrder;
            const newOrder = currentOrder.length > 0 ? [...currentOrder] : table.getAllLeafColumns().map(c => c.id);
            const sourceIndex = newOrder.indexOf(sourceColumnId);
            const targetIndex = newOrder.indexOf(targetColumnId);
            if (sourceIndex > -1 && targetIndex > -1) {
                newOrder.splice(sourceIndex, 1);
                newOrder.splice(targetIndex, 0, sourceColumnId);
                table.setColumnOrder(newOrder);
            }
        }
    };

    return (
        <thead style={{ position: "sticky", top: 0, zIndex: 100 }}>
            {props &&
                props.showHeaderAs !== "none" &&
                table.getHeaderGroups().map((headerGroup: HeaderGroup<any>) => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header: Header<any, unknown>) => {
                            const isAggCol = header.column.id === "column_aggregation";
                            const pinStyles = getPinningStyles(header.column, true);

                            return (
                                <th
                                    key={header.id}
                                    style={{
                                        ...pinStyles,
                                        width: header.getSize(),
                                        cursor: enableReorder ? "grab" : undefined
                                    }}
                                    {...(isAggCol ? { "data-aggregation-col": "true" } : {})}
                                    draggable={enableReorder && !isAggCol}
                                    onDragStart={enableReorder ? e => handleDragStart(e, header.column.id) : undefined}
                                    onDragOver={enableReorder ? handleDragOver : undefined}
                                    onDrop={enableReorder ? e => handleDrop(e, header.column.id) : undefined}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            width: "100%",
                                            overflow: "hidden"
                                        }}
                                    >
                                        <div
                                            {...{
                                                className: header.column.getCanSort()
                                                    ? "cursor-pointer select-none sorting-header"
                                                    : "",
                                                onClick: header.column.getToggleSortingHandler(),
                                                style: header.column.getCanSort()
                                                    ? {
                                                          cursor: "pointer",
                                                          display: "flex",
                                                          alignItems: "center",
                                                          flex: 1
                                                      }
                                                    : { flex: 1 }
                                            }}
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {{
                                                asc: (
                                                    <span
                                                        className="sort-indicator"
                                                        style={{ marginLeft: "4px", display: "inline-flex" }}
                                                    >
                                                        <svg
                                                            width="14"
                                                            height="14"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <path d="M12 19V5M5 12l7-7 7 7" />
                                                        </svg>
                                                    </span>
                                                ),
                                                desc: (
                                                    <span
                                                        className="sort-indicator"
                                                        style={{ marginLeft: "4px", display: "inline-flex" }}
                                                    >
                                                        <svg
                                                            width="14"
                                                            height="14"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <path d="M12 5v14M5 12l7 7 7-7" />
                                                        </svg>
                                                    </span>
                                                )
                                            }[header.column.getIsSorted() as string] ?? null}
                                        </div>
                                        {header.column.getCanFilter() && (props as any)?.enableColumnFilter ? (
                                            <FilterIcon column={header.column} />
                                        ) : null}
                                    </div>
                                    {header.column.getCanResize() && (
                                        <div
                                            onMouseDown={header.getResizeHandler()}
                                            onTouchStart={header.getResizeHandler()}
                                            className={`resizer ${header.column.getIsResizing() ? "isResizing" : ""}`}
                                        />
                                    )}
                                </th>
                            );
                        })}
                    </tr>
                ))}
            {topRows.map((row, idx) => (
                <TableRow key={row.id} row={row} rowIndex={idx} props={props} pinnedStyle={getRowPinningStyles(true)} />
            ))}
        </thead>
    );
}
