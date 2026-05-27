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
import ConfirmDeleteModal from '@/shared/components/ConfirmDeleteModal/ConfirmDeleteModal';

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
  const [inputPage, setInputPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

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
      setInputPage(dataResponse.pageNumber + 1);

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

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      setLoadingDelete(true);
      await kpiConfigApi.delete(deleteId);
      toast.success('Xóa thành công!');
      setDeleteId(null);
      fetchData(searchKeyword, currentPage, pageSize);
    } catch (error) {
      toast.error('Lỗi khi xóa cấu hình.');
    } finally {
      setLoadingDelete(false);
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
      <h2 className={styles.title}>Quản lý cấu hình KPI</h2>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label>Tìm kiếm</label>
          <div className={styles.searchContainerV2}>
            <Search size={15} className={styles.searchIcon} style={{ color: '#8a99b3', marginRight: 8 }} />
            <input
              type="text"
              placeholder="Tìm kiếm cấu hình..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className={styles.searchInputV2}
            />
            {searchKeyword && (
              <button onClick={() => setSearchKeyword('')} className={styles.clearSearchBtn}>×</button>
            )}
          </div>
        </div>

        <div className={styles.filterActions}>
          <button
            onClick={() => router.push('/kpi-configs/create')}
            className={styles.addButton}
          >
            <Plus size={18} />
            Thêm mới
          </button>
        </div>
      </div>

      <div style={{
        background: '#fff',
        overflow: 'hidden',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        borderBottom: '1px solid #e0e4ea',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.kpiTable} style={{ fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, borderTopLeftRadius: '10px' }}>ID</th>
                <th style={{ ...thStyle, minWidth: 160, textAlign: 'left' }}>Tên cấu hình</th>
                <th style={{ ...thStyle, minWidth: 130 }}>Thời gian</th>
                <th style={{ ...thStyle, minWidth: 280, textAlign: 'left' }}>Mục tiêu KPI</th>
                <th style={{ ...thStyle, minWidth: 160 }}>Đối tượng</th>
                <th style={thStyle}>Trạng thái</th>
                <th style={{ ...thStyle, minWidth: 100, borderTopRightRadius: '10px', borderRight: 'none' }}>Thao tác</th>
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
                          onClick={() => config.id && setDeleteId(config.id)}
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
      </div>

        {totalPages > 0 && (
          <div className={styles.pagination}>
            <span className={styles.userNum}>
              Total: {totalElements} configs
            </span>
            {/* First page */}
            <button
              disabled={currentPage === 0}
              onClick={() => handlePageChange(0)}
            >
              <ChevronsLeft size={18} color="white" />
            </button>

            {/* Prev */}
            <button
              disabled={currentPage === 0}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <ChevronLeft size={18} color="white" />
            </button>

            {/* Info */}
            <span>
              Trang {currentPage + 1} / {totalPages}
            </span>

            {/* Input jump */}
            <div className={styles.pageInput}>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={inputPage}
                onChange={(e) => {
                  const value = e.target.value;
                  setInputPage(value === "" ? 1 : Number(value));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    let target = Number(inputPage);
                    if (!isNaN(target)) {
                      if (target < 1) target = 1;
                      if (target > totalPages) target = totalPages;
                      handlePageChange(target - 1);
                    }
                  }
                }}
              />
            </div>
            <button 
              onClick={() => {
                let target = Number(inputPage);
                if (!isNaN(target)) {
                  if (target < 1) target = 1;
                  if (target > totalPages) target = totalPages;
                  handlePageChange(target - 1);
                }
              }}
              style={{ color: 'white' }}
            >
              Đi
            </button>

            {/* Next */}
            <button
              disabled={currentPage === totalPages - 1}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <ChevronRight size={18} color="white" />
            </button>

            {/* Last page */}
            <button
              disabled={currentPage === totalPages - 1}
              onClick={() => handlePageChange(totalPages - 1)}
            >
              <ChevronsRight size={18} color="white" />
            </button>
          </div>
        )}
      <ConfirmDeleteModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        loading={loadingDelete}
      />
    </div>
  );
};

const thStyle: React.CSSProperties = {
  color: '#fff',
  background: 'linear-gradient(to bottom right, #2563eb, #1d4ed8)',
  padding: '10px 8px',
  textAlign: 'center',
  fontWeight: 700,
  fontSize: 12,
  borderRight: '1px solid rgba(255, 255, 255, 0.3)',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  verticalAlign: 'middle',
  borderRight: '1px solid #e8ecf0',
  color: '#2c3e50',
};

export default KpiConfigListPage;
