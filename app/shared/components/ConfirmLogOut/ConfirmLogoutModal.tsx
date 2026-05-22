"use client";

import styles from "./ConfirmLogoutModal.module.css";


interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function ConfirmLogoutModal({
  open,
  onClose,
  onConfirm,
  loading = false,
}: Props) {
  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>Xác nhận đăng xuất</h3>

        <p className={styles.message}>
          Bạn có chắc chắn muốn đăng xuất?
        </p>

        <div className={styles.actions}>
          <button
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>

          <button
            className={styles.deleteBtn}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Đang đăng xuất..." : "Đăng xuất"}
          </button>
        </div>
      </div>
    </div>
  );
}