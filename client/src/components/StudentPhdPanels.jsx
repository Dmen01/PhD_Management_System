import React, { useState, useEffect } from 'react';
import { Loader2, FileText, ExternalLink, Calendar, Users, Target, User, Mail, Phone, Building2, CheckCircle, LayoutList } from 'lucide-react';

// ── Student SAC Members View ────────────────────────────────────────────────
export const StudentSacMembersPanel = ({ profile }) => {
    const [sacMembers, setSacMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSacMembers = async () => {
            try {
                const res = await fetch(`http://localhost:5001/api/sac/assignments/${encodeURIComponent(profile.roll_no)}`);
                const data = await res.json();
                if (res.ok) setSacMembers(data.assignments);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchSacMembers();
    }, [profile]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <Loader2 className="animate-spin" size={24} />
            <p className="text-sm">Loading SAC members...</p>
        </div>
    );

    if (sacMembers.length === 0) return (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <Users size={28} className="text-slate-300" />
            </div>
            <p className="text-slate-600 font-medium">No SAC Members Assigned</p>
            <p className="text-sm text-slate-400 mt-1">You have not been assigned Student Advisory Committee members yet.</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">My SAC Members</h2>
                <p className="text-slate-500 mt-1">Teachers assigned to your Student Advisory Committee.</p>
            </div>
            
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                    {sacMembers.map((member, index) => (
                        <div key={member.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center space-x-3 mb-1">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-100 text-amber-600 text-sm font-bold shrink-0">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 leading-tight">{member.name}</h3>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">SAC Member</p>
                                    </div>
                                </div>
                                <div className="pl-11 space-y-1">
                                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                                        <User size={14} className="text-slate-400" />
                                        <span className="font-medium">{member.designation}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                                        <Building2 size={14} className="text-slate-400" />
                                        <span className="font-medium">{member.affiliation}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col space-y-2 pl-11 md:pl-0 md:text-right">
                                <div className="flex items-center md:justify-end space-x-2 text-sm text-slate-600">
                                    <span className="font-medium">{member.email}</span>
                                    <Mail size={14} className="text-slate-400 shrink-0" />
                                </div>
                                <div className="flex items-center md:justify-end space-x-2 text-sm text-slate-600">
                                    <span className="font-medium">{member.phone_number}</span>
                                    <Phone size={14} className="text-slate-400 shrink-0" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ── Student PHD Registration Presentation View ────────────────────────────────
export const StudentPhdPresentationPanel = ({ profile }) => {
    const [presentations, setPresentations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPresentations = async () => {
            try {
                const res = await fetch(`http://localhost:5001/api/phd/presentations?roll_no=${encodeURIComponent(profile.roll_no)}`);
                const data = await res.json();
                if (res.ok) setPresentations(data.presentations);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchPresentations();
    }, [profile]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <Loader2 className="animate-spin" size={24} />
            <p className="text-sm">Loading presentation records...</p>
        </div>
    );

    if (presentations.length === 0) return (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <LayoutList size={28} className="text-slate-300" />
            </div>
            <p className="text-slate-600 font-medium">No Presentations Recorded</p>
            <p className="text-sm text-slate-400 mt-1">There are no registration presentations recorded for you yet.</p>
        </div>
    );

    return (
        <div className="space-y-6 w-full">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">PhD Registration Presentation</h2>
                <p className="text-slate-500 mt-1">Review the outcomes of your synopsis presentations.</p>
            </div>
            
            <div className="space-y-4">
                {presentations.map((p, index) => (
                    <div key={p.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col sm:flex-row">
                        {/* Status Sidebar */}
                        <div className={`p-6 sm:w-48 flex flex-col items-center justify-center text-center border-b sm:border-b-0 sm:border-r ${p.remark === 'Accepted' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${p.remark === 'Accepted' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                <CheckCircle size={24} />
                            </div>
                            <h3 className={`text-lg font-bold ${p.remark === 'Accepted' ? 'text-emerald-700' : 'text-red-700'}`}>{p.remark}</h3>
                            <p className="text-xs text-slate-500 mt-1 font-medium tracking-wide uppercase">Outcome</p>
                        </div>
                        
                        {/* Details */}
                        <div className="p-6 flex-1 space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center space-x-2 text-slate-600">
                                    <Calendar size={18} className="text-blue-500" />
                                    <span className="font-semibold">{new Date(p.presentation_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                    <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-lg text-slate-500 ml-2">Presentation Date</span>
                                </div>
                                <a href={`http://localhost:5001/${p.synopsis_pdf_path}`} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center space-x-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors text-sm font-bold">
                                    <FileText size={16} /><span>View Synopsis PDF</span><ExternalLink size={14} className="opacity-70 ml-1" />
                                </a>
                            </div>
                            
                            {p.remarks && (
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Official Remarks</p>
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{p.remarks}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── Student PHD Registration Letter View ──────────────────────────────────────
export const StudentPhdLetterPanel = ({ profile }) => {
    const [letters, setLetters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLetters = async () => {
            try {
                const res = await fetch(`http://localhost:5001/api/phd/letters?roll_no=${encodeURIComponent(profile.roll_no)}`);
                const data = await res.json();
                if (res.ok) setLetters(data.letters);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchLetters();
    }, [profile]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <Loader2 className="animate-spin" size={24} />
            <p className="text-sm">Loading registration letter...</p>
        </div>
    );

    if (letters.length === 0) return (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <FileText size={28} className="text-slate-300" />
            </div>
            <p className="text-slate-600 font-medium">No Registration Letter Yet</p>
            <p className="text-sm text-slate-400 mt-1">Your registration letter has not been uploaded by the administration.</p>
        </div>
    );

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">PhD Registration Letter</h2>
                <p className="text-slate-500 mt-1">View and download your official PhD Registration Letter.</p>
            </div>
            
            <div className="space-y-4">
                {letters.map((l) => (
                    <div key={l.id} className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden p-6 relative">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-0 opacity-50" />
                        <div className="relative z-10 space-y-6">
                            
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div className="flex items-center space-x-3 text-blue-600">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <CheckCircle size={20} className="text-blue-500" />
                                    </div>
                                    <span className="font-bold text-lg text-slate-800">Registration Verified</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Uploaded On</p>
                                    <p className="text-sm font-semibold text-slate-700">{new Date(l.uploaded_at).toLocaleDateString('en-GB')}</p>
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Official Registration Number</p>
                                <p className="text-2xl font-black text-blue-600 font-mono tracking-tight">{l.registration_number}</p>
                            </div>

                            <a href={`http://localhost:5001/${l.letter_pdf_path}`} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-full sm:w-auto space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-200">
                                <FileText size={18} />
                                <span>Download Official Letter</span>
                                <ExternalLink size={16} className="opacity-70" />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
// ── Student PHD Progress Report View ──────────────────────────────────────────
export const StudentPhdProgressPanel = ({ profile }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const getMonthName = (m) => {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const idx = parseInt(m) - 1;
        return months[idx] || m;
    };

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch(`http://localhost:5001/api/phd/progress-reports?roll_no=${encodeURIComponent(profile.roll_no)}`);
                const data = await res.json();
                if (res.ok) setReports(data.reports);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchReports();
    }, [profile]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <Loader2 className="animate-spin" size={24} />
            <p className="text-sm">Loading progress records...</p>
        </div>
    );

    const acceptedCount = reports.filter(r => r.is_present && r.verdict === 'Accepted').length;

    return (
        <div className="space-y-6 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">PhD Progress Reports</h2>
                    <p className="text-slate-500 mt-1">Timeline of your periodic progress evaluations.</p>
                </div>
                {/* Summary Stat */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3 flex items-center space-x-4 shadow-sm">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <CheckCircle size={20} className="text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Accepted Reports</p>
                        <p className="text-xl font-black text-slate-800">{acceptedCount}</p>
                    </div>
                </div>
            </div>

            {reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        <LayoutList size={28} className="text-slate-300" />
                    </div>
                    <p className="text-slate-600 font-medium">No Progress Reports Yet</p>
                    <p className="text-sm text-slate-400 mt-1">Your periodic progress reports have not been uploaded yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reports.map((r) => (
                        <div key={r.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col sm:flex-row">
                            {/* Attendance & Verdict Sidebar */}
                            <div className={`p-6 sm:w-48 flex flex-col items-center justify-center text-center border-b sm:border-b-0 sm:border-r ${!r.is_present ? 'bg-red-50 border-red-100' : (r.verdict === 'Accepted' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100')}`}>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${!r.is_present ? 'bg-red-100 text-red-600' : (r.verdict === 'Accepted' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600')}`}>
                                    {r.is_present ? <CheckCircle size={24} /> : <div className="text-xl font-bold">A</div>}
                                </div>
                                <h3 className={`text-lg font-bold ${!r.is_present ? 'text-red-700' : (r.verdict === 'Accepted' ? 'text-emerald-700' : 'text-rose-700')}`}>
                                    {!r.is_present ? 'Absent' : r.verdict}
                                </h3>
                                <p className="text-[10px] text-slate-500 mt-1 font-bold tracking-widest uppercase">{!r.is_present ? 'Attendance' : 'Outcome'}</p>
                            </div>

                            {/* Details Area */}
                            <div className="p-6 flex-1 space-y-5">
                                {/* Header / Timing */}
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="px-3 py-1.5 bg-slate-900 rounded-lg flex items-center space-x-2">
                                            <Calendar size={14} className="text-emerald-400" />
                                            <span className="text-xs font-bold text-white uppercase">{getMonthName(r.from_month)} {r.from_year}</span>
                                        </div>
                                        <div className="w-3 h-px bg-slate-300" />
                                        <div className="px-3 py-1.5 bg-slate-900 rounded-lg flex items-center space-x-2">
                                            <Calendar size={14} className="text-emerald-400" />
                                            <span className="text-xs font-bold text-white uppercase">{getMonthName(r.to_month)} {r.to_year}</span>
                                        </div>
                                    </div>
                                    {r.is_present && r.report_pdf_path && (
                                        <a href={`http://localhost:5001/${r.report_pdf_path}`} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all text-sm font-bold border border-blue-100/50">
                                            <FileText size={16} /><span>View Report</span><ExternalLink size={14} />
                                        </a>
                                    )}
                                </div>

                                {/* Content Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {r.is_present ? (
                                        <div className="md:col-span-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Report Details</p>
                                            <p className="text-sm text-slate-700">No: <span className="font-bold text-slate-900">{r.report_number}</span></p>
                                            <p className="text-sm text-slate-700 mt-0.5">Dated: <span className="font-bold text-slate-900">{new Date(r.presentation_date).toLocaleDateString('en-GB')}</span></p>
                                        </div>
                                    ) : (
                                        <div className="md:col-span-2 bg-red-50/50 rounded-xl p-3 border border-red-100">
                                            <p className="text-sm text-red-700 font-medium">The student was marked absent for this progress report evaluation period.</p>
                                        </div>
                                    )}
                                </div>

                                {r.remarks && (
                                    <div className="border-t border-slate-100 pt-4">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Official Remarks</p>
                                        <p className="text-sm text-slate-600 leading-relaxed">{r.remarks}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
