"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { getCurrentUser } from "@/core/auth/getCurrentUser";
import { useUploadAttachment } from "@/modules/customer/hooks/useCustomerMutations";
import { getApiErrorMessage } from "@/shared/utils/api-error";

type Props = {
  customerId: number;
  onClose: () => void;
};

export default function AttachmentUploadForm({ customerId, onClose }: Props) {
  const upload = useUploadAttachment();
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const isUploading = upload.isPending;

  const submit = async () => {
    if (!file) {
      toast.error("Vui lòng chọn file");
      return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser?.id) {
      toast.error("Không tìm thấy thông tin người dùng đăng nhập.");
      return;
    }

    try {
      setUploadProgress(0);
      await upload.mutateAsync({
        customerId,
        file,
        uploadedBy: currentUser.id,
        onProgress: setUploadProgress,
      });
      toast.success("Tải file lên thành công");

      onClose();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <label className="mb-2 block text-sm font-medium text-slate-700">Chọn file đính kèm</label>
        <input
          type="file"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setUploadProgress(0);
          }}
          disabled={isUploading}
          className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Tiến độ tải lên</span>
            <span>{isUploading ? `${uploadProgress}%` : file ? "Sẵn sàng tải lên" : "Chưa chọn file"}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-sky-600 transition-all duration-300"
              style={{ width: `${isUploading ? uploadProgress : file ? uploadProgress : 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isUploading}
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={isUploading || !file}
          className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-sky-300"
        >
          {isUploading ? `Đang tải lên ${uploadProgress}%` : "Tải lên"}
        </button>
      </div>
    </div>
  );
}
