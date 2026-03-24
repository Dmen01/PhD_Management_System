import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, LogOut, Search, Loader2, ShieldCheck, ChevronDown, BookOpen, PlusCircle, Trash2, UserPlus, Link2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ── Sidebar nav config ────────────────────────────────────────────────────────
const NAV = [
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'coursework', label: 'Coursework Subjects', icon: BookOpen },
    { id: 'authorizedTeachers', label: 'Authorized Teachers', icon: UserPlus },
    { id: 'assignStudents', label: 'Assign Students', icon: Link2 },
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

const StudentTable = ({ data, filter }) => {
    const [selectedId, setSelectedId] = useState(null);

    const rows = data.filter(s =>
        [s.first_name, s.last_name, s.email, s.application_number, s.mobile_number]
            .join(' ').toLowerCase().includes(filter.toLowerCase())
    );
    if (!rows.length) return <EmptyState label="student" />;

    const toggleRow = (id) => setSelectedId(prev => prev === id ? null : id);

    return (
        <div className="rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-700/60 text-slate-400 uppercase text-xs">
                    <tr>
                        <th className="px-5 py-3 font-semibold">App No.</th>
                        <th className="px-5 py-3 font-semibold">Student Name</th>
                        <th className="px-5 py-3 font-semibold text-right text-xs normal-case text-slate-500 font-normal tracking-normal">
                            Click a row to view details
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                    {rows.map(s => {
                        const isOpen = selectedId === s.application_number;
                        const fullName = `${s.first_name}${s.middle_name ? ` ${s.middle_name}` : ''} ${s.last_name}`;
                        return (
                            <React.Fragment key={s.application_number}>
                                <tr
                                    onClick={() => toggleRow(s.application_number)}
                                    className={`cursor-pointer transition-colors ${isOpen ? 'bg-emerald-900/20' : 'hover:bg-slate-700/30'}`}
                                >
                                    <td className="px-5 py-3 font-mono text-emerald-400 whitespace-nowrap">{s.application_number}</td>
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
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <DetailRow label="Application No." value={s.application_number} />
                                                    <DetailRow label="Full Name" value={fullName} />
                                                    <DetailRow label="Email" value={s.email} />
                                                    <DetailRow label="Mobile" value={s.mobile_number} />
                                                    <DetailRow label="Date of Birth" value={s.dob ? new Date(s.dob).toLocaleDateString('en-IN') : '—'} />
                                                    <DetailRow label="Father's Name" value={s.father_name} />
                                                    <DetailRow label="Mother's Name" value={s.mother_name} />
                                                    <DetailRow label="Year of Admission" value={s.year_of_admission} />
                                                    <DetailRow label="Registered On" value={new Date(s.created_at).toLocaleDateString('en-IN')} />
                                                </div>
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

const TeacherTable = ({ data, filter }) => {
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
                        {['Teacher ID', 'Name', 'Email', 'Department', 'Designation', 'Joined'].map(h => (
                            <th key={h} className="px-5 py-3 font-semibold whitespace-nowrap">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                    {rows.map(t => (
                        <tr key={t.teacher_id} className="hover:bg-slate-700/30 transition-colors">
                            <td className="px-5 py-3 font-mono text-emerald-400 whitespace-nowrap">{t.teacher_id}</td>
                            <td className="px-5 py-3 text-white font-medium whitespace-nowrap">
                                {t.first_name} {t.middle_name ? `${t.middle_name} ` : ''}{t.last_name}
                            </td>
                            <td className="px-5 py-3 text-slate-300">{t.email}</td>
                            <td className="px-5 py-3 text-slate-300 whitespace-nowrap">{t.department}</td>
                            <td className="px-5 py-3 text-slate-300 whitespace-nowrap">{t.designation}</td>
                            <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                                {new Date(t.created_at).toLocaleDateString('en-IN')}
                            </td>
                        </tr>
                    ))}
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

    useEffect(() => {
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
        fetchAll();
    }, []);

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
                            ? <StudentTable data={students} filter={search} />
                            : <TeacherTable data={teachers} filter={search} />
                        }
                    </motion.div>
                </AnimatePresence>
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
    const [form, setForm] = useState({ subject_name: '', credits: '' });

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
        try {
            const res = await fetch('http://localhost:5001/api/admin/subjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message); return; }
            setSubjects(prev => [data.subject, ...prev]);
            setSuccess(`"${data.subject.subject_name}" added successfully!`);
            setTimeout(() => setSuccess(''), 3000);
            setForm({ subject_name: '', credits: '' });
        } catch (err) {
            setError('Failed to connect to server.');
        } finally {
            setSubmitting(false);
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
                                    <th className="px-5 py-3 font-semibold">Added On</th>
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
                                        <td className="px-5 py-3 text-slate-500">
                                            {new Date(s.created_at).toLocaleDateString('en-IN')}
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
                                            {new Date(t.created_at).toLocaleDateString('en-IN')}
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
        const alreadyPicked = selectedStudents.some(x => x.application_number === s.application_number);
        return !alreadyPicked && (fullName.includes(query) || s.application_number.toLowerCase().includes(query));
    });

    const addStudent = (s) => {
        setSelectedStudents(prev => [...prev, { application_number: s.application_number, name: `${s.first_name} ${s.last_name}` }]);
        setStudentSearch('');
        setShowStudentList(false);
    };

    const removeSelectedStudent = (appNum) =>
        setSelectedStudents(prev => prev.filter(s => s.application_number !== appNum));

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
                    student_application_numbers: selectedStudents.map(s => s.application_number),
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
                <p className="text-slate-400 text-sm mt-1">Assign students to Mentor and (optionally) Assistance teachers.</p>
            </div>

            <form onSubmit={handleAssign} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-5">
                <h3 className="text-sm font-semibold text-slate-300">New Assignment</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1 font-medium">
                            Mentor Teacher <span className="text-red-400">*</span>
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
                            Assistance Teacher <span className="text-slate-500">(optional)</span>
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
                                <div key={s.application_number}
                                    className="flex items-center space-x-2 bg-violet-900/40 border border-violet-700/50 text-violet-200 text-xs font-medium px-3 py-1.5 rounded-full">
                                    <span>{s.name}</span>
                                    <span className="text-violet-400 font-mono">({s.application_number})</span>
                                    <button type="button" onClick={() => removeSelectedStudent(s.application_number)}
                                        className="text-violet-400 hover:text-red-400 transition-colors ml-1">×</button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="relative">
                        <input id="studentSearch" type="text" value={studentSearch}
                            onChange={e => { setStudentSearch(e.target.value); setShowStudentList(true); }}
                            onFocus={() => setShowStudentList(true)}
                            placeholder="Search by name or application number..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition-all"
                        />
                        <AnimatePresence>
                            {showStudentList && filteredStudents.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                    className="absolute z-20 mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-52 overflow-y-auto"
                                >
                                    {filteredStudents.slice(0, 15).map(s => (
                                        <button key={s.application_number} type="button" onClick={() => addStudent(s)}
                                            className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-violet-900/30 transition-colors text-left">
                                            <span className="text-white font-medium">{s.first_name} {s.last_name}</span>
                                            <span className="text-slate-400 font-mono text-xs">{s.application_number}</span>
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
                                            <span className="text-slate-500 text-[10px] ml-1">Assist.</span>
                                        </span>
                                    </>
                                )}
                                {!group.assistance_name && (
                                    <span className="text-slate-600 text-xs italic">No assistance teacher</span>
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
                                                    <p className="text-violet-400 font-mono text-xs">{a.student_application_number}</p>
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

// ── Panel registry ─────────────────────────────────────────────────────────────
const PANELS = {
    users: <UserManagement />,
    coursework: <CourseworkSubjects />,
    authorizedTeachers: <AuthorizedTeachers />,
    assignStudents: <AssignStudents />,
};


// ── Main Admin Dashboard ──────────────────────────────────────────────────────
const AdminDashboard = () => {
    const navigate = useNavigate();
    const [active, setActive] = useState('users');

    const adminEmail = localStorage.getItem('adminEmail') || 'Admin';

    const logout = () => {
        localStorage.removeItem('adminEmail');
        navigate('/login/admin');
    };

    return (
        <div className="min-h-screen bg-slate-900 flex text-slate-100">
            {/* ── Sidebar ──────────────────────────────── */}
            <aside className="w-60 bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col min-h-screen fixed top-0 left-0 z-30 shadow-2xl border-r border-slate-800">
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
            <main className="flex-1 ml-60 min-h-screen flex flex-col">
                {/* Welcome banner */}
                <div className="bg-gradient-to-r from-emerald-900/60 to-slate-800 mx-6 mt-6 rounded-2xl p-6 flex items-center justify-between shadow-lg border border-emerald-800/30 overflow-hidden relative">
                    <div className="relative z-10">
                        <p className="text-emerald-400 text-xs font-medium mb-1">
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
