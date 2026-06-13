import { ValueStatus } from "mendix";
import { TitanGridContainerProps } from "../../typings/TitanGridProps";
import { Logger } from "./Logger";

export interface GridMatrixData {
    cellMatrix: Map<string, Map<string, any>>;
    sortedRows: any[];
    sortedColumns: any[];
    columnKeys: string[];
}

export const DataProcessor = {
    createMatrix(props: TitanGridContainerProps): GridMatrixData {
        const cellItems = props.dataSourceCell.items || [];
        const rowItems = props.dataSourceRow.items || [];
        const columnItems = props.dataSourceColumn.items || [];

        if (cellItems.length === 0) {
            return {
                cellMatrix: new Map(),
                sortedRows: [],
                sortedColumns: [],
                columnKeys: []
            };
        }

        const cellMatrix = new Map<string, Map<string, any>>();
        const uniqueRows = new Set<any>();
        const uniqueColumns = new Set<any>();

        cellItems.forEach((cellItem, cellIndex) => {
            let associatedRow: any = null;
            let associatedColumn: any = null;

            if (props.referenceRow) {
                try {
                    const rowRef = props.referenceRow.get(cellItem);
                    const rowId = this.extractEntityId(rowRef);
                    if (rowId) {
                        associatedRow = rowItems.find(row => row.id === rowId);
                    }
                } catch (error) {
                    Logger.warn("Error getting row reference", error);
                }
            }

            if (props.referenceColumn) {
                try {
                    const columnRef = props.referenceColumn.get(cellItem);
                    const columnId = this.extractEntityId(columnRef);
                    if (columnId) {
                        associatedColumn = columnItems.find(col => col.id === columnId);
                    }
                } catch (error) {
                    Logger.warn("Error getting column reference", error);
                }
            }

            if (!associatedRow && rowItems.length > 0) {
                const rowIndex = Math.floor(cellIndex / Math.max(1, columnItems.length));
                associatedRow = rowItems[rowIndex % rowItems.length];
            }

            if (!associatedColumn && columnItems.length > 0) {
                const colIndex = cellIndex % columnItems.length;
                associatedColumn = columnItems[colIndex];
            }

            if (associatedRow && associatedColumn) {
                const rowKey = associatedRow.id || String(associatedRow);
                const columnKey = associatedColumn.id || String(associatedColumn);

                if (!cellMatrix.has(rowKey)) {
                    cellMatrix.set(rowKey, new Map());
                }
                cellMatrix.get(rowKey)!.set(columnKey, cellItem);

                uniqueRows.add(associatedRow);
                uniqueColumns.add(associatedColumn);
            }
        });

        const sortedRows = Array.from(uniqueRows);
        const sortedColumns = Array.from(uniqueColumns);
        const columnKeys = sortedColumns.map(col => col.id || String(col));

        return {
            cellMatrix,
            sortedRows,
            sortedColumns,
            columnKeys
        };
    },

    extractEntityId(entityValue: any): string | undefined {
        if (entityValue && entityValue.status === ValueStatus.Available && entityValue.value) {
            return entityValue.value.id;
        }
        return undefined;
    }
};
