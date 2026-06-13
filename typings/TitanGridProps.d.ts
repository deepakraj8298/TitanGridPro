/**
 * This file was generated from TitanGrid.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { ActionValue, DynamicValue, ListValue, ListActionValue, ListAttributeValue, ListExpressionValue, ListReferenceValue, ListWidgetValue } from "mendix";

export type ShowCellAsEnum = "attribute" | "dynamicText" | "custom";

export type TooltipCellTypeEnum = "default" | "custom";

export type ShowRowAsEnum = "none" | "attribute" | "dynamicText" | "custom";

export type ShowRowColumnNameAsEnum = "dynamicText" | "custom";

export type TooltipRowTypeEnum = "default" | "custom";

export type ShowHeaderAsEnum = "none" | "firstRow" | "attribute" | "dynamicText" | "custom";

export type TooltipColumnTypeEnum = "default" | "custom";

export type OnClickTriggerEnum = "single" | "double";

export type GridThemeEnum = "alpine" | "material" | "bootstrap" | "dark" | "minimal";

export type FontSizeEnum = "size10" | "size12" | "size14" | "size16";

export type GridBorderStyleEnum = "all" | "horizontal" | "vertical" | "none";

export type GridBorderLineStyleEnum = "solid" | "dashed" | "dotted";

export type RowBorderStyleEnum = "none" | "light" | "medium" | "heavy";

export type HeaderFontWeightEnum = "weight400" | "weight500" | "weight600" | "weight700";

export type ColumnWidthModeEnum = "auto" | "resizable" | "manual" | "equal";

export type ColumnAlignmentEnum = "left" | "center" | "right";

export type RowHeightModeEnum = "auto" | "compact" | "comfortable" | "spacious" | "manual";

export type ScrollbarStyleEnum = "modern" | "minimal" | "classic" | "hidden";

export type ScrollbarWidthEnum = "thin" | "normal" | "thick";

export type RowAggregationTypeEnum = "inbuilt" | "custom";

export type RowAggregationFunctionEnum = "sum" | "avg" | "count" | "min" | "max" | "first" | "last";

export type AggregationPositionEnum = "top" | "bottom";

export type ColumnAggregationTypeEnum = "inbuilt" | "custom";

export type ColumnAggregationFunctionEnum = "sum" | "avg" | "count" | "min" | "max" | "first" | "last";

export type ColumnAggregationPositionEnum = "left" | "right";

export type GlobalFilterAlignmentEnum = "left" | "right";

export type PaginationModeEnum = "none" | "row" | "column";

export type PaginationAlignmentEnum = "left" | "center" | "right";

export type ExportFormatEnum = "none" | "csv" | "excel" | "both";

export type ExportDisplayEnum = "button" | "rightClick" | "both";

export type PrintOptionEnum = "none" | "button" | "rightClick" | "both";

export type ResponsiveBreakpointEnum = "s480px" | "s768px" | "s1024px";

export interface TitanGridContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    dataSourceCell: ListValue;
    showCellAs: ShowCellAsEnum;
    cellAttribute: ListAttributeValue<string>;
    cellTextTemplate: ListExpressionValue<string>;
    cellWidgets: ListWidgetValue;
    tooltipCell?: ListExpressionValue<string>;
    tooltipCellType: TooltipCellTypeEnum;
    tooltipCellCustom?: ListExpressionValue<string>;
    cellClass?: ListExpressionValue<string>;
    dataSourceRow: ListValue;
    referenceRow: ListReferenceValue;
    showRowAs: ShowRowAsEnum;
    rowAttribute: ListAttributeValue<string>;
    rowTextTemplate: ListExpressionValue<string>;
    rowWidgets: ListWidgetValue;
    showRowColumnNameAs: ShowRowColumnNameAsEnum;
    rowColumnNameTextTemplate?: DynamicValue<string>;
    rowColumnNameWidgets: ReactNode;
    tooltipRow?: ListExpressionValue<string>;
    tooltipRowType: TooltipRowTypeEnum;
    tooltipRowCustom?: ListExpressionValue<string>;
    rowClass?: ListExpressionValue<string>;
    dataSourceColumn: ListValue;
    referenceColumn: ListReferenceValue;
    showHeaderAs: ShowHeaderAsEnum;
    headerAttribute: ListAttributeValue<string>;
    headerTextTemplate: ListExpressionValue<string>;
    headerWidgets: ListWidgetValue;
    tooltipColumn?: ListExpressionValue<string>;
    tooltipColumnType: TooltipColumnTypeEnum;
    tooltipColumnCustom?: ListExpressionValue<string>;
    columnClass?: ListExpressionValue<string>;
    onClickTrigger: OnClickTriggerEnum;
    onClickCell?: ListActionValue;
    onClickRow?: ListActionValue;
    onClickRowHeader?: ListActionValue;
    onClickColumn?: ListActionValue;
    onClickColumnHeader?: ListActionValue;
    emptyMessage?: DynamicValue<string>;
    gridTheme: GridThemeEnum;
    fontSize: FontSizeEnum;
    gridBorderStyle: GridBorderStyleEnum;
    gridBorderLineStyle: GridBorderLineStyleEnum;
    rowBorderStyle: RowBorderStyleEnum;
    headerFontWeight: HeaderFontWeightEnum;
    enableAlternatingRows: boolean;
    enableRowHover: boolean;
    gridWidth: string;
    gridHeight: string;
    maxGridWidth: string;
    maxGridHeight: string;
    minGridWidth: string;
    minGridHeight: string;
    columnWidthMode: ColumnWidthModeEnum;
    manualColumnWidth: number;
    columnAlignment: ColumnAlignmentEnum;
    columnTextWrap: boolean;
    rowHeightMode: RowHeightModeEnum;
    manualRowHeight: number;
    headerBackgroundColor: string;
    evenRowColor: string;
    oddRowColor: string;
    hoverRowColor: string;
    borderColor: string;
    scrollbarStyle: ScrollbarStyleEnum;
    scrollbarWidth: ScrollbarWidthEnum;
    enableHorizontalScroll: boolean;
    enableVerticalScroll: boolean;
    enableRowAggregation: boolean;
    rowAggregationType: RowAggregationTypeEnum;
    rowAggregationFunction: RowAggregationFunctionEnum;
    rowCustomAggregation?: ActionValue;
    rowAggregationLabel: string;
    rowAggregationFormat: string;
    aggregationPosition: AggregationPositionEnum;
    enableColumnAggregation: boolean;
    columnAggregationType: ColumnAggregationTypeEnum;
    columnAggregationFunction: ColumnAggregationFunctionEnum;
    columnCustomAggregation?: ActionValue;
    columnAggregationLabel: string;
    columnAggregationFormat: string;
    columnAggregationPosition: ColumnAggregationPositionEnum;
    aggregationAttributeName: string;
    showAggregationLabels: boolean;
    rowCustomAggregationContent: ReactNode;
    columnCustomAggregationContent: ReactNode;
    enableSorting: boolean;
    enableGlobalFilter: boolean;
    globalFilterAlignment: GlobalFilterAlignmentEnum;
    enableColumnFilter: boolean;
    pinTopRows: number;
    pinBottomRows: number;
    pinLeftColumns: number;
    pinRightColumns: number;
    pinTotalRow: boolean;
    pinTotalColumn: boolean;
    enableColumnReordering: boolean;
    enableColumnHiding: boolean;
    paginationMode: PaginationModeEnum;
    pageSize: number;
    paginationAlignment: PaginationAlignmentEnum;
    enableVirtualization: boolean;
    overscan: number;
    exportFormat: ExportFormatEnum;
    exportDisplay: ExportDisplayEnum;
    exportFileName?: DynamicValue<string>;
    printOption: PrintOptionEnum;
    enableMobileView: boolean;
    responsiveBreakpoint: ResponsiveBreakpointEnum;
    mobileBreakpoint: number;
    mobileGridHeight: string;
    enableResponsiveScrollbars: boolean;
}

export interface TitanGridPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode?: "design" | "xray" | "structure";
    dataSourceCell: {} | { caption: string } | { type: string } | null;
    showCellAs: ShowCellAsEnum;
    cellAttribute: string;
    cellTextTemplate: string;
    cellWidgets: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    tooltipCell: string;
    tooltipCellType: TooltipCellTypeEnum;
    tooltipCellCustom: string;
    cellClass: string;
    dataSourceRow: {} | { caption: string } | { type: string } | null;
    referenceRow: string;
    showRowAs: ShowRowAsEnum;
    rowAttribute: string;
    rowTextTemplate: string;
    rowWidgets: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    showRowColumnNameAs: ShowRowColumnNameAsEnum;
    rowColumnNameTextTemplate: string;
    rowColumnNameWidgets: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    tooltipRow: string;
    tooltipRowType: TooltipRowTypeEnum;
    tooltipRowCustom: string;
    rowClass: string;
    dataSourceColumn: {} | { caption: string } | { type: string } | null;
    referenceColumn: string;
    showHeaderAs: ShowHeaderAsEnum;
    headerAttribute: string;
    headerTextTemplate: string;
    headerWidgets: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    tooltipColumn: string;
    tooltipColumnType: TooltipColumnTypeEnum;
    tooltipColumnCustom: string;
    columnClass: string;
    onClickTrigger: OnClickTriggerEnum;
    onClickCell: {} | null;
    onClickRow: {} | null;
    onClickRowHeader: {} | null;
    onClickColumn: {} | null;
    onClickColumnHeader: {} | null;
    emptyMessage: string;
    gridTheme: GridThemeEnum;
    fontSize: FontSizeEnum;
    gridBorderStyle: GridBorderStyleEnum;
    gridBorderLineStyle: GridBorderLineStyleEnum;
    rowBorderStyle: RowBorderStyleEnum;
    headerFontWeight: HeaderFontWeightEnum;
    enableAlternatingRows: boolean;
    enableRowHover: boolean;
    gridWidth: string;
    gridHeight: string;
    maxGridWidth: string;
    maxGridHeight: string;
    minGridWidth: string;
    minGridHeight: string;
    columnWidthMode: ColumnWidthModeEnum;
    manualColumnWidth: number | null;
    columnAlignment: ColumnAlignmentEnum;
    columnTextWrap: boolean;
    rowHeightMode: RowHeightModeEnum;
    manualRowHeight: number | null;
    headerBackgroundColor: string;
    evenRowColor: string;
    oddRowColor: string;
    hoverRowColor: string;
    borderColor: string;
    scrollbarStyle: ScrollbarStyleEnum;
    scrollbarWidth: ScrollbarWidthEnum;
    enableHorizontalScroll: boolean;
    enableVerticalScroll: boolean;
    enableRowAggregation: boolean;
    rowAggregationType: RowAggregationTypeEnum;
    rowAggregationFunction: RowAggregationFunctionEnum;
    rowCustomAggregation: {} | null;
    rowAggregationLabel: string;
    rowAggregationFormat: string;
    aggregationPosition: AggregationPositionEnum;
    enableColumnAggregation: boolean;
    columnAggregationType: ColumnAggregationTypeEnum;
    columnAggregationFunction: ColumnAggregationFunctionEnum;
    columnCustomAggregation: {} | null;
    columnAggregationLabel: string;
    columnAggregationFormat: string;
    columnAggregationPosition: ColumnAggregationPositionEnum;
    aggregationAttributeName: string;
    showAggregationLabels: boolean;
    rowCustomAggregationContent: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    columnCustomAggregationContent: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    enableSorting: boolean;
    enableGlobalFilter: boolean;
    globalFilterAlignment: GlobalFilterAlignmentEnum;
    enableColumnFilter: boolean;
    pinTopRows: number | null;
    pinBottomRows: number | null;
    pinLeftColumns: number | null;
    pinRightColumns: number | null;
    pinTotalRow: boolean;
    pinTotalColumn: boolean;
    enableColumnReordering: boolean;
    enableColumnHiding: boolean;
    paginationMode: PaginationModeEnum;
    pageSize: number | null;
    paginationAlignment: PaginationAlignmentEnum;
    enableVirtualization: boolean;
    overscan: number | null;
    exportFormat: ExportFormatEnum;
    exportDisplay: ExportDisplayEnum;
    exportFileName: string;
    printOption: PrintOptionEnum;
    enableMobileView: boolean;
    responsiveBreakpoint: ResponsiveBreakpointEnum;
    mobileBreakpoint: number | null;
    mobileGridHeight: string;
    enableResponsiveScrollbars: boolean;
}
