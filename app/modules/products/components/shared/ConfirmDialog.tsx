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

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[400px] rounded-[5px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-full ${styles.bg}`}>
              {styles.icon}
            </div>
            <h3 className="text-[16px] font-bold text-slate-800">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            {message}
          </p>
        </div>
        
        <div className="flex justify-end gap-3 p-4 bg-slate-50/50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-[5px] transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 py-2 text-sm font-bold text-white ${styles.button} rounded-[5px] shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2`}
          >
            {isLoading ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
