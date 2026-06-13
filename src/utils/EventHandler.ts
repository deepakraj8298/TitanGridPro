import { Logger } from "./Logger";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class EventHandler {
    private static clickTimers: Map<string, NodeJS.Timeout> = new Map();
    private static readonly DOUBLE_CLICK_DELAY = 300; // milliseconds

    private constructor() {
        // Static utility class
    }

    static handleClick(
        elementId: string,
        action: any,
        contextObject: any,
        triggerType: string,
        mxform?: any,
        onSingleClick?: () => void,
        onDoubleClick?: () => void
    ) {
        if (triggerType === "double") {
            this.handleDoubleClick(elementId, action, contextObject, mxform, onDoubleClick);
        } else {
            this.handleSingleClick(elementId, action, contextObject, mxform, onSingleClick);
        }
    }

    private static handleSingleClick(
        _elementId: string,
        action: any,
        contextObject: any,
        mxform?: any,
        callback?: () => void
    ) {
        this.executeMendixAction(action, contextObject, mxform);
        if (callback) {
            callback();
        }
    }

    private static handleDoubleClick(
        elementId: string,
        action: any,
        contextObject: any,
        mxform?: any,
        callback?: () => void
    ) {
        const existingTimer = this.clickTimers.get(elementId);

        if (existingTimer) {
            clearTimeout(existingTimer);
            this.clickTimers.delete(elementId);
            this.executeMendixAction(action, contextObject, mxform);
            if (callback) {
                callback();
            }
        } else {
            const timer = setTimeout(() => {
                this.clickTimers.delete(elementId);
            }, this.DOUBLE_CLICK_DELAY);

            this.clickTimers.set(elementId, timer);
        }
    }

    private static executeMendixAction(action: any, contextObject: any, _mxform?: any) {
        if (!action) {
            return;
        }

        if (!contextObject) {
            return;
        }

        if (action && typeof action.get === "function") {
            try {
                const actionValue = action.get(contextObject);

                if (actionValue && actionValue.canExecute && !actionValue.isExecuting) {
                    actionValue.execute();
                    return;
                } else {
                    return;
                }
            } catch (error) {
                Logger.error("ListActionValue execution failed", error);
                return;
            }
        }

        if (action && typeof action.execute === "function") {
            try {
                if (
                    Object.prototype.hasOwnProperty.call(action, "canExecute") &&
                    (!action.canExecute || action.isExecuting)
                ) {
                    return;
                }
                action.execute(contextObject);
                return;
            } catch (error) {
                Logger.error("Direct ActionValue execution failed", error);
                return;
            }
        }

        if (typeof action === "function") {
            try {
                action(contextObject);
                return;
            } catch (error) {
                Logger.error("Direct function execution failed", error);
                return;
            }
        }

        Logger.warn("Unknown action type - no valid execution method found", {
            action,
            type: typeof action,
            keys: Object.keys(action || {})
        });
    }

    static cleanup() {
        this.clickTimers.forEach(timer => clearTimeout(timer));
        this.clickTimers.clear();
    }
}
