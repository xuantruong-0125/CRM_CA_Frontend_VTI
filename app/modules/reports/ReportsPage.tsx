// app/modules/reports/ReportsPage.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import { formatNumber } from "./utils/reports.utils";
import { METRIC_SHORT_LABELS } from "./types/reports.type";
import { useReports } from "./hooks/useReports";
import Link from "next/link";
import styles from './styles/reports.module.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { Home, Search, ChevronDown } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const centerTextPlugin = {
  id: 'centerText',
  beforeDraw: function(chart: any) {
    if (chart.config.type !== 'doughnut') return;
    const ctx = chart.ctx;
    const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
    const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 16px Manrope';
    ctx.fillStyle = '#2c3e50';
    
    // Ép kiểu để tránh lỗi TypeScript không nhận diện thuộc tính tự tạo
    const options = chart.config.options as any;
    const text = options?.plugins?.centerText?.text || '';
    ctx.fillText(text, centerX, centerY);
    ctx.restore();
  }
};

export default function ReportsPage() {
  const {
    configs,
    selectedConfigId,
    setSelectedConfigId,
    dashboardData,
    detailData,
    activeTab,
    setActiveTab,
    selectedDashboardUserId,
    setSelectedDashboardUserId,
    getGroupedData
  } = useReports();

  const [searchConfig, setSearchConfig] = useState("");
  const [searchEmployee, setSearchEmployee] = useState("");
  const [isConfigDropdownOpen, setIsConfigDropdownOpen] = useState(false);
  const configDropdownRef = useRef<HTMLDivElement>(null);

  const [searchDashboardUser, setSearchDashboardUser] = useState("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (configDropdownRef.current && !configDropdownRef.current.contains(e.target as Node)) {
        setIsConfigDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const groupedData = getGroupedData(searchEmployee);

  return (
    <div className={styles.reportPageContainer}>
      <nav className={styles.reportNav}>
        <div className={styles.reportNavHeader}>
          <Home size={18} className="opacity-80" />
          {activeTab === "dashboard" ? "TỔNG QUAN KPI" : "BÁO CÁO CHI TIẾT KPI"}
        </div>
        <div className="flex">
          <Link href="/kpi-configs" className={styles.reportNavLink}>
            THIẾT LẬP KPI
          </Link>
          <button 
            onClick={() => setActiveTab("detail")} 
            className={`${styles.reportNavLink} ${activeTab === 'detail' ? styles.active : ''}`}
          >
            BÁO CÁO
          </button>
          <button 
            onClick={() => setActiveTab("dashboard")} 
            className={`${styles.reportNavLink} ${activeTab === 'dashboard' ? styles.active : ''}`}
          >
            TỔNG QUAN
          </button>
        </div>
      </nav>

      <div className={styles.reportFilterBar}>
        <div className="flex items-center gap-3">
          <label className={styles.filterLabel}>Cấu hình KPI:</label>
          <div className="relative" ref={configDropdownRef}>
            <div 
              className={styles.reportDropdownTrigger}
              onClick={() => setIsConfigDropdownOpen(!isConfigDropdownOpen)}
            >
            <span className="truncate max-w-45 font-medium text-[#333]">
              {configs.find(c => c.id === selectedConfigId)?.name || "Chọn cấu hình KPI..."}
            </span>
            <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${isConfigDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {isConfigDropdownOpen && (
            <div className={styles.reportDropdownMenu}>
              <div className={styles.reportDropdownSearchWrap}>
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm cấu hình..." 
                  className={styles.reportDropdownSearchInput}
                  style={{ paddingLeft: 40 }}
                  value={searchConfig}
                  onChange={(e) => setSearchConfig(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
              <div className="overflow-y-auto flex-1 max-h-55">
                {configs.filter(c => c.name.toLowerCase().includes(searchConfig.toLowerCase())).map(c => (
                  <div 
                    key={c.id} 
                    className={`${styles.reportDropdownItem} ${selectedConfigId === c.id ? styles.active : ''}`}
                    onClick={() => {
                      setSelectedConfigId(c.id);
                      setIsConfigDropdownOpen(false);
                      setSearchConfig("");
                    }}
                  >
                    {c.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>
        
        {activeTab === "detail" && (
          <div className="flex items-center gap-3 ml-auto">
            <div className={styles.reportSearchWrap}>
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm nhân viên..." 
                className={styles.reportSearchInput}
                value={searchEmployee}
                onChange={(e) => setSearchEmployee(e.target.value)}
              />
            </div>
          </div>
        )}

        {activeTab === "dashboard" && dashboardData && (
          <div className="flex items-center gap-3">
            <span className={styles.filterLabel} style={{ color: '#e67e22' }}>📊 Xem báo cáo của:</span>
            <div className="relative" ref={userDropdownRef}>
              <div 
                className={`${styles.reportDropdownTrigger} ${styles.highlight}`}
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              >
                <span className="truncate max-w-50">
                  {selectedDashboardUserId ? detailData.find(u => u.userId === selectedDashboardUserId)?.userName : `Tất cả nhân viên — ${dashboardData.kpiConfigName}`}
                </span>
                <ChevronDown size={16} className={`ml-2 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {isUserDropdownOpen && (
                <div className={styles.reportDropdownMenu}>
                  <div className={styles.reportDropdownSearchWrap}>
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                    <input 
                      type="text" 
                      placeholder="Tìm nhân viên..." 
                      className={styles.reportDropdownSearchInput}
                      value={searchDashboardUser}
                      onChange={(e) => setSearchDashboardUser(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  </div>
                  <div className="overflow-y-auto flex-1 max-h-55">
                    <div 
                      className={`${styles.reportDropdownItem} font-semibold ${!selectedDashboardUserId ? styles.active : ''}`}
                      onClick={() => {
                        setSelectedDashboardUserId(null);
                        setIsUserDropdownOpen(false);
                        setSearchDashboardUser("");
                      }}
                    >
                      Tất cả nhân viên — {dashboardData.kpiConfigName}
                    </div>
                    {detailData.filter(u => u.userName.toLowerCase().includes(searchDashboardUser.toLowerCase())).map(row => (
                      <div 
                        key={row.userId} 
                        className={`${styles.reportDropdownItem} ${selectedDashboardUserId === row.userId ? styles.active : ''}`}
                        onClick={() => {
                          setSelectedDashboardUserId(row.userId);
                          setIsUserDropdownOpen(false);
                          setSearchDashboardUser("");
                        }}
                      >
                        {row.userName}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-5 overflow-x-auto">
        {activeTab === "detail" && (
          detailData.length > 0 ? (
            <table className={styles.reportTableWrap}>
              <thead>
                <tr>
                  <th className={styles.reportTableTh} style={{ position: 'sticky', left: 0, zIndex: 3 }}>Nhân viên</th>
                  {METRIC_SHORT_LABELS.map((label, idx) => (
                    <th key={idx} className={styles.reportTableTh}>
                      {label}
                    </th>
                  ))}
                  <th className={styles.reportTableTh}>Hoa Hồng</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(groupedData).map((orgName, gIdx) => (
                  <React.Fragment key={gIdx}>
                    <tr>
                      <td colSpan={13} className={styles.reportTableOrgHeader}>
                        {orgName}
                      </td>
                    </tr>
                    {groupedData[orgName].map((row, rIdx) => (
                      <tr key={rIdx} className={styles.reportTableRow}>
                        <td className={styles.reportTableTd} style={{ textAlign: 'left', fontWeight: 'bold', position: 'sticky', left: 0, zIndex: 2, background: 'inherit' }}>
                          <span className="text-[#2c3e50] cursor-pointer hover:underline">{row.userName}</span>
                        </td>
                        {row.metricValues.map((mv, mIdx) => {
                          const hasTarget = mv.target > 0;
                          const percent = hasTarget ? (mv.actual / mv.target) * 100 : 0;
                          let color = "#2c3e50";
                          if (hasTarget) {
                            if (percent >= 100) color = "#27ae60";
                            else if (percent >= 50) color = "#f39c12";
                            else color = "#e74c3c";
                          }
                          return (
                            <td key={mIdx} className={styles.reportTableTd} style={{ color }}>
                              <span className="font-bold text-[12px]">
                                {formatNumber(mv.actual)} / {formatNumber(mv.target)}
                              </span>
                              <span className="text-[10px] block mt-[1px]">
                                ({percent.toFixed(1)}%)
                              </span>
                            </td>
                          );
                        })}
                        <td className={styles.reportTableTd} style={{ fontWeight: 'extrabold' }}>
                          <span style={{ color: row.hoaHong > 0 ? "#27ae60" : "#e74c3c" }}>
                            {formatNumber(row.hoaHong)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center p-[60px] text-[#999]">
              <p>Chưa có dữ liệu báo cáo.</p>
            </div>
          )
        )}

        {activeTab === "dashboard" && dashboardData && (
          <div className="max-w-[1400px] mx-auto space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_210px_210px] gap-4">
              <div className={styles.dashboardCard}>
                <div className={styles.dashboardCardHeader}>DOANH SỐ & HOA HỒNG</div>
                <div className="flex-1 flex flex-col items-center justify-center py-6">
                  <div className="text-[28px] font-extrabold text-[#e67e22] mb-1">{formatNumber(dashboardData.totalDoanhSo)}</div>
                  <div className="text-[11px] text-[#7f8c8d] uppercase font-semibold mb-6">Doanh số đạt được</div>
                  <div className="w-10 border-t border-[#e0e0e0] mb-5"></div>
                  <div className="text-[22px] font-extrabold text-[#27ae60] mb-1">{formatNumber(dashboardData.totalHoaHong)}</div>
                  <div className="text-[11px] text-[#7f8c8d] uppercase font-semibold">Hoa hồng</div>
                </div>
              </div>

              <div className={styles.dashboardCard}>
                <div className={styles.dashboardCardHeader}>TỶ LỆ KH MỚI TRONG 12 THÁNG</div>
                <div className="p-4 h-[250px]">
                  <Line 
                    data={{
                      labels: dashboardData.monthLabels,
                      datasets: [{
                        label: 'Số KH mới',
                        data: dashboardData.monthlyNewLeads,
                        borderColor: '#e67e22',
                        backgroundColor: 'rgba(230, 126, 34, 0.1)',
                        borderWidth: 2.5,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointBackgroundColor: '#e67e22',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                      }]
                    }}
                    options={{ 
                        responsive: true, 
                        maintainAspectRatio: false, 
                        plugins: { legend: { display: false } },
                        scales: {
                            x: { grid: { display: false } },
                            y: { beginAtZero: true }
                        }
                    }}
                  />
                </div>
              </div>

              <div className={styles.dashboardCard}>
                <div className={styles.dashboardCardHeader}>KPI KHÁCH HÀNG</div>
                <div className="p-4 flex flex-col justify-around h-[250px]">
                  {[
                    { label: "KHTN mới:", data: dashboardData.khtnMoi },
                    { label: "Liên hệ:", data: dashboardData.khtnLienHe },
                    { label: "KHTN chuyển đổi:", data: dashboardData.khtnChuyenDoi },
                    { label: "KH mới mua:", data: dashboardData.khMoiMua },
                    { label: "KH cũ quay lại:", data: dashboardData.khCuQuayLai },
                  ].map((item, idx) => (
                    <div key={idx} className={styles.dashboardKpiRow}>
                      <span className={styles.dashboardKpiLabel}>{item.label}</span>
                      <span className={styles.dashboardKpiValue}>
                        <span className="text-[13px] text-[#999]">(</span>
                        <span className="text-[16px] font-extrabold text-[#e67e22]">{formatNumber(item.data.actual)}</span>
                        <span className="text-[13px] text-[#ccc] mx-0.5">/</span>
                        <span className="text-[16px] font-bold text-[#2c3e50]">{formatNumber(item.data.target)}</span>
                        <span className="text-[13px] text-[#999]">)</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.dashboardCard}>
                <div className={styles.dashboardCardHeader}>KPI HOẠT ĐỘNG</div>
                <div className="p-4 flex flex-col justify-around h-[250px]">
                  {[
                    { label: "Cuộc gọi:", data: dashboardData.cuocGoi },
                    { label: "Cuộc gặp:", data: dashboardData.cuocGap },
                    { label: "Email tương tác:", data: dashboardData.emailGuiKh },
                    { label: "Email báo giá:", data: dashboardData.emailBaoGia },
                    { label: "Cuộc gọi tổng đài:", data: dashboardData.cuocGoiTongDai },
                  ].map((item, idx) => (
                    <div key={idx} className={styles.dashboardKpiRow}>
                      <span className={styles.dashboardKpiLabel}>{item.label}</span>
                      <span className={styles.dashboardKpiValue}>
                        <span className="text-[13px] text-[#999]">(</span>
                        <span className="text-[16px] font-extrabold text-[#e67e22]">{formatNumber(item.data.actual)}</span>
                        <span className="text-[13px] text-[#ccc] mx-0.5">/</span>
                        <span className="text-[16px] font-bold text-[#2c3e50]">{formatNumber(item.data.target)}</span>
                        <span className="text-[13px] text-[#999]">)</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { 
                  title: "TỈ LỆ KHTN ĐANG LIÊN HỆ", 
                  val: dashboardData.khtnLienHe.actual, 
                  total: dashboardData.khtnMoi.target + dashboardData.khtnLienHe.target, 
                  color: "#e67e22", 
                  labels: ["KHTN đang liên hệ", "Tổng KHTN Mới và Đang liên hệ"], 
                  pct: dashboardData.tiLeLienHe 
                },
                { 
                  title: "TỈ LỆ KHTN ĐÃ CHUYỂN ĐỔI", 
                  val: dashboardData.khtnChuyenDoi.actual, 
                  total: dashboardData.khtnLienHe.target, 
                  color: "#3498db", 
                  labels: ["KHTN đã chuyển đổi", "KHTN đang liên hệ và chuyển đổi"], 
                  pct: dashboardData.tiLeChuyenDoi 
                },
                { 
                  title: "TỈ LỆ DOANH THU ĐẠT ĐƯỢC", 
                  val: dashboardData.totalDoanhSo, 
                  total: dashboardData.targetDoanhSo, 
                  color: "#95a5a6", 
                  labels: ["Doanh thu đã đạt", "Doanh thu chỉ tiêu"], 
                  pct: dashboardData.tiLeDoanhThu 
                }
              ].map((pie, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-[#e8ecf0] overflow-hidden text-center">
                  <div className={styles.dashboardCardHeader}>{pie.title}</div>
                  <div className="p-5">
                    <div className="h-[180px] w-full mb-3 relative flex justify-center">
                      <Doughnut 
                        data={{
                          datasets: [{
                            data: [pie.pct, Math.max(0, 100 - pie.pct)],
                            backgroundColor: [pie.color, '#e8ecf0'],
                            borderWidth: 0,
                            hoverOffset: 4
                          }]
                        }}
                        options={{ 
                            responsive: true,
                            maintainAspectRatio: true,
                            cutout: '65%', 
                            plugins: { 
                                legend: { display: false },
                                centerText: { text: pie.pct.toFixed(2) + '%' }
                            } 
                        } as any}
                        plugins={[centerTextPlugin]}
                      />
                    </div>
                    <div className="text-[16px] font-extrabold text-[#2c3e50] mt-2">
                      {formatNumber(pie.val)} / {formatNumber(pie.total)}
                    </div>
                    <div className="flex flex-col items-center gap-1 mt-3 text-[11px] text-[#666]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: pie.color }}></span>
                        {pie.labels[0]}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#ddd]"></span>
                        {pie.labels[1]}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
