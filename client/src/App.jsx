import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import AdminLogin from './components/AdminLogin';
import AdminRegister from './components/AdminRegister';
import ForgotPassword from './components/ForgotPassword';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import TeacherLogin from './components/TeacherLogin';
import TeacherRegister from './components/TeacherRegister';
import TeacherDashboard from './components/TeacherDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-white font-sans antialiased">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login/:role" element={<Login />} />
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/register/admin" element={<AdminRegister />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/login/teacher" element={<TeacherLogin />} />
          <Route path="/register/teacher" element={<TeacherRegister />} />
          <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
