import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    const token = localStorage.getItem("authToken");



    if (!token) {
        return <Navigate to="/login" replace />;
    }


    return <Outlet />;
};

export default ProtectedRoute;
