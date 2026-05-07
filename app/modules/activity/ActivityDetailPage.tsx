"use client";

import React, { useEffect, useState } from 'react';

import Link from 'next/link';
import { activityApi } from './api/activity.api';

import { useParams } from 'next/navigation';//xài Next.js App Router
import { IActivity } from './types/activity.type';
import { useRouter } from 'next/navigation';
import axios from 'axios';


interface Props {
    id: number;
}

interface INote {
    id: number;
    content: string;
    createdDate: string;
    createdBy: string | number | null;
    creatorName?: string;
}

const ActivityDetailPage = () => {

    const router = useRouter();
    const params = useParams();
    const id = Number(params.id);

    const [activity, setActivity] = useState<IActivity | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State cho phần Ghi chú (Notes)
    const [notes, setNotes] = useState<INote[]>([]);
    const [newNoteContent, setNewNoteContent] = useState("");
    const [isSubmittingNote, setIsSubmittingNote] = useState(false);

    useEffect(() => {
        const fetchDetailAndNotes = async () => {
            try {
                setIsLoading(true);

                // 1. Lấy thông tin chi tiết Activity
                const data = await activityApi.getActivityById(id);
                setActivity(data);

                // 2. Lấy danh sách Ghi chú (Notes) của Activity này từ Backend
                // Gọi API lấy Note và ép kiểu dữ liệu trả về theo giao diện INote
                const notesResponse = await axios.get(`http://localhost:8080/api/v1/notes/activity/${id}`);
                setNotes(notesResponse.data);

            } catch (err: any) {
                console.error("Lỗi tải chi tiết hoặc ghi chú:", err);
                setError('Không thể tải thông tin chi tiết hoặc Activity không tồn tại.');
            } finally {
                setIsLoading(false);
            }
        };

        // Chỉ gọi API khi ID đã tồn tại
        if (id) {
            fetchDetailAndNotes();
        }
    }, [id]);

    // HÀM XỬ LÝ GỬI GHI CHÚ 
    const handleAddNote = async () => {
        if (newNoteContent.trim() === "") {
            alert("Vui lòng nhập nội dung ghi chú!");
            return;
        }

        setIsSubmittingNote(true);
        try {
            const savedNote = await activityApi.addNote(id, newNoteContent);

            setNotes([savedNote, ...notes]); // Nhét note mới vào đầu mảng
            setNewNoteContent(""); // Xóa rỗng ô nhập liệu
        } catch (error) {
            alert("Có lỗi xảy ra khi lưu ghi chú!");
        } finally {
            setIsSubmittingNote(false);
        }
    };
    // Hàm xử lý xóa Note
    const handleDeleteNote = async (noteId: number) => {
        // 1. Cảnh báo người dùng trước khi xóa
        const isConfirm = window.confirm("Bạn có chắc chắn muốn xóa ghi chú này không? Hành động này không thể hoàn tác.");
        if (!isConfirm) return;

        try {
            // 2. Gọi API DELETE xuống Spring Boot
            await axios.delete(`http://localhost:8080/api/v1/notes/${noteId}`);

            // 3. Nếu Spring Boot trả về 204 (Thành công), ta lọc bỏ note đó khỏi mảng hiện tại
            // Cách này giúp giao diện mượt hơn vì không phải gọi lại API fetch danh sách
            setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));

        } catch (error) {
            console.error("Lỗi khi xóa ghi chú:", error);
            alert("Hệ thống gặp lỗi khi xóa ghi chú. Vui lòng thử lại sau.");
        }
    };

    // HÀM XỬ LÝ XÓA
    const handleDelete = async () => {
        if (window.confirm('Bạn có chắc muốn xóa hoạt động này không?')) {
            try {
                // DUY SỬA Ở ĐÂY: Truyền id vào trong một cái mảng [id]
                await activityApi.deleteActivities([id]);

                alert("Đã xóa thành công!");

                // router.push('/activity');

                router.back();
            } catch (error) {
                alert("Xóa thất bại!");
            }
        }
    };

    // Các biến CSS dùng chung
    const styles = {
        labelTitle: { color: '#6c757d', fontSize: '0.85rem', textTransform: 'uppercase' as const, fontWeight: 'bold', marginBottom: '0.2rem' },
        dataContent: { fontSize: '1rem', color: '#212529', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '5px' }
    };

    if (isLoading) return <div className="p-4 text-center">Đang tải dữ liệu...</div>;
    if (error || !activity) return <div className="p-4 text-danger">{error}</div>;

    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
            <div className="container" style={{ maxWidth: '900px' }}>

                {/* Nút Quay lại nằm ngoài Card cho thoáng */}
                <div className="mb-3">
                    <button
                        className="btn btn-sm btn-light border shadow-sm text-secondary"
                        onClick={() => router.back()} // Chỉ định rõ trang đích
                    >
                        <i className="fa-solid fa-arrow-left me-2"></i>Quay lại danh sách
                    </button>
                </div>

                <div className="card shadow-sm border-0 rounded-3">
                    {/* HEADER: Đổi sang nền trắng, chữ xanh, có viền dưới nhẹ */}
                    <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="mb-1 text-primary fw-bold">
                                <i className="fa-solid fa-briefcase me-2"></i> THÔNG TIN HOẠT ĐỘNG
                            </h5>
                            <span className="text-muted small">ID: #{activity.id}</span>
                        </div>
                        <div className="d-flex gap-2 align-items-center">
                            {activity.important && (
                                <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2 rounded-pill shadow-sm">
                                    <i className="fa-solid fa-star me-1"></i> Quan trọng
                                </span>
                            )}
                            {activity.status === 'COMPLETED' ? (
                                <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill shadow-sm">
                                    <i className="fa-solid fa-check-circle me-1"></i> Đã hoàn thành
                                </span>
                            ) : (
                                <span className="badge bg-warning-subtle text-warning-dark border border-warning-subtle px-3 py-2 rounded-pill shadow-sm">
                                    <i className="fa-solid fa-clock me-1"></i> Chưa hoàn thành
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="card-body p-4 pb-2">
                        {/* THÔNG TIN CHÍNH */}
                        <div className="row mb-4">
                            <div className="col-md-8">
                                <label className="text-muted small text-uppercase fw-bold mb-1">Chủ đề</label>
                                <div className="fs-5 text-dark fw-bold">{activity.subject}</div>
                            </div>
                            <div className="col-md-4 border-start">
                                <label className="text-muted small text-uppercase fw-bold mb-1">Loại hoạt động</label>
                                <div className="fs-6 text-dark fw-medium">
                                    <span className="badge bg-secondary px-2 py-1">{activity.activityType}</span>
                                </div>
                            </div>
                        </div>

                        <div className="row mb-4 bg-light p-3 rounded border border-light">
                            <div className="col-md-3">
                                <label className="text-muted small text-uppercase fw-bold mb-1">Bắt đầu</label>
                                <div className="text-dark fw-medium">{new Date(activity.startDate).toLocaleString('vi-VN')}</div>
                            </div>
                            <div className="col-md-3">
                                <label className="text-muted small text-uppercase fw-bold mb-1">Kết thúc</label>
                                <div className="text-dark fw-medium">{activity.endDate ? new Date(activity.endDate).toLocaleString('vi-VN') : '---'}</div>
                            </div>
                            <div className="col-md-3 border-start">
                                <label className="text-muted small text-uppercase fw-bold mb-1">Người phụ trách</label>
                                <div className="text-primary fw-bold">
                                    <i className="fa-regular fa-circle-user me-1"></i> {activity.performedBy?.name || 'Chưa phân công'}
                                </div>
                            </div>
                            <div className="col-md-3 border-start">
                                <label className="text-muted small text-uppercase fw-bold mb-1">Khách hàng</label>
                                <div className="text-info fw-bold">
                                    <i className="fa-regular fa-building me-1"></i> Đối tượng {activity.relatedToId}
                                </div>
                            </div>
                        </div>

                        {/* MÔ TẢ & KẾT QUẢ */}
                        <div className="mb-4">
                            <label className="text-muted small text-uppercase fw-bold mb-2">Mô tả / Nội dung chi tiết</label>
                            <div className="p-3 bg-white border rounded shadow-sm text-dark" style={{ minHeight: '80px', whiteSpace: 'pre-wrap' }}>
                                {activity.description || <span className="text-muted fst-italic">Không có mô tả.</span>}
                            </div>
                        </div>

                        {activity.outcome && (
                            <div className="mb-4">
                                <label className="text-success small text-uppercase fw-bold mb-2">Kết quả (Outcome)</label>
                                <div className="p-3 bg-success-subtle border border-success-subtle text-success-dark rounded fw-medium">
                                    {activity.outcome}
                                </div>
                            </div>
                        )}

                        {/* AUDIT LOG (TẠO/SỬA) */}
                        <div className="d-flex justify-content-between text-muted small border-top pt-3 mt-2">
                            <span><i className="fa-solid fa-clock me-1"></i> Tạo lúc: {activity.createdAt ? new Date(activity.createdAt).toLocaleString('vi-VN') : '---'}</span>
                            <span><i className="fa-solid fa-clock-rotate-left me-1"></i> Cập nhật: {activity.updatedAt ? new Date(activity.updatedAt).toLocaleString('vi-VN') : '---'}</span>
                        </div>
                    </div>
                </div>

                {/* PHẦN GHI CHÚ */}
                <div className="card shadow-sm border-0 rounded-3 mt-4">
                    <div className="card-header bg-white border-bottom p-3">
                        <h6 className="mb-0 fw-bold text-secondary"><i className="fa-regular fa-comments me-2"></i>LỊCH SỬ GHI CHÚ</h6>
                    </div>
                    <div className="card-body p-4 bg-light">
                        {/* Form nhập Note */}
                        <div className="mb-4 bg-white p-3 border rounded shadow-sm">
                            <textarea
                                className="form-control border-0 focus-ring focus-ring-light"
                                rows={2}
                                placeholder="Thêm ghi chú, cập nhật tiến độ cho hoạt động này..."
                                value={newNoteContent}
                                onChange={(e) => setNewNoteContent(e.target.value)}
                                style={{ resize: 'none' }}
                            ></textarea>
                            <div className="d-flex justify-content-end mt-2 pt-2 border-top">
                                <button type="button" className="btn btn-primary btn-sm px-4 rounded-pill shadow-sm" onClick={handleAddNote} disabled={isSubmittingNote}>
                                    {isSubmittingNote ? <><i className="fa-solid fa-spinner fa-spin me-1"></i> Đang gửi...</> : <><i className="fa-solid fa-paper-plane me-1"></i> Gửi ghi chú</>}
                                </button>
                            </div>
                        </div>

                        {/* Danh sách Note */}
                        <div className="d-flex flex-column gap-3">
                            {notes.length === 0 ? (
                                <div className="text-center text-muted p-4">Chưa có ghi chú nào.</div>
                            ) : (
                                notes.map(note => (
                                    <div key={note.id} className="bg-white p-3 rounded shadow-sm border-start border-4 border-primary position-relative">

                                        {/* Header của Note: Tên User, Thời gian & Nút Xóa */}
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <span className="fw-bold text-dark fs-6 text-capitalize">
                                                    <i className="fa-regular fa-user-circle text-primary me-1"></i>
                                                    {note.creatorName || `User ${note.createdBy}`}
                                                </span>
                                                <span className="text-muted small">
                                                    <i className="fa-regular fa-clock me-1"></i>
                                                    {new Date(note.createdDate).toLocaleString('vi-VN')}
                                                </span>
                                            </div>

                                            {/* Nút Xóa (Thùng rác) */}
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-link text-danger p-0 border-0"
                                                title="Xóa ghi chú"
                                                onClick={() => handleDeleteNote(note.id)}
                                            >
                                                <i className="fa-solid fa-trash-can"></i>
                                            </button>
                                        </div>

                                        {/* Nội dung Note */}
                                        <p className="mb-0 text-secondary" style={{ whiteSpace: 'pre-wrap' }}>{note.content}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* THANH HÀNH ĐỘNG (XÓA / SỬA) */}
                <div className="d-flex justify-content-end gap-3 mt-4 mb-5">
                    <button onClick={handleDelete} className="btn btn-outline-danger px-4 shadow-sm bg-white">
                        <i className="fa-solid fa-trash-can me-2"></i> Xóa hoạt động
                    </button>
                    <Link href={`/activity/edit/${activity.id}`} className="btn btn-primary px-4 shadow-sm">
                        <i className="fa-solid fa-pen-to-square me-2"></i> Chỉnh sửa thông tin
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ActivityDetailPage;