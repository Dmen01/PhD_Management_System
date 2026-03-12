import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentRegistrationModal from './StudentRegistrationModal';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [profileChecked, setProfileChecked] = useState(false);

    const studentEmail = localStorage.getItem('studentEmail');

    useEffect(() => {
        // Redirect to login if no session
        if (!studentEmail) {
            navigate('/login/student');
            return;
        }
        checkProfile();
    }, []);

    const checkProfile = async () => {
        try {
            const res = await fetch(
                `http://localhost:5001/api/student/profile?email=${encodeURIComponent(studentEmail)}`
            );
            // 404 = profile not yet filled → show modal
            if (res.status === 404) setShowModal(true);
        } catch (err) {
            console.error('Profile check failed:', err);
        } finally {
            setProfileChecked(true);
        }
    };

    const handleProfileComplete = () => setShowModal(false);

    if (!profileChecked) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Registration modal — non-dismissible until profile is filled */}
            {showModal && (
                <StudentRegistrationModal
                    email={studentEmail}
                    onComplete={handleProfileComplete}
                />
            )}

            {/* Dashboard layout — to be designed */}
            <div className="flex items-center justify-center min-h-screen text-slate-400 text-lg">
                Student Dashboard — coming soon
            </div>
        </div>
    );
};

export default StudentDashboard;
