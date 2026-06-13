/**
 * @file useTableStyles.ts
 * @description Custom React hook that computes and injects grid CSS into `<head>`.
 * Combines all style sections (base, aggregation, scrollbar, interaction) into a
 * single stylesheet scoped by the grid's unique `gridId`, then injects it via a
 * `<style>` element. The element is cleaned up automatically when the component unmounts.
 */

import { useMemo, useEffect } from "react";
import { TitanGridContainerProps } from "../../typings/TitanGridProps";
import {
    generateGridStyles,
    generateAggregationStyles,
    generateScrollbarStyles,
    generateInteractionStyles
} from "../utils/StyleGenerator";

/**
 * Injects a complete, scoped CSS stylesheet for the TitanGrid instance into `<head>`.
 *
 * The hook:
 *  1. Assembles the full CSS string using the style generator functions.
 *  2. Creates a `<style id="style-{gridId}">` element on first run.
 *  3. Updates its `innerHTML` whenever a relevant widget property changes.
 *  4. Removes the element from `<head>` on unmount (cleanup).
 *
 * @param props  - All widget configuration properties from Studio Pro.
 * @param gridId - Unique CSS id of the grid wrapper element, used to scope all rules.
 * @returns The same `gridId` for use in the component's `id` attribute.
 */
export function useTableStyles(props: TitanGridContainerProps, gridId: string): string {
    /**
     * Recomputes the full CSS string whenever a style-relevant property changes.
     * Non-style properties (e.g., data source, actions) are intentionally excluded
     * from the dependency array to avoid unnecessary style recalculations.
     */
    const composedStyleString = useMemo(() => {
        /** Base layout, column headers, row body, borders, themes, responsive styles. */
        const baseStyleSection = generateGridStyles(props, gridId);

        /** Aggregation row and column styles, pinned totals. */
        const aggregationStyleSection = generateAggregationStyles(props, gridId);

        /** Scrollbar appearance (webkit + Firefox). */
        const scrollbarStyleSection = generateScrollbarStyles(gridId, props);

        /** Focus rings, selection highlights, cursor hover styles. */
        const interactionStyleSection = generateInteractionStyles(props, gridId);

        // Join non-empty sections with a newline separator
        return [baseStyleSection, aggregationStyleSection, scrollbarStyleSection, interactionStyleSection]
            .filter(styleSection => Boolean(styleSection))
            .join("\n");
    }, [
        gridId,
        props.fontSize,
        props.headerFontWeight,
        props.columnWidthMode,
        props.manualColumnWidth,
        props.columnAlignment,
        props.columnTextWrap,
        props.headerBackgroundColor,
        props.borderColor,
        props.gridTheme,
        props.rowBorderStyle,
        props.rowHeightMode,
        props.manualRowHeight,
        props.enableAlternatingRows,
        props.evenRowColor,
        props.oddRowColor,
        props.enableRowHover,
        props.hoverRowColor
    ]);

    /**
     * Injects the computed CSS into a scoped `<style>` element in `<head>`.
     * Re-runs whenever `composedStyleString` or `gridId` changes.
     * Cleans up the element on component unmount to avoid style leaks.
     */
    useEffect(() => {
        const styleElementId = `style-${gridId}`;

        // Reuse the existing element if it exists, otherwise create a new one
        let styleElement = document.getElementById(styleElementId) as HTMLStyleElement | null;
        if (!styleElement) {
            styleElement = document.createElement("style");
            styleElement.id = styleElementId;
            document.head.appendChild(styleElement);
        }

        styleElement.innerHTML = composedStyleString;

        // Cleanup: remove the style element when the grid unmounts
        return () => {
            const existingStyleElement = document.getElementById(styleElementId);
            if (existingStyleElement && existingStyleElement.parentNode) {
                existingStyleElement.parentNode.removeChild(existingStyleElement);
            }
        };
    }, [gridId, composedStyleString]);

    return gridId;
}
