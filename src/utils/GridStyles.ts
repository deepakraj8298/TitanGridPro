import { CSSProperties } from "react";
import { Column } from "../engine/TitanTableEngine";

export const getPinningStyles = (column: Column<any>, isHeader: boolean): CSSProperties => {
    const isColPinned = column.getIsPinned();
    const isLastLeftPinned = isColPinned === "left" && column.getIsLastColumn("left");
    const isFirstRightPinned = isColPinned === "right" && column.getIsFirstColumn("right");

    if (isHeader) {
        return {
            position: "sticky",
            left: isColPinned === "left" ? `${column.getStart("left")}px` : undefined,
            right: isColPinned === "right" ? `${column.getAfter("right")}px` : undefined,
            zIndex: isColPinned ? 50 : 40,
            boxShadow: isLastLeftPinned
                ? "inset -4px 0 4px -4px rgba(0,0,0,0.15)"
                : isFirstRightPinned
                ? "inset 4px 0 4px -4px rgba(0,0,0,0.15)"
                : undefined
        };
    }

    if (!isColPinned) {
        return {};
    }

    return {
        left: isColPinned === "left" ? `${column.getStart("left")}px` : undefined,
        right: isColPinned === "right" ? `${column.getAfter("right")}px` : undefined,
        position: "sticky",
        zIndex: 10,
        boxShadow: isLastLeftPinned
            ? "inset -4px 0 4px -4px rgba(0,0,0,0.15)"
            : isFirstRightPinned
            ? "inset 4px 0 4px -4px rgba(0,0,0,0.15)"
            : undefined
    };
};

export const getRowPinningStyles = (isTop: boolean): CSSProperties => {
    return {
        position: "sticky",
        zIndex: 20,
        boxShadow: isTop ? "0 2px 4px -2px rgba(0,0,0,0.15)" : "0 -2px 4px -2px rgba(0,0,0,0.15)"
    };
};
