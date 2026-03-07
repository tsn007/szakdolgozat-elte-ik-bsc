import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { Navigate, useLocation } from "react-router-dom";

export function LoginRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const location = useLocation();

    const from = (location.state as { from?: Location })?.from?.pathname || "/browse/list";

    return isAuthenticated ? <Navigate to={from} replace /> : <>{children}</>;
}
