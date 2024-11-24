import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/dashboard/Dashboard.tsx";
import Students from "./pages/student/Students.tsx";
import Teachers from "./pages/teacher/Teacher.tsx";
import Settings from "./pages/Settings.tsx";
import ProtectedRoute from "./services/ProtectedRoute.tsx";
import Dashboard_main from "./pages/dashboard/Dashboard_main.tsx";
import NotFound from "./pages/NotFound";
import AddStudent from "./pages/student/AddStudent.tsx";
import StudentDetails from "./pages/student/StudentDetails.tsx";
import AddTeacher from "./pages/teacher/AddTeacher.tsx";
import Logout from "./pages/Logout.tsx";

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
                            <Route path="add" element={<AddStudent />} />
                            <Route path="manage-student" element={<Students />}  />
                            <Route path=":id" element={<StudentDetails />} />
                        </Route>
                        <Route path="teachers" element={<Teachers />} />
                        <Route path="teacher" >
                            <Route path="add" element={<AddTeacher />} />
                            <Route path="manage-teacher" element={<Students />}  />
                            <Route path=":id" element={<StudentDetails />} />
                        </Route>
                        <Route path="settings" element={<Settings />} />
                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Route>
                <Route path="logout" element={<Logout />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    );
}

export default App;