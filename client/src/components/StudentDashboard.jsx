import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, CreditCard, BookOpen, ChevronDown,
    ClipboardList, BarChart2, LogOut, GraduationCap
} from 'lucide-react';
import StudentRegistrationModal from './StudentRegistrationModal';

// ── Sidebar nav config ────────────────────────────────────────────────────────
const NAV = [
    { id: 'profile',    label: 'Profile',      icon: User },
    { id: 'fee',        label: 'Fee Details',  icon: CreditCard },
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

    const handleClick = () => {
        if (hasChildren) setOpen(prev => !prev);
        else onSelect(item.id);
    };

    return (
        <div>
            <button
                onClick={handleClick}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group
                    ${(active === item.id || isChildActive)
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
                <div className="flex items-center space-x-3">
                    <Icon size={18} />
                    <span>{item.label}</span>
                </div>
                {hasChildren && (
                    <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={15} />
                    </motion.div>
                )}
            </button>

            {/* Expandable children */}
            <AnimatePresence>
                {hasChildren && open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden ml-4 mt-1 space-y-1"
                    >
                        {item.children.map(child => {
                            const ChildIcon = child.icon;
                            return (
                                <button
                                    key={child.id}
                                    onClick={() => onSelect(child.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm transition-all
                                        ${active === child.id
                                            ? 'bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30'
                                            : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}
                                >
                                    <ChildIcon size={15} />
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

// ── Content Panels ────────────────────────────────────────────────────────────
const Placeholder = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center">
            <GraduationCap size={28} className="text-slate-600" />
        </div>
        <p className="text-lg font-semibold text-slate-500">{title}</p>
        <p className="text-sm text-slate-600">This section is coming soon.</p>
    </div>
);

const PANELS = {
    profile:            <Placeholder title="Profile" />,
    fee:                <Placeholder title="Fee Details" />,
    'prephd-coursework': <Placeholder title="Pre-PhD Coursework" />,
    'prephd-result':    <Placeholder title="Pre-PhD Result" />,
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const StudentDashboard = () => {
    const navigate = useNavigate();
    const [active, setActive] = useState('profile');
    const [showModal, setShowModal] = useState(false);
    const [profileChecked, setProfileChecked] = useState(false);

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
        } catch (err) {
            console.error('Profile check failed:', err);
        } finally {
            setProfileChecked(true);
        }
    };

    const logout = () => {
        localStorage.removeItem('studentEmail');
        navigate('/login/student');
    };

    if (!profileChecked) {
        return (
            <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f1117] flex text-white">
            {/* Registration modal */}
            {showModal && (
                <StudentRegistrationModal
                    email={studentEmail}
                    onComplete={() => setShowModal(false)}
                />
            )}

            {/* ── Sidebar ─────────────────────────────── */}
            <aside className="w-64 bg-[#141720] border-r border-white/5 flex flex-col min-h-screen fixed top-0 left-0 z-30">
                {/* Logo */}
                <div className="px-5 py-6 border-b border-white/5">
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                            <GraduationCap size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white leading-tight">PhD Portal</p>
                            <p className="text-xs text-slate-500 truncate max-w-[130px]">{studentEmail}</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {NAV.map(item => (
                        <SidebarItem
                            key={item.id}
                            item={item}
                            active={active}
                            onSelect={setActive}
                        />
                    ))}
                </nav>

                {/* Logout */}
                <div className="px-3 py-4 border-t border-white/5">
                    <button
                        onClick={logout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                    >
                        <LogOut size={18} />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* ── Main Content ─────────────────────────── */}
            <main className="flex-1 ml-64 min-h-screen p-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={active}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.18 }}
                        className="h-full"
                    >
                        {PANELS[active] ?? <Placeholder title={active} />}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default StudentDashboard;
