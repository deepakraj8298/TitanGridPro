import { Table, Column } from "../engine/TitanTableEngine";
import { TitanGridContainerProps } from "../../typings/TitanGridProps";

export interface GridRendererProps {
    table: Table<any>;
    props?: TitanGridContainerProps;
}

export interface TableComponentProps {
    table: Table<any>;
    props?: TitanGridContainerProps;
    containerRef?: React.RefObject<HTMLDivElement>;
}

export interface FilterIconProps {
    column: Column<any, unknown>;
    props?: TitanGridContainerProps;
}
