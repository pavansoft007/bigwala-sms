import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Students from "./pages/Students.tsx";
import Teachers from "./pages/Teacher.tsx";
import Settings from "./pages/Settings.tsx";
import ProtectedRoute from "./services/ProtectedRoute.tsx";
import Dashboard_main from "./pages/Dashboard_main.tsx";
import NotFound from "./pages/NotFound";

function App() {
    return (
        <div>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />}>
                        <Route path="" element={<Dashboard_main />  } />
                        <Route path="students" >
                            <Route path="add" element={<Students />} />
                        </Route>
                        <Route path="teachers" element={<Teachers />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    );
}

export default App;