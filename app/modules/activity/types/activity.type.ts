// src/modules/activity/types/activity.type.ts

export type ActivityType = 'CALL' | 'EMAIL' | 'MEETING' | 'TASK'; // Có thể mở rộng thêm
export type ActivityStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
export type RelatedToType = 'OPPORTUNITY' | 'QUOTE' | 'CONTACT' | 'ACCOUNT';

export interface IActivity {
  id: number;
  activityType: ActivityType;
  important: boolean;
  performedBy: {
    id: number;
    name: string;
  } | null;

  relatedToId: number;
  relatedToType: RelatedToType;
  startDate: string;
  status: ActivityStatus;
  subject: string;

  description?: string | null;
  endDate?: string | null;
  outcome?: string | null;
  completedAt?: string | null;
}

export interface IActivityPayload {
    subject: string;
    activityType: string;
    startDate: string;
    relatedToType: string;
    status: string;
    important: boolean;
    
    // Lúc gửi đi thì chỉ cần gửi ID (số)
    performedBy: number; 
    relatedToId: number; 
    
    description?: string | null;
    endDate?: string | null;
    outcome?: string | null;
    completedAt?: string | null;
}
// Interface mới cho kết quả Phân trang
export interface PaginatedActivity {
  content: IActivity[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

// Nếu API trả về list trong một wrapper (ví dụ có pagination), bạn khai báo thêm ở đây
export type ActivityListResponse = IActivity[];