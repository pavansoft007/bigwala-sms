import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home.tsx";
import About from "@/pages/About.tsx";
import Contact from "@/pages/Contact.tsx";
import Login from "@/pages/Login.tsx";
import Dashboard from "@/pages/dashboard/Dashboard.tsx";
import Students from "@/pages/dashboard/student/Students.tsx";
import Teachers from "@/pages/dashboard/teacher/Teacher.tsx";
import Settings from "@/pages/Settings.tsx";
import ProtectedRoute from "@/services/ProtectedRoute.tsx";
import Dashboard_main from "@/pages/dashboard/Dashboard_main.tsx";
import NotFound from "@/pages/NotFound.tsx";
import AddStudent from "@/pages/dashboard/student/AddStudent.tsx";
import StudentDetails from "@/pages/dashboard/student/StudentDetails.tsx";
import AddTeacher from "@/pages/dashboard/teacher/AddTeacher.tsx";
import Subject from "@/pages/dashboard/subjects/Subjects.tsx"
import ClassroomManagement from "@/pages/dashboard/classroom/ClassroomManagement.tsx";
import Logout from "@/pages/Logout.tsx";
import RolePanel from "@/pages/dashboard/roles/RolePanel.tsx";
import UserPanel from "@/pages/dashboard/roles/UserPanel.tsx";
import GalleryManager from '@/pages/dashboard/gallery/GalleryManager.tsx';
import BannerManagement from '@/pages/dashboard/BannerImages/BannerManagement.tsx';
import ManageCategories from "@/pages/dashboard/fee/ManageCategories";
import NoticeBoard from "@/pages/dashboard/noticeBoard/NoticeBoard.tsx";

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
                            <Route path="manage-teacher" element={<Teachers />}  />
                            <Route path=":id" element={<StudentDetails />} />
                        </Route>
                        <Route path="fee" >
                            <Route path="categories" element={<ManageCategories />} />
                        </Route>
                        <Route path="notice-board" element={<NoticeBoard />} />
                        <Route path="subjects" element={<Subject />} />
                        <Route path="roles" element={<RolePanel />} />
                        <Route path="users" element={<UserPanel />} />
                        <Route path="classroom" element={<ClassroomManagement />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="gallery" element={<GalleryManager />} />
                        <Route path="bannerImages" element={<BannerManagement />} />
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