import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Phone, Calendar, FileText,
    Shield, Send, Eye, EyeOff, Loader2, Check, ChevronRight, Lock
} from 'lucide-react';

const passwordRules = [
    { label: "At least 8 characters",  test: (p) => p.length >= 8 },
    { label: "One uppercase letter",   test: (p) => /[A-Z]/.test(p) },
    { label: "One lowercase letter",   test: (p) => /[a-z]/.test(p) },
    { label: "One number",            test: (p) => /\d/.test(p) },
    { label: "One special character", test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

// ── Reusable sub-components ───────────────────────────────────────────────────

const InfoCard = ({ icon: Icon, label, value }) => (
    <div className="bg-white/5 border border-white/8 rounded-xl p-4 flex items-start space-x-3">
        <div className="w-8 h-8 bg-indigo-500/15 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
            <Icon size={15} className="text-indigo-400" />
        </div>
        <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
            <p className="text-sm text-white font-semibold mt-0.5">{value || '—'}</p>
        </div>
    </div>
);

const PasswordInput = ({ label, name, value, onChange }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                <input
                    name={name} type={show ? 'text' : 'password'} value={value} onChange={onChange}
                    className="w-full h-10 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 pl-9 pr-10 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    placeholder="••••••••"
                />
                <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
            </div>
        </div>
    );
};

const StrengthRow = ({ password }) => {
    if (!password) return null;
    return (
        <div className="space-y-1">
            {passwordRules.map(({ label, test }) => {
                const pass = test(password);
                return (
                    <div key={label} className={`flex items-center space-x-2 text-xs ${pass ? 'text-green-400' : 'text-slate-600'}`}>
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${pass ? 'bg-green-500' : 'bg-slate-700'}`}>
                            {pass ? '✓' : '·'}
                        </span>
                        <span>{label}</span>
                    </div>
                );
            })}
        </div>
    );
};

// ── Change Password Panel ─────────────────────────────────────────────────────
const ChangePassword = ({ email, onCancel }) => {
    const [step, setStep] = useState('idle'); // idle | sending | otp | done
    const [otp, setOtp] = useState('');
    const [pw, setPw] = useState({ newPassword: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const allRulesPass = passwordRules.every(({ test }) => test(pw.newPassword));

    const sendOtp = async () => {
        setStep('sending');
        setError('');
        try {
            const res = await fetch('http://localhost:5001/api/auth/otp/send-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) setStep('otp');
            else { setError(data.message); setStep('idle'); }
        } catch { setError('Failed to connect'); setStep('idle'); }
    };

    const resetPassword = async (e) => {
        e.preventDefault();
        if (!allRulesPass) return setError('Password does not meet all requirements');
        if (pw.newPassword !== pw.confirmPassword) return setError('Passwords do not match');
        setLoading(true); setError('');
        try {
            const res = await fetch('http://localhost:5001/api/auth/password/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword: pw.newPassword })
            });
            const data = await res.json();
            if (res.ok) setStep('done');
            else setError(data.message);
        } catch { setError('Failed to connect'); }
        finally { setLoading(false); }
    };

    if (step === 'done') return (
        <div className="flex flex-col items-center p-6 space-y-3 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <Check size={22} className="text-green-400" />
            </div>
            <p className="text-white font-semibold">Password changed successfully!</p>
            <button onClick={onCancel} className="text-sm text-indigo-400 hover:text-indigo-300">Back to Profile</button>
        </div>
    );

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Change Password</h3>
                <button onClick={onCancel} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Cancel</button>
            </div>

            {error && <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}

            {(step === 'idle' || step === 'sending') && (
                <div className="space-y-4">
                    <p className="text-sm text-slate-400">
                        We'll send a verification code to <span className="text-white font-medium">{email}</span> to confirm your identity.
                    </p>
                    <button onClick={sendOtp} disabled={step === 'sending'}
                        className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50">
                        {step === 'sending' ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                        <span>{step === 'sending' ? 'Sending...' : 'Send Verification Code'}</span>
                    </button>
                </div>
            )}

            {step === 'otp' && (
                <form onSubmit={resetPassword} className="space-y-4">
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3 text-xs text-indigo-300">
                        A code was sent to {email}. Check your server console in dev mode.
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Verification Code</label>
                        <input value={otp} onChange={e => setOtp(e.target.value)} maxLength={6}
                            className="w-full h-10 bg-white/5 border border-white/10 rounded-lg text-sm text-white text-center tracking-widest text-xl px-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            placeholder="123456" required />
                    </div>
                    <div className="space-y-3">
                        <PasswordInput label="New Password" name="newPassword" value={pw.newPassword}
                            onChange={e => setPw({ ...pw, newPassword: e.target.value })} />
                        <StrengthRow password={pw.newPassword} />
                        <PasswordInput label="Confirm New Password" name="confirmPassword" value={pw.confirmPassword}
                            onChange={e => setPw({ ...pw, confirmPassword: e.target.value })} />
                    </div>
                    <button type="submit" disabled={loading || !allRulesPass}
                        className={`w-full h-11 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center space-x-2 ${(loading || !allRulesPass) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Reset Password</span><ChevronRight size={16} /></>}
                    </button>
                </form>
            )}
        </div>
    );
};

// ── Main Profile Panel ────────────────────────────────────────────────────────
const StudentProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const studentEmail = localStorage.getItem('studentEmail');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(
                    `http://localhost:5001/api/student/profile?email=${encodeURIComponent(studentEmail)}`
                );
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data.profile);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!profile) return (
        <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            Profile not found.
        </div>
    );

    const dob = profile.dob ? new Date(profile.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

    return (
        <div className="max-w-3xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        {profile.first_name} {profile.middle_name || ''} {profile.last_name}
                    </h2>
                    <p className="text-slate-400 text-sm mt-0.5">Application No: <span className="text-indigo-400 font-mono font-semibold">{profile.application_number}</span></p>
                </div>
                <div className="w-14 h-14 bg-indigo-600/30 border border-indigo-500/30 rounded-2xl flex items-center justify-center">
                    <User size={26} className="text-indigo-400" />
                </div>
            </div>

            {/* Personal Info */}
            <section className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Personal Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoCard icon={User}     label="Father's Name"    value={profile.father_name} />
                    <InfoCard icon={User}     label="Mother's Name"    value={profile.mother_name} />
                    <InfoCard icon={Calendar} label="Date of Birth"    value={dob} />
                    <InfoCard icon={Calendar} label="Year of Admission" value={profile.year_of_admission} />
                </div>
            </section>

            {/* Contact Info */}
            <section className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contact Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoCard icon={Mail}  label="Email"         value={profile.email} />
                    <InfoCard icon={Phone} label="Mobile Number" value={profile.mobile_number} />
                </div>
            </section>

            {/* Security */}
            <section className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Security</p>
                <AnimatePresence mode="wait">
                    {showChangePassword
                        ? (
                            <motion.div key="pwform" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <ChangePassword email={studentEmail} onCancel={() => setShowChangePassword(false)} />
                            </motion.div>
                        ) : (
                            <motion.div key="pwbtn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <button onClick={() => setShowChangePassword(true)}
                                    className="flex items-center space-x-3 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/8 rounded-xl transition-all group">
                                    <Shield size={16} className="text-indigo-400" />
                                    <span className="text-sm font-medium text-white">Change Password</span>
                                    <ChevronRight size={15} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
                                </button>
                            </motion.div>
                        )
                    }
                </AnimatePresence>
            </section>
        </div>
    );
};

export default StudentProfile;
