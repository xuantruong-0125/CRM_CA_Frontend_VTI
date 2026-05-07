"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';


// --- DỮ LIỆU GIẢ (MOCK DATA) ĐỂ TEST GIAO DIỆN ---

const MOCK_LEADS = [
    { id: 101, name: "Công ty TNHH ABC (Lead)" },
    { id: 102, name: "Anh Hoàng - Bất động sản (Lead)" }
];

const MOCK_CUSTOMERS = [
    { id: 201, name: "Chị Lan - Đại lý cấp 1 (Khách hàng)" },
    { id: 202, name: "Công ty Cổ phần XYZ (Khách hàng)" }
];

const MOCK_DEALS = [
    { id: 301, name: "Triển khai CRM cho ABC (Cơ hội)" }
];

interface CreateTaskModalProps {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void; // Hàm gọi lại để load lại danh sách Task sau khi thêm thành công
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ show, onClose, onSuccess }) => {

    // State chứa danh sách nhân viên 
    const [users, setUsers] = useState<any[]>([]);
    // State chứa dữ liệu form, khớp 100% với JSON Backend yêu cầu
    const [formData, setFormData] = useState({
        subject: "",
        description: "",
        startDate: "",
        dueDate: "",
        priority: "NORMAL",
        assignedTo: "", // Chuỗi tạm, khi gửi sẽ ép sang số
        relatedToType: "LEAD", // Mặc định là LEAD
        relatedToId: "" // Chuỗi tạm, khi gửi sẽ ép sang số
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    // 2. useEffect gọi API lấy nhân viên khi Modal hiện lên
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Duy có thể dùng fetch như bên Activity hoặc dùng axios cho đồng bộ với phần submit
                const response = await axios.get('http://localhost:8080/api/users');
                setUsers(response.data);
            } catch (error) {
                console.error('Không thể tải danh sách nhân viên:', error);
            }
        };

        if (show) {
            fetchUsers();
        }
    }, [show]); // Mỗi lần mở Modal (show thay đổi) thì nó sẽ load lại nhân viên mới nhất

    // Hàm xử lý khi gõ vào ô input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // Nếu thay đổi Loại đối tượng, thì phải xóa trắng ID cũ đi
        if (name === 'relatedToType') {
            setFormData({ ...formData, relatedToType: value, relatedToId: "" });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Hàm lấy danh sách tùy chọn dựa vào "Loại đối tượng" đang chọn
    const getRelatedOptions = () => {
        switch (formData.relatedToType) {
            case 'LEAD': return MOCK_LEADS;
            case 'CUSTOMER': return MOCK_CUSTOMERS;
            case 'DEAL': return MOCK_DEALS;
            default: return [];
        }
    };

    // Hàm gọi API POST
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Ngăn trình duyệt reload

        // Validate sương sương
        if (!formData.subject.trim()) {
            alert("Vui lòng nhập chủ đề công việc!");
            return;
        }

        setIsSubmitting(true);
        try {
            // Ép kiểu các trường ID sang số (Number) trước khi gửi
            const payload = {
                ...formData,
                assignedTo: formData.assignedTo ? Number(formData.assignedTo) : null,
                relatedToId: formData.relatedToId ? Number(formData.relatedToId) : null,
            };

            await axios.post('http://localhost:8080/api/v1/tasks', payload);

            alert("Giao việc thành công!");

            // Reset form
            setFormData({
                subject: "", description: "", startDate: "", dueDate: "",
                priority: "NORMAL", assignedTo: "", relatedToType: "LEAD", relatedToId: ""
            });

            onSuccess(); // Báo cho TaskPage load lại bảng
            onClose(); // Đóng Modal

        } catch (error) {
            console.error("Lỗi khi tạo công việc:", error);
            alert("Có lỗi xảy ra, không thể tạo công việc.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Nếu không show thì ẩn HTML đi
    if (!show) return null;
    // Lấy danh sách options giả dựa trên loại đang chọn
    const relatedOptions = getRelatedOptions();

    return (
        // 1. LỚP PHỦ ĐEN BÊN NGOÀI (Overlay)
        <div
            className="d-flex justify-content-center align-items-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}
            onClick={onClose} // Thêm tính năng: Click ra ngoài vùng đen thì tự đóng form
        >
            {/* 2. KHUNG FORM TRẮNG BÊN TRONG */}
            <div
                className="bg-white rounded shadow-lg d-flex flex-column"
                style={{ width: '100%', maxWidth: '700px', maxHeight: '95vh' }}
                onClick={(e) => e.stopPropagation()} // Ngăn việc click vào form mà cũng bị đóng
            >
                {/* HEADER */}
                <div className="border-bottom p-3 d-flex justify-content-between align-items-center bg-light">
                    <h5 className="fw-bold text-dark mb-0">
                        <i className="fa-solid fa-clipboard-check text-primary me-2"></i> Giao Việc Mới
                    </h5>
                    <button type="button" className="btn-close" onClick={onClose}></button>
                </div>

                {/* BODY (Thêm overflow-auto để nếu form dài quá thì tự có thanh cuộn) */}
                <div className="p-4" style={{ overflowY: 'auto' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-label small fw-semibold text-muted">Chủ đề công việc <span className="text-danger">*</span></label>
                                <input type="text" className="form-control shadow-sm" name="subject" value={formData.subject} onChange={handleChange} placeholder="VD: Báo giá phần mềm CRM..." required />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label small fw-semibold text-muted">Ngày bắt đầu</label>
                                <input type="datetime-local" className="form-control shadow-sm" name="startDate" value={formData.startDate} onChange={handleChange} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-semibold text-muted">Hạn chót (Deadline)</label>
                                <input type="datetime-local" className="form-control shadow-sm" name="dueDate" value={formData.dueDate} onChange={handleChange} />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label small fw-semibold text-muted">Độ ưu tiên</label>
                                <select className="form-select shadow-sm cursor-pointer" name="priority" value={formData.priority} onChange={handleChange}>
                                    <option value="LOW">💤 Thấp</option>
                                    <option value="NORMAL">⚡ Bình thường</option>
                                    <option value="HIGH">🔥 Cao</option>
                                </select>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label small fw-semibold text-muted">Giao cho</label>
                                <select className="form-select shadow-sm cursor-pointer"
                                    name="assignedTo"
                                    value={formData.assignedTo}
                                    onChange={handleChange}>
                                    <option value="">-- Chọn nhân viên --</option>
                                    {users.length > 0 ? (
                                        users.map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.fullName || user.username || user.name}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>Đang tải danh sách...</option>
                                    )}
                                </select>
                            </div>

                            {/* CỤM ĐỐI TƯỢNG LIÊN QUAN */}
                            <div className="col-md-6">
                                <label className="form-label small fw-semibold text-muted">Loại đối tượng</label>
                                <select className="form-select shadow-sm cursor-pointer" name="relatedToType" value={formData.relatedToType} onChange={handleChange}>
                                    <option value="LEAD">Khách hàng tiềm năng (LEAD)</option>
                                    <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
                                    <option value="DEAL">Cơ hội (DEAL)</option>
                                </select>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label small fw-semibold text-muted">Chọn đối tượng cụ thể</label>
                                <select className="form-select shadow-sm cursor-pointer" name="relatedToId" value={formData.relatedToId} onChange={handleChange}>
                                    <option value="">-- Vui lòng chọn --</option>
                                    {relatedOptions.map(option => (
                                        <option key={option.id} value={option.id}>{option.name}</option>
                                    ))}
                                </select>
                            </div>

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