"use client";
import httpClient from '@/core/http/httpClient';
import React, { useState, useEffect } from 'react';
import { useActivity } from './hooks/useActivity';
import Link from 'next/link';
import { activityApi } from './api/activity.api';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { toast } from 'react-toastify';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import ConfirmDeleteModal from '@/shared/components/ConfirmDeleteModal/ConfirmDeleteModal';


const getActivityTypeLabel = (type: string | number) => {
    const typeStr = String(type);
    switch (typeStr) {
        case '1': case 'CALL': return 'Cuộc gọi với khách';
        case '2': case 'MEETING': return 'Cuộc gặp';
        case '3': case 'EMAIL': return 'Email chung';
        case '4': case 'EMAIL_QUOTE': return 'Email Báo giá';
        case '5': case 'EMAIL_TRANS': return 'Email Giao dịch';
        default: return typeStr;
    }
};

const renderRelatedToBadge = (type: string, name: string, id: number) => {
    if (!type && !name && !id) return <span className="text-muted fst-italic small">---</span>;

    const safeType = (type || '').toUpperCase();
    const displayName = name || (id ? `${safeType} #${id}` : '---');

    const badgeClass = "badge border px-2 py-1 d-inline-block text-truncate";
    const badgeStyle = { maxWidth: '140px', verticalAlign: 'bottom' };

    switch (safeType) {
        case 'CUSTOMER':
            return (
                <span className={`${badgeClass} bg-info-subtle text-info border-info-subtle`} style={badgeStyle} title={displayName}>
                    <i className="fa-solid fa-building me-1"></i> {displayName}
                </span>
            );
        case 'LEAD':
            return (
                <span className={`${badgeClass} bg-warning-subtle text-warning border-warning-subtle`} style={badgeStyle} title={displayName}>
                    <i className="fa-solid fa-filter me-1"></i> {displayName}
                </span>
            );
        case 'DEAL':
        case 'OPPORTUNITY':
            return (
                <span className={`${badgeClass} bg-success-subtle text-success border-success-subtle`} style={badgeStyle} title={displayName}>
                    <i className="fa-solid fa-handshake me-1"></i> {displayName}
                </span>
            );
        default:
            return (
                <span className={`${badgeClass} bg-light text-secondary border-light`} style={badgeStyle} title={displayName}>
                    <i className="fa-solid fa-link me-1"></i> {displayName}
                </span>
            );
    }
};

const ActivityPage = () => {
    const { activities, isLoading, setFilters, error, refetch } = useActivity();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [sortConfig, setSortConfig] = useState({ key: 'startDate', direction: 'desc' });
    const [isManager, setIsManager] = useState(false);


    const [localFilters, setLocalFilters] = useState({
        search: '',
        status: '',
        activityType: '',
        performedBy: '',
        relatedToId: '',
        relatedToType: '',
        fromDate: '',
        toDate: ''
        , page: '0'
    });


    // State để lưu danh sách nhân viên lấy từ API
    const [users, setUsers] = useState<any[]>([]);
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await httpClient.get('/api/users/lookup');
                const data = response.data;
                const usersList = Array.isArray(data) ? data : (data?.content || []);
                setUsers(usersList);
            } catch (error) {
                console.error('Lỗi khi tải danh sách nhân viên:', error);
            }
        };

        fetchUsers();
    }, []);


    useEffect(() => {
        const rolesStorage = localStorage.getItem('roles');
        if (rolesStorage) {
            try {
                const roles = JSON.parse(rolesStorage);
                if (roles.includes('MANAGER')) {
                    setIsManager(true);
                }
            } catch (e) {
                console.error("Lỗi đọc phân quyền", e);
            }
        }
    }, []);


    // Hàm xử lý khi gõ/chọn
    const handleInputChange = (e: any) => {
        const { name, value } = e.target;

        if (name === 'relatedToId') {
            setLocalFilters({
                ...localFilters,
                relatedToId: value,
                relatedToType: value !== '' ? 'CUSTOMER' : ''
            });
        } else {
            setLocalFilters({
                ...localFilters,
                [name]: value
            });
        }
    };

    // 3. Khi bấm nút Lọc
    const handleApplyFilter = () => {
        const params = new URLSearchParams();

        // Chỉ đẩy những ô nào có giá trị lên URL cho sạch
        Object.entries(localFilters).forEach(([key, value]) => {
            if (value !== '' && value !== null) {
                params.set(key, value.toString());
            }
        });
        params.set('page', '0');

        router.push(`${pathname}?${params.toString()}`);
    };

    // 4. Khi bấm nút Reset (Xoay vòng)
    const handleReset = () => {
        const emptyFilters = {
            search: '', status: '', activityType: '', performedBy: '',
            relatedToId: '', relatedToType: '', fromDate: '', toDate: '', page: '0'
        };
        setLocalFilters(emptyFilters);

        // Đưa URL về trạng thái nguyên bản (không còn dấu ?)
        router.push(pathname);
    };
    // Hàm chuyển trang
    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());

        // Đẩy lên URL -> useEffect sẽ tự bắt và gọi API mới
        router.push(`${pathname}?${params.toString()}`);
    };


    // State để quản lý danh sách các checkbox được chọn
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [openBulkDeleteModal, setOpenBulkDeleteModal] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    // Xử lý khi bấm nút "Chọn tất cả" trên Header
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allIds = activities.content?.map((act: any) => act.id) || [];
            setSelectedIds(allIds);
        } else {
            setSelectedIds([]);
        }
    };

    // Xử lý khi bấm vào từng checkbox của mỗi dòng
    const handleSelectRow = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleDeleteMultiple = () => {
        if (selectedIds.length === 0) return;
        setOpenBulkDeleteModal(true);
    };
    
    const confirmBulkDelete = async () => {
        setIsBulkDeleting(true);
        try {
            await activityApi.deleteActivities(selectedIds);

            toast.success(`Đã xóa thành công ${selectedIds.length} hoạt động!`);
            setSelectedIds([]);
            setOpenBulkDeleteModal(false);
            refetch();
        } catch (error) {
            toast.error("Hệ thống gặp lỗi khi xóa!");
        } finally {
            setIsBulkDeleting(false);
        }
    };


    useEffect(() => {
        const params = Object.fromEntries(searchParams.entries());

        setLocalFilters({
            search: params.search || '',
            status: params.status || '',
            activityType: params.activityType || '',
            performedBy: params.performedBy || '',
            relatedToId: params.relatedToId || '',
            relatedToType: params.relatedToType || '',
            fromDate: params.fromDate || '',
            toDate: params.toDate || '',
            page: params.page || '0'
        });

        setFilters(params);

    }, [searchParams]);

    const [jumpPage, setJumpPage] = useState('');

    useEffect(() => {
        setJumpPage((Number(localFilters.page) + 1).toString());
    }, [localFilters.page]);

    const handleJumpPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            let targetPage = parseInt(jumpPage, 10);
            const maxPage = activities.totalPages || 1;

            if (isNaN(targetPage) || targetPage < 1) {
                targetPage = 1;
            } else if (targetPage > maxPage) {
                targetPage = maxPage;
            }

            setJumpPage(targetPage.toString());

            handlePageChange(targetPage - 1);
        }
    };
    // Hàm chuyển đổi trạng thái nhanh 
    const handleStatusQuickFilter = (newStatus: string) => {
        setLocalFilters({ ...localFilters, status: newStatus });

        const params = new URLSearchParams(searchParams.toString());

        if (newStatus === '') {
            params.delete('status');
        } else {
            params.set('status', newStatus);
        }

        params.set('page', '0');
        router.push(`${pathname}?${params.toString()}`);
    };
    const handleSort = (key: string) => {
        let direction = 'asc';

        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }

        const newConfig = { key, direction };
        setSortConfig(newConfig);


    };


    if (isLoading) return <div className="p-4 text-center">Đang tải dữ liệu...</div>;
    if (error) return <div className="p-4 text-danger">Lỗi: {error}</div>;
    return (
        <div className="container-fluid px-0 min-vh-100">
            <div className="card shadow-sm border-0 rounded-3">
                <div className="card-body p-0">
                    {/* HEADER TITLE & QUẢN LÝ TRẠNG THÁI */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="w-100">
                            <h5
                                className="mb-0 fw-bold text-white w-100"
                                style={{
                                    backgroundColor: "rgb(21, 0, 211)",
                                    padding: "10px 20px", 
                                    borderRadius: "10px",
                                    textAlign: "left",
                                    fontSize: "larger"
                                }}
                            >
                                Tất cả hoạt động
                            </h5>
                        </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="d-flex align-items-center gap-2">
                            <Link
                                href="/activity/create"
                                className="flex items-center gap-1 px-3 py-2 bg-[rgb(0,164,22)] hover:bg-[rgb(5,190,30)] text-white font-bold rounded-lg text-decoration-none transition-colors w-fit text-base"
                            >
                                <i className="fa-solid fa-plus"></i>
                                Thêm mới
                            </Link>

                            {selectedIds.length > 0 && (
                                <button type="button" className="btn btn-danger btn-sm rounded-xl px-3 shadow-sm fw-medium fade-in" onClick={handleDeleteMultiple}>
                                    <i className="fa-solid fa-trash-can me-1"></i> Xóa ({selectedIds.length})
                                </button>
                            )}
                        </div>

                        <div className="d-flex align-items-center bg-light p-1 rounded-xl shadow-sm border" style={{ fontSize: '13px' }}>
                            <span className="text-muted fw-medium ms-3 me-2">
                                <i className="fa-solid fa-filter me-1"></i>Trạng thái:
                            </span>

                            <button
                                type="button"
                                onClick={() => handleStatusQuickFilter('')}
                                className={`btn btn-sm rounded-xl px-3 py-1 ${localFilters.status === '' ? 'btn-secondary fw-bold shadow-sm' : 'btn-light text-muted border-0'}`}
                            >
                                Tất cả
                            </button>

                            <button
                                type="button"
                                onClick={() => handleStatusQuickFilter('0')}
                                className={`btn btn-sm rounded-xl px-3 py-1 mx-1 ${localFilters.status === '0' ? 'btn-warning text-dark fw-bold shadow-sm' : 'btn-light text-muted border-0'}`}
                            >
                                <i className="fa-solid fa-spinner fa-spin me-1"></i>Chưa xong
                            </button>

                            <button
                                type="button"
                                onClick={() => handleStatusQuickFilter('1')}
                                className={`btn btn-sm rounded-xl px-3 py-1 ${localFilters.status === '1' ? 'btn-success fw-bold shadow-sm text-white' : 'btn-light text-muted border-0'}`}
                            >
                                <i className="fa-solid fa-check-double me-1"></i>Đã xong
                            </button>
                        </div>
                    </div>

                    <div className="d-flex flex-wrap align-items-end gap-2 mb-4 p-2 bg-light border rounded-3 shadow-sm">

                        {/* 1. Ô Tìm kiếm (Cấp quyền co giãn nhưng không được ép người khác) */}
                        <div className="flex-grow-1" style={{ minWidth: '150px' }}>
                            <label className="form-label small fw-semibold text-muted mb-1">Tìm kiếm</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Tên hoạt động..."
                                name="search"
                                value={localFilters.search}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* 2. Loại hoạt động (Khóa cứng width vừa đủ) */}
                        <div style={{ width: '140px' }}>
                            <label className="form-label small fw-semibold text-muted mb-1">Loại hoạt động</label>
                            <select name="activityType" className="form-select" id="floatingType" value={localFilters.activityType} onChange={handleInputChange}>
                                <option value="">- Tất cả -</option>
                                <option value="CALL">Cuộc gọi với khách</option>
                                <option value="MEETING">Cuộc gặp</option>
                                <optgroup label="Email">
                                    <option value="EMAIL_QUOTE">Email Báo giá</option>
                                    <option value="EMAIL_TRANS">Email Giao dịch</option>
                                </optgroup>
                            </select>
                        </div>

                        {/* 3. Người thực hiện (Khóa cứng 180px, tên dài sẽ tự có dấu ...) */}
                        <div style={{ width: '180px' }}>
                            <label className="form-label small fw-semibold text-muted mb-1">Người thực hiện</label>
                            {(() => {
                                const userOptions = users.map(user => ({
                                    value: String(user.id),
                                    label: `${user.fullName || user.username} (${user.email || 'No email'})`
                                }));

                                const currentSelected = userOptions.find(opt => opt.value === String(localFilters.performedBy)) || null;

                                return (
                                    <Select
                                        options={userOptions}
                                        value={currentSelected}
                                        onChange={(selectedOption) => {
                                            setLocalFilters({
                                                ...localFilters,
                                                performedBy: selectedOption ? selectedOption.value : ""
                                            });
                                        }}
                                        placeholder="-- Tất cả nhân sự --"
                                        isClearable={true}
                                        noOptionsMessage={() => "❌ Không tìm thấy nhân sự"}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        styles={{
                                            control: (baseStyles, state) => ({
                                                ...baseStyles,
                                                borderColor: state.isFocused ? '#86b7fe' : '#dee2e6',
                                                boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)' : 'none',
                                                '&:hover': { borderColor: '#86b7fe' },
                                                borderRadius: '0.375rem',
                                                fontSize: '14px',
                                                height: '38px',
                                                minHeight: '38px',
                                                cursor: 'pointer'
                                            }),
                                            valueContainer: (base) => ({ ...base, padding: '0 8px' }),
                                            indicatorsContainer: (base) => ({ ...base, height: '36px' })
                                        }}
                                    />
                                );
                            })()}
                        </div>

                        {/* 4. Từ ngày (Khóa cứng 130px, vừa vặn chữ dd/mm/yyyy) */}
                        <div style={{ width: '130px' }}>
                            <label className="form-label small fw-semibold text-muted mb-1">Từ ngày</label>
                            <DatePicker
                                selected={localFilters.fromDate ? new Date(localFilters.fromDate) : null}
                                onChange={(date: Date | null) => {
                                    if (date) {
                                        const yyyy = date.getFullYear();
                                        const mm = String(date.getMonth() + 1).padStart(2, '0');
                                        const dd = String(date.getDate()).padStart(2, '0');
                                        setLocalFilters({ ...localFilters, fromDate: `${yyyy}-${mm}-${dd}` });
                                    } else {
                                        setLocalFilters({ ...localFilters, fromDate: "" });
                                    }
                                }}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="dd/mm/yyyy"
                                className="form-control cursor-pointer w-100"
                                wrapperClassName="w-100"
                            />
                        </div>

                        {/* 5. Đến ngày (Khóa cứng 130px) */}
                        <div style={{ width: '130px' }}>
                            <label className="form-label small fw-semibold text-muted mb-1">Đến ngày</label>
                            <DatePicker
                                selected={localFilters.toDate ? new Date(localFilters.toDate) : null}
                                onChange={(date: Date | null) => {
                                    if (date) {
                                        const yyyy = date.getFullYear();
                                        const mm = String(date.getMonth() + 1).padStart(2, '0');
                                        const dd = String(date.getDate()).padStart(2, '0');
                                        setLocalFilters({ ...localFilters, toDate: `${yyyy}-${mm}-${dd}` });
                                    } else {
                                        setLocalFilters({ ...localFilters, toDate: "" });
                                    }
                                }}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="dd/mm/yyyy"
                                minDate={localFilters.fromDate ? new Date(localFilters.fromDate) : undefined}
                                className="form-control cursor-pointer w-100"
                                wrapperClassName="w-100"
                            />
                        </div>

                        {/* 6. KHỐI NÚT BẤM (🚀 ĐÃ BỎ ms-auto để không bị ép rơi xuống dòng) */}
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-primary fw-medium text-nowrap d-flex align-items-center justify-content-center"
                                onClick={handleApplyFilter}
                                style={{ height: '38px' }}
                            >
                                <i className="fa-solid fa-filter me-1"></i> Lọc
                            </button>
                            <button
                                className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                                onClick={handleReset}
                                title="Xóa bộ lọc"
                                style={{ width: '38px', height: '38px' }}
                            >
                                <i className="fa-solid fa-rotate-right"></i>
                            </button>
                        </div>

                    </div>

                    {/* TABLE DATA (STYLE MỚI GIỐNG TASK) */}
                    <div className="table-responsive shadow-sm rounded-3 border border-light">
                        <table className="table table-hover table-bordered align-middle mb-0" style={{ fontSize: '14px' }}>
                            <thead
                                style={{
                                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                    fontSize: '13px',
                                    whiteSpace: 'nowrap',
                                    fontWeight: '700',
                                    color: '#fff',
                                    textAlign: 'left',
                                }}
                            >
                                <tr>
                                    <th className="fw-bold px-3 py-3 text-white" style={{ width: '4%', background: 'transparent', borderBottom: 'none' }}>
                                        <input className="form-check-input shadow-sm cursor-pointer m-0" type="checkbox" onChange={handleSelectAll} title="Chọn tất cả" />
                                    </th>
                                    <th className="fw-bold py-3 text-white" style={{ width: '18%', background: 'transparent', borderBottom: 'none' }}>Chủ đề</th>
                                    <th
                                        className="fw-bold py-3 text-white"
                                        style={{ width: '12%', cursor: 'pointer', userSelect: 'none', background: 'transparent', borderBottom: 'none' }}
                                        onClick={() => handleSort('startDate')}
                                    >
                                        <div className="d-flex align-items-center">
                                            Thời gian
                                            <span className="ms-2 d-flex flex-column" style={{ fontSize: '10px', lineHeight: '1' }}>
                                                <i className={`fa-solid fa-caret-up ${sortConfig.key === 'startDate' && sortConfig.direction === 'asc' ? 'text-warning' : 'text-white-50'}`}></i>
                                                <i className={`fa-solid fa-caret-down ${sortConfig.key === 'startDate' && sortConfig.direction === 'desc' ? 'text-warning' : 'text-white-50'}`}></i>
                                            </span>
                                        </div>
                                    </th>
                                    <th className="fw-bold py-3 text-center text-white" style={{ width: '10%', background: 'transparent', borderBottom: 'none' }}>Trạng thái</th>
                                    <th className="fw-bold py-3 text-center text-white" style={{ width: '7%', background: 'transparent', borderBottom: 'none' }}>Quan trọng</th>
                                    <th className="fw-bold py-3 text-white" style={{ width: '16%', background: 'transparent', borderBottom: 'none' }}>Nội dung</th>

                                    <th className="fw-bold py-3 text-white" style={{ width: '15%', background: 'transparent', borderBottom: 'none' }}>Liên quan đến</th>

                                    <th className="fw-bold py-3 text-white" style={{ width: '12%', background: 'transparent', borderBottom: 'none' }}>Phụ trách</th>
                                    <th className="fw-bold text-center py-3 text-white" style={{ width: '6%', background: 'transparent', borderBottom: 'none' }}>Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!activities.content || activities.content.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="text-center text-muted py-5">
                                            <i className="fa-regular fa-folder-open fs-1 mb-3"></i>
                                            <p className="mb-0">Không có dữ liệu hoạt động nào.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    activities.content.map((act: any) => (
                                        <tr key={act.id} className="transition-all" style={{ cursor: 'pointer' }}>

                                            <td className="px-3 align-middle" onClick={(e) => e.stopPropagation()}>
                                                <div className="d-flex align-items-center gap-2" style={{ minWidth: '75px' }}>
                                                    <input
                                                        className="form-check-input shadow-sm cursor-pointer m-0"
                                                        type="checkbox"
                                                        checked={selectedIds.includes(act.id)}
                                                        onChange={() => handleSelectRow(act.id)}
                                                    />

                                                    {act.status !== 'COMPLETED' && (
                                                        <Link href={`/activity/edit/${act.id}`} className="btn btn-sm btn-light border text-warning shadow-sm" title="Chỉnh sửa">
                                                            <i className="fa-solid fa-pen-to-square"></i>
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Cột 2: Chủ đề */}
                                            <td>
                                                <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '200px' }} title={act.subject}>
                                                    {act.subject}
                                                </div>
                                                <div className="text-muted small">ID: #{act.id}</div>
                                            </td>

                                            {/* Cột 3: Thời gian */}
                                            <td>
                                                <div className="small text-muted fw-medium">
                                                    <i className="fa-regular fa-calendar me-1"></i>
                                                    {new Date(act.startDate).toLocaleDateString('vi-VN')}
                                                </div>
                                                <div className="small text-muted">
                                                    <i className="fa-regular fa-clock me-1"></i>
                                                    {new Date(act.startDate).toLocaleTimeString('vi-VN', { timeStyle: 'short' })}
                                                </div>
                                            </td>

                                            {/* Cột 4: Trạng thái (Dùng Badge đẹp) */}
                                            <td className="text-center">
                                                {act.status === 'COMPLETED' ? (
                                                    <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                                                        <i className="fa-solid fa-check-double me-1"></i>Đã xong
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1">
                                                        <i className="fa-solid fa-spinner fa-spin me-1"></i>Chưa xong
                                                    </span>
                                                )}
                                            </td>

                                            {/* Cột 5: Quan trọng */}
                                            <td className="text-center">
                                                {act.important ? (
                                                    <span className="text-danger fs-5" title="Quan trọng"><i className="fa-solid fa-check circle"></i></span>
                                                ) : (
                                                    <span className="text-muted fs-5" title="Bình thường">
                                                        {/* <i className="fa-regular fa-circle"></i> */}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Cột 6: Nội dung */}
                                            <td>
                                                <div className="text-muted text-truncate" style={{ maxWidth: '180px', fontSize: '13px' }} title={act.description}>
                                                    {act.description || <span className="fst-italic">Không có nội dung</span>}
                                                </div>
                                            </td>

                                            <td className="align-middle">
                                                {renderRelatedToBadge(act.relatedToType, act.relatedToName, act.relatedToId)}
                                            </td>


                                            <td>
                                                <div className="fw-medium text-primary small mb-1">
                                                    <i className="fa-regular fa-circle-user me-1"></i> {act.performedBy?.name || 'Chưa gán'}
                                                </div>
                                            </td>
                                            {/* CỘT 8: Nút Xem Chi Tiết */}
                                            <td className="text-center align-middle" onClick={(e) => e.stopPropagation()}>
                                                {/* 🚀 Gọt nút thành hình tròn (rounded-circle) và ép kích thước 32x32 cho nhỏ nhắn */}
                                                <Link
                                                    href={`/activity/${act.id}`}
                                                    className="btn btn-sm btn-outline-info rounded-circle shadow-sm d-inline-flex align-items-center justify-content-center"
                                                    style={{ width: '32px', height: '32px' }}
                                                    title="Xem chi tiết"
                                                >
                                                    <i className="fa-solid fa-info"></i>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* THANH PHÂN TRANG */}
                    <div className="d-flex justify-content-between align-items-center mt-4 pb-5 w-100">

                        {/* Phần 1: Hiển thị tổng số lượng (Nằm bên TRÁI) */}
                        <div className="text-muted small fw-medium bg-white px-3 py-2 rounded shadow-sm border border-light">
                            Tổng số: <b className="text-dark">{activities.totalElements?.toLocaleString('vi-VN') || 0}</b> hoạt động
                        </div>

                        {/* Phần 2: Cụm điều hướng (Nằm bên PHẢI) */}
                        <div className="d-flex align-items-center gap-2 bg-white p-2 rounded shadow-sm border border-light">
                            {(() => {
                                // Ép kiểu cho chắc chắn vì ở trang Activity, localFilters.page đang lưu dưới dạng String
                                const currentPage = Number(localFilters.page) || 0;
                                const maxPages = activities.totalPages || 1;

                                return (
                                    <>
                                        {/* Nút Về trang đầu (<<) */}
                                        <button
                                            className={`btn btn-sm d-flex align-items-center justify-content-center ${currentPage === 0 ? 'btn-light text-muted opacity-50' : 'btn-primary text-white'} border-0 rounded`}
                                            style={{ width: '32px', height: '32px', padding: 0 }}
                                            onClick={() => handlePageChange(0)}
                                            disabled={currentPage === 0}
                                        >
                                            <ChevronsLeft size={18} />
                                        </button>

                                        {/* Nút Trang trước (<) */}
                                        <button
                                            className={`btn btn-sm d-flex align-items-center justify-content-center ${currentPage === 0 ? 'btn-light text-muted opacity-50' : 'btn-primary text-white'} border-0 rounded`}
                                            style={{ width: '32px', height: '32px', padding: 0 }}
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 0}
                                        >
                                            <ChevronLeft size={18} />
                                        </button>

                                        {/* Hiển thị số trang */}
                                        <span className="text-muted small fw-medium mx-2">
                                            Trang <span className="text-dark fw-bold">{currentPage + 1}</span> / {maxPages}
                                        </span>

                                        {/* Ô nhập số trang nhảy nhanh */}
                                        <input
                                            key={`jump-${currentPage}`}
                                            type="number"
                                            className="form-control form-control-sm text-center bg-light border-0 shadow-none fw-medium"
                                            style={{ width: '45px', height: '32px' }}
                                            min="1"
                                            max={maxPages}
                                            defaultValue={currentPage + 1}
                                            id="jumpPageInputActivity"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const targetPage = parseInt((e.target as HTMLInputElement).value) - 1;
                                                    if (targetPage >= 0 && targetPage < maxPages) {
                                                        handlePageChange(targetPage);
                                                    }
                                                }
                                            }}
                                        />

                                        {/* Nút ĐI */}
                                        <button
                                            className="btn btn-sm btn-primary text-white border-0 fw-medium rounded ms-1"
                                            style={{ height: '32px', padding: '0 12px' }}
                                            onClick={() => {
                                                const inputEl = document.getElementById('jumpPageInputActivity') as HTMLInputElement;
                                                if (inputEl) {
                                                    const targetPage = parseInt(inputEl.value) - 1;
                                                    if (targetPage >= 0 && targetPage < maxPages) {
                                                        handlePageChange(targetPage);
                                                    }
                                                }
                                            }}
                                        >
                                            Đi
                                        </button>

                                        {/* Nút Trang kế tiếp (>) */}
                                        <button
                                            className={`btn btn-sm d-flex align-items-center justify-content-center ms-1 ${currentPage >= (maxPages - 1) ? 'btn-light text-muted opacity-50' : 'btn-primary text-white'} border-0 rounded`}
                                            style={{ width: '32px', height: '32px', padding: 0 }}
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage >= (maxPages - 1)}
                                        >
                                            <ChevronRight size={18} />
                                        </button>

                                        {/* Nút Đến trang cuối (>>) */}
                                        <button
                                            className={`btn btn-sm d-flex align-items-center justify-content-center ${currentPage >= (maxPages - 1) ? 'btn-light text-muted opacity-50' : 'btn-primary text-white'} border-0 rounded`}
                                            style={{ width: '32px', height: '32px', padding: 0 }}
                                            onClick={() => handlePageChange(maxPages > 0 ? maxPages - 1 : 0)}
                                            disabled={currentPage >= (maxPages - 1)}
                                        >
                                            <ChevronsRight size={18} />
                                        </button>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmDeleteModal
                open={openBulkDeleteModal}
                onClose={() => setOpenBulkDeleteModal(false)}
                onConfirm={confirmBulkDelete}
                loading={isBulkDeleting}
                title="Xóa hàng loạt"
                message={`Bạn có chắc chắn muốn xóa ${selectedIds.length} hoạt động đã chọn không?`}
                confirmLabel="Đồng ý xóa"
                cancelLabel="Hủy bỏ"
            />
        </div>
    );
};

export default ActivityPage;