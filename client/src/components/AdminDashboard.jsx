import React, { useState, useEffect, useRef } from 'react';
import { 
    LayoutDashboard, Users, GraduationCap, ClipboardList, BookOpen, 
    LogOut, Settings, Bell, Search, Filter, Plus, PlusCircle, User, 
    Calendar, CheckCircle, Clock, X, ChevronDown, Mail, Phone, ExternalLink, Loader2, FileText, Target, Trash2, Send, ChevronUp, ArrowLeftRight, UserMinus, ClipboardCheck, CheckCircle2, XCircle, ShieldCheck, UserPlus, Link2, Award, Users2 
} from 'lucide-react';
import StudentDetailsModal from './StudentDetailsModal';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PhdRegistrationPresentationPanel, PhdRegistrationLetterPanel, PhdProgressReportPanel } from './AdminPhdPanels';

// ── Sidebar nav config ────────────────────────────────────────────────────────
const NAV = [
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'verifications', label: 'Student Verifications', icon: ShieldCheck },
    { id: 'coursework', label: 'Coursework Subjects', icon: BookOpen },
    { id: 'authorizedTeachers', label: 'Authorized Teachers', icon: UserPlus },
    { id: 'assignStudents', label: 'Assign Students', icon: Link2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'validate-result', label: 'Validate Result', icon: ClipboardCheck },
    {
        id: 'sac', label: 'SAC', icon: Award,
        children: [
            { id: 'sac-members', label: 'SAC Members', icon: UserPlus },
            { id: 'sac-assign', label: 'Assign SAC', icon: Users2 },
        ]
    },
    {
        id: 'phd', label: 'PHD', icon: BookOpen,
        children: [
            { id: 'phd-presentation', label: 'PHD Registration Presentation', icon: ClipboardCheck },
            { id: 'phd-letter', label: 'PHD Registration Letter', icon: FileText },
            { id: 'phd-progress', label: 'PHD Progress Report', icon: FileText },
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
                id={`nav-${item.id}`}
                onClick={() => hasChildren ? setOpen(p => !p) : onSelect(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${(active === item.id || isChildActive)
                        ? 'bg-white/20 text-white font-semibold'
                        : 'text-emerald-100/70 hover:bg-white/10 hover:text-white'}`}
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
                                            : 'text-emerald-100/60 hover:bg-white/10 hover:text-white'}`}
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

// ── Placeholder panel for future sections ─────────────────────────────────────
const Placeholder = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center">
            <ShieldCheck size={26} className="text-emerald-500" />
        </div>
        <p className="text-base font-semibold text-slate-300">{title}</p>
        <p className="text-sm text-slate-500">This section is coming soon.</p>
    </div>
);

// ── User Management Panel ─────────────────────────────────────────────────────
const USER_TABS = [
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'teachers', label: 'Teachers', icon: Users },
];

const EmptyState = ({ label }) => (
    <div className="flex flex-col items-center justify-center py-24 text-slate-500 space-y-3">
        <GraduationCap size={48} className="opacity-20" />
        <p className="text-sm">No {label} records found.</p>
    </div>
);

const DetailRow = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide w-40 shrink-0">{label}</span>
        <span className="text-sm text-white">{value || '—'}</span>
    </div>
);

const StudentTable = ({ data, filter, onViewDetail }) => {
    const [selectedId, setSelectedId] = useState(null);

    const rows = data.filter(s =>
        [s.first_name, s.last_name, s.email, s.roll_no, s.mobile_number]
            .join(' ').toLowerCase().includes(filter.toLowerCase())
    );
    if (!rows.length) return <EmptyState label="student" />;

    const toggleRow = (id) => setSelectedId(prev => prev === id ? null : id);

    return (
        <div className="rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-700/60 text-slate-400 uppercase text-xs">
                    <tr>
                        <th className="px-5 py-3 font-semibold">Roll No.</th>
                        <th className="px-5 py-3 font-semibold">Student Name</th>
                        <th className="px-5 py-3 font-semibold text-right text-xs normal-case text-slate-500 font-normal tracking-normal">
                            Click a row to view details
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                    {rows.map(s => {
                        const isOpen = selectedId === s.roll_no;
                        const fullName = `${s.first_name}${s.middle_name ? ` ${s.middle_name}` : ''} ${s.last_name}`;
                        return (
                            <React.Fragment key={s.roll_no}>
                                <tr
                                    onClick={() => toggleRow(s.roll_no)}
                                    className={`cursor-pointer transition-colors ${isOpen ? 'bg-emerald-900/20' : 'hover:bg-slate-700/30'}`}
                                >
                                    <td className="px-5 py-3 font-mono text-emerald-400 whitespace-nowrap">{s.roll_no}</td>
                                    <td className="px-5 py-3 text-white font-medium whitespace-nowrap">{fullName}</td>
                                    <td className="px-5 py-3 text-right">
                                        <motion.span
                                            animate={{ rotate: isOpen ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="inline-block text-slate-500"
                                        >
                                            <ChevronDown size={16} />
                                        </motion.span>
                                    </td>
                                </tr>
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.tr
                                            key="detail"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            <td colSpan={3} className="px-6 py-5 bg-slate-800/60 border-t border-slate-700">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); onViewDetail(s); }}
                                                    className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-900/20"
                                                >
                                                    <User size={16} />
                                                    <span>View Full Detail Profile</span>
                                                </button>
                                            </td>
                                        </motion.tr>
                                    )}
                                </AnimatePresence>
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

// ── Reassign Students Modal (transfer only, no deletion) ──────────────────────
const ReassignTeacherModal = ({ sourceTeacher, allTeachers, onSuccess, onClose }) => {
    const [newTeacherId, setNewTeacherId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    const others = allTeachers.filter(t => t.teacher_id !== sourceTeacher.teacher_id);
    const successor = others.find(t => t.teacher_id === newTeacherId);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newTeacherId) return;
        setSubmitting(true);
        setError('');
        try {
            const res = await fetch('http://localhost:5001/api/admin/reassign-teacher', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ old_teacher_id: sourceTeacher.teacher_id, new_teacher_id: newTeacherId })
            });
            const data = await res.json();
            if (res.ok) {
                setDone(true);
                setTimeout(() => { onSuccess(); onClose(); }, 1600);
            } else {
                setError(data.message || 'Reassignment failed.');
            }
        } catch {
            setError('Failed to connect to server.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-lg bg-slate-900 border border-amber-900/50 rounded-3xl shadow-2xl overflow-hidden"
            >
                <div className="px-6 pt-6 pb-4 border-b border-slate-800">
                    <div className="flex items-center space-x-3 mb-1">
                        <div className="w-9 h-9 rounded-xl bg-amber-900/40 flex items-center justify-center">
                            <ArrowLeftRight size={16} className="text-amber-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Reassign Students</h3>
                    </div>
                    <p className="text-sm text-slate-400 ml-12">
                        Transfer all students assigned to <span className="font-semibold text-white">{sourceTeacher.first_name} {sourceTeacher.last_name}</span> (as Mentor or Assistant Mentor) to another faculty member.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {done ? (
                        <div className="flex flex-col items-center py-6 space-y-2 text-emerald-400">
                            <div className="w-10 h-10 rounded-full bg-emerald-900/40 flex items-center justify-center">
                                <ArrowLeftRight size={20} />
                            </div>
                            <p className="font-semibold text-sm">All assignments transferred!</p>
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Transfer To</label>
                                <select
                                    value={newTeacherId}
                                    onChange={e => setNewTeacherId(e.target.value)}
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-all"
                                >
                                    <option value="">— Select successor faculty —</option>
                                    {others.map(t => (
                                        <option key={t.teacher_id} value={t.teacher_id}>
                                            {t.first_name} {t.last_name} ({t.department})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {successor && (
                                <div className="flex items-center space-x-3 bg-amber-900/20 border border-amber-800/40 rounded-xl px-4 py-3">
                                    <ArrowLeftRight size={14} className="text-amber-400 shrink-0" />
                                    <p className="text-sm text-slate-300">
                                        {sourceTeacher.assigned_student_count} student(s) will move to <span className="font-semibold text-amber-300">{successor.first_name} {successor.last_name}</span>.
                                    </p>
                                </div>
                            )}

                            {error && <p className="text-red-400 text-sm">{error}</p>}

                            <div className="flex justify-end space-x-3 pt-2">
                                <button type="button" onClick={onClose}
                                    className="px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting || !newTeacherId}
                                    className="flex items-center space-x-2 px-5 py-2.5 text-sm font-semibold bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl transition-colors">
                                    {submitting ? <Loader2 size={14} className="animate-spin" /> : <ArrowLeftRight size={14} />}
                                    <span>{submitting ? 'Transferring...' : 'Confirm Transfer'}</span>
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </motion.div>
        </div>
    );
};

const TeacherTable = ({ data, filter, onReassign, onDelete }) => {
    const rows = data.filter(t =>
        [t.first_name, t.last_name, t.email, t.teacher_id, t.department, t.designation]
            .join(' ').toLowerCase().includes(filter.toLowerCase())
    );
    if (!rows.length) return <EmptyState label="teacher" />;
    return (
        <div className="overflow-x-auto rounded-xl border border-slate-700">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-700/60 text-slate-400 uppercase text-xs">
                    <tr>
                        {['Teacher ID', 'Name', 'Email', 'Department', 'Designation', 'Joined', 'Students', ''].map((h, i) => (
                            <th key={i} className="px-5 py-3 font-semibold whitespace-nowrap">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                    {rows.map(t => {
                        const hasStudents = t.assigned_student_count > 0;
                        return (
                            <tr key={t.teacher_id} className="hover:bg-slate-700/30 transition-colors">
                                <td className="px-5 py-3 font-mono text-emerald-400 whitespace-nowrap">{t.teacher_id}</td>
                                <td className="px-5 py-3 text-white font-medium whitespace-nowrap">
                                    {t.first_name} {t.middle_name ? `${t.middle_name} ` : ''}{t.last_name}
                                </td>
                                <td className="px-5 py-3 text-slate-300">{t.email}</td>
                                <td className="px-5 py-3 text-slate-300 whitespace-nowrap">{t.department}</td>
                                <td className="px-5 py-3 text-slate-300 whitespace-nowrap">{t.designation}</td>
                                <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                                    {new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </td>
                                <td className="px-5 py-3 whitespace-nowrap">
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                        hasStudents
                                            ? 'bg-violet-900/50 text-violet-300 border border-violet-700/50'
                                            : 'bg-slate-700/50 text-slate-500 border border-slate-600/30'
                                    }`}>
                                        {t.assigned_student_count} student{t.assigned_student_count !== 1 ? 's' : ''}
                                    </span>
                                </td>
                                <td className="px-3 py-3 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end space-x-1.5">
                                        {hasStudents && (
                                            <button
                                                onClick={() => onReassign(t)}
                                                title="Reassign students to another faculty"
                                                className="w-7 h-7 flex items-center justify-center bg-amber-900/30 hover:bg-amber-600 text-amber-400 hover:text-white rounded-lg transition-colors"
                                            >
                                                <ArrowLeftRight size={13} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onDelete(t)}
                                            title={hasStudents ? 'Reassign all students before removing' : 'Permanently remove this teacher'}
                                            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                                                hasStudents
                                                    ? 'bg-red-950/20 text-red-800 cursor-not-allowed'
                                                    : 'bg-red-900/30 hover:bg-red-700 text-red-400 hover:text-white'
                                            }`}
                                        >
                                            <UserMinus size={13} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

const UserManagement = () => {
    const [activeTab, setActiveTab] = useState('students');
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [reassigningTeacher, setReassigningTeacher] = useState(null);
    const [deletingTeacher, setDeletingTeacher] = useState(null);
    const [viewingStudentDetails, setViewingStudentDetails] = useState(null);
    const [deleteError, setDeleteError] = useState('');

    const fetchAll = async () => {
        setLoading(true);
        setError('');
        try {
            const [studRes, teachRes] = await Promise.all([
                fetch('http://localhost:5001/api/admin/students'),
                fetch('http://localhost:5001/api/admin/teachers'),
            ]);
            const [studData, teachData] = await Promise.all([studRes.json(), teachRes.json()]);
            if (studRes.ok) setStudents(studData.students);
            if (teachRes.ok) setTeachers(teachData.teachers);
        } catch (err) {
            console.error(err);
            setError('Failed to connect to server.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleDelete = async (teacher) => {
        if (teacher.assigned_student_count > 0) {
            setDeletingTeacher(teacher); // will show a warning, not actual delete
            return;
        }
        if (!window.confirm(`Permanently remove ${teacher.first_name} ${teacher.last_name} from the system?`)) return;
        try {
            const res = await fetch(`http://localhost:5001/api/admin/delete-teacher/${teacher.teacher_id}`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) {
                setTeachers(prev => prev.filter(t => t.teacher_id !== teacher.teacher_id));
            } else {
                setDeleteError(data.message || 'Removal failed.');
                setTimeout(() => setDeleteError(''), 4000);
            }
        } catch {
            setDeleteError('Failed to connect to server.');
            setTimeout(() => setDeleteError(''), 4000);
        }
    };

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-xl font-bold text-white">User Management</h2>
                <p className="text-slate-400 text-sm mt-1">View all registered students and teachers.</p>
            </div>

            {/* Sub-tab switcher + search */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex bg-slate-800 border border-slate-700 rounded-xl p-1 w-fit">
                    {USER_TABS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            id={`usertab-${id}`}
                            onClick={() => { setActiveTab(id); setSearch(''); }}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                activeTab === id
                                    ? 'bg-emerald-600 text-white shadow'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Icon size={15} />
                            <span>{label}</span>
                            <span className={`text-xs rounded-full px-2 py-0.5 ${
                                activeTab === id ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-700 text-slate-400'
                            }`}>
                                {id === 'students' ? students.length : teachers.length}
                            </span>
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                    <input
                        type="text"
                        id="userSearch"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={`Search ${activeTab}...`}
                        className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-all w-60"
                    />
                </div>
            </div>

            {/* Table content */}
            {error && (
                <div className="bg-red-900/40 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl text-sm">
                    {error}
                </div>
            )}
            {loading ? (
                <div className="flex items-center justify-center py-32 space-x-3 text-slate-500">
                    <Loader2 className="animate-spin" size={22} />
                    <span>Loading...</span>
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                    >
                        {activeTab === 'students'
                            ? <StudentTable data={students} filter={search} onViewDetail={setViewingStudentDetails} />
                            : <TeacherTable data={teachers} filter={search} onReassign={setReassigningTeacher} onDelete={handleDelete} />
                        }
                    </motion.div>
                </AnimatePresence>
            )}

            {deleteError && (
                <div className="fixed bottom-6 right-6 z-50 bg-red-950 border border-red-700 text-red-300 px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium">
                    {deleteError}
                </div>
            )}

            {reassigningTeacher && (
                <ReassignTeacherModal
                    sourceTeacher={reassigningTeacher}
                    allTeachers={teachers}
                    onSuccess={fetchAll}
                    onClose={() => setReassigningTeacher(null)}
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

            {/* Warning modal when trying to remove a teacher who still has students */}
            {deletingTeacher && deletingTeacher.assigned_student_count > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setDeletingTeacher(null)} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative w-full max-w-md bg-slate-900 border border-red-900/60 rounded-3xl shadow-2xl p-6 space-y-4"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-red-900/40 flex items-center justify-center shrink-0">
                                <UserMinus size={18} className="text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white">Cannot Remove Faculty</h3>
                                <p className="text-xs text-slate-400 mt-0.5">This teacher has active student assignments</p>
                            </div>
                        </div>
                        <div className="bg-red-950/40 border border-red-900/40 rounded-xl px-4 py-3">
                            <p className="text-sm text-slate-300">
                                <span className="font-semibold text-white">{deletingTeacher.first_name} {deletingTeacher.last_name}</span> is currently assigned to{' '}
                                <span className="font-semibold text-red-400">{deletingTeacher.assigned_student_count} student(s)</span>.
                                Please use <span className="font-semibold text-amber-400">Reassign</span> to transfer all students to another faculty member before removing.
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <button onClick={() => setDeletingTeacher(null)}
                                className="px-5 py-2.5 text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors">
                                Got it
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

// ── Coursework Subjects Panel ─────────────────────────────────────────────────
const CourseworkSubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [form, setForm] = useState({ subject_name: '', credits: '', syllabus: null });

    const fetchSubjects = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/admin/subjects');
            const data = await res.json();
            if (res.ok) setSubjects(data.subjects);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSubjects(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);
        if (!form.syllabus) {
            setError('Please upload a syllabus PDF.');
            setSubmitting(false);
            return;
        }
        
        const formData = new FormData();
        formData.append('subject_name', form.subject_name);
        formData.append('credits', form.credits);
        formData.append('syllabus', form.syllabus);

        try {
            const res = await fetch('http://localhost:5001/api/admin/subjects', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message); return; }
            setSubjects(prev => [data.subject, ...prev]);
            setSuccess(`"${data.subject.subject_name}" added successfully!`);
            setTimeout(() => setSuccess(''), 3000);
            setForm({ subject_name: '', credits: '', syllabus: null });
            document.getElementById('syllabusFile').value = '';
        } catch (err) {
            setError('Failed to connect to server.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteSubject = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
        try {
            const res = await fetch(`http://localhost:5001/api/admin/subjects/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSubjects(prev => prev.filter(s => s.id !== id));
                setSuccess(`"${name}" deleted successfully.`);
                setTimeout(() => setSuccess(''), 3000);
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to delete subject');
                setTimeout(() => setError(''), 4000);
            }
        } catch (err) {
            setError('Failed to connect to server.');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-white">Coursework Subjects</h2>
                <p className="text-slate-400 text-sm mt-1">Add subjects available for pre-PhD coursework.</p>
            </div>

            {/* Add Subject Form */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">Add New Subject</h3>
                <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 items-start">
                    <div className="flex-1">
                        <label className="block text-xs text-slate-400 mb-1 font-medium">Subject Name</label>
                        <input
                            id="subjectName"
                            type="text"
                            value={form.subject_name}
                            onChange={e => setForm(f => ({ ...f, subject_name: e.target.value }))}
                            placeholder="e.g. Research Methodology"
                            required
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-all"
                        />
                    </div>
                    <div className="w-32">
                        <label className="block text-xs text-slate-400 mb-1 font-medium">Credits</label>
                        <input
                            id="subjectCredits"
                            type="number"
                            min="1"
                            value={form.credits}
                            onChange={e => setForm(f => ({ ...f, credits: e.target.value }))}
                            placeholder="e.g. 4"
                            required
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-all"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs text-slate-400 mb-1 font-medium">Syllabus PDF (Max 2MB)</label>
                        <input
                            id="syllabusFile"
                            type="file"
                            accept="application/pdf"
                            onChange={e => {
                                const file = e.target.files[0];
                                if (file && file.size > 2 * 1024 * 1024) {
                                    setError('Syllabus PDF must be under 2MB.');
                                    e.target.value = '';
                                    setForm(f => ({ ...f, syllabus: null }));
                                } else {
                                    setError('');
                                    setForm(f => ({ ...f, syllabus: file }));
                                }
                            }}
                            required
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300 outline-none focus:border-emerald-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 transition-all cursor-pointer"
                        />
                    </div>
                    <div className="pt-5">
                        <button
                            id="addSubjectBtn"
                            type="submit"
                            disabled={submitting}
                            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                        >
                            {submitting ? <Loader2 size={15} className="animate-spin" /> : <PlusCircle size={15} />}
                            <span>{submitting ? 'Adding...' : 'Add Subject'}</span>
                        </button>
                    </div>
                </form>

                {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
                {success && <p className="mt-3 text-emerald-400 text-sm">{success}</p>}
            </div>

            {/* Subjects List */}
            <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                    Existing Subjects ({subjects.length})
                </h3>
                {loading ? (
                    <div className="flex items-center space-x-3 text-slate-500 py-8">
                        <Loader2 className="animate-spin" size={20} />
                        <span className="text-sm">Loading subjects...</span>
                    </div>
                ) : subjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-600 space-y-2">
                        <BookOpen size={40} className="opacity-30" />
                        <p className="text-sm">No subjects added yet.</p>
                    </div>
                ) : (
                    <div className="rounded-xl border border-slate-700 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-700/60 text-slate-400 uppercase text-xs">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">#</th>
                                    <th className="px-5 py-3 font-semibold">Subject Name</th>
                                    <th className="px-5 py-3 font-semibold">Credits</th>
                                    <th className="px-5 py-3 font-semibold">Syllabus</th>
                                    <th className="px-5 py-3 font-semibold">Added On</th>
                                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/60">
                                {subjects.map((s, i) => (
                                    <tr key={s.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="px-5 py-3 text-slate-500">{i + 1}</td>
                                        <td className="px-5 py-3 text-white font-medium">{s.subject_name}</td>
                                        <td className="px-5 py-3">
                                            <span className="bg-emerald-900/50 text-emerald-300 border border-emerald-700/50 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                                {s.credits} {s.credits === 1 ? 'credit' : 'credits'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            {s.syllabus_pdf_path ? (
                                                <a href={`http://localhost:5001/${s.syllabus_pdf_path}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 transition-colors">
                                                    <FileText size={14} />
                                                    <span className="text-xs font-semibold underline-offset-2 hover:underline">View PDF</span>
                                                    <ExternalLink size={12} className="opacity-70" />
                                                </a>
                                            ) : (
                                                <span className="text-slate-500 text-xs italic">No Syllabus</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-slate-500">
                                            {new Date(s.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <button 
                                                onClick={() => handleDeleteSubject(s.id, s.subject_name)}
                                                className="bg-red-900/40 hover:bg-red-600 text-red-400 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Authorized Teachers Panel ─────────────────────────────────────────────────
const AuthorizedTeachers = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [form, setForm] = useState({ name: '', email: '' });
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', email: '' });

    const fetchEntries = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/admin/approved-teachers');
            const data = await res.json();
            if (res.ok) setEntries(data.teachers);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEntries(); }, []);

    const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const res = await fetch('http://localhost:5001/api/admin/approved-teachers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message); return; }
            setEntries(prev => [data.teacher, ...prev]);
            flash(`${data.teacher.name} added successfully!`);
            setForm({ name: '', email: '' });
        } catch (err) {
            setError('Failed to connect to server.');
        } finally {
            setSubmitting(false);
        }
    };

    const startEdit = (t) => { setEditId(t.id); setEditForm({ name: t.name, email: t.email }); };
    const cancelEdit = () => { setEditId(null); setEditForm({ name: '', email: '' }); };

    const handleEdit = async (id) => {
        setError('');
        try {
            const res = await fetch(`http://localhost:5001/api/admin/approved-teachers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message); return; }
            setEntries(prev => prev.map(t => t.id === id ? data.teacher : t));
            cancelEdit();
            flash('Entry updated successfully!');
        } catch (err) {
            setError('Failed to connect to server.');
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Remove "${name}" from the approved list?`)) return;
        try {
            const res = await fetch(`http://localhost:5001/api/admin/approved-teachers/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setEntries(prev => prev.filter(t => t.id !== id));
                flash(`${name} removed.`);
            }
        } catch (err) {
            setError('Failed to connect to server.');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-white">Authorized Teachers</h2>
                <p className="text-slate-400 text-sm mt-1">Pre-approve teachers so they can self-register.</p>
            </div>

            {/* Add Form */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">Add Teacher</h3>
                <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 items-start">
                    <div className="flex-1">
                        <label className="block text-xs text-slate-400 mb-1 font-medium">Full Name</label>
                        <input
                            id="teacherName"
                            type="text"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="e.g. Dr. Priya Sharma"
                            required
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-all"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs text-slate-400 mb-1 font-medium">Email</label>
                        <input
                            id="teacherEmail"
                            type="email"
                            value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            placeholder="e.g. priya@university.ac.in"
                            required
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-all"
                        />
                    </div>
                    <div className="pt-5">
                        <button
                            id="addTeacherBtn"
                            type="submit"
                            disabled={submitting}
                            className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                        >
                            {submitting ? <Loader2 size={15} className="animate-spin" /> : <PlusCircle size={15} />}
                            <span>{submitting ? 'Adding...' : 'Add'}</span>
                        </button>
                    </div>
                </form>
                {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
                {success && <p className="mt-3 text-amber-400 text-sm">{success}</p>}
            </div>

            {/* Table */}
            <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                    Approved Teachers ({entries.length})
                </h3>
                {loading ? (
                    <div className="flex items-center space-x-3 text-slate-500 py-8">
                        <Loader2 className="animate-spin" size={20} />
                        <span className="text-sm">Loading...</span>
                    </div>
                ) : entries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-600 space-y-2">
                        <Users size={40} className="opacity-30" />
                        <p className="text-sm">No teachers added yet.</p>
                    </div>
                ) : (
                    <div className="rounded-xl border border-slate-700 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-700/60 text-slate-400 uppercase text-xs">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">#</th>
                                    <th className="px-5 py-3 font-semibold">Name</th>
                                    <th className="px-5 py-3 font-semibold">Email</th>
                                    <th className="px-5 py-3 font-semibold">Added On</th>
                                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/60">
                                {entries.map((t, i) => (
                                    <tr key={t.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="px-5 py-3 text-slate-500">{i + 1}</td>
                                        <td className="px-5 py-3">
                                            {editId === t.id ? (
                                                <input
                                                    value={editForm.name}
                                                    onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                                                    className="bg-slate-900 border border-amber-500/50 rounded-lg px-3 py-1 text-sm text-white outline-none w-full"
                                                />
                                            ) : (
                                                <span className="text-white font-medium">{t.name}</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3">
                                            {editId === t.id ? (
                                                <input
                                                    type="email"
                                                    value={editForm.email}
                                                    onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                                                    className="bg-slate-900 border border-amber-500/50 rounded-lg px-3 py-1 text-sm text-white outline-none w-full"
                                                />
                                            ) : (
                                                <span className="text-slate-300">{t.email}</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                                            {new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </td>
                                        <td className="px-5 py-3 text-right whitespace-nowrap">
                                            {editId === t.id ? (
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button onClick={() => handleEdit(t.id)}
                                                        className="bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                                                        Save
                                                    </button>
                                                    <button onClick={cancelEdit}
                                                        className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button onClick={() => startEdit(t)}
                                                        className="bg-slate-700 hover:bg-amber-500/80 hover:text-slate-900 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDelete(t.id, t.name)}
                                                        className="bg-red-900/40 hover:bg-red-600 text-red-400 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Assign Students Panel ─────────────────────────────────────────────────────────────
const AssignStudents = () => {
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [mentorId, setMentorId] = useState('');
    const [assistanceId, setAssistanceId] = useState('');
    const [studentSearch, setStudentSearch] = useState('');
    const [showStudentList, setShowStudentList] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowStudentList(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3500); };

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [tRes, sRes, aRes] = await Promise.all([
                    fetch('http://localhost:5001/api/admin/teachers'),
                    fetch('http://localhost:5001/api/admin/students'),
                    fetch('http://localhost:5001/api/admin/assignments'),
                ]);
                const [tData, sData, aData] = await Promise.all([tRes.json(), sRes.json(), aRes.json()]);
                if (tRes.ok) setTeachers(tData.teachers);
                if (sRes.ok) setStudents(sData.students);
                if (aRes.ok) setAssignments(aData.assignments);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const filteredStudents = students.filter(s => {
        const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
        const query = studentSearch.toLowerCase();
        const alreadyPicked = selectedStudents.some(x => x.roll_no === s.roll_no);
        return !alreadyPicked && (fullName.includes(query) || s.roll_no.toLowerCase().includes(query));
    });

    const addStudent = (s) => {
        setSelectedStudents(prev => [...prev, { roll_no: s.roll_no, name: `${s.first_name} ${s.last_name}` }]);
        setStudentSearch('');
        setShowStudentList(false);
    };

    const removeSelectedStudent = (rollNo) =>
        setSelectedStudents(prev => prev.filter(s => s.roll_no !== rollNo));

    const handleAssign = async (e) => {
        e.preventDefault();
        setError('');
        if (!mentorId) { setError('Please select a Mentor Teacher.'); return; }
        if (!selectedStudents.length) { setError('Please add at least one student.'); return; }
        setSubmitting(true);
        try {
            const res = await fetch('http://localhost:5001/api/admin/assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mentor_teacher_id: mentorId,
                    assistance_teacher_id: assistanceId || null,
                    student_roll_nos: selectedStudents.map(s => s.roll_no),
                }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message); return; }
            const aRes = await fetch('http://localhost:5001/api/admin/assignments');
            const aData = await aRes.json();
            if (aRes.ok) setAssignments(aData.assignments);
            flash(`${selectedStudents.length} student(s) assigned successfully!`);
            setSelectedStudents([]);
            setMentorId('');
            setAssistanceId('');
        } catch (err) {
            setError('Failed to connect to server.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemove = async (id) => {
        if (!window.confirm('Remove this assignment?')) return;
        try {
            const res = await fetch(`http://localhost:5001/api/admin/assignments/${id}`, { method: 'DELETE' });
            if (res.ok) { setAssignments(prev => prev.filter(a => a.id !== id)); flash('Assignment removed.'); }
        } catch (err) {
            setError('Failed to connect to server.');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-white">Assign Students</h2>
                <p className="text-slate-400 text-sm mt-1">Assign students to Mentor and (optionally) Assistant Mentor.</p>
            </div>

            <form onSubmit={handleAssign} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-5">
                <h3 className="text-sm font-semibold text-slate-300">New Assignment</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1 font-medium">
                            Mentor <span className="text-red-400">*</span>
                        </label>
                        <select id="mentorSelect" value={mentorId} onChange={e => setMentorId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition-all">
                            <option value="">— Select Mentor —</option>
                            {teachers.map(t => (
                                <option key={t.teacher_id} value={t.teacher_id}>
                                    {t.first_name} {t.last_name} ({t.department})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1 font-medium">
                            Assistant Mentor <span className="text-slate-500">(optional)</span>
                        </label>
                        <select id="assistanceSelect" value={assistanceId} onChange={e => setAssistanceId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition-all">
                            <option value="">— None —</option>
                            {teachers.filter(t => t.teacher_id !== mentorId).map(t => (
                                <option key={t.teacher_id} value={t.teacher_id}>
                                    {t.first_name} {t.last_name} ({t.department})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs text-slate-400 mb-1 font-medium">
                        Students <span className="text-red-400">*</span>
                    </label>
                    {selectedStudents.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {selectedStudents.map(s => (
                                <div key={s.roll_no}
                                    className="flex items-center space-x-2 bg-violet-900/40 border border-violet-700/50 text-violet-200 text-xs font-medium px-3 py-1.5 rounded-full">
                                    <span>{s.name}</span>
                                    <span className="text-violet-400 font-mono">({s.roll_no})</span>
                                    <button type="button" onClick={() => removeSelectedStudent(s.roll_no)}
                                        className="text-violet-400 hover:text-red-400 transition-colors ml-1">×</button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="relative" ref={dropdownRef}>
                        <input id="studentSearch" type="text" value={studentSearch}
                            onChange={e => { setStudentSearch(e.target.value); setShowStudentList(true); }}
                            onFocus={() => setShowStudentList(true)}
                            placeholder="Search by name or roll number..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition-all"
                        />
                        <AnimatePresence>
                            {showStudentList && filteredStudents.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                    className="absolute z-20 mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-52 overflow-y-auto"
                                >
                                    {filteredStudents.slice(0, 15).map(s => (
                                        <button key={s.roll_no} type="button" onClick={() => addStudent(s)}
                                            className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-violet-900/30 transition-colors text-left">
                                            <span className="text-white font-medium">{s.first_name} {s.last_name}</span>
                                            <span className="text-slate-400 font-mono text-xs">{s.roll_no}</span>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Search and click a student to add them. They will be re-assigned if already assigned.</p>
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}
                {success && <p className="text-emerald-400 text-sm">{success}</p>}

                <button id="assignBtn" type="submit" disabled={submitting || !mentorId || !selectedStudents.length}
                    className="flex items-center space-x-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                    {submitting ? <Loader2 size={15} className="animate-spin" /> : <PlusCircle size={15} />}
                    <span>{submitting ? 'Assigning...' : `Assign ${selectedStudents.length > 0 ? `${selectedStudents.length} Student(s)` : 'Students'}`}</span>
                </button>
            </form>

            <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                    Current Assignments ({assignments.length} student{assignments.length !== 1 ? 's' : ''})
                </h3>
                {loading ? (
                    <div className="flex items-center space-x-3 text-slate-500 py-8">
                        <Loader2 className="animate-spin" size={20} /><span className="text-sm">Loading...</span>
                    </div>
                ) : assignments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-600 space-y-2">
                        <Users size={40} className="opacity-30" /><p className="text-sm">No assignments yet.</p>
                    </div>
                ) : (
                    <AssignmentGroups assignments={assignments} onRemove={handleRemove} />
                )}
            </div>
        </div>
    );
};

// Groups assignments by mentor+assistance pair and renders an accordion
const AssignmentGroups = ({ assignments, onRemove }) => {
    const [openGroups, setOpenGroups] = useState({});

    // Build groups keyed by "mentorId|assistanceId"
    const groups = assignments.reduce((acc, a) => {
        const key = `${a.mentor_teacher_id}|${a.assistance_teacher_id ?? ''}`;
        if (!acc[key]) {
            acc[key] = {
                key,
                mentor_name: a.mentor_name,
                assistance_name: a.assistance_name || null,
                students: [],
            };
        }
        acc[key].students.push(a);
        return acc;
    }, {});

    const toggleGroup = (key) =>
        setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className="space-y-3">
            {Object.values(groups).map(group => (
                <div key={group.key} className="rounded-xl border border-slate-700 overflow-hidden">
                    {/* Group Header — click to expand */}
                    <button
                        onClick={() => toggleGroup(group.key)}
                        className="w-full flex items-center justify-between px-5 py-4 bg-slate-800/80 hover:bg-slate-700/60 transition-colors text-left group"
                    >
                        <div className="flex items-center space-x-4">
                            {/* Teacher pair badges */}
                            <div className="flex items-center space-x-2">
                                <span className="inline-flex items-center space-x-1.5 bg-violet-900/50 border border-violet-700/50 text-violet-200 text-xs font-semibold px-3 py-1.5 rounded-full">
                                    <Users size={11} />
                                    <span>{group.mentor_name}</span>
                                    <span className="text-violet-400 text-[10px] ml-1">Mentor</span>
                                </span>
                                {group.assistance_name && (
                                    <>
                                        <span className="text-slate-600 text-xs">+</span>
                                        <span className="inline-flex items-center space-x-1.5 bg-slate-700/60 border border-slate-600/50 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                                            <Users size={11} />
                                            <span>{group.assistance_name}</span>
                                            <span className="text-slate-500 text-[10px] ml-1">Asst. Mentor</span>
                                        </span>
                                    </>
                                )}
                                {!group.assistance_name && (
                                    <span className="text-slate-600 text-xs italic">No assistant mentor</span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 shrink-0">
                            <span className="text-xs font-medium text-slate-400 bg-slate-700/60 px-2.5 py-1 rounded-full">
                                {group.students.length} student{group.students.length !== 1 ? 's' : ''}
                            </span>
                            <motion.div animate={{ rotate: openGroups[group.key] ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                <ChevronDown size={16} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
                            </motion.div>
                        </div>
                    </button>

                    {/* Expandable student list */}
                    <AnimatePresence>
                        {openGroups[group.key] && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="divide-y divide-slate-700/60 border-t border-slate-700">
                                    {group.students.map((a, idx) => (
                                        <div key={a.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-700/20 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <span className="text-slate-600 text-xs font-mono w-5 text-right">{idx + 1}.</span>
                                                <div>
                                                    <p className="text-white text-sm font-medium">{a.student_name}</p>
                                                    <p className="text-violet-400 font-mono text-xs">{a.student_roll_no}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => onRemove(a.id)}
                                                className="bg-red-900/40 hover:bg-red-600 text-red-400 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0">
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );

};

// ── Student Verifications Panel ───────────────────────────────────────────────
const StudentVerifications = () => {
    const [unverified, setUnverified] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchUnverified = async () => {
            try {
                const res = await fetch('http://localhost:5001/api/admin/unverified-students');
                const data = await res.json();
                if (res.ok) setUnverified(data.students);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch unverified students.');
            } finally {
                setLoading(false);
            }
        };
        fetchUnverified();
    }, []);

    const handleVerify = async (id, name) => {
        setError('');
        try {
            const res = await fetch(`http://localhost:5001/api/admin/verify-student/${id}`, { method: 'POST' });
            if (res.ok) {
                setUnverified(prev => prev.filter(s => s.id !== id));
                setSuccess(`Student ${name} verified successfully.`);
                setTimeout(() => setSuccess(''), 3000);
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to verify');
            }
        } catch (err) {
            setError('Failed to connect to server.');
        }
    };

    const handleReject = async (id, name) => {
        if (!window.confirm(`Are you sure you want to REJECT and delete the registration request for ${name}?`)) return;
        setError('');
        try {
            const res = await fetch(`http://localhost:5001/api/admin/reject-student/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setUnverified(prev => prev.filter(s => s.id !== id));
                setSuccess(`Registration for ${name} rejected and deleted.`);
                setTimeout(() => setSuccess(''), 3000);
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to reject');
            }
        } catch (err) {
            setError('Failed to connect to server.');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-32 space-x-3 text-slate-500">
            <Loader2 className="animate-spin" size={22} /><span>Loading...</span>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-white">Student Verifications</h2>
                <p className="text-slate-400 text-sm mt-1">Review and approve new student registrations.</p>
            </div>
            
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className="text-emerald-400 text-sm">{success}</p>}

            {unverified.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-500 space-y-3">
                    <ShieldCheck size={48} className="opacity-20 text-emerald-400" />
                    <p className="text-sm">No pending verifications.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {unverified.map(s => {
                        const fullName = `${s.first_name}${s.middle_name ? ` ${s.middle_name}` : ''} ${s.last_name}`;
                        return (
                            <div key={s.roll_no} className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{fullName}</h3>
                                        <p className="text-emerald-400 font-mono text-sm">{s.roll_no}</p>
                                    </div>
                                    <span className="bg-amber-900/40 text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-700/50">
                                        Pending
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm mb-5">
                                    <div><span className="text-slate-500 block text-xs">Email</span><span className="text-slate-300">{s.email}</span></div>
                                    <div><span className="text-slate-500 block text-xs">Mobile</span><span className="text-slate-300">{s.mobile_number}</span></div>
                                    <div className="col-span-2 sm:col-span-1"><span className="text-slate-500 block text-xs">Father</span><span className="text-slate-300">{s.father_name}</span></div>
                                    <div className="col-span-2 sm:col-span-1"><span className="text-slate-500 block text-xs">Mother</span><span className="text-slate-300">{s.mother_name}</span></div>
                                    <div><span className="text-slate-500 block text-xs">D.O.B</span><span className="text-slate-300">{new Date(s.dob).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span></div>
                                    <div><span className="text-slate-500 block text-xs">Admission</span><span className="text-slate-300">{s.year_of_admission}</span></div>
                                    <div><span className="text-slate-500 block text-xs">Mode</span><span className="text-slate-300">{s.admission_mode}</span></div>
                                    <div><span className="text-slate-500 block text-xs">Type</span><span className="text-slate-300">{s.admission_type}</span></div>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => handleReject(s.id, fullName)} className="flex-1 bg-slate-700/50 hover:bg-red-500/20 text-slate-300 hover:text-red-400 font-bold py-2 rounded-lg transition-colors flex justify-center items-center space-x-2 border border-transparent hover:border-red-500/30">
                                        <Trash2 size={16} /><span>Reject</span>
                                    </button>
                                    <button onClick={() => handleVerify(s.id, fullName)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg transition-colors flex justify-center items-center space-x-2">
                                        <ShieldCheck size={16} /><span>Approve</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ── Panel registry ─────────────────────────────────────────────────────────────
// ── Notifications Panel ───────────────────────────────────────────────────────
const MultiSelect = ({ label, options, selected, onChange }) => {
    const allSelected = selected.length === 0;
    const toggle = (val) => {
        if (val === 'all') { onChange([]); return; }
        const next = selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val];
        onChange(next);
    };
    return (
        <div>
            <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">{label}</label>
            <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => toggle('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                        allSelected ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}>All</button>
                {options.map(opt => (
                    <button key={opt} type="button" onClick={() => toggle(String(opt))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                            selected.includes(String(opt)) ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        }`}>{opt}</button>
                ))}
            </div>
        </div>
    );
};

const NotificationsPanel = () => {
    const [filterOptions, setFilterOptions] = useState({ admission_types: [], admission_modes: [], admission_years: [] });
    const [selTypes, setSelTypes] = useState([]);
    const [selModes, setSelModes] = useState([]);
    const [selYears, setSelYears] = useState([]);
    const [message, setMessage] = useState('');
    const [pdfFile, setPdfFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loadingList, setLoadingList] = useState(true);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [prevExpanded, setPrevExpanded] = useState(false);
    const fileRef = React.useRef();

    const fetchNotifications = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/notifications/admin');
            const data = await res.json();
            if (res.ok) setNotifications(data.notifications);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        fetch('http://localhost:5001/api/notifications/filter-options')
            .then(r => r.json()).then(d => setFilterOptions(d)).catch(console.error);
        fetchNotifications();
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim()) { setFormError('Please write a notification message.'); return; }
        setSubmitting(true); setFormError(''); setFormSuccess('');
        try {
            const fd = new FormData();
            fd.append('message', message.trim());
            if (selTypes.length) fd.append('admission_types', JSON.stringify(selTypes));
            if (selModes.length) fd.append('admission_modes', JSON.stringify(selModes));
            if (selYears.length) fd.append('admission_years', JSON.stringify(selYears));
            if (pdfFile) fd.append('pdf', pdfFile);

            const res = await fetch('http://localhost:5001/api/notifications', { method: 'POST', body: fd });
            const data = await res.json();
            if (res.ok) {
                setNotifications(prev => [data.notification, ...prev]);
                setMessage(''); setPdfFile(null); setSelTypes([]); setSelModes([]); setSelYears([]);
                if (fileRef.current) fileRef.current.value = '';
                setFormSuccess('Notification sent successfully!');
                setTimeout(() => setFormSuccess(''), 3000);
            } else {
                setFormError(data.message || 'Failed to send.');
            }
        } catch {
            setFormError('Failed to connect to server.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this notification?')) return;
        try {
            const res = await fetch(`http://localhost:5001/api/notifications/${id}`, { method: 'DELETE' });
            if (res.ok) setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) { console.error(err); }
    };

    const now = new Date();
    const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recent = notifications.filter(n => new Date(n.created_at) >= cutoff);
    const previous = notifications.filter(n => new Date(n.created_at) < cutoff);

    const NotifCard = ({ n }) => (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-slate-200 leading-relaxed flex-1">{n.message}</p>
                <button onClick={() => handleDelete(n.id)}
                    className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors shrink-0">
                    <Trash2 size={13} />
                </button>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="text-xs text-slate-500">{new Date(n.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                {n.target_admission_types && <span className="text-[10px] bg-violet-900/40 text-violet-300 border border-violet-700/40 px-2 py-0.5 rounded-full">Type: {n.target_admission_types.join(', ')}</span>}
                {n.target_admission_modes && <span className="text-[10px] bg-blue-900/40 text-blue-300 border border-blue-700/40 px-2 py-0.5 rounded-full">Mode: {n.target_admission_modes.join(', ')}</span>}
                {n.target_admission_years && <span className="text-[10px] bg-amber-900/40 text-amber-300 border border-amber-700/40 px-2 py-0.5 rounded-full">Year: {n.target_admission_years.join(', ')}</span>}
                {n.pdf_path && (
                    <a href={`http://localhost:5001/${n.pdf_path}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 text-xs transition-colors">
                        <FileText size={12} /><span>Attachment</span><ExternalLink size={10} />
                    </a>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-white">Notifications</h2>
                <p className="text-slate-400 text-sm mt-1">Send targeted announcements to students and all faculty.</p>
            </div>

            {/* Compose Form */}
            <form onSubmit={handleSend} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-5">
                <h3 className="text-sm font-semibold text-slate-300">Compose Notification</h3>

                {/* Student Filters */}
                <div className="space-y-4 pb-4 border-b border-slate-700">
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Student Filters <span className="normal-case text-slate-600">(leave all on "All" to target every student)</span></p>
                    <MultiSelect label="Admission Type" options={filterOptions.admission_types} selected={selTypes} onChange={setSelTypes} />
                    <MultiSelect label="Mode of Admission" options={filterOptions.admission_modes} selected={selModes} onChange={setSelModes} />
                    <MultiSelect label="Year of Admission" options={filterOptions.admission_years} selected={selYears} onChange={setSelYears} />
                </div>

                {/* Message */}
                <div>
                    <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Message <span className="text-red-400">*</span></label>
                    <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        rows={4}
                        placeholder="Write your notification here..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all resize-none"
                    />
                </div>

                {/* PDF Attachment */}
                <div>
                    <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Attachment PDF <span className="text-slate-500">(optional, max 5MB)</span></label>
                    <input ref={fileRef} type="file" accept="application/pdf" id="notifPdf"
                        onChange={e => {
                            const file = e.target.files[0];
                            if (file && file.size > 5 * 1024 * 1024) { setFormError('PDF must be under 5MB.'); e.target.value = ''; setPdfFile(null); }
                            else { setFormError(''); setPdfFile(file || null); }
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300 outline-none focus:border-emerald-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 transition-all cursor-pointer"
                    />
                </div>

                {formError && <p className="text-red-400 text-sm">{formError}</p>}
                {formSuccess && <p className="text-emerald-400 text-sm">{formSuccess}</p>}

                <button type="submit" disabled={submitting}
                    className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                    {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    <span>{submitting ? 'Sending...' : 'Send Notification'}</span>
                </button>
            </form>

            {/* Sent Notifications List */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                    Recent — Last 7 Days ({recent.length})
                </h3>
                {loadingList ? (
                    <div className="flex items-center space-x-2 text-slate-500 py-4"><Loader2 size={18} className="animate-spin" /><span className="text-sm">Loading...</span></div>
                ) : recent.length === 0 ? (
                    <p className="text-sm text-slate-600 py-4">No recent notifications.</p>
                ) : (
                    <div className="space-y-3">{recent.map(n => <NotifCard key={n.id} n={n} />)}</div>
                )}

                {previous.length > 0 && (
                    <div className="mt-4">
                        <button onClick={() => setPrevExpanded(p => !p)}
                            className="flex items-center space-x-2 text-xs text-slate-500 hover:text-slate-300 font-semibold uppercase tracking-wide transition-colors">
                            {prevExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            <span>Previous Notifications ({previous.length})</span>
                        </button>
                        <AnimatePresence>
                            {prevExpanded && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                                    <div className="space-y-3 mt-3">{previous.map(n => <NotifCard key={n.id} n={n} />)}</div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Validate Pre-PhD Results Panel ───────────────────────────────────────────
const ValidateResultPanel = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState({});

    const fetchResults = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/sac/results');
            const data = await res.json();
            if (res.ok) setResults(data.results);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchResults(); }, []);

    const verify = async (roll_no) => {
        setProcessing(p => ({ ...p, [roll_no]: 'verifying' }));
        try {
            const res = await fetch(`http://localhost:5001/api/sac/results/${roll_no}/verify`, { method: 'POST' });
            if (res.ok) setResults(prev => prev.map(r => r.roll_no === roll_no ? { ...r, verified_by_admin: true, admin_verified_at: new Date().toISOString() } : r));
        } catch (err) { console.error(err); }
        finally { setProcessing(p => ({ ...p, [roll_no]: null })); }
    };

    const reject = async (roll_no, name) => {
        if (!window.confirm(`Reject and delete the result submitted by ${name}? The student will be able to re-upload.`)) return;
        setProcessing(p => ({ ...p, [roll_no]: 'rejecting' }));
        try {
            const res = await fetch(`http://localhost:5001/api/sac/results/${roll_no}/reject`, { method: 'DELETE' });
            if (res.ok) setResults(prev => prev.filter(r => r.roll_no !== roll_no));
        } catch (err) { console.error(err); }
        finally { setProcessing(p => ({ ...p, [roll_no]: null })); }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-white">Validate Pre-PhD Results</h2>
                <p className="text-slate-400 text-sm mt-1">Review uploaded results. Verify to unlock SAC assignment, or reject so the student can re-upload.</p>
            </div>
            {loading ? (
                <div className="flex items-center space-x-2 text-slate-500 py-8"><Loader2 size={20} className="animate-spin" /><span>Loading...</span></div>
            ) : results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-600 space-y-3">
                    <ClipboardCheck size={40} className="opacity-30" />
                    <p className="text-sm">No results submitted yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {results.map(r => (
                        <div key={r.roll_no} className={`bg-slate-800/60 border rounded-2xl p-5 space-y-3 ${r.verified_by_admin ? 'border-emerald-800/50' : 'border-slate-700'}`}>
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div>
                                    <p className="font-bold text-white text-base">{r.first_name} {r.last_name}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{r.roll_no} · {r.email}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Submitted: {new Date(r.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {r.verified_by_admin ? (
                                        <span className="flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 rounded-xl">
                                            <CheckCircle2 size={13} /><span>Verified</span>
                                        </span>
                                    ) : (
                                        <>
                                            <button onClick={() => verify(r.roll_no)} disabled={!!processing[r.roll_no]}
                                                className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 bg-emerald-900/30 hover:bg-emerald-700 text-emerald-400 hover:text-white rounded-xl transition-colors disabled:opacity-50">
                                                {processing[r.roll_no] === 'verifying' ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                                                <span>Verify</span>
                                            </button>
                                            <button onClick={() => reject(r.roll_no, `${r.first_name} ${r.last_name}`)} disabled={!!processing[r.roll_no]}
                                                className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 bg-red-900/30 hover:bg-red-700 text-red-400 hover:text-white rounded-xl transition-colors disabled:opacity-50">
                                                {processing[r.roll_no] === 'rejecting' ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                                                <span>Reject</span>
                                            </button>
                                        </>
                                    )}
                                    <a href={`http://localhost:5001/${r.result_pdf_path}`} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-xl transition-colors">
                                        <FileText size={12} /><span>View PDF</span><ExternalLink size={10} className="ml-1" />
                                    </a>
                                </div>
                            </div>
                            {r.verified_by_admin && r.sac_count > 0 && (
                                <p className="text-xs text-emerald-400/70">{r.sac_count} SAC member(s) already assigned</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── SAC Members Panel ─────────────────────────────────────────────────────────
const SacMembersPanel = () => {
    const [members, setMembers] = useState([]);
    const [form, setForm] = useState({ name: '', designation: '', phone_number: '', email: '', affiliation: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchMembers = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/sac/members');
            const data = await res.json();
            if (res.ok) setMembers(data.members);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchMembers(); }, []);

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true); setError(''); setSuccess('');
        try {
            const res = await fetch('http://localhost:5001/api/sac/members', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
            });
            const data = await res.json();
            if (res.ok) {
                setMembers(prev => [...prev, data.member].sort((a, b) => a.name.localeCompare(b.name)));
                setForm({ name: '', designation: '', phone_number: '', email: '', affiliation: '' });
                setSuccess('SAC member added!'); setTimeout(() => setSuccess(''), 3000);
            } else { setError(data.message); }
        } catch { setError('Failed to connect to server.'); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Remove ${name} from the SAC member pool?`)) return;
        try {
            const res = await fetch(`http://localhost:5001/api/sac/members/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) setMembers(prev => prev.filter(m => m.id !== id));
            else alert(data.message);
        } catch (err) { console.error(err); }
    };

    const fields = [
        { name: 'name', label: 'Full Name', placeholder: 'Dr. John Smith' },
        { name: 'designation', label: 'Designation', placeholder: 'Professor' },
        { name: 'affiliation', label: 'Affiliation', placeholder: 'IIT Delhi – Computer Science' },
        { name: 'email', label: 'Email', placeholder: 'john@university.edu', type: 'email' },
        { name: 'phone_number', label: 'Phone Number', placeholder: '9876543210', type: 'tel' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-white">SAC Members</h2>
                <p className="text-slate-400 text-sm mt-1">Manage the pool of Student Advisory Committee members available for assignment.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-slate-300">Add New Member</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {fields.map(f => (
                        <div key={f.name} className={f.name === 'affiliation' ? 'sm:col-span-2' : ''}>
                            <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">
                                {f.label} <span className="text-red-400">*</span>
                            </label>
                            <input type={f.type || 'text'} name={f.name} value={form[f.name]} onChange={handleChange}
                                required placeholder={f.placeholder}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                            />
                        </div>
                    ))}
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                {success && <p className="text-emerald-400 text-sm">{success}</p>}
                <button type="submit" disabled={submitting}
                    className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : <PlusCircle size={14} />}
                    <span>{submitting ? 'Adding...' : 'Add SAC Member'}</span>
                </button>
            </form>

            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Registered Members ({members.length})</h3>
                {loading ? (
                    <div className="flex items-center space-x-2 text-slate-500 py-4"><Loader2 size={18} className="animate-spin" /><span className="text-sm">Loading...</span></div>
                ) : members.length === 0 ? (
                    <p className="text-sm text-slate-600 py-4">No SAC members added yet.</p>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-700">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-700/60 text-slate-400 uppercase text-xs">
                                <tr>{['Name', 'Designation', 'Affiliation', 'Email', 'Phone', ''].map((h, i) => (
                                    <th key={i} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                                ))}</tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/60">
                                {members.map(m => (
                                    <tr key={m.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{m.name}</td>
                                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{m.designation}</td>
                                        <td className="px-4 py-3 text-slate-300">{m.affiliation}</td>
                                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{m.email}</td>
                                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{m.phone_number}</td>
                                        <td className="px-3 py-3 text-right">
                                            <button onClick={() => handleDelete(m.id, m.name)} title="Remove SAC member"
                                                className="w-7 h-7 flex items-center justify-center bg-red-900/30 hover:bg-red-700 text-red-400 hover:text-white rounded-lg transition-colors">
                                                <Trash2 size={13} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Assign SAC Panel ──────────────────────────────────────────────────────────
const SacAssignPanel = () => {
    const [students, setStudents] = useState([]);
    const [allMembers, setAllMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);
    const [selected, setSelected] = useState({});
    const [loadingAssign, setLoadingAssign] = useState({});
    const [saving, setSaving] = useState({});
    const [saveMsg, setSaveMsg] = useState({});

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [sRes, mRes] = await Promise.all([
                    fetch('http://localhost:5001/api/sac/students-with-sac'),
                    fetch('http://localhost:5001/api/sac/members'),
                ]);
                const [sd, md] = await Promise.all([sRes.json(), mRes.json()]);
                if (sRes.ok) setStudents(sd.students);
                if (mRes.ok) setAllMembers(md.members);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchAll();
    }, []);

    const expandStudent = async (rollNo) => {
        if (expanded === rollNo) { setExpanded(null); return; }
        setExpanded(rollNo);
        if (selected[rollNo] !== undefined) return;
        setLoadingAssign(p => ({ ...p, [rollNo]: true }));
        try {
            const res = await fetch(`http://localhost:5001/api/sac/assignments/${rollNo}`);
            const data = await res.json();
            if (res.ok) setSelected(prev => ({ ...prev, [rollNo]: new Set(data.assignments.map(a => a.id)) }));
        } catch (err) { console.error(err); }
        finally { setLoadingAssign(p => ({ ...p, [rollNo]: false })); }
    };

    const toggleMember = (rollNo, memberId) => {
        setSelected(prev => {
            const cur = new Set(prev[rollNo] || []);
            if (cur.has(memberId)) cur.delete(memberId);
            else if (cur.size >= 5) return prev;
            else cur.add(memberId);
            return { ...prev, [rollNo]: cur };
        });
    };

    const saveAssignment = async (rollNo) => {
        setSaving(p => ({ ...p, [rollNo]: true }));
        const ids = [...(selected[rollNo] || [])];
        try {
            const res = await fetch(`http://localhost:5001/api/sac/assignments/${rollNo}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sac_member_ids: ids })
            });
            const data = await res.json();
            if (res.ok) {
                setStudents(prev => prev.map(s => s.roll_no === rollNo ? { ...s, sac_count: ids.length } : s));
                setSaveMsg(prev => ({ ...prev, [rollNo]: 'Saved!' }));
            } else {
                setSaveMsg(prev => ({ ...prev, [rollNo]: data.message }));
            }
            setTimeout(() => setSaveMsg(prev => ({ ...prev, [rollNo]: null })), 3000);
        } catch { setSaveMsg(prev => ({ ...prev, [rollNo]: 'Connection error' })); }
        finally { setSaving(p => ({ ...p, [rollNo]: false })); }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-white">Assign SAC Members</h2>
                <p className="text-slate-400 text-sm mt-1">Assign up to 5 SAC members to each student with a verified result.</p>
            </div>
            {loading ? (
                <div className="flex items-center space-x-2 text-slate-500 py-8"><Loader2 size={20} className="animate-spin" /><span>Loading...</span></div>
            ) : students.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-600 space-y-3">
                    <Award size={40} className="opacity-30" />
                    <p className="text-sm">No students with verified results yet.</p>
                    <p className="text-xs text-slate-700">Verify results in the "Validate Result" tab first.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {students.map(s => {
                        const sel = selected[s.roll_no] || new Set();
                        const isOpen = expanded === s.roll_no;
                        return (
                            <div key={s.roll_no} className={`border rounded-2xl overflow-hidden transition-all ${isOpen ? 'border-amber-700/60 bg-slate-800/60' : 'border-slate-700 bg-slate-800/30'}`}>
                                <button className="w-full flex items-center justify-between px-5 py-4 text-left" onClick={() => expandStudent(s.roll_no)}>
                                    <div>
                                        <p className="font-bold text-white">{s.first_name} {s.last_name}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{s.roll_no} · Admission Year: {s.year_of_admission}</p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${s.sac_count > 0 ? 'bg-amber-900/40 text-amber-300 border-amber-700/50' : 'bg-slate-700/50 text-slate-500 border-slate-600/30'}`}>
                                            {s.sac_count}/5 assigned
                                        </span>
                                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                            <ChevronDown size={16} className="text-slate-400" />
                                        </motion.div>
                                    </div>
                                </button>
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                                            <div className="px-5 pb-5 space-y-3 border-t border-slate-700/60 pt-4">
                                                {loadingAssign[s.roll_no] ? (
                                                    <div className="flex items-center space-x-2 text-slate-500 py-3"><Loader2 size={16} className="animate-spin" /><span className="text-sm">Loading...</span></div>
                                                ) : (
                                                    <>
                                                        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
                                                            Select SAC Members ({sel.size}/5 selected)
                                                        </p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {allMembers.map(m => {
                                                                const isChecked = sel.has(m.id);
                                                                const isDisabled = !isChecked && sel.size >= 5;
                                                                return (
                                                                    <label key={m.id}
                                                                        className={`flex items-start space-x-3 border rounded-xl px-4 py-3 transition-all ${isChecked ? 'border-amber-600/60 bg-amber-900/20 cursor-pointer' : isDisabled ? 'border-slate-700/30 opacity-40 cursor-not-allowed' : 'border-slate-700 hover:border-slate-600 cursor-pointer'}`}>
                                                                        <input type="checkbox" checked={isChecked} disabled={isDisabled}
                                                                            onChange={() => !isDisabled && toggleMember(s.roll_no, m.id)}
                                                                            className="mt-0.5 accent-amber-500" />
                                                                        <div>
                                                                            <p className="text-sm font-semibold text-white">{m.name}</p>
                                                                            <p className="text-xs text-slate-400">{m.designation}</p>
                                                                            <p className="text-xs text-slate-500">{m.affiliation}</p>
                                                                        </div>
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                        <div className="flex items-center space-x-3 pt-1">
                                                            <button onClick={() => saveAssignment(s.roll_no)} disabled={saving[s.roll_no]}
                                                                className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors">
                                                                {saving[s.roll_no] ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                                                                <span>{saving[s.roll_no] ? 'Saving...' : 'Save Assignment'}</span>
                                                            </button>
                                                            {saveMsg[s.roll_no] && (
                                                                <span className={`text-sm font-medium ${saveMsg[s.roll_no] === 'Saved!' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                                    {saveMsg[s.roll_no]}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const PANELS = {
    users: <UserManagement />,
    verifications: <StudentVerifications />,
    coursework: <CourseworkSubjects />,
    authorizedTeachers: <AuthorizedTeachers />,
    assignStudents: <AssignStudents />,
    notifications: <NotificationsPanel />,
    'validate-result': <ValidateResultPanel />,
    'sac-members': <SacMembersPanel />,
    'sac-assign': <SacAssignPanel />,
    'phd-presentation': <PhdRegistrationPresentationPanel />,
    'phd-letter': <PhdRegistrationLetterPanel />,
    'phd-progress': <PhdProgressReportPanel />,
};


// ── Main Admin Dashboard ──────────────────────────────────────────────────────
const AdminDashboard = () => {
    const navigate = useNavigate();
    const [active, setActive] = useState('users');

    const adminEmail = sessionStorage.getItem('adminEmail') || 'Admin';

    useEffect(() => {
        if (!sessionStorage.getItem('adminEmail')) { navigate('/login/admin'); }
        // Sync body background
        document.body.style.backgroundColor = '#0f172a'; // slate-900
        return () => { document.body.style.backgroundColor = ''; };
    }, [navigate]);

    const logout = () => {
        sessionStorage.removeItem('adminEmail');
        navigate('/login/admin');
    };

    return (
        <div className="h-screen overflow-hidden bg-slate-900 flex text-slate-100">
            {/* ── Sidebar ──────────────────────────────── */}
            <aside className="w-60 bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col h-screen fixed top-0 left-0 z-30 shadow-2xl border-r border-slate-800 overscroll-none">
                {/* Logo */}
                <div className="px-5 pt-7 pb-6">
                    <div className="flex flex-col items-center space-y-3">
                        <div className="w-14 h-14 bg-emerald-600/20 border border-emerald-600/30 rounded-2xl flex items-center justify-center shadow-lg">
                            <ShieldCheck size={28} className="text-emerald-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-white leading-tight">Admin Portal</p>
                            <p className="text-xs text-emerald-300/60 truncate max-w-[160px] mt-0.5">{adminEmail}</p>
                        </div>
                    </div>
                </div>

                <div className="mx-4 h-px bg-slate-800 mb-4" />

                {/* Nav */}
                <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                    {NAV.map(item => (
                        <SidebarItem key={item.id} item={item} active={active} onSelect={setActive} />
                    ))}
                </nav>

                {/* Logout */}
                <div className="px-3 pb-5">
                    <div className="mx-1 h-px bg-slate-800 mb-3" />
                    <button
                        id="adminLogout"
                        onClick={logout}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
                    >
                        <LogOut size={17} />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* ── Main Content ──────────────────────────── */}
            <main className="flex-1 ml-60 h-screen overflow-y-auto bg-slate-900 overscroll-none">
                {/* Welcome banner */}
                <div className="bg-gradient-to-r from-emerald-900/60 to-slate-800 mx-6 mt-6 rounded-2xl p-6 flex items-center justify-between shadow-lg border border-emerald-800/30 overflow-hidden relative">
                    <div className="relative z-10">
                        <p className="text-emerald-400 text-xs font-medium mb-1">
                            {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </p>
                        <h1 className="text-2xl font-bold text-white">Welcome, Admin!</h1>
                        <p className="text-slate-400 text-sm mt-1">Manage university records and operations.</p>
                    </div>
                    <div className="absolute right-0 top-0 w-48 h-48 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute right-20 bottom-0 w-28 h-28 bg-emerald-500/5 rounded-full translate-y-1/2" />
                    <div className="relative z-10 hidden md:flex items-center justify-center w-20 h-20 bg-emerald-600/20 border border-emerald-600/30 rounded-2xl backdrop-blur-sm">
                        <ShieldCheck size={36} className="text-emerald-400" />
                    </div>
                </div>

                {/* Panel content */}
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
                            {PANELS[active] ?? <Placeholder title={active} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
