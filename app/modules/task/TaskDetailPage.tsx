"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';

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

const TaskDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    // ÉP KIỂU SANG SỐ
    const id = Number(params.id);

    // 1. Khai báo các State cần thiết
    const [taskDetail, setTaskDetail] = useState<any>(null); // Ban đầu chưa có data thì để null
    const [isLoading, setIsLoading] = useState(true); // Trạng thái đang tải
    const [error, setError] = useState<string | null>(null); // Trạng thái lỗi



    //State chứa danh sách Ghi chú
    const [notes, setNotes] = useState<INote[]>([]);

    const [newNoteContent, setNewNoteContent] = useState(""); // State để gõ note mới
    const [isSubmittingNote, setIsSubmittingNote] = useState(false);

    // 2. Hàm gọi API lấy chi tiết Task
    useEffect(() => {
        const fetchDetailAndNotes = async () => {
            if (!id) return;

            try {
                setIsLoading(true);

                // DÙNG PROMISE.ALL ĐỂ GỌI 2 API SONG SONG CÙNG 1 LÚC
                const [taskResponse, noteResponse] = await Promise.all([
                    axios.get(`http://localhost:8080/api/v1/tasks/${id}`),
                    axios.get(`http://localhost:8080/api/v1/notes/task/${id}`)
                ]);

                // Hứng dữ liệu sau khi cả 2 API đều đã chạy xong
                setTaskDetail(taskResponse.data);
                setNotes(noteResponse.data); // Hoặc noteResponse.data.content nếu backend phân trang

                setError(null);
            } catch (err) {
                console.error("Lỗi khi lấy dữ liệu:", err);
                setError("Không thể tải thông tin chi tiết hoặc ghi chú.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetailAndNotes();

    }, [id]);

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
    const handleDeleteNote = async (noteId: number) => {
        // 1. Cảnh báo người dùng trước khi xóa (giống bên Activity)
        const isConfirm = window.confirm("Bạn có chắc chắn muốn xóa ghi chú này không? Hành động này không thể hoàn tác.");
        if (!isConfirm) return;

        try {
            // 2. Gọi API DELETE
            await axios.delete(`http://localhost:8080/api/v1/notes/${noteId}`);

            // 3. Cập nhật State (sử dụng prevNotes để đảm bảo an toàn dữ liệu)
            setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));

        } catch (error) {
            console.error("Lỗi khi xóa ghi chú:", error);
            alert("Hệ thống gặp lỗi khi xóa ghi chú. Vui lòng thử lại sau.");
        }
    };

    const handleAddNote = async () => {
        if (newNoteContent.trim() === "") {
            alert("Vui lòng nhập nội dung ghi chú!");
            return;
        }

        setIsSubmittingNote(true);
        try {
            const response = await axios.post(`http://localhost:8080/api/v1/notes`, {
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
                    <button className="btn btn-light border text-secondary shadow-sm px-3 fw-medium">
                        <i className="fa-solid fa-pen me-2"></i> Chỉnh sửa
                    </button>
                    <button className="btn btn-success shadow-sm px-3 fw-medium">
                        <i className="fa-solid fa-check me-2"></i> Hoàn thành
                    </button>
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

                                {/* KHÁCH HÀNG */}
                                <div className="col-md-6">
                                    <label className="text-muted small fw-semibold mb-1">Khách hàng liên hệ</label>
                                    <div className="text-info fw-medium">
                                        <i className="fa-regular fa-address-book me-1"></i>
                                        {taskDetail.contactId ? `ID Liên hệ: ${taskDetail.contactId}` : <span className="text-muted fst-italic">Không có</span>}
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

                                {/* TRẠNG THÁI */}
                                <div className="col-md-6">
                                    <label className="text-muted small fw-semibold mb-1">Trạng thái</label>
                                    <div>
                                        <span className={`badge px-3 py-2 rounded-pill ${taskDetail.status === 'COMPLETED' ? 'bg-success' :
                                                taskDetail.status === 'IN_PROGRESS' ? 'bg-primary' :
                                                    'bg-secondary'
                                            }`}>
                                            {taskDetail.status === 'COMPLETED' ? 'Đã xong' :
                                                taskDetail.status === 'IN_PROGRESS' ? 'Đang làm' :
                                                    'Chưa bắt đầu'}
                                        </span>
                                    </div>
                                </div>

                                {/* ĐỘ ƯU TIÊN */}
                                <div className="col-md-6">
                                    <label className="text-muted small fw-semibold mb-1">Độ ưu tiên</label>
                                    <div>
                                        <span className={`badge px-3 py-2 rounded-pill border ${taskDetail.priority === 'HIGH' ? 'bg-danger bg-opacity-10 text-danger border-danger' :
                                                taskDetail.priority === 'NORMAL' ? 'bg-info bg-opacity-10 text-info border-info' :
                                                    'bg-light text-secondary'
                                            }`}>
                                            {taskDetail.priority === 'HIGH' ? '🔥 Cao' :
                                                taskDetail.priority === 'NORMAL' ? '⚡ Bình thường' :
                                                    '💤 Thấp'}
                                        </span>
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

                {/* CỘT PHẢI: LỊCH SỬ GHI CHÚ */}
                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 rounded-3 mb-4">
                        <div className="card-header bg-white border-bottom p-3">
                            <h6 className="mb-0 fw-bold text-secondary">
                                <i className="fa-regular fa-comments me-2"></i>LỊCH SỬ CẬP NHẬT
                            </h6>
                        </div>

                        <div className="card-body p-3 bg-light">

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
                                    // Hiển thị khi trống
                                    <div className="text-center py-5 bg-white rounded shadow-sm border border-dashed">
                                        <i className="fa-regular fa-folder-open fs-2 mb-2 text-muted opacity-50"></i>
                                        <p className="mb-0 text-muted small fst-italic">Chưa có ghi chú nào.</p>
                                    </div>
                                ) : (
                                    // Hiển thị danh sách
                                    notes.map((note) => {
                                        // Xử lý ngày tháng an toàn để tránh lỗi cú pháp
                                        const dateString = note.createdDate || note.createdAt;
                                        const displayDate = dateString
                                            ? new Date(dateString).toLocaleString('vi-VN', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                day: '2-digit',
                                                month: '2-digit'
                                            })
                                            : 'Vừa xong';

                                        return (
                                            <div
                                                key={note.id}
                                                className="bg-white p-3 rounded shadow-sm border-start border-4 border-primary position-relative"
                                            >
                                                {/* Header của Note (Tên + Thời gian) */}
                                                <div className="d-flex justify-content-between align-items-center mb-1 pe-4">
                                                    <span className="fw-bold text-dark" style={{ fontSize: '13px' }}>
                                                        <i className="fa-solid fa-user-tag text-primary me-2"></i>
                                                        {note.creatorName || note.assignee?.name || 'Thành viên'}
                                                    </span>
                                                    <span className="text-muted" style={{ fontSize: '11.5px' }}>
                                                        {displayDate}
                                                    </span>
                                                </div>

                                                {/* Nội dung Note */}
                                                <p
                                                    className="mb-0 text-secondary mt-2 ps-1"
                                                    style={{ fontSize: '13.5px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}
                                                >
                                                    {note.content}
                                                </p>

                                                {/* Nút Xóa */}
                                                <button
                                                    className="btn btn-link text-danger p-0 position-absolute top-0 end-0 mt-2 me-2 opacity-50"
                                                    style={{ fontSize: '14px', textDecoration: 'none' }}
                                                    title="Xóa ghi chú"
                                                    onClick={() => handleDeleteNote(note.id)}
                                                >
                                                    <i className="fa-solid fa-xmark"></i>
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TaskDetailPage;