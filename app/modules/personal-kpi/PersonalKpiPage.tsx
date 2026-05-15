// app/modules/personal-kpi/PersonalKpiPage.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./styles/personal-kpi.module.css";
import { usePersonalKpi } from "./hooks/usePersonalKpi";
import { 
  TrendingUp, 
  Users, 
  Phone, 
  Calendar, 
  Mail, 
  Trophy,
  Activity,
  CircleDot,
  ChevronDown,
  Search
} from "lucide-react";

const PersonalKpiPage = () => {
  const { configs, selectedConfigId, setSelectedConfigId, stats, isLoading } = usePersonalKpi();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeConfig = configs.find(c => c.id === selectedConfigId);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredConfigs = configs.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const KpiCard = ({ title, actual, target, icon: Icon, color }: any) => {
    const percent = target > 0 ? Math.min((actual / target) * 100, 100) : 0;
    return (
      <div className={styles.kpiCard}>
        <div className={styles.cardTop}>
          <div className={styles.cardIconBox} style={{ background: `${color}15` }}>
            <Icon size={20} color={color} />
          </div>
          <span className={styles.cardTitleText}>{title}</span>
        </div>
        <div className={styles.progressContainer}>
          <div className={styles.progressLabel}>
            <span className={styles.progressValue}>
              {actual.toLocaleString()} <small style={{ color: '#94a3b8', fontSize: '12px' }}>/ {target.toLocaleString()}</small>
            </span>
            <span className={styles.progressPercent}>{percent.toFixed(1)}%</span>
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${percent}%`, backgroundColor: color }} />
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>MỤC TIÊU KPI CỦA TÔI</h1>
          <p>Theo dõi tiến độ thực tế và hoa hồng dự kiến theo thời gian thực</p>
        </div>

        {/* CUSTOM SEARCHABLE DROPDOWN */}
        <div className={styles.configSelector} ref={dropdownRef} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <Calendar size={18} color="#64748b" />
          <span style={{ flex: 1, fontWeight: 700, fontSize: '14px', color: '#2c3e50' }}>
            {activeConfig?.name || "Chọn kỳ KPI..."}
          </span>
          <ChevronDown size={16} color="#64748b" />

          {isDropdownOpen && (
            <div className={styles.dropdownMenu} onClick={(e) => e.stopPropagation()}>
              <div style={{ position: 'relative' }}>
                <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input 
                  autoFocus
                  className={styles.searchInput}
                  placeholder="Tìm kiếm kỳ KPI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '35px' }}
                />
              </div>
              <div className={styles.dropdownList}>
                {filteredConfigs.length > 0 ? (
                  filteredConfigs.map(c => (
                    <div 
                      key={c.id} 
                      className={`${styles.dropdownItem} ${c.id === selectedConfigId ? styles.active : ""}`}
                      onClick={() => {
                        setSelectedConfigId(c.id);
                        setIsDropdownOpen(false);
                        setSearchTerm("");
                      }}
                    >
                      {c.name}
                    </div>
                  ))
                ) : (
                  <div className={styles.noResult}>Không tìm thấy kết quả</div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <div className={styles.contentGrid}>
        <main>
          <div className={styles.sectionTitle}>
            <TrendingUp size={22} color="#3b82f6" />
            Các chỉ số quan trọng
          </div>
          
          <div className={styles.kpiCardsGrid}>
            <KpiCard title="DOANH SỐ" actual={stats?.totalDoanhSo || 0} target={stats?.targetDoanhSo || 0} icon={TrendingUp} color="#3b82f6" />
            <KpiCard title="KHTN MỚI" actual={stats?.khtnMoi?.actual || 0} target={stats?.khtnMoi?.target || 0} icon={Users} color="#10b981" />
            <KpiCard title="CUỘC GỌI" actual={stats?.cuocGoi?.actual || 0} target={stats?.cuocGoi?.target || 0} icon={Phone} color="#f59e0b" />
            <KpiCard title="KHÁCH HÀNG MỚI" actual={stats?.khMoiMua?.actual || 0} target={stats?.khMoiMua?.target || 0} icon={Trophy} color="#8b5cf6" />
          </div>

          <div className={styles.statsTableCard}>
            <div className={styles.cardHeader}>Chi tiết các chỉ số hoạt động</div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Chỉ số</th>
                  <th>Thực tế / Mục tiêu</th>
                  <th style={{ width: '250px' }}>Tiến độ</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Cuộc gặp trực tiếp", val: stats?.cuocGap, icon: Calendar, color: "#ef4444" },
                  { name: "Cuộc gọi tổng đài", val: stats?.cuocGoiTongDai, icon: Phone, color: "#06b6d4" },
                  { name: "Email báo giá", val: stats?.emailBaoGia, icon: Mail, color: "#ec4899" },
                  { name: "Khách cũ quay lại", val: stats?.khCuQuayLai, icon: Activity, color: "#f97316" },
                ].map((item, idx) => {
                  const percent = (item.val?.target || 0) > 0 ? (item.val!.actual / item.val!.target) * 100 : 0;
                  return (
                    <tr key={idx}>
                      <td>
                        <div className="flex items-center gap-3">
                          <item.icon size={18} color={item.color} />
                          {item.name}
                        </div>
                      </td>
                      <td>
                        <span className="font-bold">{item.val?.actual || 0}</span>
                        <span className="text-gray-400"> / {item.val?.target || 0}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className={styles.progressTrack} style={{ flex: 1 }}>
                            <div className={styles.progressFill} style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: item.color }} />
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#e67e22', minWidth: '45px' }}>{percent.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>

        <aside>
          <div className={styles.commissionCard}>
            <div className={styles.commTitle}>HOA HỒNG DỰ KIẾN</div>
            <div className={styles.commValue}>{formatCurrency(stats?.totalHoaHong || 0)}</div>
            <div className={styles.commNote}>Dựa trên doanh số đã hoàn thành</div>
          </div>

          <div className={styles.infoCard}>
            <h3>
              <CircleDot size={18} color="#3b82f6" />
              Thông tin kỳ KPI
            </h3>
            <div className={styles.infoRow}>
              <span>Bắt đầu:</span>
              <span>{activeConfig?.startDate || "-"}</span>
            </div>
            <div className={styles.infoRow}>
              <span>Kết thúc:</span>
              <span>{activeConfig?.endDate || "-"}</span>
            </div>
            <div className={styles.infoRow}>
              <span>Trạng thái:</span>
              <span className={styles.statusTag}>{activeConfig?.status || "ACTIVE"}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PersonalKpiPage;
