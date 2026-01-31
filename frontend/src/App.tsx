import {
    createBrowserRouter,
    Navigate,
    RouterProvider,
} from "react-router-dom";
import { NotFoundPage } from "./components/NotFoundPage";
import { Login } from "./components/Login";
import { Register } from "./components/Register";

function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Navigate to="/login" replace />,
            errorElement: <NotFoundPage />,
        },
        {
            path: "/login",
            element: <Login />,
        },
        {
            path: "/register",
            element: <Register />,
        },
    ]);
    return <RouterProvider router={router} />;
}

export default App;
