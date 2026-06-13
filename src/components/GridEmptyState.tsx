/**
 * @file GridEmptyState.tsx
 * @description Displays a centred empty-state message row inside `<tbody>` when
 * the grid has no data rows to render. Uses the configurable `emptyMessage`
 * widget property for the primary text, with a static subtitle below it.
 */

import { createElement, ReactElement } from "react";
import { TitanGridContainerProps } from "../../typings/TitanGridProps";

interface GridEmptyStateProps {
    /** Total number of visible columns — used to set `colSpan` on the single cell. */
    visibleColumnCount: number;
    /** Widget configuration so the custom empty message can be read. */
    props: TitanGridContainerProps;
}

/**
 * A single `<tbody>` row spanning all columns that is shown when the grid
 * data source returns zero records.
 *
 * Shows:
 *  - **Primary message** — from the `emptyMessage` widget property, or "No data found".
 *  - **Subtitle** — a static encouragement message.
 *
 * @param visibleColumnCount - How many columns the cell should span.
 * @param props - TitanGrid widget configuration properties.
 */
export function GridEmptyState({ visibleColumnCount, props }: GridEmptyStateProps): ReactElement {
    /** Primary empty state message — uses the widget property or a sensible default. */
    const primaryMessage = (props as any)?.emptyMessage?.value || "No data found";

    return createElement(
        "tbody",
        null,
        createElement(
            "tr",
            null,
            createElement(
                "td",
                {
                    colSpan: visibleColumnCount,
                    className: "empty-message-cell",
                    style: { textAlign: "center", padding: "40px 20px" }
                },
                /* Primary empty message */
                createElement(
                    "div",
                    {
                        className: "empty-message-title",
                        style: { fontSize: "1.1em", fontWeight: 500 }
                    },
                    primaryMessage
                ),
                /* Static subtitle */
                createElement(
                    "div",
                    {
                        className: "empty-message-subtitle",
                        style: { fontSize: "0.9em", marginTop: "4px", opacity: 0.7 }
                    },
                    "There are no records to display at this time."
                )
            )
        )
    );
}
