// app/modules/kpi-config/KpiConfigListPage.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Edit, Trash2, Plus, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Clock } from 'lucide-react';
import { MetricLabels, KpiConfig } from './types/kpi-config.type';
import { kpiConfigApi } from './api/kpi-config.api';
import { organizationApi } from '../system/organization/api/organization.api';
import { userApi } from '../system/user/api/user.api';
import styles from './styles/kpi-config.module.css';

const KpiConfigListPage: React.FC = () => {
  const router = useRouter();
  const [configs, setConfigs] = useState<KpiConfig[]>([]);
  const [orgMap, setOrgMap] = useState<Record<number, string>>({});
  const [userMap, setUserMap] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [jumpPage, setJumpPage] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const fetchData = async (keyword?: string, page: number = 0, size: number = 10) => {
    try {
      const [dataResponse, orgs, usersData] = await Promise.all([
        kpiConfigApi.findAll(keyword, page, size),
        organizationApi.getAll().catch(() => []),
        userApi.getUsers().catch(() => [])
      ]);
      setConfigs(dataResponse.content);
      setTotalPages(dataResponse.totalPages);
      setTotalElements(dataResponse.totalElements);
      setCurrentPage(dataResponse.pageNumber);

      const oMap: Record<number, string> = {};
      orgs.forEach(o => oMap[o.id] = o.name);
      setOrgMap(oMap);

      const uMap: Record<number, string> = {};
      usersData.forEach(u => {
        uMap[u.id] = u.fullName || u.username || `NV #${u.id}`;
      });
      setUserMap(uMap);
    } catch (error) {
      console.error('Error fetching KPI configs:', error);
      toast.error('Không thể tải dữ liệu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoading && searchKeyword === '') {
      fetchData(searchKeyword, 0, pageSize);
      return;
    }
    const handler = setTimeout(() => {
      fetchData(searchKeyword, 0, pageSize);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchKeyword]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchData(searchKeyword, newPage, pageSize);
      setJumpPage('');
    }
  };

  const handleJumpPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const pageNum = parseInt(jumpPage, 10);
      if (!isNaN(pageNum) && pageNum > 0 && pageNum <= totalPages) {
        handlePageChange(pageNum - 1);
      } else {
        toast.warn(`Vui lòng nhập trang từ 1 đến ${totalPages}`);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa cấu hình KPI này?')) {
      try {
        await kpiConfigApi.delete(id);
        toast.success('Xóa thành công!');
        fetchData(searchKeyword, currentPage, pageSize);
      } catch (error) {
        toast.error('Lỗi khi xóa cấu hình.');
      }
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const renderAssignments = (assignments?: typeof configs[0]['assignments']) => {
    if (!assignments || assignments.length === 0) {
      return <span style={{ color: '#999', fontStyle: 'italic', fontSize: 12 }}>Chưa chỉ định</span>;
    }
    return assignments.map((a, idx) => {
      const orgName = a.organizationId ? (orgMap[a.organizationId] || `Phòng ban #${a.organizationId}`) : '';
      const userName = a.userId ? (userMap[a.userId] || `NV #${a.userId}`) : '';
      if (a.userId) return <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#2563eb', fontWeight: 600 }}>👤 {userName}</div>;
      return <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#16a34a', fontWeight: 600 }}>🏢 {orgName}</div>;
    });
  };

  const renderTargets = (targets: typeof configs[0]['targets'] | undefined, configId: number) => {
    if (!targets || targets.length === 0) return <span style={{ color: '#999', fontStyle: 'italic', fontSize: 12 }}>—</span>;
    const activeTargets = targets.filter(t => t.targetValue > 0);
    if (activeTargets.length === 0) return <span style={{ color: '#999', fontStyle: 'italic', fontSize: 12 }}>—</span>;

    const isExpanded = expandedRows.has(configId);
    const toggleExpand = () => {
      setExpandedRows(prev => {
        const next = new Set(prev);
        if (next.has(configId)) next.delete(configId);
        else next.add(configId);
        return next;
      });
    };

    if (!isExpanded) {
      return (
        <button
          onClick={toggleExpand}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'rgba(230, 126, 34, 0.1)', border: '1px solid rgba(230, 126, 34, 0.3)',
            borderRadius: 6, padding: '5px 12px', cursor: 'pointer',
            fontSize: 12, color: '#e67e22', fontWeight: 700,
            transition: 'all 0.15s',
          }}
        >
          📊 {activeTargets.length} chỉ tiêu
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 9l-7 7-7-7"/></svg>
        </button>
      );
    }

    return (
      <div style={{ minWidth: '240px' }}>
        <button
          onClick={toggleExpand}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: '#e67e22', border: 'none',
            borderRadius: 6, padding: '5px 12px', cursor: 'pointer',
            fontSize: 12, color: '#fff', fontWeight: 700,
            marginBottom: 8, transition: 'all 0.15s',
            boxShadow: '0 2px 8px rgba(230,126,34,0.3)'
          }}
        >
          📊 {activeTargets.length} chỉ tiêu
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 15l7-7 7 7"/></svg>
        </button>
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#34495e' }}>
                <th style={{ color: '#fff', padding: '8px 10px', textAlign: 'left', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>Chỉ tiêu KPI</th>
                <th style={{ color: '#fff', padding: '8px 10px', textAlign: 'center', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Mục tiêu</th>
              </tr>
            </thead>
            <tbody>
              {activeTargets.map((t, index) => {
                const label = (MetricLabels as Record<string, string>)[t.metricType] ?? t.metricType;
                const formattedValue = new Intl.NumberFormat('vi-VN').format(t.targetValue);
                return (
                  <tr key={t.id} style={{ background: index % 2 === 0 ? '#fff' : '#f8f9fa', borderBottom: index < activeTargets.length - 1 ? '1px solid #e8ecf0' : 'none' }}>
                    <td style={{ padding: '8px 10px', fontSize: '13px', color: '#555', fontWeight: 500, borderRight: '1px solid #e8ecf0' }}>{label}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', fontSize: '16px', fontWeight: 'bold', color: '#2c3e50' }}>{formattedValue}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className={styles.kpiPageContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, color: '#888' }}>Đang tải danh sách...</div>;
  }

  return (
    <div className={styles.kpiPageContainer} style={{ background: '#f0f2f5', minHeight: '100vh', paddingBottom: 40, fontFamily: "'Manrope', sans-serif" }}>
      <div style={{
        background: '#2c3e50',
        padding: '18px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '3px solid #e67e22',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Clock size={22} color="#e67e22" strokeWidth={2.5} />
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 16, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Quản lý cấu hình KPI
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className={styles.searchContainer}>
            <Search size={15} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className={styles.searchInput}
              style={{ color: '#fff' }}
            />
            {searchKeyword && (
              <button onClick={() => setSearchKeyword('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 16 }}>×</button>
            )}
          </div>

          <button
            onClick={() => router.push('/kpi-configs/create')}
            className={`${styles.btn} ${styles.btnPrimary}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#e67e22', color: '#fff', border: 'none',
              padding: '9px 18px', borderRadius: 8, fontWeight: 700,
              fontSize: 13, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(230,126,34,0.4)',
              transition: 'all 0.15s',
            }}
          >
            <Plus size={16} /> Thêm mới
          </button>
        </div>
      </div>

      <div style={{
        background: '#fff',
        overflow: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        borderBottom: '1px solid #e0e4ea',
      }}>
          <table className={styles.kpiTable} style={{ fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#34495e' }}>
                <th style={thStyle}>ID</th>
                <th style={{ ...thStyle, minWidth: 160, textAlign: 'left' }}>Tên cấu hình</th>
                <th style={{ ...thStyle, minWidth: 130 }}>Thời gian</th>
                <th style={{ ...thStyle, minWidth: 280, textAlign: 'left' }}>Mục tiêu KPI</th>
                <th style={{ ...thStyle, minWidth: 160 }}>Đối tượng</th>
                <th style={thStyle}>Trạng thái</th>
                <th style={{ ...thStyle, minWidth: 100 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {configs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: '#aaa', fontSize: 14 }}>
                    {searchKeyword ? `Không tìm thấy kết quả cho "${searchKeyword}"` : 'Chưa có cấu hình KPI nào.'}
                  </td>
                </tr>
              ) : (
                configs.map((config, idx) => (
                  <tr key={config.id} style={{
                    background: idx % 2 === 0 ? '#fff' : '#fafbfc',
                    borderBottom: '1px solid #eef0f4',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f4ff')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#fafbfc')}
                  >
                    <td style={{ ...tdStyle, color: '#999', fontWeight: 700, fontSize: 11, textAlign: 'center' }}>{config.id}</td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 700, color: '#2c3e50', fontSize: 13, marginBottom: 2 }}>{config.name}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>Tạo: {formatDate(config.createdAt)}</div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.5 }}>
                        {formatDate(config.startDate)}<br/>
                        <span style={{ color: '#ccc' }}>↓</span><br/>
                        {formatDate(config.endDate)}
                      </div>
                    </td>
                    <td style={tdStyle}>{renderTargets(config.targets, config.id!)}</td>
                    <td style={{ ...tdStyle, textAlign: 'center', fontSize: 12 }}>{renderAssignments(config.assignments)}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      {config.status === 'ACTIVE' ? (
                        <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', marginRight: 5 }}></span>
                          Hoạt động
                        </span>
                      ) : (
                        <span className={`${styles.statusBadge} ${styles.statusInactive}`}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block', marginRight: 5 }}></span>
                          Ngừng
                        </span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div className={styles.actionBtns}>
                        <button
                          title="Sửa"
                          onClick={() => router.push(`/kpi-configs/${config.id}`)}
                          className={`${styles.btnIcon} ${styles.edit}`}
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          title="Xóa"
                          onClick={() => config.id && handleDelete(config.id)}
                          className={`${styles.btnIcon} ${styles.delete}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 0 && (
          <div className={styles.paginationWrap}>
            <div className={styles.paginationInfo}>
              Hiển thị <strong style={{ color: '#334155' }}>{configs.length}</strong> / <strong style={{ color: '#334155' }}>{totalElements}</strong> cấu hình
            </div>
            <div className={styles.paginationControls}>
              <button className={styles.pageBtn} disabled={currentPage === 0} onClick={() => handlePageChange(0)} title="Trang đầu">
                <ChevronsLeft size={16} />
              </button>
              <button className={styles.pageBtn} disabled={currentPage === 0} onClick={() => handlePageChange(currentPage - 1)} title="Trang trước">
                <ChevronLeft size={16} />
              </button>
              {(() => {
                const maxVisible = 5;
                let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
                let end = Math.min(totalPages - 1, start + maxVisible - 1);
                if (end - start + 1 < maxVisible) start = Math.max(0, end - maxVisible + 1);
                const pages = [];
                for (let i = start; i <= end; i++) pages.push(i);
                return pages.map(idx => (
                  <button key={idx} className={`${styles.pageBtn} ${currentPage === idx ? styles.active : ''}`} onClick={() => handlePageChange(idx)}>
                    {idx + 1}
                  </button>
                ));
              })()}
              <button className={styles.pageBtn} disabled={currentPage === totalPages - 1} onClick={() => handlePageChange(currentPage + 1)} title="Trang sau">
                <ChevronRight size={16} />
              </button>
              <button className={styles.pageBtn} disabled={currentPage === totalPages - 1} onClick={() => handlePageChange(totalPages - 1)} title="Trang cuối">
                <ChevronsRight size={16} />
              </button>
              <div className={styles.paginationJump}>
                <span>Trang:</span>
                <input type="text" className={styles.jumpInput} value={jumpPage} onChange={(e) => setJumpPage(e.target.value.replace(/\D/g, ''))} onKeyDown={handleJumpPage} placeholder="..." />
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

const thStyle: React.CSSProperties = {
  color: '#fff',
  padding: '10px 8px',
  textAlign: 'center',
  fontWeight: 700,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.3px',
  borderRight: '1px solid rgba(255,255,255,0.1)',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  verticalAlign: 'middle',
  borderRight: '1px solid #e8ecf0',
  color: '#2c3e50',
};

export default KpiConfigListPage;
