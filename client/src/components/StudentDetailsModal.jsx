import React, { useState, useEffect } from 'react';
import { 
    X, User, Mail, Phone, Building2, Calendar, Hash, Award, 
    CreditCard, BookOpen, GraduationCap, Users, Target, 
    LayoutList, FileText, CheckCircle, ExternalLink, Loader2, ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Sub-components for Modal ──────────────────────────────────────────────────

const SectionTitle = ({ icon: Icon, title }) => (
    <div className="flex items-center space-x-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Icon size={18} />
        </div>
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
    </div>
);

const DetailRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-start space-x-3 py-3 border-b border-slate-100 last:border-0">
        {Icon && <Icon size={16} className="text-slate-400 mt-0.5 shrink-0" />}
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-sm font-semibold text-slate-700 mt-0.5">{value || '—'}</p>
        </div>
    </div>
);

// ── Fee Details Viewer ───────────────────────────────────────────────────────
const ModalFeeViewer = ({ rollNo, admissionYear }) => {
    const [semester, setSemester] = useState('');
    const [feeData, setFeeData] = useState(null);
    const [fetching, setFetching] = useState(false);
    const SEMESTERS = Array.from({ length: 16 }, (_, i) => i + 1);

    const formatSemester = (semInt) => {
        if (!semInt) return '';
        const year = (admissionYear || 2024) + Math.floor((semInt - 1) / 2);
        const roman = (semInt % 2 === 1) ? 'I' : 'II';
        return `${year}-${roman}`;
    };

    const fetchFee = async (sem) => {
        setSemester(sem);
        setFetching(true);
        try {
            const res = await fetch(`http://localhost:5001/api/fee?rollNo=${rollNo}&semester=${sem}`);
            if (res.ok) {
                const d = await res.json();
                setFeeData(d.fee);
            } else {
                setFeeData(null);
            }
        } catch (err) { console.error(err); }
        finally { setFetching(false); }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 uppercase">Select Evaluation Period</p>
                <select 
                    value={semester} 
                    onChange={e => fetchFee(Number(e.target.value))}
                    className="text-xs font-semibold bg-white text-slate-800 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-amber-500"
                >
                    <option value="">Choose period...</option>
                    {SEMESTERS.map(s => <option key={s} value={s}>{formatSemester(s)}</option>)}
                </select>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 min-h-[120px] flex items-center justify-center">
                {fetching ? <Loader2 className="animate-spin text-slate-400" /> : 
                 feeData ? (
                    <div className="w-full flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Payment Date</p>
                            <p className="text-sm font-bold text-slate-700">{new Date(feeData.payment_date).toLocaleDateString('en-GB')}</p>
                        </div>
                        <a href={`http://localhost:5001/${feeData.receipt_pdf_path}`} target="_blank" rel="noopener noreferrer"
                           className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all">
                            <FileText size={14} /><span>View Receipt</span>
                        </a>
                    </div>
                 ) : <p className="text-xs text-slate-400 italic">No fee record found for this period.</p>}
            </div>
        </div>
    );
};

// ── Coursework Result Viewer ─────────────────────────────────────────────────
const ModalResultViewer = ({ rollNo }) => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const res = await fetch(`http://localhost:5001/api/student/result?roll_no=${encodeURIComponent(rollNo)}`);
                if (res.ok) {
                    const d = await res.json();
                    setResult(d.result);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchResult();
    }, [rollNo]);

    if (loading) return <Loader2 className="animate-spin text-slate-400 mx-auto" />;
    if (!result) return <p className="text-xs text-slate-400 italic text-center py-6">Coursework result not yet uploaded.</p>;

    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Submission Date</p>
                    <p className="text-sm font-bold text-slate-700">{new Date(result.submitted_at).toLocaleDateString('en-GB')}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${result.verified_by_admin ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {result.verified_by_admin ? 'Verified by Admin' : 'Pending Verification'}
                </div>
            </div>
            <a href={`http://localhost:5001/${result.result_pdf_path}`} target="_blank" rel="noopener noreferrer"
               className="flex items-center justify-center space-x-2 w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all">
                <FileText size={14} /><span>View Marksheet / Result</span>
            </a>
        </div>
    );
};

// ── PhD Sections ─────────────────────────────────────────────────────────────
const ModalSacView = ({ rollNo }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSac = async () => {
            try {
                const res = await fetch(`http://localhost:5001/api/sac/assignments/${encodeURIComponent(rollNo)}`);
                if (res.ok) {
                    const d = await res.json();
                    setMembers(d.assignments);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchSac();
    }, [rollNo]);

    if (loading) return <Loader2 className="animate-spin text-slate-400 mx-auto" />;
    if (members.length === 0) return <p className="text-xs text-slate-400 italic text-center py-6">No SAC members assigned yet.</p>;

    return (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
                {members.map((m, i) => (
                    <div key={m.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-bold text-slate-300 w-4 text-right">{i + 1}.</span>
                            <div>
                                <p className="text-sm font-bold text-slate-800">{m.name}</p>
                                <p className="text-[10px] text-slate-500">{m.designation} · {m.affiliation}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-medium">{m.email}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ModalPresentationView = ({ rollNo }) => {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch_ = async () => {
            try {
                const res = await fetch(`http://localhost:5001/api/phd/presentations?roll_no=${encodeURIComponent(rollNo)}`);
                if (res.ok) {
                    const d = await res.json();
                    setList(d.presentations);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetch_();
    }, [rollNo]);

    if (loading) return <Loader2 className="animate-spin text-slate-400 mx-auto" />;
    if (list.length === 0) return <p className="text-xs text-slate-400 italic text-center py-6">No registration presentations recorded.</p>;

    return (
        <div className="space-y-4">
            {list.map(p => (
                <div key={p.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className={`px-4 py-2 flex items-center justify-between ${p.remark === 'Accepted' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{new Date(p.presentation_date).toLocaleDateString('en-GB')}</span>
                        <span className={`text-[10px] font-bold uppercase ${p.remark === 'Accepted' ? 'text-emerald-600' : 'text-red-600'}`}>{p.remark}</span>
                    </div>
                    <div className="p-4 space-y-3">
                        {p.observation_message && (
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Observations</p>
                                <p className="text-xs text-slate-700 italic">"{p.observation_message}"</p>
                            </div>
                        )}
                        {p.remarks && (
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Official Remarks</p>
                                <p className="text-xs text-slate-700 italic">"{p.remarks}"</p>
                            </div>
                        )}
                        <a href={`http://localhost:5001/${p.synopsis_pdf_path}`} target="_blank" rel="noopener noreferrer"
                           className="flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:underline">
                            <FileText size={14} /><span>View Synopsis PDF</span>
                        </a>
                    </div>
                </div>
            ))}
        </div>
    );
};

const ModalLetterView = ({ rollNo }) => {
    const [letters, setLetters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch_ = async () => {
            try {
                const res = await fetch(`http://localhost:5001/api/phd/letters?roll_no=${encodeURIComponent(rollNo)}`);
                if (res.ok) {
                    const d = await res.json();
                    setLetters(d.letters);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetch_();
    }, [rollNo]);

    if (loading) return <Loader2 className="animate-spin text-slate-400 mx-auto" />;
    if (letters.length === 0) return <p className="text-xs text-slate-400 italic text-center py-6">No registration letter issued yet.</p>;

    return (
        <div className="space-y-4">
            {letters.map(l => (
                <div key={l.id} className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 relative overflow-hidden">
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-blue-400 uppercase">Registration No</p>
                                <p className="text-lg font-black text-blue-700 font-mono tracking-tight">{l.registration_number}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Issued On</p>
                                <p className="text-xs font-bold text-slate-700">{new Date(l.uploaded_at).toLocaleDateString('en-GB')}</p>
                            </div>
                        </div>
                        <a href={`http://localhost:5001/${l.letter_pdf_path}`} target="_blank" rel="noopener noreferrer"
                           className="flex items-center justify-center space-x-2 w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200">
                            <FileText size={14} /><span>Download Registration Letter</span>
                        </a>
                    </div>
                </div>
            ))}
        </div>
    );
};

const ModalProgressView = ({ rollNo }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    useEffect(() => {
        const fetch_ = async () => {
            try {
                const res = await fetch(`http://localhost:5001/api/phd/progress-reports?roll_no=${encodeURIComponent(rollNo)}`);
                if (res.ok) {
                    const d = await res.json();
                    setReports(d.reports);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetch_();
    }, [rollNo]);

    if (loading) return <Loader2 className="animate-spin text-slate-400 mx-auto" />;
    if (reports.length === 0) return <p className="text-xs text-slate-400 italic text-center py-6">No progress reports uploaded yet.</p>;

    return (
        <div className="space-y-3">
            {reports.map(r => (
                <div key={r.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                    <div className={`px-4 py-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider ${!r.is_present ? 'bg-red-50 text-red-600' : (r.verdict === 'Accepted' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')}`}>
                        <span>{months[r.from_month-1]} {r.from_year} — {months[r.to_month-1]} {r.to_year}</span>
                        <span>{!r.is_present ? 'Absent' : r.verdict}</span>
                    </div>
                    <div className="p-4 space-y-3">
                        {r.is_present && (
                            <div className="flex items-center space-x-4 text-xs">
                                <div><span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Report No:</span> <span className="font-semibold text-slate-700">{r.report_number || 'N/A'}</span></div>
                                {r.presentation_date && <div><span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Presented:</span> <span className="font-semibold text-slate-700">{new Date(r.presentation_date).toLocaleDateString('en-GB')}</span></div>}
                            </div>
                        )}
                        {r.observations && (
                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Observations</p>
                                <p className="text-xs text-slate-700 italic">"{r.observations}"</p>
                            </div>
                        )}
                        {r.remarks && (
                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Remarks</p>
                                <p className="text-xs text-slate-700 italic">"{r.remarks}"</p>
                            </div>
                        )}
                        {r.report_pdf_path && (
                            <a href={`http://localhost:5001/${r.report_pdf_path}`} target="_blank" rel="noopener noreferrer"
                               className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold hover:bg-blue-100 transition-colors">
                                <FileText size={12} /><span>View Full Report PDF</span>
                            </a>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

const ModalPreSubmissionView = ({ rollNo }) => {
    const [synopses, setSynopses] = useState([]);
    const [presentations, setPresentations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [synRes, presRes] = await Promise.all([
                    fetch(`http://localhost:5001/api/phd/extended-synopses?roll_no=${encodeURIComponent(rollNo)}`),
                    fetch(`http://localhost:5001/api/phd/pre-submissions?roll_no=${encodeURIComponent(rollNo)}`)
                ]);
                if (synRes.ok) { const d = await synRes.json(); setSynopses(d.synopses); }
                if (presRes.ok) { const d = await presRes.json(); setPresentations(d.preSubmissions); }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        load();
    }, [rollNo]);

    if (loading) return <Loader2 className="animate-spin text-slate-400 mx-auto" />;

    return (
        <div className="space-y-6">
            {/* Extended Synopsis Section */}
            <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Extended Synopsis (Student Upload)</p>
                {synopses.length === 0
                    ? <p className="text-xs text-slate-400 italic py-3">No extended synopsis uploaded.</p>
                    : synopses.map(s => (
                        <div key={s.id} className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-2">
                            <div>
                                <p className="text-xs font-bold text-emerald-700">Submitted</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">{new Date(s.uploaded_at).toLocaleDateString('en-GB')}</p>
                            </div>
                            <a href={`http://localhost:5001/${s.file_path}`} target="_blank" rel="noopener noreferrer"
                                className="flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:underline">
                                <FileText size={14} /><span>View PDF</span>
                            </a>
                        </div>
                    ))
                }
            </div>

            {/* Pre-Submission Presentation Section */}
            <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Pre-Submission Presentation (Admin Record)</p>
                {presentations.length === 0
                    ? <p className="text-xs text-slate-400 italic py-3">No pre-submission presentation recorded.</p>
                    : presentations.map(p => (
                        <div key={p.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm mb-3">
                            <div className={`px-4 py-2 flex items-center justify-between ${p.remark === 'Accepted' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">{p.presentation_date ? new Date(p.presentation_date).toLocaleDateString('en-GB') : 'No Date Set'}</span>
                                <span className={`text-[10px] font-bold uppercase ${p.remark === 'Accepted' ? 'text-emerald-600' : 'text-red-600'}`}>{p.remark}</span>
                            </div>
                            <div className="p-4 space-y-3">
                                <a href={`http://localhost:5001/${p.synopsis_pdf_path}`} target="_blank" rel="noopener noreferrer"
                                   className="flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:underline">
                                    <FileText size={14} /><span>View Pre-Submission Report</span>
                                </a>
                                {p.committee_members && p.committee_members.length > 0 && (
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Committee Members</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {p.committee_members.map((m, idx) => (
                                                <div key={idx} className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-700">{m.name}</span>
                                                    <span className="text-[10px] text-slate-500">{m.designation}, {m.department}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
};

// ── Main Modal Component ──────────────────────────────────────────────────────

const StudentDetailsModal = ({ student, onClose }) => {
    const [activeTopic, setActiveTopic] = useState('contact');

    const TOPICS = [
        { id: 'contact',   label: 'Contact & Admission', icon: User },
        { id: 'fee',       label: 'Fee Details',         icon: CreditCard },
        { id: 'coursework',label: 'Pre-PhD Result',      icon: BookOpen },
        { id: 'phd',       label: 'PhD Section',         icon: GraduationCap },
    ];

    const PHD_SUBSECTIONS = [
        { id: 'sac',        label: 'SAC Members',        icon: Users },
        { id: 'presentation',label: 'Registration Pres.', icon: LayoutList },
        { id: 'letter',     label: 'Registration Letter',icon: FileText },
        { id: 'progress',   label: 'Progress Reports',   icon: ClipboardList },
        { id: 'pre-submission', label: 'Pre-Submission', icon: Target },
    ];

    const [activePhdSub, setActivePhdSub] = useState('sac');

    if (!student) return null;

    // Normalize keys
    const fName = student.student_first_name || student.first_name || '';
    const lName = student.student_last_name || student.last_name || '';
    const rollNo = student.student_roll_no || student.roll_no || '';
    const email = student.student_email || student.email || '';
    const mobile = student.student_mobile || student.mobile_number || '';
    const dept = student.department || 'N/A';
    const year = student.year_of_admission || '';
    const mode = student.admission_mode || '';
    const type = student.admission_type || '';

    const name = `${fName} ${lName}`;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                onClick={onClose} 
            />
            
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-6xl h-[85vh] bg-slate-50 rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-slate-200"
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-white">
                    <div className="flex items-center space-x-5">
                        <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-200 flex items-center justify-center shadow-sm">
                            <span className="text-xl font-bold text-amber-600">{fName?.[0]}{lName?.[0]}</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800">{name}</h2>
                            <p className="text-sm font-mono text-slate-400 tracking-tight">{rollNo} · {dept}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all shadow-sm"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Sidebar */}
                    <div className="w-72 border-r border-slate-200 bg-slate-100/30 p-6 space-y-2 overflow-y-auto">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Navigation</p>
                        {TOPICS.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTopic(t.id)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all
                                    ${activeTopic === t.id 
                                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' 
                                        : 'text-slate-500 hover:bg-white hover:text-slate-800'}`}
                            >
                                <t.icon size={18} />
                                <span>{t.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Right Content Area */}
                    <div className="flex-1 bg-white overflow-y-auto p-10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTopic}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTopic === 'contact' && (
                                    <div className="space-y-8">
                                        <SectionTitle icon={User} title="Contact & Admission Details" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                                            <DetailRow icon={Mail}      label="Email Address"    value={email} />
                                            <DetailRow icon={Phone}     label="Mobile Number"    value={mobile} />
                                            <DetailRow icon={Calendar}  label="Admission Year"   value={year} />
                                            <DetailRow icon={Hash}      label="Admission Mode"   value={mode} />
                                            <DetailRow icon={Award}     label="Admission Type"   value={type} />
                                            <DetailRow icon={Building2} label="Department"      value={dept} />
                                        </div>
                                    </div>
                                )}

                                {activeTopic === 'fee' && (
                                    <div className="space-y-8">
                                        <SectionTitle icon={CreditCard} title="Fee Details" />
                                        <ModalFeeViewer rollNo={rollNo} admissionYear={year} />
                                    </div>
                                )}

                                {activeTopic === 'coursework' && (
                                    <div className="space-y-8">
                                        <SectionTitle icon={BookOpen} title="Pre-PhD Result" />
                                        <ModalResultViewer rollNo={rollNo} />
                                    </div>
                                )}

                                {activeTopic === 'phd' && (
                                    <div className="space-y-8">
                                        <SectionTitle icon={GraduationCap} title="PhD Section" />
                                        
                                        {/* Sub-navigation for PhD */}
                                        <div className="flex items-center space-x-1 bg-slate-100 p-1.5 rounded-2xl mb-8">
                                            {PHD_SUBSECTIONS.map(s => (
                                                <button
                                                    key={s.id}
                                                    onClick={() => setActivePhdSub(s.id)}
                                                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all
                                                        ${activePhdSub === s.id 
                                                            ? 'bg-white text-slate-800 shadow-sm' 
                                                            : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    <s.icon size={14} />
                                                    <span>{s.label}</span>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="min-h-[200px]">
                                            {activePhdSub === 'sac' && <ModalSacView rollNo={rollNo} />}
                                            {activePhdSub === 'presentation' && <ModalPresentationView rollNo={rollNo} />}
                                            {activePhdSub === 'letter' && <ModalLetterView rollNo={rollNo} />}
                                            {activePhdSub === 'progress' && <ModalProgressView rollNo={rollNo} />}
                                            {activePhdSub === 'pre-submission' && <ModalPreSubmissionView rollNo={rollNo} />}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default StudentDetailsModal;
