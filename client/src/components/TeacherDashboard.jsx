import { API_BASE } from '../config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, Users, GraduationCap, ClipboardList, BookOpen, 
    LogOut, Settings, Bell, Search, Filter, Plus, User, 
    Calendar, CheckCircle, Clock, X, ChevronDown, Mail, Phone, ExternalLink, Loader2, FileText, Target, Building2, Award, Hash, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, ChevronUp
} from 'lucide-react';
import StudentDetailsModal from './StudentDetailsModal';
import TeacherRegistrationModal from './TeacherRegistrationModal';
import { motion, AnimatePresence } from 'framer-motion';

// ── Notification Bell Panel ───────────────────────────────────────────────────────
const NotificationBell = ({ fetchUrl, accentColor = 'amber' }) => {
    const [open, setOpen] = React.useState(false);
    const [notifications, setNotifications] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [prevExpanded, setPrevExpanded] = React.useState(false);
    const [unreadCount, setUnreadCount] = React.useState(0);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch(fetchUrl);
            const data = await res.json();
            if (res.ok) { setNotifications(data.notifications); setUnreadCount(data.notifications.length); }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const togglePanel = () => { setOpen(o => !o); if (!open) loadNotifications(); };

    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recent = notifications.filter(n => new Date(n.created_at) >= cutoff);
    const previous = notifications.filter(n => new Date(n.created_at) < cutoff);

    const colors = {
        amber: { badge: 'bg-amber-500', header: 'bg-slate-900 border-amber-900/50', accent: 'text-amber-400' },
        blue:  { badge: 'bg-blue-500',  header: 'bg-slate-900 border-blue-900/50',  accent: 'text-blue-400'  },
    }[accentColor];

    const NotifCard = ({ n }) => (
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-3.5 space-y-2">
            <p className="text-sm text-slate-200 leading-relaxed">{n.message}</p>
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="text-xs text-slate-500">{new Date(n.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                {n.pdf_path && (
                    <a href={`${API_BASE}/${n.pdf_path}`} target="_blank" rel="noopener noreferrer"
                        className={`flex items-center space-x-1 text-xs ${colors.accent} hover:opacity-80 transition-opacity`}>
                        <FileText size={11} /><span>View Attachment</span><ExternalLink size={9} />
                    </a>
                )}
            </div>
        </div>
    );

    return (
        <>
            <button onClick={togglePanel}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all border border-white/20">
                <Bell size={18} className="text-white" />
                {unreadCount > 0 && !open && (
                    <span className={`absolute -top-1 -right-1 min-w-[18px] ${colors.badge} rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1`}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

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

const NAV = [
    { id: 'profile',   label: 'My Profile',   icon: User },
    { id: 'students',  label: 'My Students',  icon: GraduationCap },
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
                id={`nav-${item.id}`}
                onClick={() => hasChildren ? setOpen(p => !p) : onSelect(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${(active === item.id || isChildActive)
                        ? 'bg-white/20 text-white font-semibold'
                        : 'text-amber-100/70 hover:bg-white/10 hover:text-white'}`}
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
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden ml-3 mt-0.5 space-y-0.5 pl-3 border-l border-white/20"
                    >
                        {item.children.map(child => {
                            const ChildIcon = child.icon;
                            return (
                                <button key={child.id} onClick={() => onSelect(child.id)}
                                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-all
                                        ${active === child.id
                                            ? 'bg-white/20 text-white font-semibold'
                                            : 'text-amber-100/60 hover:bg-white/10 hover:text-white'}`}
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

// ── Profile Info Row ──────────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start space-x-3 py-3 border-b border-slate-100 last:border-0">
        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 mt-0.5">
            <Icon size={15} className="text-amber-500" />
        </div>
        <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
            <p className="text-sm font-medium text-slate-800 mt-0.5">{value || '—'}</p>
        </div>
    </div>
);

// ── Teacher Profile Panel ─────────────────────────────────────────────────────
const TeacherProfile = ({ profile, email }) => {
    const fullName = [profile.first_name, profile.middle_name, profile.last_name].filter(Boolean).join(' ');
    const initials = `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`;
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    return (
        <div className="space-y-5">
            {/* Details card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Card header with initials */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-200 flex items-center justify-center shrink-0">
                            <span className="text-xl font-bold text-amber-600">{initials}</span>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-800">{fullName}</h3>
                            <p className="text-sm text-slate-500">{profile.designation} · {profile.department}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{profile.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowPasswordForm(true)}
                        className="flex items-center space-x-2 text-xs font-semibold px-4 py-2 rounded-xl border bg-slate-50 border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-600 transition-all"
                    >
                        <Lock size={13} />
                        <span>{showPasswordForm ? 'Cancel' : 'Change Password'}</span>
                    </button>
                </div>

                <div className="px-6 py-2 divide-y divide-slate-100">
                    <InfoRow icon={Hash}      label="Teacher ID"      value={profile.teacher_id} />
                    <InfoRow icon={Mail}      label="Email"           value={profile.email} />
                    <InfoRow icon={Phone}     label="Mobile"          value={profile.mobile_number} />
                    <InfoRow icon={Building2} label="Department"      value={profile.department} />
                    <InfoRow icon={Award}     label="Designation"     value={profile.designation} />
                    <InfoRow icon={Calendar}  label="Year of Joining" value={profile.year_of_joining} />
                    <InfoRow icon={Calendar}  label="Registered On"   value={new Date(profile.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} />
                </div>
            </div>

            {/* Change Password Modal */}
            <AnimatePresence>
                {showPasswordForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={(e) => { if (e.target === e.currentTarget) setShowPasswordForm(false); }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 16, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 16, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                            className="relative w-full max-w-md"
                        >
                            {/* X close button */}
                            <button
                                onClick={() => setShowPasswordForm(false)}
                                className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-slate-800 border border-slate-600 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-lg"
                            >
                                <X size={14} />
                            </button>
                            <ChangePassword email={email} onSuccess={() => setShowPasswordForm(false)} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ── Change Password Panel ─────────────────────────────────────────────────────
const ChangePassword = ({ email, onSuccess }) => {
    const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const rules = [
        { label: 'At least 8 characters',  test: (p) => p.length >= 8 },
        { label: 'One uppercase letter',    test: (p) => /[A-Z]/.test(p) },
        { label: 'One lowercase letter',    test: (p) => /[a-z]/.test(p) },
        { label: 'One number',              test: (p) => /\d/.test(p) },
        { label: 'One special character',   test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
    ];

    const update = (e) => { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setError(''); setSuccess(''); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.newPassword !== form.confirmPassword) { setError('New passwords do not match'); return; }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/teacher/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, currentPassword: form.currentPassword, newPassword: form.newPassword }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess('Password updated successfully!');
                setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => { setSuccess(''); if (onSuccess) onSuccess(); }, 2500);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to connect to server.');
        } finally {
            setLoading(false);
        }
    };

    const PwdInput = ({ name, show, onToggle, placeholder }) => (
        <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input name={name} type={show ? 'text' : 'password'}
                value={form[name]} onChange={update} placeholder={placeholder} required
                className="w-full h-11 pl-9 pr-10 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all"
            />
            <button type="button" onClick={onToggle}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors">
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
        </div>
    );

    return (
        <div className="max-w-md">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                        <Lock size={16} className="text-amber-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Change Password</h3>
                        <p className="text-xs text-slate-400">Update your account password</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Current Password</label>
                        <PwdInput name="currentPassword" show={showCurrent} onToggle={() => setShowCurrent(p => !p)} placeholder="Enter current password" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">New Password</label>
                        <PwdInput name="newPassword" show={showNew} onToggle={() => setShowNew(p => !p)} placeholder="Enter new password" />
                        {form.newPassword && (
                            <div className="space-y-1 pt-1">
                                {rules.map(({ label, test }) => {
                                    const pass = test(form.newPassword);
                                    return (
                                        <div key={label} className={`flex items-center space-x-2 text-xs ${pass ? 'text-amber-500' : 'text-slate-400'}`}>
                                            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${pass ? 'bg-amber-400 text-white' : 'bg-slate-200 text-slate-400'}`}>{pass ? '✓' : '·'}</span>
                                            <span>{label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Confirm New Password</label>
                        <PwdInput name="confirmPassword" show={showNew} onToggle={() => setShowNew(p => !p)} placeholder="Re-enter new password" />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {success && <p className="text-emerald-600 text-sm font-medium">{success}</p>}

                    <button type="submit" disabled={loading}
                        className={`w-full h-11 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}>
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <><Lock size={15} /><span>Update Password</span></>}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ── Accordion Tab Helper ──────────────────────────────────────────────────────
const AccordionTab = ({ title, isOpen, onToggle, badge, children }) => (
    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <button type="button" onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors">
            <div className="flex items-center space-x-3">
                <span className="text-sm font-semibold text-slate-700">{title}</span>
                {badge && <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full uppercase tracking-wide">{badge}</span>}
            </div>
            <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={16} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
            </motion.div>
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50">{children}</div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

// ── Teacher Fee Viewer Sub-component ──────────────────────────────────────────
const TeacherFeeViewer = ({ rollNo, admissionYear }) => {
    const [semester, setSemester] = useState('');
    const [feeData, setFeeData] = useState(null);
    const [fetching, setFetching] = useState(false);
    const [noRecord, setNoRecord] = useState(false);

    const SEMESTERS = Array.from({ length: 16 }, (_, i) => i + 1);

    const formatSemester = (semInt) => {
        if (!semInt) return '';
        if (!admissionYear) return `Semester ${semInt}`;
        const year = admissionYear + Math.floor((semInt - 1) / 2);
        const roman = (semInt % 2 === 1) ? 'I' : 'II';
        return `${year}-${roman}`;
    };

    const fetchFeeData = async (sem) => {
        setSemester(sem);
        if (!rollNo) return;
        setFetching(true);
        setFeeData(null);
        setNoRecord(false);
        try {
            const res = await fetch(`${API_BASE}/api/fee?rollNo=${rollNo}&semester=${sem}`);
            if (res.ok) {
                const d = await res.json();
                setFeeData(d.fee);
                setNoRecord(false);
            } else if (res.status === 404) {
                setFeeData(null);
                setNoRecord(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    return (
        <div className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Select Half-Year</span>
                <select
                    value={semester}
                    onChange={(e) => fetchFeeData(Number(e.target.value))}
                    className="h-9 px-3 rounded-lg border border-slate-300 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all outline-none bg-white text-slate-700"
                >
                    <option value="" disabled>Select half-year...</option>
                    {SEMESTERS.map(s => (
                        <option key={s} value={s}>{formatSemester(s)}</option>
                    ))}
                </select>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm min-h-[80px] flex items-center justify-center text-sm">
                {fetching ? (
                    <span className="text-slate-400 animate-pulse flex items-center space-x-2"><Loader2 size={16} className="animate-spin" /><span>Fetching...</span></span>
                ) : feeData ? (
                    <div className="w-full flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-400">Payment Date</span>
                            <span className="font-semibold text-slate-700">{new Date(feeData.payment_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                        </div>
                        <a
                            href={`${API_BASE}/${feeData.receipt_pdf_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition flex items-center"
                        >
                            View Receipt <ExternalLink size={12} className="ml-1.5" />
                        </a>
                    </div>
                ) : noRecord ? (
                    <span className="text-slate-400 py-3 italic">No fee uploaded for {formatSemester(semester)}</span>
                ) : (
                    <span className="text-slate-400 py-3 italic">Select a half-year to view fee receipts</span>
                )}
            </div>
        </div>
    );
};

// ── My Students Panel ─────────────────────────────────────────────────────
const MyStudents = ({ email }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openIds, setOpenIds] = useState({});
    const [assigningCourseworkTo, setAssigningCourseworkTo] = useState(null); // student object
    const [viewingStudentDetails, setViewingStudentDetails] = useState(null); // student object

    useEffect(() => {
        const fetch_ = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/teacher/students?email=${encodeURIComponent(email)}`);
                const data = await res.json();
                if (res.ok) setStudents(data.students);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch_();
    }, [email]);

    const toggle = (id) => setOpenIds(prev => ({ ...prev, [id]: !prev[id] }));

    // Use the first row to determine the pair info
    const pairInfo = students[0] ?? null;

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-xl font-bold text-white">My Students</h2>
                <p className="text-slate-400 text-sm mt-1">Students assigned to you for mentorship.</p>
            </div>

            {/* Teacher pair card */}
            {pairInfo && (
                <div className="bg-amber-900/30 border border-amber-800/40 rounded-2xl px-6 py-4 flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-center justify-center">
                            <User size={15} className="text-amber-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide">Mentor Teacher</p>
                            <p className="text-sm font-semibold text-white">{pairInfo.mentor_name}</p>
                            <p className="text-xs text-amber-300/60">{pairInfo.mentor_email}</p>
                        </div>
                    </div>
                    {pairInfo.assistance_name && (
                        <>
                            <div className="hidden sm:block text-slate-700 text-lg">+</div>
                            <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 bg-slate-700/60 border border-slate-600 rounded-xl flex items-center justify-center">
                                    <User size={15} className="text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Assistant Mentor</p>
                                    <p className="text-sm font-semibold text-slate-200">{pairInfo.assistance_name}</p>
                                    <p className="text-xs text-slate-500">{pairInfo.assistance_email}</p>
                                </div>
                            </div>
                        </>
                    )}
                    <div className="ml-auto">
                        <span className="text-xs font-semibold text-amber-400 bg-amber-900/50 border border-amber-700/50 px-3 py-1.5 rounded-full">
                            {students.length} student{students.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex items-center space-x-3 text-slate-500 py-10">
                    <Loader2 className="animate-spin" size={20} /><span className="text-sm">Loading students...</span>
                </div>
            ) : students.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-600 space-y-3">
                    <GraduationCap size={44} className="opacity-25" />
                    <p className="text-sm">No students have been assigned to you yet.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {students.map((s) => {
                        const name = `${s.student_first_name} ${s.student_last_name}`;
                        const isOpen = !!openIds[s.id];
                        return (
                            <div key={s.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                {/* Student row header */}
                                <button
                                    onClick={() => toggle(s.id)}
                                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left group"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                                            <span className="text-xs font-bold text-amber-600">
                                                {s.student_first_name?.[0]}{s.student_last_name?.[0]}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{name}</p>
                                            <p className="text-xs text-slate-400 font-mono">{s.student_roll_no}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 shrink-0">
                                        <span className="text-xs text-slate-400 hidden lg:block">
                                            Year: {s.year_of_admission}
                                        </span>
                                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                            <ChevronDown size={16} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                                        </motion.div>
                                    </div>
                                </button>

                                {/* Expandable detail panel */}
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="border-t border-slate-100 px-5 py-6 bg-slate-50/60">
                                                <div className="flex flex-col sm:flex-row items-center gap-3">
                                                    <button 
                                                        onClick={() => setViewingStudentDetails(s)}
                                                        className="flex-1 w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-slate-200"
                                                    >
                                                        <User size={16} />
                                                        <span>View Full Detail</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => setAssigningCourseworkTo(s)}
                                                        className={`flex-1 w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold transition-all border
                                                            ${s.has_coursework 
                                                                ? 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50' 
                                                                : 'bg-white border-amber-200 text-amber-600 hover:bg-amber-50'}`}
                                                    >
                                                        <BookOpen size={16} />
                                                        <span>{s.has_coursework ? 'Coursework Assigned' : 'Assign Coursework'}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            )}

            {assigningCourseworkTo && (
                <AssignCourseworkModal
                    student={assigningCourseworkTo}
                    teacherEmail={email}
                    onClose={() => setAssigningCourseworkTo(null)}
                />
            )}

            <AnimatePresence>
                {viewingStudentDetails && (
                    <StudentDetailsModal
                        student={viewingStudentDetails}
                        onClose={() => setViewingStudentDetails(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// ── Assign Coursework Modal ───────────────────────────────────────────────────
const AssignCourseworkModal = ({ student, teacherEmail, onClose }) => {
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [assignedSubjects, setAssignedSubjects] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(!student.has_coursework);

    useEffect(() => {
        const fetchTargets = async () => {
            try {
                // Fetch all available subjects
                const subRes = await fetch(`${API_BASE}/api/teacher/coursework-subjects`);
                const subData = await subRes.json();
                if (subRes.ok) setAvailableSubjects(subData.subjects);

                // Fetch currently assigned subjects
                const curRes = await fetch(`${API_BASE}/api/teacher/student-coursework?student_roll_no=${encodeURIComponent(student.student_roll_no)}`);
                const curData = await curRes.json();
                if (curRes.ok) {
                    setAssignedSubjects(curData.subjects);
                    setSelectedIds(curData.subjects.map(s => s.subject_id));
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load subjects.');
            } finally {
                setLoading(false);
            }
        };
        fetchTargets();
    }, [student.student_roll_no]);

    const toggleSubject = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sId => sId !== id));
        } else {
            if (selectedIds.length >= 4) {
                setError('You can only select up to 4 subjects.');
                setTimeout(() => setError(''), 3000);
                return;
            }
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleSave = async () => {
        if (selectedIds.length === 0 || selectedIds.length > 4) {
            setError('Please select between 1 and 4 subjects.');
            return;
        }
        if (selectedIds.length < 4) {
            if (!window.confirm(`You have selected only ${selectedIds.length} subject(s). Are you sure you want to assign fewer than 4 subjects?`)) {
                return;
            }
        }
        setSubmitting(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}/api/teacher/assign-coursework`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teacher_email: teacherEmail,
                    student_roll_no: student.student_roll_no,
                    subject_ids: selectedIds
                })
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess('Coursework successfully assigned.');
                setTimeout(onClose, 2000);
            } else {
                setError(data.message || 'Assignment failed');
            }
        } catch (err) {
            setError('Server connection error.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Assign Coursework</h3>
                        <p className="text-xs text-slate-500 font-medium">For {student.student_first_name} {student.student_last_name} ({student.student_roll_no})</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-3 text-slate-500">
                            <Loader2 className="animate-spin" size={24} />
                            <p className="text-sm">Loading curriculum...</p>
                        </div>
                    ) : !isEditing ? (
                        <div className="space-y-4">
                            <p className="text-sm font-semibold text-slate-700">Currently Assigned Coursework</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-2">
                                {assignedSubjects.length === 0 ? (
                                    <p className="text-sm text-slate-500 italic text-center py-4">No subjects currently assigned.</p>
                                ) : (
                                    assignedSubjects.map((sub, idx) => (
                                        <div key={idx} className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
                                            <div>
                                                <p className="text-sm font-bold text-amber-900">{sub.subject_name}</p>
                                            </div>
                                            <div className="bg-white border border-amber-200 px-3 py-1 rounded-lg">
                                                <p className="text-xs font-bold text-amber-700">{sub.credits} Credits</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="pt-4 border-t border-slate-100">
                                <button 
                                    onClick={() => setIsEditing(true)} 
                                    className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all shadow-sm"
                                >
                                    Edit Assigned Subjects
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-slate-700">Select Subjects</p>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${selectedIds.length > 0 && selectedIds.length <= 4 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {selectedIds.length} / 4 Selected
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto p-1">
                                {availableSubjects.length === 0 ? (
                                    <p className="col-span-2 text-sm text-slate-500 italic py-4 text-center">No subjects available.</p>
                                ) : (
                                    availableSubjects.map(sub => {
                                        const isSelected = selectedIds.includes(sub.id);
                                        return (
                                            <button
                                                key={sub.id}
                                                onClick={() => toggleSubject(sub.id)}
                                                className={`flex items-start text-left p-3 rounded-xl border-2 transition-all ${isSelected ? 'border-amber-500 bg-amber-50/50 shadow-sm' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                                            >
                                                <div className="mt-0.5 shrink-0 mr-3">
                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'border-amber-500 bg-amber-500' : 'border-slate-300'}`}>
                                                        {isSelected && <CheckCircle2 size={12} className="text-white" />}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-semibold leading-tight mb-1 ${isSelected ? 'text-amber-900' : 'text-slate-700'}`}>{sub.subject_name}</p>
                                                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-amber-600' : 'text-slate-400'}`}>{sub.credits} Credits</p>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>

                            {/* Messages */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                                        {error}
                                    </motion.div>
                                )}
                                {success && (
                                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium rounded-xl flex items-center">
                                        <CheckCircle2 size={16} className="mr-2 shrink-0" /> {success}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Action */}
                            <div className="flex space-x-3 mt-4">
                                {student.has_coursework && (
                                    <button 
                                        onClick={() => { setIsEditing(false); setSelectedIds(assignedSubjects.map(s => s.subject_id)); setError(''); }} 
                                        disabled={submitting || success} 
                                        className="px-5 py-3 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all shrink-0"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    onClick={handleSave}
                                    disabled={submitting || success || selectedIds.length === 0}
                                    className={`flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center transition-all ${submitting || success || selectedIds.length === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-md hover:shadow-lg'}`}
                                >
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Save Coursework Assignments'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

// ── Main Teacher Dashboard ────────────────────────────────────────────────────
const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [active, setActive] = useState('profile');
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const teacherEmail = sessionStorage.getItem('teacherEmail') || '';

    const loadProfile = async () => {
        if (!teacherEmail) return;
        try {
            const res = await fetch(`${API_BASE}/api/teacher/profile?email=${encodeURIComponent(teacherEmail)}`);
            if (res.status === 404) {
                setShowModal(true);
            } else if (res.ok) {
                const data = await res.json();
                setProfile(data.profile);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setProfileLoading(false);
        }
    };

    useEffect(() => { 
        loadProfile(); 
        // Sync body background
        document.body.style.backgroundColor = '#0f172a'; // slate-900
        return () => { document.body.style.backgroundColor = ''; };
    }, []);

    const onProfileComplete = async () => {
        setShowModal(false);
        setProfileLoading(true);
        await loadProfile();
    };

    const logout = () => {
        sessionStorage.removeItem('teacherEmail');
        navigate('/login/teacher');
    };

    const renderPanel = () => {
        if (active === 'profile') {
            if (profileLoading) return (
                <div className="flex items-center justify-center h-full text-slate-500 space-x-3 py-20">
                    <Loader2 className="animate-spin" size={22} />
                    <span className="text-sm">Loading profile...</span>
                </div>
            );
            if (profile) return <TeacherProfile profile={profile} email={teacherEmail} />;
            return (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3 py-20">
                    <User size={36} className="text-amber-400 opacity-60" />
                    <p className="text-sm">No profile found.</p>
                </div>
            );
        }
        if (active === 'students') return <MyStudents email={teacherEmail} />;
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3 py-20">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center">
                    <BookOpen size={26} className="text-amber-400" />
                </div>
                <p className="text-base font-semibold text-slate-300">{active}</p>
                <p className="text-sm text-slate-500">This section is coming soon.</p>
            </div>
        );
    };

    return (
        <div className="h-screen overflow-hidden bg-slate-900 flex text-slate-100">
            {/* Modal  */}
            {showModal && (
                <TeacherRegistrationModal
                    email={teacherEmail}
                    onComplete={onProfileComplete}
                />
            )}

            {/* ── Sidebar ──────────────────────────────── */}
            <aside className="w-60 bg-gradient-to-b from-amber-900 to-amber-950 flex flex-col h-screen fixed top-0 left-0 z-30 shadow-2xl border-r border-amber-800/50 overscroll-none">
                {/* Logo */}
                <div className="px-5 pt-7 pb-6">
                    <div className="flex flex-col items-center space-y-3">
                        <div className="w-14 h-14 bg-amber-500/20 border border-amber-400/30 rounded-2xl flex items-center justify-center shadow-lg">
                            <BookOpen size={28} className="text-amber-300" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-white leading-tight">Teacher Portal</p>
                            <p className="text-xs text-amber-300/60 truncate max-w-[160px] mt-0.5">{teacherEmail}</p>
                        </div>
                    </div>
                </div>

                <div className="mx-4 h-px bg-amber-800/50 mb-4" />

                {/* Nav */}
                <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                    {NAV.map(item => (
                        <SidebarItem key={item.id} item={item} active={active} onSelect={setActive} />
                    ))}
                </nav>

                {/* Logout */}
                <div className="px-3 pb-5">
                    <div className="mx-1 h-px bg-amber-800/50 mb-3" />
                    <button
                        id="teacherLogout"
                        onClick={logout}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm text-amber-100/60 hover:bg-red-500/20 hover:text-red-400 transition-all"
                    >
                        <LogOut size={17} />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* ── Main Content ──────────────────────────── */}
            <main className="flex-1 ml-60 h-screen overflow-y-auto bg-slate-900 overscroll-none">
                {/* Welcome banner */}
                <div className="bg-gradient-to-r from-amber-900/60 to-slate-800 mx-6 mt-6 rounded-2xl p-6 flex items-center justify-between shadow-lg border border-amber-800/30 overflow-hidden relative">
                    <div className="relative z-10">
                        <p className="text-amber-400 text-xs font-medium mb-1">
                            {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </p>
                        <h1 className="text-2xl font-bold text-white">
                            {profile ? `Welcome, ${profile.first_name}!` : 'Welcome, Faculty!'}
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            {profile ? `${profile.designation} · ${profile.department}` : 'Manage your students and coursework assignments.'}
                        </p>
                    </div>
                    <div className="absolute right-0 top-0 w-48 h-48 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute right-20 bottom-0 w-28 h-28 bg-amber-500/5 rounded-full translate-y-1/2" />
                    <div className="relative z-10 flex items-center space-x-3">
                        <NotificationBell
                            fetchUrl={`${API_BASE}/api/notifications/teacher`}
                            accentColor="amber"
                        />
                        <div className="hidden md:flex items-center justify-center w-20 h-20 bg-amber-600/20 border border-amber-600/30 rounded-2xl backdrop-blur-sm">
                            <BookOpen size={36} className="text-amber-400" />
                        </div>
                    </div>
                </div>

                {/* Panel */}
                <div className="flex-1 px-6 py-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={active}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.16 }}
                            className="h-full"
                        >
                            {renderPanel()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default TeacherDashboard;
