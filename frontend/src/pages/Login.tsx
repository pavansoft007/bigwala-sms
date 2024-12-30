import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance.ts";

const AdminLogin = () => {
    const [email, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post("/api/admin-login", {
                email,
                password,
            });
            const { token } = response.data;
            localStorage.setItem("authToken", token);
            navigate("/dashboard");
            setError(null);
        } catch (err) {
            setError("Invalid credentials. Please try again.");
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen  flex items-center justify-center">
            <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md">
                <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-6">Admin Login</h2>
                {error && <p className="text-red-600 text-center mb-4 font-medium">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 transition-all"
                    >
                        Login
                    </button>
                </form>

                <p className="mt-6 text-sm text-gray-600 text-center">
                    Need help? <a href="#" className="text-indigo-600 hover:underline font-medium">Contact Support</a>
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
