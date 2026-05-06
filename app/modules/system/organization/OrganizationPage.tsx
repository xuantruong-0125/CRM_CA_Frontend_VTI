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

    if (form.name.length > 50) {
      toast.warning("Tên không được quá 50 ký tự");
      return;
    }

    const regex = /^[a-zA-Z0-9À-ỹ\s]+$/;

    if (!regex.test(form.name)) {
      toast.warning("Tên không được chứa ký tự đặc biệt");
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

    setForm({
      name: node.name,
      parentId: node.parentId,
      type: node.type,
    });
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    try {
      await update(editingId, form);

      toast.success("Cập nhật thành công");

      // reset form
      setEditingId(null);
      setForm({
        name: "",
        parentId: null,
        type: "COMPANY",
      });
    } catch {
      toast.error("Cập nhật thất bại");
    }
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
          {/* <div
            className={styles.treeItem}
            style={{
              backgroundColor: TYPE_COLOR[node.type],
            }}
          > */}

          <div
            className={`${styles.treeItem} ${editingId === node.id ? styles.activeItem : ""
              }`}
            style={{
              backgroundColor:
                editingId === node.id ? "#4b4b4b" : TYPE_COLOR[node.type],
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


              <span className={styles.nodeName}>{node.name}</span>

            </div>

            {/* RIGHT */}
            <div className={styles.actions}>

              <>
                <Pencil
                  size={18}
                  className={`${styles.icon} ${styles.editIcon}`}
                  onClick={() => handleEdit(node)}
                />
                <Trash2
                  size={18}
                  className={`${styles.icon} ${styles.deleteIcon}`}
                  onClick={() => setDeleteId(node.id)}
                />
              </>

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
            <label className={styles.label}>
              Tên tổ chức
              <span className={styles.required}>*</span>
            </label>
            <input
              className={styles.input}
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              placeholder="Nhập tên tổ chức"
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
            <label className={styles.label}>
              Loại tổ chức
              <span className={styles.required}>*</span>
            </label>
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

          <div className={styles.formGroup}>
            <div className={styles.formActions}>
              {editingId ? (
                <>
                  <button
                    className={styles.submit_btn}
                    onClick={handleUpdate}
                  >
                    Cập nhật
                  </button>

                  <button
                    className={styles.cancel_Btn}
                    onClick={() => {
                      setEditingId(null);
                      setForm({
                        name: "",
                        parentId: null,
                        type: "COMPANY",
                      });
                    }}
                  >
                    Hủy
                  </button>
                </>
              ) : (
                <button
                  className={styles.submit_btn}
                  onClick={handleSubmit}
                >
                  Thêm tổ chức mới
                </button>
              )}
            </div>
          </div>
        </div>

        {/* NOTE */}
        <div className={styles.noteBox}>
          <p className={styles.noteTitle}>Ghi chú:</p>

          <ul>
            <li>
              - Các trường có dấu <span className={styles.required}>*</span> là bắt buộc nhập
            </li>
            <li>
              - Loại tổ chức dùng để xác định cấp bậc:
              COMPANY (Công ty) → BRANCH (Chi nhánh) →
              DEPARTMENT (Phòng ban) → TEAM (Nhóm)
            </li>
          </ul>
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