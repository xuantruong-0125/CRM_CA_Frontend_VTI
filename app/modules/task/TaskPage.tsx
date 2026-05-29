"use client";
import CreateTaskModal from './components/CreateTaskModal';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
// import axios from 'axios';

import { useRouter, useParams, useSearchParams } from 'next/navigation';

import httpClient from '@/core/http/httpClient';

// import { useTask } from './hooks/useTask';

interface ITaskFilter {
    page: number;
    size: number;
    subject?: string;
    status?: string;
    priority?: string;
    fromDate?: string;
    toDate?: string;
}

const renderRelatedToBadge = (type: string, name: string) => {
    if (!type || !name) return <span className="text-muted fst-italic small">---</span>;

    const safeType = type.toUpperCase();

    switch (safeType) {
        case 'CUSTOMER':
            return (
                <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1" title="Khách hàng">
                    <i className="fa-solid fa-building me-1"></i> {name}
                </span>
            );
        case 'LEAD':
            return (
                <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1" title="Khách hàng tiềm năng">
                    <i className="fa-solid fa-filter me-1"></i> {name}
                </span>
            );
        case 'DEAL':
        case 'OPPORTUNITY':
            return (
                <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1" title="Cơ hội kinh doanh">
                    <i className="fa-solid fa-handshake me-1"></i> {name}
                </span>
            );
        default:
            return (
                <span className="badge bg-light text-secondary border px-2 py-1">
                    <i className="fa-solid fa-link me-1"></i> {name}
                </span>
            );
    }
};

const TaskPage = () => {

    const [tasks, setTasks] = useState<any[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    // Lưu trữ danh sách ID các công việc đang được tích chọn
    const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);

    const [showCreateModal, setShowCreateModal] = useState(false);


    // State quản lý bộ lọc thời gian
    const [dateFilterType, setDateFilterType] = useState("ALL");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [filters, setFilters] = useState<ITaskFilter>({
        page: 0,
        size: 10,
        subject: '',
        status: '',
        priority: ''
    });

    // Thêm 1 state để báo hiệu "Trình duyệt đã load xong chưa?"
    const [isMounted, setIsMounted] = useState(false);
    const [isManager, setIsManager] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        // Giờ mới lấy data từ Session đắp vào
        const savedFilters = sessionStorage.getItem('taskFilters');
        if (savedFilters) {
            setFilters(JSON.parse(savedFilters));
        }
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


    useEffect(() => {
        sessionStorage.setItem('taskFilters', JSON.stringify(filters));
    }, [filters]);


    const fetchTasks = async () => {
        try {
            setIsLoading(true);
            const response = await httpClient.get('/api/v1/tasks', {
                params: {
                    subject: filters.subject || undefined,
                    status: filters.status || undefined,
                    priority: filters.priority || undefined,
                    fromDate: filters.fromDate ? filters.fromDate : undefined,
                    toDate: filters.toDate ? filters.toDate : undefined,
                    page: filters.page,
                    size: filters.size
                }
            });

            if (response.data && response.data.content) {
                setTasks(response.data.content);
                setTotalElements(response.data.totalElements);

                setTotalPages(response.data.totalPages);
            } else if (Array.isArray(response.data)) {
                setTasks(response.data);
                setTotalElements(response.data.length);
                setTotalPages(1);
            }
        } catch (err: any) {
            console.error("Lỗi fetch:", err);
            setError("Không thể tải danh sách công việc. Vui lòng kiểm tra lại server.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isMounted) {
            sessionStorage.setItem('taskFilters', JSON.stringify(filters));
            fetchTasks();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, isMounted]);

    // CÁC HÀM XỬ LÝ SỰ KIỆN (HANDLERS)
    const handleStatusChange = (newStatus: string) => {
        setFilters(prev => ({ ...prev, status: newStatus, page: 0 }));
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFilters(prev => ({ ...prev, subject: value, page: 0 }));
    };
    const handleApplyDateFilter = () => {
        const formatLocalDate = (date: Date | null) => {
            if (!date) return "";
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        let finalFromDate = "";
        let finalToDate = "";
        const now = new Date();

        if (dateFilterType === "OVERDUE") {
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            finalToDate = formatLocalDate(yesterday);

        } else if (dateFilterType === "TODAY") {
            finalFromDate = formatLocalDate(now);
            finalToDate = formatLocalDate(now);

        } else if (dateFilterType === "THIS_WEEK") {
            const day = now.getDay();
            const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);

            const monday = new Date(now);
            monday.setDate(diffToMonday);

            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);

            finalFromDate = formatLocalDate(monday);
            finalToDate = formatLocalDate(sunday);

        } else if (dateFilterType === "THIS_MONTH") {
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            finalFromDate = formatLocalDate(firstDay);
            finalToDate = formatLocalDate(lastDay);

        } else if (dateFilterType === "CUSTOM") {
            if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
                alert("Từ ngày không được lớn hơn Đến ngày!");
                return;
            }
            finalFromDate = fromDate;
            finalToDate = toDate;
        }


        setFilters(prev => ({
            ...prev,
            fromDate: finalFromDate || '',
            toDate: finalToDate || '',
            page: 0
        }));
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };


    //CÁC HÀM TIỆN ÍCH GIAO DIỆN (UI HELPERS)
    const getStatusBadge = (status: string) => {

        const safeStatus = status?.toUpperCase();
        switch (safeStatus) {
            case 'NOT_STARTED':
                return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1"><i className="fa-solid fa-pause me-1"></i>Chưa bắt đầu</span>;
            case 'IN_PROGRESS':
                return <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1"><i className="fa-solid fa-spinner fa-spin me-1"></i>Đang làm</span>;
            case 'DEFERRED':
                return <span className="badge bg-dark-subtle text-dark border border-dark-subtle px-2 py-1"><i className="fa-solid fa-circle-pause me-1"></i>Tạm hoãn</span>;
            case 'COMPLETED':
                return <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1"><i className="fa-solid fa-check-double me-1"></i>Hoàn thành</span>;
            case 'CANCELED':
                return <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1"><i className="fa-solid fa-ban me-1"></i>Đã hủy</span>;
            default:
                return <span className="badge bg-light text-dark border px-2 py-1">{status || 'Chưa rõ'}</span>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'HIGH': return <span className="text-danger fw-bold small"><i className="fa-solid fa-angles-up me-1"></i>Cao</span>;
            case 'NORMAL':
            case 'MEDIUM':
                return <span className="text-primary fw-bold small"><i className="fa-solid fa-angle-up me-1"></i>Bình thường</span>;
            case 'LOW': return <span className="text-muted fw-bold small"><i className="fa-solid fa-angle-down me-1"></i>Thấp</span>;
            case 'URGENT':
                return <span className="text-danger fw-bold small"><i className="fa-solid fa-triangle-exclamation fa-beat-fade me-1"></i>Khẩn cấp</span>;
            default: return <span className="text-secondary small">{priority}</span>;
        }
    };

    const getRelatedToBadge = (type: string, id: number | string) => {
        if (!type || !id) return null;

        const safeType = type.toUpperCase();
        switch (safeType) {
            case 'CUSTOMER':
                return <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1"><i className="fa-solid fa-building me-1"></i>Khách hàng #{id}</span>;
            case 'LEAD':
                return <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1"><i className="fa-solid fa-filter me-1"></i>Tiềm năng #{id}</span>;
            case 'DEAL':
            case 'OPPORTUNITY':
                return <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1"><i className="fa-solid fa-handshake me-1"></i>Cơ hội #{id}</span>;
            case 'TICKET':
                return <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1"><i className="fa-solid fa-ticket me-1"></i>Hỗ trợ #{id}</span>;
            default:
                return <span className="badge bg-light text-secondary border px-2 py-1"><i className="fa-solid fa-link me-1"></i>{type} #{id}</span>;
        }
    };

    const formatShortDate = (dateString: string | null) => {
        if (!dateString) return '---';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // 1. Hàm xử lý khi bấm vào Checkbox "Chọn tất cả" ở trên cùng
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            // Nếu tích vào thì lấy toàn bộ ID của các task hiện tại trên trang
            const allIds = tasks.map((task: any) => task.id);
            setSelectedTaskIds(allIds);
        } else {
            // Bỏ tích thì xóa sạch mảng
            setSelectedTaskIds([]);
        }
    };

    // 2. Hàm xử lý khi bấm vào từng Checkbox ở mỗi dòng
    const handleSelectOne = (taskId: number) => {
        setSelectedTaskIds((prev) => {
            // Nếu ID đã có trong mảng thì gỡ ra, nếu chưa có thì thêm vào
            if (prev.includes(taskId)) {
                return prev.filter((id) => id !== taskId);
            } else {
                return [...prev, taskId];
            }
        });
    };

    // 3. Hàm xử lý khi bấm nút "Xóa" màu đỏ
    const handleDeleteSelected = async () => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedTaskIds.length} công việc đã chọn không?`)) return;

        try {
            // Dùng Promise.all để gọi API xóa nhiều ID cùng lúc chạy song song
            await Promise.all(
                selectedTaskIds.map((id) => httpClient.delete(`/api/v1/tasks/${id}`))
            );

            alert("Đã xóa thành công!");

            // Cập nhật lại UI: Lọc bỏ những task đã xóa ra khỏi màn hình ngay lập tức
            setTasks((prevTasks: any[]) => prevTasks.filter((task) => !selectedTaskIds.includes(task.id)));

            // Trả mảng chọn về rỗng để ẩn nút Xóa
            setSelectedTaskIds([]);

        } catch (error) {
            console.error("Lỗi xóa nhiều task:", error);
            alert("Có lỗi xảy ra khi xóa. Vui lòng thử lại!");
        }
    };

    return (
        <div className="container-fluid px-0 min-vh-100">
            {/* <div className="mb-3">
                <h5 className="text-uppercase mb-0 fw-bold text-white px-4 py-2 rounded-xl  shadow-sm d-inline-block"
                    style={{ backgroundColor: 'rgb(21, 0, 211)', fontSize: '15px', letterSpacing: '0.5px' }}>
                    <i className="fa-solid fa-list-check me-2"></i>QUẢN LÝ CÔNG VIỆC
                </h5>
            </div> */}

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
                        Quản lý công việc
                    </h5>
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">

                <div className="d-flex align-items-center gap-2">
                    {isManager && (
                        <>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-1 px-3 py-2 bg-[rgb(0,164,22)] hover:bg-[rgb(5,190,30)] text-white font-bold !rounded-lg border-0 transition-colors"
                            >
                                <i className="fa-solid fa-plus"></i>
                                Giao việc mới
                            </button>

                            {selectedTaskIds.length > 0 && (
                                <button
                                    className="btn btn-danger btn-sm rounded-xl px-3 shadow-sm fw-medium slide-in"
                                    onClick={handleDeleteSelected}
                                >
                                    <i className="fa-solid fa-trash-can me-1"></i> Xóa ({selectedTaskIds.length})
                                </button>
                            )}
                        </>
                    )}
                </div>

                <div className="d-flex align-items-center bg-white p-1 rounded-xl border shadow-sm" style={{ fontSize: '13px' }}>
                    <span className="text-muted fw-medium mx-2">
                        <i className="fa-solid fa-filter me-1"></i>Trạng thái:
                    </span>

                    <button
                        type="button"
                        className={`btn btn-sm rounded-xl px-3 py-1 ${filters.status === '' ? 'btn-secondary fw-bold shadow-sm' : 'btn-light text-muted border-0'}`}
                        onClick={() => setFilters({ ...filters, status: '', page: 0 })}
                    >
                        Tất cả
                    </button>

                    <button
                        type="button"
                        className={`btn btn-sm rounded-xl px-3 py-1 mx-1 ${filters.status === 'NOT_STARTED' ? 'btn-secondary fw-bold shadow-sm' : 'btn-light text-muted border-0'}`}
                        onClick={() => setFilters({ ...filters, status: 'NOT_STARTED', page: 0 })}
                    >
                        Chưa bắt đầu
                    </button>

                    <button
                        type="button"
                        className={`btn btn-sm rounded-xl px-3 py-1 ${filters.status === 'IN_PROGRESS' ? 'btn-primary fw-bold shadow-sm text-white' : 'btn-light text-muted border-0'}`}
                        onClick={() => setFilters({ ...filters, status: 'IN_PROGRESS', page: 0 })}
                    >
                        Đang làm
                    </button>

                    <button
                        type="button"
                        className={`btn btn-sm rounded-xl px-3 py-1 mx-1 ${filters.status === 'DEFERRED' ? 'btn-dark fw-bold shadow-sm text-white' : 'btn-light text-muted border-0'}`}
                        onClick={() => setFilters({ ...filters, status: 'DEFERRED', page: 0 })}
                    >
                        Tạm hoãn
                    </button>

                    <button
                        type="button"
                        className={`btn btn-sm rounded-xl px-3 py-1 ${filters.status === 'COMPLETED' ? 'btn-success fw-bold shadow-sm text-white' : 'btn-light text-muted border-0'}`}
                        onClick={() => setFilters({ ...filters, status: 'COMPLETED', page: 0 })}
                    >
                        Đã xong
                    </button>

                    <button
                        type="button"
                        className={`btn btn-sm rounded-xl px-3 py-1 ms-1 ${filters.status === 'CANCELED' ? 'btn-danger fw-bold shadow-sm text-white' : 'btn-light text-muted border-0'}`}
                        onClick={() => setFilters({ ...filters, status: 'CANCELED', page: 0 })}
                    >
                        Đã hủy
                    </button>
                </div>
            </div>

            <div className="mb-4 p-3 bg-light border rounded-3 shadow-sm">
                <div className="d-flex flex-wrap align-items-end gap-3">

                    {/* 1. Ô Tìm kiếm */}
                    <div className="flex-grow-1" style={{ minWidth: '220px' }}>
                        <label className="form-label small fw-semibold text-muted mb-1 ps-1">Tìm kiếm</label>
                        <div className="input-group input-group-sm border bg-white rounded-3 overflow-hidden shadow-sm focus-within-ring">
                            <span className="input-group-text bg-white border-0 text-muted ps-3">
                                <i className="fa-solid fa-magnifying-glass"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control border-0 shadow-none bg-white"
                                value={filters.subject}
                                onChange={(e) => setFilters({ ...filters, subject: e.target.value, page: 0 })}
                                placeholder="Tìm theo chủ đề..."
                            />
                        </div>
                    </div>

                    {/* 2. Thời hạn công việc */}
                    <div style={{ minWidth: '180px' }}>
                        <label className="form-label small fw-semibold text-muted mb-1 ps-1">Thời hạn công việc</label>
                        <select
                            className="form-select form-select-sm border border-white bg-white rounded-3 shadow-sm cursor-pointer"
                            value={dateFilterType}
                            onChange={(e) => {
                                setDateFilterType(e.target.value);
                                if (e.target.value !== "CUSTOM") {
                                    setTimeout(() => handleApplyDateFilter(), 50);
                                }
                            }}
                        >
                            <option value="ALL">🗓️ Tất cả thời gian</option>
                            <option value="OVERDUE">🚨 Quá hạn thực hiện</option>
                            <option value="TODAY">⏳ Hôm nay</option>
                            <option value="THIS_WEEK">📅 Tuần này</option>
                            <option value="THIS_MONTH">📊 Tháng này</option>
                            <option value="CUSTOM">⚙️ Tùy chỉnh ngày...</option>
                        </select>
                    </div>

                    {/* 3. Tùy chỉnh khoảng ngày */}
                    {dateFilterType === "CUSTOM" && (
                        <div className="d-flex align-items-center gap-2 animate-fade-in" style={{ minWidth: '320px' }}>
                            <div className="flex-grow-1">
                                <label className="form-label small fw-semibold text-muted mb-1 ps-1">Từ ngày</label>
                                <input type="date" className="form-control form-control-sm border border-white bg-white rounded-3 shadow-sm" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                            </div>
                            <div className="flex-grow-1">
                                <label className="form-label small fw-semibold text-muted mb-1 ps-1">Đến ngày</label>
                                <input type="date" className="form-control form-control-sm border border-white bg-white rounded-3 shadow-sm" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                            </div>
                            <div className="align-self-end">
                                <button className="btn btn-sm btn-primary rounded-3 px-3 shadow-sm fw-medium" onClick={handleApplyDateFilter}>Lọc</button>
                            </div>
                        </div>
                    )}

                    {/* 4. Độ ưu tiên */}
                    <div style={{ minWidth: '140px' }}>
                        <label className="form-label small fw-semibold text-muted mb-1 ps-1">Độ ưu tiên</label>
                        <select
                            className="form-select form-select-sm border border-white bg-white rounded-3 shadow-sm cursor-pointer"
                            value={filters.priority}
                            onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 0 })}
                        >
                            <option value="">-- Tất cả --</option>
                            <option value="URGENT">🚨 Khẩn cấp</option>
                            <option value="HIGH">🔥 Cao</option>
                            <option value="NORMAL">⚡ Bình thường</option>
                            <option value="LOW">💤 Thấp</option>
                        </select>
                    </div>

                    {/* 5. Nút Làm mới */}
                    <div className="align-self-end ms-auto">
                        <button
                            type="button"
                            className="btn btn-sm btn-white bg-white text-secondary border rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                            style={{ width: '32px', height: '32px' }}
                            title="Làm mới bộ lọc"
                            onClick={() => {
                                setDateFilterType("ALL");
                                setFromDate("");
                                setToDate("");
                                setFilters({ subject: '', status: '', priority: '', page: 0, size: 10, fromDate: '', toDate: '' });
                            }}
                        >
                            <i className="fa-solid fa-rotate-right"></i>
                        </button>
                    </div>

                </div>
            </div>
            {
                error && (
                    <div className="alert alert-danger shadow-sm border-0 py-2 mb-4">
                        <i className="fa-solid fa-triangle-exclamation me-2"></i> {error}
                    </div>
                )
            }

            {/* 3. BẢNG DỮ LIỆU */}
            <div className="table-responsive shadow-sm rounded-3 bg-white border border-light">
                <table className="table table-hover table-bordered align-middle mb-0" style={{ fontSize: '14px' }}>
                    <thead style={{
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        fontSize: '15px',
                        whiteSpace: 'nowrap'
                    }}>
                        <tr>
                            <th className="fw-bold px-3 py-3 text-white" style={{ width: '4%', background: 'transparent', borderBottom: 'none' }} >
                                <div className="d-flex align-items-center gap-2">
                                    <input
                                        className="form-check-input shadow-sm cursor-pointer m-0"
                                        type="checkbox"
                                        title="Chọn tất cả"
                                        checked={tasks.length > 0 && selectedTaskIds.length === tasks.length}
                                        onChange={handleSelectAll}
                                    />
                                </div>
                            </th>
                            <th className="fw-bold py-3 text-white" style={{ width: '20%', background: 'transparent', borderBottom: 'none' }}>Chủ đề công việc</th>
                            <th className="fw-bold py-3 text-white" style={{ width: '14%', background: 'transparent', borderBottom: 'none' }}>Trạng thái & Tiến độ</th>
                            <th className="fw-bold py-3 text-white" style={{ width: '8%', background: 'transparent', borderBottom: 'none' }}>Ưu tiên</th>
                            <th className="fw-bold py-3 text-white" style={{ width: '15%', background: 'transparent', borderBottom: 'none' }}>Thời hạn</th>
                            <th className="fw-bold py-3 text-white" style={{ width: '11%', background: 'transparent', borderBottom: 'none' }}>Liên hệ</th>
                            <th className="fw-bold py-3 text-white" style={{ width: '12%', background: 'transparent', borderBottom: 'none' }}>Liên quan </th>
                            <th className="fw-bold py-3 text-white" style={{ width: '10%', background: 'transparent', borderBottom: 'none' }}>Phân công </th>
                            <th className="fw-bold text-center py-3 text-white" style={{ width: '6%', background: 'transparent', borderBottom: 'none' }}>Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!isLoading && tasks.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center text-muted py-5">
                                    <i className="fa-regular fa-folder-open fs-1 mb-3"></i>
                                    <p className="mb-0">Chưa có công việc nào. Hãy tạo mới!</p>
                                </td>
                            </tr>
                        ) : (
                            tasks.map((task) => (
                                <tr key={task.id} className="transition-all" style={{ cursor: 'pointer' }}>
                                    {/* CỘT 1: CHECKBOX & NÚT SỬA */}
                                    <td className="px-3" onClick={(e) => e.stopPropagation()}>
                                        <div className="d-flex align-items-center gap-2">
                                            <input
                                                className="form-check-input shadow-sm cursor-pointer m-0"
                                                type="checkbox"
                                                value={task.id}
                                                checked={selectedTaskIds.includes(task.id)}
                                                onChange={() => handleSelectOne(task.id)}
                                            />
                                            {task.status !== 'COMPLETED' && (
                                                <button className="btn btn-sm btn-light border text-warning shadow-sm" title="Chỉnh sửa nhanh"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/task/${task.id}?action=edit`);
                                                    }}>
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                            )}
                                        </div>
                                    </td>

                                    {/* CỘT 2: CHỦ ĐỀ */}
                                    <td>
                                        <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '200px' }} title={task.subject}>
                                            {task.subject}
                                        </div>
                                        <div className="text-muted small">
                                            ID: #{task.id}
                                        </div>
                                    </td>



                                    {/* CỘT 4: TRẠNG THÁI & TIẾN ĐỘ */}
                                    <td>
                                        <div className="mb-1">{getStatusBadge(task.status)}</div>
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="progress w-100" style={{ height: '6px' }}>
                                                <div className={`progress-bar ${task.progressPercent === 100 ? 'bg-success' : 'bg-primary'}`} role="progressbar" style={{ width: `${task.progressPercent}%` }}></div>
                                            </div>
                                            <span className="small text-muted fw-bold" style={{ fontSize: '11px' }}>{task.progressPercent || 0}%</span>
                                        </div>
                                    </td>

                                    {/* CỘT 5: ƯU TIÊN */}
                                    <td>{getPriorityBadge(task.priority)}</td>

                                    {/* CỘT 6: THỜI HẠN */}
                                    <td>
                                        <div className="small text-muted mb-1"><span className="text-success"><i className="fa-solid fa-play me-1"></i></span> {formatShortDate(task.startDate)}</div>
                                        <div className="small text-muted fw-medium"><span className="text-danger"><i className="fa-solid fa-flag-checkered me-1"></i></span> {formatShortDate(task.dueDate)}</div>
                                    </td>
                                    {/* CỘT 3: LIÊN HỆ (CONTACT) */}
                                    <td className="align-middle">
                                        {task.contactName ? (
                                            <div className="text-info fw-medium text-truncate" style={{ fontSize: '13px', maxWidth: '130px' }} title={task.contactName}>
                                                <i className="fa-regular fa-address-book me-1"></i> {task.contactName}
                                            </div>
                                        ) : task.contactId ? (
                                            <div className="text-info fw-medium" style={{ fontSize: '13px' }}>
                                                <i className="fa-regular fa-address-book me-1"></i> ID: {task.contactId}
                                            </div>
                                        ) : (
                                            <span className="text-muted fst-italic small">---</span>
                                        )}
                                    </td>

                                    {/* CỘT 4: LIÊN QUAN ĐẾN (RELATED TO) */}
                                    <td className="align-middle">
                                        {renderRelatedToBadge(task.relatedToType, task.relatedToName)}
                                    </td>

                                    {/* CỘT 7: PHÂN CÔNG */}
                                    <td>
                                        {task.assignee ? (
                                            <>
                                                <div className="fw-medium text-primary small">
                                                    <i className="fa-regular fa-circle-user me-1"></i> {task.assignee.name}
                                                </div>

                                            </>
                                        ) : (
                                            <span className="text-muted small fst-italic">Chưa phân công</span>
                                        )}
                                    </td>

                                    {/* CỘT CUỐI: XEM CHI TIẾT */}
                                    <td className="text-center align-middle">
                                        <button
                                            className="btn btn-sm btn-outline-info rounded-circle shadow-sm d-inline-flex align-items-center justify-content-center"
                                            style={{ width: '32px', height: '32px' }}
                                            title="Xem chi tiết công việc"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/task/${task.id}`);
                                            }}
                                        >
                                            <i className="fa-solid fa-info"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 5. PHÂN TRANG (PAGINATION) */}
            <div className="d-flex justify-content-between align-items-center mt-4 pb-5">

                {/* 💡 PHẦN 1: Hiển thị tổng số lượng (Nằm bên TRÁI, ngang mép trái của bảng) */}
                <div className="text-muted small fw-medium bg-white px-3 py-2 rounded shadow-sm border border-light">
                    Tổng số: <b className="text-dark">{totalElements}</b> công việc
                </div>

                {/* 💡 PHẦN 2: Cụm điều hướng phân trang (Nằm bên PHẢI, ngang mép phải của bảng) */}
                <div className="d-flex align-items-center gap-2 bg-white p-2 rounded shadow-sm border border-light">

                    {/* Nút Về trang đầu (<<) */}
                    <button
                        className={`btn btn-sm d-flex align-items-center justify-content-center ${filters.page === 0 ? 'btn-light text-muted opacity-50' : 'btn-primary text-white'} border-0 rounded`}
                        style={{ width: '32px', height: '32px', padding: 0 }}
                        onClick={() => setFilters({ ...filters, page: 0 })}
                        disabled={filters.page === 0}
                    >
                        <ChevronsLeft size={18} />
                    </button>

                    {/* Nút Trang trước (<) */}
                    <button
                        className={`btn btn-sm d-flex align-items-center justify-content-center ${filters.page === 0 ? 'btn-light text-muted opacity-50' : 'btn-primary text-white'} border-0 rounded`}
                        style={{ width: '32px', height: '32px', padding: 0 }}
                        onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                        disabled={filters.page === 0}
                    >
                        <ChevronLeft size={18} />
                    </button>

                    {/* Hiển thị số trang */}
                    <span className="text-muted small fw-medium mx-2">
                        Trang <span className="text-dark fw-bold">{filters.page + 1}</span> / {totalPages || 1}
                    </span>

                    {/* Ô nhập số trang nhảy nhanh */}
                    <input
                        key={filters.page}
                        type="number"
                        className="form-control form-control-sm text-center bg-light border-0 shadow-none fw-medium"
                        style={{ width: '45px', height: '32px' }}
                        min="1"
                        max={totalPages || 1}
                        defaultValue={filters.page + 1}
                        id="jumpPageInput"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const targetPage = parseInt((e.target as HTMLInputElement).value) - 1;
                                if (targetPage >= 0 && targetPage < (totalPages || 1)) {
                                    setFilters({ ...filters, page: targetPage });
                                }
                            }
                        }}
                    />

                    {/* Nút ĐI */}
                    <button
                        className="btn btn-sm btn-primary text-white border-0 fw-medium rounded ms-1"
                        style={{ height: '32px', padding: '0 12px' }}
                        onClick={() => {
                            const inputEl = document.getElementById('jumpPageInput') as HTMLInputElement;
                            if (inputEl) {
                                const targetPage = parseInt(inputEl.value) - 1;
                                if (targetPage >= 0 && targetPage < (totalPages || 1)) {
                                    setFilters({ ...filters, page: targetPage });
                                }
                            }
                        }}
                    >
                        Đi
                    </button>

                    {/* Nút Trang kế tiếp (>) */}
                    <button
                        className={`btn btn-sm d-flex align-items-center justify-content-center ms-1 ${filters.page >= (totalPages - 1) ? 'btn-light text-muted opacity-50' : 'btn-primary text-white'} border-0 rounded`}
                        style={{ width: '32px', height: '32px', padding: 0 }}
                        onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                        disabled={filters.page >= (totalPages - 1)}
                    >
                        <ChevronRight size={18} />
                    </button>

                    {/* Nút Đến trang cuối (>>) */}
                    <button
                        className={`btn btn-sm d-flex align-items-center justify-content-center ${filters.page >= (totalPages - 1) ? 'btn-light text-muted opacity-50' : 'btn-primary text-white'} border-0 rounded`}
                        style={{ width: '32px', height: '32px', padding: 0 }}
                        onClick={() => setFilters({ ...filters, page: (totalPages > 0 ? totalPages - 1 : 0) })}
                        disabled={filters.page >= (totalPages - 1)}
                    >
                        <ChevronsRight size={18} />
                    </button>

                </div>
            </div>
            {/* Nhúng Modal Thêm Task */}
            <CreateTaskModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {

                    setFilters({ ...filters, page: 0 });
                }}
            />
        </div >
    );
};

export default TaskPage;