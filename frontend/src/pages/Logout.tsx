import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userDetails");

        const timer = setTimeout(() => {
            navigate("/login");
        }, 2000);


        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="flex items-center justify-center h-screen">
            <p className="text-lg font-medium">Logging you out...</p>
        </div>
    );
};

export default Logout;
