import { ReactElement, createElement } from "react";
import { TitanGridPreviewProps } from "../typings/TitanGridProps";

export function preview(props: TitanGridPreviewProps): ReactElement {
    const isStructure = props.renderMode === "structure";

    if (isStructure) {
        return (
            <div className="dynamic-grid-structure">
                <div className="structure-header">
                    <span className="structure-badge">Structure Mode</span>
                    <span className="widget-name">TitanGrid Pro</span>
                </div>
                <div className="structure-container">
                    <table className="structure-table">
                        <thead>
                            <tr>
                                <th className="structure-cell corner">
                                    <div className="slot-label">Corner Content</div>
                                    <props.rowColumnNameWidgets.renderer caption="Corner Widgets">
                                        <div />
                                    </props.rowColumnNameWidgets.renderer>
                                </th>
                                <th className="structure-cell header">
                                    <div className="slot-label">Column Header (Repeated)</div>
                                    <props.headerWidgets.renderer caption="Column Header">
                                        <div />
                                    </props.headerWidgets.renderer>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="structure-cell row-header">
                                    <div className="slot-label">Row Header (Repeated)</div>
                                    <props.rowWidgets.renderer caption="Row Header">
                                        <div />
                                    </props.rowWidgets.renderer>
                                </td>
                                <td className="structure-cell data">
                                    <div className="slot-label">Cell Content (Repeated)</div>
                                    <props.cellWidgets.renderer caption="Cell Content">
                                        <div />
                                    </props.cellWidgets.renderer>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="structure-footer">
                    <div className="structure-info">
                        <strong>Tip:</strong> Widgets placed in these slots will be repeated for every dynamic row and
                        column.
                    </div>
                </div>
            </div>
        );
    }

    const gridStyle = getGridPreviewStyle(props);

    return (
        <div className={`dynamic-grid-preview theme-${props.gridTheme}`}>
            <div className="preview-header">
                <h4 className="preview-title">TitanGrid Premium</h4>
                <div className="preview-status">{getConfigurationStatus(props)}</div>
            </div>

            <div className="preview-configuration">
                <div className="config-section">
                    <strong>Data Architecture</strong>
                    <div className="config-items">
                        <div className="config-item">
                            <span
                                className={`status-indicator ${props.dataSourceCell ? "configured" : "missing"}`}
                            ></span>
                            Cells: {getDisplayText(props.dataSourceCell)}
                        </div>
                        <div className="config-item">
                            <span
                                className={`status-indicator ${props.dataSourceRow ? "configured" : "missing"}`}
                            ></span>
                            Rows: {getDisplayText(props.dataSourceRow)}
                        </div>
                        <div className="config-item">
                            <span
                                className={`status-indicator ${props.dataSourceColumn ? "configured" : "missing"}`}
                            ></span>
                            Columns: {getDisplayText(props.dataSourceColumn)}
                        </div>
                    </div>
                </div>

                <div className="config-section">
                    <strong>Visual Configuration</strong>
                    <div className="config-items">
                        <div className="config-item">
                            Theme: <span className="content-type">{props.gridTheme}</span>
                        </div>
                        <div className="config-item">
                            Borders: <span className="content-type">{props.gridBorderStyle}</span>
                        </div>
                        <div className="config-item">
                            Line Style: <span className="content-type">{props.gridBorderLineStyle}</span>
                        </div>
                    </div>
                </div>

                <div className="config-section">
                    <strong>Features</strong>
                    <div className="config-items">
                        <div className="config-item">
                            Export to Excel:{" "}
                            <span className="content-type">{props.exportFormat !== "none" ? "Yes" : "No"}</span>
                        </div>
                        <div className="config-item">
                            Row Aggregation:{" "}
                            <span className="content-type">
                                {props.enableRowAggregation ? props.rowAggregationFunction : "Off"}
                            </span>
                        </div>
                        <div className="config-item">
                            Col Aggregation:{" "}
                            <span className="content-type">
                                {props.enableColumnAggregation ? props.columnAggregationFunction : "Off"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="preview-grid-container">
                <div className="preview-grid-title">LIVE PREVIEW SIMULATION</div>
                <div className="preview-grid-scroll">
                    <table className="preview-grid" style={gridStyle.table}>
                        <thead>
                            <tr>
                                {props.showRowAs !== "none" && (
                                    <th className="preview-header-cell corner" style={gridStyle.headerCell}>
                                        {props.showRowColumnNameAs === "dynamicText" ? "Corner" : "Regions"}
                                    </th>
                                )}
                                {getSampleColumns(props).map((col, index) => (
                                    <th key={index} className="preview-header-cell" style={gridStyle.headerCell}>
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {getSampleRows(props).map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {props.showRowAs !== "none" && (
                                        <td className="preview-cell row-header" style={gridStyle.rowHeaderCell}>
                                            {row.header}
                                        </td>
                                    )}
                                    {row.cells.map((cell, cellIndex) => (
                                        <td key={cellIndex} className="preview-cell" style={gridStyle.cell}>
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                        {props.enableRowAggregation && (
                            <tfoot>
                                <tr className="aggregation-row">
                                    {props.showRowAs !== "none" && (
                                        <td className="preview-cell aggregation-header" style={gridStyle.rowHeaderCell}>
                                            {props.rowAggregationLabel || "Total"}
                                        </td>
                                    )}
                                    {getSampleColumns(props).map((_, index) => (
                                        <td
                                            key={index}
                                            className="preview-cell aggregation-cell"
                                            style={gridStyle.cell}
                                        >
                                            {getAggregationSample(props.rowAggregationFunction)}
                                        </td>
                                    ))}
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            <div className="preview-tips">
                <div className="tip-item">
                    <strong>Design Note:</strong> This preview simulates the grid layout. Actual content will be
                    rendered using your custom widget templates.
                </div>
            </div>
        </div>
    );
}

// Helper functions
function getDisplayText(prop: any): string {
    if (!prop) {
        return "Not configured";
    }
    if (typeof prop === "string") {
        return prop;
    }
    if (prop.caption) {
        return prop.caption;
    }
    return "Configured";
}

function getConfigurationStatus(props: TitanGridPreviewProps): ReactElement {
    const isConfigured = props.dataSourceCell && props.referenceRow && props.referenceColumn;
    return (
        <span className={`status-badge ${isConfigured ? "configured" : "incomplete"}`}>
            {isConfigured ? "✓ Ready" : "⚠ Configuration Required"}
        </span>
    );
}

function getSampleColumns(props: TitanGridPreviewProps): string[] {
    const columns = ["Jan", "Feb", "Mar", "Apr"];
    if (props.enableColumnAggregation && props.columnAggregationPosition === "right") {
        return [...columns, props.columnAggregationLabel || "Total"];
    }
    if (props.enableColumnAggregation && props.columnAggregationPosition === "left") {
        return [props.columnAggregationLabel || "Total", ...columns];
    }
    return columns;
}

function getSampleRows(props: TitanGridPreviewProps): Array<{ header: string; cells: string[] }> {
    const sampleData = [
        { header: "Region North", cells: ["$1,200", "$1,500", "$1,800", "$1,400"] },
        { header: "Region South", cells: ["$900", "$1,100", "$1,300", "$1,000"] }
    ];

    if (props.enableColumnAggregation) {
        const aggregationSample = getAggregationSample(props.columnAggregationFunction);
        sampleData.forEach(row => {
            if (props.columnAggregationPosition === "left") {
                row.cells.unshift(aggregationSample);
            } else {
                row.cells.push(aggregationSample);
            }
        });
    }
    return sampleData;
}

function getAggregationSample(func: string): string {
    const samples = {
        sum: "$2,700",
        avg: "$1,350",
        count: "2",
        min: "$900",
        max: "$1,800",
        first: "$1,200",
        last: "$1,000"
    };
    return samples[func as keyof typeof samples] ?? "$1,350";
}

function getGridPreviewStyle(props: TitanGridPreviewProps) {
    const borderStyle = props.gridBorderLineStyle || "solid";
    const borderColor = props.gridTheme === "material" ? "#e0e0e0" : "#dee2e6";
    const border = `1px ${borderStyle} ${borderColor}`;

    const hasHorizontal = props.gridBorderStyle === "all" || props.gridBorderStyle === "horizontal";
    const hasVertical = props.gridBorderStyle === "all" || props.gridBorderStyle === "vertical";

    return {
        table: {
            borderCollapse: "collapse" as const,
            border: props.gridBorderStyle === "all" ? border : "none",
            width: "100%"
        },
        headerCell: {
            borderBottom: "2px solid " + (props.gridTheme === "material" ? "#3f51b5" : "#dee2e6"),
            borderRight: hasVertical ? border : "none",
            padding: "12px",
            textAlign: "left" as const,
            backgroundColor: props.gridTheme === "material" ? "#f5f5f5" : "#f8f9fa",
            fontSize: "12px",
            fontWeight: 700
        },
        cell: {
            borderBottom: hasHorizontal ? border : "none",
            borderRight: hasVertical ? border : "none",
            padding: "10px",
            backgroundColor: "#fff",
            fontSize: "12px"
        },
        rowHeaderCell: {
            borderBottom: hasHorizontal ? border : "none",
            borderRight: "2px solid " + borderColor,
            padding: "10px",
            backgroundColor: props.gridTheme === "material" ? "#fafafa" : "#f8f9fa",
            fontWeight: 600,
            minWidth: "120px"
        }
    };
}

export function getPreviewCss(): string {
    return `
        .dynamic-grid-preview {
            padding: 24px;
            background-color: #ffffff;
            font-family: 'Inter', -apple-system, sans-serif;
            color: #333;
        }

        .preview-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            border-bottom: 1px solid #edf2f7;
            padding-bottom: 16px;
        }

        .preview-title {
            margin: 0;
            font-size: 20px;
            color: #1a202c;
            font-weight: 700;
            letter-spacing: -0.025em;
        }

        .status-badge {
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
        }

        .status-badge.configured { background: #c6f6d5; color: #22543d; }
        .status-badge.incomplete { background: #fed7d7; color: #822727; }

        .preview-configuration {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 32px;
        }

        .config-section {
            background: #f7fafc;
            padding: 16px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
        }

        .config-section strong {
            display: block;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #718096;
            margin-bottom: 12px;
        }

        .config-items { display: flex; flex-direction: column; gap: 8px; }
        .config-item { font-size: 13px; color: #4a5568; display: flex; align-items: center; }

        .status-indicator { width: 6px; height: 6px; border-radius: 50%; margin-right: 8px; }
        .status-indicator.configured { background: #48bb78; }
        .status-indicator.missing { background: #f56565; }

        .content-type { margin-left: auto; font-weight: 600; color: #3182ce; }

        .preview-grid-container {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .preview-grid-title {
            padding: 12px 16px;
            background: #edf2f7;
            font-size: 11px;
            font-weight: 800;
            color: #4a5568;
            letter-spacing: 0.1em;
        }

        .preview-grid-scroll { overflow-x: auto; }

        .preview-tips {
            margin-top: 24px;
            padding: 16px;
            background: #ebf8ff;
            border-radius: 8px;
            color: #2b6cb0;
            font-size: 13px;
        }

        /* Structure Mode */
        .dynamic-grid-structure {
            padding: 24px;
            background: #1a202c;
            border-radius: 16px;
            color: #fff;
        }

        .structure-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
        }

        .structure-badge {
            background: #4299e1;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 800;
        }

        .structure-container {
            border: 1px solid #2d3748;
            border-radius: 12px;
            overflow: hidden;
            background: #2d3748;
        }

        .structure-table { width: 100%; border-collapse: collapse; }
        .structure-cell {
            padding: 24px;
            border: 1px solid #4a5568;
            vertical-align: top;
        }

        .slot-label {
            font-size: 9px;
            font-weight: 800;
            color: #a0aec0;
            text-transform: uppercase;
            margin-bottom: 16px;
            display: block;
        }
    `;
}
