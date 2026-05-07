"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
// import { useTask } from './hooks/useTask';

const TaskPage = () => {

    const [tasks, setTasks] = useState<any[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState({
        subject: '',
        status: '',
        priority: '',
        page: 0,
        size: 10
    });

    const fetchTasks = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('http://localhost:8080/api/v1/tasks', {
                params: {
                    subject: filters.subject || undefined,
                    status: filters.status || undefined,
                    priority: filters.priority || undefined,
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
                setTotalPages(1); // Nếu trả về mảng thường thì mặc định là 1 trang
            }
        } catch (err: any) {
            console.error("Lỗi fetch:", err);
            setError("Không thể tải danh sách công việc. Vui lòng kiểm tra lại server.");
        } finally {
            setIsLoading(false);
        }
    };

    // Lắng nghe mảng [filters]. Mỗi khi user gõ phím, đổi trang, đổi trạng thái...
    // state filters thay đổi -> useEffect tự động gọi lại hàm fetchTasks.
    useEffect(() => {
        fetchTasks();
    }, [filters]);

    // CÁC HÀM XỬ LÝ SỰ KIỆN (HANDLERS)
    const handleStatusChange = (newStatus: string) => {
        setFilters(prev => ({ ...prev, status: newStatus, page: 0 }));
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFilters(prev => ({ ...prev, subject: value, page: 0 }));
    };

    // ĐÃ BỔ SUNG: Kiểu dữ liệu (newPage: number) cho TypeScript khỏi báo lỗi đỏ
    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };


    //CÁC HÀM TIỆN ÍCH GIAO DIỆN (UI HELPERS)
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'NOT_STARTED':
                return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1"><i className="fa-solid fa-pause me-1"></i>Chưa bắt đầu</span>;
            case 'IN_PROGRESS':
                return <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1"><i className="fa-solid fa-spinner fa-spin me-1"></i>Đang làm</span>;
            case 'WAITING':
                return <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1"><i className="fa-regular fa-clock me-1"></i>Đang chờ</span>;
            case 'DEFERRED':
                return <span className="badge bg-dark-subtle text-dark border border-dark-subtle px-2 py-1"><i className="fa-solid fa-circle-pause me-1"></i>Tạm hoãn</span>;
            case 'COMPLETED':
                return <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1"><i className="fa-solid fa-check-double me-1"></i>Hoàn thành</span>;
            default:
                return <span className="badge bg-light text-dark border px-2 py-1">{status}</span>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'HIGH': return <span className="text-danger fw-bold small"><i className="fa-solid fa-angles-up me-1"></i>Cao</span>;
            case 'NORMAL': return <span className="text-primary fw-bold small"><i className="fa-solid fa-angle-up me-1"></i>Bình thường</span>;
            case 'LOW': return <span className="text-muted fw-bold small"><i className="fa-solid fa-angle-down me-1"></i>Thấp</span>;
            default: return <span className="text-secondary small">{priority}</span>;
        }
    };

    const formatShortDate = (dateString: string | null) => {
        if (!dateString) return '---';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };


    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
            {/* 1. HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-3">
                    <h5 className="text-uppercase text-secondary mb-0 fw-bold">
                        <i className="fa-solid fa-list-check me-2"></i>QUẢN LÝ CÔNG VIỆC
                    </h5>
                    <div>
                        <button className="btn btn-success btn-sm rounded-pill px-3 shadow-sm">
                            <i className="fa-solid fa-plus me-1"></i> Giao việc mới
                        </button>
                    </div>
                </div>

            </div>

            {/* 2. BỘ LỌC TÌM KIẾM */}
            <div className="card shadow-sm border-0 rounded-3 mb-4">
                <div className="card-body p-3">
                    <div className="row g-3 align-items-center">
                        <div className="col-md-4">
                            <div className="input-group input-group-sm border rounded-pill overflow-hidden focus-within-ring">
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

                        <div className="col-md-5">
                            <div className="d-flex align-items-center bg-light p-1 rounded-pill border" style={{ width: 'fit-content', fontSize: '13px' }}>
                                <span className="text-muted fw-medium mx-2"><i className="fa-solid fa-filter me-1"></i>Trạng thái:</span>
                                <button
                                    type="button"
                                    className={`btn btn-sm rounded-pill px-3 py-1 ${filters.status === '' ? 'btn-secondary fw-bold shadow-sm' : 'btn-light text-muted border-0'}`}
                                    onClick={() => setFilters({ ...filters, status: '', page: 0 })}
                                >
                                    Tất cả
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-sm rounded-pill px-3 py-1 mx-1 ${filters.status === 'NOT_STARTED' ? 'btn-secondary fw-bold shadow-sm' : 'btn-light text-muted border-0'}`}
                                    onClick={() => setFilters({ ...filters, status: 'NOT_STARTED', page: 0 })}
                                >
                                    Chưa bắt đầu
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-sm rounded-pill px-3 py-1 ${filters.status === 'IN_PROGRESS' ? 'btn-primary fw-bold shadow-sm text-white' : 'btn-light text-muted border-0'}`}
                                    onClick={() => setFilters({ ...filters, status: 'IN_PROGRESS', page: 0 })}
                                >
                                    Đang làm
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-sm rounded-pill px-3 py-1 ms-1 ${filters.status === 'COMPLETED' ? 'btn-success fw-bold shadow-sm text-white' : 'btn-light text-muted border-0'}`}
                                    onClick={() => setFilters({ ...filters, status: 'COMPLETED', page: 0 })}
                                >
                                    Đã xong
                                </button>
                            </div>
                        </div>
                        <div className="col-md-3 d-flex justify-content-end">
                            {/* 1. SELECT: ĐỘ ƯU TIÊN */}
                            <select
                                className="form-select form-select-sm border-light-subtle rounded-pill shadow-sm"
                                style={{ width: '150px' }}
                                value={filters.priority} // Ràng buộc giá trị với state
                                onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 0 })} // Bắt sự kiện khi chọn
                            >
                                <option value="">Độ ưu tiên</option>
                                <option value="HIGH">🔥 Cao</option>
                                <option value="NORMAL">⚡ Bình thường</option>
                                <option value="LOW">💤 Thấp</option>
                            </select>
                            <button
                                className="btn btn-sm btn-light text-secondary border rounded-circle ms-2"
                                style={{ width: '32px', height: '32px' }}
                                title="Xóa bộ lọc"
                                onClick={() => setFilters({ // Reset toàn bộ state về mặc định
                                    subject: '',
                                    status: '',
                                    priority: '',
                                    page: 0,
                                    size: 10
                                })}
                            >
                                <i className="fa-solid fa-rotate-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {error && (
                <div className="alert alert-danger shadow-sm border-0 py-2 mb-4">
                    <i className="fa-solid fa-triangle-exclamation me-2"></i> {error}
                </div>
            )}

            {/* 3. BẢNG DỮ LIỆU */}
            <div className="table-responsive shadow-sm rounded-3 bg-white border border-light">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: '14px' }}>
                    <thead className="table-light text-muted" style={{ borderBottom: '2px solid #dee2e6' }}>
                        <tr>
                            <th className="fw-semibold px-3 py-3" style={{ width: '8%' }}>
                                <div className="d-flex align-items-center gap-2">
                                    <input className="form-check-input shadow-sm cursor-pointer m-0" type="checkbox" title="Chọn tất cả" />
                                </div>
                            </th>
                            <th className="fw-semibold py-3" style={{ width: '22    %' }}>Chủ đề công việc</th>
                            <th className="fw-semibold py-3" style={{ width: '15%' }}>Trạng thái & Tiến độ</th>
                            <th className="fw-semibold py-3" style={{ width: '8%' }}>Ưu tiên</th>
                            <th className="fw-semibold py-3" style={{ width: '15%' }}>Thời hạn (Start - Due)</th>
                            <th className="fw-semibold py-3" style={{ width: '15%' }}>Liên hệ</th>
                            <th className="fw-semibold py-3" style={{ width: '10%' }}>Phân công cho</th>
                            <th className="fw-semibold text-center py-3" style={{ width: '7%' }}>Chi tiết</th>
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
                                            />
                                            {/* Dùng thẻ Link nếu Duy đã làm trang Edit, tạm thời dùng button */}
                                            <button className="btn btn-sm btn-light border text-warning shadow-sm" title="Chỉnh sửa nhanh">
                                                <i className="fa-solid fa-pen-to-square"></i>
                                            </button>
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
                                    {/* CỘT 3: KHÁCH HÀNG */}
                                    <td>
                                        {task.contactName ? (
                                            <div className="text-info fw-medium" style={{ fontSize: '13px' }}>
                                                <i className="fa-regular fa-address-book me-1"></i> {task.contactName}
                                            </div>
                                        ) : task.contactId ? (
                                            <div className="text-info" style={{ fontSize: '13px' }}>
                                                <i className="fa-regular fa-address-book me-1"></i> Liên hệ ID: {task.contactId}
                                            </div>
                                        ) : task.relatedToId ? (
                                            <div className="text-muted" style={{ fontSize: '13px' }}>
                                                <i className="fa-regular fa-building me-1"></i> Đối tượng ID: {task.relatedToId}
                                            </div>
                                        ) : (
                                            <span className="badge bg-light text-muted fw-normal border">Không đính kèm</span>
                                        )}
                                    </td>

                                    {/* CỘT 7: PHÂN CÔNG */}
                                    <td>
                                        {task.assignee ? (
                                            <>
                                                <div className="fw-medium text-primary small">
                                                    <i className="fa-regular fa-circle-user me-1"></i> {task.assignee.name}
                                                </div>
                                                {/* <div className="text-muted small" style={{ fontSize: '11px' }}>
                                                    User ID: {task.assignee.id}
                                                </div> */}
                                            </>
                                        ) : (
                                            <span className="text-muted small fst-italic">Chưa phân công</span>
                                        )}
                                    </td>

                                    {/* CỘT CUỐI: XEM CHI TIẾT */}
                                    <td className="text-center">
                                        <button className="btn btn-sm btn-outline-info rounded-pill px-3 shadow-sm fw-medium" title="Xem chi tiết công việc">
                                            Xem <i className="fa-solid fa-arrow-right ms-1 text-sm"></i>
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
                {/* Hiển thị thông tin tổng quát */}
                <div className="text-muted small">
                    Hiển thị <b>{tasks.length}</b> trên tổng số <b>{totalElements}</b> công việc
                </div>

                <div className="d-flex align-items-center gap-3">
                    {/* Bộ nút điều hướng */}
                    <nav>
                        <ul className="pagination pagination-sm mb-0 gap-1">
                            {/* Nút Về trang đầu */}
                            <li className={`page-item ${filters.page === 0 ? 'disabled' : ''}`}>
                                <button className="page-link rounded-circle border-0 shadow-sm" onClick={() => setFilters({ ...filters, page: 0 })}>
                                    <i className="fa-solid fa-angles-left"></i>
                                </button>
                            </li>

                            {/* Nút Trang trước */}
                            <li className={`page-item ${filters.page === 0 ? 'disabled' : ''}`}>
                                <button className="page-link rounded-circle border-0 shadow-sm" onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>
                                    <i className="fa-solid fa-chevron-left"></i>
                                </button>
                            </li>

                            {/* Hiển thị số trang (Ví dụ: Trang 1 / 10) */}
                            <li className="page-item disabled">
                                <span className="page-link border-0 bg-transparent text-dark fw-bold">
                                    Trang {filters.page + 1} / {totalPages || 1}
                                </span>
                            </li>

                            {/* Nút Trang kế tiếp */}
                            <li className={`page-item ${filters.page >= (totalPages - 1) ? 'disabled' : ''}`}>
                                <button className="page-link rounded-circle border-0 shadow-sm" onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>
                                    <i className="fa-solid fa-chevron-right"></i>
                                </button>
                            </li>

                            {/* Nút Đến trang cuối */}
                            <li className={`page-item ${filters.page >= (totalPages - 1) ? 'disabled' : ''}`}>
                                <button className="page-link rounded-circle border-0 shadow-sm" onClick={() => setFilters({ ...filters, page: totalPages - 1 })}>
                                    <i className="fa-solid fa-angles-right"></i>
                                </button>
                            </li>
                        </ul>
                    </nav>

                    {/* Ô nhập số trang để nhảy nhanh (Jump to page) */}
                    <div className="d-flex align-items-center gap-2 ms-3">
                        <span className="small text-muted">Đến trang:</span>
                        <input
                            type="number"
                            className="form-control form-control-sm text-center shadow-sm"
                            style={{ width: '100px', borderRadius: '8px' }}
                            min="1"
                            max={totalPages}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const targetPage = parseInt((e.target as HTMLInputElement).value) - 1;
                                    if (targetPage >= 0 && targetPage < totalPages) {
                                        setFilters({ ...filters, page: targetPage });
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskPage;