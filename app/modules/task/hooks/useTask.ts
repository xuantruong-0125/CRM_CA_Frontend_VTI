import { useState, useEffect, useCallback } from 'react';
import { taskApi } from '../api/task.api';
import { ITaskResponse } from '../types/task.type';

export const useTask = () => {
    const [tasks, setTasks] = useState<ITaskResponse>({
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<any>({}); // Chứa các param như ?status=...&page=...

    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await taskApi.getTasks(filters);
            setTasks(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Lỗi khi tải danh sách công việc');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    // Tự động gọi API mỗi khi filters thay đổi
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    return { 
        tasks, 
        isLoading, 
        error, 
        filters, 
        setFilters, 
        refetch: fetchTasks 
    };
};