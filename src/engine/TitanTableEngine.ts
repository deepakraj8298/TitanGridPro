/**
 * TitanTableEngine — A lightweight, zero-dependency table engine.
 *
 * Drop-in replacement for @tanstack/react-table, implementing only the
 * API surface actually used by the TitanGrid widget.
 *
 * Bundle impact: ~4KB gzip  vs  @tanstack/react-table ~15KB gzip
 */

import { useState, useMemo, useCallback, useRef } from "react";

// ---------------------------------------------------------------------------
// Type definitions — mirror TanStack's public types
// ---------------------------------------------------------------------------

export type SortDirection = "asc" | "desc" | false;

export interface ColumnSort {
    id: string;
    desc: boolean;
}
export type SortingState = ColumnSort[];

export interface ColumnFilter {
    id: string;
    value: unknown;
}
export type ColumnFiltersState = ColumnFilter[];

export type VisibilityState = Record<string, boolean>;
export type ColumnOrderState = string[];

export interface PaginationState {
    pageIndex: number;
    pageSize: number;
}

export interface ColumnPinningState {
    left?: string[];
    right?: string[];
}

export interface RowPinningState {
    top?: string[];
    bottom?: string[];
}

export interface ColumnMeta {
    displayName?: string;
    [key: string]: any;
}

export interface ColumnDef<TData = any> {
    id: string;
    header?: any;
    cell?: any;
    accessorFn?: (row: TData) => any;
    enableSorting?: boolean;
    enableColumnFilter?: boolean;
    enableGlobalFilter?: boolean;
    enableResizing?: boolean;
    filterFn?: (row: any, columnId: string, filterValue: any) => boolean;
    size?: number;
    minSize?: number;
    maxSize?: number;
    meta?: ColumnMeta;
}

// ---------------------------------------------------------------------------
// Column object — matches TanStack Column<TData> API surface
// ---------------------------------------------------------------------------

export interface Column<TData = any, TValue = unknown> {
    /** @internal */ _valueType?: TValue;
    id: string;
    columnDef: ColumnDef<TData>;
    getIsPinned: () => "left" | "right" | false;
    getIsLastColumn: (position: string) => boolean;
    getIsFirstColumn: (position: string) => boolean;
    getStart: (position: string) => number;
    getAfter: (position: string) => number;
    getCanSort: () => boolean;
    getToggleSortingHandler: () => ((e?: any) => void) | undefined;
    getIsSorted: () => SortDirection;
    getCanFilter: () => boolean;
    getFilterValue: () => unknown;
    setFilterValue: (value: unknown) => void;
    getFacetedUniqueValues: () => Map<any, number>;
    getCanResize: () => boolean;
    getIsResizing: () => boolean;
    getSize: () => number;
    getIsVisible: () => boolean;
    getToggleVisibilityHandler: () => (e: any) => void;
    depth: number;
}

// ---------------------------------------------------------------------------
// Header, HeaderGroup, Row, Cell — matches TanStack shapes
// ---------------------------------------------------------------------------

export interface Header<TData = any, TValue = unknown> {
    /** @internal */ _valueType?: TValue;
    id: string;
    column: Column<TData>;
    getSize: () => number;
    getResizeHandler: () => (e: any) => void;
    getContext: () => any;
    isPlaceholder: boolean;
    colSpan: number;
}

export interface HeaderGroup<TData = any, TValue = unknown> {
    /** @internal */ _valueType?: TValue;
    id: string;
    headers: Array<Header<TData>>;
}

export interface Row<TData = any, TValue = unknown> {
    /** @internal */ _valueType?: TValue;
    id: string;
    original: TData;
    index: number;
    getVisibleCells: () => Array<Cell<TData>>;
    getValue: (columnId: string) => any;
}

export interface Cell<TData = any, TValue = unknown> {
    /** @internal */ _valueType?: TValue;
    id: string;
    column: Column<TData>;
    row: Row<TData>;
    getValue: () => any;
    getContext: () => any;
}

// ---------------------------------------------------------------------------
// Table object — matches TanStack Table<TData> API surface
// ---------------------------------------------------------------------------

export interface Table<TData = any> {
    getState: () => TableState;
    getHeaderGroups: () => Array<HeaderGroup<TData>>;
    getRowModel: () => { rows: Array<Row<TData>> };
    getFilteredRowModel: () => { rows: Array<Row<TData>> };
    getCenterRows: () => Array<Row<TData>>;
    getTopRows: () => Array<Row<TData>>;
    getBottomRows: () => Array<Row<TData>>;
    getTotalSize: () => number;
    getVisibleLeafColumns: () => Array<Column<TData>>;
    getAllLeafColumns: () => Array<Column<TData>>;
    getAllColumns: () => Array<Column<TData>>;
    getIsAllColumnsVisible: () => boolean;
    getToggleAllColumnsVisibilityHandler: () => (e: any) => void;
    setGlobalFilter: (value: string) => void;
    setColumnOrder: (order: string[]) => void;
    setPageIndex: (index: number) => void;
    setPageSize: (size: number) => void;
    nextPage: () => void;
    previousPage: () => void;
    getCanPreviousPage: () => boolean;
    getCanNextPage: () => boolean;
    getPageCount: () => number;
}

export interface TableState {
    sorting: SortingState;
    columnFilters: ColumnFiltersState;
    globalFilter: string;
    columnVisibility: VisibilityState;
    columnOrder: ColumnOrderState;
    pagination: PaginationState;
    columnPinning: ColumnPinningState;
    rowPinning: RowPinningState;
}

// ---------------------------------------------------------------------------
// Table options — matches the useReactTable config object
// ---------------------------------------------------------------------------

export interface TableOptions<TData = any> {
    data: TData[];
    columns: Array<ColumnDef<TData>>;
    state: Partial<TableState>;
    onSortingChange?: (updater: any) => void;
    onColumnFiltersChange?: (updater: any) => void;
    onGlobalFilterChange?: (updater: any) => void;
    onColumnVisibilityChange?: (updater: any) => void;
    onColumnOrderChange?: (updater: any) => void;
    onPaginationChange?: (updater: any) => void;
    enableColumnResizing?: boolean;
    columnResizeMode?: string;
    columnResizeDirection?: string;
    enablePinning?: boolean;
    enableRowPinning?: boolean;
    manualPagination?: boolean;
    pageCount?: number;
    globalFilterFn?: (row: any, columnId: string, filterValue: string) => boolean;
    getRowId?: (row: TData) => string;
    // Row model factories — accepted for API compatibility but not needed
    getCoreRowModel?: any;
    getSortedRowModel?: any;
    getFilteredRowModel?: any;
    getFacetedRowModel?: any;
    getFacetedUniqueValues?: any;
    getFacetedMinMaxValues?: any;
    getPaginationRowModel?: any;
}

// ---------------------------------------------------------------------------
// flexRender — drop-in replacement
// ---------------------------------------------------------------------------

export function flexRender(renderer: any, context: any): any {
    if (typeof renderer === "function") {
        return renderer(context);
    }
    return renderer ?? null;
}

// ---------------------------------------------------------------------------
// createColumnHelper — drop-in replacement
// ---------------------------------------------------------------------------

export function createColumnHelper<TData = any>() {
    return {
        display(def: Omit<ColumnDef<TData>, "id"> & { id: string }): ColumnDef<TData> {
            return def as ColumnDef<TData>;
        },
        accessor(accessorKey: string, def: Partial<ColumnDef<TData>>): ColumnDef<TData> {
            return {
                id: accessorKey,
                ...def
            } as ColumnDef<TData>;
        }
    };
}

// ---------------------------------------------------------------------------
// Sentinel row-model factories — accepted by options for API compat
// ---------------------------------------------------------------------------

export function getCoreRowModel() {
    return undefined;
}
export function getSortedRowModel() {
    return undefined;
}
export function getFilteredRowModel() {
    return undefined;
}
export function getFacetedRowModel() {
    return undefined;
}
export function getFacetedUniqueValues() {
    return undefined;
}
export function getFacetedMinMaxValues() {
    return undefined;
}
export function getPaginationRowModel() {
    return undefined;
}

// ---------------------------------------------------------------------------
// useReactTable — the main hook
// ---------------------------------------------------------------------------

export function useReactTable<TData = any>(options: TableOptions<TData>): Table<TData> {
    const {
        data,
        columns: columnDefs,
        state: externalState,
        onSortingChange,
        onColumnFiltersChange,
        onGlobalFilterChange,
        onColumnVisibilityChange,
        onColumnOrderChange,
        onPaginationChange,
        enableColumnResizing = false,
        globalFilterFn,
        getRowId,
        pageCount: externalPageCount
    } = options;

    // Track which column is currently being resized
    const [resizingColumnId, setResizingColumnId] = useState<string | null>(null);
    const [columnSizing, setColumnSizing] = useState<Record<string, number>>({});

    const sorting = externalState.sorting || [];
    const columnFilters = externalState.columnFilters || [];
    const globalFilter = externalState.globalFilter || "";
    const columnVisibility = externalState.columnVisibility || {};
    const columnOrder = externalState.columnOrder || [];
    const pagination = externalState.pagination || { pageIndex: 0, pageSize: 20 };
    const columnPinning = externalState.columnPinning || {};
    const rowPinning = externalState.rowPinning || {};

    // ------ Column ordering ------
    const orderedColumnDefs = useMemo(() => {
        if (columnOrder.length === 0) {
            return columnDefs;
        }
        const defMap = new Map(columnDefs.map(d => [d.id, d]));
        const ordered: Array<ColumnDef<TData>> = [];
        for (const id of columnOrder) {
            const def = defMap.get(id);
            if (def) {
                ordered.push(def);
                defMap.delete(id);
            }
        }
        // Append any remaining columns not in the order list
        defMap.forEach(def => ordered.push(def));
        return ordered;
    }, [columnDefs, columnOrder]);

    // ------ Build Column objects ------
    const allColumns: Array<Column<TData>> = useMemo(() => {
        const leftPinned = columnPinning.left || [];
        const rightPinned = columnPinning.right || [];
        const leftSet = new Set(leftPinned);
        const rightSet = new Set(rightPinned);

        return orderedColumnDefs.map(def => {
            const colId = def.id;
            const isVisible = !(colId in columnVisibility) || columnVisibility[colId] !== false;

            const getIsPinnedFn = (): "left" | "right" | false => {
                if (leftSet.has(colId)) {
                    return "left";
                }
                if (rightSet.has(colId)) {
                    return "right";
                }
                return false;
            };

            const col: Column<TData> = {
                id: colId,
                columnDef: def,
                depth: 0,
                getIsPinned: getIsPinnedFn,
                getIsLastColumn: (pos: string) => {
                    const pins = pos === "left" ? leftPinned : rightPinned;
                    return pins.length > 0 && pins[pins.length - 1] === colId;
                },
                getIsFirstColumn: (pos: string) => {
                    const pins = pos === "left" ? leftPinned : rightPinned;
                    return pins.length > 0 && pins[0] === colId;
                },
                getStart: (pos: string) => {
                    const pins = pos === "left" ? leftPinned : rightPinned;
                    let offset = 0;
                    for (const id of pins) {
                        if (id === colId) {
                            break;
                        }
                        const pinDef = orderedColumnDefs.find(d => d.id === id);
                        offset += columnSizing[id] || pinDef?.size || 150;
                    }
                    return offset;
                },
                getAfter: (pos: string) => {
                    const pins = pos === "left" ? leftPinned : rightPinned;
                    let offset = 0;
                    let found = false;
                    for (let i = pins.length - 1; i >= 0; i--) {
                        if (pins[i] === colId) {
                            found = true;
                            break;
                        }
                        if (!found) {
                            const pinDef = orderedColumnDefs.find(d => d.id === pins[i]);
                            offset += columnSizing[pins[i]] || pinDef?.size || 150;
                        }
                    }
                    return offset;
                },
                getCanSort: () => def.enableSorting ?? false,
                getToggleSortingHandler: () => {
                    if (!(def.enableSorting ?? false)) {
                        return undefined;
                    }
                    return () => {
                        if (!onSortingChange) {
                            return;
                        }
                        onSortingChange((prev: SortingState) => {
                            const existing = prev.find(s => s.id === colId);
                            if (!existing) {
                                return [{ id: colId, desc: false }];
                            }
                            if (!existing.desc) {
                                return [{ id: colId, desc: true }];
                            }
                            return [];
                        });
                    };
                },
                getIsSorted: () => {
                    const s = sorting.find(s => s.id === colId);
                    if (!s) {
                        return false;
                    }
                    return s.desc ? "desc" : "asc";
                },
                getCanFilter: () => def.enableColumnFilter ?? false,
                getFilterValue: () => {
                    const f = columnFilters.find(f => f.id === colId);
                    return f?.value;
                },
                setFilterValue: (value: unknown) => {
                    if (!onColumnFiltersChange) {
                        return;
                    }
                    onColumnFiltersChange((prev: ColumnFiltersState) => {
                        const existing = prev.filter(f => f.id !== colId);
                        if (value === undefined || value === null || value === "") {
                            return existing;
                        }
                        return [...existing, { id: colId, value }];
                    });
                },
                getFacetedUniqueValues: () => {
                    // Built lazily by computing unique accessor values across data
                    const map = new Map<any, number>();
                    if (!def.accessorFn) {
                        return map;
                    }
                    for (const row of data) {
                        const val = def.accessorFn(row);
                        if (val !== null && val !== undefined && val !== "") {
                            map.set(val, (map.get(val) || 0) + 1);
                        }
                    }
                    return map;
                },
                getCanResize: () => enableColumnResizing && def.enableResizing !== false,
                getIsResizing: () => resizingColumnId === colId,
                getSize: () => columnSizing[colId] || def.size || 150,
                getIsVisible: () => isVisible,
                getToggleVisibilityHandler: () => {
                    return (e: any) => {
                        if (!onColumnVisibilityChange) {
                            return;
                        }
                        const checked = e?.target?.checked ?? !isVisible;
                        onColumnVisibilityChange((prev: VisibilityState) => ({
                            ...prev,
                            [colId]: checked
                        }));
                    };
                }
            };

            return col;
        });
    }, [
        orderedColumnDefs,
        columnPinning,
        columnVisibility,
        sorting,
        columnFilters,
        data,
        enableColumnResizing,
        resizingColumnId,
        columnSizing,
        onSortingChange,
        onColumnFiltersChange,
        onColumnVisibilityChange
    ]);

    const visibleColumns = useMemo(() => allColumns.filter(c => c.getIsVisible()), [allColumns]);

    // ------ Build Rows ------
    const allRows: Array<Row<TData>> = useMemo(() => {
        return data.map((rowData, idx) => {
            const rowId = getRowId ? getRowId(rowData) : (rowData as any).id ?? String(idx);
            const row: Row<TData> = {
                id: rowId,
                original: rowData,
                index: idx,
                getVisibleCells: () => {
                    return visibleColumns.map(col => {
                        const cell: Cell<TData> = {
                            id: `${rowId}_${col.id}`,
                            column: col,
                            row,
                            getValue: () => (col.columnDef.accessorFn ? col.columnDef.accessorFn(rowData) : undefined),
                            getContext: () => ({
                                row,
                                column: col,
                                cell,
                                table: tableRef.current,
                                getValue: () =>
                                    col.columnDef.accessorFn ? col.columnDef.accessorFn(rowData) : undefined,
                                renderValue: () =>
                                    col.columnDef.accessorFn ? col.columnDef.accessorFn(rowData) : undefined
                            })
                        };
                        return cell;
                    });
                },
                getValue: (columnId: string) => {
                    const col = allColumns.find(c => c.id === columnId);
                    if (col?.columnDef.accessorFn) {
                        return col.columnDef.accessorFn(rowData);
                    }
                    return undefined;
                }
            };
            return row;
        });
    }, [data, visibleColumns, allColumns, getRowId]);

    // ------ Filtering ------
    const filteredRows = useMemo(() => {
        let rows = allRows;

        // Column filters
        if (columnFilters.length > 0) {
            rows = rows.filter(row => {
                return columnFilters.every(filter => {
                    const col = allColumns.find(c => c.id === filter.id);
                    if (!col) {
                        return true;
                    }
                    // Use custom filterFn if defined on the column
                    if (col.columnDef.filterFn) {
                        return col.columnDef.filterFn(row, filter.id, filter.value);
                    }
                    // Default: string includes
                    const value = row.getValue(filter.id);
                    return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
                });
            });
        }

        // Global filter
        if (globalFilter) {
            rows = rows.filter(row => {
                return visibleColumns.some(col => {
                    if (col.columnDef.enableGlobalFilter === false) {
                        return false;
                    }
                    if (globalFilterFn) {
                        return globalFilterFn(row, col.id, globalFilter);
                    }
                    const value = row.getValue(col.id);
                    return String(value ?? "")
                        .toLowerCase()
                        .includes(globalFilter.toLowerCase());
                });
            });
        }

        return rows;
    }, [allRows, columnFilters, globalFilter, allColumns, visibleColumns, globalFilterFn]);

    // ------ Sorting ------
    const sortedRows = useMemo(() => {
        if (sorting.length === 0) {
            return filteredRows;
        }

        const sorted = [...filteredRows];
        sorted.sort((a, b) => {
            for (const sort of sorting) {
                const valA = a.getValue(sort.id);
                const valB = b.getValue(sort.id);

                let comparison = 0;
                if (valA == null && valB == null) {
                    comparison = 0;
                } else if (valA == null) {
                    comparison = -1;
                } else if (valB == null) {
                    comparison = 1;
                } else if (typeof valA === "number" && typeof valB === "number") {
                    comparison = valA - valB;
                } else {
                    comparison = String(valA).localeCompare(String(valB), undefined, {
                        numeric: true,
                        sensitivity: "base"
                    });
                }

                if (comparison !== 0) {
                    return sort.desc ? -comparison : comparison;
                }
            }
            return 0;
        });

        return sorted;
    }, [filteredRows, sorting]);

    // ------ Row Pinning ------
    const topPinnedIds = useMemo(() => new Set(rowPinning.top || []), [rowPinning.top]);
    const bottomPinnedIds = useMemo(() => new Set(rowPinning.bottom || []), [rowPinning.bottom]);

    const topRows = useMemo(() => sortedRows.filter(r => topPinnedIds.has(r.id)), [sortedRows, topPinnedIds]);

    const bottomRows = useMemo(() => sortedRows.filter(r => bottomPinnedIds.has(r.id)), [sortedRows, bottomPinnedIds]);

    const centerRows = useMemo(
        () => sortedRows.filter(r => !topPinnedIds.has(r.id) && !bottomPinnedIds.has(r.id)),
        [sortedRows, topPinnedIds, bottomPinnedIds]
    );

    // ------ Headers ------
    const headerGroups: Array<HeaderGroup<TData>> = useMemo(() => {
        const headers: Array<Header<TData>> = visibleColumns.map(col => {
            const header: Header<TData> = {
                id: col.id,
                column: col,
                isPlaceholder: false,
                colSpan: 1,
                getSize: () => col.getSize(),
                getResizeHandler: () => {
                    return (startEvent: any) => {
                        if (!enableColumnResizing) {
                            return;
                        }
                        startEvent.preventDefault?.();
                        setResizingColumnId(col.id);
                        const startX = startEvent.type?.includes("touch")
                            ? startEvent.touches[0].clientX
                            : startEvent.clientX;
                        const startWidth = col.getSize();

                        const onMove = (moveEvent: any) => {
                            const currentX = moveEvent.type?.includes("touch")
                                ? moveEvent.touches[0].clientX
                                : moveEvent.clientX;
                            const diff = currentX - startX;
                            const newWidth = Math.max(
                                col.columnDef.minSize || 30,
                                Math.min(col.columnDef.maxSize || 9999, startWidth + diff)
                            );
                            setColumnSizing(prev => ({ ...prev, [col.id]: newWidth }));
                        };

                        const onEnd = () => {
                            setResizingColumnId(null);
                            document.removeEventListener("mousemove", onMove);
                            document.removeEventListener("mouseup", onEnd);
                            document.removeEventListener("touchmove", onMove);
                            document.removeEventListener("touchend", onEnd);
                        };

                        document.addEventListener("mousemove", onMove);
                        document.addEventListener("mouseup", onEnd);
                        document.addEventListener("touchmove", onMove);
                        document.addEventListener("touchend", onEnd);
                    };
                },
                getContext: () => ({
                    header,
                    column: col,
                    table: tableRef.current
                })
            };
            return header;
        });

        return [
            {
                id: "headerGroup_0",
                headers
            }
        ];
    }, [visibleColumns, enableColumnResizing]);

    // ------ Pagination helpers ------
    const computedPageCount = useMemo(() => {
        if (externalPageCount !== undefined) {
            return externalPageCount;
        }
        return Math.max(1, Math.ceil(filteredRows.length / pagination.pageSize));
    }, [externalPageCount, filteredRows.length, pagination.pageSize]);

    const getCanPreviousPage = useCallback(() => pagination.pageIndex > 0, [pagination.pageIndex]);
    const getCanNextPage = useCallback(
        () => pagination.pageIndex < computedPageCount - 1,
        [pagination.pageIndex, computedPageCount]
    );

    // ------ Total size ------
    const totalSize = useMemo(() => visibleColumns.reduce((sum, col) => sum + col.getSize(), 0), [visibleColumns]);

    // ------ Stable table ref for circular references in contexts ------
    const tableRef = useRef<Table<TData>>(null as any);

    // ------ Build the table object ------
    const table: Table<TData> = useMemo(() => {
        const t: Table<TData> = {
            getState: () => ({
                sorting,
                columnFilters,
                globalFilter,
                columnVisibility,
                columnOrder,
                pagination,
                columnPinning,
                rowPinning
            }),
            getHeaderGroups: () => headerGroups,
            getRowModel: () => ({ rows: sortedRows }),
            getFilteredRowModel: () => ({ rows: filteredRows }),
            getCenterRows: () => centerRows,
            getTopRows: () => topRows,
            getBottomRows: () => bottomRows,
            getTotalSize: () => totalSize,
            getVisibleLeafColumns: () => visibleColumns,
            getAllLeafColumns: () => allColumns,
            getAllColumns: () => allColumns,
            getIsAllColumnsVisible: () => allColumns.every(c => c.getIsVisible()),
            getToggleAllColumnsVisibilityHandler: () => {
                return (e: any) => {
                    if (!onColumnVisibilityChange) {
                        return;
                    }
                    const checked = e?.target?.checked ?? true;
                    const newVisibility: VisibilityState = {};
                    allColumns.forEach(c => {
                        newVisibility[c.id] = checked;
                    });
                    onColumnVisibilityChange(() => newVisibility);
                };
            },
            setGlobalFilter: (value: string) => {
                if (onGlobalFilterChange) {
                    onGlobalFilterChange(value);
                }
            },
            setColumnOrder: (order: string[]) => {
                if (onColumnOrderChange) {
                    onColumnOrderChange(order);
                }
            },
            setPageIndex: (index: number) => {
                if (onPaginationChange) {
                    onPaginationChange((prev: PaginationState) => ({
                        ...prev,
                        pageIndex: Math.max(0, Math.min(index, computedPageCount - 1))
                    }));
                }
            },
            setPageSize: (size: number) => {
                if (onPaginationChange) {
                    onPaginationChange((prev: PaginationState) => ({
                        ...prev,
                        pageSize: size,
                        pageIndex: 0
                    }));
                }
            },
            nextPage: () => {
                if (onPaginationChange && getCanNextPage()) {
                    onPaginationChange((prev: PaginationState) => ({
                        ...prev,
                        pageIndex: prev.pageIndex + 1
                    }));
                }
            },
            previousPage: () => {
                if (onPaginationChange && getCanPreviousPage()) {
                    onPaginationChange((prev: PaginationState) => ({
                        ...prev,
                        pageIndex: prev.pageIndex - 1
                    }));
                }
            },
            getCanPreviousPage,
            getCanNextPage,
            getPageCount: () => computedPageCount
        };

        tableRef.current = t;
        return t;
    }, [
        sorting,
        columnFilters,
        globalFilter,
        columnVisibility,
        columnOrder,
        pagination,
        columnPinning,
        rowPinning,
        headerGroups,
        sortedRows,
        filteredRows,
        centerRows,
        topRows,
        bottomRows,
        totalSize,
        visibleColumns,
        allColumns,
        computedPageCount,
        getCanPreviousPage,
        getCanNextPage,
        onGlobalFilterChange,
        onColumnOrderChange,
        onPaginationChange,
        onColumnVisibilityChange
    ]);

    return table;
}
