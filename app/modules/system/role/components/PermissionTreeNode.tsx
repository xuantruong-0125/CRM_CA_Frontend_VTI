"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import "./permisson-tree.css"

type PermissionField = "canView" | "canCreate" | "canUpdate" | "canDelete";

export default function PermissionTreeNode({
    node,
    level = 0,
    onChange,
}: any) {
    const [open, setOpen] = useState(true);

    const handleCheck = (field: PermissionField) => {
        onChange(node.menuId, field);
    };


    return (
        <>
            <div className={`tree-node ${level === 0 ? "tree-root" : ""}`}>
                {/* LEFT */}
                <div
                    className="tree-left"
                    style={{ "--level": level } as React.CSSProperties}
                >
                    {node.children?.length > 0 && (

                        <button
                            className="tree-toggle"
                            onClick={() => setOpen(!open)}
                        >
                            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                    )}

                    <span className="tree-label">{node.menuName}</span>
                </div>

                {/* RIGHT */}
                <div className="tree-actions">
                    {/* CHỈ HIỆN CHECKBOX KHI LÀ LEAF */}
                    {(!node.children || node.children.length === 0) && (

                        <>
                            <input
                                type="checkbox"
                                checked={node.canView}
                                onChange={() => handleCheck("canView")}
                            />

                            <input
                                type="checkbox"
                                checked={node.canCreate}
                                disabled={!node.canView}
                                onChange={() => handleCheck("canCreate")}
                            />

                            <input
                                type="checkbox"
                                checked={node.canUpdate}
                                disabled={!node.canView}
                                onChange={() => handleCheck("canUpdate")}
                            />

                            <input
                                type="checkbox"
                                checked={node.canDelete}
                                disabled={!node.canView}
                                onChange={() => handleCheck("canDelete")}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* CHILDREN */}
            {open &&
                node.children?.map((child: any) => (
                    <PermissionTreeNode
                        key={child.menuId}
                        node={child}
                        level={level + 1}
                        onChange={onChange}
                    />
                ))}
        </>
    );
}