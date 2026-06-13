/**
 * @file usePrintGrid.ts
 * @description Custom React hook that encapsulates the logic for printing the
 * grid contents using a hidden iframe. This isolates the print DOM manipulation
 * from the main GridRenderer component, keeping print concerns in one place.
 */

import { useCallback } from "react";

/**
 * Hook that returns a stable `printGridToIframe` callback.
 *
 * The grid is rendered into a hidden iframe so that:
 *  - The host page layout is not disturbed during print.
 *  - Existing page stylesheets are copied so the grid looks correct.
 *  - The iframe is removed automatically after printing.
 *
 * @returns {{ printGridToIframe: () => void }} An object containing the print handler.
 */
export function usePrintGrid(): { printGridToIframe: () => void } {
    /**
     * Prints the nearest `.table-container` element inside a temporary iframe.
     * Copies all existing `<style>` and `<link rel="stylesheet">` tags so that
     * the grid retains its visual appearance in the print dialog.
     */
    const printGridToIframe = useCallback((): void => {
        // Locate the grid table element to capture its HTML
        const gridElement = document.querySelector(".table-container");
        if (!gridElement) {
            return;
        }

        // Create an off-screen iframe to host the print content
        const printFrame = document.createElement("iframe");
        printFrame.style.position = "absolute";
        printFrame.style.top = "-9999px";
        printFrame.style.left = "-9999px";
        document.body.appendChild(printFrame);

        const frameDocument = printFrame.contentWindow?.document;
        if (!frameDocument) {
            document.body.removeChild(printFrame);
            return;
        }

        // Build the iframe document — copy all existing stylesheets first
        frameDocument.open();
        frameDocument.write("<html><head><title>Print Grid</title>");

        const hostStylesheets = document.querySelectorAll('style, link[rel="stylesheet"]');
        hostStylesheets.forEach(styleNode => {
            frameDocument.write(styleNode.outerHTML);
        });

        // Inject print-specific overrides to make the layout work on paper
        frameDocument.write(`
            <style>
                @media print {
                    body { margin: 0; padding: 0; background: white; }
                    .resizer, .filter-icon, .context-menu-popup { display: none !important; }
                    .dynamic-grid {
                        width: 100% !important;
                        min-width: 100% !important;
                        table-layout: auto !important;
                        border-collapse: collapse;
                    }
                    .dynamic-grid th,
                    .dynamic-grid td { white-space: normal !important; position: static !important; }
                    .table-container {
                        overflow: visible !important;
                        height: auto !important;
                        max-height: none !important;
                    }
                }
            </style>
        `);

        frameDocument.write("</head><body>");
        frameDocument.write(gridElement.outerHTML);
        frameDocument.write("</body></html>");
        frameDocument.close();

        // Trigger print after the iframe has loaded, then remove it
        printFrame.onload = () => {
            setTimeout(() => {
                printFrame.contentWindow?.focus();
                printFrame.contentWindow?.print();
                setTimeout(() => {
                    document.body.removeChild(printFrame);
                }, 1000);
            }, 500);
        };
    }, []);

    return { printGridToIframe };
}
