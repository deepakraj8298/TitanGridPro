/**
 * @file useTableConfiguration.ts
 * @description Custom React hook that composes all table state — sorting, filtering,
 * column/row pinning, pagination, and column visibility — into a single `table` instance
 * using the TitanTableEngine. This separates configuration concerns from the component
 * that renders the grid, keeping each piece focused.
 */

import { useState, useMemo } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFacetedMinMaxValues,
    getPaginationRowModel,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
    ColumnOrderState,
    PaginationState
} from "../engine/TitanTableEngine";
import { TitanGridContainerProps } from "../../typings/TitanGridProps";
import { shouldRenderCustomFooter } from "../utils/GridBuilder";

/**
 * Composes the full TitanGrid table configuration into a live `table` instance.
 *
 * Handles:
 * - Interactive state (sorting, column filters, global filter, column order, visibility)
 * - Column and row pinning (left/right columns, top/bottom rows, sticky aggregation)
 * - Bidirectional pagination (row-wise and column-wise)
 * - Custom global filter that preserves the aggregation row through filtering
 *
 * @param props     - All widget configuration properties from Studio Pro.
 * @param columns   - Column definition array built by `buildGridData`.
 * @param tableData - Flat row-data array built by `buildGridData`.
 * @returns A fully configured TitanTableEngine `Table<any>` instance.
 */
export function useTableConfiguration(props: TitanGridContainerProps, columns: any[], tableData: any[]) {
    // ── Interactive state ───────────────────────────────────────────────────────

    /** Current multi-column sort state — array of { id, desc } entries. */
    const [sorting, setSorting] = useState<SortingState>([]);

    /** Per-column filter values keyed by column id. */
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    /** Global search string applied across all visible columns. */
    const [globalFilter, setGlobalFilter] = useState("");

    /** Column show/hide visibility map — `{ [columnId]: boolean }`. */
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    /** Explicit column order override — set when the user drags columns. */
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);

    // ── Column pinning (left) ───────────────────────────────────────────────────

    /**
     * IDs of columns pinned to the LEFT side of the grid.
     * Slices the first `pinLeftColumns` entries, then appends the aggregation
     * column ID if it is configured at position "left" and stickied.
     */
    const leftPinnedColumnIds = useMemo((): string[] => {
        const pinnedIds = props.pinLeftColumns
            ? columns
                  .slice(0, props.pinLeftColumns)
                  .map(columnDef => columnDef.id as string)
                  .filter(columnId => columnId !== "column_aggregation")
            : [];

        const isAggregationLeftPinned =
            props.enableColumnAggregation &&
            (props as any).columnAggregationPosition === "left" &&
            props.pinTotalColumn;

        if (isAggregationLeftPinned && !pinnedIds.includes("column_aggregation")) {
            pinnedIds.push("column_aggregation");
        }

        return pinnedIds;
    }, [
        columns,
        props.pinLeftColumns,
        props.enableColumnAggregation,
        (props as any).columnAggregationPosition,
        props.pinTotalColumn
    ]);

    // ── Column pinning (right) ──────────────────────────────────────────────────

    /**
     * IDs of columns pinned to the RIGHT side of the grid.
     * Slices the last `pinRightColumns` entries, then appends the aggregation
     * column ID if it is configured at position "right" (the default) and stickied.
     */
    const rightPinnedColumnIds = useMemo((): string[] => {
        const pinnedIds = props.pinRightColumns
            ? columns
                  .slice(columns.length - props.pinRightColumns)
                  .map(columnDef => columnDef.id as string)
                  .filter(columnId => columnId !== "column_aggregation")
            : [];

        const isAggregationRightPinned =
            props.enableColumnAggregation &&
            ((props as any).columnAggregationPosition === "right" || !(props as any).columnAggregationPosition) &&
            props.pinTotalColumn;

        if (isAggregationRightPinned && !pinnedIds.includes("column_aggregation")) {
            pinnedIds.push("column_aggregation");
        }

        return pinnedIds;
    }, [
        columns,
        props.pinRightColumns,
        props.enableColumnAggregation,
        (props as any).columnAggregationPosition,
        props.pinTotalColumn
    ]);

    // ── Row pinning (top) ───────────────────────────────────────────────────────

    /**
     * IDs of rows pinned to the TOP of the grid.
     * Slices the first `pinTopRows` data rows, then appends the aggregation
     * row ID when it is configured at position "top" and sticky.
     */
    const topPinnedRowIds = useMemo((): string[] => {
        const pinnedIds = props.pinTopRows
            ? tableData
                  .filter(rowEntry => rowEntry.id !== "aggregation_row")
                  .slice(0, props.pinTopRows)
                  .map(rowEntry => rowEntry.id)
            : [];

        /** True when the built-in (non-custom) row aggregation totals row is enabled. */
        const isBuiltInRowAggregationEnabled = props.enableRowAggregation && !shouldRenderCustomFooter(props);

        if (isBuiltInRowAggregationEnabled && (props as any).aggregationPosition === "top") {
            const aggregationRowExists = tableData.some(rowEntry => rowEntry.id === "aggregation_row");
            if (aggregationRowExists && !pinnedIds.includes("aggregation_row")) {
                pinnedIds.push("aggregation_row");
            }
        }

        return pinnedIds;
    }, [tableData, props.pinTopRows, props.enableRowAggregation, (props as any).aggregationPosition, props]);

    // ── Row pinning (bottom) ────────────────────────────────────────────────────

    /**
     * IDs of rows pinned to the BOTTOM of the grid.
     * Slices the last `pinBottomRows` data rows, then appends the aggregation
     * row ID when it is configured at position "bottom" (the default).
     */
    const bottomPinnedRowIds = useMemo((): string[] => {
        /** All data rows excluding the aggregation sentinel. */
        const nonAggregationRows = tableData.filter(rowEntry => rowEntry.id !== "aggregation_row");

        const pinnedIds = props.pinBottomRows
            ? nonAggregationRows.slice(nonAggregationRows.length - props.pinBottomRows).map(rowEntry => rowEntry.id)
            : [];

        /** True when the built-in (non-custom) row aggregation totals row is enabled. */
        const isBuiltInRowAggregationEnabled = props.enableRowAggregation && !shouldRenderCustomFooter(props);

        const isAggregationAtBottom =
            isBuiltInRowAggregationEnabled &&
            ((props as any).aggregationPosition === "bottom" || !(props as any).aggregationPosition);

        if (isAggregationAtBottom) {
            const aggregationRowExists = tableData.some(rowEntry => rowEntry.id === "aggregation_row");
            if (aggregationRowExists && !pinnedIds.includes("aggregation_row")) {
                pinnedIds.push("aggregation_row");
            }
        }

        return pinnedIds;
    }, [tableData, props.pinBottomRows, props.enableRowAggregation, (props as any).aggregationPosition, props]);

    // ── Pagination mode flags ───────────────────────────────────────────────────

    /** True when any form of pagination (row or column) is enabled. */
    const isPaginationEnabled = (props as any).paginationMode !== "none";

    /** True when pagination is column-wise (pages cycle through column groups). */
    const isColumnPagination = (props as any).paginationMode === "column";

    /** Current pagination cursor — zero-indexed page and items-per-page count. */
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: (props as any).pageSize || 20
    });

    // ── Data segmentation ───────────────────────────────────────────────────────

    /**
     * Separates `tableData` into real data rows and the aggregation sentinel row.
     * The aggregation sentinel has `id === "aggregation_row"` and is treated
     * specially throughout the engine (always visible, always at top/bottom).
     */
    const { filteredDataRows, aggregationRowEntry } = useMemo(() => {
        const filteredDataRows = tableData.filter(rowEntry => rowEntry.id !== "aggregation_row");
        const aggregationRowEntry = tableData.find(rowEntry => rowEntry.id === "aggregation_row");
        return { filteredDataRows, aggregationRowEntry };
    }, [tableData]);

    // ── Column pagination slicing ───────────────────────────────────────────────

    /**
     * When column pagination is active, slices the scrollable "center" columns
     * to display only the current page's subset. Left/right pinned columns are
     * always included. Returns the visible column subset and the total page count.
     */
    const { paginatedColumns, manualPageCount } = useMemo(() => {
        if (!isColumnPagination || !isPaginationEnabled) {
            return {
                paginatedColumns: columns,
                manualPageCount: Math.ceil(filteredDataRows.length / pagination.pageSize)
            };
        }

        const leftPinnedSet = new Set(leftPinnedColumnIds);
        const rightPinnedSet = new Set(rightPinnedColumnIds);

        // Only paginate the center columns — pinned columns are excluded from slicing
        const centerColumns = columns.filter(
            columnDef => !leftPinnedSet.has(columnDef.id) && !rightPinnedSet.has(columnDef.id)
        );

        const totalColumnPages = Math.ceil(centerColumns.length / pagination.pageSize);
        const columnSliceStart = pagination.pageIndex * pagination.pageSize;
        const columnSliceEnd = columnSliceStart + pagination.pageSize;
        const currentPageCenterColumns = centerColumns.slice(columnSliceStart, columnSliceEnd);

        // Reassemble: [Left Pinned] + [Current Page Center] + [Right Pinned]
        const visibleColumns = [
            ...columns.filter(columnDef => leftPinnedSet.has(columnDef.id)),
            ...currentPageCenterColumns,
            ...columns.filter(columnDef => rightPinnedSet.has(columnDef.id))
        ];

        return { paginatedColumns: visibleColumns, manualPageCount: totalColumnPages };
    }, [
        columns,
        isColumnPagination,
        isPaginationEnabled,
        leftPinnedColumnIds,
        rightPinnedColumnIds,
        pagination.pageIndex,
        pagination.pageSize,
        filteredDataRows.length
    ]);

    // ── Row pagination slicing ──────────────────────────────────────────────────

    /**
     * When row pagination is active, slices `filteredDataRows` to the current page.
     * Pinned rows are always injected into the dataset so the engine can reference
     * them during sticky rendering, even when they fall outside the current page slice.
     */
    const displayData = useMemo(() => {
        if (!isPaginationEnabled || isColumnPagination) {
            return tableData; // Show all rows when pagination is off or column-paginated
        }

        const rowSliceStart = pagination.pageIndex * pagination.pageSize;
        const rowSliceEnd = rowSliceStart + pagination.pageSize;
        const currentPageRows = filteredDataRows.slice(rowSliceStart, rowSliceEnd);

        // Pinned rows must always appear in the data array even if off-page
        const allPinnedRowIds = new Set([...topPinnedRowIds, ...bottomPinnedRowIds]);
        const offPagePinnedRows = filteredDataRows.filter(rowEntry => allPinnedRowIds.has(rowEntry.id));

        const mergedRows = [...currentPageRows];
        const mergedRowIdSet = new Set(currentPageRows.map(rowEntry => rowEntry.id));

        offPagePinnedRows.forEach(pinnedRow => {
            if (!mergedRowIdSet.has(pinnedRow.id)) {
                mergedRows.push(pinnedRow);
                mergedRowIdSet.add(pinnedRow.id);
            }
        });

        // Always include the aggregation sentinel if it exists
        if (aggregationRowEntry && !mergedRowIdSet.has(aggregationRowEntry.id)) {
            mergedRows.push(aggregationRowEntry);
        }

        return mergedRows;
    }, [
        filteredDataRows,
        aggregationRowEntry,
        pagination.pageIndex,
        pagination.pageSize,
        isPaginationEnabled,
        tableData,
        topPinnedRowIds,
        bottomPinnedRowIds,
        isColumnPagination
    ]);

    // ── Table instance ──────────────────────────────────────────────────────────

    const table = useReactTable({
        data: displayData,
        columns: paginatedColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues(),
        // Only activate built-in pagination row model for row-wise pagination
        getPaginationRowModel: isPaginationEnabled && !isColumnPagination ? getPaginationRowModel() : undefined,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnOrderChange: setColumnOrder,
        onPaginationChange: setPagination,
        manualPagination: isPaginationEnabled,
        pageCount: isPaginationEnabled ? manualPageCount : undefined,
        /**
         * Custom global filter — always passes the aggregation sentinel row through
         * so totals remain visible when the user types in the search box.
         */
        globalFilterFn: (row, columnId, filterValue) => {
            if (row.id === "aggregation_row") {
                return true;
            }
            const cellValue = row.getValue(columnId);
            return String(cellValue).toLowerCase().includes(String(filterValue).toLowerCase());
        },
        getRowId: rowEntry => rowEntry.id,
        enableColumnResizing: props.columnWidthMode === "resizable",
        columnResizeMode: "onChange",
        columnResizeDirection: "ltr",
        enablePinning: true,
        enableRowPinning: true,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            columnVisibility,
            columnOrder,
            pagination,
            columnPinning: {
                left: leftPinnedColumnIds,
                right: rightPinnedColumnIds
            },
            rowPinning: {
                top: topPinnedRowIds,
                bottom: bottomPinnedRowIds
            }
        }
    });

    return table;
}
