import { createElement, ReactElement } from "react";
import { TableComponentProps } from "../../types";
import { shouldRenderCustomFooter, renderCustomFooterContent } from "../../utils/GridBuilder";
import { getRowPinningStyles } from "../../utils/GridStyles";
import { TableRow } from "./TableRow";

export function GridFooter({ table, props }: TableComponentProps): ReactElement | null {
    const bottomRows = table.getBottomRows();
    const showCustomFooter = props && shouldRenderCustomFooter(props);

    if (!showCustomFooter && bottomRows.length === 0) {
        return null;
    }

    return (
        <tfoot style={{ position: "sticky", bottom: 0, zIndex: 100 }}>
            {bottomRows.map((row, idx) => (
                <TableRow
                    key={row.id}
                    row={row}
                    rowIndex={idx}
                    props={props}
                    pinnedStyle={getRowPinningStyles(false)}
                />
            ))}
            {showCustomFooter && (
                <tr className="custom-footer-row" data-aggregation-row="true">
                    <td
                        colSpan={table.getAllColumns().length}
                        className="custom-footer-cell"
                        style={{
                            background: "var(--dg-header-bg)",
                            fontWeight: 600,
                            position: "sticky",
                            bottom: 0,
                            zIndex: 40
                        }}
                    >
                        {renderCustomFooterContent(props)}
                    </td>
                </tr>
            )}
        </tfoot>
    );
}
