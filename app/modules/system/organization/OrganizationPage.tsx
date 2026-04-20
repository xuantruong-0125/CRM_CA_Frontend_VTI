"use client";

import { useOrganization } from "@/modules/system/organization/hooks/useOrganization";
import styles from "@/modules/system/organization/styles/organization.module.css";
import ConfirmDeleteModal from "@/shared/components/ConfirmDeleteModal/ConfirmDeleteModal";
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  Organization,
  OrganizationPayload,
  OrganizationType,
} from "@/modules/system/organization/types/organization.type";
import { toast } from "react-toastify";

export default function OrganizationPage() {
  const { data, create, update, remove } = useOrganization();

  // ===== FORM =====
  const [form, setForm] = useState<OrganizationPayload>({
    name: "",
    parentId: null,
    type: "COMPANY",
  });

  // ===== UI STATE =====
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // ===== COLOR =====
  const TYPE_COLOR: Record<OrganizationType, string> = {
    COMPANY: "#3f03a8",
    BRANCH: "#16bf4c",
    DEPARTMENT: "#2470ad",
    TEAM: "#ebcd26",
  };

  // ===== ACTION =====
  const handleSubmit = async () => {
    if (!form.name) {
      toast.warning("Tên không được để trống");
      return;
    }

    await create(form);

    setForm({
      name: "",
      parentId: null,
      type: "COMPANY",
    });
  };

  const toggle = (id: number) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleEdit = (node: Organization) => {
    setEditingId(node.id);
    setEditName(node.name);
  };

  const handleUpdate = async (node: Organization) => {
    await update(node.id, {
      name: editName,
      parentId: node.parentId,
      type: node.type,
    });

    setEditingId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    try {
      setLoadingDelete(true);
      await remove(deleteId);
      toast.success("Xóa thành công");
      setDeleteId(null);
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setLoadingDelete(false);
    }
  };

  // ===== TREE =====
  const renderTree = (nodes: Organization[], level = 0): React.ReactNode => {
    if (!nodes || nodes.length === 0) return null;

    return nodes.map((node) => (
      <div key={node.id}>
        {/* indent wrapper */}
        <div style={{ marginLeft: level * 30 }}>
          <div
            className={styles.treeItem}
            style={{
              backgroundColor: TYPE_COLOR[node.type],
            }}
          >
            {/* LEFT */}
            <div className={styles.left}>
              <span
                className={styles.expandIcon}
                onClick={() => toggle(node.id)}
              >
                {node.children?.length > 0 ? (
                  expanded[node.id] ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )
                ) : (
                  <span style={{ width: 16 }} />
                )}
              </span>

              {editingId === node.id ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={styles.editInput}
                />
              ) : (
                <span className={styles.nodeName}>{node.name}</span>
              )}
            </div>

            {/* RIGHT */}
            <div className={styles.actions}>
              {editingId === node.id ? (
                <>
                  <Check
                    size={18}
                    className={styles.save_btn}
                    onClick={() => handleUpdate(node)}
                  />
                  <X
                    size={18}
                    className={styles.close_btn}
                    onClick={() => setEditingId(null)}
                  />
                </>
              ) : (
                <>
                  <Pencil
                    size={18}
                    className={styles.edit_btn}
                    onClick={() => handleEdit(node)}
                  />
                  <Trash2
                    size={18}
                    className={styles.icon}
                    // onClick={() => remove(node.id)}
                    onClick={() => setDeleteId(node.id)}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* children */}
        {(expanded[node.id] ?? true) &&
          node.children?.length > 0 &&
          renderTree(node.children, level + 1)}
      </div>
    ));
  };

  // ===== BUILD SELECT TREE =====
  const buildOptions = (
    nodes: Organization[],
    level = 0
  ): { id: number; name: string }[] => {
    let result: { id: number; name: string }[] = [];

    nodes.forEach((node) => {
      result.push({
        id: node.id,
        name: `${"— ".repeat(level)}${node.name}`,
      });

      if (node.children?.length) {
        result = result.concat(buildOptions(node.children, level + 1));
      }
    });

    return result;
  };

  const options = buildOptions(data);

  // ===== UI =====
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>Quản lý tổ chức</h2>

        {/* FORM */}
        <div className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Tên tổ chức</label>
            <input
              className={styles.input}
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Thuộc tổ chức</label>
            <select
              className={styles.select}
              value={form.parentId ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  parentId: e.target.value
                    ? Number(e.target.value)
                    : null,
                })
              }
            >
              <option value="">-- Không có --</option>
              {options.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Loại tổ chức</label>
            <select
              className={styles.select}
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value as OrganizationType,
                })
              }
            >
              <option value="COMPANY">COMPANY</option>
              <option value="BRANCH">BRANCH</option>
              <option value="DEPARTMENT">DEPARTMENT</option>
              <option value="TEAM">TEAM</option>
            </select>
          </div>

          <button className={styles.submit_btn} onClick={handleSubmit}>
            Thêm tổ chức mới
          </button>
        </div>

        {/* TREE */}
        <div className={styles.treeContainer}>
          {renderTree(data)}
        </div>
      </div>
      <ConfirmDeleteModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        loading={loadingDelete}
      />
    </div>


  );
}