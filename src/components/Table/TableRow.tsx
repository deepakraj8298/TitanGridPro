import { createElement, ReactElement, CSSProperties } from "react";
import { flexRender, Row, Cell } from "../../engine/TitanTableEngine";
import { TitanGridContainerProps } from "../../../typings/TitanGridProps";
import { getPinningStyles } from "../../utils/GridStyles";

interface TableRowProps {
    row: Row<any>;
    rowIndex: number;
    props?: TitanGridContainerProps;
    pinnedStyle?: CSSProperties;
    measureRef?: (el: HTMLTableRowElement | null) => void;
}

export function TableRow({ row, rowIndex, props, pinnedStyle, measureRef }: TableRowProps): ReactElement {
    const isAggRow = row.original?._isAggregation === true;

    // If it's an aggregation row, check if pinning is actually enabled for it
    let finalPinnedStyle = pinnedStyle;
    if (isAggRow && props && !props.pinTotalRow) {
        finalPinnedStyle = undefined;
    }

    return (
        <tr
            key={row.id}
            ref={measureRef}
            style={finalPinnedStyle}
            data-index={rowIndex}
            {...(isAggRow ? { "data-aggregation-row": "true" } : {})}
        >
            {row.getVisibleCells().map((cell: Cell<any, unknown>) => {
                const isAggCol = cell.column.id === "column_aggregation";
                const colPinStyles = getPinningStyles(cell.column, false);

                // If it's an aggregation column, check if pinning is enabled for it
                let finalColPinStyles = colPinStyles;
                if (isAggCol && props && !props.pinTotalColumn) {
                    finalColPinStyles = {};
                }

                const combinedStyles = { ...finalPinnedStyle, ...finalColPinStyles };
                // Intersection of pinned row and pinned column gets the highest z-index
                if (finalPinnedStyle?.position && finalColPinStyles.position) {
                    combinedStyles.zIndex = 30;
                } else if (finalPinnedStyle?.position) {
                    combinedStyles.zIndex = 20;
                } else if (finalColPinStyles.position) {
                    combinedStyles.zIndex = 10;
                }

                return (
                    <td
                        key={cell.id}
                        style={{ ...combinedStyles, width: cell.column.getSize() }}
                        {...(isAggCol ? { "data-aggregation-col": "true" } : {})}
                    >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                );
            })}
        </tr>
    );
}
