import { useMemo, useState, useEffect } from "react";
import { TitanGridContainerProps } from "../../typings/TitanGridProps";
import { DataProcessor } from "../utils/DataProcessor";
import { buildGridData } from "../utils/GridBuilder";
import { setupGlobalChangeDetection, setGridUpdateCallback } from "../utils/ChangeTracker";
import { EventHandler } from "../utils/EventHandler";
import { useIsMounted } from "./useIsMounted";

export function useGridData(props: TitanGridContainerProps) {
    const isMounted = useIsMounted();
    const [aggregationVersion, setAggregationVersion] = useState(0);

    const matrixData = useMemo(
        () => DataProcessor.createMatrix(props),
        [props.dataSourceCell, props.dataSourceRow, props.dataSourceColumn, props.referenceRow, props.referenceColumn]
    );

    useEffect(() => {
        setGridUpdateCallback(() => {
            setAggregationVersion(prev => prev + 1);
        });

        const cleanup = setupGlobalChangeDetection(matrixData, props);
        return () => {
            cleanup?.();
            setGridUpdateCallback(null);
            EventHandler.cleanup();
        };
    }, [matrixData, props]);

    // Build grid data ONCE per render — previously called twice (once for columns, once for tableData)
    const { columns, tableData } = useMemo(() => {
        if (!isMounted()) {
            return { columns: [], tableData: [] };
        }
        return buildGridData(props, matrixData);
    }, [
        props.dataSourceCell,
        props.dataSourceRow,
        props.dataSourceColumn,
        props.referenceRow,
        props.referenceColumn,
        props.headerAttribute,
        props.showHeaderAs,
        props.showCellAs,
        props.showRowAs,
        props.cellAttribute,
        props.rowAttribute,
        props.columnAggregationType,
        props.enableColumnAggregation,
        props.enableRowAggregation,
        props.rowAggregationType,
        props.aggregationAttributeName,
        props.pinLeftColumns,
        props.pinRightColumns,
        matrixData,
        aggregationVersion,
        isMounted()
    ]);

    return { columns, tableData, aggregationVersion };
}
