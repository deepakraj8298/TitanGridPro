import { createElement } from "react";
interface CellWrapperProps {
    children: React.ReactNode;
    row?: any;
    col?: string;
    cellItem?: any;
    onCellChange?: (cellItem: any, rowItem: any, columnKey: string) => void;
}
// ✅ SIMPLIFIED: Just adds data attributes
export function CellWrapper({ children, row, col }: CellWrapperProps) {
    return createElement(
        "div",
        {
            "data-cell-id": `cell-${row?.id}-${col}`,
            "data-cell-type": "custom"
        },
        children
    );
}
