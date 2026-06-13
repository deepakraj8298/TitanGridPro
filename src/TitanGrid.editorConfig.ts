import { hidePropertyIn } from "@mendix/pluggable-widgets-tools";
import { TitanGridPreviewProps } from "../typings/TitanGridProps";

export type Platform = "web" | "desktop";

export type Properties = PropertyGroup[];

type PropertyGroup = {
    caption: string;
    propertyGroups?: PropertyGroup[];
    properties?: Property[];
};

type Property = {
    key: string;
    caption: string;
    description?: string;
    objectHeaders?: string[]; // used for customizing object grids
    objects?: ObjectProperties[];
    properties?: Properties[];
};

type ObjectProperties = {
    properties: PropertyGroup[];
    captions?: string[]; // used for customizing object grids
};

export type Problem = {
    property?: string; // key of the property, at which the problem exists
    severity?: "error" | "warning" | "deprecation"; // default = "error"
    message: string; // description of the problem
    studioMessage?: string; // studio-specific message, defaults to message
    url?: string; // link with more information about the problem
    studioUrl?: string; // studio-specific link
};

type BaseProps = {
    type: "Image" | "Container" | "RowLayout" | "Text" | "DropZone" | "Selectable" | "Datasource";
    grow?: number; // optionally sets a growth factor if used in a layout (default = 1)
};

type ImageProps = BaseProps & {
    type: "Image";
    document?: string; // svg image
    data?: string; // base64 image
    property?: object; // widget image property object from Values API
    width?: number; // sets a fixed maximum width
    height?: number; // sets a fixed maximum height
};

type ContainerProps = BaseProps & {
    type: "Container" | "RowLayout";
    children: PreviewProps[]; // any other preview element
    borders?: boolean; // sets borders around the layout to visually group its children
    borderRadius?: number; // integer. Can be used to create rounded borders
    backgroundColor?: string; // HTML color, formatted #RRGGBB
    borderWidth?: number; // sets the border width
    padding?: number; // integer. adds padding around the container
};

type RowLayoutProps = ContainerProps & {
    type: "RowLayout";
    columnSize?: "fixed" | "grow"; // default is fixed
};

type TextProps = BaseProps & {
    type: "Text";
    content: string; // text that should be shown
    fontSize?: number; // sets the font size
    fontColor?: string; // HTML color, formatted #RRGGBB
    bold?: boolean;
    italic?: boolean;
};

type DropZoneProps = BaseProps & {
    type: "DropZone";
    property: object; // widgets property object from Values API
    placeholder: string; // text to be shown inside the dropzone when empty
    showDataSourceHeader?: boolean; // true by default. Toggles whether to show a header containing information about the datasource
};

type SelectableProps = BaseProps & {
    type: "Selectable";
    object: object; // object property instance from the Value API
    child: PreviewProps; // any type of preview property to visualize the object instance
};

type DatasourceProps = BaseProps & {
    type: "Datasource";
    property: object | null; // datasource property object from Values API
    child?: PreviewProps; // any type of preview property component (optional)
};

export type PreviewProps =
    | ImageProps
    | ContainerProps
    | RowLayoutProps
    | TextProps
    | DropZoneProps
    | SelectableProps
    | DatasourceProps;

export function getProperties(
    _values: TitanGridPreviewProps,
    defaultProperties: Properties /* , target: Platform*/
): Properties {
    // Do the values manipulation here to control the visibility of properties in Studio and Studio Pro conditionally.
    /* Example
    if (values.myProperty === "custom") {
        delete defaultProperties.properties.myOtherProperty;
    }
    */

    // ===== NEW DATA SOURCE TAB LOGIC =====

    // Cell Content Properties - Hide based on showCellAs selection
    if (_values.showCellAs !== "attribute") {
        hidePropertyIn(defaultProperties, _values, "cellAttribute");
    }
    if (_values.showCellAs !== "dynamicText") {
        hidePropertyIn(defaultProperties, _values, "cellTextTemplate");
    }
    if (_values.showCellAs !== "custom") {
        hidePropertyIn(defaultProperties, _values, "cellWidgets");
    }

    // Tooltip Cell logic
    if ((_values as any).tooltipCellType === "default") {
        hidePropertyIn(defaultProperties, _values, "tooltipCellCustom");
    } else {
        hidePropertyIn(defaultProperties, _values, "tooltipCell");
    }

    // Row Header Properties - Hide based on showRowAs selection
    if (_values.showRowAs === "none") {
        hidePropertyIn(defaultProperties, _values, "rowWidgets");
        hidePropertyIn(defaultProperties, _values, "rowTextTemplate");
        hidePropertyIn(defaultProperties, _values, "rowAttribute");
        hidePropertyIn(defaultProperties, _values, "tooltipRow");
        hidePropertyIn(defaultProperties, _values, "rowClass");
        hidePropertyIn(defaultProperties, _values, "showRowColumnNameAs");
        hidePropertyIn(defaultProperties, _values, "rowColumnNameWidgets");
        hidePropertyIn(defaultProperties, _values, "rowColumnNameTextTemplate");
        hidePropertyIn(defaultProperties, _values, "tooltipRowType");
        hidePropertyIn(defaultProperties, _values, "tooltipRowCustom");
    } else {
        if (_values.showRowAs !== "custom") {
            hidePropertyIn(defaultProperties, _values, "rowWidgets");
        }
        if (_values.showRowAs !== "dynamicText") {
            hidePropertyIn(defaultProperties, _values, "rowTextTemplate");
        }
        if (_values.showRowAs !== "attribute") {
            hidePropertyIn(defaultProperties, _values, "rowAttribute");
        }

        // Row Column Name Properties - Hide based on showRowColumnNameAs
        if (_values.showRowColumnNameAs !== "custom") {
            hidePropertyIn(defaultProperties, _values, "rowColumnNameWidgets");
        }
        if (_values.showRowColumnNameAs !== "dynamicText") {
            hidePropertyIn(defaultProperties, _values, "rowColumnNameTextTemplate");
        }

        // Tooltip Row logic
        if ((_values as any).tooltipRowType === "default") {
            hidePropertyIn(defaultProperties, _values, "tooltipRowCustom");
        } else {
            hidePropertyIn(defaultProperties, _values, "tooltipRow");
        }
    }

    // Column Header Properties - Hide based on showHeaderAs selection
    if (_values.showHeaderAs === "none") {
        hidePropertyIn(defaultProperties, _values, "headerAttribute");
        hidePropertyIn(defaultProperties, _values, "headerWidgets");
        hidePropertyIn(defaultProperties, _values, "headerTextTemplate");
        hidePropertyIn(defaultProperties, _values, "tooltipColumn");
        hidePropertyIn(defaultProperties, _values, "columnClass");
        hidePropertyIn(defaultProperties, _values, "tooltipColumnType");
        hidePropertyIn(defaultProperties, _values, "tooltipColumnCustom");
    } else if (_values.showHeaderAs === "firstRow") {
        // Hide column configuration when using first row as header
        hidePropertyIn(defaultProperties, _values, "headerAttribute");
        hidePropertyIn(defaultProperties, _values, "headerWidgets");
        hidePropertyIn(defaultProperties, _values, "headerTextTemplate");
    } else {
        if (_values.showHeaderAs !== "attribute") {
            hidePropertyIn(defaultProperties, _values, "headerAttribute");
        }
        if (_values.showHeaderAs !== "custom") {
            hidePropertyIn(defaultProperties, _values, "headerWidgets");
        }
        if (_values.showHeaderAs !== "dynamicText") {
            hidePropertyIn(defaultProperties, _values, "headerTextTemplate");
        }

        // Tooltip Column logic
        if ((_values as any).tooltipColumnType === "default") {
            hidePropertyIn(defaultProperties, _values, "tooltipColumnCustom");
        } else {
            hidePropertyIn(defaultProperties, _values, "tooltipColumn");
        }
    }

    // ===== AGGREGATION TAB CONDITIONAL VISIBILITY =====

    // Hide all row aggregation properties when disabled
    if (!_values.enableRowAggregation) {
        hidePropertyIn(defaultProperties, _values, "rowAggregationType");
        hidePropertyIn(defaultProperties, _values, "rowAggregationFunction");
        hidePropertyIn(defaultProperties, _values, "rowCustomAggregation");
        hidePropertyIn(defaultProperties, _values, "rowAggregationLabel");
        hidePropertyIn(defaultProperties, _values, "rowAggregationFormat");
        hidePropertyIn(defaultProperties, _values, "rowCustomAggregationContent");
    }

    // Hide specific row aggregation properties based on type
    if (_values.rowAggregationType !== "inbuilt") {
        hidePropertyIn(defaultProperties, _values, "rowAggregationFunction");
    }
    if (_values.rowAggregationType !== "custom") {
        hidePropertyIn(defaultProperties, _values, "rowCustomAggregation");
        hidePropertyIn(defaultProperties, _values, "rowCustomAggregationContent");
    }

    // Hide all column aggregation properties when disabled
    if (!_values.enableColumnAggregation) {
        hidePropertyIn(defaultProperties, _values, "columnAggregationType");
        hidePropertyIn(defaultProperties, _values, "columnAggregationFunction");
        hidePropertyIn(defaultProperties, _values, "columnCustomAggregation");
        hidePropertyIn(defaultProperties, _values, "columnAggregationLabel");
        hidePropertyIn(defaultProperties, _values, "columnAggregationFormat");
        hidePropertyIn(defaultProperties, _values, "columnCustomAggregationContent");
        hidePropertyIn(defaultProperties, _values, "columnAggregationPosition");
    }

    // Hide specific column aggregation properties based on type
    if (_values.columnAggregationType !== "inbuilt") {
        hidePropertyIn(defaultProperties, _values, "columnAggregationFunction");
    }
    if (_values.columnAggregationType !== "custom") {
        hidePropertyIn(defaultProperties, _values, "columnCustomAggregation");
        hidePropertyIn(defaultProperties, _values, "columnCustomAggregationContent");
    }

    // Hide aggregation position when respective aggregation is disabled
    if (!_values.enableRowAggregation) {
        hidePropertyIn(defaultProperties, _values, "aggregationPosition");
    }

    // Hide show labels when no aggregation is enabled
    if (!_values.enableRowAggregation && !_values.enableColumnAggregation) {
        hidePropertyIn(defaultProperties, _values, "showAggregationLabels");
    }

    if (_values.showCellAs !== "custom" || (!_values.enableRowAggregation && !_values.enableColumnAggregation)) {
        hidePropertyIn(defaultProperties, _values, "aggregationAttributeName");
    }

    return defaultProperties;
}

export function check(values: TitanGridPreviewProps): Problem[] {
    const errors: Problem[] = [];

    // Validate required data sources
    if (!values.dataSourceCell) {
        errors.push({
            property: "dataSourceCell",
            message: "A Cell data source is required for the grid to render."
        });
    }
    if (!values.dataSourceRow) {
        errors.push({
            property: "dataSourceRow",
            message: "A Row data source is required for the grid to render."
        });
    }
    if (!values.dataSourceColumn) {
        errors.push({
            property: "dataSourceColumn",
            message: "A Column data source is required for the grid to render."
        });
    }

    // Validate row aggregation — custom type needs content widget
    if (values.enableRowAggregation && values.rowAggregationType === "custom") {
        if (values.rowCustomAggregationContent && values.rowCustomAggregationContent.widgetCount === 0) {
            errors.push({
                property: "rowCustomAggregationContent",
                severity: "warning",
                message: "Custom row aggregation is enabled but no content widget has been placed in the drop zone."
            });
        }
    }

    // Validate column aggregation — custom type needs content widget
    if (values.enableColumnAggregation && values.columnAggregationType === "custom") {
        if (values.columnCustomAggregationContent && values.columnCustomAggregationContent.widgetCount === 0) {
            errors.push({
                property: "columnCustomAggregationContent",
                severity: "warning",
                message: "Custom column aggregation is enabled but no content widget has been placed in the drop zone."
            });
        }
    }

    // Validate cell display — custom mode needs widgets
    if (values.showCellAs === "custom" && values.cellWidgets && values.cellWidgets.widgetCount === 0) {
        errors.push({
            property: "cellWidgets",
            severity: "warning",
            message: "Cell display is set to 'Custom' but no widget has been placed in the cell drop zone."
        });
    }

    // Validate: custom cells + aggregation ON → aggregationAttributeName is mandatory
    if (values.showCellAs === "custom") {
        const rowAggNeedsAttr = values.enableRowAggregation && values.rowAggregationType !== "custom";
        const colAggNeedsAttr = values.enableColumnAggregation && values.columnAggregationType !== "custom";

        if ((rowAggNeedsAttr || colAggNeedsAttr) && !values.aggregationAttributeName) {
            errors.push({
                property: "aggregationAttributeName",
                message:
                    "When cell display is 'Custom' and aggregation is enabled, 'Aggregation Attribute Name' is required so the widget knows which attribute to aggregate."
            });
        }
    }

    return errors;
}

export function getPreview(values: TitanGridPreviewProps): PreviewProps {
    const infoBarBg = "#2d3446";
    const headerBg = "#3c4252";
    const cellBg = "#3b3b3b";

    const getDataSourceInfo = (ds: any, label: string) => {
        const name = ds && ds.caption ? ds.caption : "Database";
        return `[${label}, by ${name}]`;
    };

    const renderHeaderRow = () => {
        const columns = [
            {
                type: "Container" as const,
                padding: 10,
                borders: true,
                backgroundColor: headerBg,
                grow: 2, // Increased Row column width
                children:
                    values.showRowColumnNameAs === "custom"
                        ? [
                              {
                                  type: "DropZone" as const,
                                  property: values.rowColumnNameWidgets,
                                  placeholder: "Corner widgets"
                              }
                          ]
                        : [{ type: "Text" as const, content: "", fontSize: 10 }] // Corner
            }
        ];
        // Add Header columns (including first active one and ghosts)
        for (let i = 0; i < 4; i++) {
            columns.push({
                type: "Container" as const,
                padding: 10,
                borders: true,
                backgroundColor: headerBg,
                grow: 3, // Header column
                children: [
                    {
                        type: "DropZone" as const,
                        property: values.headerWidgets,
                        placeholder: "Header widgets"
                    }
                ]
            });
        }
        return { type: "RowLayout" as const, children: columns };
    };

    const renderDataRow = () => {
        const rowChildren = [
            {
                type: "Container" as const,
                padding: 10,
                borders: true,
                backgroundColor: cellBg,
                grow: 2, // Increased Row column width
                children: [{ type: "DropZone" as const, property: values.rowWidgets, placeholder: "Row widgets" }]
            }
        ];
        // Add Cell columns
        for (let i = 0; i < 4; i++) {
            rowChildren.push({
                type: "Container" as const,
                padding: 10,
                borders: true,
                backgroundColor: cellBg,
                grow: 3, // Cell column
                children: [{ type: "DropZone" as const, property: values.cellWidgets, placeholder: "Content widgets" }]
            });
        }
        return { type: "RowLayout" as const, children: rowChildren };
    };

    return {
        type: "Container",
        backgroundColor: "#1e1e1e",
        children: [
            // Top Title Bar
            {
                type: "Container",
                backgroundColor: "#252b3b",
                padding: 4,
                children: [{ type: "Text", content: "TitanGrid Pro", fontColor: "#ffffff", fontSize: 10, bold: true }]
            },
            // Column Info Bar
            {
                type: "RowLayout",
                backgroundColor: infoBarBg,
                children: [
                    { type: "Container", grow: 2, padding: 4, children: [] }, // Aligned with wider Row column
                    {
                        type: "Container",
                        grow: 3,
                        padding: 4,
                        children: [
                            {
                                type: "Text",
                                content: getDataSourceInfo(values.dataSourceColumn, "GridColumn"),
                                fontColor: "#859fcc",
                                fontSize: 10
                            }
                        ]
                    }
                ]
            },
            // Header Row
            renderHeaderRow(),
            // Row & Cell Info Bar
            {
                type: "RowLayout",
                backgroundColor: infoBarBg,
                children: [
                    {
                        type: "Container",
                        grow: 2, // Aligned with wider Row column
                        padding: 4,
                        children: [
                            {
                                type: "Text",
                                content: getDataSourceInfo(values.dataSourceRow, "GridRow"),
                                fontColor: "#859fcc",
                                fontSize: 10
                            }
                        ]
                    },
                    {
                        type: "Container",
                        grow: 3,
                        padding: 4,
                        children: [
                            {
                                type: "Text",
                                content: getDataSourceInfo(values.dataSourceCell, "GridCell"),
                                fontColor: "#859fcc",
                                fontSize: 10
                            }
                        ]
                    }
                ]
            },
            // Data Rows
            renderDataRow(),
            renderDataRow(),
            renderDataRow(),
            renderDataRow(),
            renderDataRow(),
            renderDataRow(),
            renderDataRow(),
            renderDataRow()
        ]
    };
}
