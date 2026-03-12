import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard, Upload, FileText, Calendar,
    CheckSquare, Square, Loader2, ExternalLink, CheckCircle, ChevronDown
} from 'lucide-react';

const SEMESTERS = Array.from({ length: 12 }, (_, i) => i + 1);
const API = 'http://localhost:5001';

// ── View Mode — read-only record display ──────────────────────────────────────
const FeeRecord = ({ fee }) => {
    const date = new Date(fee.payment_date).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
    const submitted = new Date(fee.submitted_at).toLocaleString('en-IN');

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle size={18} />
                <span className="text-sm font-semibold">Fee receipt submitted</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoCard icon={Calendar} label="Payment Date" value={date} />
                <InfoCard icon={Calendar} label="Submitted On" value={submitted} />
                <InfoCard icon={CheckCircle} label="Verified by Student" value="Yes" />
            </div>

            <a
                href={`${API}/${fee.receipt_pdf_path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-semibold text-white transition-all shadow-sm shadow-blue-200"
            >
                <FileText size={16} />
                <span>View Receipt PDF</span>
                <ExternalLink size={13} />
            </a>
        </motion.div>
    );
};

const InfoCard = ({ icon: Icon, label, value }) => (
    <div className="bg-white rounded-xl border border-blue-100 p-4 flex items-start space-x-3 shadow-sm">
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
            <Icon size={15} className="text-blue-500" />
        </div>
        <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
            <p className="text-sm text-slate-800 font-semibold mt-0.5">{value}</p>
        </div>
    </div>
);

// ── Upload Form — shown when no record exists ────────────────────────────────
const UploadForm = ({ applicationNumber, semester, onSuccess }) => {
    const [paymentDate, setPaymentDate] = useState('');
    const [file, setFile] = useState(null);
    const [verified, setVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fileError, setFileError] = useState('');

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (f.type !== 'application/pdf') { setFileError('Only PDF files are accepted'); setFile(null); return; }
        if (f.size > 10 * 1024 * 1024) { setFileError('File size must be under 10 MB'); setFile(null); return; }
        setFileError('');
        setFile(f);
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!file) return setError('Please upload a PDF receipt');
        if (!paymentDate) return setError('Please enter the payment date');
        if (!verified) return setError('Please verify the details before submitting');

        const body = new FormData();
        body.append('receipt', file);
        body.append('applicationNumber', applicationNumber);
        body.append('semester', semester);
        body.append('paymentDate', paymentDate);
        body.append('verifiedByStudent', 'true');

        setLoading(true); setError('');
        try {
            const res = await fetch(`${API}/api/fee/upload`, { method: 'POST', body });
            const data = await res.json();
            if (res.ok) onSuccess();
            else setError(data.message);
        } catch { setError('Failed to connect to server'); }
        finally { setLoading(false); }
    };

    return (
        <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            onSubmit={submit} className="space-y-5">

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-500 text-sm px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            {/* PDF Upload */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Fee Receipt PDF *</label>
                <label className={`flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all
                    ${file ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50'}`}>
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
                                <span className="text-sm text-slate-500">Click to upload PDF <span className="text-slate-400">(max 10 MB)</span></span>
                            </>
                        )}
                    </div>
                    <input type="file" accept="application/pdf" onChange={handleFile} className="hidden" />
                </label>
                {fileError && <p className="text-xs text-red-400">{fileError}</p>}
            </div>

            {/* Payment Date */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Date of Fee Payment *</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                    <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 pl-9 pr-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                </div>
            </div>

            {/* Verification checkbox */}
            <button type="button" onClick={() => setVerified(!verified)}
                className="flex items-start space-x-3 group w-full text-left">
                <div className="shrink-0 mt-0.5">
                    {verified
                        ? <CheckSquare size={18} className="text-blue-500" />
                        : <Square size={18} className="text-slate-400 group-hover:text-slate-600" />}
                </div>
                <span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">
                    I verify that the fee payment details and the uploaded receipt are correct.
                    I understand that this submission cannot be edited after uploading.
                </span>
            </button>

            <button type="submit" disabled={loading || !verified || !file || !paymentDate}
                className={`w-full h-11 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center space-x-2
                    ${(loading || !verified || !file || !paymentDate) ? 'opacity-40 cursor-not-allowed' : 'shadow-lg shadow-blue-200'}`}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : <><Upload size={16} /><span>Submit Fee Receipt</span></>}
            </button>
        </motion.form>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const FeeDetails = () => {
    const [semester, setSemester] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [feeData, setFeeData] = useState(null);
    const [noRecord, setNoRecord] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [applicationNumber, setApplicationNumber] = useState('');

    const studentEmail = localStorage.getItem('studentEmail');

    // Resolve application number from email
    useEffect(() => {
        const fetchAppNo = async () => {
            try {
                const res = await fetch(`${API}/api/student/profile?email=${encodeURIComponent(studentEmail)}`);
                if (res.ok) {
                    const data = await res.json();
                    setApplicationNumber(data.profile.application_number);
                }
            } catch (err) { console.error(err); }
        };
        fetchAppNo();
    }, []);

    const selectSemester = (sem) => {
        setSemester(sem);
        setDropdownOpen(false);
        setFeeData(null);
        setNoRecord(false);
        fetchFeeData(sem);
    };

    const fetchFeeData = async (sem) => {
        if (!applicationNumber) return;
        setFetching(true);
        try {
            const res = await fetch(`${API}/api/fee?applicationNumber=${applicationNumber}&semester=${sem}`);
            if (res.ok) { const d = await res.json(); setFeeData(d.fee); setNoRecord(false); }
            else if (res.status === 404) { setFeeData(null); setNoRecord(true); }
        } catch (err) { console.error(err); }
        finally { setFetching(false); }
    };

    const handleUploadSuccess = () => fetchFeeData(semester);

    return (
        <div className="max-w-2xl space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Fee Details</h2>
                <p className="text-slate-400 text-sm mt-1">Select a semester to view or submit your fee receipt.</p>
            </div>

            {/* Semester selector */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Select Semester</label>
                <div className="relative">
                    <button type="button" onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="w-full flex items-center justify-between px-4 h-11 bg-white border border-slate-200 rounded-xl text-sm shadow-sm hover:border-blue-400 transition-all">
                        <span className={semester ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                            {semester ? `Semester ${semester}` : 'Choose a semester...'}
                        </span>
                        <motion.div animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown size={16} className="text-slate-400" />
                        </motion.div>
                    </button>

                    <AnimatePresence>
                        {dropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                                className="absolute z-20 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                                <div className="grid grid-cols-4 gap-1 p-2">
                                    {SEMESTERS.map(s => (
                                        <button key={s} type="button" onClick={() => selectSemester(s)}
                                            className={`py-2.5 rounded-lg text-sm font-medium transition-all
                                                ${semester === s
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}>
                                            Sem {s}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Content area */}
            <AnimatePresence mode="wait">
                {!semester && (
                    <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-slate-600 text-sm">
                        ↑ Select a semester above to get started.
                    </motion.p>
                )}

                {semester && fetching && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center space-x-3 text-slate-500">
                        <Loader2 size={18} className="animate-spin" />
                        <span className="text-sm">Loading...</span>
                    </motion.div>
                )}

                {semester && !fetching && feeData && (
                    <motion.div key="record" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Semester {semester} Fee Record</p>
                        <FeeRecord fee={feeData} />
                    </motion.div>
                )}

                {semester && !fetching && noRecord && !applicationNumber && (
                    <motion.p key="noapplication" className="text-sm text-red-400">
                        Profile not found. Please complete your registration first.
                    </motion.p>
                )}

                {semester && !fetching && noRecord && applicationNumber && (
                    <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Upload Semester {semester} Fee Receipt</p>
                        <UploadForm
                            applicationNumber={applicationNumber}
                            semester={semester}
                            onSuccess={handleUploadSuccess}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FeeDetails;
