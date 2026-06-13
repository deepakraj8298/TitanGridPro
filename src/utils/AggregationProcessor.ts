import { AggregationValueExtractor } from "./AggregationValueExtractor";
import { Logger } from "./Logger";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AggregationProcessor {
    private static aggregationFunctions: { [key: string]: (values: number[]) => number | null } = {
        sum: values => values.reduce((a, b) => a + b, 0),
        avg: values => (values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0),
        count: values => values.length,
        min: values => (values.length > 0 ? Math.min(...values) : null),
        max: values => (values.length > 0 ? Math.max(...values) : null),
        first: values => (values.length > 0 ? values[0] : null),
        last: values => (values.length > 0 ? values[values.length - 1] : null)
    };

    private constructor() {
        // Static utility class
    }

    static calculate(values: any[], funcName: string): any {
        if (!values || values.length === 0) {
            return null;
        }

        if (funcName === "count") {
            const validValues = values.filter(v => v !== null && v !== undefined);
            return validValues.length;
        }

        const numericValues = values
            .filter(val => {
                if (val === null || val === undefined) {
                    return false;
                }

                if (typeof val === "number" && !isNaN(val) && isFinite(val)) {
                    return true;
                }

                if (typeof val === "string") {
                    const str = val.trim();
                    const num = Number(str);
                    if (!isNaN(num) && isFinite(num) && str !== "") {
                        return true;
                    }
                    return false;
                }

                return false;
            })
            .map(val => {
                if (typeof val === "string") {
                    return Number(val.trim());
                }
                return val;
            });

        if (numericValues.length === 0) {
            return funcName === "count" ? 0 : null;
        }

        const func = this.aggregationFunctions[funcName];
        if (!func) {
            Logger.warn(`Unsupported aggregation function: ${funcName}`);
            return null;
        }

        const result = func(numericValues);
        return result;
    }

    static collectValuesForAggregation(
        cellItems: any[],
        showCellAs: string,
        cellAttribute: any,
        cellTextTemplate: any,
        cellWidgets: any,
        widgetType?: string,
        isMounted?: () => boolean,
        targetAttributeName?: string
    ): any[] {
        const values: any[] = [];

        if (isMounted && !isMounted()) {
            Logger.warn("Component unmounted during aggregation");
            return values;
        }

        cellItems.forEach(cellItem => {
            if (!cellItem) {
                return;
            }

            if (isMounted && !isMounted()) {
                return;
            }

            const extractedValue = AggregationValueExtractor.extractValue(
                cellItem,
                showCellAs,
                cellAttribute,
                cellTextTemplate,
                cellWidgets,
                widgetType,
                isMounted,
                targetAttributeName
            );

            if (extractedValue !== null && extractedValue !== undefined) {
                values.push(extractedValue);
            } else {
                // Cell had no extractable value
            }
        });

        return values;
    }

    static formatValue(value: any, format?: string): string {
        if (value === null || value === undefined) {
            return "-";
        }

        if (typeof value === "number") {
            if (isNaN(value)) {
                return "NaN";
            }

            if (!isFinite(value)) {
                return value > 0 ? "∞" : "-∞";
            }

            if (format) {
                try {
                    /* eslint-disable no-template-curly-in-string */
                    return format
                        .replace("${value}", value.toString())
                        .replace("{value}", value.toString())
                        .replace("{value:n0}", Math.round(value).toString())
                        .replace("{value:n1}", value.toFixed(1))
                        .replace("{value:n2}", value.toFixed(2))
                        .replace("{value:n3}", value.toFixed(3))
                        .replace("{value:c}", this.formatCurrency(value))
                        .replace("{value:p}", this.formatPercentage(value));
                    /* eslint-enable no-template-curly-in-string */
                } catch (error) {
                    Logger.error("Error applying format string", error);
                    return value.toString();
                }
            }

            if (Number.isInteger(value)) {
                return value.toString();
            } else {
                return Number(value.toFixed(2)).toString();
            }
        }

        return String(value);
    }

    private static formatCurrency(value: number): string {
        try {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD"
            }).format(value);
        } catch (error) {
            return `$${value.toFixed(2)}`;
        }
    }

    private static formatPercentage(value: number): string {
        try {
            return new Intl.NumberFormat("en-US", {
                style: "percent",
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
            }).format(value / 100);
        } catch (error) {
            return `${value.toFixed(1)}%`;
        }
    }
}
