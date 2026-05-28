"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import httpClient from '@/core/http/httpClient';
import { toast } from 'react-toastify';
import ConfirmDeleteModal from '@/shared/components/ConfirmDeleteModal/ConfirmDeleteModal';

interface INote {
    id: number;
    content: string;
    createdDate?: string; // Có dấu ? để không bắt buộc
    createdAt?: string;
    creatorName?: string;
    assignee?: {
        name: string;
    };
}
const MOCK_CONTACTS: Record<number, { id: number, name: string }[]> = {
    2: [
        { id: 1, name: "Anh Tú - Trợ lý chị Lan" },
        { id: 2, name: "Chị Hoa - Kế toán" }
    ],
    8: [
        { id: 3, name: "Nguyễn Văn Giám Đốc" },
        { id: 4, name: "Trần Trưởng Phòng IT" }
    ]
};

const TaskDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = Number(params.id);

    const [taskDetail, setTaskDetail] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<any[]>([]);


    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        subject: "",
        description: "",
        assigneeId: "",
        contactId: "",
        startDate: "",
        dueDate: "",
        priority: "MEDIUM",
        relatedToType: "",
        relatedToId: ""
    });
    const handleOpenEditModal = () => {
        // Ép kiểu thời gian 
        const formatDateTimeForInput = (dateString: string) => {
            if (!dateString) return "";
            const date = new Date(dateString);
            // Trừ đi timezone offset để hiển thị đúng giờ local trên form
            const tzOffset = date.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
            return localISOTime;
        };

        setEditFormData({
            subject: taskDetail.subject || "",
            description: taskDetail.description || "",
            assigneeId: taskDetail.assignee?.id.toString() || "",
            contactId: taskDetail.contact?.id.toString() || "",
            startDate: formatDateTimeForInput(taskDetail.startDate),
            dueDate: formatDateTimeForInput(taskDetail.dueDate),
            priority: taskDetail.priority || "MEDIUM",
            relatedToType: taskDetail.relatedToType,
            relatedToId: taskDetail.relatedToId || ""
        });

        setIsEditModalOpen(true);
    };
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await httpClient.get('/api/users');

                if (response.data && response.data.content) {
                    setUsers(response.data.content);
                } else if (Array.isArray(response.data)) {
                    setUsers(response.data);
                } else {
                    setUsers([]);
                }
            } catch (error) {
                console.error('Không thể tải danh sách nhân viên:', error);
                setUsers([]);
            }
        };

        if (isEditModalOpen) {
            fetchUsers();
        }
    }, [isEditModalOpen]);

    //State chứa danh sách Ghi chú
    const [notes, setNotes] = useState<INote[]>([]);

    const [newNoteContent, setNewNoteContent] = useState(""); // State để gõ note mới
    const [isSubmittingNote, setIsSubmittingNote] = useState(false);
    const [progress, setProgress] = useState(0);

    const [activeTab, setActiveTab] = useState('notes');
    const [histories, setHistories] = useState<any[]>([]);

    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [noteIdToDelete, setNoteIdToDelete] = useState<number | null>(null);
    const [isDeletingNote, setIsDeletingNote] = useState(false);

    useEffect(() => {
        if (taskDetail) {
            setProgress(taskDetail.progressPercent || 0);
        }
    }, [taskDetail]);

    // HÀM 1: XỬ LÝ KHI KÉO THANH TIẾN ĐỘ
    const handleProgressChange = async (newProgress: number) => {
        setProgress(newProgress);
        try {
            const newStatus = newProgress === 100 ? 'COMPLETED' : (newProgress === 0 ? 'NOT_STARTED' : 'IN_PROGRESS');

            await httpClient.patch(`/api/v1/tasks/${id}`, {
                progressPercent: newProgress,
                status: newStatus
            });

            setTaskDetail((prev: any) => ({ ...prev, progressPercent: newProgress, status: newStatus }));

        } catch (error) {
            console.error("Lỗi cập nhật tiến độ:", error);
            alert("Không thể cập nhật tiến độ lúc này!");
            setProgress(taskDetail.progressPercent || 0);
        }
    };
    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;

        if (newStatus === 'COMPLETED') {
            handleCompleteTask();
            return;
        }

        try {
            let updatedProgress = taskDetail.progressPercent;
            if (newStatus === 'NOT_STARTED') updatedProgress = 0;

            await httpClient.patch(`/api/v1/tasks/${id}`, {
                status: newStatus,
                progressPercent: updatedProgress
            });

            setTaskDetail((prev: any) => ({
                ...prev,
                status: newStatus,
                progressPercent: updatedProgress
            }));

            if (typeof setProgress === 'function') {
                setProgress(updatedProgress);
            }

        } catch (error) {
            console.error("Lỗi cập nhật trạng thái:", error);
            alert("Không thể cập nhật trạng thái lúc này!");
        }
    };
    // HÀM 2: XỬ LÝ KHI BẤM NÚT "HOÀN THÀNH"
    const handleCompleteTask = async () => {
        if (!window.confirm("Bạn có chắc chắn đánh dấu hoàn thành công việc này?")) return;

        try {
            await httpClient.patch(`/api/v1/tasks/${id}`, {
                progressPercent: 100,
                status: 'COMPLETED'
            });

            // Cập nhật lại UI cục bộ
            setProgress(100);
            setTaskDetail((prev: any) => ({ ...prev, progressPercent: 100, status: 'COMPLETED' }));
        } catch (error) {
            alert("Có lỗi xảy ra khi hoàn thành công việc!");
        }
    };

    // 2. Hàm gọi API lấy chi tiết Task
    useEffect(() => {
        const fetchDetailAndNotes = async () => {
            if (!id) return;

            try {
                setIsLoading(true);

                const [taskResponse, noteResponse, historyResponse] = await Promise.all([
                    httpClient.get(`/api/v1/tasks/${id}`),
                    httpClient.get(`/api/v1/notes?notableType=TASK&notableId=${id}`).catch(() => ({ data: [] })),
                    httpClient.get(`/api/v1/tasks/${id}/histories`)
                ]);

                setTaskDetail(taskResponse.data);

                const dbProgress = taskResponse.data.progressPercent || 0;
                setProgress(dbProgress);

                setNotes(noteResponse.data);
                setHistories(historyResponse.data);
                setError(null);

            } catch (err) {
                console.error("Lỗi khi lấy dữ liệu:", err);
                setError("Không thể tải thông tin chi tiết hoặc ghi chú.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetailAndNotes();

    }, [id, refreshTrigger]);

    // 3. Xử lý giao diện khi Đang tải hoặc Bị lỗi
    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (error || !taskDetail) {
        return (
            <div className="container py-5 text-center">
                <div className="alert alert-danger d-inline-block shadow-sm">
                    <i className="fa-solid fa-triangle-exclamation me-2"></i> {error || "Lỗi không xác định"}
                </div>
                <div className="mt-3">
                    <button className="btn btn-secondary btn-sm" onClick={() => router.back()}>Quay lại</button>
                </div>
            </div>
        );
    }
    const handleConfirmDeleteNote = async () => {
        if (!noteIdToDelete) return;

        setIsDeletingNote(true);
        try {
            await httpClient.delete(`/api/v1/notes/${noteIdToDelete}`);

            // Xóa thành công thì lọc bỏ ghi chú đó ra khỏi giao diện hiện tại
            setNotes(prevNotes => prevNotes.filter(note => note.id !== noteIdToDelete));

            setNoteIdToDelete(null);
            toast.success("Đã xóa ghi chú thành công!");
        } catch (error) {
            console.error("Lỗi khi xóa ghi chú:", error);
            toast.error("Hệ thống gặp lỗi khi xóa ghi chú.");
        } finally {
            setIsDeletingNote(false);
        }
    };

    const handleAddNote = async () => {
        if (newNoteContent.trim() === "") {
            alert("Vui lòng nhập nội dung ghi chú!");
            return;
        }

        setIsSubmittingNote(true);
        try {
            const response = await httpClient.post('/api/v1/notes', {
                notableType: "TASK",
                notableId: id,
                content: newNoteContent
            });

            const savedNote = response.data;
            setNotes([savedNote, ...notes]); // Đẩy note mới lên đầu danh sách UI
            setNewNoteContent(""); // Reset ô text về rỗng
        } catch (error) {
            alert("Có lỗi xảy ra khi lưu ghi chú!");
        } finally {
            setIsSubmittingNote(false);
        }
    };
    const isLocked = taskDetail?.status === 'COMPLETED';
    // Từ điển dịch tên trường (Field Name)
    const fieldNameDictionary: any = {
        'status': 'Trạng thái',
        'progressPercent': 'Tiến độ',
        'subject': 'Chủ đề công việc',
        'description': 'Mô tả công việc ',
        'priority': 'Độ ưu tiên',
        'assigneeId': 'Người phụ trách',
        'contactId': 'Khách hàng liên hệ',
        'startDate': 'Ngày bắt đầu',
        'dueDate': 'Hạn chót'
    };

    // Từ điển dịch giá trị trạng thái (Status Values)
    const statusDictionary: any = {
        'NOT_STARTED': 'Chưa bắt đầu',
        'IN_PROGRESS': 'Đang thực hiện',
        'DEFERRED': 'Hoãn lại',
        'COMPLETED': 'Đã xong',
        'CANCELED': 'Đã hủy'
    };

    // Hàm phiên dịch tự động
    const formatHistoryMessage = (history: any) => {
        const { fieldName, oldValue, newValue } = history;
        const fieldLabel = fieldNameDictionary[fieldName] || fieldName;

        // 1. Nếu trường bị đổi là TRẠNG THÁI
        if (fieldName === 'status') {
            const oldValVN = statusDictionary[oldValue] || oldValue;
            const newValVN = statusDictionary[newValue] || newValue;
            return <span>đã cập nhật <strong>{fieldLabel}</strong> từ <span className="text-primary fw-bold">{oldValVN}</span> thành <span className="text-primary fw-bold">{newValVN}</span></span>;
        }

        // 2. Nếu trường bị đổi là TIẾN ĐỘ
        if (fieldName === 'progressPercent') {
            return <span>đã cập nhật <strong>{fieldLabel}</strong> từ <span className="text-success fw-bold" >{oldValue}%</span> lên <span className="text-success fw-bold">{newValue}%</span></span>;
        }

        // 3. Cho các trường khác (VD: subject)
        return <span>đã cập nhật <strong>{fieldLabel}</strong> từ "{oldValue}" thành "{newValue}"</span>;
    };
    // 3. Hàm xử lý khi bấm nút Gửi/Lưu
    const handleSaveEdit = async () => {
        try {
            if (!editFormData.subject.trim()) {
                alert("Vui lòng nhập chủ đề công việc!");
                return;
            }
            // Clone dữ liệu form để dọn dẹp trước khi gửi
            const payloadToSend: any = { ...editFormData };
            if (payloadToSend.assigneeId === "") payloadToSend.assigneeId = null;
            if (payloadToSend.contactId === "") payloadToSend.contactId = null;

            await httpClient.patch(`/api/v1/tasks/${id}`, payloadToSend);

            // 1. Đóng Popup
            setIsEditModalOpen(false);
            setRefreshTrigger(prev => prev + 1);



        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            alert("Cập nhật thất bại. Vui lòng thử lại!");
        }
    };


    return (
        <div className="container-fluid py-4 bg-light min-vh-100">

            {/* 1. HEADER & THANH ĐIỀU HƯỚNG (Đã làm gọn) */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                {/* Nút Back */}
                <button
                    className="btn btn-sm btn-white border shadow-sm text-secondary rounded-circle"
                    style={{ width: '35px', height: '35px' }}
                    onClick={() => router.back()}
                >
                    <i className="fa-solid fa-arrow-left"></i>
                </button>

                {/* Cụm nút hành động */}
                <div className="d-flex gap-2">
                    {!isLocked && (
                        <>
                            <button className="btn btn-light border text-secondary shadow-sm px-3 fw-medium"
                                onClick={handleOpenEditModal}>
                                <i className="fa-solid fa-pen me-2"></i> Chỉnh sửa
                            </button>

                            <button
                                className="btn btn-success shadow-sm px-3 fw-medium"
                                onClick={handleCompleteTask}
                            >
                                <i className="fa-solid fa-check me-2"></i> Hoàn thành
                            </button>
                        </>
                    )}
                    {/* ================= MODAL CHỈNH SỬA CÔNG VIỆC ================= */}
                    {isEditModalOpen && (
                        <div
                            className="modal fade show"
                            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
                            tabIndex={-1}
                        >
                            <div className="modal-dialog modal-lg modal-dialog-centered">
                                <div className="modal-content border-0 shadow-lg">

                                    {/* Header Modal */}
                                    <div className="modal-header bg-light border-bottom-0 pb-0">
                                        <h5 className="modal-title fw-bold text-dark">
                                            <i className="fa-solid fa-pen-to-square text-primary me-2"></i>
                                            Chỉnh sửa công việc
                                        </h5>
                                        <button
                                            type="button"
                                            className="btn-close shadow-none"
                                            onClick={() => setIsEditModalOpen(false)}
                                        ></button>
                                    </div>

                                    {/* Body Modal (Form nhập liệu) */}
                                    <div className="modal-body p-4">
                                        <div className="row g-3">

                                            {/* Cột Trái: Thông tin chính */}
                                            <div className="col-md-12 mb-2">
                                                <label className="form-label fw-semibold text-secondary small mb-1">
                                                    Chủ đề công việc <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm border-secondary-subtle"
                                                    placeholder="Nhập tên công việc..."
                                                    value={editFormData.subject}
                                                    onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
                                                />
                                            </div>

                                            {/* Hàng 2: Người phụ trách & Khách hàng */}
                                            <div className="col-md-6 mb-2">
                                                <label className="form-label fw-semibold text-secondary small mb-1">Người phụ trách</label>
                                                {(() => {
                                                    // 1. Kiểm tra môi trường web
                                                    const isClient = typeof window !== 'undefined';

                                                    // 2. Mở đúng "tên tủ" là 'roles' dưới Local Storage
                                                    const rolesStorage = isClient ? localStorage.getItem('roles') : null;

                                                    let roles: string[] = [];
                                                    if (rolesStorage) {
                                                        try {
                                                            roles = JSON.parse(rolesStorage);
                                                        } catch (e) {
                                                            console.error("Lỗi đọc phân quyền", e);
                                                        }
                                                    }

                                                    const isManager = roles.includes('ADMIN') || roles.includes('MANAGER');

                                                    return (
                                                        <select
                                                            className={`form-select form-select-sm border-secondary-subtle ${!isManager ? 'bg-light text-muted cursor-not-allowed' : ''}`}
                                                            value={editFormData.assigneeId}
                                                            onChange={(e) => setEditFormData({ ...editFormData, assigneeId: e.target.value })}
                                                            disabled={!isManager}
                                                        >
                                                            <option value="">-- Chọn nhân viên --</option>
                                                            {Array.isArray(users) && users.map((user: any) => (
                                                                <option key={user.id} value={user.id}>
                                                                    {user.name || user.fullName}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    );
                                                })()}
                                            </div>

                                            {editFormData.relatedToType === 'CUSTOMER' && editFormData.relatedToId && (
                                                <div className="col-md-6 mb-2">
                                                    <label className="form-label fw-semibold text-secondary small mb-1">
                                                        <i className="fa-regular fa-address-book me-1"></i> Khách hàng liên hệ
                                                    </label>
                                                    <select
                                                        className="form-select form-select-sm border-secondary-subtle"
                                                        value={editFormData.contactId || ""}
                                                        onChange={(e) => setEditFormData({ ...editFormData, contactId: e.target.value })}
                                                    >
                                                        <option value="">-- Chọn người liên hệ --</option>
                                                        {(MOCK_CONTACTS[Number(editFormData.relatedToId)] || []).map(contact => (
                                                            <option key={contact.id} value={contact.id}>
                                                                {contact.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="form-text" style={{ fontSize: '11px' }}>
                                                        Danh sách dựa trên Khách hàng #{editFormData.relatedToId}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="col-12 mt-1">
                                                <div className="row">
                                                    <div className="col-md-4 mb-2">
                                                        <label className="form-label fw-semibold text-secondary small mb-1">Ngày bắt đầu</label>
                                                        <input
                                                            type="datetime-local"
                                                            className="form-control form-control-sm border-secondary-subtle"
                                                            value={editFormData.startDate}
                                                            onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                                                        />
                                                    </div>

                                                    <div className="col-md-4 mb-2">
                                                        <label className="form-label fw-semibold text-secondary small mb-1">Hạn chót</label>
                                                        <input
                                                            type="datetime-local"
                                                            className="form-control form-control-sm border-secondary-subtle"
                                                            value={editFormData.dueDate}
                                                            onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                                                        />
                                                    </div>

                                                    <div className="col-md-4 mb-2">
                                                        <label className="form-label fw-semibold text-secondary small mb-1">Độ ưu tiên</label>
                                                        <select
                                                            className="form-select form-select-sm border-secondary-subtle"
                                                            value={editFormData.priority}
                                                            onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                                                        >
                                                            <option value="LOW">Thấp</option>
                                                            <option value="NORMAL">Bình thường</option>
                                                            <option value="HIGH">Cao</option>
                                                            <option value="URGENT">Khẩn cấp</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-12 mt-3">
                                                <label className="form-label fw-semibold text-secondary small mb-1">Mô tả chi tiết</label>
                                                <textarea
                                                    className="form-control form-control-sm border-secondary-subtle"
                                                    rows={4}
                                                    placeholder="Ghi chú chi tiết về công việc cần thực hiện..."
                                                    value={editFormData.description}
                                                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                                ></textarea>
                                            </div>

                                        </div>
                                    </div>

                                    {/* Footer Modal */}
                                    <div className="modal-footer bg-light border-top-0 pt-2">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-light border text-dark px-3 fw-medium"
                                            onClick={() => setIsEditModalOpen(false)}
                                        >
                                            Hủy bỏ
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-primary px-4 fw-medium shadow-sm"
                                            onClick={handleSaveEdit}
                                        >
                                            <i className="fa-solid fa-floppy-disk me-2"></i> Lưu cập nhật
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* 2. NỘI DUNG CHÍNH (CHIA CỘT) */}
            <div className="row g-4">

                {/* CỘT TRÁI: THÔNG TIN CHI TIẾT */}
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0 rounded-3 mb-4">
                        <div className="card-header bg-white border-bottom p-3">
                            <h6 className="mb-0 fw-bold text-secondary"><i className="fa-solid fa-circle-info me-2"></i>THÔNG TIN CHUNG</h6>
                        </div>
                        <div className="card-body p-4">

                            {/* --- TIÊU ĐỀ TASK VỪA CHUYỂN XUỐNG ĐÂY --- */}
                            <div className="mb-4 pb-3 border-bottom">
                                <h4 className="mb-2 fw-bold text-dark">{taskDetail.subject}</h4>
                                <div className="text-muted small d-flex gap-3">
                                    <span>
                                        <i className="fa-solid fa-hashtag me-1"></i>
                                        ID: {taskDetail.id}
                                    </span>
                                    <span>
                                        <i className="fa-regular fa-calendar me-1"></i>
                                        Tạo ngày: {taskDetail.createdAt ? new Date(taskDetail.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                    </span>
                                </div>
                            </div>
                            {/* ----------------------------------------- */}

                            <div className="row g-4 mb-4">
                                {/* NGƯỜI PHỤ TRÁCH */}
                                <div className="col-md-6">
                                    <label className="text-muted small fw-semibold mb-1">Người phụ trách</label>
                                    <div className="d-flex align-items-center gap-2 text-dark fw-medium">
                                        <i className="fa-regular fa-circle-user fs-5 text-primary"></i>
                                        {taskDetail.assignee?.name || <span className="text-muted fst-italic">Chưa phân công</span>}
                                    </div>
                                </div>

                                {/* KHÁCH HÀNG (ĐỐI TƯỢNG LIÊN QUAN) */}
                                <div className="col-md-6">
                                    <label className="text-muted small fw-semibold mb-1">Công ty / Đối tượng</label>
                                    <div className="text-primary fw-medium">
                                        <i className="fa-solid fa-building me-1"></i>
                                        {taskDetail.relatedToName ? (
                                            taskDetail.relatedToName
                                        ) : taskDetail.relatedToId ? (
                                            `${taskDetail.relatedToType} #${taskDetail.relatedToId}`
                                        ) : (
                                            <span className="text-muted fst-italic">Không có</span>
                                        )}
                                    </div>
                                </div>
                                {/* TRẠNG THÁI */}
                                <div className="col-md-6">
                                    <label className="text-muted small fw-semibold mb-1">Trạng thái</label>
                                    <div>
                                        <select
                                            className={`form-select form-select-sm shadow-sm border-0 fw-medium cursor-pointer ${taskDetail.status === 'COMPLETED' ? 'bg-success text-white' :
                                                taskDetail.status === 'IN_PROGRESS' ? 'bg-primary text-white' :
                                                    taskDetail.status === 'DEFERRED' ? 'bg-warning text-dark' :
                                                        taskDetail.status === 'CANCELLED' ? 'bg-danger text-white' :
                                                            'bg-secondary text-white'
                                                }`}
                                            style={{ width: 'fit-content' }}
                                            value={taskDetail.status || 'NOT_STARTED'}
                                            onChange={handleStatusChange}
                                            disabled={isLocked}
                                        >
                                            <option value="NOT_STARTED" className="bg-white text-dark">Chưa bắt đầu</option>
                                            <option value="IN_PROGRESS" className="bg-white text-dark">Đang thực hiện</option>
                                            <option value="DEFERRED" className="bg-white text-dark">Hoãn lại</option>
                                            <option value="COMPLETED" className="bg-white text-dark">Đã xong</option>
                                            <option value="CANCELED" className="bg-white text-dark">Đã hủy</option>


                                        </select>
                                    </div>
                                </div>
                                {/* NGƯỜI LIÊN HỆ */}
                                <div className="col-md-6">
                                    <label className="text-muted small fw-semibold mb-1">Người liên hệ</label>
                                    <div className="text-info fw-medium">
                                        <i className="fa-regular fa-address-book me-1"></i>
                                        {taskDetail.contactName ? (
                                            taskDetail.contactName
                                        ) : taskDetail.contactId ? (
                                            `ID Liên hệ: ${taskDetail.contactId}`
                                        ) : (
                                            <span className="text-muted fst-italic">Không có</span>
                                        )}
                                    </div>
                                </div>

                                {/* THỜI GIAN BẮT ĐẦU */}
                                <div className="col-md-6">
                                    <label className="text-muted small fw-semibold mb-1">Thời gian bắt đầu</label>
                                    <div className="text-dark">
                                        <i className="fa-regular fa-clock me-1 text-success"></i>
                                        {taskDetail.startDate ? new Date(taskDetail.startDate).toLocaleString('vi-VN') : 'Chưa thiết lập'}
                                    </div>
                                </div>

                                {/* HẠN CHÓT */}
                                <div className="col-md-6">
                                    <label className="text-muted small fw-semibold mb-1">Hạn chót (Deadline)</label>
                                    <div className="text-dark fw-bold">
                                        <i className="fa-solid fa-flag-checkered me-1 text-danger"></i>
                                        {taskDetail.dueDate ? new Date(taskDetail.dueDate).toLocaleString('vi-VN') : 'Không có hạn'}
                                    </div>
                                </div>


                                {/* THANH KÉO TIẾN ĐỘ */}
                                <div className="col-12 mt-3 pt-3 border-top">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label className="text-muted small fw-semibold mb-0">Tiến độ thực hiện</label>
                                        <span className="badge bg-primary rounded-pill">{progress}%</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        {/* Thanh kéo Slider (Mờ đi nếu đã hoàn thành) */}
                                        <input
                                            type="range"
                                            className={`form-range ${isLocked ? 'opacity-50' : ''}`} // Làm mờ nếu bị khóa
                                            min="0"
                                            max="100"
                                            step="10"
                                            value={progress}
                                            disabled={isLocked} // KHÓA CỨNG Ở ĐÂY
                                            onChange={(e) => setProgress(Number(e.target.value))}
                                            onMouseUp={(e) => handleProgressChange(Number((e.target as HTMLInputElement).value))}
                                        />

                                        {/* Hiển thị dòng thông báo cho Sale biết */}
                                        {isLocked && (
                                            <div className="text-danger small mt-2 fw-semibold">
                                                <i className="fa-solid fa-lock me-1"></i> Công việc đã đóng, không thể thay đổi dữ liệu.
                                            </div>
                                        )}
                                    </div>
                                    {taskDetail?.status === 'COMPLETED' && (
                                        <small className="text-success mt-1 d-block">
                                            <i className="fa-solid fa-check-circle me-1"></i> Công việc đã hoàn thành.
                                        </small>
                                    )}
                                </div>

                                {/* ĐỘ ƯU TIÊN */}
                                <div className="col-md-6">
                                    <label className="text-muted small fw-semibold mb-1">Độ ưu tiên</label>
                                    <div>
                                        {taskDetail.priority === 'URGENT' ? (
                                            <span className="badge px-3 py-2 rounded-pill border bg-danger bg-opacity-25 text-danger border-danger fw-bold">
                                                <i className="fa-solid fa-triangle-exclamation fa-beat-fade me-1"></i> 🚨 Khẩn cấp
                                            </span>
                                        ) : taskDetail.priority === 'HIGH' ? (
                                            <span className="badge px-3 py-2 rounded-pill border bg-warning bg-opacity-10 border-warning text-dark">
                                                🔥 Cao
                                            </span>
                                        ) : taskDetail.priority === 'NORMAL' ? (
                                            <span className="badge px-3 py-2 rounded-pill border bg-info bg-opacity-10 text-info border-info">
                                                ⚡ Bình thường
                                            </span>
                                        ) : (
                                            <span className="badge px-3 py-2 rounded-pill border bg-secondary bg-opacity-10 text-secondary border-secondary">
                                                💤 Thấp
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <hr className="text-light" />

                            {/* MÔ TẢ CÔNG VIỆC */}
                            <div className="mt-4">
                                <label className="text-muted small fw-semibold mb-2">Mô tả công việc</label>
                                <div className="p-3 bg-light rounded text-dark" style={{ minHeight: '100px', whiteSpace: 'pre-wrap' }}>
                                    {taskDetail.description || <span className="text-muted fst-italic">Không có mô tả.</span>}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                {/* CỘT PHẢI: GHI CHÚ & LỊCH SỬ (TABS) */}
                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 rounded-3 mb-4">

                        {/* HEADER: THANH ĐIỀU HƯỚNG TABS */}
                        <div className="card-header bg-white border-bottom p-0">
                            <ul className="nav nav-tabs nav-justified" style={{ borderBottom: 'none' }}>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link border-0 py-3 fw-bold ${activeTab === 'notes' ? 'active text-primary border-bottom border-primary border-3' : 'text-secondary'}`}
                                        style={{ borderRadius: 0, backgroundColor: 'transparent' }}
                                        onClick={() => setActiveTab('notes')}
                                    >
                                        <i className="fa-regular fa-comments me-2"></i> GHI CHÚ
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link border-0 py-3 fw-bold ${activeTab === 'history' ? 'active text-primary border-bottom border-primary border-3' : 'text-secondary'}`}
                                        style={{ borderRadius: 0, backgroundColor: 'transparent' }}
                                        onClick={() => setActiveTab('history')}
                                    >
                                        <i className="fa-solid fa-clock-rotate-left me-2"></i> LỊCH SỬ
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* NỘI DUNG BODY TỰ ĐỘNG CHUYỂN ĐỔI THEO TAB */}
                        <div className="card-body p-3 bg-light" style={{ minHeight: '500px', maxHeight: '600px', overflowY: 'auto' }}>

                            {/* ============== TAB 1: GHI CHÚ (GIỮ NGUYÊN CODE CỦA DUY) ============== */}
                            {activeTab === 'notes' && (
                                <div className="slide-in">
                                    {/* 1. KHU VỰC NHẬP GHI CHÚ MỚI */}
                                    <div className="bg-white p-2 border rounded shadow-sm mb-4">
                                        <textarea
                                            className="form-control border-0 mb-2 shadow-none"
                                            rows={3}
                                            placeholder="Nội dung ghi chú ..."
                                            value={newNoteContent}
                                            onChange={(e) => setNewNoteContent(e.target.value)}
                                        ></textarea>
                                        <div className="d-flex justify-content-end border-top pt-2">
                                            <button
                                                className="btn btn-primary btn-sm rounded-pill px-4 fw-medium shadow-sm"
                                                onClick={handleAddNote}
                                            >
                                                <i className="fa-solid fa-paper-plane me-1"></i> Gửi
                                            </button>
                                        </div>
                                    </div>

                                    {/* 2. DANH SÁCH GHI CHÚ CŨ */}
                                    <div className="d-flex flex-column gap-3">
                                        {notes.length === 0 ? (
                                            <div className="text-center py-5 bg-white rounded shadow-sm border border-dashed">
                                                <i className="fa-regular fa-folder-open fs-2 mb-2 text-muted opacity-50"></i>
                                                <p className="mb-0 text-muted small fst-italic">Chưa có ghi chú nào.</p>
                                            </div>
                                        ) : (
                                            notes.map((note) => {
                                                const dateString = note.createdDate || note.createdAt;
                                                const displayDate = dateString
                                                    ? new Date(dateString).toLocaleString('vi-VN', {
                                                        hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
                                                    }) : 'Vừa xong';

                                                return (
                                                    <div key={note.id} className="bg-white p-3 rounded shadow-sm border-start border-4 border-primary position-relative">
                                                        <div className="d-flex justify-content-between align-items-center mb-1 pe-4">
                                                            <span className="fw-bold text-dark" style={{ fontSize: '13px' }}>
                                                                <i className="fa-solid fa-user-tag text-primary me-2"></i>
                                                                {note.creatorName || note.assignee?.name || 'Thành viên'}
                                                            </span>
                                                            <span className="text-muted" style={{ fontSize: '11.5px' }}>{displayDate}</span>
                                                        </div>
                                                        <p className="mb-0 text-secondary mt-2 ps-1" style={{ fontSize: '13.5px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                                            {note.content}
                                                        </p>
                                                        <button
                                                            className="btn btn-link text-danger p-0 position-absolute top-0 end-0 mt-2 me-2 opacity-50"
                                                            style={{ fontSize: '14px', textDecoration: 'none' }}
                                                            title="Xóa ghi chú"
                                                            onClick={() => setNoteIdToDelete(note.id)}
                                                        >
                                                            <i className="fa-solid fa-xmark"></i>
                                                        </button>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ============== TAB 2: LỊCH SỬ CẬP NHẬT ============== */}
                            {activeTab === 'history' && (
                                <div className="slide-in">
                                    {histories?.length === 0 ? (
                                        <div className="text-center py-5 bg-white rounded shadow-sm border border-dashed">
                                            <i className="fa-solid fa-clock-rotate-left fs-2 mb-2 text-muted opacity-50"></i>
                                            <p className="mb-0 text-muted small fst-italic">Chưa có lịch sử cập nhật nào.</p>
                                        </div>
                                    ) : (
                                        <div className="d-flex flex-column gap-3">
                                            {histories?.map((item) => (
                                                <div key={item.id} className="bg-white p-3 rounded shadow-sm border-start border-4 border-secondary position-relative">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <span className="fw-bold text-dark" style={{ fontSize: '13px' }}>
                                                            <i className="fa-solid fa-robot text-secondary me-2"></i>
                                                            {item.actorName}
                                                        </span>
                                                        <span className="text-muted" style={{ fontSize: '11.5px' }}>
                                                            {new Date(item.createdAt).toLocaleString('vi-VN', {
                                                                hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <p className="mb-0 text-dark ps-1" style={{ fontSize: '13.5px' }}>
                                                        {formatHistoryMessage(item)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
            <ConfirmDeleteModal
                open={noteIdToDelete !== null} // Mở khi noteIdToDelete có giá trị số
                onClose={() => setNoteIdToDelete(null)} // Đóng khi set về null
                onConfirm={handleConfirmDeleteNote} // Gọi hàm xóa ghi chú ở Bước 2
                loading={isDeletingNote}
                title="Xóa Ghi Chú"
                message="Bạn có chắc chắn muốn xóa ghi chú này không? Hành động này không thể hoàn tác."
                confirmLabel="Đồng ý xóa"
                cancelLabel="Hủy bỏ"
            />
        </div>
    );
};

export default TaskDetailPage;