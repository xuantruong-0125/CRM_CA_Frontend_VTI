"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { activityApi } from './api/activity.api';
import { useParams } from 'next/navigation';
import { IActivity } from './types/activity.type';
import { useRouter } from 'next/navigation';


interface Props {
    id: number;
}

interface INote {
    id: number;
    content: string;
    createdDate: string;
    createdBy: string | number | null;
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
        // Giả lập gọi API lấy chi tiết activity
        const fetchDetail = async () => {
            try {
                setIsLoading(true);


                // MOCK DATA TẠM THỜI ĐỂ LÊN UI (Bạn có thể xóa sau khi nối API)
                const data = await activityApi.getActivityById(id);
                setActivity(data);

                // Lưu ý: Nếu Backend của bạn trả về danh sách Note chung trong API detail, 
                // bạn có thể setNotes(data.notes) ở đây.
                // Tạm thời để mảng rỗng nếu chưa nối API cho phần Note
                setNotes([]);

            } catch (err: any) {
                setError('Không thể tải thông tin chi tiết hoặc Activity không tồn tại.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    // HÀM XỬ LÝ GỬI GHI CHÚ BẰNG REACT
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
        <div className="container py-5" style={{ maxWidth: '800px' }}>
            <div className="card shadow-sm border-0">
                <div className="card-header bg-info text-white py-3 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0"><i className="fa-solid fa-circle-info"></i> THÔNG TIN CHI TIẾT</h5>
                    {activity.important && <span className="badge bg-danger fs-6">Quan trọng</span>}
                </div>

                <div className="card-body p-4">
                    <div className="row">
                        <div className="col-md-8">
                            <div style={styles.labelTitle}>Chủ đề</div>
                            <div style={{ ...styles.dataContent, color: '#0d6efd', fontWeight: 'bold' }}>{activity.subject}</div>
                        </div>
                        <div className="col-md-4">
                            <div style={styles.labelTitle}>Trạng thái</div>
                            <div style={styles.dataContent}>
                                {activity.status === 'COMPLETED' ? (
                                    <span className="text-success fw-bold"><i className="fa-solid fa-check"></i> Đã hoàn thành</span>
                                ) : (
                                    <span className="text-warning text-dark fw-bold"><i className="fa-solid fa-clock"></i> Chưa hoàn thành</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-4">
                            <div style={styles.labelTitle}>Loại hoạt động</div>
                            <div style={styles.dataContent}>{activity.activityType}</div>
                        </div>
                        <div className="col-md-4">
                            <div style={styles.labelTitle}>Bắt đầu</div>
                            <div style={styles.dataContent}>{new Date(activity.startDate).toLocaleString('vi-VN')}</div>
                        </div>
                        <div className="col-md-4">
                            <div style={styles.labelTitle}>Kết thúc</div>
                            <div style={styles.dataContent}>
                                {activity.endDate ? new Date(activity.endDate).toLocaleString('vi-VN') : '---'}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div style={styles.labelTitle}>Khách hàng liên quan</div>
                            {/* Note: activity.relatedName chưa có trong JSON mẫu, mình dùng relatedToId tạm */}
                            <div style={styles.dataContent} className="text-info fw-bold">Đối tượng {activity.relatedToId} ({activity.relatedToType})</div>
                        </div>
                        <div className="col-md-6">
                            <div style={styles.labelTitle}>Người phụ trách</div>
                            <div style={styles.dataContent}>User ID: {activity.performedBy?.name || 'Chưa phân công'}</div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12">
                            <div style={styles.labelTitle}>Mô tả / Nội dung</div>
                            <div style={{ ...styles.dataContent, minHeight: '100px', whiteSpace: 'pre-wrap' }}>{activity.description}</div>
                        </div>

                        {activity.outcome && (
                            <div className="col-md-12">
                                <div style={{ ...styles.labelTitle, color: '#198754' }}>Kết quả (Outcome)</div>
                                <div style={{ ...styles.dataContent, borderLeft: '4px solid #198754' }}>{activity.outcome}</div>
                            </div>
                        )}
                    </div>

                    {/* PHẦN LỊCH SỬ GHI CHÚ */}
                    <div className="mt-4 pt-3 border-top">
                        <h6 className="text-secondary fw-bold mb-3"><i className="fa-regular fa-comments"></i> LỊCH SỬ GHI CHÚ</h6>

                        <div className="note-list bg-white rounded">
                            {/* Form nhập Note */}
                            <div className="mb-3 p-3 bg-light border rounded">
                                <textarea
                                    className="form-control border-info"
                                    rows={2}
                                    placeholder="Bạn muốn ghi chú điều gì cho hoạt động này?"
                                    value={newNoteContent}
                                    onChange={(e) => setNewNoteContent(e.target.value)}
                                ></textarea>
                                <div className="d-flex justify-content-end mt-2">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-info text-white fw-bold px-3"
                                        onClick={handleAddNote}
                                        disabled={isSubmittingNote}
                                    >
                                        {isSubmittingNote ? (
                                            <><i className="fa-solid fa-spinner fa-spin"></i> Đang gửi...</>
                                        ) : (
                                            <><i className="fa-solid fa-paper-plane"></i> Gửi ghi chú</>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Danh sách Note */}
                            {notes.length === 0 ? (
                                <div className="text-center text-muted p-3 bg-light rounded border border-dashed">
                                    Hoạt động này chưa có ghi chú nào.
                                </div>
                            ) : (
                                notes.map(note => (
                                    <div key={note.id} className="card mb-2 border-info shadow-sm" style={{ borderLeft: '4px solid #0dcaf0' }}>
                                        <div className="card-body py-2">
                                            <p className="mb-1 text-dark" style={{ whiteSpace: 'pre-wrap' }}>{note.content}</p>
                                            <div className="d-flex justify-content-between align-items-center mt-2">
                                                <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                    <i className="fa-regular fa-clock"></i> {new Date(note.createdDate).toLocaleString('vi-VN')}
                                                </small>
                                                <small className="text-primary fw-bold" style={{ fontSize: '0.8rem' }}>
                                                    User ID: {note.createdBy}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <hr />
                    <div className="d-flex justify-content-between">
                        {/* <Link href="/activity" className="btn btn-secondary">
                            <i className="fa-solid fa-arrow-left"></i> Quay lại
                        </Link> */}
                        <button className="btn btn-secondary" onClick={() => router.back()}>Quay lại</button>

                        <div className="d-flex gap-2">
                            <button onClick={handleDelete} className="btn btn-outline-danger">
                                <i className="fa-solid fa-trash"></i> Xóa
                            </button>
                            <Link href={`/activity/edit/${activity.id}`} className="btn btn-warning">
                                <i className="fa-solid fa-pen"></i> Chỉnh sửa
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ActivityDetailPage;