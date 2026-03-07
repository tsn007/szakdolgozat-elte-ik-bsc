import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { NotFoundPage } from "./components/NotFoundPage";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { LoginRoute } from "./components/LoginRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useUserQuery } from "./redux/meApi";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { setUser } from "./redux/authSlice";
import { LoadingOverlay } from "@mantine/core";
import { LandingPage } from "./components/LandingPage";
import "./css/main.css";
import { SearchLayout } from "./components/SearchLayout";
import { CardView } from "./components/CardView";
import { MapView } from "./components/MapView";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import Layout from "./components/Layout";

function App() {
    const router = createBrowserRouter([
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
            element: <Layout />,
            children: [
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
                    element: <SearchLayout />,
                    children: [
                        {
                            path: "/browse/list",
                            element: <CardView />,
                        },
                        {
                            path: "/browse/map",
                            element: <MapView />,
                        },
                    ],
                },
            ],
        },

        {
            element: <ProtectedRoute />,
            children: [],
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
