import { createElement, ReactElement, useState, useEffect, useRef, useCallback } from "react";

interface TooltipState {
    visible: boolean;
    html: string;
    x: number;
    y: number;
}

/**
 * A lightweight custom tooltip that renders HTML content.
 * Listens for mouseenter/mouseleave on elements with [data-tooltip-html].
 * Hides instantly when the cursor leaves the cell.
 */
export function HtmlTooltip(): ReactElement {
    const [state, setState] = useState<TooltipState>({ visible: false, html: "", x: 0, y: 0 });
    const tooltipRef = useRef<HTMLDivElement>(null);
    const activeElRef = useRef<HTMLElement | null>(null);

    const hide = useCallback(() => {
        activeElRef.current = null;
        setState(prev => ({ ...prev, visible: false }));
    }, []);

    const handleMouseEnter = useCallback((e: Event) => {
        const target = e.target as HTMLElement;
        const el = target.closest("[data-tooltip-html]") as HTMLElement | null;
        if (!el) {
            return;
        }

        const html = el.getAttribute("data-tooltip-html");
        if (!html) {
            return;
        }

        activeElRef.current = el;
        const rect = el.getBoundingClientRect();
        setState({
            visible: true,
            html,
            x: rect.left + rect.width / 2,
            y: rect.top
        });
    }, []);

    const handleMouseLeave = useCallback(
        (e: Event) => {
            const target = e.target as HTMLElement;
            const el = target.closest("[data-tooltip-html]") as HTMLElement | null;
            // Only hide if we're leaving the element that owns the tooltip
            if (el === activeElRef.current || !activeElRef.current) {
                hide();
            }
        },
        [hide]
    );

    useEffect(() => {
        document.addEventListener("mouseover", handleMouseEnter, true);
        document.addEventListener("mouseout", handleMouseLeave, true);

        return () => {
            document.removeEventListener("mouseover", handleMouseEnter, true);
            document.removeEventListener("mouseout", handleMouseLeave, true);
        };
    }, [handleMouseEnter, handleMouseLeave]);

    // Adjust position to stay within viewport
    useEffect(() => {
        if (state.visible && tooltipRef.current) {
            const tip = tooltipRef.current;
            const tipRect = tip.getBoundingClientRect();
            const pad = 8;

            let left = state.x - tipRect.width / 2;
            let top = state.y - tipRect.height - pad;

            if (left + tipRect.width > window.innerWidth - pad) {
                left = window.innerWidth - tipRect.width - pad;
            }
            if (left < pad) {
                left = pad;
            }
            if (top < pad) {
                top = state.y + 28;
            }

            tip.style.left = `${left}px`;
            tip.style.top = `${top}px`;
        }
    }, [state]);

    if (!state.visible || !state.html) {
        return createElement("span");
    }

    return createElement("div", {
        ref: tooltipRef,
        className: "dg-html-tooltip",
        style: {
            position: "fixed",
            left: state.x,
            top: state.y,
            zIndex: 100000,
            pointerEvents: "none"
        },
        dangerouslySetInnerHTML: { __html: state.html }
    });
}
