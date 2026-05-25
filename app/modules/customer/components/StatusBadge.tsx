"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { CustomerStatus } from "@/modules/customer/types/customer.types";

const statusConfig: Record<CustomerStatus, { label: string; bgColor: string; textColor: string; borderColor: string }> = {
  CARING: { label: "Đang chăm sóc", bgColor: "bg-emerald-100", textColor: "text-emerald-700", borderColor: "border-emerald-300" },
  PAUSED: { label: "Ngừng chăm sóc", bgColor: "bg-amber-100", textColor: "text-amber-700", borderColor: "border-amber-300" },
  BLACKLIST: { label: "Blacklist", bgColor: "bg-red-100", textColor: "text-red-700", borderColor: "border-red-300" },
  OTHER: { label: "Khác", bgColor: "bg-slate-100", textColor: "text-slate-700", borderColor: "border-slate-300" },
};

export interface StatusBadgeProps {
  value: CustomerStatus;
  onStatusChange: (status: CustomerStatus) => Promise<void>;
  isLoading?: boolean;
}

export default function StatusBadge({ value, onStatusChange, isLoading = false }: StatusBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const config = statusConfig[value];

  const handleSelect = async (newStatus: CustomerStatus) => {
    if (newStatus === value) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onStatusChange(newStatus);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading || isUpdating}
        className={`inline-flex w-[160px] items-center justify-between gap-1.5 whitespace-nowrap rounded-[5px] border ${config.borderColor} px-3 py-1.5 text-[12px] font-semibold transition ${config.bgColor} ${config.textColor} hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <span className="truncate">{config.label}</span>
        <ChevronDown size={13} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 z-30 mt-1 w-[160px] rounded-[5px] border border-slate-200 bg-white shadow-lg">
            {(Object.keys(statusConfig) as CustomerStatus[]).map((status) => {
              const cfg = statusConfig[status];
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleSelect(status)}
                  disabled={isUpdating}
                  className={`block w-full whitespace-nowrap px-4 py-2.5 text-left text-[12px] transition first:rounded-t-[5px] last:rounded-b-[5px] hover:bg-slate-50 ${status === value ? `${cfg.bgColor} ${cfg.textColor} font-semibold` : "text-slate-700"} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
