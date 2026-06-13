import { createElement, useState, useRef, Fragment } from "react";
import { createPortal } from "react-dom";
import { Table } from "../../engine/TitanTableEngine";

export function ColumnVisibilityToggle({ table }: { table: Table<any> }) {
    const [isOpen, setIsOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const btnRef = useRef<HTMLButtonElement>(null);

    const togglePopup = (e: any) => {
        e.stopPropagation();
        if (!isOpen && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setPos({ top: rect.bottom + 4, left: Math.max(0, rect.right - 200) });
        }
        setIsOpen(!isOpen);
    };

    return (
        <div style={{ display: "inline-block", marginLeft: "8px" }}>
            <button
                ref={btnRef}
                className="btn mx-button btn-default"
                onClick={togglePopup}
                style={{ display: "flex", alignItems: "center", gap: "6px", height: "100%" }}
                title="Toggle Columns"
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Columns
            </button>

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
                            className="column-picker-popup"
                            onClick={e => e.stopPropagation()}
                            style={{
                                position: "fixed",
                                top: pos.top,
                                left: pos.left,
                                backgroundColor: "#fff",
                                border: "1px solid #ccc",
                                padding: "12px",
                                zIndex: 99999,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                borderRadius: "4px",
                                minWidth: "200px",
                                color: "#333",
                                maxHeight: "300px",
                                overflowY: "auto"
                            }}
                        >
                            <div
                                style={{
                                    fontWeight: "600",
                                    marginBottom: "8px",
                                    borderBottom: "1px solid #eee",
                                    paddingBottom: "6px",
                                    display: "flex",
                                    justifyContent: "space-between"
                                }}
                            >
                                <span>Visibility</span>
                                <span style={{ cursor: "pointer", color: "#999" }} onClick={() => setIsOpen(false)}>
                                    ×
                                </span>
                            </div>
                            <div>
                                <label
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        marginBottom: "6px",
                                        cursor: "pointer",
                                        padding: "2px 0"
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={table.getIsAllColumnsVisible()}
                                        onChange={table.getToggleAllColumnsVisibilityHandler()}
                                    />
                                    <strong>Show All Columns</strong>
                                </label>
                                <hr style={{ margin: "4px 0 8px", borderColor: "#eee" }} />
                            </div>
                            {table.getAllLeafColumns().map(column => {
                                if (column.id === "column_aggregation") {
                                    return null;
                                }
                                const headerText =
                                    (column.columnDef.meta as any)?.displayName ||
                                    (typeof column.columnDef.header === "string" ? column.columnDef.header : column.id);
                                return (
                                    <div key={column.id} style={{ padding: "3px 0" }}>
                                        <label
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={column.getIsVisible()}
                                                onChange={column.getToggleVisibilityHandler()}
                                            />
                                            <span>{headerText}</span>
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </Fragment>,
                    document.body
                )}
        </div>
    );
}
