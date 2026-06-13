import { createElement, useState, useRef, useMemo, Fragment } from "react";
import { createPortal } from "react-dom";
import { FilterIconProps } from "../../types";

export function FilterIcon({ column }: FilterIconProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const iconRef = useRef<HTMLSpanElement>(null);
    const filterValue = column.getFilterValue() as any;

    const uniqueValues = column.getFacetedUniqueValues();
    const sortedUniqueValues = useMemo(() => Array.from(uniqueValues.keys()).sort(), [uniqueValues]);

    const isBoolean = useMemo(() => {
        if (sortedUniqueValues.length === 0) {
            return false;
        }
        if (sortedUniqueValues.length <= 2) {
            const hasTrue = sortedUniqueValues.includes(true) || sortedUniqueValues.includes("true");
            const hasFalse = sortedUniqueValues.includes(false) || sortedUniqueValues.includes("false");
            return hasTrue || hasFalse;
        }
        return false;
    }, [sortedUniqueValues]);

    const isEnum = useMemo(() => {
        return !isBoolean && sortedUniqueValues.length > 0 && sortedUniqueValues.length <= 10;
    }, [isBoolean, sortedUniqueValues]);

    const [filterType, setFilterType] = useState<"text" | "dropdown">(isBoolean || isEnum ? "dropdown" : "text");

    const togglePopup = (e: any) => {
        e.stopPropagation();
        if (!isOpen && iconRef.current) {
            const rect = iconRef.current.getBoundingClientRect();
            setPos({ top: rect.bottom + 4, left: rect.left });
        }
        setIsOpen(!isOpen);
    };

    return (
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center", marginLeft: "4px" }}>
            <span
                ref={iconRef}
                className="filter-icon"
                onClick={togglePopup}
                style={{ opacity: filterValue ? 1 : 0.4, cursor: "pointer", display: "inline-flex" }}
                title="Filter Column"
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill={filterValue ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
            </span>

            {isOpen &&
                createPortal(
                    <Fragment>
                        <div
                            style={{ position: "fixed", inset: 0, zIndex: 99998 }}
                            onClick={e => {
                                e.stopPropagation();
                                setIsOpen(false);
                            }}
                        />
                        <div
                            className="filter-popup"
                            onClick={e => e.stopPropagation()}
                            style={{
                                position: "fixed",
                                top: pos.top,
                                left: pos.left,
                                backgroundColor: "#fff",
                                border: "1px solid #ccc",
                                padding: "8px",
                                zIndex: 99999,
                                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                borderRadius: "4px",
                                minWidth: "180px",
                                color: "#333"
                            }}
                        >
                            <div
                                style={{
                                    marginBottom: "8px",
                                    fontSize: "0.85em",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}
                            >
                                <select
                                    value={filterType}
                                    onChange={e => {
                                        setFilterType(e.target.value as any);
                                        column.setFilterValue(undefined);
                                    }}
                                    style={{ padding: "2px", border: "1px solid #ddd", borderRadius: "3px" }}
                                >
                                    <option value="text">Text Search</option>
                                    <option value="dropdown">Dropdown Options</option>
                                </select>
                                <span
                                    style={{ cursor: "pointer", marginLeft: "8px", fontSize: "16px", lineHeight: 1 }}
                                    onClick={() => setIsOpen(false)}
                                >
                                    ×
                                </span>
                            </div>

                            {filterType === "dropdown" ? (
                                <select
                                    value={(filterValue ?? "") as string}
                                    onChange={e => column.setFilterValue(e.target.value || undefined)}
                                    className="form-control filter-select"
                                    style={{
                                        width: "100%",
                                        padding: "4px",
                                        fontSize: "0.85em",
                                        border: "1px solid #ddd",
                                        borderRadius: "3px"
                                    }}
                                >
                                    <option value="">(All)</option>
                                    {isBoolean ? (
                                        <Fragment>
                                            <option value="true">True</option>
                                            <option value="false">False</option>
                                        </Fragment>
                                    ) : (
                                        sortedUniqueValues.map((value: any, i) => (
                                            <option value={value} key={i}>
                                                {String(value)}
                                            </option>
                                        ))
                                    )}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={(filterValue ?? "") as string}
                                    onChange={e => column.setFilterValue(e.target.value)}
                                    placeholder={`Search ${uniqueValues.size} items...`}
                                    className="form-control filter-input"
                                    style={{
                                        width: "100%",
                                        padding: "4px",
                                        fontSize: "0.85em",
                                        boxSizing: "border-box",
                                        border: "1px solid #ddd",
                                        borderRadius: "3px"
                                    }}
                                />
                            )}

                            {filterValue && (
                                <div style={{ marginTop: "8px", textAlign: "right" }}>
                                    <button
                                        onClick={() => {
                                            column.setFilterValue(undefined);
                                            setIsOpen(false);
                                        }}
                                        style={{
                                            fontSize: "0.8em",
                                            cursor: "pointer",
                                            border: "none",
                                            background: "transparent",
                                            color: "#d9534f"
                                        }}
                                    >
                                        Clear Filter
                                    </button>
                                </div>
                            )}
                        </div>
                    </Fragment>,
                    document.body
                )}
        </div>
    );
}
