"use client";
import httpClient from '@/core/http/httpClient';
import React, { useState, useEffect } from 'react';
import { useActivity } from './hooks/useActivity';
import Link from 'next/link';
import { activityApi } from './api/activity.api';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';



const getActivityTypeLabel = (type: string | number) => {
    // Ép kiểu về chuỗi để so sánh cho chuẩn xác
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


const ActivityPage = () => {
    const { activities, isLoading, setFilters, error, refetch } = useActivity();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [sortConfig, setSortConfig] = useState({ key: 'startDate', direction: 'desc' });
    const [isManager, setIsManager] = useState(false);


    //State tạm thời cho các ô nhập liệu trên thanh Filter
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
    //  Gọi API lấy danh sách nhân viên ngay khi vừa vào trang
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await httpClient.get('/api/users');
                if (response.data && response.data.content) {
                    setUsers(response.data.content);
                } else {
                    setUsers([]);
                }
            } catch (error) {
                console.error('Lỗi khi tải danh sách nhân viên:', error);
            }
        };

        fetchUsers();
    }, []); // Mảng rỗng [] nghĩa là chỉ gọi 1 lần khi load trang


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

        // Nếu người dùng đang thao tác trên ô chọn Khách hàng
        if (name === 'relatedToId') {
            setLocalFilters({
                ...localFilters,
                relatedToId: value,
                // NẾU CÓ CHỌN ID -> Gán cứng Loại là CUSTOMER
                // NẾU BỎ CHỌN (Value rỗng) -> Xóa luôn Loại cho sạch sẽ
                relatedToType: value !== '' ? 'CUSTOMER' : ''
            });
        } else {
            // Đối với các ô khác (search, status, performedBy...) thì giữ nguyên logic cũ
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
        // ÉP LUÔN LUÔN VỀ TRANG 0 KHI LỌC MỚI
        params.set('page', '0');

        // Cập nhật URL: ví dụ /activity?status=PLANNED&type=CALL
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
            setSelectedIds(selectedIds.filter(itemId => itemId !== id)); // Bỏ chọn
        } else {
            setSelectedIds([...selectedIds, id]); // Thêm vào danh sách chọn
        }
    };

    // Hàm xử lý khi bấm xóa
    const handleDeleteMultiple = async () => {
        if (selectedIds.length === 0) return;

        const confirmMsg = `chắc chắn muốn xóa ${selectedIds.length} hoạt động đã chọn không?`;

        if (window.confirm(confirmMsg)) {
            try {
                await activityApi.deleteActivities(selectedIds);

                alert("Đã xóa ");
                setSelectedIds([]);
                refetch();

            } catch (error) {
                console.error("Lỗi xóa hàng loạt:", error);
                alert("Hệ thống gặp lỗi khi xóa");
            }
        }
    };


    useEffect(() => {
        // 1. Lấy tất cả params từ URL
        const params = Object.fromEntries(searchParams.entries());

        // 2. Ép các ô Input phải đi theo URL (Dù URL rỗng thì Input cũng phải rỗng)
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

        // 3. Gọi API với đúng những gì đang có trên thanh địa chỉ
        setFilters(params);

    }, [searchParams]);

    // 1. State tạm để lưu số trang người dùng đang gõ vào ô input
    const [jumpPage, setJumpPage] = useState('');

    // 2. Đồng bộ số trang hiện tại vào ô input khi trang vừa load hoặc đổi trang
    useEffect(() => {
        setJumpPage((Number(localFilters.page) + 1).toString());
    }, [localFilters.page]);

    // 3. Hàm xử lý khi người dùng gõ xong và bấm Enter
    const handleJumpPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            let targetPage = parseInt(jumpPage, 10);
            const maxPage = activities.totalPages || 1;

            // Bắt lỗi: Nếu gõ chữ bậy bạ, gõ số < 1 hoặc lớn hơn tổng số trang
            if (isNaN(targetPage) || targetPage < 1) {
                targetPage = 1;
            } else if (targetPage > maxPage) {
                targetPage = maxPage;
            }

            // Cập nhật lại ô input cho chuẩn (lỡ họ nhập sai)
            setJumpPage(targetPage.toString());

            // Gọi hàm chuyển trang (nhớ trừ 1 vì Backend đếm từ số 0)
            handlePageChange(targetPage - 1);
        }
    };
    // Hàm chuyển đổi trạng thái nhanh (Tự động gọi API luôn)
    const handleStatusQuickFilter = (newStatus: string) => {
        // 1. Cập nhật giao diện nút cho nó sáng lên
        setLocalFilters({ ...localFilters, status: newStatus });

        // 2. Đẩy ngay lên URL để kích hoạt API
        const params = new URLSearchParams(searchParams.toString());

        if (newStatus === '') {
            params.delete('status'); // Nếu chọn "Tất cả" thì xóa tham số status cho sạch URL
        } else {
            params.set('status', newStatus);
        }

        params.set('page', '0'); // Bấm lọc mới thì luôn về trang đầu
        router.push(`${pathname}?${params.toString()}`);
    };
    const handleSort = (key: string) => {
        let direction = 'asc';

        // Nếu đang chọn đúng cột đó rồi thì đảo chiều, nếu chọn cột mới thì mặc định là asc
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }

        const newConfig = { key, direction };
        setSortConfig(newConfig);

        // Gọi lại hàm fetch dữ liệu với tham số sắp xếp mới
        // Ví dụ: fetchActivities(currentPage, pageSize, `${key},${direction}`);
    };






    if (isLoading) return <div className="p-4 text-center">Đang tải dữ liệu...</div>;
    if (error) return <div className="p-4 text-danger">Lỗi: {error}</div>;
    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
            <div className="card shadow-sm border-0 rounded-3">
                <div className="card-body p-4">

                    {/* HEADER TITLE & QUẢN LÝ TRẠNG THÁI */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        {/* BÊN TRÁI: Tiêu đề và Nút hành động */}
                        <div className="d-flex align-items-center gap-3">
                            <h5 className="text-uppercase mb-0 fw-bold text-white px-4 py-2 rounded shadow-sm"
                                style={{ backgroundColor: 'rgb(21, 0, 211)', letterSpacing: '0.5px' }}>
                                <i className="fa-solid fa-list-check text-primary me-2"></i>Tất cả hoạt động
                            </h5>

                            <Link href="/activity/create" className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm fw-medium">
                                <i className="fa-solid fa-plus me-1"></i> Thêm mới
                            </Link>

                            {selectedIds.length > 0 && (
                                <button type="button" className="btn btn-danger btn-sm rounded-pill px-3 shadow-sm fw-medium fade-in" onClick={handleDeleteMultiple}>
                                    <i className="fa-solid fa-trash-can me-1"></i> Xóa ({selectedIds.length})
                                </button>
                            )}
                        </div>

                        {/* BÊN PHẢI: Nút Lọc Trạng Thái Nhanh */}
                        <div className="d-flex align-items-center bg-light p-1 rounded-pill shadow-sm border" style={{ fontSize: '13px' }}>
                            <span className="text-muted fw-medium ms-3 me-2">
                                <i className="fa-solid fa-filter me-1"></i>Trạng thái:
                            </span>

                            <button
                                type="button"
                                onClick={() => handleStatusQuickFilter('')}
                                className={`btn btn-sm rounded-pill px-3 py-1 ${localFilters.status === '' ? 'btn-secondary fw-bold shadow-sm' : 'btn-light text-muted border-0'}`}
                            >
                                Tất cả
                            </button>

                            <button
                                type="button"
                                onClick={() => handleStatusQuickFilter('0')}
                                className={`btn btn-sm rounded-pill px-3 py-1 mx-1 ${localFilters.status === '0' ? 'btn-warning text-dark fw-bold shadow-sm' : 'btn-light text-muted border-0'}`}
                            >
                                <i className="fa-solid fa-spinner fa-spin me-1"></i>Chưa xong
                            </button>

                            <button
                                type="button"
                                onClick={() => handleStatusQuickFilter('1')}
                                className={`btn btn-sm rounded-pill px-3 py-1 ${localFilters.status === '1' ? 'btn-success fw-bold shadow-sm text-white' : 'btn-light text-muted border-0'}`}
                            >
                                <i className="fa-solid fa-check-double me-1"></i>Đã xong
                            </button>
                        </div>
                    </div>

                    {/* KHUNG BỘ LỌC DỮ LIỆU (ĐẦY ĐỦ) */}
                    <div className="d-flex flex-wrap align-items-end gap-3 mb-4 p-3 bg-light border rounded">

                        {/* 1. Ô Tìm kiếm */}
                        <div className="flex-grow-1" style={{ minWidth: '200px' }}>
                            <label className="form-label small text-muted mb-1">Tìm kiếm</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Tên hoạt động..."
                                name="search"
                                value={localFilters.search}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* 3. BỔ SUNG: Ô Lọc Loại hoạt động */}
                        <div style={{ minWidth: '140px' }}>
                            <label className="form-label small text-muted mb-1">Loại hoạt động</label>
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

                        {/* 4. Ô Chọn Khách hàng */}
                        <div style={{ minWidth: '180px' }}>
                            <label className="form-label small text-muted mb-1">Khách hàng</label>
                            <select className="form-select" name="relatedToId" value={localFilters.relatedToId} onChange={handleInputChange}>
                                <option value="">-- Chọn khách hàng --</option>
                                <option value="1">Công ty A</option>
                                <option value="2">Anh Nguyễn Văn B</option>
                            </select>
                        </div>

                        {/* 5. BỔ SUNG: Ô Người thực hiện (Phụ trách) */}
                        <div style={{ minWidth: '160px' }}>
                            <label className="form-label small text-muted mb-1">Người thực hiện</label>
                            <select
                                className="form-select"
                                name="performedBy"
                                value={localFilters.performedBy}
                                onChange={handleInputChange}
                            >
                                <option value="">-- Tất cả nhân sự --</option>

                                {/* Lặp qua mảng users lấy từ API để tự động tạo các option */}
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.fullName || user.name || user.username} {/* Đề phòng trường hợp API trả về tên field khác */}
                                    </option>
                                ))}

                            </select>
                        </div>

                        {/* 6. BỔ SUNG: Ô Từ ngày */}
                        <div style={{ minWidth: '140px' }}>
                            <label className="form-label small text-muted mb-1">Từ ngày</label>
                            <input
                                type="date"
                                className="form-control"
                                name="fromDate"
                                value={localFilters.fromDate}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* 7. BỔ SUNG: Ô Đến ngày */}
                        <div style={{ minWidth: '140px' }}>
                            <label className="form-label small text-muted mb-1">Đến ngày</label>
                            <input
                                type="date"
                                className="form-control"
                                name="toDate"
                                value={localFilters.toDate}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* 8. NÚT THAO TÁC */}
                        <div className="d-flex gap-2">
                            <button className="btn btn-primary" onClick={handleApplyFilter}>
                                <i className="fa-solid fa-filter me-1"></i> Lọc
                            </button>
                            <button className="btn btn-outline-secondary" onClick={handleReset} title="Xóa bộ lọc">
                                <i className="fa-solid fa-rotate-right"></i>
                            </button>
                        </div>

                    </div>

                    {/* TABLE DATA (STYLE MỚI GIỐNG TASK) */}
                    <div className="table-responsive shadow-sm rounded-3 bg-white border border-light">
                        <table className="table table-hover align-middle mb-0" style={{ fontSize: '14px' }}>
                            <thead className="table-light text-muted" style={{ borderBottom: '2px solid #dee2e6' }}>
                                <tr>
                                    <th className="fw-semibold px-3 py-3" style={{ width: '4%', backgroundColor: 'transparent' }}>
                                        <input className="form-check-input shadow-sm cursor-pointer m-0" type="checkbox" onChange={handleSelectAll} title="Chọn tất cả" />
                                    </th>
                                    <th className="fw-semibold py-3" style={{ width: '22%', backgroundColor: 'transparent' }}>Chủ đề</th>
                                    <th
                                        className="fw-semibold py-3"
                                        style={{ width: '13%', cursor: 'pointer', userSelect: 'none', backgroundColor: 'transparent' }}
                                        onClick={() => handleSort('startDate')}
                                    >
                                        <div className="d-flex align-items-center">
                                            Thời gian
                                            <span className="ms-2 d-flex flex-column" style={{ fontSize: '10px', lineHeight: '1' }}>
                                                {/* Mũi tên lên (Tăng dần) - Xanh lên khi được chọn */}
                                                <i className={`fa-solid fa-caret-up ${sortConfig.key === 'startDate' && sortConfig.direction === 'asc' ? 'text-primary' : 'text-muted'}`}></i>
                                                {/* Mũi tên xuống (Giảm dần) - Xanh lên khi được chọn */}
                                                <i className={`fa-solid fa-caret-down ${sortConfig.key === 'startDate' && sortConfig.direction === 'desc' ? 'text-primary' : 'text-muted'}`}></i>
                                            </span>
                                        </div>
                                    </th>

                                    <th className="fw-semibold py-3 text-center" style={{ width: '10%', backgroundColor: 'transparent' }}>Trạng thái</th>
                                    <th className="fw-semibold py-3 text-center" style={{ width: '8%', backgroundColor: 'transparent' }}>Quan trọng</th>
                                    <th className="fw-semibold py-3" style={{ width: '18%', backgroundColor: 'transparent' }}>Nội dung</th>
                                    <th className="fw-semibold py-3" style={{ width: '12%', backgroundColor: 'transparent' }}>Phụ trách</th>
                                    <th className="fw-semibold text-center py-3" style={{ width: '13%', backgroundColor: 'transparent' }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!activities.content || activities.content.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center text-muted py-5">
                                            <i className="fa-regular fa-folder-open fs-1 mb-3"></i>
                                            <p className="mb-0">Không có dữ liệu hoạt động nào.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    activities.content.map((act: any) => (
                                        <tr key={act.id} className="transition-all" style={{ cursor: 'pointer' }}>

                                            {/* Cột 1: Checkbox */}
                                            <td className="px-3" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    className="form-check-input shadow-sm cursor-pointer m-0"
                                                    type="checkbox"
                                                    checked={selectedIds.includes(act.id)}
                                                    onChange={() => handleSelectRow(act.id)}
                                                />
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

                                            {/* Cột 7: Phụ trách */}
                                            <td>
                                                <div className="fw-medium text-primary small mb-1">
                                                    <i className="fa-regular fa-circle-user me-1"></i> {act.performedBy?.name || 'Chưa gán'}
                                                </div>
                                                {/* <div className="text-muted small" style={{ fontSize: '11px' }}>
                                                    <i className="fa-regular fa-building me-1"></i> Đối tượng ID: {act.relatedToId}
                                                </div> */}
                                            </td>

                                            {/* Cột 8: Hành động (Sửa / Xem) */}
                                            <td className="text-center" onClick={(e) => e.stopPropagation()}>
                                                <div className="d-flex justify-content-center gap-2">
                                                    <Link href={`/activity/edit/${act.id}`} className="btn btn-sm btn-light border text-warning shadow-sm" title="Chỉnh sửa">
                                                        <i className="fa-solid fa-pen-to-square"></i>
                                                    </Link>
                                                    <Link href={`/activity/${act.id}`} className="btn btn-sm btn-outline-info rounded-pill px-3 shadow-sm fw-medium" title="Xem chi tiết">
                                                        Xem <i className="fa-solid fa-arrow-right ms-1 text-sm"></i>
                                                    </Link>
                                                </div>
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
        </div>
    );
};

export default ActivityPage;