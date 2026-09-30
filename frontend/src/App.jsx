import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Departments from "./pages/Departments";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ApplyDepartment from "./pages/ApplyDepartment";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin layout + sub-pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminDepartments from "./pages/admin/AdminDepartments";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";

// Student layout + sub-pages
import StudentLayout from "./pages/dashboard/StudentLayout";
import StudentApplications from "./pages/dashboard/StudentApplications";
import StudentAnnouncements from "./pages/dashboard/StudentAnnouncements";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes - Any authenticated user */}
        <Route
          path="/departments/:slug/apply"
          element={
            <ProtectedRoute>
              <ApplyDepartment />
            </ProtectedRoute>
          }
        />

        {/* Admin routes — nested under AdminLayout with sidebar */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="departments" element={<AdminDepartments />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
        </Route>

        {/* Student dashboard routes — nested under StudentLayout with sidebar */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentApplications />} />
          <Route path="announcements" element={<StudentAnnouncements />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;