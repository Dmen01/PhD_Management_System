import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, CreditCard, BookOpen, ChevronDown, ClipboardList, BarChart2, LogOut, GraduationCap } from 'lucide-react';
import StudentRegistrationModal from './StudentRegistrationModal';
import StudentProfile from './StudentProfile';
import FeeDetails from './FeeDetails';

// ── Sidebar nav config ────────────────────────────────────────────────────────
const NAV = [
    { id: 'profile',  label: 'Profile',     icon: User },
    { id: 'fee',      label: 'Fee Details', icon: CreditCard },
    {
        id: 'prephd', label: 'Pre-PhD', icon: BookOpen,
        children: [
            { id: 'prephd-coursework', label: 'Pre-PhD Coursework', icon: ClipboardList },
            { id: 'prephd-result',     label: 'Pre-PhD Result',     icon: BarChart2 },
        ]
    },
];

// ── Sidebar Item ──────────────────────────────────────────────────────────────
const SidebarItem = ({ item, active, onSelect }) => {
    const [open, setOpen] = useState(false);
    const hasChildren = !!item.children;
    const Icon = item.icon;
    const isChildActive = hasChildren && item.children.some(c => c.id === active);

    return (
        <div>
            <button
                onClick={() => hasChildren ? setOpen(p => !p) : onSelect(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${(active === item.id || isChildActive)
                        ? 'bg-white/20 text-white font-semibold'
                        : 'text-blue-100/70 hover:bg-white/10 hover:text-white'}`}
            >
                <div className="flex items-center space-x-3">
                    <Icon size={17} />
                    <span>{item.label}</span>
                </div>
                {hasChildren && (
                    <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={14} />
                    </motion.div>
                )}
            </button>

            <AnimatePresence>
                {hasChildren && open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                        className="overflow-hidden ml-3 mt-0.5 space-y-0.5 pl-3 border-l border-white/20"
                    >
                        {item.children.map(child => {
                            const ChildIcon = child.icon;
                            return (
                                <button key={child.id} onClick={() => onSelect(child.id)}
                                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-all
                                        ${active === child.id
                                            ? 'bg-white/20 text-white font-semibold'
                                            : 'text-blue-100/60 hover:bg-white/10 hover:text-white'}`}
                                >
                                    <ChildIcon size={14} />
                                    <span>{child.label}</span>
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ── Placeholders ──────────────────────────────────────────────────────────────
const Placeholder = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
            <GraduationCap size={26} className="text-blue-300" />
        </div>
        <p className="text-base font-semibold text-slate-500">{title}</p>
        <p className="text-sm text-slate-400">This section is coming soon.</p>
    </div>
);

const PANELS = {
    profile:             <StudentProfile />,
    fee:                 <FeeDetails />,
    'prephd-coursework': <Placeholder title="Pre-PhD Coursework" />,
    'prephd-result':     <Placeholder title="Pre-PhD Result" />,
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const StudentDashboard = () => {
    const navigate = useNavigate();
    const [active, setActive] = useState('profile');
    const [showModal, setShowModal] = useState(false);
    const [profileChecked, setProfileChecked] = useState(false);
    const [profileData, setProfileData] = useState(null);

    const studentEmail = localStorage.getItem('studentEmail');

    useEffect(() => {
        if (!studentEmail) { navigate('/login/student'); return; }
        checkProfile();
    }, []);

    const checkProfile = async () => {
        try {
            const res = await fetch(
                `http://localhost:5001/api/student/profile?email=${encodeURIComponent(studentEmail)}`
            );
            if (res.status === 404) setShowModal(true);
            else if (res.ok) { const d = await res.json(); setProfileData(d.profile); }
        } catch (err) { console.error(err); }
        finally { setProfileChecked(true); }
    };

    const logout = () => { localStorage.removeItem('studentEmail'); navigate('/login/student'); };

    if (!profileChecked) return (
        <div className="min-h-screen bg-gradient-to-br from-[#3345cc] to-[#1a2a9e] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const firstName = profileData?.first_name || '';

    return (
        <div className="min-h-screen bg-[#f0f4ff] flex text-slate-800">
            {showModal && (
                <StudentRegistrationModal email={studentEmail} onComplete={() => { setShowModal(false); checkProfile(); }} />
            )}

            {/* ── Sidebar ─────────────────────────────── */}
            <aside className="w-60 bg-gradient-to-b from-[#3345cc] to-[#2236b8] flex flex-col min-h-screen fixed top-0 left-0 z-30 shadow-2xl shadow-blue-900/30">
                {/* Logo */}
                <div className="px-5 pt-7 pb-6">
                    <div className="flex flex-col items-center space-y-3">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
                            <GraduationCap size={28} className="text-white" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-white leading-tight">PhD Portal</p>
                            <p className="text-xs text-blue-200/70 truncate max-w-[160px] mt-0.5">{studentEmail}</p>
                        </div>
                    </div>
                </div>

                <div className="mx-4 h-px bg-white/15 mb-4" />

                {/* Nav */}
                <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                    {NAV.map(item => (
                        <SidebarItem key={item.id} item={item} active={active} onSelect={setActive} />
                    ))}
                </nav>

                {/* Logout */}
                <div className="px-3 pb-5">
                    <div className="mx-1 h-px bg-white/15 mb-3" />
                    <button onClick={logout}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm text-blue-100/70 hover:bg-red-500/20 hover:text-red-300 transition-all">
                        <LogOut size={17} />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* ── Main Content ─────────────────────────── */}
            <main className="flex-1 ml-60 min-h-screen flex flex-col">
                {/* Top welcome banner */}
                <div className="bg-gradient-to-r from-[#3345cc] to-[#4f6ef7] mx-6 mt-6 rounded-2xl p-6 flex items-center justify-between shadow-lg shadow-blue-400/20 overflow-hidden relative">
                    <div className="relative z-10">
                        <p className="text-blue-200 text-xs font-medium mb-1">
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <h1 className="text-2xl font-bold text-white">
                            {firstName ? `Welcome back, ${firstName}!` : 'Welcome back!'}
                        </h1>
                        <p className="text-blue-200/80 text-sm mt-1">Always stay updated in your student portal.</p>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute right-20 bottom-0 w-28 h-28 bg-white/5 rounded-full translate-y-1/2" />
                    <div className="relative z-10 hidden md:flex items-center justify-center w-20 h-20 bg-white/15 rounded-2xl backdrop-blur-sm">
                        <GraduationCap size={36} className="text-white" />
                    </div>
                </div>

                {/* Panel content */}
                <div className="flex-1 px-6 py-6">
                    <AnimatePresence mode="wait">
                        <motion.div key={active}
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.16 }}
                            className="h-full"
                        >
                            {PANELS[active] ?? <Placeholder title={active} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;
