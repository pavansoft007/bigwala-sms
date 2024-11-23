import { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";

function Home() {
    const url = import.meta.env.VITE_API_URL;
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        axiosInstance
            .get<{ message: string }>("/testing")
            .then((res) => setMessage(res.data.message))
            .catch((e) => {
                console.error(e);
                setMessage("Failed to fetch the message.");
            });
    }, []);

    return (
        <div>
            <h1>Welcome to the Home Page</h1>
            <p>API URL: {url}</p>
            <p>Message: {message || "Loading..."}</p>
        </div>
    );
}

export default Home;
