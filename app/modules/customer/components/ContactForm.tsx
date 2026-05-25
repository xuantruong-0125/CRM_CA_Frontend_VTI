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

export default function ContactForm({ customerId, onClose, mode = "create", initialValues, contactId }: Props) {
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const [fullName, setFullName] = useState(initialValues?.fullName ?? "");
  const [phone, setPhone] = useState(initialValues?.phone ?? "");
  const [email, setEmail] = useState(initialValues?.email ?? "");
  const [position, setPosition] = useState(initialValues?.position ?? "");

  const submit = async () => {
    const payload: CreateContactDTO = {
      fullName,
      phone: phone || undefined,
      email: email || undefined,
      position: position || undefined,
      customerId,
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

  return (
    <div>
      <div className="space-y-3">
        <label className="flex flex-col">
          <span className="text-sm font-medium text-slate-900">Họ tên</span>
          <input className="mt-1 rounded border border-slate-300 px-2 py-1 text-slate-900" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium text-slate-900">Số điện thoại</span>
          <input className="mt-1 rounded border border-slate-300 px-2 py-1 text-slate-900" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium text-slate-900">Email</span>
          <input className="mt-1 rounded border border-slate-300 px-2 py-1 text-slate-900" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium text-slate-900">Chức vụ</span>
          <input className="mt-1 rounded border border-slate-300 px-2 py-1 text-slate-900" value={position} onChange={(e) => setPosition(e.target.value)} />
        </label>

        <div className="flex gap-2 pt-3">
          <button type="button" onClick={onClose} className="rounded border px-3 py-2">Hủy</button>
          <button type="button" onClick={submit} className="rounded bg-sky-600 px-3 py-2 text-white">
            {mode === "edit" ? "Cập nhật" : "Tạo"}
          </button>
        </div>
      </div>
    </div>
  );
}
