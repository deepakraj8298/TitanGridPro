import { Logger } from "./Logger";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AggregationValueExtractor {
    private constructor() {
        // Static utility class
    }

    static extractValue(
        cellItem: any,
        showCellAs: string,
        cellAttribute: any,
        cellTextTemplate: any,
        cellWidgets: any,
        widgetType?: string,
        isMounted?: () => boolean,
        targetAttributeName?: string
    ): any {
        if (!cellItem) {
            return null;
        }

        if (isMounted && !isMounted()) {
            Logger.debug("Component unmounted, skipping value extraction");
            return null;
        }

        switch (showCellAs) {
            case "attribute":
                return this.extractFromAttribute(cellItem, cellAttribute);

            case "dynamicText":
                return this.extractFromDynamicText(cellItem, cellTextTemplate);

            case "custom": {
                // For custom cells, try multiple extraction paths:
                // 1. cellAttribute (most reliable — direct Mendix attribute binding)
                // 2. cellTextTemplate (expression-based value)
                // 3. Widget introspection (fragile fallback)

                // Path 1: Use cellAttribute if available
                if (cellAttribute && this.hasGetMethod(cellAttribute)) {
                    const attrValue = this.extractFromAttribute(cellItem, cellAttribute);
                    if (attrValue !== null) {
                        return attrValue;
                    }
                }

                // Path 2: Use cellTextTemplate if available
                if (cellTextTemplate && this.hasGetMethod(cellTextTemplate)) {
                    const textValue = this.extractFromDynamicText(cellItem, cellTextTemplate);
                    if (textValue !== null) {
                        return textValue;
                    }
                }

                // Path 3: Fall back to widget introspection
                return this.extractFromCustomWidget(cellItem, cellWidgets, widgetType, isMounted, targetAttributeName);
            }

            default:
                return null;
        }
    }

    private static extractFromCustomWidget(
        cellItem: any,
        cellWidgets: any,
        _widgetType?: string,
        isMounted?: () => boolean,
        targetAttributeName?: string
    ): any {
        if (!cellWidgets || !cellItem) {
            return null;
        }

        try {
            if (isMounted && !isMounted()) {
                return null;
            }

            const widget = cellWidgets.get(cellItem);

            if (!widget) {
                Logger.debug("Widget not yet loaded for cell", cellItem);
                return null;
            }

            if (!this.isWidgetReady(widget)) {
                Logger.debug("Widget not ready for cell", cellItem);
                return null;
            }

            return this.extractValueFromMendixWidget(widget, cellItem, targetAttributeName);
        } catch (error) {
            Logger.error("Error extracting custom widget value", error);
            return null;
        }
    }

    private static extractValueFromMendixWidget(widget: any, _cellItem: any, targetAttributeName?: string): any {
        // NOTE: This method uses Symbol-based introspection to access Mendix's internal
        // mxObject representation. This approach is inherently fragile across Mendix
        // runtime versions. If the internal Symbol structure changes, the try-catch
        // blocks ensure we degrade gracefully to null rather than crashing.
        try {
            if (!widget || !widget.props) {
                return null;
            }

            if (widget.props.item) {
                const item = widget.props.item;

                try {
                    if (typeof Object.getOwnPropertySymbols !== "function") {
                        // Environment doesn't support Symbol introspection
                        return this.extractFromDirectProperties(item, targetAttributeName);
                    }

                    const symbols = Object.getOwnPropertySymbols(item);
                    const mxObjectSymbol = symbols.find(symbol => symbol.toString() === "Symbol(mxObject)");

                    if (mxObjectSymbol) {
                        const mxObject = item[mxObjectSymbol];
                        const value = this.extractFromMxObject(mxObject, targetAttributeName);
                        if (value !== null) {
                            return value;
                        }
                    }

                    for (const symbol of symbols) {
                        const symbolValue = item[symbol];

                        if (symbolValue && typeof symbolValue === "object") {
                            const extractedValue = this.extractFromMxObject(symbolValue, targetAttributeName);
                            if (extractedValue !== null) {
                                return extractedValue;
                            }
                        }
                    }
                } catch (error) {
                    // Symbol access failed — fall through to direct property extraction
                }

                const directValue = this.extractFromDirectProperties(item, targetAttributeName);
                if (directValue !== null) {
                    return directValue;
                }
            }

            if (widget.props.children && Array.isArray(widget.props.children)) {
                for (const child of widget.props.children) {
                    const childValue = this.extractFromChildren(child);
                    if (childValue !== null) {
                        return childValue;
                    }
                }
            }
            return null;
        } catch (error) {
            // Top-level safety net — prevent widget crash on unexpected runtime structures
            Logger.warn("Failed to extract value from widget", error);
            return null;
        }
    }

    private static extractFromMxObject(mxObject: any, targetAttributeName?: string): any {
        if (!mxObject) {
            return null;
        }
        if (targetAttributeName && typeof mxObject.get === "function") {
            const attrNames = targetAttributeName.split(",").map(s => s.trim());
            let totalFoundValue = 0;
            let foundAtLeastOne = false;

            for (const attrName of attrNames) {
                try {
                    const value = mxObject.get(attrName);
                    const parsedValue = this.parseNumericValue(value);
                    if (parsedValue !== null && typeof parsedValue === "number") {
                        totalFoundValue += parsedValue;
                        foundAtLeastOne = true;
                    }
                } catch (error) {
                    Logger.debug(`Attribute ${attrName} not found on object`);
                }
            }
            return foundAtLeastOne ? totalFoundValue : null;
        }

        return null;
    }

    private static extractFromDirectProperties(obj: any, targetAttributeName?: string): any {
        if (!obj) {
            return null;
        }
        if (targetAttributeName) {
            const attrNames = targetAttributeName.split(",").map(s => s.trim());
            let totalFoundValue = 0;
            let foundAtLeastOne = false;

            for (const attrName of attrNames) {
                if (Object.prototype.hasOwnProperty.call(obj, attrName)) {
                    const value = obj[attrName];
                    const parsedValue = this.parseNumericValue(value);
                    if (parsedValue !== null && typeof parsedValue === "number") {
                        totalFoundValue += parsedValue;
                        foundAtLeastOne = true;
                    }
                }
            }
            if (foundAtLeastOne) {
                return totalFoundValue;
            }
        }

        for (const [key, value] of Object.entries(obj)) {
            if (key.startsWith("_") || key === "id" || key === "__typename" || key === "guid" || key === "objectType") {
                continue;
            }

            if (value !== null && value !== undefined && value !== "") {
                const parsedValue = this.parseNumericValue(value);
                if (parsedValue !== null && typeof parsedValue === "number") {
                    return parsedValue;
                }
            }
        }

        return null;
    }

    private static extractFromChildren(child: any): any {
        if (!child) {
            return null;
        }

        if (typeof child === "string" || typeof child === "number") {
            return this.parseNumericValue(child);
        }

        if (child && typeof child === "object" && child.props) {
            if (child.props.children) {
                return this.extractFromChildren(child.props.children);
            }
        }

        if (Array.isArray(child)) {
            for (const item of child) {
                const value = this.extractFromChildren(item);
                if (value !== null) {
                    return value;
                }
            }
        }

        return null;
    }

    private static extractFromAttribute(cellItem: any, cellAttribute: any): any {
        if (!cellAttribute || !this.hasGetMethod(cellAttribute)) {
            return null;
        }

        try {
            const value = cellAttribute.get(cellItem);
            return this.parseNumericValue(value);
        } catch (error) {
            Logger.warn("Error extracting attribute value", error);
            return null;
        }
    }

    private static extractFromDynamicText(cellItem: any, cellTextTemplate: any): any {
        if (!cellTextTemplate || !this.hasGetMethod(cellTextTemplate)) {
            return null;
        }

        try {
            const textValue = cellTextTemplate.get(cellItem);
            return this.parseNumericValue(textValue);
        } catch (error) {
            Logger.warn("Error extracting dynamic text value", error);
            return null;
        }
    }

    private static parseNumericValue(value: any): number | string | null {
        if (value === null || value === undefined) {
            return null;
        }

        if (value && typeof value === "object") {
            if (typeof value.toNumber === "function") {
                try {
                    const numResult = value.toNumber();
                    return this.validateNumericResult(numResult);
                } catch (error) {
                    // Ignore toNumber errors
                }
            }

            if (typeof value.valueOf === "function") {
                try {
                    const result = value.valueOf();
                    if (typeof result === "number") {
                        return this.validateNumericResult(result);
                    }
                    if (typeof result === "string") {
                        return this.parseStringToNumber(result);
                    }
                } catch (error) {
                    // Ignore valueOf errors
                }
            }

            if (value.displayValue !== undefined) {
                return this.parseNumericValue(value.displayValue);
            }
            if (value.value !== undefined) {
                return this.parseNumericValue(value.value);
            }
            if (value._value !== undefined) {
                return this.parseNumericValue(value._value);
            }

            if (typeof value.toString === "function") {
                try {
                    const stringValue = value.toString();
                    if (stringValue !== "[object Object]" && stringValue !== "") {
                        return this.parseStringToNumber(stringValue);
                    }
                } catch (error) {
                    // Ignore toString errors
                }
            }
        }

        if (typeof value === "number") {
            return this.validateNumericResult(value);
        }

        if (typeof value === "string") {
            return this.parseStringToNumber(value);
        }

        if (typeof value === "boolean") {
            return value ? 1 : 0;
        }

        try {
            const stringValue = String(value);
            if (stringValue && stringValue !== "null" && stringValue !== "undefined") {
                return this.parseStringToNumber(stringValue);
            }
        } catch (error) {
            // Ignore String conversion errors
        }

        return null;
    }

    private static parseStringToNumber(str: string): number | string | null {
        if (!str || typeof str !== "string") {
            return null;
        }

        const trimmed = str.trim();
        if (trimmed === "") {
            return null;
        }

        const cleaned = trimmed
            .replace(/[$€£¥]/g, "")
            .replace(/[()]/g, "")
            .replace(/%/g, "")
            .replace(/,/g, "");

        const pureNumberRegex = /^[-+]?\d*\.?\d+([eE][-+]?\d+)?$/;

        if (pureNumberRegex.test(cleaned)) {
            const parsed = parseFloat(cleaned);

            if (!isNaN(parsed) && isFinite(parsed)) {
                return parsed;
            } else {
                return null;
            }
        } else {
            // Check if it's a valid non-numeric string that we might want to count
            if (trimmed.length > 0) {
                return trimmed;
            }

            return null;
        }
    }

    private static validateNumericResult(num: number): number | null {
        if (typeof num !== "number") {
            return null;
        }

        if (isNaN(num) || !isFinite(num)) {
            return null;
        }

        if (Math.abs(num) > Number.MAX_SAFE_INTEGER) {
            return num;
        }

        return num;
    }

    private static hasGetMethod(obj: any): obj is { get: (item: any) => any } {
        return obj && typeof obj === "object" && typeof obj.get === "function";
    }

    private static isWidgetReady(widget: any): boolean {
        if (!widget) {
            return false;
        }

        if (!widget.props) {
            return false;
        }

        if (widget.$$typeof && widget.props) {
            return true;
        }

        return false;
    }

    static isValidForNumericAggregation(value: any): boolean {
        const parsed = this.parseNumericValue(value);

        return parsed !== null && typeof parsed === "number";
    }

    static isValidForCountAggregation(value: any): boolean {
        const parsed = this.parseNumericValue(value);
        return parsed !== null && (typeof parsed === "number" || typeof parsed === "string");
    }

    static extractFromObjectSnapshot(objectSnapshot: any): any {
        if (!objectSnapshot) {
            return null;
        }

        for (const [key, value] of Object.entries(objectSnapshot)) {
            if (key.startsWith("_") || key === "id" || key === "__typename") {
                continue;
            }

            if (value !== null && value !== undefined && value !== "") {
                const parsedValue = this.parseNumericValue(value);
                if (parsedValue !== null && typeof parsedValue === "number") {
                    return parsedValue;
                }
            }
        }

        try {
            const symbols = Object.getOwnPropertySymbols(objectSnapshot);
            for (const symbol of symbols) {
                const symbolValue = objectSnapshot[symbol];

                if (symbolValue && typeof symbolValue === "object") {
                    const result = this.extractFromObjectSnapshot(symbolValue);
                    if (result !== null) {
                        return result;
                    }
                }
            }
        } catch (error) {
            Logger.warn("Error accessing symbols", error);
        }

        return null;
    }
}
