"use client";

import React, { useState, useEffect } from "react";
import { UploadCloud, X } from "lucide-react";

interface ImageUploaderProps {
  value?: string; // Current image URL (from DB or preview)
  onChange: (file: File | null) => void; // Pass the selected file back
  onClear: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ value, onChange, onClear }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    // If value is a URL (starts with http or /), use it as preview
    if (value && (value.startsWith("http") || value.startsWith("/"))) {
      setPreviewUrl(value);
    } else {
      setPreviewUrl(null);
    }
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Pass file back to parent
    onChange(file);
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onClear();
  };

  return (
    <div className="relative w-full h-full group">
      {previewUrl ? (
        <div className="w-full h-full flex items-center justify-center bg-white">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-full object-cover rounded-[5px]" 
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-rose-500 text-rose-500 hover:text-white rounded-full shadow-sm transition-all z-20 border border-slate-200"
          >
            <X size={14} />
          </button>
          
          {/* Overlay for re-uploading */}
          <label className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-[5px] z-10">
             <div className="bg-white/90 p-2 rounded-full shadow-sm">
                <UploadCloud className="text-sky-600" size={20} />
             </div>
             <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-slate-100 transition-colors text-center p-2 rounded-[5px]">
          <UploadCloud className="text-slate-400 mb-1" size={24} />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Tải ảnh</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </label>
      )}
    </div>
  );
};
