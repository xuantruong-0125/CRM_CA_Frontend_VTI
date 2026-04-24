"use client";
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useActivity } from './hooks/useActivity';
import Link from 'next/link';
import { activityApi } from './api/activity.api';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';



const getActivityTypeLabel = (type: string) => {
    switch (type) {
        case 'CALL': return 'Cuộc gọi với khách';
        case 'MEETING': return 'Cuộc gặp';
        case 'EMAIL': return 'Email chung';
        case 'EMAIL_QUOTE': return 'Email Báo giá';
        case 'EMAIL_TRANS': return 'Email Giao dịch';
        default: return type; // Nếu không khớp cái nào thì hiện nguyên bản
    }
};


const ActivityPage = () => {
    const { activities, isLoading, setFilters, error, refetch } = useActivity();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();


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


    });


    // State để lưu danh sách nhân viên lấy từ API
    const [users, setUsers] = useState<any[]>([]);
    //  Gọi API lấy danh sách nhân viên ngay khi vừa vào trang
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Thay vì gọi axios thẳng, có file userApi.ts thì dùng càng tốt nhé!
                const response = await axios.get('http://localhost:8080/api/users');
                setUsers(response.data);
            } catch (error) {
                console.error('Lỗi khi tải danh sách nhân viên:', error);
            }
        };

        fetchUsers();
    }, []); // Mảng rỗng [] nghĩa là chỉ gọi 1 lần khi load trang


    

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

        // Cập nhật URL: ví dụ /activity?status=PLANNED&type=CALL
        router.push(`${pathname}?${params.toString()}`);
    };

    // 4. Khi bấm nút Reset (Xoay vòng)
    const handleReset = () => {
        const emptyFilters = {
            search: '', status: '', activityType: '', performedBy: '',
            relatedToId: '', relatedToType: '', fromDate: '', toDate: ''
        };
        setLocalFilters(emptyFilters);

        // Đưa URL về trạng thái nguyên bản (không còn dấu ?)
        router.push(pathname);
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

                alert("Đã xóa xong rồi nhé!");
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
            toDate: params.toDate || ''
        });

        // 3. Gọi API với đúng những gì đang có trên thanh địa chỉ
        setFilters(params);

    }, [searchParams]);



    if (isLoading) return <div className="p-4 text-center">Đang tải dữ liệu...</div>;
    if (error) return <div className="p-4 text-danger">Lỗi: {error}</div>;

    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
            <div className="card shadow-sm">
                <div className="card-body">
                    {/* HEADER TITTLE & BUTTONS */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center gap-3">
                            <h5 className="text-uppercase text-secondary mb-0">TẤT CẢ HOẠT ĐỘNG</h5>
                            <button className="btn btn-success btn-sm">
                                <Link href="/activity/create" className="btn btn-success btn-sm">
                                    <i className="fa-solid fa-plus"></i> Thêm mới
                                </Link>
                            </button>

                            {/* Nút xóa sẽ hiện ra khi có ít nhất 1 checkbox được chọn */}
                            {selectedIds.length > 0 && (
                                <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={handleDeleteMultiple}
                                >
                                    <i className="fa-solid fa-trash-can"></i> XÓA ĐÃ CHỌN ({selectedIds.length})
                                </button>
                            )}
                        </div>
                    </div>

                    {/* /* PHẦN FORM LỌC */}
                    <div className="mb-4 bg-light p-3 border rounded">
                        <div className="row g-2 mb-2">
                            <div className="col-md-3">
                                <input
                                    type="text"
                                    name="search" // Phải khớp với tên trong state
                                    className="form-control"
                                    placeholder="Tìm theo chủ đề..."
                                    value={localFilters.search}
                                    onChange={handleInputChange}
                                />                            </div>
                            <div className="col-md-2">
                                <select name="status" className="form-select"
                                    value={localFilters.status} onChange={handleInputChange}>
                                    <option value="">- Trạng thái -</option>
                                    <option value="1">Đã hoàn thành</option>
                                    <option value="0">Chưa hoàn thành</option>
                                </select>
                            </div>
                            <div className="col-md-2">
                                <select name="activityType" className="form-select"
                                    value={localFilters.activityType} onChange={handleInputChange}>
                                    <option value="">- Loại -</option>
                                    <option value="CALL">Cuộc gọi với khách</option>
                                    <option value="MEETING">Cuộc gặp</option>
                                    <option value="EMAIL">Email</option>
                                    <option value="EMAIL_QUOTE">Email Báo giá</option>
                                    <option value="EMAIL_TRANS">Email Giao dịch</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <select name="relatedToId" className="form-select"
                                    value={localFilters.relatedToId} onChange={handleInputChange}>
                                    <option value="">- Tất cả Khách hàng -</option>
                                </select>
                            </div>
                            <div className="col-md-2">
                                <select name="performedBy" className="form-select"
                                    value={localFilters.performedBy} onChange={handleInputChange}>
                                    <option value="">- Tất cả Nhân viên -</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.fullName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="row g-2">
                            <div className="col-md-2">
                                <input
                                    type="date"
                                    name="fromDate"
                                    className="form-control"
                                    title="Từ ngày"
                                    value={localFilters.fromDate}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="col-md-2">
                                <input
                                    type="date"
                                    name="toDate"
                                    className="form-control"
                                    title="Đến ngày"
                                    value={localFilters.toDate}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="col-md-1 d-flex gap-1">
                                {/* NÚT LỌC */}
                                <button onClick={handleApplyFilter} type="button" className="btn btn-primary w-100" title="Lọc dữ liệu">
                                    <i className="fa-solid fa-filter"></i>
                                </button>
                                {/* NÚT RESET */}
                                <button onClick={handleReset} type="button" className="btn btn-secondary w-100" title="Xóa bộ lọc" >
                                    <i className="fa-solid fa-rotate-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* TABLE DATA */}
                    <div className="table-responsive">
                        {/* Thêm chút style inline cho header giống CSS cũ của bạn */}
                        <table className="table table-hover table-bordered">
                            <thead style={{ backgroundColor: '#6c757d', color: 'white' }}>
                                <tr>
                                    <th className="text-center align-middle" style={{ width: '3%', backgroundColor: '#6c757d', color: 'white' }}>
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={
                                                activities.content?.length > 0 &&
                                                selectedIds.length === activities.content?.length
                                            }
                                        />
                                    </th>
                                    <th className="text-center align-middle" style={{ width: '5%', backgroundColor: '#6c757d', color: 'white' }}>
                                        <i className="fa-solid fa-filter"></i>
                                    </th>
                                    <th style={{ width: '15%', backgroundColor: '#6c757d', color: 'white' }}>Chủ đề</th>
                                    <th style={{ width: '12%', backgroundColor: '#6c757d', color: 'white' }}>Ngày bắt đầu</th>
                                    <th className="text-center align-middle" style={{ width: '10%', backgroundColor: '#6c757d', color: 'white' }}>Đã hoàn thành</th>
                                    <th className="text-center align-middle" style={{ width: '8%', backgroundColor: '#6c757d', color: 'white' }}>Quan trọng</th>
                                    <th style={{ width: '22%', backgroundColor: '#6c757d', color: 'white' }}>Mô tả</th>
                                    <th style={{ width: '12%', backgroundColor: '#6c757d', color: 'white' }}>Đã chỉ định cho</th>
                                    <th style={{ width: '13%', backgroundColor: '#6c757d', color: 'white' }}>Liên quan tới</th>
                                    <th className="text-center align-middle" style={{ width: '5%', backgroundColor: '#6c757d', color: 'white' }}>Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!activities.content || activities.content.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="text-center text-muted py-3">Không có dữ liệu hoạt động nào.</td>
                                    </tr>
                                ) : (
                                    activities.content.map((act: any) => (
                                        <tr key={act.id}>
                                            <td className="text-center align-middle">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(act.id)}
                                                    onChange={() => handleSelectRow(act.id)}
                                                />
                                            </td>
                                            <td className="text-center align-middle">
                                                <Link
                                                    href={`/activity/edit/${act.id}`}
                                                    className="btn btn-link text-secondary p-0 border-0"
                                                    title="Chỉnh sửa hoạt động"
                                                >
                                                    <i className="fa-solid fa-pen"></i>
                                                </Link>
                                            </td>
                                            <td className="align-middle" style={{ fontSize: '13px' }}>{act.subject}</td>
                                            <td className="align-middle" style={{ fontSize: '13px' }}>
                                                {new Date(act.startDate).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                                            </td>

                                            {/* Xử lý hiển thị Trạng thái */}
                                            <td className="text-center align-middle fs-5">
                                                {act.status === 'COMPLETED' ? (
                                                    // Nếu đã hoàn thành -> Hiện dấu Tick xanh lá cực đẹp
                                                    <i className="fa-solid fa-circle-check text-success" title="Đã hoàn thành"></i>
                                                ) : (
                                                    // Nếu chưa hoàn thành -> Hiện hình tròn xám nhạt (hoặc dấu gạch ngang)
                                                    <i className="fa-regular fa-circle text-muted" title="Chưa hoàn thành"></i>
                                                )}
                                            </td>

                                            {/* Xử lý hiển thị Quan trọng */}
                                            <td className="text-center align-middle">
                                                {act.important ? (
                                                    <span className="text-danger"><i className="fa-regular fa-square-check"></i></span>
                                                ) : (
                                                    <span className="text-muted"><i className="fa-regular fa-square"></i></span>
                                                )}
                                            </td>

                                            <td className="align-middle" style={{ fontSize: '13px' }}>{act.description}</td>
                                            <td className="text-primary align-middle" style={{ fontSize: '13px' }}>nhanvien_{act.performedBy?.name}</td>

                                            <td className="text-info align-middle" style={{ fontSize: '13px' }}>
                                                <strong>Đối tượng {act.relatedToId}</strong><br />
                                                <small className="text-muted">({act.relatedToType})</small>
                                            </td>

                                            <td className="text-center align-middle">
                                                <Link
                                                    href={`/activity/${act.id}`}
                                                    className="btn btn-sm btn-outline-info rounded-circle fw-bold d-inline-flex justify-content-center align-items-center"
                                                    title="Xem chi tiết"
                                                    style={{ width: '28px', height: '28px', padding: 0, textDecoration: 'none' }}
                                                >
                                                    i
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityPage;