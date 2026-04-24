import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Assignments from './pages/Assignments';
import Grades from './pages/Grades';
import Notifications from './pages/Notifications';
import Discussion from './pages/Discussion';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0b1424',
              color: '#e7f5ff',
              border: '1px solid rgba(56,189,248,0.25)',
              borderRadius: '14px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#0b1424' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#0b1424' } },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes with Navbar */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="app-layout">
                  <Navbar />
                  <main className="app-main">
                    <Routes>
                      <Route path="/dashboard"    element={<Dashboard />} />
                      <Route path="/courses"      element={<Courses />} />
                      <Route path="/courses/:id"  element={<CourseDetail />} />
                      <Route path="/assignments"  element={<Assignments />} />
                      <Route path="/grades"       element={<Grades />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/discussion"   element={<Discussion />} />
                      <Route path="/"             element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
