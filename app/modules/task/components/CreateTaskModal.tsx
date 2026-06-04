"use client";
import React, { useState, useEffect } from 'react';
import httpClient from '@/core/http/httpClient';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface CreateTaskModalProps {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ show, onClose, onSuccess }) => {

    // 1. CÁC STATE QUẢN LÝ DỮ LIỆU TỪ API
    const [users, setUsers] = useState<any[]>([]);
    const [relatedOptions, setRelatedOptions] = useState<any[]>([]); // Chứa danh sách Lead/Customer/Deal
    const [customerContacts, setCustomerContacts] = useState<any[]>([]); // Chứa danh sách Contact của Khách hàng

    // 2. STATE FORM DỮ LIỆU
    const [formData, setFormData] = useState({
        subject: "",
        description: "",
        startDate: "",
        dueDate: "",
        priority: "NORMAL",
        assignedTo: "",
        relatedToType: "LEAD", // Mặc định
        relatedToId: "",
        contactId: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingOptions, setIsLoadingOptions] = useState(false);
    // --- EFFECT 1: TẢI DANH SÁCH NHÂN VIÊN ---
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await httpClient.get('/api/users/lookup');
                const data = response.data;
                const usersList = Array.isArray(data) ? data : (data?.content || []);
                setUsers(usersList);
            } catch (error) {
                console.error('Không thể tải danh sách nhân viên:', error);
            }
        };
        if (show) fetchUsers();
    }, [show]);

    // --- EFFECT 2: TẢI DANH SÁCH ĐỐI TƯỢNG KHI ĐỔI "LOẠI ĐỐI TƯỢNG" ---
    useEffect(() => {
        const fetchRelatedOptions = async () => {
            if (!show) return;
            setIsLoadingOptions(true);
            try {
                let endpoint = '';
                if (formData.relatedToType === 'LEAD') endpoint = '/api/leads';
                else if (formData.relatedToType === 'CUSTOMER') endpoint = '/api/customers';
                else if (formData.relatedToType === 'OPPORTUNITY') endpoint = '/api/opportunities';

                if (endpoint) {
                    const response = await httpClient.get(endpoint);
                    const dataList =
                        Array.isArray(response.data) ? response.data :
                            (response.data?.data) ? response.data.data :
                                (response.data?.content) ? response.data.content :
                                    [];

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
    }, [show, formData.relatedToType]);

    // --- EFFECT 3: TẢI DANH SÁCH CONTACT KHI CHỌN "KHÁCH HÀNG" CỤ THỂ ---
    useEffect(() => {
        const fetchContacts = async () => {
            if (!show) return;

            if (formData.relatedToType === 'CUSTOMER' && formData.relatedToId) {
                try {
                    const response = await httpClient.get(`/api/v1/contacts/customer/${formData.relatedToId}`);
                    const data = response.data;
                    const contactsList = Array.isArray(data) ? data : (data?.content || data?.data || []);
                    setCustomerContacts(contactsList);
                } catch (error) {
                    console.error("Lỗi lấy danh sách liên hệ:", error);
                    setCustomerContacts([]);
                }
            } else {
                setCustomerContacts([]);
            }
        };

        fetchContacts();
    }, [show, formData.relatedToType, formData.relatedToId]);


    // --- HÀM XỬ LÝ SỰ KIỆN ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'relatedToType') {
            setFormData({ ...formData, relatedToType: value, relatedToId: "", contactId: "" });
        } else if (name === 'relatedToId') {
            setFormData({ ...formData, relatedToId: value, contactId: "" });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.subject.trim()) {
            alert("Vui lòng nhập chủ đề công việc!");
            return;
        }
        const now = new Date();

        if (formData.startDate) {
            const start = new Date(formData.startDate);
            if (start < now) {
                alert("Thời gian bắt đầu không được nhỏ hơn thời gian hiện tại!");
                return;
            }
        }
        if (formData.startDate && formData.dueDate) {
            const start = new Date(formData.startDate);
            const due = new Date(formData.dueDate);

            if (due <= start) {
                alert("Hạn chót (Deadline) phải lớn hơn thời gian bắt đầu công việc!");
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                assignedTo: formData.assignedTo ? Number(formData.assignedTo) : null,
                relatedToId: formData.relatedToId ? Number(formData.relatedToId) : null,
                contactId: formData.contactId ? Number(formData.contactId) : null,
            };

            await httpClient.post('/api/v1/tasks', payload);
            alert("Giao việc thành công!");

            setFormData({
                subject: "", description: "", startDate: "", dueDate: "",
                priority: "NORMAL", assignedTo: "", relatedToType: "LEAD", relatedToId: "", contactId: ""
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Lỗi khi tạo công việc:", error);
            alert("Có lỗi xảy ra, không thể tạo công việc.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!show) return null;

    return (
        <div
            className="d-flex justify-content-center align-items-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded shadow-lg d-flex flex-column"
                style={{ width: '100%', maxWidth: '700px', maxHeight: '95vh' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="border-bottom p-3 d-flex justify-content-between align-items-center bg-light">
                    <h5 className="fw-bold text-dark mb-0">
                        <i className="fa-solid fa-clipboard-check text-primary me-2"></i> Giao Việc Mới
                    </h5>
                    <button type="button" className="btn-close" onClick={onClose}></button>
                </div>

                <div className="p-4" style={{ overflowY: 'auto' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-label small fw-semibold text-muted">Chủ đề công việc <span className="text-danger">*</span></label>
                                <input type="text" className="form-control shadow-sm" name="subject" value={formData.subject} onChange={handleChange} placeholder="VD: Báo giá phần mềm CRM..." required />
                            </div>
                            <div className="col-6">
                                <label className="form-label small fw-semibold text-muted d-block mb-1">Ngày bắt đầu</label>
                                <DatePicker
                                    selected={formData.startDate ? new Date(formData.startDate) : null}
                                    onChange={(date: Date | null) => {
                                        if (date) {
                                            const yyyy = date.getFullYear();
                                            const mm = String(date.getMonth() + 1).padStart(2, '0');
                                            const dd = String(date.getDate()).padStart(2, '0');
                                            const hh = String(date.getHours()).padStart(2, '0');
                                            const min = String(date.getMinutes()).padStart(2, '0');
                                            setFormData({ ...formData, startDate: `${yyyy}-${mm}-${dd}T${hh}:${min}` });
                                        } else {
                                            setFormData({ ...formData, startDate: "" });
                                        }
                                    }}
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={15}
                                    timeCaption="Thời gian"
                                    dateFormat="dd/MM/yyyy HH:mm"
                                    minDate={new Date()}
                                    placeholderText="Chọn ngày giờ"
                                    className="form-control shadow-sm cursor-pointer w-100"
                                    wrapperClassName="w-100"
                                />
                            </div>

                            <div className="col-6">
                                <label className="form-label small fw-semibold text-muted d-block mb-1">Hạn chót (Deadline)</label>
                                <DatePicker
                                    selected={formData.dueDate ? new Date(formData.dueDate) : null}
                                    onChange={(date: Date | null) => {
                                        if (date) {
                                            const yyyy = date.getFullYear();
                                            const mm = String(date.getMonth() + 1).padStart(2, '0');
                                            const dd = String(date.getDate()).padStart(2, '0');
                                            const hh = String(date.getHours()).padStart(2, '0');
                                            const min = String(date.getMinutes()).padStart(2, '0');
                                            setFormData({ ...formData, dueDate: `${yyyy}-${mm}-${dd}T${hh}:${min}` });
                                        } else {
                                            setFormData({ ...formData, dueDate: "" });
                                        }
                                    }}
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={15}
                                    timeCaption="Thời gian"
                                    dateFormat="dd/MM/yyyy HH:mm"
                                    minDate={formData.startDate ? new Date(formData.startDate) : new Date()}
                                    placeholderText="Chọn hạn chót"
                                    className="form-control shadow-sm cursor-pointer w-100"
                                    wrapperClassName="w-100"
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label small fw-semibold text-muted">Độ ưu tiên</label>
                                <select className="form-select shadow-sm cursor-pointer" name="priority" value={formData.priority} onChange={handleChange}>
                                    <option value="LOW">💤 Thấp</option>
                                    <option value="NORMAL">⚡ Bình thường</option>
                                    <option value="HIGH">🔥 Cao</option>
                                    <option value="URGENT">🚨 Khẩn cấp</option>

                                </select>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label small fw-semibold text-muted">Giao cho</label>
                                {(() => {
                                    const userOptions = users.map(user => ({
                                        value: String(user.id),
                                        label: `${user.fullName || user.username} (${user.email || 'No email'})`
                                    }));

                                    const currentSelected = userOptions.find(opt => opt.value === formData.assignedTo) || null;

                                    return (
                                        <Select
                                            options={userOptions}
                                            value={currentSelected}
                                            onChange={(selectedOption) => {
                                                setFormData({
                                                    ...formData,
                                                    assignedTo: selectedOption ? selectedOption.value : ""
                                                });
                                            }}
                                            placeholder="-- Chọn hoặc gõ tìm nhân viên --"
                                            isClearable={true}
                                            noOptionsMessage={() => "❌ Không tìm thấy nhân sự phù hợp"}
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
                                                    minHeight: '38px',
                                                    cursor: 'pointer'
                                                }),
                                            }}
                                        />
                                    );
                                })()}
                            </div>

                            <div className="col-md-6">
                                <label className="form-label small fw-semibold text-muted">Loại đối tượng</label>
                                <select className="form-select shadow-sm cursor-pointer" name="relatedToType" value={formData.relatedToType} onChange={handleChange}>
                                    <option value="LEAD">Khách hàng tiềm năng (LEAD)</option>
                                    <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
                                    <option value="OPPORTUNITY">Cơ hội (OPPORTUNITY)</option>
                                </select>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label small fw-semibold text-muted">Chọn đối tượng cụ thể</label>
                                <select className="form-select shadow-sm cursor-pointer" name="relatedToId" value={formData.relatedToId} onChange={handleChange} disabled={isLoadingOptions}>
                                    <option value="">{isLoadingOptions ? 'Đang tải dữ liệu...' : '-- Vui lòng chọn --'}</option>
                                    {relatedOptions.map(option => {
                                        let displayName = "";
                                        if (option.companyName && option.contactName) {
                                            displayName = `${option.companyName} (${option.contactName})`;
                                        }
                                        else {
                                            displayName = option.companyName || option.contactName || option.fullName || option.name || `Đối tượng #${option.id}`;
                                        }
                                        return (
                                            <option key={option.id} value={option.id}>
                                                {displayName}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            {formData.relatedToType === 'CUSTOMER' && formData.relatedToId && (
                                <div className="col-md-12 mt-3 p-3 bg-info-subtle border border-info-subtle rounded">
                                    <label className="form-label small fw-semibold text-info-emphasis mb-1">
                                        <i className="fa-regular fa-address-book me-1"></i> Liên hệ trực tiếp với ai? (Tùy chọn)
                                    </label>
                                    <select className="form-select shadow-sm cursor-pointer border-info text-info-emphasis" name="contactId" value={formData.contactId} onChange={handleChange}>
                                        <option value="">-- Không cần liên hệ cụ thể --</option>
                                        {customerContacts.map(contact => (
                                            <option key={contact.id} value={contact.id}>
                                                {contact.fullName || contact.name || `Người liên hệ #${contact.id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="col-12">
                                <label className="form-label small fw-semibold text-muted">Mô tả chi tiết</label>
                                <textarea className="form-control shadow-sm" name="description" rows={3} value={formData.description} onChange={handleChange} placeholder="Nhập nội dung chi tiết công việc cần làm..."></textarea>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                            <button type="button" className="btn btn-light border text-secondary" onClick={onClose} disabled={isSubmitting}>Hủy bỏ</button>
                            <button type="submit" className="btn btn-primary px-4" disabled={isSubmitting}>
                                {isSubmitting ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fa-solid fa-save me-2"></i>} Lưu công việc
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateTaskModal;