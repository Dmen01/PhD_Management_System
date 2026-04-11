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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sacMembers.map((member, index) => (
                    <div key={member.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="px-6 py-5 border-b bg-amber-50/50 border-amber-100/50 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-100 text-amber-600">
                                    <Target size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5 text-amber-500">SAC Member {index + 1}</p>
                                    <h3 className="text-lg font-bold text-slate-800 leading-tight">{member.name}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 flex-1 space-y-4">
                            <div className="flex items-center space-x-3 text-sm">
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                    <User size={14} className="text-slate-400" />
                                </div>
                                <span className="text-slate-600 font-medium">{member.designation}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm">
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                    <Building2 size={14} className="text-slate-400" />
                                </div>
                                <span className="text-slate-600 font-medium">{member.affiliation}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm">
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                    <Mail size={14} className="text-slate-400" />
                                </div>
                                <span className="text-slate-600 font-medium">{member.email}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm">
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                    <Phone size={14} className="text-slate-400" />
                                </div>
                                <span className="text-slate-600 font-medium">{member.phone_number}</span>
                            </div>
                        </div>
                    </div>
                ))}
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
        <div className="space-y-6 max-w-4xl">
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
                            
                            {p.observation_message && (
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Observations / Remarks</p>
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{p.observation_message}</p>
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
