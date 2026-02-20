import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { Navigate, ScrollRestoration, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace/>;
    }

    return (
        <>
            <ScrollRestoration/>
            <Outlet/>
        </>
    );
};
