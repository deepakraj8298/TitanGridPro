/**
 * @file StyleGenerator.ts
 * @description Pure CSS generation functions for TitanGrid Pro.
 * Each exported function generates a specific section of the grid's CSS string
 * (base layout, column headers, row body, borders, themes, responsive behaviour, etc.).
 * Styles are scoped by `gridId` so multiple grid instances on the same page
 * do not interfere with each other.
 *
 * These are plain named exports — no class wrapper — in line with the Mendix
 * widget coding guidelines that prefer functional style over class components.
 */

import { TitanGridContainerProps } from "../../typings/TitanGridProps";

/**
 * Assembles the complete CSS style string for a grid instance by calling each
 * section generator in order and joining the results.
 *
 * @param props  - All TitanGrid widget configuration properties.
 * @param gridId - Unique CSS id of the grid wrapper element (used to scope all rules).
 * @returns A single CSS string containing all grid styles.
 */
export function generateGridStyles(props: TitanGridContainerProps, gridId: string): string {
    const styles: string[] = [];

    // Base grid container styles
    styles.push(buildBaseContainerStyles(props, gridId));

    // Column header styling
    styles.push(buildColumnHeaderStyles(props, gridId));

    // Row body styling
    styles.push(buildRowBodyStyles(props, gridId));

    // Border layout styling
    styles.push(buildBorderLayoutStyles(props, gridId));

    // Theme-specific overrides
    styles.push(buildThemeOverrideStyles(props, gridId));

    // Responsive media queries
    styles.push(buildResponsiveMediaStyles(props, gridId));

    // Loading / error / empty state styles
    styles.push(buildLoadingErrorEmptyStyles(gridId));

    // Scroll container styles
    styles.push(buildScrollContainerStyles(props, gridId));

    return styles.filter(styleSection => styleSection.trim()).join("\n");
}

/**
 * Generates base container and font styles.
 * Controls grid dimensions, CSS custom properties (variables), and the
 * `table-layout` mode based on the `columnWidthMode` widget property.
 *
 * @param props  - Widget configuration properties.
 * @param gridId - Unique CSS id used to scope all selectors.
 * @returns CSS string for the base container.
 */
function buildBaseContainerStyles(props: TitanGridContainerProps, gridId: string): string {
    const fontSize = getFontSizeValue(props.fontSize || "size12");
    const borderColor = props.borderColor || "#BDC3C7";
    const tableLayout = props.columnWidthMode === "resizable" ? "fixed" : "auto";

    const containerWidth = props.gridWidth || "100%";
    const containerHeight = props.gridHeight || "500px";
    const maxWidth = props.maxGridWidth || "100vw";
    const maxHeight = props.maxGridHeight || "800px";
    const minWidth = props.minGridWidth || "300px";
    const minHeight = props.minGridHeight || "200px";

    const horizontalScrollOverflow = props.enableHorizontalScroll !== false ? "auto" : "hidden";
    const verticalScrollOverflow = props.enableVerticalScroll !== false ? "auto" : "hidden";

    return `
            /* Base Grid Styles for ${gridId} */
            #${gridId} {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                font-size: ${fontSize}px;
                color: #212529;
                background-color: #ffffff;
                width: 100%;
                height: auto;
                box-sizing: border-box;
                
                /* ✅ Theme Variables */
                --dg-text: #212529;
                --dg-border-color: ${borderColor};
                --dg-card-bg: #ffffff;
                --dg-header-bg: ${props.headerBackgroundColor || "#f5f7fa"};
                --dg-hover: #e1f5fe;
            }
            
            #${gridId} .table-container {
                border: 1px solid ${borderColor};
                background-color: #ffffff;
                
            /* ── Grid container dimensions ── */
                width: ${containerWidth};
                height: ${containerHeight};
                max-width: ${maxWidth};
                max-height: ${maxHeight};
                min-width: ${minWidth};
                min-height: ${minHeight};
                
                /* ── Scroll behaviour from widget properties ── */
                overflow-x: ${horizontalScrollOverflow};
                overflow-y: ${verticalScrollOverflow};
                
                position: relative;
                box-sizing: border-box;
            }
            
            #${gridId} .dynamic-grid {
                border: none;
                border-collapse: separate;
                border-spacing: 0;
                font-size: ${fontSize}px;
                line-height: 1.4;
                table-layout: ${tableLayout};
                
                /* ✅ Table sizing based on mode */
                ${
                    props.columnWidthMode === "resizable"
                        ? `
                        min-width: 100%; /* At least full container width */
                        width: max-content; /* Grow as needed for columns */
                    `
                        : "width: 100%;"
                }
                
                /* ✅ Let table height grow naturally */
                height: auto;
                min-height: 100%;
            }
        `;
}

/**
 * Generates column header and cell styles.
 * Controls header background, font weight, text alignment, text overflow, and
 * the column resizer handle for resizable mode.
 *
 * @param props  - Widget configuration properties.
 * @param gridId - Unique CSS id used to scope all selectors.
 * @returns CSS string for column and cell styling.
 */
function buildColumnHeaderStyles(props: TitanGridContainerProps, gridId: string): string {
    const fontSize = getFontSizeValue(props.fontSize || "size12");
    const fontWeight = getFontWeightValue(props.headerFontWeight || "600");
    const columnWidthCss = buildColumnWidthCss(props);
    const textAlign = props.columnAlignment || "left";
    const textWrap = props.columnTextWrap || false ? "normal" : "nowrap";
    const textOverflow = props.columnTextWrap || false ? "initial" : "ellipsis";
    const headerBgColor = props.headerBackgroundColor || "#f5f7fa";
    const isDark = (props.gridTheme || "alpine") === "dark";
    const baseBgColor = isDark ? "#2d2d2d" : "#ffffff";

    // ✅ Enhanced resizer styles for resizable mode
    let resizerStyles = "";
    if (props.columnWidthMode === "resizable") {
        resizerStyles = `
                /* ✅ TanStack Table Resizer Styles */
                #${gridId} .resizer {
                    position: absolute;
                    right: 0;
                    top: 0;
                    height: 100%;
                    width: 5px;
                    background: rgba(0, 0, 0, 0.1);
                    cursor: col-resize;
                    user-select: none;
                    touch-action: none;
                    z-index: 10;
                    opacity: 0;
                    transition: opacity 0.2s ease, background 0.2s ease;
                }
                
                #${gridId} .dynamic-grid th:hover .resizer {
                    opacity: 1;
                }
                
                #${gridId} .resizer:hover,
                #${gridId} .resizer.isResizing {
                    background: rgba(25, 118, 210, 0.6);
                    opacity: 1;
                }
                
                #${gridId} .resizer.isResizing {
                    background: #1976d2;
                    width: 3px;
                    right: -1px;
                }
            `;
    }

    return `
            /* Column Styles for ${gridId} */
            #${gridId} .dynamic-grid th {
                background-color: ${headerBgColor};
                padding: 8px 12px;
                text-align: ${textAlign};
                font-weight: ${fontWeight};
                font-size: ${fontSize}px;
                color: #000000;
                height: ${getHeaderHeight(props)}px;
                box-sizing: border-box;
                white-space: ${textWrap};
                overflow: hidden;
                text-overflow: ${textOverflow};
                background-clip: padding-box;
                box-shadow: 0 0 0 0.5px ${headerBgColor};
                ${columnWidthCss}
            }
            
            #${gridId} .dynamic-grid td {
                text-align: ${textAlign};
                white-space: ${textWrap};
                overflow: hidden;
                text-overflow: ${textOverflow};
                box-sizing: border-box;
                padding: 4px 12px;
                vertical-align: middle;
                background-clip: padding-box;
                box-shadow: 0 0 0 0.5px ${baseBgColor};
            }
            
            #${gridId} .dynamic-grid td:last-child {
                border-right: none;
            }
            
            #${gridId} .header-content {
                display: flex;
                align-items: center;
                font-weight: ${fontWeight};
                color: #000000;
                white-space: ${textWrap};
                overflow: hidden;
                text-overflow: ${textOverflow};
                width: 100%;
            }
            
            #${gridId} .column-header {
                font-weight: ${fontWeight};
                color: #000000;
                white-space: ${textWrap};
                overflow: hidden;
                text-overflow: ${textOverflow};
                width: 100%;
            }
            
            #${gridId} .cell-data {
                color: #212529;
                line-height: 1.4;
                white-space: ${textWrap};
                overflow: hidden;
                text-overflow: ${textOverflow};
                display: flex;
                align-items: center;
                width: 100%;
            }
            
            ${resizerStyles}
            
            /* ✅ Enhanced column behavior for resizable mode */
            ${
                props.columnWidthMode === "resizable"
                    ? `
                #${gridId} .dynamic-grid {
                    table-layout: fixed;
                }
                #${gridId} .dynamic-grid th,
                #${gridId} .dynamic-grid td {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            `
                    : ""
            }
        `;
}

/**
 * Generates row body styles including alternating row colours and hover effects.
 *
 * @param props  - Widget configuration properties.
 * @param gridId - Unique CSS id used to scope all selectors.
 * @returns CSS string for row body styling.
 */
function buildRowBodyStyles(props: TitanGridContainerProps, gridId: string): string {
    const isDark = (props.gridTheme || "alpine") === "dark";
    const baseBgColor = isDark ? "#2d2d2d" : "#ffffff";

    let styles = `
            /* Row Styles for ${gridId} */
            #${gridId} .dynamic-grid td {
                padding: 4px 12px;
                background-color: ${baseBgColor};
                height: ${getRowHeight(props)}px;
                box-sizing: border-box;
                vertical-align: middle;
                background-clip: padding-box;
                box-shadow: 0 0 0 0.5px ${baseBgColor};
            }
            
            #${gridId} .empty-message-cell,
            #${gridId} .grid-card-empty {
                background-color: #f9f9f9;
                color: #888888;
                border-color: #cccccc;
            }
            
            #${gridId} .dynamic-grid td:last-child {
                border-right: none;
            }
        `;

    // Alternating row colors (theme-aware defaults)
    if (props.enableAlternatingRows !== false) {
        const isDark = (props.gridTheme || "alpine") === "dark";
        const evenRowColor = props.evenRowColor || (isDark ? "#383838" : "#f9f9f9");
        const oddRowColor = props.oddRowColor || (isDark ? "#2d2d2d" : "#ffffff");

        styles += `
                #${gridId} .dynamic-grid tbody tr:nth-child(odd) {
                    background-color: ${oddRowColor};
                }
                
                #${gridId} .dynamic-grid tbody tr:nth-child(odd) td {
                    background-color: ${oddRowColor};
                }
                
                #${gridId} .dynamic-grid tbody tr:nth-child(even) {
                    background-color: ${evenRowColor};
                }
                
                #${gridId} .dynamic-grid tbody tr:nth-child(even) td {
                    background-color: ${evenRowColor};
                }
            `;
    }

    // Row hover effects
    if (props.enableRowHover !== false) {
        const hoverColor = props.hoverRowColor || (isDark ? "#4a4a4a" : "#e1f5fe");

        styles += `
                #${gridId} .dynamic-grid tbody tr {
                    transition: background-color 0.1s ease;
                }
                
                #${gridId} .dynamic-grid tbody tr:hover {
                    background-color: ${hoverColor};
                }
                
                #${gridId} .dynamic-grid tbody tr:hover td {
                    background-color: ${hoverColor};
                }
            `;
    }

    return styles;
}

/**
 * Generates border styles for the outer container, cell edges, and the prominent
 * header-bottom divider. Controlled by `gridBorderStyle`, `gridBorderLineStyle`,
 * `rowBorderStyle`, and `borderColor` widget properties.
 *
 * @param props  - Widget configuration properties.
 * @param gridId - Unique CSS id used to scope all selectors.
 * @returns CSS string for border styling.
 */
function buildBorderLayoutStyles(props: TitanGridContainerProps, gridId: string): string {
    const borderWidth = getBorderWidth(props.rowBorderStyle || "light");
    const borderColor = props.borderColor || "#BDC3C7";
    const lineStyle = props.gridBorderLineStyle || "solid";
    const borderPreset = props.gridBorderStyle || "all";

    // Determine which edges to draw based on the border preset
    const showOuterBorder = borderPreset !== "none";
    const showRowBorders = borderPreset === "all" || borderPreset === "horizontal";
    const showColumnBorders = borderPreset === "all" || borderPreset === "vertical";
    const showHeaderBorders = borderPreset !== "none";

    const borderValue = `${borderWidth} ${lineStyle} ${borderColor}`;
    let borderStyles = `/* Enhanced Border Styles for ${gridId} */\n`;

    // 1. Outer Border on the container
    borderStyles += `
            #${gridId} .table-container {
                border: ${showOuterBorder ? borderValue : "none"};
            }
        `;

    // 2. Cell Borders
    borderStyles += `
            #${gridId} .dynamic-grid th,
            #${gridId} .dynamic-grid td {
                border-right: ${showColumnBorders ? borderValue : "none"};
                border-bottom: ${showRowBorders ? borderValue : "none"};
            }
        `;

    // 3. Header specific borders
    if (!showHeaderBorders) {
        borderStyles += `
                #${gridId} .dynamic-grid th {
                    border-right: none;
                    border-bottom: none;
                }
            `;
    } else {
        // Header bottom border is usually more prominent in AG Grid
        borderStyles += `
                #${gridId} .dynamic-grid thead tr:last-child th {
                    border-bottom: ${borderWidth === "1px" ? "2px" : "3px"} ${lineStyle} ${borderColor};
                }
            `;
    }

    // 4. Cleanup outer edges to prevent double borders with container
    borderStyles += `
            #${gridId} .dynamic-grid th:last-child,
            #${gridId} .dynamic-grid td:last-child {
                border-right: none;
            }
            
            #${gridId} .dynamic-grid tbody tr:last-child td {
                border-bottom: none;
            }
        `;

    return borderStyles;
}

/**
 * Generates theme-specific CSS overrides.
 * Each theme (material, bootstrap, dark, minimal) applies colour and typography
 * tweaks on top of the base styles. The default "alpine" theme relies entirely
 * on the base styles so returns an empty comment.
 *
 * @param props  - Widget configuration properties.
 * @param gridId - Unique CSS id used to scope all selectors.
 * @returns CSS string for the active theme.
 */
function buildThemeOverrideStyles(props: TitanGridContainerProps, gridId: string): string {
    const theme = props.gridTheme || "alpine";

    switch (theme) {
        case "material":
            return buildMaterialThemeStyles(gridId);
        case "bootstrap":
            return buildBootstrapThemeStyles(gridId);
        case "dark":
            return buildDarkThemeStyles(gridId);
        case "minimal":
            return buildMinimalThemeStyles(gridId);
        case "alpine":
        default:
            return `/* Alpine Theme for ${gridId} — base styles apply */`;
    }
}

/**
 * Material Design theme overrides.
 * @param gridId - Grid CSS id.
 */
function buildMaterialThemeStyles(gridId: string): string {
    return `
        /* Material Theme for ${gridId} */
        #${gridId} .dynamic-grid th {
            background-color: #f5f5f5;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
            font-weight: 500;
            border-bottom: 2px solid #e0e0e0;
        }
        
        #${gridId} .dynamic-grid tbody tr:hover {
            background-color: #e3f2fd;
        }
        
        #${gridId} .dynamic-grid tbody tr:hover td {
            background-color: #e3f2fd;
        }
    `;
}

/**
 * Bootstrap theme overrides.
 * @param gridId - Grid CSS id.
 */
function buildBootstrapThemeStyles(gridId: string): string {
    return `
        /* Bootstrap Theme for ${gridId} */
        #${gridId} .dynamic-grid {
            border-collapse: separate;
            border-spacing: 0;
            border: 1px solid #dee2e6;
        }
        
        #${gridId} .dynamic-grid th {
            background-color: #e9ecef;
            border-color: #dee2e6;
            color: #495057;
            font-weight: 600;
        }
        
        #${gridId} .dynamic-grid td {
            border-color: #dee2e6;
        }
        
        #${gridId} .dynamic-grid tbody tr:hover {
            background-color: #f5f5f5;
        }
        
        #${gridId} .dynamic-grid tbody tr:hover td {
            background-color: #f5f5f5;
        }
    `;
}

/**
 * Dark theme overrides — inverts colours for a dark background palette.
 * @param gridId - Grid CSS id.
 */
function buildDarkThemeStyles(gridId: string): string {
    return `
        /* Dark Theme for ${gridId} */
        #${gridId} {
            background-color: #1a1a1a;
            color: #e0e0e0;
            --dg-text: #e0e0e0;
            --dg-border-color: #555555;
            --dg-card-bg: #2d2d2d;
            --dg-header-bg: #404040;
            --dg-hover: #4a4a4a;
        }
        
        #${gridId} .dynamic-grid {
            background-color: #2d2d2d;
            color: #e0e0e0;
            border-color: #555555;
        }
        
        #${gridId} .dynamic-grid th {
            background-color: #404040;
            color: #ffffff;
            border-color: #555555;
        }
        
        #${gridId} .dynamic-grid td {
            background-color: #2d2d2d;
            color: #e0e0e0;
            border-color: #555555;
        }
        
        #${gridId} .dynamic-grid tbody tr:nth-child(odd) td {
            background-color: #2d2d2d;
        }
        
        #${gridId} .dynamic-grid tbody tr:nth-child(even) td {
            background-color: #383838;
        }
        
        #${gridId} .dynamic-grid tbody tr:hover td {
            background-color: #4a4a4a;
        }
        
        #${gridId} .cell-data {
            color: #e0e0e0;
        }
        
        #${gridId} .column-header,
        #${gridId} .header-content {
            color: #ffffff;
        }
        
        #${gridId} .row-header-text {
            color: #e0e0e0;
        }
        
        #${gridId} .table-container {
            background-color: #2d2d2d;
            border-color: #555555;
        }
        
        #${gridId} .aggregation-cell,
        #${gridId} .aggregation-footer {
            color: #e0e0e0;
            border-color: #555555;
        }
        
        #${gridId} .aggregation-value {
            color: #e0e0e0;
        }
        
        #${gridId} .table-container::-webkit-scrollbar-track {
            background: #2d2d2d;
        }
        
        #${gridId} .table-container::-webkit-scrollbar-thumb {
            background: #555555;
            border-color: #2d2d2d;
        }
        
        #${gridId} .table-container::-webkit-scrollbar-thumb:hover {
            background: #666666;
        }
        
        #${gridId} .custom-footer-placeholder,
        #${gridId} .custom-column-placeholder {
            color: #888888;
        }

        #${gridId} .empty-message-cell,
        #${gridId} .grid-card-empty {
            background-color: #2d2d2d;
            color: #e0e0e0;
            border-color: #555555;
        }
    `;
}

/**
 * Minimal theme overrides — removes all decorative borders and backgrounds.
 * @param gridId - Grid CSS id.
 */
function buildMinimalThemeStyles(gridId: string): string {
    return `
        /* Minimal Theme for ${gridId} */
        #${gridId} .dynamic-grid {
            border: none;
        }
        
        #${gridId} .dynamic-grid th,
        #${gridId} .dynamic-grid td {
            border: none;
            border-bottom: 1px solid #f0f0f0;
        }
        
        #${gridId} .dynamic-grid th {
            background-color: #ffffff;
            border-bottom: 2px solid #e0e0e0;
            font-weight: 500;
        }
        
        #${gridId} .dynamic-grid tbody tr:hover {
            background-color: #fafafa;
        }
        
        #${gridId} .dynamic-grid tbody tr:hover td {
            background-color: #fafafa;
        }
        
        #${gridId} .table-container {
            border: none;
        }
    `;
}

/**
 * Generates responsive media query styles that reduce padding, font sizes, and
 * row heights on smaller viewports. Uses the `responsiveBreakpoint` property to
 * determine the threshold at which mobile adjustments kick in.
 *
 * @param props  - Widget configuration properties.
 * @param gridId - Unique CSS id used to scope all selectors.
 * @returns CSS string containing `@media` blocks.
 */
export function buildResponsiveMediaStyles(props: TitanGridContainerProps, gridId: string): string {
    const fontSize = getFontSizeValue(props.fontSize || "size12");
    const responsiveFontSize = Math.max(10, fontSize - 1);
    const rowHeight = getRowHeight(props);
    const responsiveRowHeight = Math.max(20, rowHeight - 4);
    const responsiveBreakpoint = getResponsiveBreakpoint(props.responsiveBreakpoint || "s768px");

    return `
            /* Responsive Styles for ${gridId} */
            @media (max-width: ${responsiveBreakpoint}) {
                #${gridId} .dynamic-grid th,
                #${gridId} .dynamic-grid td {
                    padding: 4px 8px;
                    font-size: ${responsiveFontSize}px;
                }
                
                #${gridId} .dynamic-grid th {
                    height: 28px;
                }
                
                #${gridId} .dynamic-grid td {
                    height: ${responsiveRowHeight}px;
                }
                
                #${gridId} .cell-data {
                    font-size: ${responsiveFontSize}px;
                }
                
                #${gridId} .header-content {
                    font-size: ${responsiveFontSize}px;
                }
                
                ${
                    props.enableResponsiveScrollbars
                        ? `
                    #${gridId} .table-container::-webkit-scrollbar {
                        width: 8px;
                        height: 8px;
                    }
                `
                        : ""
                }
            }
            
            @media (max-width: 480px) {
                #${gridId} .dynamic-grid th,
                #${gridId} .dynamic-grid td {
                    padding: 2px 6px;
                    font-size: ${Math.max(9, responsiveFontSize - 1)}px;
                }
                
                #${gridId} .dynamic-grid th {
                    height: 24px;
                }
                
                #${gridId} .dynamic-grid td {
                    height: ${Math.max(18, responsiveRowHeight - 4)}px;
                }
                
                ${
                    props.mobileGridHeight
                        ? `
                    #${gridId} .table-container {
                        height: ${props.mobileGridHeight};
                        max-height: 60vh;
                    }
                `
                        : ""
                }
            }
        `;
}

/**
 * Generates loading, error, and empty-state placeholder CSS.
 * These classes are toggled by the main TitanGrid component on data load events.
 *
 * @param gridId - Unique CSS id used to scope all selectors.
 * @returns CSS string for state styles.
 */
export function buildLoadingErrorEmptyStyles(gridId: string): string {
    return `
            /* State Styles for ${gridId} */
            
            /* Loading State */
            #${gridId}.dynamic-grid-widget.loading {
                opacity: 0.6;
                pointer-events: none;
                position: relative;
            }
            
            #${gridId} .loading-placeholder {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 40px 20px;
                color: #757575;
                background-color: #ffffff;
                border: 1px solid #E0E0E0;
                border-radius: 4px;
            }
            
            #${gridId} .loading-placeholder span {
                font-size: 14px;
                font-weight: 500;
            }
            
            /* Error State */
            #${gridId}.dynamic-grid-widget.error {
                border: 2px solid #f44336;
                border-radius: 4px;
            }
            
            #${gridId} .error-placeholder {
                padding: 20px;
                background-color: #ffebee;
                color: #c62828;
                text-align: center;
            }
            
            #${gridId} .error-placeholder p {
                margin: 0 0 8px 0;
                font-weight: 600;
                font-size: 14px;
            }
            
            #${gridId} .error-placeholder small {
                color: #e57373;
                font-size: 12px;
            }
            
            /* Grid Error */
            #${gridId} .grid-error {
                padding: 20px;
                background-color: #fff3e0;
                border: 1px solid #ffb74d;
                border-radius: 4px;
                color: #ef6c00;
                text-align: center;
            }
            
            #${gridId} .grid-error p {
                margin: 0 0 8px 0;
                font-weight: 600;
            }
            
            #${gridId} .grid-error small {
                color: #ff9800;
                font-size: 11px;
            }
            
            /* Empty State */
            #${gridId} .empty-state {
                text-align: center;
                padding: 40px 20px;
                color: #757575;
                background-color: #ffffff;
                border: 1px solid #E0E0E0;
                border-radius: 4px;
            }
            
            #${gridId} .empty-state p {
                margin: 0 0 4px 0;
                font-size: 14px;
                font-weight: 500;
                color: #424242;
            }
            
            #${gridId} .empty-state small {
                font-size: 12px;
                color: #757575;
            }
        `;
}

/**
 * Generates responsive scroll container CSS including mobile-specific height overrides.
 *
 * @param props  - Widget configuration properties.
 * @param gridId - Unique CSS id used to scope all selectors.
 * @returns CSS string for scroll container behaviour.
 */
export function buildScrollContainerStyles(props: TitanGridContainerProps, gridId: string): string {
    const containerHeight = props.gridHeight || "500px";
    const maxWidth = props.maxGridWidth || "100vw";

    return `
            /* Responsive Scroll Styles for ${gridId} */

            /* Mobile responsive adjustments */
            @media (max-width: 768px) {
                #${gridId} .table-container {
                    width: 100%;
                    max-width: 100vw;
                    height: ${props.mobileGridHeight || (containerHeight === "500px" ? "400px" : containerHeight)};
                    max-height: 70vh;
                }
            }
            
            @media (max-width: 480px) {
                #${gridId} .table-container {
                    height: ${props.mobileGridHeight || (containerHeight === "500px" ? "300px" : containerHeight)};
                    max-height: 60vh;
                }
            }
            
            /* Large screen optimizations */
            @media (min-width: 1200px) {
                #${gridId} .table-container {
                    max-width: ${maxWidth === "100vw" ? "1400px" : maxWidth};
                }
            }
        `;
}

/**
 * Generates aggregation row and column CSS — backgrounds, borders, font weights,
 * and sticky positioning for pinned totals.
 *
 * @param props  - Widget configuration properties.
 * @param gridId - Unique CSS id used to scope all selectors.
 * @returns CSS string for aggregation cell styles.
 */
export function generateAggregationStyles(props: TitanGridContainerProps, gridId: string): string {
    const headerBgColor = props.headerBackgroundColor || "#f5f7fa";
    const borderColor = props.borderColor || "#BDC3C7";
    const theme = props.gridTheme || "alpine";

    // Theme-aware colour palette for aggregation cells
    const palette = buildAggregationColorPalette(theme, headerBgColor, borderColor);

    let styles = `
            /* Aggregation Styles for ${gridId} */
            #${gridId} .aggregation-footer {
                background-color: ${palette.footerBg};
                border-top: 2px solid ${palette.border};
                font-weight: 600;
            }
            
            #${gridId} .aggregation-cell {
                padding: 8px 12px 8px 0px;
                /* background-color: ${palette.cellBg}; */
                font-weight: 600;
                border-color: ${palette.border};
            }
            
            #${gridId} .aggregation-label {
                font-weight: 700;
                color: ${palette.labelColor};
                text-align: left;
            }
            
            #${gridId} .aggregation-value {
                display: flex;
                align-items: center;
                color: ${palette.valueColor};
                font-weight: 600;
            }
            
            #${gridId} .agg-label {
                font-size: 10px;
                text-transform: uppercase;
                color: ${palette.subtleColor};
                font-weight: 500;
            }
            
            #${gridId} .agg-value {
                font-weight: 700;
                color: ${palette.boldValueColor};
            }
            
            #${gridId} .aggregation-header {
                color: ${palette.headerColor};
                font-weight: 700;
            }
            
            #${gridId} .aggregation-cell-data {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            #${gridId} .custom-footer-row {
                background-color: ${palette.footerRowBg};
            }
            
            #${gridId} .custom-footer-cell {
                font-weight: 600;
                background-color: ${palette.footerRowBg};
                border-color: ${palette.border};
            }
            
            #${gridId} .custom-footer-placeholder {
                font-style: italic;
                color: ${palette.subtleColor};
            }
            
            #${gridId} .custom-footer-error {
                background-color: ${palette.errorBg};
                color: ${palette.errorColor};
                border-radius: 4px;
            }
        `;

    // Pinned total row — sticky vertical
    if (props.pinTotalRow && props.enableRowAggregation) {
        const aggregationPosition = props.aggregationPosition || "bottom";
        const stickyEdge = aggregationPosition === "top" ? "top: 0" : "bottom: 0";
        const rowShadow =
            aggregationPosition === "top"
                ? "box-shadow: 0 2px 6px rgba(0,0,0,0.15)"
                : "box-shadow: 0 -2px 6px rgba(0,0,0,0.15)";

        styles += `
                /* Pinned Total Row */
                #${gridId} .dynamic-grid tbody tr[data-aggregation-row="true"],
                #${gridId} .dynamic-grid tfoot tr[data-aggregation-row="true"] {
                    position: sticky;
                    ${stickyEdge};
                    z-index: 3;
                    ${rowShadow};
                }

                #${gridId} .dynamic-grid tbody tr[data-aggregation-row="true"] td,
                #${gridId} .dynamic-grid tfoot tr[data-aggregation-row="true"] td {
                    position: sticky;
                    ${stickyEdge};
                    background-color: ${palette.cellBg};
                    z-index: 3;
                }
            `;
    }

    // Pinned total column — sticky horizontal
    if (props.pinTotalColumn && props.enableColumnAggregation) {
        const columnAggregationPosition = props.columnAggregationPosition || "right";
        const stickyEdge = columnAggregationPosition === "left" ? "left: 0" : "right: 0";
        const columnShadow =
            columnAggregationPosition === "left"
                ? "box-shadow: 2px 0 6px rgba(0,0,0,0.15)"
                : "box-shadow: -2px 0 6px rgba(0,0,0,0.15)";

        styles += `
                /* Pinned Total Column */
                #${gridId} .dynamic-grid th[data-aggregation-col="true"],
                #${gridId} .dynamic-grid td[data-aggregation-col="true"] {
                    position: sticky;
                    ${stickyEdge};
                    z-index: 2;
                    ${columnShadow};
                    background-color: ${palette.cellBg};
                }

                #${gridId} .dynamic-grid th[data-aggregation-col="true"] {
                    background-color: ${palette.footerBg};
                    z-index: 4;
                }

                /* Corner cell — pinned row + pinned column intersection */
                #${gridId} .dynamic-grid tbody tr[data-aggregation-row="true"] td[data-aggregation-col="true"],
                #${gridId} .dynamic-grid tfoot tr[data-aggregation-row="true"] td[data-aggregation-col="true"] {
                    z-index: 5;
                }
            `;
    }

    return styles;
}

/**
 * Returns a theme-appropriate colour palette object for aggregation cell styling.
 * Each palette contains named colour tokens used throughout the aggregation CSS.
 *
 * @param theme         - The active grid theme name.
 * @param headerBgColor - The configured header background colour.
 * @param borderColor   - The configured border colour.
 * @returns An object with named colour values.
 */
export function buildAggregationColorPalette(theme: string, headerBgColor: string, borderColor: string) {
    switch (theme) {
        case "dark":
            return {
                footerBg: "#363636",
                cellBg: "#3a3a3a",
                footerRowBg: "#363636",
                border: "#555555",
                labelColor: "#b0b0b0",
                valueColor: "#e0e0e0",
                boldValueColor: "#ffffff",
                subtleColor: "#888888",
                headerColor: "#ffffff",
                errorBg: "#5c2020",
                errorColor: "#f5a5a5"
            };
        case "material":
            return {
                footerBg: "#e8eaf6",
                cellBg: "#e8eaf6",
                footerRowBg: "#e8eaf6",
                border: "#c5cae9",
                labelColor: "#3f51b5",
                valueColor: "#1a237e",
                boldValueColor: "#1a237e",
                subtleColor: "#7986cb",
                headerColor: "#1a237e",
                errorBg: "#ffebee",
                errorColor: "#c62828"
            };
        case "bootstrap":
            return {
                footerBg: "#e9ecef",
                cellBg: "#e9ecef",
                footerRowBg: "#e9ecef",
                border: "#dee2e6",
                labelColor: "#495057",
                valueColor: "#212529",
                boldValueColor: "#212529",
                subtleColor: "#6c757d",
                headerColor: "#212529",
                errorBg: "#f8d7da",
                errorColor: "#721c24"
            };
        case "minimal":
            return {
                footerBg: "#ffffff",
                cellBg: "#ffffff",
                footerRowBg: "#ffffff",
                border: "#e0e0e0",
                labelColor: "#757575",
                valueColor: "#424242",
                boldValueColor: "#212121",
                subtleColor: "#9e9e9e",
                headerColor: "#424242",
                errorBg: "#fff3e0",
                errorColor: "#e65100"
            };
        default:
            return {
                footerBg: lightenHexColor(headerBgColor, 0.5),
                cellBg: lightenHexColor(headerBgColor, 0.3),
                footerRowBg: lightenHexColor(headerBgColor, 0.3),
                border: borderColor,
                labelColor: "#495057",
                valueColor: "#495057",
                boldValueColor: "#212529",
                subtleColor: "#6c757d",
                headerColor: "#000000",
                errorBg: "#f8d7da",
                errorColor: "#721c24"
            };
    }
}

/**
 * Generates scrollbar appearance CSS using the `scrollbarStyle` and `scrollbarWidth`
 * widget properties. Supports "modern", "minimal", "classic", and "hidden" styles.
 *
 * @param gridId - Unique CSS id used to scope all selectors.
 * @param props  - Widget configuration properties.
 * @returns CSS string for scrollbar styling.
 */
export function generateScrollbarStyles(gridId: string, props: TitanGridContainerProps): string {
    const scrollbarStyle = props.scrollbarStyle || "modern";
    const scrollbarWidth = props.scrollbarWidth || "normal";

    /** Returns the pixel size string for the scrollbar track based on the width setting. */
    const resolveScrollbarSize = (): string => {
        switch (scrollbarWidth) {
            case "thin":
                return "8px";
            case "thick":
                return "16px";
            case "normal":
            default:
                return "12px";
        }
    };

    const scrollbarSizePixels = resolveScrollbarSize();

    // Hidden scrollbars — suppress both Webkit and Firefox scrollbars
    if (scrollbarStyle === "hidden") {
        return `
                /* Hidden Scrollbars for ${gridId} */
                #${gridId} .table-container {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                #${gridId} .table-container::-webkit-scrollbar {
                    display: none;
                }
            `;
    }

    /** Returns webkit scrollbar thumb CSS based on the style setting. */
    const resolveThumbStyles = (): string => {
        switch (scrollbarStyle) {
            case "minimal":
                return `
                        background: rgba(0, 0, 0, 0.2);
                        border-radius: 2px;
                        border: none;
                    `;
            case "classic":
                return `
                        background: #d4d4d4;
                        border: 1px solid #b0b0b0;
                        border-radius: 0;
                    `;
            case "modern":
            default:
                return `
                        background: linear-gradient(45deg, #6c757d, #adb5bd);
                        border-radius: 6px;
                        border: 2px solid #f8f9fa;
                    `;
        }
    };

    /** Returns webkit scrollbar track CSS based on the style setting. */
    const resolveTrackStyles = (): string => {
        switch (scrollbarStyle) {
            case "minimal":
                return `
                        background: transparent;
                        border: none;
                    `;
            case "classic":
                return `
                        background: #f0f0f0;
                        border: 1px solid #d0d0d0;
                        border-radius: 0;
                    `;
            case "modern":
            default:
                return `
                        background: #f8f9fa;
                        border-radius: 6px;
                        border: 1px solid #e9ecef;
                    `;
        }
    };

    return `
            /* ${scrollbarStyle.charAt(0).toUpperCase() + scrollbarStyle.slice(1)} Scrollbars for ${gridId} */
            #${gridId} .table-container {
                scrollbar-width: ${scrollbarWidth === "thin" ? "thin" : "auto"};
                scrollbar-color: #6c757d #f8f9fa;
                scrollbar-gutter: stable;
            }
            
            #${gridId} .table-container::-webkit-scrollbar {
                width: ${scrollbarSizePixels};
                height: ${scrollbarSizePixels};
            }
            
            #${gridId} .table-container::-webkit-scrollbar-track {
                ${resolveTrackStyles()}
            }
            
            #${gridId} .table-container::-webkit-scrollbar-thumb {
                ${resolveThumbStyles()}
                transition: background 0.2s ease;
            }
            
            #${gridId} .table-container::-webkit-scrollbar-thumb:hover {
                ${
                    scrollbarStyle === "minimal"
                        ? "background: rgba(0, 0, 0, 0.4);"
                        : scrollbarStyle === "classic"
                        ? "background: #c0c0c0;"
                        : "background: linear-gradient(45deg, #495057, #6c757d);"
                }
            }
            
            #${gridId} .table-container::-webkit-scrollbar-thumb:active {
                ${
                    scrollbarStyle === "minimal"
                        ? "background: rgba(0, 0, 0, 0.6);"
                        : scrollbarStyle === "classic"
                        ? "background: #a0a0a0;"
                        : "background: linear-gradient(45deg, #343a40, #495057);"
                }
            }
            
            #${gridId} .table-container::-webkit-scrollbar-corner {
                ${resolveTrackStyles()}
            }
            
            /* High DPI display adjustments */
            @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
                #${gridId} .table-container::-webkit-scrollbar {
                    width: ${scrollbarWidth === "thin" ? "12px" : scrollbarWidth === "thick" ? "20px" : "16px"};
                    height: ${scrollbarWidth === "thin" ? "12px" : scrollbarWidth === "thick" ? "20px" : "16px"};
                }
            }
        `;
}

/**
 * Generates focus ring, selection highlight, and click-cursor interaction styles.
 *
 * @param props  - Widget configuration properties.
 * @param gridId - Unique CSS id used to scope all selectors.
 * @returns CSS string for interaction styles.
 */
export function generateInteractionStyles(props: TitanGridContainerProps, gridId: string): string {
    return `
            /* Interaction Styles for ${gridId} */
            #${gridId} .dynamic-grid td:focus {
                outline: 2px solid #1976d2;
                outline-offset: -2px;
            }
            
            #${gridId} .cell-data.selected {
                background-color: #bbdefb;
                color: #0d47a1;
            }
            
            #${gridId} .dynamic-grid-widget.loading {
                opacity: 0.6;
                pointer-events: none;
            }
            
            #${gridId} .dynamic-grid th[style*="cursor: pointer"]:hover {
                background-color: ${lightenHexColor(props.headerBackgroundColor || "#f5f7fa", 0.2)};
            }
            
            #${gridId} .dynamic-grid td[style*="cursor: pointer"]:hover {
                background-color: ${props.hoverRowColor || "#e1f5fe"};
            }
        `;
}

/**
 * Converts a fontSize widget property key to a numeric pixel value.
 *
 * @param fontSize - One of the valid fontSize enum values.
 * @returns The corresponding pixel size as a number.
 */
export function getFontSizeValue(fontSize: string): number {
    switch (fontSize) {
        case "size10":
            return 10;
        case "size12":
            return 12;
        case "size14":
            return 14;
        case "size16":
            return 16;
        default:
            return 12;
    }
}

/**
 * Converts a headerFontWeight widget property key to a CSS font-weight string.
 *
 * @param fontWeight - One of the valid headerFontWeight enum values.
 * @returns The CSS font-weight string.
 */
export function getFontWeightValue(fontWeight: string): string {
    switch (fontWeight) {
        case "weight400":
            return "400";
        case "weight500":
            return "500";
        case "weight600":
            return "600";
        case "weight700":
            return "700";
        default:
            return "600";
    }
}

/**
 * Converts a rowHeightMode widget property to a pixel height number.
 *
 * @param props - Widget configuration properties.
 * @returns The row height in pixels.
 */
export function getRowHeight(props: TitanGridContainerProps): number {
    const mode = props.rowHeightMode || "auto";
    const manualHeight = props.manualRowHeight || 28;

    switch (mode) {
        case "compact":
            return 24;
        case "comfortable":
            return 32;
        case "spacious":
            return 40;
        case "manual":
            return manualHeight;
        case "auto":
        default:
            return 28;
    }
}

/**
 * Returns the fixed header row height in pixels.
 * This may be made dynamic in a future release.
 *
 * @param _props - Widget configuration properties (reserved for future use).
 * @returns The header height in pixels.
 */
export function getHeaderHeight(_props: TitanGridContainerProps): number {
    // Currently fixed at 32px — could be derived from props in future
    return 32;
}

/**
 * Builds the CSS width declaration for a column `<th>` based on the
 * `columnWidthMode` widget property.
 *
 * @param props - Widget configuration properties.
 * @returns A CSS property string for width/min-width/max-width.
 */
export function buildColumnWidthCss(props: TitanGridContainerProps): string {
    const mode = props.columnWidthMode || "auto";
    const manualWidth = props.manualColumnWidth || 120;

    switch (mode) {
        case "manual":
            return `width: ${manualWidth}px; min-width: ${manualWidth}px; max-width: ${manualWidth}px;`;
        case "equal":
            return "width: auto; table-layout: fixed;";
        case "resizable":
            // ✅ FIXED: Let TanStack react-table control the exact width inline.
            return `position: relative; box-sizing: border-box;`;
        case "auto":
        default:
            return "width: auto;";
    }
}

/**
 * Converts a rowBorderStyle widget property key to a CSS border-width string.
 *
 * @param style - One of the valid rowBorderStyle enum values.
 * @returns A CSS border-width string (e.g. "1px", "2px").
 */
export function getBorderWidth(style: string): string {
    switch (style) {
        case "light":
            return "1px";
        case "medium":
            return "2px";
        case "heavy":
            return "3px";
        case "none":
            return "0px";
        default:
            return "1px";
    }
}

/**
 * Lightens a CSS hex colour by blending it toward white.
 *
 * @param color  - A hex colour string (e.g. "#f5f7fa"). Non-hex values are returned as-is.
 * @param factor - A value from 0 (no change) to 1 (pure white).
 * @returns A lightened hex colour string.
 */
export function lightenHexColor(color: string, factor: number): string {
    if (!color || !color.startsWith("#")) {
        return color || "#f5f7fa";
    }

    try {
        const hex = color.replace("#", "");
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        const newR = Math.min(255, Math.floor(r + (255 - r) * factor));
        const newG = Math.min(255, Math.floor(g + (255 - g) * factor));
        const newB = Math.min(255, Math.floor(b + (255 - b) * factor));

        return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB
            .toString(16)
            .padStart(2, "0")}`;
    } catch (error) {
        return color;
    }
}

/**
 * Converts a responsiveBreakpoint widget property key to a CSS max-width string.
 *
 * @param breakpoint - One of the valid responsiveBreakpoint enum values.
 * @returns A CSS pixel string (e.g. "768px").
 */
export function getResponsiveBreakpoint(breakpoint: string): string {
    switch (breakpoint) {
        case "s480px":
            return "480px";
        case "s768px":
            return "768px";
        case "s1024px":
            return "1024px";
        default:
            return "768px"; // Default fallback
    }
}
