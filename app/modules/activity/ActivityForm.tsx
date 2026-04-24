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

    // MOCK DATA: Dữ liệu giả cho 2 cái Dropdown chọn Khách hàng và Nhân viên
    // Sau này bạn gọi API (vd: userApi.getUsers()) để lấy list này đắp vào

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
        if (!formData.relatedToId) {
            alert("Vui lòng chọn Khách hàng liên quan!");
            return;
        }
        // --- KẾT THÚC KIỂM TRA ---
        setIsSaving(true);

        // BƯỚC QUAN TRỌNG: Làm sạch và ép kiểu dữ liệu cho khớp với Backend
        const payload = {
            // Các trường bắt buộc & có sẵn giá trị mặc định
            subject: formData.subject,
            activityType: formData.activityType as any,
            startDate: formData.startDate,
            relatedToType: formData.relatedToType,
            status: formData.status,
            important: formData.important,

            // Ép kiểu ID từ Chuỗi (của thẻ select) sang Số
            performedBy: Number(formData.performedBy),
            relatedToId: Number(formData.relatedToId),

            // Các trường có thể rỗng -> Chuyển thành null để Spring Boot không bị "ngáo"
            description: formData.description?.trim() === "" ? null : formData.description,
            endDate: formData.endDate === "" ? null : formData.endDate,
            outcome: formData.outcome?.trim() === "" ? null : formData.outcome,
        };

        try {
            if (isEditMode) {
                await activityApi.updateActivity(id, payload as any);
                alert('Cập nhật thành công!');
            } else {
                await activityApi.createActivity(payload as any);
                alert('Thêm mới thành công!');
            }

            // DÙNG REPLACE Ở ĐÂY
            router.replace('/activity');
        } catch (error) {
            alert('Lỗi rồi!');
        }
    };

    if (isLoading) return <div className="text-center p-5">Đang tải dữ liệu cũ...</div>;

    return (
        <div className="container py-5" style={{ maxWidth: '900px' }}>
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white border-bottom py-3">
                    <h5 className="mb-0 text-primary">
                        <i className={`fa-solid ${isEditMode ? 'fa-pen-to-square' : 'fa-calendar-plus'} me-2`}></i>
                        {isEditMode ? 'CẬP NHẬT HOẠT ĐỘNG' : 'THÊM MỚI HOẠT ĐỘNG'}
                    </h5>
                </div>

                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>

                        <div className="row mb-3">
                            <div className="col-md-8">
                                <label className="form-label fw-bold">Chủ đề <span className="text-danger">*</span></label>
                                <input type="text" className="form-control" name="subject" value={formData.subject} onChange={handleChange} required placeholder="VD: Gọi điện tư vấn chốt sale..." />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Loại hoạt động <span className="text-danger">*</span></label>
                                <select className="form-select" name="activityType" value={formData.activityType} onChange={handleChange} required>
                                    <option value="CALL">Cuộc gọi với khách</option>
                                    <option value="MEETING">Cuộc gặp</option>
                                    <option value="EMAIL_QUOTE">Email Báo giá</option>
                                    <option value="EMAIL_TRANS">Email Giao dịch</option>
                                </select>
                            </div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Thời gian bắt đầu</label>
                                <input type="datetime-local" className="form-control" name="startDate" value={formData.startDate} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Thời gian kết thúc</label>
                                <input type="datetime-local" className="form-control" name="endDate" value={formData.endDate} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Chỉ định cho (Người thực hiện) <span className="text-danger">*</span></label>
                                <select className="form-select" name="performedBy" value={formData.performedBy} onChange={handleChange} required>
                                    <option value="">-- Chọn nhân viên phụ trách --</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id.toString()}>
                                            {user.fullName} ({user.username})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Khách hàng liên quan <span className="text-danger">*</span></label>
                                <select className="form-select" name="relatedToId" value={formData.relatedToId} onChange={handleChange} >
                                    <option value="">-- Chọn khách hàng --</option>
                                    {mockCustomers.map(cus => (
                                        <option key={cus.id} value={cus.id}>{cus.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Trạng thái</label>
                                <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                                    <option value="PLANNED">Chưa hoàn thành</option>
                                    <option value="COMPLETED">Đã hoàn thành</option>
                                </select>
                            </div>
                            <div className="col-md-5">
                                <label className="form-label fw-bold">Kết quả (Outcome)</label>
                                <input type="text" className="form-control" name="outcome" value={formData.outcome} onChange={handleChange} placeholder="VD: Khách đồng ý mua, Cần gọi lại..." />
                            </div>
                            <div className="col-md-3 d-flex align-items-center mt-4">
                                <div className="form-check form-switch fs-5">
                                    <input className="form-check-input" type="checkbox" role="switch" id="importantSwitch" name="important" checked={formData.important} onChange={handleChange} />
                                    <label className="form-check-label fs-6 ms-2" htmlFor="importantSwitch">Quan trọng</label>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold">Mô tả chi tiết</label>
                            <textarea className="form-control" name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Nhập nội dung trao đổi, ghi chú..."></textarea>
                        </div>

                        <hr />

                        <div className="d-flex justify-content-end gap-2">
                            <button
                                type="button" // BẮT BUỘC phải có type="button"
                                onClick={() => router.replace('/activity')}
                                className="btn btn-secondary px-4"
                            >
                                Hủy bỏ
                            </button>
                            <button type="submit" className="btn btn-primary px-4" disabled={isSaving}>
                                {isSaving ? <><i className="fa-solid fa-spinner fa-spin me-2"></i>Đang lưu...</> : <><i className="fa-solid fa-floppy-disk me-2"></i>{isEditMode ? 'Cập nhật thay đổi' : 'Lưu hoạt động'}</>}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default ActivityForm;