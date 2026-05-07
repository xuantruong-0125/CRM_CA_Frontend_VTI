export interface ITask {
    id: number;
    subject: string;
    description?: string;
    status: string;
    priority: string;
    progressPercent: number;
    startDate?: string;
    dueDate?: string;
    completedAt?: string;

    assignee?: {
        id: number;
        name: string;
    };

    relatedToId?: number;
    relatedToType?: string;

    contactId?: number;
    contactName?: string;
    
    createdAt?: string;
    updatedAt?: string;
}

// Interface cho cấu trúc phân trang của Spring Boot
export interface ITaskResponse {
    content: ITask[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}