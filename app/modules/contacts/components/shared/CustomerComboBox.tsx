"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Plus, Check } from "lucide-react";
import { Customer } from "../../types/contact.type";

interface CustomerComboBoxProps {
  customers: Customer[];
  value: number | null;
  onChange: (customerId: number) => void;
}

export const CustomerComboBox: React.FC<CustomerComboBoxProps> = ({
  customers,
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const safeCustomers = useMemo(() => (Array.isArray(customers) ? customers : []), [customers]);

  const selectedCustomer = useMemo(
    () => safeCustomers.find((c) => c.id === value),
    [safeCustomers, value]
  );

  const filteredCustomers = useMemo(() => {
    let result = safeCustomers;
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = safeCustomers.filter((c) => {
        const name = c.name?.toLowerCase() || "";
        const code = c.customerCode?.toLowerCase() || "";
        return name.includes(searchLower) || code.includes(searchLower);
      });
    }
    return result.slice(0, 10);
  }, [safeCustomers, search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (customerId: number) => {
    onChange(customerId);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-slate-300 rounded-[5px] bg-white hover:border-slate-400 focus:ring-1 focus:ring-sky-500 transition-all text-slate-900"
      >
        <span className={`truncate flex-1 text-left pr-2 ${selectedCustomer ? "text-slate-900" : "text-slate-400"}`}>
          {selectedCustomer ? `${selectedCustomer.customerCode} - ${selectedCustomer.name}` : "-- Chọn khách hàng --"}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-[5px] shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc mã..."
              className="flex-1 bg-transparent border-none text-xs focus:ring-0 outline-none text-slate-700"
              autoFocus
            />
          </div>

          <div className="max-h-[220px] overflow-y-auto">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelect(c.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-sky-50 transition-colors ${
                    value === c.id ? "bg-sky-50 text-sky-700 font-bold" : "text-slate-700"
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-xs text-slate-500">{c.customerCode}</span>
                    <span>{c.name}</span>
                  </div>
                  {value === c.id && <Check size={14} />}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-xs text-center text-slate-500 italic">
                Không tìm thấy khách hàng nào
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
