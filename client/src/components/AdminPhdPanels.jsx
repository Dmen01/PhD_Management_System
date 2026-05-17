import React, { useState, useEffect, useRef } from 'react';
import { Loader2, FileText, ExternalLink, Trash2, Send, Upload, User, LayoutList, Calendar, CheckSquare, Square, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── PhD Registration Presentation Panel ───────────────────────────────────────
export const PhdRegistrationPresentationPanel = () => {
    const [students, setStudents] = useState([]);
    const [presentations, setPresentations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Form state
    const [form, setForm] = useState({ roll_no: '', presentation_date: '', observation_message: '', remark: 'Accepted', remarks: '' });
    const [pdfFile, setPdfFile] = useState(null);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const fileRef = useRef(null);

    const fetchData = async () => {
        try {
            const [sRes, pRes] = await Promise.all([
                fetch('http://localhost:5001/api/phd/eligible-presentation-students'),
                fetch('http://localhost:5001/api/phd/presentations')
            ]);
            const [sData, pData] = await Promise.all([sRes.json(), pRes.json()]);
            if (sRes.ok) setStudents(sData.students);
            if (pRes.ok) setPresentations(pData.presentations);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        setFormError(''); setFormSuccess('');
        
        if (!form.roll_no) return setFormError('Please select a student.');
        if (!form.presentation_date) return setFormError('Please select a presentation date.');
        if (!pdfFile) return setFormError('Please upload the synopsis PDF.');

        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('roll_no', form.roll_no);
            fd.append('presentation_date', form.presentation_date);
            fd.append('observation_message', form.observation_message);
            fd.append('remark', form.remark);
            fd.append('remarks', form.remarks);
            fd.append('synopsis', pdfFile);

            const res = await fetch('http://localhost:5001/api/phd/presentations', { method: 'POST', body: fd });
            const data = await res.json();
            
            if (res.ok) {
                setFormSuccess('Presentation uploaded successfully!');
                setForm({ roll_no: '', presentation_date: '', observation_message: '', remark: 'Accepted', remarks: '' });
                setPdfFile(null);
                if (fileRef.current) fileRef.current.value = '';
                fetchData();
                setTimeout(() => setFormSuccess(''), 3000);
            } else {
                setFormError(data.message || 'Upload failed.');
            }
        } catch {
            setFormError('Failed to connect to server.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this presentation record?')) return;
        try {
            const res = await fetch(`http://localhost:5001/api/phd/presentations/${id}`, { method: 'DELETE' });
            if (res.ok) setPresentations(prev => prev.filter(p => p.id !== id));
        } catch (err) { console.error(err); }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-white">PhD Registration Presentation</h2>
                <p className="text-slate-400 text-sm mt-1">Upload the student's synopsis and record the outcome of their registration presentation.</p>
            </div>

            <form onSubmit={handleUpload} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-5">
                <h3 className="text-sm font-semibold text-slate-300">New Presentation Record</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Student Select */}
                    <div className="sm:col-span-2">
                        <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Select Student (SAC Assigned) <span className="text-red-400">*</span></label>
                        <select
                            value={form.roll_no}
                            onChange={e => setForm(f => ({ ...f, roll_no: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-all"
                        >
                            <option value="">— Select a student —</option>
                            {students.map(s => (
                                <option key={s.roll_no} value={s.roll_no}>{s.first_name} {s.last_name} ({s.roll_no})</option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Date of Presentation <span className="text-red-400">*</span></label>
                        <input
                            type="date"
                            value={form.presentation_date}
                            onChange={e => setForm(f => ({ ...f, presentation_date: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-all cursor-pointer"
                        />
                    </div>

                    {/* Remark */}
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">SAC Remark <span className="text-red-400">*</span></label>
                        <select
                            value={form.remark}
                            onChange={e => setForm(f => ({ ...f, remark: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-all"
                        >
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>

                    {/* Observation Message */}
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Observations (Teachers/Admin Only)</label>
                        <textarea
                            value={form.observation_message}
                            onChange={e => setForm(f => ({ ...f, observation_message: e.target.value }))}
                            rows={3}
                            placeholder="Detailed observations for internal record..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-all resize-none"
                        />
                    </div>

                    {/* Remarks Message */}
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Official Remarks (Visible to Student)</label>
                        <textarea
                            value={form.remarks}
                            onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
                            rows={3}
                            placeholder="Official remarks for the student..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-all resize-none"
                        />
                    </div>

                    {/* PDF File */}
                    <div className="sm:col-span-2">
                        <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Synopsis PDF <span className="text-slate-500">(max 10MB)</span> <span className="text-red-400">*</span></label>
                        <input 
                            ref={fileRef} 
                            type="file" 
                            accept="application/pdf"
                            onChange={e => {
                                const file = e.target.files[0];
                                if (file && file.size > 10 * 1024 * 1024) { setFormError('PDF must be under 10MB.'); e.target.value = ''; setPdfFile(null); }
                                else { setFormError(''); setPdfFile(file || null); }
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-emerald-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 transition-all cursor-pointer"
                        />
                    </div>
                </div>

                {formError && <p className="text-red-400 text-sm mt-2">{formError}</p>}
                {formSuccess && <p className="text-emerald-400 text-sm mt-2">{formSuccess}</p>}

                <div className="pt-2">
                    <button type="submit" disabled={submitting}
                        className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                        {submitting ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                        <span>{submitting ? 'Uploading...' : 'Save Presentation'}</span>
                    </button>
                </div>
            </form>

            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Uploaded Presentations ({presentations.length})</h3>
                {loading ? (
                    <div className="flex items-center space-x-2 text-slate-500 py-4"><Loader2 size={18} className="animate-spin" /><span className="text-sm">Loading...</span></div>
                ) : presentations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-600 space-y-2">
                        <LayoutList size={32} className="opacity-30" />
                        <p className="text-sm">No presentations recorded yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {presentations.map(p => (
                            <div key={p.id} className="bg-slate-800/40 border border-slate-700 rounded-xl p-5 flex flex-col h-full">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-bold text-white text-base">{p.first_name} {p.last_name}</p>
                                        <p className="text-xs text-slate-400 mt-0.5 font-mono">{p.roll_no}</p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${p.remark === 'Accepted' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50' : 'bg-red-900/40 text-red-400 border border-red-800/50'}`}>
                                        {p.remark}
                                    </span>
                                </div>
                                <div className="mt-4 space-y-2 flex-1">
                                    <div className="flex items-center space-x-2 text-sm text-slate-300">
                                        <Calendar size={14} className="text-slate-500" />
                                        <span>{new Date(p.presentation_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                    </div>
                                    {p.observation_message && (
                                        <p className="text-sm text-slate-400 mt-2 italic bg-slate-900/50 p-2 rounded-lg border border-slate-800 whitespace-pre-wrap">"{p.observation_message}"</p>
                                    )}
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
                                    <a href={`http://localhost:5001/${p.synopsis_pdf_path}`} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-emerald-400 hover:text-emerald-300 rounded-lg transition-colors">
                                        <FileText size={13} /><span>Synopsis</span><ExternalLink size={10} />
                                    </a>
                                    <button onClick={() => handleDelete(p.id)} title="Delete record"
                                        className="w-7 h-7 flex items-center justify-center bg-red-900/30 hover:bg-red-700 text-red-400 hover:text-white rounded-lg transition-colors">
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ── PhD Registration Letter Panel ─────────────────────────────────────────────
export const PhdRegistrationLetterPanel = () => {
    const [students, setStudents] = useState([]);
    const [letters, setLetters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Form state
    const [form, setForm] = useState({ roll_no: '', registration_number: '' });
    const [pdfFile, setPdfFile] = useState(null);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const fileRef = useRef(null);

    const fetchData = async () => {
        try {
            const [sRes, lRes] = await Promise.all([
                fetch('http://localhost:5001/api/phd/eligible-letter-students'),
                fetch('http://localhost:5001/api/phd/letters')
            ]);
            const [sData, lData] = await Promise.all([sRes.json(), lRes.json()]);
            if (sRes.ok) setStudents(sData.students);
            if (lRes.ok) setLetters(lData.letters);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        setFormError(''); setFormSuccess('');
        
        if (!form.roll_no) return setFormError('Please select a student.');
        if (!form.registration_number.trim()) return setFormError('Registration number is required.');
        if (!pdfFile) return setFormError('Please upload the registration letter PDF.');

        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('roll_no', form.roll_no);
            fd.append('registration_number', form.registration_number.trim());
            fd.append('letter', pdfFile);

            const res = await fetch('http://localhost:5001/api/phd/letters', { method: 'POST', body: fd });
            const data = await res.json();
            
            if (res.ok) {
                setFormSuccess('Registration letter uploaded successfully!');
                setForm({ roll_no: '', registration_number: '' });
                setPdfFile(null);
                if (fileRef.current) fileRef.current.value = '';
                fetchData();
                setTimeout(() => setFormSuccess(''), 3000);
            } else {
                setFormError(data.message || 'Upload failed.');
            }
        } catch {
            setFormError('Failed to connect to server.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this registration letter?')) return;
        try {
            const res = await fetch(`http://localhost:5001/api/phd/letters/${id}`, { method: 'DELETE' });
            if (res.ok) setLetters(prev => prev.filter(l => l.id !== id));
        } catch (err) { console.error(err); }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-white">PhD Registration Letter</h2>
                <p className="text-slate-400 text-sm mt-1">Upload the finalized registration letter for students who have successfully completed their presentation.</p>
            </div>

            <form onSubmit={handleUpload} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-5">
                <h3 className="text-sm font-semibold text-slate-300">Upload Registration Letter</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Student Select */}
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Select Student <span className="text-red-400">*</span></label>
                        <select
                            value={form.roll_no}
                            onChange={e => setForm(f => ({ ...f, roll_no: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-all"
                        >
                            <option value="">— Select an eligible student —</option>
                            {students.map(s => (
                                <option key={s.roll_no} value={s.roll_no}>{s.first_name} {s.last_name} ({s.roll_no})</option>
                            ))}
                        </select>
                    </div>

                    {/* Registration Number */}
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Registration Number <span className="text-red-400">*</span></label>
                        <input
                            type="text"
                            value={form.registration_number}
                            placeholder="e.g. 2026/PHD/CS/042"
                            onChange={e => setForm(f => ({ ...f, registration_number: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-all"
                        />
                    </div>

                    {/* PDF File */}
                    <div className="sm:col-span-2">
                        <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Registration Letter PDF <span className="text-slate-500">(max 5MB)</span> <span className="text-red-400">*</span></label>
                        <input 
                            ref={fileRef} 
                            type="file" 
                            accept="application/pdf"
                            onChange={e => {
                                const file = e.target.files[0];
                                if (file && file.size > 5 * 1024 * 1024) { setFormError('PDF must be under 5MB.'); e.target.value = ''; setPdfFile(null); }
                                else { setFormError(''); setPdfFile(file || null); }
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-emerald-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 transition-all cursor-pointer"
                        />
                    </div>
                </div>

                {formError && <p className="text-red-400 text-sm mt-2">{formError}</p>}
                {formSuccess && <p className="text-emerald-400 text-sm mt-2">{formSuccess}</p>}

                <div className="pt-2">
                    <button type="submit" disabled={submitting}
                        className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                        {submitting ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                        <span>{submitting ? 'Uploading...' : 'Upload Letter'}</span>
                    </button>
                </div>
            </form>

            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Issued Letters ({letters.length})</h3>
                {loading ? (
                    <div className="flex items-center space-x-2 text-slate-500 py-4"><Loader2 size={18} className="animate-spin" /><span className="text-sm">Loading...</span></div>
                ) : letters.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-600 space-y-2">
                        <FileText size={32} className="opacity-30" />
                        <p className="text-sm">No registration letters uploaded yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-700">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-700/60 text-slate-400 uppercase text-xs">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Student Name</th>
                                    <th className="px-5 py-3 font-semibold">Roll No</th>
                                    <th className="px-5 py-3 font-semibold">Reg. Number</th>
                                    <th className="px-5 py-3 font-semibold">Uploaded On</th>
                                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/60">
                                {letters.map(l => (
                                    <tr key={l.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="px-5 py-4 text-white font-medium whitespace-nowrap">{l.first_name} {l.last_name}</td>
                                        <td className="px-5 py-4 text-slate-300 font-mono text-xs">{l.roll_no}</td>
                                        <td className="px-5 py-4 text-emerald-400 font-medium whitespace-nowrap">{l.registration_number}</td>
                                        <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                                            {new Date(l.uploaded_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <a href={`http://localhost:5001/${l.letter_pdf_path}`} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-emerald-400 hover:text-emerald-300 rounded-lg transition-colors">
                                                    <FileText size={13} /><span>Open</span>
                                                </a>
                                                <button onClick={() => handleDelete(l.id)} title="Delete letter"
                                                    className="w-7 h-7 flex items-center justify-center bg-red-900/30 hover:bg-red-700 text-red-400 hover:text-white rounded-lg transition-colors">
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
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

// ── PhD Progress Report Panel ───────────────────────────────────────────────
export const PhdProgressReportPanel = () => {
    const [allStudents, setAllStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Filters
    const [yearFilter, setYearFilter] = useState('');

    // Form state
    const initialForm = {
        roll_no: '',
        from_month: '',
        from_year: '',
        to_month: '',
        to_year: '',
        is_present: true,
        report_number: '',
        presentation_date: '',
        verdict: 'Accepted',
        remarks: '',
        observations: ''
    };
    const [form, setForm] = useState(initialForm);
    const [pdfFile, setPdfFile] = useState(null);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const fileRef = useRef(null);

    const fetchData = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/phd/eligible-progress-students');
            const data = await res.json();
            if (res.ok) {
                setAllStudents(data.students);
                setFilteredStudents(data.students);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchLogs = async (rollNo) => {
        if (!rollNo) { setReports([]); return; }
        try {
            const res = await fetch(`http://localhost:5001/api/phd/progress-reports?roll_no=${rollNo}`);
            const data = await res.json();
            if (res.ok) setReports(data.reports);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        if (yearFilter) {
            setFilteredStudents(allStudents.filter(s => s.year_of_admission.toString() === yearFilter));
        } else {
            setFilteredStudents(allStudents);
        }
    }, [yearFilter, allStudents]);

    useEffect(() => {
        fetchLogs(form.roll_no);
    }, [form.roll_no]);

    const handleUpload = async (e) => {
        e.preventDefault();
        setFormError(''); setFormSuccess('');
        
        if (!form.roll_no) return setFormError('Please select a student.');
        if (!form.from_month || !form.from_year || !form.to_month || !form.to_year) return setFormError('Please select the duration.');
        
        if (form.is_present) {
            if (!form.report_number) return setFormError('Report number is required.');
            if (!form.presentation_date) return setFormError('Presentation date is required.');
            if (!pdfFile) return setFormError('Please upload the progress report PDF.');
        }

        setSubmitting(true);
        try {
            const fd = new FormData();
            Object.keys(form).forEach(key => fd.append(key, form[key]));
            if (pdfFile) fd.append('report', pdfFile);

            const res = await fetch('http://localhost:5001/api/phd/progress-reports', { method: 'POST', body: fd });
            const data = await res.json();
            
            if (res.ok) {
                setFormSuccess('Progress report submitted successfully!');
                setForm(prev => ({ ...initialForm, roll_no: prev.roll_no }));
                setPdfFile(null);
                if (fileRef.current) fileRef.current.value = '';
                fetchLogs(form.roll_no);
                setTimeout(() => setFormSuccess(''), 3000);
            } else {
                setFormError(data.message || 'Submission failed.');
            }
        } catch {
            setFormError('Failed to connect to server.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this progress report record?')) return;
        try {
            const res = await fetch(`http://localhost:5001/api/phd/progress-reports/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setReports(prev => prev.filter(r => r.id !== id));
            }
        } catch (err) { console.error(err); }
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-white">PhD Progress Report</h2>
                <p className="text-slate-400 text-sm mt-1">Record and upload progress reports for registered PhD students.</p>
            </div>

            <form onSubmit={handleUpload} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-5">
                <h3 className="text-sm font-semibold text-slate-300">New Progress Entry</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Filter by Year */}
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Filter by Admission Year</label>
                        <select
                            value={yearFilter}
                            onChange={e => setYearFilter(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-all"
                        >
                            <option value="">All Years</option>
                            {[...new Set(allStudents.map(s => s.year_of_admission))].sort((a,b)=>b-a).map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    {/* Student Select */}
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">
                            Select Student <span className="text-red-400">*</span>
                            {loading && <Loader2 size={10} className="inline ml-2 animate-spin text-emerald-400" />}
                        </label>
                        <select
                            value={form.roll_no}
                            onChange={e => setForm(f => ({ ...f, roll_no: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-all"
                        >
                            <option value="">{loading ? 'Loading students...' : '— Select a student —'}</option>
                            {filteredStudents.map(s => (
                                <option key={s.roll_no} value={s.roll_no}>{s.first_name} {s.last_name} ({s.roll_no})</option>
                            ))}
                        </select>
                    </div>

                    {/* Duration From */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Duration FROM <span className="text-red-400">*</span></label>
                        </div>
                        <select
                            value={form.from_month}
                            onChange={e => setForm(f => ({ ...f, from_month: e.target.value }))}
                            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-all"
                        >
                            <option value="">Month</option>
                            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                        </select>
                        <select
                            value={form.from_year}
                            onChange={e => setForm(f => ({ ...f, from_year: e.target.value }))}
                            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-all"
                        >
                            <option value="">Year</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>

                    {/* Duration To */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Duration TO <span className="text-red-400">*</span></label>
                        </div>
                        <select
                            value={form.to_month}
                            onChange={e => setForm(f => ({ ...f, to_month: e.target.value }))}
                            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-all"
                        >
                            <option value="">Month</option>
                            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                        </select>
                        <select
                            value={form.to_year}
                            onChange={e => setForm(f => ({ ...f, to_year: e.target.value }))}
                            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-all"
                        >
                            <option value="">Year</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>

                    {/* Attendance Status */}
                    <div className="sm:col-span-2">
                        <label className="block text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wide">Attendance Status</label>
                        <div className="flex space-x-6">
                            <div onClick={() => setForm(f => ({ ...f, is_present: true }))} className="flex items-center space-x-2 cursor-pointer group">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${form.is_present ? 'border-emerald-500 bg-emerald-500/20' : 'border-slate-600 group-hover:border-slate-500'}`}>
                                    {form.is_present && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                                </div>
                                <span className={`text-sm ${form.is_present ? 'text-white font-medium' : 'text-slate-400'}`}>Present</span>
                            </div>
                            <div onClick={() => setForm(f => ({ ...f, is_present: false }))} className="flex items-center space-x-2 cursor-pointer group">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${!form.is_present ? 'border-red-500 bg-red-500/20' : 'border-slate-600 group-hover:border-slate-500'}`}>
                                    {!form.is_present && <div className="w-2 h-2 rounded-full bg-red-500" />}
                                </div>
                                <span className={`text-sm ${!form.is_present ? 'text-white font-medium' : 'text-slate-400'}`}>Absent</span>
                            </div>
                        </div>
                    </div>

                    {form.is_present ? (
                        <>
                            {/* Report Number */}
                            <div>
                                <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Report Number <span className="text-red-400">*</span></label>
                                <input
                                    type="text"
                                    value={form.report_number}
                                    onChange={e => setForm(f => ({ ...f, report_number: e.target.value }))}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-all"
                                />
                            </div>

                            {/* Presentation Date */}
                            <div>
                                <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Date of Presentation <span className="text-red-400">*</span></label>
                                <input
                                    type="date"
                                    value={form.presentation_date}
                                    onChange={e => setForm(f => ({ ...f, presentation_date: e.target.value }))}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-all cursor-pointer"
                                />
                            </div>

                            {/* Verdict */}
                            <div>
                                <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Verdict <span className="text-red-400">*</span></label>
                                <select
                                    value={form.verdict}
                                    onChange={e => setForm(f => ({ ...f, verdict: e.target.value }))}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-all"
                                >
                                    <option value="Accepted">Accepted</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>

                            {/* PDF File */}
                            <div>
                                <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Report File <span className="text-slate-500">(max 10MB)</span> <span className="text-red-400">*</span></label>
                                <input 
                                    ref={fileRef} 
                                    type="file" 
                                    accept="application/pdf"
                                    onChange={e => {
                                        const file = e.target.files[0];
                                        if (file && file.size > 10 * 1024 * 1024) { setFormError('PDF must be under 10MB.'); e.target.value = ''; setPdfFile(null); }
                                        else { setFormError(''); setPdfFile(file || null); }
                                    }}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300 outline-none focus:border-emerald-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 transition-all cursor-pointer"
                                />
                            </div>

                            {/* Observations */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Observations</label>
                                <textarea
                                    value={form.observations}
                                    onChange={e => setForm(f => ({ ...f, observations: e.target.value }))}
                                    rows={3}
                                    placeholder="Enter SAC observations..."
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-all resize-none"
                                />
                            </div>
                        </>
                    ) : null}

                    {/* Remarks */}
                    <div className="sm:col-span-2">
                        <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Remarks</label>
                        <textarea
                            value={form.remarks}
                            onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
                            rows={3}
                            placeholder="Add any additional remarks..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-all resize-none"
                        />
                    </div>
                </div>

                {formError && <p className="text-red-400 text-sm mt-2">{formError}</p>}
                {formSuccess && <p className="text-emerald-400 text-sm mt-2">{formSuccess}</p>}

                <div className="pt-2">
                    <button type="submit" disabled={submitting}
                        className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                        {submitting ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                        <span>{submitting ? 'Submitting...' : 'Submit Progress Report'}</span>
                    </button>
                </div>
            </form>

            {/* Previous Logs */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Previous Logs</h3>
                    {form.roll_no && <span className="text-xs text-slate-500">Showing logs for {form.roll_no}</span>}
                </div>

                {!form.roll_no ? (
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 space-y-2">
                        <User size={24} className="opacity-20" />
                        <p className="text-sm italic">Select a student to view their previous progress logs</p>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 space-y-2">
                        <FileText size={24} className="opacity-20" />
                        <p className="text-sm italic">No previous logs found for this student</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-700">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-700/60 text-slate-400 uppercase text-xs">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Duration</th>
                                    <th className="px-5 py-3 font-semibold">Status</th>
                                    <th className="px-5 py-3 font-semibold">Report #</th>
                                    <th className="px-5 py-3 font-semibold">Presentation</th>
                                    <th className="px-5 py-3 font-semibold">Verdict</th>
                                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/60">
                                {reports.map(r => (
                                    <tr key={r.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="px-5 py-4 text-slate-300 font-medium">
                                            {months[r.from_month-1].substring(0,3)} {r.from_year} — {months[r.to_month-1].substring(0,3)} {r.to_year}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${r.is_present ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50' : 'bg-red-900/40 text-red-400 border border-red-800/50'}`}>
                                                {r.is_present ? 'Present' : 'Absent'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-slate-300">{r.report_number || '—'}</td>
                                        <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                                            {r.presentation_date ? new Date(r.presentation_date).toLocaleDateString('en-GB') : '—'}
                                        </td>
                                        <td className="px-5 py-4">
                                            {r.verdict ? (
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${r.verdict === 'Accepted' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50' : 'bg-red-900/40 text-red-400 border border-red-800/50'}`}>
                                                    {r.verdict}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                {r.report_pdf_path && (
                                                    <a href={`http://localhost:5001/${r.report_pdf_path}`} target="_blank" rel="noopener noreferrer"
                                                        className="w-7 h-7 flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-emerald-400 rounded-lg transition-colors" title="View Report">
                                                        <FileText size={13} />
                                                    </a>
                                                )}
                                                <button onClick={() => handleDelete(r.id)} title="Delete record"
                                                    className="w-7 h-7 flex items-center justify-center bg-red-900/30 hover:bg-red-700 text-red-400 hover:text-white rounded-lg transition-colors">
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
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

// ── Admin PHD Pre-Submission Presentation Panel ────────────────────────────────
export const AdminPreSubmissionPanel = () => {
    const [allStudents, setAllStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [yearFilter, setYearFilter] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [approvedProgressCount, setApprovedProgressCount] = useState(0);
    const [preSubmissions, setPreSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Form for Admin to add details to the student's submission
    const [file, setFile] = useState(null);
    const [form, setForm] = useState({
        presentation_date: '',
        remark: 'Accepted'
    });
    const [committeeMembers, setCommitteeMembers] = useState([]);
    const [newMember, setNewMember] = useState({ name: '', designation: '', department: '' });
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    const fetchData = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/phd/eligible-presubmission-students');
            const data = await res.json();
            if (res.ok) {
                setAllStudents(data.students);
                setFilteredStudents(data.students);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchStudentData = async (rollNo) => {
        if (!rollNo) {
            setPreSubmissions([]);
            setApprovedProgressCount(0);
            return;
        }
        try {
            const [pRes, countRes] = await Promise.all([
                fetch(`http://localhost:5001/api/phd/pre-submissions?roll_no=${rollNo}`),
                fetch(`http://localhost:5001/api/phd/pre-submissions/progress-count/${rollNo}`)
            ]);
            if (pRes.ok) {
                const data = await pRes.json();
                setPreSubmissions(data.preSubmissions);
            }
            if (countRes.ok) {
                const data = await countRes.json();
                setApprovedProgressCount(data.count);
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        if (yearFilter) {
            setFilteredStudents(allStudents.filter(s => s.year_of_admission.toString() === yearFilter));
        } else {
            setFilteredStudents(allStudents);
        }
    }, [yearFilter, allStudents]);

    useEffect(() => {
        fetchStudentData(selectedStudent);
        setFormError('');
        setFormSuccess('');
    }, [selectedStudent]);

    const handleAddMember = () => {
        if (!newMember.name || !newMember.designation || !newMember.department) {
            setFormError('Please fill all committee member details');
            return;
        }
        if (committeeMembers.length >= 10) {
            setFormError('Maximum 10 committee members allowed');
            return;
        }
        setCommitteeMembers([...committeeMembers, newMember]);
        setNewMember({ name: '', designation: '', department: '' });
        setFormError('');
    };

    const handleRemoveMember = (idx) => {
        setCommitteeMembers(committeeMembers.filter((_, i) => i !== idx));
    };

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (f.type !== 'application/pdf') { setFormError('Only PDF files are accepted'); setFile(null); return; }
        if (f.size > 20 * 1024 * 1024) { setFormError('File size must be under 20 MB'); setFile(null); return; }
        setFormError('');
        setFile(f);
    };

    const handleSubmitAdminDetails = async (e) => {
        e.preventDefault();
        setFormError(''); setFormSuccess('');
        
        if (!file) return setFormError('Please upload the synopsis report.');
        if (!form.presentation_date) return setFormError('Please select a presentation date.');
        if (committeeMembers.length === 0) return setFormError('Please add at least one committee member.');

        const body = new FormData();
        body.append('roll_no', selectedStudent);
        body.append('synopsis', file);
        body.append('presentation_date', form.presentation_date);
        body.append('committee_members', JSON.stringify(committeeMembers));
        body.append('remark', form.remark);

        setSubmitting(true);
        try {
            const res = await fetch(`http://localhost:5001/api/phd/admin/pre-submissions`, {
                method: 'POST',
                body
            });
            const data = await res.json();
            
            if (res.ok) {
                setFormSuccess('Pre-submission recorded successfully!');
                setForm({ presentation_date: '', remark: 'Accepted' });
                setCommitteeMembers([]);
                setFile(null);
                fetchStudentData(selectedStudent);
                setTimeout(() => setFormSuccess(''), 3000);
            } else {
                setFormError(data.message || 'Submission failed.');
            }
        } catch {
            setFormError('Failed to connect to server.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-white">Pre-Submission Presentation</h2>
                <p className="text-slate-400 text-sm mt-1">Manage pre submission reports and presentations.</p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Filter by Year */}
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Filter by Admission Year</label>
                        <select
                            value={yearFilter}
                            onChange={e => setYearFilter(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-all"
                        >
                            <option value="">All Years</option>
                            {[...new Set(allStudents.map(s => s.year_of_admission))].sort((a,b)=>b-a).map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    {/* Student Select */}
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">
                            Select Student
                            {loading && <Loader2 size={10} className="inline ml-2 animate-spin text-emerald-400" />}
                        </label>
                        <select
                            value={selectedStudent}
                            onChange={e => setSelectedStudent(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-all"
                        >
                            <option value="">{loading ? 'Loading students...' : '— Select a student —'}</option>
                            {filteredStudents.map(s => (
                                <option key={s.roll_no} value={s.roll_no}>{s.first_name} {s.last_name} ({s.roll_no})</option>
                            ))}
                        </select>
                    </div>
                </div>

                {selectedStudent && (
                    <div className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-300">Approved Progress Reports for this student:</p>
                        </div>
                        <div className="bg-emerald-900/30 text-emerald-400 px-4 py-2 rounded-lg font-bold border border-emerald-800/50">
                            {approvedProgressCount}
                        </div>
                    </div>
                )}
            </div>

            {selectedStudent && (
                <form onSubmit={handleSubmitAdminDetails} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-5">
                    <div className="border-b border-slate-700 pb-4">
                        <h3 className="text-sm font-semibold text-slate-300">Record Pre-Submission Presentation</h3>
                        <p className="text-xs text-slate-400 mt-1">Upload the pre submission report and record committee details and outcomes.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* File Upload */}
                        <div className="sm:col-span-2">
                            <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Pre Submission Report (PDF, Max 20MB) <span className="text-red-400">*</span></label>
                            <input 
                                type="file" 
                                accept="application/pdf"
                                onChange={handleFile}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600/20 file:text-emerald-400 hover:file:bg-emerald-600/30 transition-all"
                            />
                        </div>
                        {/* Date */}
                        <div>
                            <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Date of Presentation <span className="text-red-400">*</span></label>
                            <input
                                type="date"
                                value={form.presentation_date}
                                onChange={e => setForm(f => ({ ...f, presentation_date: e.target.value }))}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-all cursor-pointer"
                            />
                        </div>

                        {/* Remark */}
                        <div>
                            <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Presentation Outcome <span className="text-red-400">*</span></label>
                            <select
                                value={form.remark}
                                onChange={e => setForm(f => ({ ...f, remark: e.target.value }))}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-all"
                            >
                                <option value="Accepted">Accepted</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>

                        {/* Committee Members */}
                        <div className="sm:col-span-2 space-y-3">
                            <label className="block text-xs text-slate-400 font-semibold uppercase tracking-wide">Committee Members (Max 10) <span className="text-red-400">*</span></label>
                            
                            {/* Add Member Form */}
                            <div className="flex items-start space-x-2 bg-slate-900 p-3 rounded-xl border border-slate-700">
                                <input type="text" placeholder="Name" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500" />
                                <input type="text" placeholder="Designation" value={newMember.designation} onChange={e => setNewMember({...newMember, designation: e.target.value})} className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500" />
                                <input type="text" placeholder="Department" value={newMember.department} onChange={e => setNewMember({...newMember, department: e.target.value})} className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500" />
                                <button type="button" onClick={handleAddMember} className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg flex-shrink-0 transition-colors">
                                    <Plus size={18} />
                                </button>
                            </div>

                            {/* Member List */}
                            {committeeMembers.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                    {committeeMembers.map((m, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-slate-800 border border-slate-700 p-2 rounded-lg">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-white">{m.name}</span>
                                                <span className="text-xs text-slate-400">{m.designation}, {m.department}</span>
                                            </div>
                                            <button type="button" onClick={() => handleRemoveMember(idx)} className="text-red-400 hover:text-red-300 p-1">
                                                <Minus size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {formError && <p className="text-red-400 text-sm mt-2">{formError}</p>}
                    {formSuccess && <p className="text-emerald-400 text-sm mt-2">{formSuccess}</p>}

                    <div className="pt-2">
                        <button type="submit" disabled={submitting || !file}
                            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                            {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                            <span>{submitting ? 'Submitting...' : 'Upload Pre-Submission Details'}</span>
                        </button>
                    </div>
                </form>
            )}

            {selectedStudent && preSubmissions.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Presentation Logs</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {preSubmissions.map(p => (
                            <div key={p.id} className="bg-slate-800/40 border border-slate-700 rounded-xl p-5 flex flex-col md:flex-row gap-4">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${!p.remark ? 'bg-amber-900/40 text-amber-400 border border-amber-800/50' : (p.remark === 'Accepted' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50' : 'bg-red-900/40 text-red-400 border border-red-800/50')}`}>
                                            {p.remark || 'Pending Review'}
                                        </span>
                                        {p.presentation_date && (
                                            <div className="flex items-center space-x-1.5 text-sm text-slate-300">
                                                <Calendar size={14} className="text-slate-500" />
                                                <span>{new Date(p.presentation_date).toLocaleDateString('en-GB')}</span>
                                            </div>
                                        )}
                                        <a href={`http://localhost:5001/${p.synopsis_pdf_path}`} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center space-x-1.5 text-xs font-semibold px-2 py-1 bg-slate-700 hover:bg-slate-600 text-emerald-400 rounded-lg transition-colors">
                                            <FileText size={12} /><span>View Report</span>
                                        </a>
                                    </div>
                                    {p.committee_members && p.committee_members.length > 0 && (
                                        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800">
                                            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide font-semibold">Committee Members</p>
                                            <div className="flex flex-wrap gap-2">
                                                {p.committee_members.map((m, idx) => (
                                                    <span key={idx} className="bg-slate-800 border border-slate-700 text-slate-300 text-xs px-2 py-1 rounded">
                                                        {m.name} ({m.designation})
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
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

// ── Admin PHD Final Submission Panel ──────────────────────────────────────────
export const AdminFinalSubmissionPanel = () => {
    const [allStudents, setAllStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [yearFilter, setYearFilter] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [preSubmissionDate, setPreSubmissionDate] = useState(null);
    const [finalSubmissions, setFinalSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [file, setFile] = useState(null);
    const [finalDate, setFinalDate] = useState('');
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    const fetchStudents = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/phd/eligible-finalsubmission-students');
            const data = await res.json();
            if (res.ok) { setAllStudents(data.students); setFilteredStudents(data.students); }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchStudentData = async (rollNo) => {
        if (!rollNo) { setPreSubmissionDate(null); setFinalSubmissions([]); return; }
        try {
            const [dateRes, fsRes] = await Promise.all([
                fetch(`http://localhost:5001/api/phd/final-submissions/presubmission-date/${rollNo}`),
                fetch(`http://localhost:5001/api/phd/final-submissions?roll_no=${rollNo}`)
            ]);
            if (dateRes.ok) { const d = await dateRes.json(); setPreSubmissionDate(d.presentation_date); }
            if (fsRes.ok) { const d = await fsRes.json(); setFinalSubmissions(d.finalSubmissions); }
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchStudents(); }, []);

    useEffect(() => {
        if (yearFilter) {
            setFilteredStudents(allStudents.filter(s => s.year_of_admission.toString() === yearFilter));
        } else {
            setFilteredStudents(allStudents);
        }
    }, [yearFilter, allStudents]);

    useEffect(() => {
        fetchStudentData(selectedStudent);
        setFormError(''); setFormSuccess('');
        setFile(null); setFinalDate('');
    }, [selectedStudent]);

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (f.type !== 'application/pdf') { setFormError('Only PDF files are accepted'); setFile(null); return; }
        if (f.size > 20 * 1024 * 1024) { setFormError('File must be under 20MB'); setFile(null); return; }
        setFormError('');
        setFile(f);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(''); setFormSuccess('');
        if (!file) return setFormError('Please upload the final notification PDF.');
        if (!finalDate) return setFormError('Please select the final presentation date.');

        const body = new FormData();
        body.append('roll_no', selectedStudent);
        body.append('final_presentation_date', finalDate);
        body.append('notification', file);

        setSubmitting(true);
        try {
            const res = await fetch('http://localhost:5001/api/phd/admin/final-submissions', { method: 'POST', body });
            const data = await res.json();
            if (res.ok) {
                setFormSuccess('Final submission recorded successfully!');
                setFile(null); setFinalDate('');
                fetchStudentData(selectedStudent);
                setTimeout(() => setFormSuccess(''), 3000);
            } else {
                setFormError(data.message || 'Submission failed.');
            }
        } catch { setFormError('Failed to connect to server.'); }
        finally { setSubmitting(false); }
    };

    const years = [...new Set(allStudents.map(s => s.year_of_admission))].sort().reverse();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-white">Final Submission</h2>
                <p className="text-slate-400 text-sm mt-1">Record the final presentation and upload the official notification.</p>
            </div>

            {/* Student Selection */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Filter by Admission Year</label>
                        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-all">
                            <option value="">All Years</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Select Student <span className="text-red-400">*</span></label>
                        <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-all">
                            <option value="">{loading ? 'Loading...' : '— Select a student —'}</option>
                            {filteredStudents.map(s => (
                                <option key={s.roll_no} value={s.roll_no}>{s.first_name} {s.last_name} ({s.roll_no})</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Pre-Submission Presentation Date display */}
                {selectedStudent && (
                    <div className="mt-2 p-4 bg-slate-900/50 rounded-xl border border-slate-700 flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-slate-300">
                            <Calendar size={16} className="text-emerald-400" />
                            <p className="text-sm">Approved Pre-Submission Presentation Date:</p>
                        </div>
                        <span className="font-bold text-emerald-400 text-sm">
                            {preSubmissionDate
                                ? new Date(preSubmissionDate).toLocaleDateString('en-GB')
                                : 'N/A'}
                        </span>
                    </div>
                )}
            </div>

            {/* Final Submission Form */}
            {selectedStudent && (
                <form onSubmit={handleSubmit} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-5">
                    <div className="border-b border-slate-700 pb-4">
                        <h3 className="text-sm font-semibold text-slate-300">Record Final Submission</h3>
                        <p className="text-xs text-slate-400 mt-1">Upload the final notification and set the presentation date.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Notification Upload */}
                        <div className="sm:col-span-2">
                            <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Final Notification (PDF, Max 20MB) <span className="text-red-400">*</span></label>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFile}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600/20 file:text-emerald-400 hover:file:bg-emerald-600/30 transition-all"
                            />
                            {file && <p className="text-xs text-emerald-400 mt-1.5">✓ {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>}
                        </div>

                        {/* Final Presentation Date */}
                        <div className="sm:col-span-2">
                            <label className="block text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Date of Final Presentation <span className="text-red-400">*</span></label>
                            <input
                                type="date"
                                value={finalDate}
                                onChange={e => setFinalDate(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-all cursor-pointer"
                            />
                        </div>
                    </div>

                    {formError && <p className="text-red-400 text-sm">{formError}</p>}
                    {formSuccess && <p className="text-emerald-400 text-sm">{formSuccess}</p>}

                    <div className="pt-2">
                        <button type="submit" disabled={submitting || !file}
                            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                            {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                            <span>{submitting ? 'Submitting...' : 'Upload Final Submission'}</span>
                        </button>
                    </div>
                </form>
            )}

            {/* Submission Logs */}
            {selectedStudent && finalSubmissions.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Final Submission Logs</h3>
                    {finalSubmissions.map(f => (
                        <div key={f.id} className="bg-slate-800/40 border border-slate-700 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-emerald-900/40 border border-emerald-800/50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <FileText size={18} className="text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Final Presentation</p>
                                    <div className="flex items-center space-x-2 mt-0.5">
                                        <Calendar size={12} className="text-slate-500" />
                                        <span className="text-xs text-slate-400">{new Date(f.final_presentation_date).toLocaleDateString('en-GB')}</span>
                                    </div>
                                </div>
                            </div>
                            <a href={`http://localhost:5001/${f.notification_pdf_path}`} target="_blank" rel="noopener noreferrer"
                                className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-emerald-400 rounded-lg transition-colors">
                                <FileText size={13} /><span>View Notification</span><ExternalLink size={10} />
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
