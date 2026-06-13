import { ReactElement, createElement } from "react";
import { Logger } from "./Logger";

export const ContentRenderer = {
    renderContent(
        item: any,
        showAs: string,
        attribute: any,
        textTemplate: any,
        widgets: any
    ): string | ReactElement | null {
        if (!item) {
            return "";
        }

        switch (showAs) {
            case "attribute":
                return this.getAttributeValue(item, attribute);

            case "dynamicText":
                return this.getTextTemplateValue(item, textTemplate);

            case "custom":
                return this.getCustomWidgets(item, widgets);

            default:
                return "";
        }
    },

    getAttributeValue(item: any, attribute: any): string {
        if (!attribute) {
            return "";
        }

        try {
            const value = attribute.get(item);
            if (value && typeof value === "object") {
                return value.displayValue || value.value || String(value);
            }
            return String(value || "");
        } catch (error) {
            Logger.warn("Error getting attribute value", error);
            return "";
        }
    },

    getTextTemplateValue(item: any, textTemplate: any): string {
        if (!textTemplate) {
            return "";
        }

        try {
            const value = textTemplate.get(item);
            return value?.value || String(value) || "";
        } catch (error) {
            return "";
        }
    },

    getCustomWidgets(item: any, widgets: any): ReactElement | null {
        if (!widgets) {
            return null;
        }

        try {
            return widgets.get(item);
        } catch (error) {
            return null;
        }
    },

    getTooltip(
        item: any,
        tooltipTemplate?: any,
        tooltipType?: string,
        customTooltipExpression?: any
    ): { content: string; isHtml: boolean } {
        if (!item) {
            return { content: "", isHtml: false };
        }

        if (tooltipType === "custom" && customTooltipExpression) {
            try {
                const value = customTooltipExpression.get(item);
                return { content: value?.value || String(value) || "", isHtml: true };
            } catch (error) {
                Logger.warn("Error getting custom tooltip", error);
            }
        }

        if (!tooltipTemplate) {
            return { content: "", isHtml: false };
        }

        try {
            const value = tooltipTemplate.get(item);
            return { content: value?.value || String(value) || "", isHtml: false };
        } catch (error) {
            Logger.warn("Error getting default tooltip", error);
            return { content: "", isHtml: false };
        }
    },

    getDynamicClass(item: any, classExpression?: any): string {
        if (!classExpression || !item) {
            return "";
        }

        try {
            const value = classExpression.get(item);
            return value?.value || String(value) || "";
        } catch (error) {
            Logger.warn("Error getting dynamic class", error);
            return "";
        }
    },

    createElementWithAttributes(
        tag: string,
        baseClassName: string,
        item: any,
        tooltipProps: { template?: any; type?: string; custom?: any } = {},
        classExpression?: any,
        additionalProps: any = {},
        children?: any
    ): ReactElement {
        const { content: tooltip, isHtml } = this.getTooltip(
            item,
            tooltipProps.template,
            tooltipProps.type,
            tooltipProps.custom
        );
        const dynamicClass = this.getDynamicClass(item, classExpression);

        const finalClassName = dynamicClass ? `${baseClassName} ${dynamicClass}`.trim() : baseClassName;

        const props: any = {
            className: finalClassName,
            ...additionalProps
        };

        if (tooltip) {
            if (isHtml) {
                props["data-tooltip-html"] = tooltip;
            } else {
                props.title = tooltip;
            }
        }

        return createElement(tag, props, children);
    },

    renderContentWithAttributes(
        item: any,
        showAs: string,
        attribute: any,
        textTemplate: any,
        widgets: any,
        baseClassName = "content",
        tooltipProps: { template?: any; type?: string; custom?: any } = {},
        classExpression?: any,
        wrapperTag = "div"
    ): ReactElement {
        const content = this.renderContent(item, showAs, attribute, textTemplate, widgets);

        if (showAs === "custom" && content) {
            return content as ReactElement;
        }

        return this.createElementWithAttributes(
            wrapperTag,
            baseClassName,
            item,
            tooltipProps,
            classExpression,
            {},
            content
        );
    },

    renderContentWithWrapper(
        item: any,
        showAs: string,
        attribute: any,
        textTemplate: any,
        widgets: any,
        wrapperProps: {
            tag?: string;
            className?: string;
            tooltip?: any;
            tooltipType?: string;
            tooltipCustom?: any;
            dynamicClass?: any;
            additionalProps?: any;
        } = {}
    ): ReactElement {
        const {
            tag = "div",
            className = "content",
            tooltip,
            tooltipType,
            tooltipCustom,
            dynamicClass,
            additionalProps = {}
        } = wrapperProps;

        const content = this.renderContent(item, showAs, attribute, textTemplate, widgets);

        if (showAs === "custom" && content && !wrapperProps.className) {
            return content as ReactElement;
        }

        return this.createElementWithAttributes(
            tag,
            className,
            item,
            { template: tooltip, type: tooltipType, custom: tooltipCustom },
            dynamicClass,
            additionalProps,
            content
        );
    }
};
