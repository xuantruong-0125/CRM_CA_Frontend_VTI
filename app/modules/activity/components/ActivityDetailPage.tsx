"use client";

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { activityApi } from '../api/activity.api';
import { useParams, useRouter } from 'next/navigation';
import { IActivity } from '../types/activity.type';
import httpClient from '@/core/http/httpClient';
import ConfirmDeleteModal from '@/shared/components/ConfirmDeleteModal/ConfirmDeleteModal';

interface INote {
    id: number;
    content: string;
    createdDate?: string;
    createdAt?: string;
    createdBy?: string | number | null;
    creatorName?: string;
    assignee?: {
        name: string;
    };
}

const ActivityDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = Number(params.id);

    // ================= STATES =================
    const [activity, setActivity] = useState<IActivity | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isManager, setIsManager] = useState(false);

    // States cho Tab Cột Phải
    const [activeTab, setActiveTab] = useState('notes');
    const [notes, setNotes] = useState<INote[]>([]);
    const [histories, setHistories] = useState<any[]>([]);

    // States thêm/xóa Note
    const [newNoteContent, setNewNoteContent] = useState("");
    const [isSubmittingNote, setIsSubmittingNote] = useState(false);
    const [noteIdToDelete, setNoteIdToDelete] = useState<number | null>(null);
    const [isDeletingNote, setIsDeletingNote] = useState(false);

    // States xóa Activity
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // ================= EFFECTS =================
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const rolesStr = localStorage.getItem('roles');
            if (rolesStr) {
                try {
                    const roles = JSON.parse(rolesStr);
                    if (roles.includes('ADMIN') || roles.includes('MANAGER')) {
                        setIsManager(true);
                    }
                } catch (e) { console.error("Lỗi đọc phân quyền", e); }
            }
        }
    }, []);

    useEffect(() => {
        const fetchDetailData = async () => {
            if (!id) return;
            try {
                setIsLoading(true);
                // GỌI SONG SONG 3 API (Chi tiết, Ghi chú, Lịch sử) 
                const [activityData, notesResponse, historyResponse] = await Promise.all([
                    activityApi.getActivityById(id),
                    httpClient.get(`/api/v1/notes?notableType=ACTIVITY&notableId=${id}`).catch(() => ({ data: [] })),
                    httpClient.get(`/api/v1/activities/${id}/histories`).catch(() => ({ data: [] }))]);

                setActivity(activityData);
                setNotes(notesResponse.data);
                setHistories(historyResponse.data || []);
                setError(null);
            } catch (err: any) {
                console.error("Lỗi tải chi tiết:", err);
                setError('Không thể tải thông tin chi tiết hoặc Activity không tồn tại.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetailData();
    }, [id, refreshTrigger]);

    // ================= HANDLERS =================
    const handleAddNote = async () => {
        if (newNoteContent.trim() === "") {
            toast.warning("Vui lòng nhập nội dung ghi chú!");
            return;
        }
        setIsSubmittingNote(true);
        try {
            const payload = {
                content: newNoteContent.trim(),
                notableType: 'ACTIVITY',
                notableId: id
            };
            const response = await httpClient.post('/api/v1/notes', payload);
            setNotes([response.data, ...notes]);
            setNewNoteContent("");
            toast.success("Thêm ghi chú thành công!");
        } catch (error) {
            toast.error("Có lỗi xảy ra khi lưu ghi chú!");
        } finally {
            setIsSubmittingNote(false);
        }
    };

    const handleConfirmDeleteNote = async () => {
        if (!noteIdToDelete) return;
        setIsDeletingNote(true);
        try {
            await httpClient.delete(`/api/v1/notes/${noteIdToDelete}`);
            setNotes(prevNotes => prevNotes.filter(note => note.id !== noteIdToDelete));
            toast.success("Đã xóa ghi chú thành công!");
        } catch (error) {
            toast.error("Hệ thống gặp lỗi khi xóa ghi chú.");
        } finally {
            setIsDeletingNote(false);
            setNoteIdToDelete(null);
        }
    };

    const handleConfirmDeleteActivity = async () => {
        setIsDeleting(true);
        try {
            await httpClient.delete(`/api/v1/activities/${id}`);
            toast.success("Đã xóa hoạt động thành công!");
            router.replace('/activity');
        } catch (error) {
            toast.error("Xóa thất bại! Vui lòng thử lại.");
        } finally {
            setIsDeleting(false);
            setOpenDeleteModal(false);
        }
    };

    // ================= UI HELPERS =================
    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'CALL': return <span className="badge bg-primary-subtle text-primary px-2 py-1"><i className="fa-solid fa-phone me-1"></i>Cuộc gọi</span>;
            case 'MEETING': return <span className="badge bg-purple-subtle text-purple px-2 py-1" style={{ color: '#6f42c1', backgroundColor: '#e2d9f3' }}><i className="fa-solid fa-users me-1"></i>Cuộc gặp</span>;
            case 'EMAIL_QUOTE': return <span className="badge bg-info-subtle text-info px-2 py-1"><i className="fa-solid fa-file-invoice-dollar me-1"></i>Báo giá</span>;
            case 'EMAIL_TRANS': return <span className="badge bg-secondary-subtle text-secondary px-2 py-1"><i className="fa-solid fa-envelope me-1"></i>Email GD</span>;
            default: return <span className="badge bg-light text-dark px-2 py-1">{type}</span>;
        }
    };

    const isLocked = activity?.status === 'COMPLETED';

    // ================= RENDER =================
    if (isLoading) return <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light"><div className="spinner-border text-primary"></div></div>;
    if (error || !activity) return <div className="container py-5 text-center"><div className="alert alert-danger d-inline-block shadow-sm"><i className="fa-solid fa-triangle-exclamation me-2"></i> {error}</div><div className="mt-3"><button className="btn btn-secondary btn-sm" onClick={() => router.back()}>Quay lại</button></div></div>;

    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
            {/* 1. HEADER CÁC NÚT ĐIỀU HƯỚNG */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <button
                    className="btn btn-sm btn-white border shadow-sm text-secondary rounded-circle"
                    style={{ width: '35px', height: '35px' }}
                    onClick={() => router.back()}
                >
                    <i className="fa-solid fa-arrow-left"></i>
                </button>

                <div className="d-flex gap-2">
                    {isManager && (
                        <button className="btn btn-white border text-danger shadow-sm px-3 fw-medium" onClick={() => setOpenDeleteModal(true)}>
                            <i className="fa-solid fa-trash-can me-2"></i> Xóa
                        </button>
                    )}
                    {!isLocked && (
                        <Link href={`/activity/edit/${activity.id}`} className="btn btn-primary shadow-sm px-3 fw-medium">
                            <i className="fa-solid fa-pen-to-square me-2"></i> Chỉnh sửa
                        </Link>
                    )}
                </div>
            </div>

            <div className="row g-4">
                {/* 2. CỘT TRÁI: THÔNG TIN CHI TIẾT */}
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0 rounded-3 mb-4">
                        <div className="card-header bg-white border-bottom p-3">
                            <h6 className="mb-0 fw-bold text-secondary"><i className="fa-solid fa-circle-info me-2"></i>THÔNG TIN CHUNG</h6>
                        </div>

                        <div className="card-body p-4">
                            {/* Tiêu đề & Thông tin cơ bản */}
                            <div className="mb-4 pb-3 border-bottom">
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <h4 className="fw-bold text-dark mb-0">{activity.subject}</h4>
                                    {activity.important && <i className="fa-solid fa-star text-warning fs-5" title="Quan trọng"></i>}
                                </div>
                                <div className="text-muted small d-flex gap-3">
                                    <span><i className="fa-solid fa-hashtag me-1"></i>ID: {activity.id}</span>
                                    <span><i className="fa-regular fa-calendar me-1"></i>Tạo ngày: {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                                </div>
                            </div>

                            <div className="row g-4 mb-4">
                                {/* Hàng 1 */}
                                <div className="col-md-6">
                                    <label className="text-muted small fw-semibold mb-1">Người phụ trách</label>
                                    <div className="d-flex align-items-center gap-2 text-dark fw-medium">
                                        <i className="fa-regular fa-circle-user fs-5 text-primary"></i>
                                        {activity.performedBy?.name || <span className="text-muted fst-italic">Chưa phân công</span>}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="text-muted small fw-semibold mb-1">Công ty / Đối tượng</label>
                                    <div className="text-primary fw-medium">
                                        <i className="fa-solid fa-building me-1"></i>
                                        {activity.relatedToId ? `Khách hàng #${activity.relatedToId}` : <span className="text-muted fst-italic">Không có</span>}
                                    </div>
                                </div>

                                {/* Hàng 2 */}
                                <div className="col-md-6">
                                    <label className="text-muted small fw-semibold mb-1">Trạng thái</label>
                                    <div>
                                        <span className={`badge px-3 py-2 rounded-pill shadow-sm ${isLocked ? 'bg-success text-white' : 'bg-warning text-dark'}`}>
                                            <i className={`fa-solid ${isLocked ? 'fa-check-circle' : 'fa-clock'} me-1`}></i>
                                            {isLocked ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                                        </span>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="text-muted small fw-semibold mb-1">Loại hoạt động</label>
                                    <div>{getTypeBadge(activity.activityType)}</div>
                                </div>

                                {/* Hàng 3 (Thời gian) */}
                                <div className="col-md-6">
                                    <label className="text-muted small fw-semibold mb-1">Bắt đầu</label>
                                    <div className="text-dark">
                                        <i className="fa-regular fa-clock me-1 text-success"></i>
                                        {activity.startDate ? new Date(activity.startDate).toLocaleString('vi-VN') : '---'}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="text-muted small fw-semibold mb-1">Kết thúc (Dự kiến)</label>
                                    <div className="text-dark fw-bold">
                                        <i className="fa-solid fa-flag-checkered me-1 text-danger"></i>
                                        {activity.endDate ? new Date(activity.endDate).toLocaleString('vi-VN') : '---'}
                                    </div>
                                </div>
                            </div>

                            <hr className="text-light" />

                            {/* Mô tả */}
                            <div className="mt-4">
                                <label className="text-muted small fw-semibold mb-2">Mô tả / Nội dung chi tiết</label>
                                <div className="p-3 bg-light rounded text-dark" style={{ minHeight: '100px', whiteSpace: 'pre-wrap' }}>
                                    {activity.description || <span className="text-muted fst-italic">Không có mô tả.</span>}
                                </div>
                            </div>

                            {/* Kết quả */}
                            {activity.outcome && (
                                <div className="mt-4">
                                    <label className="text-success small fw-semibold mb-2">Kết quả đạt được (Outcome)</label>
                                    <div className="p-3 bg-success-subtle border border-success-subtle text-success-dark rounded fw-medium">
                                        <i className="fa-solid fa-bullseye me-2"></i>{activity.outcome}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. CỘT PHẢI: GHI CHÚ & LỊCH SỬ (TABS) */}
                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 rounded-3 mb-4">
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

                        <div className="card-body p-3 bg-light" style={{ minHeight: '500px', maxHeight: '600px', overflowY: 'auto' }}>
                            {/* TAB 1: GHI CHÚ */}
                            {activeTab === 'notes' && (
                                <div className="slide-in">
                                    <div className="bg-white p-2 border rounded shadow-sm mb-4">
                                        <textarea
                                            className="form-control border-0 mb-2 shadow-none"
                                            rows={3}
                                            placeholder="Cập nhật tiến độ..."
                                            value={newNoteContent}
                                            onChange={(e) => setNewNoteContent(e.target.value)}
                                        ></textarea>
                                        <div className="d-flex justify-content-end border-top pt-2">
                                            <button className="btn btn-primary btn-sm rounded-pill px-4 fw-medium shadow-sm" onClick={handleAddNote} disabled={isSubmittingNote}>
                                                <i className="fa-solid fa-paper-plane me-1"></i> Gửi
                                            </button>
                                        </div>
                                    </div>

                                    <div className="d-flex flex-column gap-3">
                                        {notes.length === 0 ? (
                                            <div className="text-center py-5 bg-white rounded shadow-sm border border-dashed">
                                                <i className="fa-regular fa-folder-open fs-2 mb-2 text-muted opacity-50"></i>
                                                <p className="mb-0 text-muted small fst-italic">Chưa có ghi chú nào.</p>
                                            </div>
                                        ) : (
                                            notes.map((note) => {
                                                const dateString = note.createdDate || note.createdAt;
                                                return (
                                                    <div key={note.id} className="bg-white p-3 rounded shadow-sm border-start border-4 border-primary position-relative">
                                                        <div className="d-flex justify-content-between align-items-center mb-1 pe-4">
                                                            <span className="fw-bold text-dark" style={{ fontSize: '13px' }}>
                                                                <i className="fa-solid fa-user-tag text-primary me-2"></i>
                                                                {note.creatorName || note.assignee?.name || 'Thành viên'}
                                                            </span>
                                                            <span className="text-muted" style={{ fontSize: '11.5px' }}>
                                                                {dateString ? new Date(dateString).toLocaleString('vi-VN') : 'Vừa xong'}
                                                            </span>
                                                        </div>
                                                        <p className="mb-0 text-secondary mt-2 ps-1" style={{ fontSize: '13.5px', whiteSpace: 'pre-wrap' }}>{note.content}</p>
                                                        <button
                                                            className="btn btn-link text-danger p-0 position-absolute top-0 end-0 mt-2 me-2 opacity-50"
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

                            {/* TAB 2: LỊCH SỬ */}
                            {activeTab === 'history' && (
                                <div className="slide-in">
                                    {histories?.length === 0 ? (
                                        <div className="text-center py-5 bg-white rounded shadow-sm border border-dashed">
                                            <i className="fa-solid fa-clock-rotate-left fs-2 mb-2 text-muted opacity-50"></i>
                                            <p className="mb-0 text-muted small fst-italic">Chưa có lịch sử cập nhật nào.</p>
                                            <p className="text-muted" style={{ fontSize: '11px' }}></p>
                                        </div>
                                    ) : (
                                        <div className="d-flex flex-column gap-3">
                                            {histories.map((item: any) => (
                                                <div key={item.id} className="bg-white p-3 rounded shadow-sm border-start border-4 border-secondary position-relative">
                                                    Cập nhật bởi {item.actorName || 'Hệ thống'}
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

            {/* MODALS XÁC NHẬN XÓA */}
            <ConfirmDeleteModal
                open={noteIdToDelete !== null}
                onClose={() => setNoteIdToDelete(null)}
                onConfirm={handleConfirmDeleteNote}
                loading={isDeletingNote}
                title="Xóa Ghi Chú"
                message="Bạn có chắc chắn muốn xóa ghi chú này không?"
                confirmLabel="Đồng ý xóa"
                cancelLabel="Hủy bỏ"
            />

            <ConfirmDeleteModal
                open={openDeleteModal}
                onClose={() => setOpenDeleteModal(false)}
                onConfirm={handleConfirmDeleteActivity}
                loading={isDeleting}
                title="Xóa Hoạt động"
                message={`Hành động này sẽ xóa vĩnh viễn hoạt động #${id}. Bạn có chắc chắn không?`}
                confirmLabel="Đồng ý xóa"
                cancelLabel="Hủy bỏ"
            />
        </div>
    );
};

export default ActivityDetailPage;