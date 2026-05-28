import TaskPage from '@/modules/task/TaskPage';
// (Nhớ trỏ đúng đường dẫn import vào thư mục modules của Duy nhé)
import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "CRM_VTI | Quản lý công việc ",
    description: "Trang quản lý công việc",
};
export default function TaskRoute() {
    return <TaskPage />;
}