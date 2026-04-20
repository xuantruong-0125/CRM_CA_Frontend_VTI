"use client";

import styles from "./ConfirmDeleteModal.module.css";

// interface Props {
//   open: boolean;
//   onClose: () => void;
//   onConfirm: () => void;
//   loading?: boolean;
// }

// export default function ConfirmDeleteModal({
//   open,
//   onClose,
//   onConfirm,
//   loading,
// }: Props) {
//   if (!open) return null;

//   return (
//     <div className={styles.overlay}>
//       <div className={styles.modal}>
//         <h3>Bạn có chắc muốn xóa?</h3>

//         <div className={styles.actions}>
//           <button onClick={onClose}>Hủy</button>
//           <button onClick={onConfirm} disabled={loading}>
//             {loading ? "Đang xóa..." : "Xóa"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  loading = false,
}: Props) {
  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>Xác nhận xóa</h3>

        <p className={styles.message}>
          Bạn có chắc chắn muốn xóa?
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
            {loading ? "Đang xóa..." : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}