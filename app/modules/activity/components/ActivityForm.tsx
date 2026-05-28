"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { activityApi } from '../api/activity.api';
import httpClient from '@/core/http/httpClient';

interface Props {
    id?: number;
}

const ActivityForm = ({ id }: Props) => {
    const router = useRouter();
    const isEditMode = !!id; // Kiểm tra xem đang ở chế độ nào

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);


    const [isManager, setIsManager] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string>('');


    const [isLocked, setIsLocked] = useState(false);

    const [users, setUsers] = useState<any[]>([]);
    const [auditData, setAuditData] = useState({ createdAt: '', updatedAt: '' });
    // State chứa dữ liệu form
    const [formData, setFormData] = useState({
        subject: '',
        activityType: 'CALL',
        startDate: '',
        endDate: '',
        performedBy: '',
        relatedToId: '',
        relatedToType: 'CUSTOMER',
        status: 'PLANNED',
        outcome: '',
        important: false,
        description: ''
    });


    const [relatedOptions, setRelatedOptions] = useState<any[]>([]);
    const [isLoadingOptions, setIsLoadingOptions] = useState(false);

    useEffect(() => {
        const fetchRelatedOptions = async () => {
            if (!formData.relatedToType) return;
            setIsLoadingOptions(true);
            try {
                let endpoint = '';
                if (formData.relatedToType === 'LEAD') endpoint = '/api/leads?size=100';
                else if (formData.relatedToType === 'CUSTOMER') endpoint = '/api/customers?size=100';
                else if (formData.relatedToType === 'OPPORTUNITY') endpoint = '/api/opportunities?size=100';
                else if (formData.relatedToType === 'CONTACT') endpoint = '/api/v1/contacts?size=100';

                if (endpoint) {
                    const response = await httpClient.get(endpoint);
                    const resData = response.data;
                    let dataList: any[] = [];

                    if (Array.isArray(resData)) {
                        dataList = resData;
                    } else if (Array.isArray(resData?.data?.items)) {
                        dataList = resData.data.items;
                    }
                    else if (Array.isArray(resData?.data?.content)) {
                        dataList = resData.data.content;
                    } else if (Array.isArray(resData?.content)) {
                        dataList = resData.content;
                    } else if (Array.isArray(resData?.data)) {
                        dataList = resData.data;
                    } else if (Array.isArray(resData?.items)) {
                        dataList = resData.items;
                    }
                    else if (resData?.data && typeof resData.data === 'object' && Object.keys(resData.data).length > 0) {
                        dataList = [resData.data];
                    } else if (resData && typeof resData === 'object') {
                        dataList = [resData];
                    }

                    setRelatedOptions(dataList);
                }
            } catch (error) {
                console.error(`Lỗi tải danh sách ${formData.relatedToType}:`, error);
                setRelatedOptions([]);
            } finally {
                setIsLoadingOptions(false);
            }
        };

        fetchRelatedOptions();
    }, [formData.relatedToType]);




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
                console.error('Không thể tải danh sách nhân viên:', error);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const rolesStr = localStorage.getItem('roles');
            const uid = localStorage.getItem('userId');

            let managerFlag = false;
            if (rolesStr) {
                try {
                    const roles = JSON.parse(rolesStr);
                    managerFlag = roles.includes('ADMIN') || roles.includes('MANAGER');
                    setIsManager(managerFlag);
                } catch (e) { console.error(e); }
            }

            if (uid) {
                setCurrentUserId(uid);
                if (!isEditMode && !managerFlag) {
                    setFormData(prev => ({ ...prev, performedBy: uid }));
                }
            }
        }
    }, [isEditMode]);


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

                    const rolesStr = localStorage.getItem('roles');

                    let managerFlag = false;
                    if (rolesStr) {
                        try {
                            const roles = JSON.parse(rolesStr);
                            managerFlag = roles.includes('ADMIN') || roles.includes('MANAGER');
                        } catch (e) { }
                    }


                    if (data.status === 'COMPLETED') {
                        setIsLocked(true);
                    } else {
                        setIsLocked(false);
                    }


                } catch (error) {
                    alert('Không thể tải dữ liệu để sửa');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchOldData();
        }
    }, [id, isEditMode]);

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
        e.preventDefault();

        if (!formData.subject.trim()) {
            alert("Vui lòng nhập Chủ đề hoạt động!");
            return;
        }
        if (!formData.startDate) {
            alert("Vui lòng chọn Thời gian bắt đầu!");
            return;
        }
        if (!formData.performedBy) {
            alert("Vui lòng chọn Nhân viên thực hiện!");
            return;
        }


        setIsSaving(true);

        const formatToSpringDateTime = (dateStr: string) => {
            if (!dateStr || dateStr.trim() === "") return null;
            return dateStr.length === 16 ? `${dateStr}:00` : dateStr;
        };

        const finalPayload = {
            subject: formData.subject,
            startDate: formatToSpringDateTime(formData.startDate),
            endDate: formatToSpringDateTime(formData.endDate),
            status: formData.status,

            important: formData.important === true || String(formData.important) === 'true',

            performedBy: Number(formData.performedBy),
            description: formData.description?.trim() === "" ? null : formData.description,
            outcome: formData.outcome?.trim() === "" ? null : formData.outcome,

            activityType: formData.activityType,
            relatedToType: formData.relatedToType,
            relatedToId: formData.relatedToId ? Number(formData.relatedToId) : null,
        };

        try {
            if (isEditMode) {
                await activityApi.updateActivity(id, finalPayload as any);
                alert('Cập nhật thành công!');
                router.replace(`/activity/${id}`);
            } else {
                const savedData = await activityApi.createActivity(finalPayload as any);
                alert('Thêm mới thành công!');
                const newId = savedData.id || savedData.data?.id;
                router.push(`/activity/${newId}`);
            }
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
            <div className="container" style={{ maxWidth: '1100px' }}>

                {isLocked && (
                    <div className="alert alert-success border-success-subtle shadow-sm d-flex align-items-center mb-4">
                        <i className="fa-solid fa-check-circle text-success fs-4 me-3"></i>
                        <div>
                            <h6 className="alert-heading mb-1 fw-bold">Hoạt động đã đóng!</h6>
                            <p className="mb-0 small">Hoạt động này đã được đánh dấu <b>Đã hoàn thành</b>. Bạn chỉ có thể xem, không thể thay đổi dữ liệu.</p>
                        </div>
                    </div>
                )}

                <div className="card shadow-sm border-0 rounded-3">
                    <div className="card-header bg-white border-bottom p-4">
                        <h5 className="mb-0 text-primary fw-bold">
                            <i className={`fa-solid ${isEditMode ? 'fa-pen-to-square' : 'fa-calendar-plus'} me-2`}></i>
                            {isEditMode ? 'CẬP NHẬT HOẠT ĐỘNG' : 'THÊM MỚI HOẠT ĐỘNG'}
                        </h5>
                    </div>

                    <div className="card-body p-4 p-md-5">
                        <form onSubmit={handleSubmit}>

                            <div className="row g-5">

                                <div className="col-lg-8">
                                    <h6 className="text-secondary fw-bold mb-4 border-bottom pb-2">
                                        <i className="fa-solid fa-file-lines me-2"></i>Nội dung công việc
                                    </h6>

                                    <div className="mb-4">
                                        <label className="form-label text-muted small text-uppercase fw-bold">Chủ đề <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control focus-ring focus-ring-info" name="subject" value={formData.subject} onChange={handleChange} required maxLength={255} />
                                    </div>

                                    <div className="row mb-4 g-3">
                                        <div className="col-md-6">
                                            <label className="form-label text-muted small text-uppercase fw-bold">Bắt đầu lúc <span className="text-danger">*</span></label>
                                            <input type="datetime-local" className="form-control focus-ring focus-ring-info shadow-sm" name="startDate" value={formData.startDate} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label text-muted small text-uppercase fw-bold">Kết thúc lúc</label>
                                            <input type="datetime-local" className="form-control focus-ring focus-ring-info shadow-sm" name="endDate" value={formData.endDate} onChange={handleChange} />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label text-muted small text-uppercase fw-bold">Kết quả đạt được (Outcome)</label>
                                        <input type="text" className="form-control focus-ring focus-ring-info" name="outcome" value={formData.outcome} onChange={handleChange} placeholder="VD: Khách đồng ý mua..." />
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label text-muted small text-uppercase fw-bold">Mô tả chi tiết</label>
                                        <textarea className="form-control focus-ring focus-ring-info" name="description" value={formData.description} onChange={handleChange} rows={6} placeholder="Nhập nội dung trao đổi, ghi chú..."></textarea>
                                    </div>
                                </div>

                                <div className="col-lg-4">
                                    <div className="bg-light p-4 rounded-3 border shadow-sm h-100">
                                        <h6 className="text-secondary fw-bold mb-4 border-bottom pb-2">
                                            <i className="fa-solid fa-gear me-2"></i>Cài đặt & Phân loại
                                        </h6>

                                        <div className="mb-4">
                                            <label className="form-label text-muted small text-uppercase fw-bold">Tiến độ</label>
                                            <select className="form-select focus-ring focus-ring-info mb-3 shadow-sm border-white" name="status" value={formData.status} onChange={handleChange}>
                                                <option value="PLANNED">⏳ Chưa hoàn thành</option>
                                                <option value="COMPLETED">✅ Đã hoàn thành</option>
                                            </select>

                                            <div className={`p-2 border rounded shadow-sm ${formData.important ? 'bg-danger-subtle border-danger-subtle' : 'bg-white border-white'} transition-all`}>
                                                <div className="form-check form-switch fs-5 mb-0 d-flex align-items-center">
                                                    <input className="form-check-input mt-0" type="checkbox" role="switch" id="importantSwitch" name="important" checked={formData.important} onChange={handleChange} style={{ cursor: 'pointer' }} />
                                                    <label className={`form-check-label fs-6 ms-2 ${formData.important ? 'text-danger fw-bold' : 'text-muted'}`} htmlFor="importantSwitch" style={{ cursor: 'pointer' }}>Đánh dấu Quan trọng</label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label text-muted small text-uppercase fw-bold">
                                                Loại hoạt động <span className="text-danger">*</span>
                                                {isEditMode && <i className="fa-solid fa-lock text-secondary ms-1" title="Không thể đổi sau khi đã tạo"></i>}
                                            </label>
                                            <select className="form-select focus-ring focus-ring-info shadow-sm border-white" name="activityType" value={formData.activityType} onChange={handleChange} required disabled={isEditMode}>
                                                <option value="CALL">📞 Cuộc gọi với khách</option>
                                                <option value="MEETING">🤝 Cuộc gặp</option>
                                                <option value="EMAIL_QUOTE">📧 Email Báo giá</option>
                                                <option value="EMAIL_TRANS">📧 Email Giao dịch</option>
                                            </select>
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label text-muted small text-uppercase fw-bold">
                                                Người phụ trách <span className="text-danger">*</span>
                                            </label>
                                            <select className="form-select focus-ring focus-ring-info shadow-sm border-white" name="performedBy" value={formData.performedBy} onChange={handleChange} required disabled={isLocked || !isManager}>
                                                <option value="">-- Chọn nhân sự --</option>
                                                {users.map((user) => (
                                                    <option key={user.id} value={user.id.toString()}>{user.fullName || user.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label text-muted small text-uppercase fw-bold">
                                                Liên kết với <span className="text-danger">*</span>
                                            </label>
                                            <select className="form-select focus-ring focus-ring-info shadow-sm border-white mb-2" name="relatedToType" value={formData.relatedToType} onChange={(e) => { setFormData({ ...formData, relatedToType: e.target.value, relatedToId: '' }); }} required disabled={isEditMode}>
                                                <option value="CUSTOMER">🏢 Khách hàng</option>
                                                <option value="LEAD">🎯 Tiềm năng</option>
                                                <option value="CONTACT">👤 Liên hệ</option>
                                                <option value="OPPORTUNITY">💰 Cơ hội</option>
                                            </select>

                                            <select className="form-select focus-ring focus-ring-info shadow-sm border-white" name="relatedToId" value={formData.relatedToId} onChange={handleChange} required disabled={isLocked || isLoadingOptions || isEditMode}>
                                                <option value="">{isLoadingOptions ? '⏳ Đang tải dữ liệu...' : '-- Chọn đối tượng cụ thể --'}</option>
                                                {relatedOptions.map(option => {
                                                    let displayName = "";
                                                    if (option.companyName && option.contactName) {
                                                        displayName = `${option.companyName} (${option.contactName})`;
                                                    } else {
                                                        displayName = option.companyName || option.contactName || option.fullName || option.name || option.subject || option.title || `Đối tượng #${option.id}`;
                                                    }
                                                    return (
                                                        <option key={option.id} value={option.id}>
                                                            {displayName}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            <hr className="my-5 text-muted" />

                            <div className="d-flex justify-content-end gap-3">
                                <button type="button" onClick={() => router.back()} className="btn btn-light border shadow-sm px-4 text-secondary fw-medium">
                                    Hủy bỏ
                                </button>
                                {!isLocked && (
                                    <button type="submit" className="btn btn-primary px-5 shadow-sm fw-bold" disabled={isSaving}>
                                        {isSaving ? <><i className="fa-solid fa-spinner fa-spin me-2"></i>Đang lưu...</> : <><i className="fa-solid fa-floppy-disk me-2"></i>{isEditMode ? 'Cập nhật thay đổi' : 'Lưu hoạt động'}</>}
                                    </button>
                                )}
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityForm;