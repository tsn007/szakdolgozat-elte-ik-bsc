import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { NotFoundPage } from "./components/NotFoundPage";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { LoginRoute } from "./components/LoginRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Home } from "./components/Home";
import { useUserQuery } from "./redux/meApi";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { setUser } from "./redux/authSlice";
import { LoadingOverlay } from "@mantine/core";
import { LandingPage } from "./components/LandingPage";
import "./css/main.css";

function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: (
                <LoginRoute>
                    <LandingPage />
                </LoginRoute>
            ),
            errorElement: <NotFoundPage />,
        },
        {
            path: "/login",
            element: (
                <LoginRoute>
                    <Login />
                </LoginRoute>
            ),
        },
        {
            path: "/register",
            element: (
                <LoginRoute>
                    <Register />
                </LoginRoute>
            ),
        },

        {
            element: <ProtectedRoute />,
            children: [
                {
                    path: "/home",
                    element: <Home />,
                },
            ],
        },
    ]);

    const { data, isLoading } = useUserQuery();
    const dispatch = useDispatch();

    useEffect(() => {
        if (data) {
            dispatch(setUser(data.user));
        }
    }, [data, dispatch]);

    if (isLoading) {
        return <LoadingOverlay zIndex={1000} overlayProps={{ blur: 2 }} />;
    }

    return <RouterProvider router={router} />;
}

export default App;
