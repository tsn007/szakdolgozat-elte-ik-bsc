import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { Navigate, ScrollRestoration, Outlet } from "react-router-dom";

export const StaffRoute = () => {
    const isStaff = useSelector((state: RootState) => state.auth.user?.is_staff);

    if (!isStaff) {
        return <Navigate to="/browse/list" replace />;
    }

    return (
        <>
            <ScrollRestoration />
            <Outlet />
        </>
    );
};
