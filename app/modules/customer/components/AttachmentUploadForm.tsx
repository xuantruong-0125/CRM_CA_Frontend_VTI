"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useUploadAttachment } from "@/modules/customer/hooks/useCustomerMutations";
import { getApiErrorMessage } from "@/shared/utils/api-error";

type Props = {
  customerId: number;
  onClose: () => void;
};

export default function AttachmentUploadForm({ customerId, onClose }: Props) {
  const upload = useUploadAttachment();
  const [file, setFile] = useState<File | null>(null);

  const submit = async () => {
    if (!file) {
      toast.error("Vui lòng chọn file");
      return;
    }

    const fd = new FormData();
    fd.append("file", file);
    fd.append("relatedToType", "CUSTOMER");
    fd.append("relatedToId", String(customerId));

    try {
      await upload.mutateAsync(fd);
      toast.success("Tải file lên thành công");
      onClose();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="space-y-3">
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <div className="flex gap-2 pt-3">
          <button type="button" onClick={onClose} className="rounded border px-3 py-2">Hủy</button>
          <button type="button" onClick={submit} className="rounded bg-sky-600 px-3 py-2 text-white">Tải lên</button>
        </div>
      </div>
    </div>
  );
}
