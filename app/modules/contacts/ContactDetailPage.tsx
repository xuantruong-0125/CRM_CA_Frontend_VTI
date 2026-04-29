"use client";

import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Save, XCircle, Keyboard, ChevronLeft } from "lucide-react";
import { ContactForm } from "./components/forms/ContactForm";
import { useContact } from "./hooks/useContacts";

export const ContactDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id ? Number(params.id) : null;
  const isEditMode = !!id;
  
  const { contact, isLoading } = useContact(id);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        const saveButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (saveButton) saveButton.click();
      }
      if (e.key === "Escape") {
        router.push("/contacts");
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  return (
    <div className="max-w-5xl mx-auto pb-10 px-4">
      {/* Header / Action Bar */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-[5px] border border-slate-200 shadow-sm">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
            <span 
              className="hover:text-sky-600 cursor-pointer transition-colors flex items-center gap-1" 
              onClick={() => router.push("/contacts")}
            >
              <ChevronLeft size={10} /> Quản lý liên hệ
            </span>
            <span>/</span>
            <span className="text-slate-600">{isEditMode ? "Chỉnh sửa" : "Thêm mới"}</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-500 font-bold">Ctrl + S</kbd> Lưu
             </div>
             <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-500 font-bold">Esc</kbd> Hủy
             </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/contacts")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-[5px] transition-all"
          >
            <XCircle size={16} />
            Hủy bỏ
          </button>
          <button
            onClick={() => {
              const saveButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
              if (saveButton) saveButton.click();
            }}
            className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-[5px] shadow-md transition-all"
          >
            <Save size={16} /> Lưu dữ liệu
          </button>
        </div>
      </div>

      <div className="relative">
        {isEditMode && isLoading ? (
          <div className="bg-white p-20 rounded-md border border-slate-200 text-center text-slate-500">
            Đang tải dữ liệu liên hệ...
          </div>
        ) : (
          <ContactForm initialData={contact} isEditMode={isEditMode} />
        )}
      </div>

      {/* Shortcut Info Footer */}
      <div className="mt-6 flex items-center gap-6 px-4 py-3 bg-white rounded-[5px] border border-slate-200 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0">
          <Keyboard size={14} className="text-slate-400" />
          Phím tắt hệ thống:
        </div>
        <div className="flex gap-6 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded shadow-sm font-bold text-sky-600">Ctrl + S</kbd> Lưu nhanh
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded shadow-sm font-bold text-rose-500">Esc</kbd> Hủy bỏ
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded shadow-sm font-bold text-slate-700">Enter</kbd> Chuyển ô nhập
          </div>
        </div>
      </div>
    </div>
  );
};
