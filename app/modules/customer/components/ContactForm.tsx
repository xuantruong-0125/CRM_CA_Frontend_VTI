"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useCreateContact, useUpdateContact } from "@/modules/customer/hooks/useCustomerMutations";
import type { ContactResponseDTO, CreateContactDTO } from "@/modules/customer/types/customer.types";
import { getApiErrorMessage } from "@/shared/utils/api-error";

type Props = {
  customerId: number;
  onClose: () => void;
  mode?: "create" | "edit";
  initialValues?: Partial<ContactResponseDTO> | null;
  contactId?: number;
};

const inputClass =
  "h-9 w-full rounded-lg border border-slate-200 bg-slate-50/30 px-3 text-[12px] text-slate-800 outline-none transition duration-150 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/15";

const labelClass = "block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-1.5";

export default function ContactForm({ customerId, onClose, mode = "create", initialValues, contactId }: Props) {
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const [fullName, setFullName] = useState(initialValues?.fullName ?? "");
  const [phone, setPhone] = useState(initialValues?.phone ?? "");
  const [email, setEmail] = useState(initialValues?.email ?? "");
  const [position, setPosition] = useState(initialValues?.position ?? "");
  const [address, setAddress] = useState(initialValues?.address ?? "");

  const isSubmitting = createContact.isPending || updateContact.isPending;

  const submit = async () => {
    if (!fullName.trim()) {
      toast.error("Vui lòng nhập họ tên liên hệ");
      return;
    }

    const payload: CreateContactDTO = {
      customerId,
      fullName: fullName.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      position: position.trim() || undefined,
      address: address.trim() || undefined,
      dateOfBirth: initialValues?.dateOfBirth || undefined,
      notes: initialValues?.notes || undefined,
      isPrimary: initialValues?.isPrimary ?? false,
      isActive: true,
    };

    try {
      if (mode === "edit" && contactId) {
        await updateContact.mutateAsync({ id: contactId, payload });
        toast.success("Cập nhật người liên hệ thành công");
      } else {
        await createContact.mutateAsync(payload);
        toast.success("Tạo người liên hệ thành công");
      }
      onClose();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "TEXTAREA" ||
        target.tagName === "BUTTON" ||
        target.getAttribute("type") === "submit"
      ) {
        return;
      }
      e.preventDefault();
      const container = e.currentTarget;
      const focusableElements = Array.from(
        container.querySelectorAll(
          "input:not([disabled]):not([type='hidden']), select:not([disabled]), textarea:not([disabled]), button[type='submit']:not([disabled])"
        )
      ).filter((el: any) => {
        return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
      }) as HTMLElement[];

      const currentIndex = focusableElements.indexOf(target);
      if (currentIndex > -1 && currentIndex < focusableElements.length - 1) {
        focusableElements[currentIndex + 1].focus();
      }
    }
  };

  return (
    <div onKeyDown={handleKeyDown} className="space-y-5">
      <div className="grid gap-4">
        {/* Full Name */}
        <label className="block">
          <span className={labelClass}>
            Họ tên <span className="text-red-500">*</span>
          </span>
          <input
            type="text"
            placeholder="VD: Nguyễn Văn A"
            className={inputClass}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isSubmitting}
          />
        </label>

        {/* Position */}
        <label className="block">
          <span className={labelClass}>Chức vụ</span>
          <input
            type="text"
            placeholder="VD: Giám đốc kinh doanh"
            className={inputClass}
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            disabled={isSubmitting}
          />
        </label>

        {/* Phone & Email (2 columns) */}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Số điện thoại</span>
            <input
              type="text"
              placeholder="VD: 0987654321"
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSubmitting}
            />
          </label>

          <label className="block">
            <span className={labelClass}>Email</span>
            <input
              type="email"
              placeholder="VD: email@example.com"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </label>
        </div>

        {/* Address */}
        <label className="block">
          <span className={labelClass}>Địa chỉ</span>
          <input
            type="text"
            placeholder="VD: 123 Nguyễn Huệ, Q.1, TP.HCM"
            className={inputClass}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={isSubmitting}
          />
        </label>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={isSubmitting}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-sky-600 px-5 text-[12px] font-semibold text-white transition hover:bg-sky-700 shadow-sm shadow-sky-500/10 disabled:opacity-50"
        >
          {isSubmitting ? "Đang lưu..." : mode === "edit" ? "Cập nhật" : "Tạo liên hệ"}
        </button>
      </div>
    </div>
  );
}
