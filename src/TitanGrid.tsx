import { createElement, ReactElement, useMemo } from "react";
import { TitanGridContainerProps } from "../typings/TitanGridProps";
import { GridRenderer } from "./components/GridRenderer";
import { useTableStyles } from "./hooks/useTableStyles";
import { useGridData } from "./hooks/useGridData";
import { useTableConfiguration } from "./hooks/useTableConfiguration";
import "./ui/TitanGrid.css";

export default function TitanGrid(props: TitanGridContainerProps): ReactElement {
    // 1. Manage data and matrix
    const { columns, tableData } = useGridData(props);

    // 2. Manage table state and configuration
    const table = useTableConfiguration(props, columns, tableData);

    // 3. Stable unique id for this widget instance
    const gridId = useMemo(() => `dg-${Math.random().toString(36).slice(2, 9)}`, []);

    // 4. Inject styles
    useTableStyles(props, gridId);

    return (
        <div id={gridId} className={`dynamic-grid-widget ${props.class || ""}`} style={props.style}>
            <GridRenderer table={table} props={props} />
        </div>
    );
}
