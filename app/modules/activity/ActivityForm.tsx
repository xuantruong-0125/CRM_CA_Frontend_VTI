"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { activityApi } from './api/activity.api'; // Bật cái này khi có API
import axios from 'node_modules/axios/index.cjs';

interface Props {
    id?: number; // Có ID truyền vào thì là chế độ Sửa, không có thì là Thêm mới
}

const ActivityForm = ({ id }: Props) => {
    const router = useRouter();
    const isEditMode = !!id; // Kiểm tra xem đang ở chế độ nào

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [users, setUsers] = useState<any[]>([]);
    const [auditData, setAuditData] = useState({ createdAt: '', updatedAt: '' });

    // State chứa dữ liệu form
    const [formData, setFormData] = useState({
        subject: '',
        activityType: 'CALL', // Tương đương type trong HTML cũ
        startDate: '',
        endDate: '',
        performedBy: '',
        relatedToId: '',
        relatedToType: 'CUSTOMER',
        status: 'PLANNED', // 0 trong HTML cũ tương đương PLANNED
        outcome: '',
        important: false, // Tương đương isImportant
        description: ''
    });




    const mockCustomers = [{ id: 1, name: 'Công ty ABC' }, { id: 2, name: 'Tập đoàn XYZ' }];

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Sử dụng axios hoặc instance api của bạn để gọi
                const response = await fetch('http://localhost:8080/api/users');
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error('Không thể tải danh sách nhân viên:', error);
            }
        };
        fetchUsers();
    }, []);


    // Nếu là chế độ Sửa (có ID), gọi API lấy dữ liệu cũ đắp vào Form
    useEffect(() => {
        if (isEditMode) {
            const fetchOldData = async () => {
                setIsLoading(true);
                try {
                    const data = await activityApi.getActivityById(id);
                    setAuditData({
                        createdAt: data.createdAt || '',
                        updatedAt: data.updatedAt || ''
                    });
                    const formatDateTime = (dateString: string) => {
                        if (!dateString) return '';
                        // Cắt chuỗi lấy phần yyyy-MM-ddTHH:mm
                        return new Date(dateString).toISOString().slice(0, 16);
                    };
                    setFormData({
                        subject: data.subject || '',
                        activityType: data.activityType || 'CALL',
                        startDate: formatDateTime(data.startDate),
                        endDate: data.endDate ? formatDateTime(data.endDate) : '',
                        performedBy: data.performedBy?.id?.toString() || '',
                        relatedToId: data.relatedToId?.toString() || '',
                        relatedToType: data.relatedToType || 'CUSTOMER',
                        status: data.status || 'PLANNED',
                        outcome: data.outcome || '',
                        important: data.important || false,
                        description: data.description || ''
                    });
                } catch (error) {
                    alert('Không thể tải dữ liệu để sửa');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchOldData();
        }
    }, [id, isEditMode]);




    // Hàm xử lý khi người dùng gõ vào các ô input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Hàm xử lý khi bấm nút LƯU
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Ngăn trình duyệt load lại trang

        // --- BẮT ĐẦU: KIỂM TRA DỮ LIỆU ĐẦU VÀO TỰ LÀM (CUSTOM VALIDATION) ---
        if (!formData.subject.trim()) {
            alert("Vui lòng nhập Chủ đề hoạt động!");
            return; // Dừng hàm lại ngay, không cho chạy tiếp
        }
        if (!formData.startDate) {
            alert("Vui lòng chọn Thời gian bắt đầu!");
            return;
        }
        if (!formData.performedBy) {
            alert("Vui lòng chọn Nhân viên thực hiện!");
            return;
        }
        // if (!formData.relatedToId) { // Tạm thời bạn đang comment đoạn này
        //     alert("Vui lòng chọn Khách hàng liên quan!");
        //     return;
        // }
        // --- KẾT THÚC KIỂM TRA ---

        setIsSaving(true);

        // BƯỚC 1: Tạo basePayload gồm các trường LUÔN ĐƯỢC PHÉP thay đổi (dùng chung cho cả Thêm và Sửa)
        const basePayload = {
            subject: formData.subject,
            startDate: formData.startDate,
            status: formData.status,
            important: formData.important,

            // Ép kiểu ID từ Chuỗi sang Số
            performedBy: Number(formData.performedBy),

            // Các trường có thể rỗng -> Chuyển thành null để Spring Boot không báo lỗi
            description: formData.description?.trim() === "" ? null : formData.description,
            endDate: formData.endDate === "" ? null : formData.endDate,
            outcome: formData.outcome?.trim() === "" ? null : formData.outcome,
        };

        // BƯỚC 2: Tách biệt Payload dựa trên Chế độ
        let finalPayload;

        if (isEditMode) {
            // CHẾ ĐỘ SỬA: TUYỆT ĐỐI KHÔNG gửi activityType, relatedToType và relatedToId
            finalPayload = { ...basePayload };
        } else {
            // CHẾ ĐỘ THÊM MỚI: Nhồi đầy đủ tất cả các trường vào để gửi
            finalPayload = {
                ...basePayload,
                activityType: formData.activityType as any,
                relatedToType: formData.relatedToType,
                // Xử lý an toàn: Nếu không chọn Khách hàng thì gửi null thay vì gửi số 0
                relatedToId: formData.relatedToId ? Number(formData.relatedToId) : null,
            };
        }

        // BƯỚC 3: Gọi API
        try {
            if (isEditMode) {
                // 1. Gửi payload chỉ chứa các trường được sửa
                await activityApi.updateActivity(id, finalPayload as any);
                alert('Cập nhật thành công!');

                // 2. Quay lại trang chi tiết của chính Activity đó
                router.replace(`/activity/${id}`);
            } else {
                // 1. Gửi full payload và HỨNG dữ liệu trả về (có chứa ID mới từ Backend)
                const savedData = await activityApi.createActivity(finalPayload as any);
                alert('Thêm mới thành công!');

                // 2. Điều hướng vào thẳng trang chi tiết của Activity vừa tạo mới
                // Backend trả về object, Duy lấy trường .id hoặc .data.id tùy vào cấu trúc API
                const newId = savedData.id || savedData.data?.id;
                router.push(`/activity/${newId}`);
            }

            // XÓA DÒNG router.replace('/activity') ở đây đi vì nó sẽ đá Duy về trang danh sách

        } catch (error) {
            console.error(error);
            alert('Hệ thống gặp lỗi trong quá trình lưu dữ liệu!');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="text-center p-5">Đang tải dữ liệu cũ...</div>;

    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
            <div className="container" style={{ maxWidth: '900px' }}>

                {/* Nút Quay lại */}
                <div className="mb-3">

                </div>

                <div className="card shadow-sm border-0 rounded-3">
                    <div className="card-header bg-white border-bottom p-4">
                        <h5 className="mb-0 text-primary fw-bold">
                            <i className={`fa-solid ${isEditMode ? 'fa-pen-to-square' : 'fa-calendar-plus'} me-2`}></i>
                            {isEditMode ? 'CẬP NHẬT HOẠT ĐỘNG' : 'THÊM MỚI HOẠT ĐỘNG'}
                        </h5>
                    </div>

                    <div className="card-body p-4 p-md-5">
                        <form onSubmit={handleSubmit}>

                            {/* --- NHÓM 1: THÔNG TIN CHUNG --- */}
                            <h6 className="text-secondary fw-bold mb-3 border-bottom pb-2"><i className="fa-solid fa-circle-info me-2"></i>1. Thông tin chung</h6>
                            <div className="row mb-4 g-3">
                                <div className="col-md-8">
                                    <label className="form-label text-muted small text-uppercase fw-bold">Chủ đề <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control focus-ring focus-ring-info" name="subject" value={formData.subject} onChange={handleChange} required maxLength={255} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label text-muted small text-uppercase fw-bold">
                                        Loại hoạt động <span className="text-danger">*</span>
                                        {/* Hiện icon ổ khóa nhỏ nếu đang ở chế độ sửa */}
                                        {isEditMode && <i className="fa-solid fa-lock text-secondary ms-1" title="Không thể thay đổi loại hoạt động"></i>}
                                    </label>                                    <select className="form-select focus-ring focus-ring-info"
                                        name="activityType"
                                        value={formData.activityType}
                                        onChange={handleChange}
                                        required
                                        disabled={isEditMode}
                                        title={isEditMode ? "Không thể thay đổi loại hoạt động sau khi đã tạo" : ""}
                                    >
                                        <option value="CALL">Cuộc gọi với khách</option>
                                        <option value="MEETING">Cuộc gặp</option>
                                        <option value="EMAIL_QUOTE">Email Báo giá</option>
                                        <option value="EMAIL_TRANS">Email Giao dịch</option>
                                    </select>
                                </div>
                            </div>

                            {/* --- NHÓM 2: THỜI GIAN & PHÂN CÔNG --- */}
                            <h6 className="text-secondary fw-bold mb-3 border-bottom pb-2 mt-4"><i className="fa-regular fa-calendar-check me-2"></i>2. Thời gian & Phân công</h6>
                            <div className="row mb-3 g-3">
                                <div className="col-md-6">
                                    <label className="form-label text-muted small text-uppercase fw-bold">Thời gian bắt đầu <span className="text-danger">*</span></label>
                                    <input type="datetime-local" className="form-control focus-ring focus-ring-info" name="startDate" value={formData.startDate} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-muted small text-uppercase fw-bold">Thời gian kết thúc</label>
                                    <input type="datetime-local" className="form-control focus-ring focus-ring-info" name="endDate" value={formData.endDate} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="row mb-4 g-3">
                                <div className="col-md-6">
                                    <label className="form-label text-muted small text-uppercase fw-bold">Người thực hiện <span className="text-danger">*</span></label>
                                    <select className="form-select focus-ring focus-ring-info" name="performedBy" value={formData.performedBy} onChange={handleChange} required>
                                        <option value="">-- Chọn nhân viên phụ trách --</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id.toString()}>{user.fullName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-muted small text-uppercase fw-bold">
                                        Khách hàng liên quan <span className="text-danger">*</span>
                                        {isEditMode && <i className="fa-solid fa-lock text-secondary ms-1" title="Không thể đổi khách hàng"></i>}
                                    </label>
                                    <select
                                        className="form-select focus-ring focus-ring-info"
                                        name="relatedToId"
                                        value={formData.relatedToId}
                                        onChange={handleChange}
                                        required
                                        disabled={isEditMode}
                                        title={isEditMode ? "Hoạt động này đã được gắn cố định với khách hàng này" : ""}
                                    >
                                        <option value="">-- Chọn khách hàng --</option>
                                        {mockCustomers.map(cus => (
                                            <option key={cus.id} value={cus.id}>{cus.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* --- NHÓM 3: KẾT QUẢ & NỘI DUNG --- */}
                            <h6 className="text-secondary fw-bold mb-3 border-bottom pb-2 mt-4"><i className="fa-solid fa-list-check me-2"></i>3. Kết quả & Nội dung</h6>
                            <div className="row mb-3 g-3 align-items-end">
                                <div className="col-md-4">
                                    <label className="form-label text-muted small text-uppercase fw-bold">Trạng thái</label>
                                    <select className="form-select focus-ring focus-ring-info" name="status" value={formData.status} onChange={handleChange}>
                                        <option value="PLANNED">Chưa hoàn thành</option>
                                        <option value="COMPLETED">Đã hoàn thành</option>
                                    </select>
                                </div>
                                <div className="col-md-5">
                                    <label className="form-label text-muted small text-uppercase fw-bold">Kết quả (Outcome)</label>
                                    <input type="text" className="form-control focus-ring focus-ring-info" name="outcome" value={formData.outcome} onChange={handleChange} placeholder="VD: Khách đồng ý mua..." />
                                </div>
                                <div className="col-md-3">
                                    <div className={`p-2 border rounded ${formData.important ? 'bg-danger-subtle border-danger-subtle' : 'bg-light'} d-flex align-items-center justify-content-center h-100 transition-all`}>
                                        <div className="form-check form-switch fs-5 mb-0" style={{ cursor: 'pointer' }}>
                                            <input className="form-check-input" type="checkbox" role="switch" id="importantSwitch" name="important" checked={formData.important} onChange={handleChange} style={{ cursor: 'pointer' }} />
                                            <label className={`form-check-label fs-6 ms-1 ${formData.important ? 'text-danger fw-bold' : 'text-muted'}`} htmlFor="importantSwitch" style={{ cursor: 'pointer' }}>Quan trọng</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label text-muted small text-uppercase fw-bold">Mô tả chi tiết</label>
                                <textarea className="form-control focus-ring focus-ring-info" name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Nhập nội dung trao đổi, ghi chú..."></textarea>
                            </div>

                            {/* --- AUDIT LOG CHỈ CHO CHẾ ĐỘ SỬA --- */}
                            {isEditMode && (
                                <div className="bg-light p-3 rounded-3 border text-muted small mb-4">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <i className="fa-solid fa-clock me-2"></i>
                                            <strong>Tạo lúc:</strong> {auditData.createdAt ? new Date(auditData.createdAt).toLocaleString('vi-VN') : '---'}
                                        </div>
                                        <div className="col-md-6 border-start">
                                            <i className="fa-solid fa-clock-rotate-left me-2"></i>
                                            <strong>Cập nhật lần cuối:</strong> {auditData.updatedAt ? new Date(auditData.updatedAt).toLocaleString('vi-VN') : '---'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <hr className="my-4 text-muted" />

                            {/* NÚT LƯU & HỦY */}
                            <div className="d-flex justify-content-end gap-3">
                                <button type="button" onClick={() => router.back()} className="btn btn-light border shadow-sm px-4 text-secondary fw-medium">
                                    Hủy bỏ
                                </button>
                                <button type="submit" className="btn btn-primary px-4 shadow-sm fw-medium" disabled={isSaving}>
                                    {isSaving ? <><i className="fa-solid fa-spinner fa-spin me-2"></i>Đang lưu...</> : <><i className="fa-solid fa-floppy-disk me-2"></i>{isEditMode ? 'Cập nhật thay đổi' : 'Lưu hoạt động'}</>}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityForm;