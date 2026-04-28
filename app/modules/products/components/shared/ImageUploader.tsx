"use client";

import React, { useState } from "react";
import { UploadCloud, X } from "lucide-react";
import axios from "axios";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ value, onChange }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Gọi API Spring Boot upload
      const res = await axios.post("http://localhost:8080/api/v1/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Giả định backend trả về { data: { url: "..." } } hoặc URL trực tiếp
      const url = res.data?.data?.url || res.data?.url || res.data;
      if (typeof url === "string") {
        onChange(url);
      } else {
        // Fallback mockup nếu API chưa hoạt động
        onChange(URL.createObjectURL(file));
      }
    } catch (error) {
      console.error("Upload failed", error);
      // Fallback cho mục đích demo UI
      onChange(URL.createObjectURL(file));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm flex flex-col items-center justify-center min-h-[200px]">
      {value ? (
        <div className="relative group w-full flex justify-center">
          <img src={value} alt="Uploaded" className="max-h-48 rounded object-contain" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-slate-300 rounded cursor-pointer hover:border-sky-500 hover:bg-slate-50 transition-colors p-6 text-center">
          <UploadCloud className="text-slate-400 mb-2" size={32} />
          <span className="text-sm font-medium text-slate-700">Tải ảnh lên</span>
          <span className="text-xs text-slate-500 mt-1">PNG, JPG, GIF up to 5MB</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          {isUploading && <div className="mt-2 text-xs text-sky-600 font-medium">Đang tải...</div>}
        </label>
      )}
    </div>
  );
};
