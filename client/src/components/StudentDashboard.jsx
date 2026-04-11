import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, CreditCard, BookOpen, ChevronDown, ClipboardList, BarChart2, LogOut, GraduationCap, Loader2, BookMarked, Users, Mail, Phone, Building2, Upload, FileText, Calendar, CheckSquare, Square, CheckCircle, ExternalLink, Lock, Bell, X, ChevronUp, Target, LayoutList } from 'lucide-react';
import StudentRegistrationModal from './StudentRegistrationModal';
import StudentProfile from './StudentProfile';
import FeeDetails from './FeeDetails';
import { StudentSacMembersPanel, StudentPhdPresentationPanel, StudentPhdLetterPanel } from './StudentPhdPanels';

// ── Reusable Notification Bell Panel ───────────────────────────────────────
const NotificationBell = ({ fetchUrl, accentColor = 'blue' }) => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [prevExpanded, setPrevExpanded] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch(fetchUrl);
            const data = await res.json();
            if (res.ok) {
                setNotifications(data.notifications);
                // Count unread: all notifications since we have no read-tracking (show total for now)
                setUnreadCount(data.notifications.length);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const togglePanel = () => {
        setOpen(o => !o);
        if (!open) loadNotifications();
    };

    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recent = notifications.filter(n => new Date(n.created_at) >= cutoff);
    const previous = notifications.filter(n => new Date(n.created_at) < cutoff);

    const colors = {
        blue: { ring: 'ring-blue-500/40', badge: 'bg-blue-500', header: 'bg-slate-900 border-blue-900/50', accent: 'text-blue-400' },
        amber: { ring: 'ring-amber-500/40', badge: 'bg-amber-500', header: 'bg-slate-900 border-amber-900/50', accent: 'text-amber-400' },
    }[accentColor];

    const NotifCard = ({ n }) => (
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-3.5 space-y-2">
            <p className="text-sm text-slate-200 leading-relaxed">{n.message}</p>
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="text-xs text-slate-500">{new Date(n.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                {n.pdf_path && (
                    <a href={`http://localhost:5001/${n.pdf_path}`} target="_blank" rel="noopener noreferrer"
                        className={`flex items-center space-x-1 text-xs ${colors.accent} hover:opacity-80 transition-opacity`}>
                        <FileText size={11} /><span>View Attachment</span><ExternalLink size={9} />
                    </a>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Bell Button */}
            <button onClick={togglePanel}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all border border-white/20">
                <Bell size={18} className="text-white" />
                {unreadCount > 0 && !open && (
                    <span className={`absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] ${colors.badge} rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1`}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Slide-in Panel */}
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
                        <motion.div
                            initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                            className={`fixed right-0 top-0 h-full w-full max-w-sm z-50 flex flex-col border-l ${colors.header} shadow-2xl`}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
                                <div className="flex items-center space-x-2">
                                    <Bell size={16} className={colors.accent} />
                                    <h2 className="text-base font-bold text-white">Notifications</h2>
                                    {notifications.length > 0 && (
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge} text-white`}>{notifications.length}</span>
                                    )}
                                </div>
                                <button onClick={() => setOpen(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {loading ? (
                                    <div className="flex items-center justify-center py-16 space-x-2 text-slate-500">
                                        <Loader2 size={20} className="animate-spin" /><span className="text-sm">Loading...</span>
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-slate-600 space-y-2">
                                        <Bell size={36} className="opacity-30" />
                                        <p className="text-sm">No notifications yet.</p>
                                    </div>
                                ) : (
                                    <>
                                        {recent.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recent — Last 7 Days</p>
                                                {recent.map(n => <NotifCard key={n.id} n={n} />)}
                                            </div>
                                        )}
                                        {previous.length > 0 && (
                                            <div className="mt-2">
                                                <button onClick={() => setPrevExpanded(p => !p)}
                                                    className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-300 font-semibold uppercase tracking-widest transition-colors w-full">
                                                    {prevExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                                    <span>Previous ({previous.length})</span>
                                                </button>
                                                <AnimatePresence>
                                                    {prevExpanded && (
                                                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                                            <div className="space-y-2 mt-2">{previous.map(n => <NotifCard key={n.id} n={n} />)}</div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

// ── Sidebar nav config is now dynamic in the component ──────────────
// ── Sidebar Item ──────────────────────────────────────────────────────────────
const SidebarItem = ({ item, active, onSelect }) => {
    const [open, setOpen] = useState(false);
    const hasChildren = !!item.children;
    const Icon = item.icon;
    const isChildActive = hasChildren && item.children.some(c => c.id === active);

    return (
        <div>
            <button
                onClick={() => {
                    if (item.locked) return;
                    hasChildren ? setOpen(p => !p) : onSelect(item.id)
                }}
                title={item.locked ? 'Locked until Admin verifies Pre-PhD result' : ''}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${item.locked ? 'text-blue-100/30 cursor-not-allowed' : (active === item.id || isChildActive)
                        ? 'bg-white/20 text-white font-semibold'
                        : 'text-blue-100/70 hover:bg-white/10 hover:text-white'}`}
            >
                <div className="flex items-center space-x-3">
                    <Icon size={17} />
                    <span>{item.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                    {item.locked && <Lock size={12} className="opacity-50" />}
                    {hasChildren && !item.locked && (
                        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown size={14} />
                        </motion.div>
                    )}
                </div>
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

// ── Pre-PhD Coursework Panel ──────────────────────────────────────────────────
const PrePhdCoursework = ({ profile }) => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCoursework = async () => {
            try {
                const res = await fetch(`http://localhost:5001/api/student/coursework?roll_no=${encodeURIComponent(profile.roll_no)}`);
                const data = await res.json();
                if (res.ok) setSubjects(data.subjects);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCoursework();
    }, [profile]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Pre-PhD Coursework</h2>
                <p className="text-slate-500 mt-1">Subjects assigned by your Mentor Teacher.</p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
                    <Loader2 className="animate-spin" size={24} />
                    <p className="text-sm">Loading curriculum...</p>
                </div>
            ) : subjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        <BookMarked size={28} className="text-slate-300" />
                    </div>
                    <p className="text-slate-600 font-medium">No Coursework Assigned</p>
                    <p className="text-sm text-slate-400 mt-1">Your mentor has not assigned subjects yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Coursework Subjects</span>
                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full">{subjects.length} Subjects</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {subjects.map((sub, idx) => (
                            <div key={sub.id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                        <span className="text-blue-600 font-bold">{idx + 1}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-800 leading-tight">{sub.subject_name}</h4>
                                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                                            Assigned by <span className="font-semibold text-slate-700">{sub.assigned_by}</span>
                                            <span className="text-slate-300">•</span> 
                                            {new Date(sub.assigned_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="shrink-0 pl-14 md:pl-0 flex items-center space-x-3">
                                    <div className="inline-flex items-center px-4 py-2 bg-slate-100 rounded-xl">
                                        <span className="text-xs text-slate-500 font-medium mr-2 uppercase tracking-wide">Credits</span>
                                        <span className="text-sm font-bold text-slate-800">{sub.credits}</span>
                                    </div>
                                    {sub.syllabus_pdf_path && (
                                        <a
                                            href={`http://localhost:5001/${sub.syllabus_pdf_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors"
                                        >
                                            <FileText size={16} className="mr-2" />
                                            <span className="text-sm font-bold">Syllabus</span>
                                            <ExternalLink size={14} className="ml-2 opacity-70" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ── My Mentors Panel ──────────────────────────────────────────────────────────
const MyMentors = ({ profile }) => {
    const [mentors, setMentors] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const res = await fetch(`http://localhost:5001/api/student/mentors?roll_no=${encodeURIComponent(profile.roll_no)}`);
                const data = await res.json();
                if (res.ok) setMentors(data.mentors);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMentors();
    }, [profile]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <Loader2 className="animate-spin" size={24} />
            <p className="text-sm">Loading mentors...</p>
        </div>
    );

    if (!mentors) return (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <Users size={28} className="text-slate-300" />
            </div>
            <p className="text-slate-600 font-medium">No Mentors Assigned</p>
            <p className="text-sm text-slate-400 mt-1">You have not been assigned to a mentor teacher yet.</p>
        </div>
    );

    const TeacherCard = ({ role, name, email, mobile, department, isMentor }) => (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div className={`px-6 py-5 border-b flex items-center justify-between ${isMentor ? 'bg-amber-50/50 border-amber-100/50' : 'bg-slate-50/50 border-slate-100'}`}>
                <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isMentor ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-600'}`}>
                        <User size={20} />
                    </div>
                    <div>
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isMentor ? 'text-amber-500' : 'text-slate-400'}`}>{role}</p>
                        <h3 className="text-lg font-bold text-slate-800 leading-tight">{name}</h3>
                    </div>
                </div>
            </div>
            <div className="p-6 flex-1 space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                        <Mail size={14} className="text-slate-400" />
                    </div>
                    <span className="text-slate-600 font-medium">{email}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                        <Phone size={14} className="text-slate-400" />
                    </div>
                    <span className="text-slate-600 font-medium">{mobile}</span>
                </div>
                {department && (
                    <div className="flex items-center space-x-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                            <Building2 size={14} className="text-slate-400" />
                        </div>
                        <span className="text-slate-600 font-medium">{department} Department</span>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">My Mentors</h2>
                <p className="text-slate-500 mt-1">Teachers assigned to assist you through your PhD program.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TeacherCard 
                    role="Mentor Teacher" 
                    name={mentors.mentor_name} 
                    email={mentors.mentor_email} 
                    mobile={mentors.mentor_mobile} 
                    department={mentors.mentor_department} 
                    isMentor={true} 
                />
                
                {mentors.assistance_name ? (
                    <TeacherCard 
                        role="Assistant Mentor" 
                        name={mentors.assistance_name} 
                        email={mentors.assistance_email} 
                        mobile={mentors.assistance_mobile} 
                        department={mentors.assistance_department} 
                        isMentor={false} 
                    />
                ) : (
                    <div className="bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center h-full min-h-[250px]">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                            <User size={20} className="text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium">No Assistant Mentor</p>
                        <p className="text-xs text-slate-400 mt-1">You are currently assigned only to a Mentor Teacher.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Pre-PhD Result Panel ──────────────────────────────────────────────────────
const PrePhdResult = ({ profile }) => {
    const [resultData, setResultData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState('');
    const [verified, setVerified] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const fetchResult = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5001/api/student/result?roll_no=${encodeURIComponent(profile.roll_no)}`);
            if (res.ok) {
                const data = await res.json();
                setResultData(data.result);
            } else if (res.status === 404) {
                setResultData(null);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResult();
    }, [profile]);

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (f.type !== 'application/pdf') { setFileError('Only PDF files are accepted'); setFile(null); return; }
        if (f.size > 2 * 1024 * 1024) { setFileError('File size must be under 2 MB'); setFile(null); return; }
        setFileError('');
        setFile(f);
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!file) return setError('Please upload a PDF result file');
        if (!verified) return setError('Please verify the document before submitting');

        const body = new FormData();
        body.append('receipt', file);
        body.append('roll_no', profile.roll_no);
        body.append('verified_by_student', 'true');

        setUploading(true); setError('');
        try {
            const res = await fetch(`http://localhost:5001/api/student/result`, { method: 'POST', body });
            const data = await res.json();
            if (res.ok) {
                fetchResult();
            } else {
                setError(data.message);
            }
        } catch { setError('Failed to connect to server'); }
        finally { setUploading(false); }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <Loader2 className="animate-spin" size={24} />
            <p className="text-sm">Loading result data...</p>
        </div>
    );

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Pre-PhD Result</h2>
                <p className="text-slate-500 mt-1">Upload and view your Pre-PhD coursework result.</p>
            </div>

            <AnimatePresence mode="wait">
                {resultData ? (
                    // View Mode
                    <motion.div key="view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm space-y-5">
                        <div className="flex items-center space-x-2 text-green-600">
                            <CheckCircle size={18} />
                            <span className="text-sm font-semibold">Pre-PhD Result Submitted</span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 flex items-start space-x-3">
                                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5"><Calendar size={15} className="text-blue-500" /></div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Submitted On</p>
                                    <p className="text-sm text-slate-800 font-semibold mt-0.5">{new Date(resultData.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 flex items-start space-x-3">
                                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5"><CheckCircle size={15} className="text-blue-500" /></div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Verified by Student</p>
                                    <p className="text-sm text-slate-800 font-semibold mt-0.5">Yes</p>
                                </div>
                            </div>
                            {/* Admin verification status */}
                            <div className={`sm:col-span-2 rounded-xl border p-4 flex items-start space-x-3 ${resultData.verified_by_admin ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${resultData.verified_by_admin ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                                    <CheckCircle size={15} className={resultData.verified_by_admin ? 'text-emerald-600' : 'text-amber-500'} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Admin Verification</p>
                                    {resultData.verified_by_admin ? (
                                        <>
                                            <p className="text-sm font-bold text-emerald-700 mt-0.5">✓ Verified by Admin</p>
                                            {resultData.admin_verified_at && (
                                                <p className="text-xs text-emerald-600 mt-0.5">{new Date(resultData.admin_verified_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-sm font-semibold text-amber-600 mt-0.5">⏳ Pending Admin Review</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <a
                            href={`http://localhost:5001/${resultData.result_pdf_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-semibold text-white transition-all shadow-sm shadow-blue-200"
                        >
                            <FileText size={16} />
                            <span>View Result PDF</span>
                            <ExternalLink size={13} />
                        </a>
                    </motion.div>
                ) : (
                    // Upload Mode
                    <motion.div key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm">
                        <form onSubmit={submit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-100 text-red-500 text-sm px-4 py-3 rounded-xl">{error}</div>
                            )}

                            {/* PDF Upload */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Pre-PhD Result PDF *</label>
                                <label className={`flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all ${file ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50'}`}>
                                    <div className="flex flex-col items-center space-y-2 text-center px-4">
                                        {file ? (
                                            <>
                                                <FileText size={22} className="text-blue-500" />
                                                <span className="text-sm font-medium text-blue-700">{file.name}</span>
                                                <span className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={22} className="text-slate-400" />
                                                <span className="text-sm text-slate-500">Click to upload result PDF <span className="text-slate-400">(max 2 MB)</span></span>
                                            </>
                                        )}
                                    </div>
                                    <input type="file" accept="application/pdf" onChange={handleFile} className="hidden" />
                                </label>
                                {fileError && <p className="text-xs text-red-500 font-medium mt-1">{fileError}</p>}
                            </div>

                            {/* Verification checkbox */}
                            <button type="button" onClick={() => setVerified(!verified)} className="flex items-start space-x-3 group w-full text-left">
                                <div className="shrink-0 mt-0.5">
                                    {verified ? <CheckSquare size={18} className="text-blue-500" /> : <Square size={18} className="text-slate-400 group-hover:text-slate-600" />}
                                </div>
                                <span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">
                                    I verify that the uploaded result PDF is accurate and authentic.
                                    I understand that this document cannot be edited after submission.
                                </span>
                            </button>

                            <button type="submit" disabled={uploading || !verified || !file} className={`w-full h-11 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center space-x-2 ${(uploading || !verified || !file) ? 'opacity-40 cursor-not-allowed' : 'shadow-lg shadow-blue-200'}`}>
                                {uploading ? <Loader2 size={18} className="animate-spin" /> : <><Upload size={16} /><span>Submit Pre-PhD Result</span></>}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const renderPanel = (active, profileData) => {
    switch(active) {
        case 'profile':             return <StudentProfile />;
        case 'fee':                 return <FeeDetails />;
        case 'mentors':             return profileData ? <MyMentors profile={profileData} /> : null;
        case 'prephd-coursework':   return profileData ? <PrePhdCoursework profile={profileData} /> : null;
        case 'prephd-result':       return profileData ? <PrePhdResult profile={profileData} /> : null;
        case 'sac-members':         return profileData ? <StudentSacMembersPanel profile={profileData} /> : null;
        case 'phd-presentation':    return profileData ? <StudentPhdPresentationPanel profile={profileData} /> : null;
        case 'phd-letter':          return profileData ? <StudentPhdLetterPanel profile={profileData} /> : null;
        default:                    return null;
    }
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const StudentDashboard = () => {
    const navigate = useNavigate();
    const [active, setActive] = useState('profile');
    const [showModal, setShowModal] = useState(false);
    const [profileChecked, setProfileChecked] = useState(false);
    const [profileData, setProfileData] = useState(null);

    const studentEmail = sessionStorage.getItem('studentEmail');

    const NAV = [
        { id: 'profile',  label: 'Profile',     icon: User },
        { id: 'fee',      label: 'Fee Details', icon: CreditCard },
        { id: 'mentors',  label: 'My Mentors',  icon: Users },
        {
            id: 'prephd', label: 'Pre-PhD', icon: BookOpen,
            children: [
                { id: 'prephd-coursework', label: 'Pre-PhD Coursework', icon: ClipboardList },
                { id: 'prephd-result',     label: 'Pre-PhD Result',     icon: BarChart2 },
            ]
        },
        {
            id: 'phd', label: 'PHD', icon: Target, locked: !profileData?.pre_phd_verified_by_admin,
            children: [
                { id: 'sac-members', label: 'My SAC Members', icon: Users },
                { id: 'phd-presentation', label: 'PHD Registration Presentation', icon: LayoutList },
                { id: 'phd-letter', label: 'PHD Registration Letter', icon: FileText }
            ]
        }
    ];

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
            else if (res.ok) { 
                const d = await res.json(); 
                if (d.pendingProfile) {
                    setProfileData({ ...d.pendingProfile, is_pending: true });
                } else if (d.profile) {
                    setProfileData({ ...d.profile, is_pending: false });
                }
            }
        } catch (err) { console.error(err); }
        finally { setProfileChecked(true); }
    };

    const logout = () => { sessionStorage.removeItem('studentEmail'); navigate('/login/student'); };

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
                {/* Welcome banner */}
                <div className="bg-gradient-to-r from-[#3345cc] to-[#4f6ef7] mx-6 mt-6 rounded-2xl p-6 flex items-center justify-between shadow-lg shadow-blue-400/20 overflow-hidden relative">
                    <div className="relative z-10">
                        <p className="text-blue-200 text-xs font-medium mb-1">
                            {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </p>
                        <h1 className="text-2xl font-bold text-white">
                            {firstName ? `Welcome back, ${firstName}!` : 'Welcome back!'}
                        </h1>
                        <p className="text-blue-200/80 text-sm mt-1">Always stay updated in your student portal.</p>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute right-20 bottom-0 w-28 h-28 bg-white/5 rounded-full translate-y-1/2" />
                    <div className="relative z-10 flex items-center space-x-3">
                        <NotificationBell
                            fetchUrl={`http://localhost:5001/api/notifications/student?email=${encodeURIComponent(studentEmail)}`}
                            accentColor="blue"
                        />
                        <div className="hidden md:flex items-center justify-center w-20 h-20 bg-white/15 rounded-2xl backdrop-blur-sm">
                            <GraduationCap size={36} className="text-white" />
                        </div>
                    </div>
                </div>

                {/* Panel content */}
                <div className="flex-1 px-6 py-6 relative">
                    {profileData?.is_pending && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-200/50 backdrop-blur-sm m-6 rounded-2xl">
                            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center mx-4">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Lock className="text-blue-600" size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">Verification Pending</h3>
                                <p className="text-slate-600">Student Dashboard will unlock once the Admin approves it.</p>
                            </div>
                        </div>
                    )}
                    <AnimatePresence mode="wait">
                        <motion.div key={active}
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.16 }}
                            className="h-full"
                        >
                            {renderPanel(active, profileData)}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;
