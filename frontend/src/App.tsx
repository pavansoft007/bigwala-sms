import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Students from "./pages/Students.tsx";
import Teachers from "./pages/Teacher.tsx";
import Settings from "./pages/Settings.tsx";
import NotFound from "./pages/NotFound";

function App() {
    return (
        <div>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />}>
                    <Route path="students" element={<Students />} />
                    <Route path="teachers" element={<Teachers />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    );
}

export default App;