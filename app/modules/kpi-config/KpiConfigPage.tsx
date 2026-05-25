// app/modules/kpi-config/KpiConfigPage.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MetricType, MetricLabels } from './types/kpi-config.type';
import { useKpiConfigForm } from './hooks/useKpiConfigForm';
import styles from './styles/kpi-config.module.css';
import { ChevronDown, Search, User, Building2, Check } from "lucide-react";

interface KpiConfigPageProps {
  id?: number | string;
}

const KpiConfigPage: React.FC<KpiConfigPageProps> = ({ id }) => {
  const {
    formData, setFormData,
    targets, setTargets,
    allOptions,
    selectedAssignments, setSelectedAssignments,
    isLoading,
    handleSave,
    handleCommissionChange,
    cancel
  } = useKpiConfigForm(id);

  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openDropdown = () => {
    if (boxRef.current) {
      const rect = boxRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setDropdownOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTargetChange = (metric: MetricType, value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    setTargets(prev => ({ ...prev, [metric]: cleanValue }));
  };

  const formatCurrency = (val: string) => {
    if (!val) return '';
    return new Intl.NumberFormat('vi-VN').format(parseInt(val, 10));
  };

  const toggleOption = (opt: any) => {
    // Chỉ cho phép chọn duy nhất 1 đối tượng
    setSelectedAssignments([{ ...opt, commissionPercent: 0 }]);
    setDropdownOpen(false); // Đóng dropdown ngay sau khi chọn
  };

  if (isLoading) return <div className={styles.kpiPageContainer}>Đang tải dữ liệu...</div>;

  return (
    <div className={styles.kpiPageContainer}>
      <header className={styles.formHeader}>
        <h1>THÔNG SỐ KPI CƠ BẢN » {id ? 'SỬA' : 'THÊM MỚI'}</h1>
        <div className={styles.headerActions}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave}>LƯU</button>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={cancel}>HỦY BỎ</button>
        </div>
      </header>

      <section className={styles.formCard}>
        <div className={styles.cardTitle}>CƠ BẢN</div>
        <form className={styles.kpiFormGrid} onSubmit={(e) => e.preventDefault()}>
          <label>Tên:*</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Tên cấu hình KPI" required />

          <label>Tình trạng:*</label>
          <select name="status" value={formData.status} onChange={handleInputChange}>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Ngừng hoạt động</option>
          </select>

          <label>Ngày bắt đầu:*</label>
          <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} />

          <label>Ngày kết thúc:*</label>
          <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} />

          {Object.values(MetricType).map((metric) => (
            <React.Fragment key={metric}>
              <label>{MetricLabels[metric]}:</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={metric === MetricType.REVENUE ? formatCurrency(targets[metric]) : targets[metric]}
                  onChange={(e) => handleTargetChange(metric, e.target.value)}
                  placeholder="0"
                />
              </div>
            </React.Fragment>
          ))}

          <label>Chỉ định cho:*</label>
          <div className={styles.multiSelectWrap} ref={boxRef}>
            <div className={styles.multiSelectBox} onClick={openDropdown}>
              {selectedAssignments.map(s => (
                <span key={s.key} className={`${styles.assignTag} ${s.type === 'user' ? styles.tagUser : styles.tagOrg}`}>
                  {s.type === 'user' ? <User size={14} className="mr-1" /> : <Building2 size={14} className="mr-1" />} 
                  <span className="mr-1">{s.label}</span>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    step="0.1"
                    placeholder="%" 
                    value={s.commissionPercent !== undefined && s.commissionPercent !== null ? s.commissionPercent : ''} 
                    onChange={(e) => handleCommissionChange(s.key, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: '45px', padding: '0px 4px', border: 'none', borderBottom: '1px solid rgba(0,0,0,0.2)', background: 'transparent', color: '#333', fontSize: '13px', outline: 'none', fontWeight: 'bold' }}
                    title="Phần trăm hoa hồng"
                  />%
                  <button type="button" onClick={(e) => { e.stopPropagation(); toggleOption(s); }} className={styles.tagRemove}>×</button>
                </span>
              ))}
              <input type="text" className={styles.multiSelectSearch} placeholder={selectedAssignments.length === 0 ? "Tìm nhân viên hoặc phòng ban..." : ""} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onFocus={openDropdown} />
            </div>

            {dropdownOpen && typeof document !== 'undefined' && createPortal(
              <div ref={dropdownRef} className={styles.multiSelectDropdown} style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 9999 }}>
                {allOptions.filter(o => o.label.toLowerCase().includes(searchTerm.toLowerCase())).map(opt => (
                  <div key={opt.key} className={styles.multiSelectItem} onClick={() => toggleOption(opt)}>
                    {selectedAssignments.some(s => s.key === opt.key) && <Check size={14} />} {opt.label}
                  </div>
                ))}
              </div>,
              document.body
            )}
          </div>

          <label>Mô tả:</label>
          <textarea name="description" rows={3} value={formData.description} onChange={handleInputChange} />
        </form>
      </section>
    </div>
  );
};

export default KpiConfigPage;
