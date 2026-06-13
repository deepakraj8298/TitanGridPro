import { createElement, ReactElement } from "react";
import { TableComponentProps } from "../../types";
import { useVirtualizer } from "../../engine/useVirtualizer";
import { TableRow } from "./TableRow";

export function GridBody({ table, props, containerRef }: TableComponentProps): ReactElement {
    const enableVirtualization = (props as any)?.enableVirtualization;

    const centerRows = table.getCenterRows();

    const rowVirtualizer = useVirtualizer({
        count: centerRows.length,
        getScrollElement: () => containerRef?.current || null,
        estimateSize: () => (props as any)?.manualRowHeight || 28,
        overscan: (props as any)?.overscan || 10,
        enabled: !!enableVirtualization && !!containerRef?.current,
        measureElement:
            typeof window !== "undefined" && navigator.userAgent.indexOf("Firefox") === -1
                ? el => el.getBoundingClientRect().height
                : undefined
    });

    const { getVirtualItems, getTotalSize, measureElement } = rowVirtualizer;

    if (enableVirtualization) {
        const virtualRows = getVirtualItems();
        const totalSize = getTotalSize();
        const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0;
        const paddingBottom = virtualRows.length > 0 ? totalSize - (virtualRows[virtualRows.length - 1]?.end || 0) : 0;

        return (
            <tbody>
                {paddingTop > 0 && (
                    <tr style={{ height: `${paddingTop}px` }}>
                        <td colSpan={table.getAllColumns().length} style={{ padding: 0, border: "none" }} />
                    </tr>
                )}
                {virtualRows.map(virtualRow => {
                    const row = centerRows[virtualRow.index];
                    return (
                        <TableRow
                            key={row.id}
                            row={row}
                            rowIndex={virtualRow.index}
                            props={props}
                            measureRef={el => measureElement(el)}
                        />
                    );
                })}
                {paddingBottom > 0 && (
                    <tr style={{ height: `${paddingBottom}px` }}>
                        <td colSpan={table.getAllColumns().length} style={{ padding: 0, border: "none" }} />
                    </tr>
                )}
            </tbody>
        );
    }

    return (
        <tbody>
            {centerRows.map((row, idx) => (
                <TableRow key={row.id} row={row} rowIndex={idx} props={props} />
            ))}
        </tbody>
    );
}
