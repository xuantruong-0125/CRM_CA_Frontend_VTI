"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/shared/utils/api-error";
import type { NoteResponseDTO } from "@/modules/customer/types/customer.types";
import { useCreateNote, useUpdateNote } from "@/modules/customer/hooks/useCustomerMutations";

type CreateNoteDTO = {
  content: string;
  notableType: "CUSTOMER";
  notableId: number;
  privateNote?: boolean;
};

type NoteFormProps = {
  customerId: number;
  onClose: () => void;
  mode?: "create" | "edit";
  initialValues?: Partial<NoteResponseDTO> | null;
  id?: number;
};

export default function NoteForm({
  customerId,
  onClose,
  mode = "create",
  initialValues,
  id,
}: NoteFormProps) {
  const [content, setContent] = useState(initialValues?.content || "");
  const [privateNote, setPrivateNote] = useState(initialValues?.privateNote ?? false);
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();

  const inputClass =
    "h-8 w-full rounded-[6px] border border-slate-300 bg-white px-2.5 text-[11px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15";
  const labelClass = "text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung ghi chú");
      return;
    }

    try {
      const payload: CreateNoteDTO = {
        content: content.trim(),
        notableType: "CUSTOMER",
        notableId: customerId,
        privateNote,
      };

      if (mode === "edit" && typeof id === "number") {
        await updateNote.mutateAsync({ id, payload: payload as any } as any);
      } else {
        await createNote.mutateAsync(payload as any);
      }
      toast.success(mode === "create" ? "Tạo ghi chú thành công" : "Cập nhật ghi chú thành công");
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="content" className={labelClass}>
          Nội dung <span className="text-red-500">*</span>
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Nhập nội dung ghi chú nhanh"
          className="h-24 w-full rounded-[6px] border border-slate-300 bg-white px-2.5 py-2 text-[11px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 resize-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="privateNote"
          type="checkbox"
          checked={privateNote}
          onChange={(e) => setPrivateNote(e.target.checked)}
          className="h-4 w-4 cursor-pointer rounded border-slate-300 text-sky-600 self-center align-middle !mr-[5px]"
        />
        <label htmlFor="privateNote" className="cursor-pointer text-[11px] font-medium text-slate-700">
          Ghi chú riêng tư
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-[6px] border border-slate-300 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={createNote.isPending || updateNote.isPending}
          className="rounded-[6px] bg-sky-600 px-4 py-2 text-[11px] font-semibold text-white transition hover:bg-sky-500 disabled:opacity-50"
        >
          {createNote.isPending || updateNote.isPending ? "Đang lưu..." : "Lưu"}
        </button>
      </div>
    </form>
  );
}
