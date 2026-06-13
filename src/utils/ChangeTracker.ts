import { TitanGridContainerProps } from "typings/TitanGridProps";
import { GridMatrixData } from "./DataProcessor";
import { calculateColumnAggregation, calculateRowAggregation } from "./GridBuilder";
import { Logger } from "./Logger";

let gridUpdateCallback: (() => void) | null = null;

export function setGridUpdateCallback(cb: (() => void) | null) {
    gridUpdateCallback = cb;
}

export { gridUpdateCallback };

export function setupGlobalChangeDetection(
    matrixData: GridMatrixData,
    props: TitanGridContainerProps,
    gridContainerSelector = ".dynamic-grid-widget",
    _cellSelector = ".cell-data"
) {
    let inputDebounce: NodeJS.Timeout;
    let changeDebounce: NodeJS.Timeout;

    /**
     * Handle real-time input events (keystrokes).
     * Does NOT trigger React re-render — only updates aggregation DOMs.
     * This prevents the input widget from losing its value mid-typing.
     */
    const handleInputEvent = (event: Event) => {
        const target = event.target as HTMLInputElement;
        if (!target || !target.closest) {
            return;
        }

        const gridContainer = target.closest(gridContainerSelector);
        if (!gridContainer) {
            return;
        }

        clearTimeout(inputDebounce);
        inputDebounce = setTimeout(() => {
            try {
                updateAggregationsInDOM(matrixData, props, gridContainer);
            } catch (error) {
                Logger.warn("DOM aggregation update failed", error);
            }
        }, 300);
    };

    /**
     * Handle committed change events (blur / enter / select change).
     * Triggers a full React re-render so aggregation rows rebuild
     * with the final committed values from Mendix.
     */
    const handleChangeEvent = (event: Event) => {
        const target = event.target as HTMLElement;
        if (!target || !target.closest) {
            return;
        }

        const gridContainer = target.closest(gridContainerSelector);
        if (!gridContainer) {
            return;
        }

        // Debounce to let Mendix commit the value first
        clearTimeout(changeDebounce);
        changeDebounce = setTimeout(() => {
            triggerGridUpdate();
        }, 500);
    };

    document.addEventListener("input", handleInputEvent, true);
    document.addEventListener("change", handleChangeEvent, true);

    return () => {
        document.removeEventListener("input", handleInputEvent, true);
        document.removeEventListener("change", handleChangeEvent, true);
        clearTimeout(inputDebounce);
        clearTimeout(changeDebounce);
    };
}

/**
 * Updates aggregation cell values directly in the DOM.
 * This avoids a React re-render while the user is typing.
 */
function updateAggregationsInDOM(matrixData: GridMatrixData, props: TitanGridContainerProps, gridContainer: Element) {
    // Update column aggregation cells (in the aggregation/last row)
    if (props.enableColumnAggregation && props.columnAggregationType !== "custom") {
        matrixData.sortedColumns.forEach(columnItem => {
            const columnKey = columnItem?.id || String(columnItem);
            try {
                const newValue = calculateColumnAggregation(matrixData, columnKey, props);
                // Find matching aggregation cell in the DOM and update
                const aggCells = gridContainer.querySelectorAll(
                    `.aggregation-cell[data-agg-col="${columnKey}"] .agg-value`
                );
                aggCells.forEach(cell => {
                    if (cell.textContent !== newValue) {
                        cell.textContent = newValue;
                    }
                });
            } catch (e) {
                // Silently skip — will be corrected on next full re-render
            }
        });
    }

    // Update row aggregation cells (last column per row)
    if (props.enableRowAggregation && props.rowAggregationType !== "custom") {
        matrixData.sortedRows.forEach(rowItem => {
            const rowKey = rowItem?.id || String(rowItem);
            try {
                const newValue = calculateRowAggregation(matrixData, rowKey, props);
                const aggCells = gridContainer.querySelectorAll(
                    `.aggregation-cell[data-agg-row="${rowKey}"] .agg-value`
                );
                aggCells.forEach(cell => {
                    if (cell.textContent !== newValue) {
                        cell.textContent = newValue;
                    }
                });
            } catch (e) {
                // Silently skip
            }
        });
    }
}

function triggerGridUpdate() {
    if (gridUpdateCallback) {
        gridUpdateCallback();
    }
}
