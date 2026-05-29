"use client";

import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận xóa",
  message,
  confirmLabel = "Xóa",
  cancelLabel = "Hủy",
  variant = "danger",
  isLoading = false,
}) => {
  // Keyboard shortcut: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && !isLoading) onConfirm();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onConfirm, isLoading]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <AlertTriangle className="text-rose-500" size={24} />,
          button: "bg-rose-600 hover:bg-rose-700 shadow-rose-100",
          bg: "bg-rose-50",
          border: "border-rose-100",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="text-amber-500" size={24} />,
          button: "bg-amber-600 hover:bg-amber-700 shadow-amber-100",
          bg: "bg-amber-50",
          border: "border-amber-100",
        };
      default:
        return {
          icon: <AlertTriangle className="text-sky-500" size={24} />,
          button: "bg-sky-600 hover:bg-sky-700 shadow-sky-100",
          bg: "bg-sky-50",
          border: "border-sky-100",
        };
    }
  };

  const styles = getVariantStyles();

  // return (
  //   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
  //     <div className="bg-[#0b0042] w-full max-w-[360px] rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-800/50">
  //       <div className="p-5 text-white">
  //         <h6 className="text-lg font-semibold text-center tracking-wide">{title}</h6>

  //         <div className="h-px bg-slate-500/50 my-4 w-full" />

  //         <p className="text-[15px] text-center mb-8 font-normal">
  //           {message}
  //         </p>

  //         <div className="flex justify-center gap-3">
  //           <button
  //             type="button"
  //             onClick={onClose}
  //             disabled={isLoading}
  //             className="px-6 py-1.5 text-[15px] font-medium text-white bg-transparent border border-slate-400/80 rounded hover:bg-white/10 transition-colors disabled:opacity-50"
  //           >
  //             {cancelLabel}
  //           </button>
  //           <button
  //             type="button"
  //             onClick={onConfirm}
  //             disabled={isLoading}
  //             className="px-6 py-1.5 text-[15px] font-medium text-white bg-[#ee5d5d] border border-[#ee5d5d] rounded hover:bg-[#d44c4c] transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
  //           >
  //             {isLoading ? "Đang xử lý..." : confirmLabel}
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40">
      <div className="w-[320px] rounded-[10px] bg-[rgb(8,1,66)] shadow-[0_10px_25px_rgba(0,0,0,0.2)] overflow-hidden">

        <div className="px-3 pt-0 pb-3">
          <h5 className="mb-[10px] border-b border-[#ccc] pb-2 pt-[10px] text-center text-[larger] !font-bold text-aliceblue text-white">
            {title}
          </h5>

          <p className="mb-[15px] text-[15px] text-white">
            {message}
          </p>

          <div className="flex justify-end gap-[10px]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="cursor-pointer !rounded-[5px] border border-[#ccc] bg-[rgb(62,62,62)] px-3 py-2 text-white disabled:opacity-50"
            >
              {cancelLabel}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="cursor-pointer !rounded-[5px] border border-[#ccc] bg-[#ef4444] px-3 py-2 text-white hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? "Đang xử lý..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
