"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { CustomerClassification } from "@/modules/customer/types/customer.types";

const classificationConfig: Record<CustomerClassification, { label: string; bgColor: string; textColor: string; borderColor: string }> = {
  SILVER: { label: "Bạc", bgColor: "bg-slate-100", textColor: "text-slate-700", borderColor: "border-slate-300" },
  GOLD: { label: "Vàng", bgColor: "bg-yellow-100", textColor: "text-yellow-700", borderColor: "border-yellow-300" },
  DIAMOND: { label: "Kim cương", bgColor: "bg-blue-100", textColor: "text-blue-700", borderColor: "border-blue-300" },
};

export interface ClassificationBadgeProps {
  value: CustomerClassification;
  onClassificationChange: (classification: CustomerClassification) => Promise<void>;
  isLoading?: boolean;
}

export default function ClassificationBadge({ value, onClassificationChange, isLoading = false }: ClassificationBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const config = classificationConfig[value];

  const handleSelect = async (newClassification: CustomerClassification) => {
    if (newClassification === value) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onClassificationChange(newClassification);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update classification:", error);
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
        className={`inline-flex w-[130px] items-center justify-between gap-1.5 whitespace-nowrap rounded-[5px] border ${config.borderColor} px-3 py-1.5 text-[12px] font-semibold transition ${config.bgColor} ${config.textColor} hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <span className="truncate">{config.label}</span>
        <ChevronDown size={13} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 z-30 mt-1 w-[130px] rounded-[5px] border border-slate-200 bg-white shadow-lg">
            {(Object.keys(classificationConfig) as CustomerClassification[]).map((classification) => {
              const cfg = classificationConfig[classification];
              return (
                <button
                  key={classification}
                  type="button"
                  onClick={() => handleSelect(classification)}
                  disabled={isUpdating}
                  className={`block w-full whitespace-nowrap px-4 py-2.5 text-left text-[12px] transition first:rounded-t-[5px] last:rounded-b-[5px] hover:bg-slate-50 ${classification === value ? `${cfg.bgColor} ${cfg.textColor} font-semibold` : "text-slate-700"} disabled:cursor-not-allowed disabled:opacity-50`}
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
