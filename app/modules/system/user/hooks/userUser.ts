// import { useEffect, useState } from "react";
// import { User, UserPayload } from "../types/user.type";
// import { getUsers } from "../useCases/getUsers";
// import { createUser } from "../useCases/createUser";
// import { updateUser } from "../useCases/updateUser";
// import { deleteUser } from "../useCases/deleteUser";

// export const useUser = () => {
//     const [data, setData] = useState<User[]>([]);
//     const [loading, setLoading] = useState(true);

//     const fetchData = async () => {
//         try {
//             setLoading(true);
//             const result = await getUsers();
//             setData(result);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchData();
//     }, []);

//     const create = async (payload: UserPayload) => {
//         await createUser(payload);
//         await fetchData();
//     };

//     const update = async (id: number, payload: UserPayload) => {
//         await updateUser(id, payload);
//         await fetchData();
//     };

//     const remove = async (id: number) => {
//         await deleteUser(id);
//         await fetchData();
//     };

//     return {
//         data,
//         loading,
//         create,
//         update,
//         remove,
//         refresh: fetchData,
//     };
// };

// import { useEffect, useState } from "react";
// import {
//     User,
//     UserPayload,
//     UserPageResponse,
// } from "../types/user.type";
// import { getUsers } from "../useCases/getUsers";
// import { createUser } from "../useCases/createUser";
// import { updateUser } from "../useCases/updateUser";
// import { deleteUser } from "../useCases/deleteUser";
// import { searchUsers } from "../useCases/searchUser";
// import type { UserFilter } from "../types/user.type";

// export const useUser = () => {
//     const [data, setData] = useState<User[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [filters, setFilters] = useState<UserFilter>({});

//     const [page, setPage] = useState(0);

//     const [pagination, setPagination] = useState({
//         page: 0,
//         size: 15,
//         totalElements: 0,
//         totalPages: 0,
//         last: true,
//     });

//     const fetchData = async (currentPage = page) => {
//         try {
//             setLoading(true);

//             const result: UserPageResponse =
//                 await getUsers(currentPage);

//             setData(result.content);

//             setPagination({
//                 page: result.page,
//                 size: result.size,
//                 totalElements: result.totalElements,
//                 totalPages: result.totalPages,
//                 last: result.last,
//             });
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchData(page);
//     }, [page]);

//     const create = async (payload: UserPayload) => {
//         await createUser(payload);
//         await fetchData(page);
//     };

//     const update = async (
//         id: number,
//         payload: UserPayload
//     ) => {
//         await updateUser(id, payload);
//         await fetchData(page);
//     };

//     const remove = async (id: number) => {
//         await deleteUser(id);

//         // Nếu xóa hết dữ liệu của trang hiện tại
//         // thì tự động quay về trang trước
//         if (data.length === 1 && page > 0) {
//             setPage(page - 1);
//         } else {
//             await fetchData(page);
//         }
//     };

//     return {
//         data,
//         loading,
//         page,
//         setPage,
//         pagination,
//         create,
//         update,
//         remove,
//         refresh: () => fetchData(page),
//     };
// };


import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    User,
    UserPayload,
    UserPageResponse,
    UserFilter,
} from "../types/user.type";

import { getUsers } from "../useCases/getUsers";
import { createUser } from "../useCases/createUser";
import { updateUser } from "../useCases/updateUser";
import { deleteUser } from "../useCases/deleteUser";
import { searchUsers } from "../useCases/searchUser";

export const useUser = () => {
    const [data, setData] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(0);

    const [filters, setFilters] = useState<UserFilter>({});

    const [pagination, setPagination] = useState({
        page: 0,
        size: 15,
        totalElements: 0,
        totalPages: 0,
        last: true,
    });

    const fetchData = async (
        currentPage = page,
        currentFilters = filters
    ) => {
        try {
            setLoading(true);

            const hasFilters =
                !!currentFilters.roleId ||
                !!currentFilters.organizationId;

            const result: UserPageResponse = hasFilters
                ? await searchUsers({
                    ...currentFilters,
                    page: currentPage,
                })
                : await getUsers(currentPage);

            setData(result.content || []);

            setPagination({
                page: result.page || 0,
                size: result.size || 15,
                totalElements: result.totalElements || 0,
                totalPages: result.totalPages || 0,
                last: result.last ?? true,
            });
        } catch (error: any) {
            console.error("Error fetching users:", error);
            toast.error(error?.message || "Không thể tải danh sách người dùng");
            setData([]);
            setPagination({
                page: 0,
                size: 15,
                totalElements: 0,
                totalPages: 0,
                last: true,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(page, filters);
    }, [page, filters]);

    const applyFilter = (
        newFilters: UserFilter
    ) => {
        setPage(0);
        setFilters(newFilters);
    };

    const clearFilter = () => {
        setPage(0);
        setFilters({});
    };

    const create = async (
        payload: UserPayload
    ) => {
        await createUser(payload);
        await fetchData(page, filters);
    };

    // const update = async (
    //     id: number,
    //     payload: UserPayload
    // ) => {
    //     await updateUser(id, payload);
    //     await fetchData(page, filters);
    // };

    const update = async (
        id: number,
        payload: UserPayload
    ): Promise<User> => {
        const res = await updateUser(id, payload); // 🔥 lấy data
        await fetchData(page, filters);
        return res; // 🔥 return lại
    };

    const remove = async (id: number) => {
        await deleteUser(id);

        if (data.length === 1 && page > 0) {
            setPage(page - 1);
        } else {
            await fetchData(page, filters);
        }
    };

    return {
        data,
        loading,
        page,
        setPage,
        pagination,
        filters,
        applyFilter,
        clearFilter,
        create,
        update,
        remove,
        refresh: () => fetchData(page, filters),
    };
};