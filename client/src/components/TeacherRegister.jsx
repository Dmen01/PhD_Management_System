import { API_BASE } from '../config';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Check, Send, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

const Toast = ({ message }) => (
    <motion.div
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -60 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-3 bg-amber-500 text-slate-900 px-6 py-4 rounded-2xl shadow-lg border border-amber-400"
    >
        <CheckCircle size={22} className="shrink-0" />
        <span className="font-semibold text-sm">{message}</span>
    </motion.div>
);

const Input = ({ label, icon: Icon, accentClass = "focus:border-amber-500 focus:ring-amber-900/50", className = "", ...props }) => (
    <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-300">{label}</label>
        <div className="relative">
            {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />}
            <input
                className={`w-full h-12 rounded-xl border border-slate-700 bg-slate-800 text-white ${accentClass} outline-none transition-all ${Icon ? 'pl-12' : 'px-4'} pr-4 ${className}`}
                {...props}
            />
        </div>
    </div>
);

const PasswordInput = ({ label, name, value, onChange, placeholder }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">{label}</label>
            <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                    name={name}
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required
                    className="w-full h-12 rounded-xl border border-slate-700 bg-slate-800 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-900/50 outline-none transition-all pl-12 pr-12"
                />
                <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 transition-colors">
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>
    );
};

const passwordRules = [
    { label: "At least 8 characters",  test: (p) => p.length >= 8 },
    { label: "One uppercase letter",   test: (p) => /[A-Z]/.test(p) },
    { label: "One lowercase letter",   test: (p) => /[a-z]/.test(p) },
    { label: "One number",             test: (p) => /\d/.test(p) },
    { label: "One special character",  test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

const PasswordStrength = ({ password }) => {
    if (!password) return null;
    return (
        <div className="space-y-1 pt-1">
            {passwordRules.map(({ label, test }) => {
                const pass = test(password);
                return (
                    <div key={label} className={`flex items-center space-x-2 text-xs transition-colors ${pass ? 'text-amber-400' : 'text-slate-500'}`}>
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-slate-900 text-[10px] font-bold ${pass ? 'bg-amber-400' : 'bg-slate-700'}`}>
                            {pass ? '✓' : '·'}
                        </span>
                        <span>{label}</span>
                    </div>
                );
            })}
        </div>
    );
};

const CredentialsForm = ({ form, updateForm, sendOtp, loading }) => {
    const [emailError, setEmailError] = useState('');
    const allRulesPass = passwordRules.every(({ test }) => test(form.password));
    return (
        <motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
            onSubmit={(e) => {
                if (!isValidEmail(form.email)) { setEmailError('Please enter a valid email address'); return e.preventDefault(); }
                sendOtp(e);
            }}
        >
            <div className="space-y-1">
                <Input label="Authorized Email Address *" name="email" type="email" value={form.email}
                    onChange={(e) => { updateForm(e); setEmailError(''); }}
                    onBlur={() => form.email && !isValidEmail(form.email) && setEmailError('Please enter a valid email address')}
                    icon={Mail} placeholder="Enter Your Approved Email" required
                    className={emailError ? '!border-red-500' : ''}
                />
                {emailError && <p className="text-xs text-red-400 pl-1">{emailError}</p>}
            </div>
            <div className="space-y-2">
                <PasswordInput label="Password *" name="password" value={form.password} onChange={updateForm} placeholder="Create a secure password" />
                <PasswordStrength password={form.password} />
            </div>
            <PasswordInput label="Confirm Password *" name="confirmPassword" value={form.confirmPassword} onChange={updateForm} placeholder="Confirm your password" />
            <button
                type="submit"
                disabled={loading || !allRulesPass}
                className={`w-full h-14 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 ${(loading || !allRulesPass) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {loading ? <Loader2 className="animate-spin" /> : <><span>Verify Authorization</span><Send size={18} /></>}
            </button>
        </motion.form>
    );
};

const OtpForm = ({ email, updateForm, register, loading, goBack }) => (
    <motion.form
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
        onSubmit={register}
    >
        <div className="bg-amber-900/30 p-4 rounded-xl border border-amber-800 text-amber-200 text-sm">
            Authorization verified. We've sent a security code to <strong>{email}</strong>.
        </div>
        <Input
            label="Security Code *"
            name="otp"
            onChange={updateForm}
            placeholder="123456"
            maxLength={6}
            className="text-center text-2xl tracking-widest"
            required
        />
        <button
            type="submit"
            disabled={loading}
            className={`w-full h-14 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {loading ? <Loader2 className="animate-spin" /> : <><span>Complete Registration</span><Check size={18} /></>}
        </button>
        <button type="button" onClick={goBack} className="w-full text-sm text-slate-500 hover:text-amber-400 transition-colors">
            Cancel & Go Back
        </button>
    </motion.form>
);

const TeacherRegister = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', otp: '' });

    const updateForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const sendOtp = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) return alert('Passwords do not match');
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/teacher/otp/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email })
            });
            const data = await res.json();
            if (res.ok) setStep(2);
            else alert(data.message);
        } catch (err) {
            console.error(err);
            alert('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const register = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const otpRes = await fetch(`${API_BASE}/api/auth/otp/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email, otp: form.otp })
            });
            const otpData = await otpRes.json();
            if (!otpRes.ok) return alert(otpData.message);

            const res = await fetch(`${API_BASE}/api/auth/teacher/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email, password: form.password })
            });
            const data = await res.json();
            if (res.ok) {
                setShowToast(true);
                setTimeout(() => { setShowToast(false); navigate('/login/teacher'); }, 3000);
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex">
            <AnimatePresence>
                {showToast && <Toast message="Account created! Redirecting to login..." />}
            </AnimatePresence>

            <div className="w-full lg:w-1/2 p-8 md:p-12 lg:px-20 lg:py-12 flex flex-col justify-center relative overflow-y-auto bg-slate-900 border-r border-slate-800">
                <motion.button
                    whileHover={{ x: -5 }}
                    onClick={() => navigate('/login/teacher')}
                    className="absolute top-8 left-8 flex items-center text-slate-400 hover:text-amber-400 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" /> Back to Login
                </motion.button>

                <div className="max-w-md w-full mx-auto space-y-8 mt-16 lg:mt-0">
                    <div className="space-y-2">
                        <div className="h-12 w-12 bg-amber-500 rounded-xl mb-6 flex items-center justify-center">
                            <div className="w-6 h-6 border-4 border-slate-900 rounded-full"></div>
                        </div>
                        <h1 className="text-3xl font-bold text-white">Teacher Setup</h1>
                        <p className="text-slate-400">Registration for pre-approved faculty members.</p>
                    </div>

                    {/* Step indicator */}
                    <div className="flex items-center space-x-3">
                        <div className={`h-2 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-amber-500' : 'bg-slate-700'}`} />
                        <div className={`h-2 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-amber-500' : 'bg-slate-700'}`} />
                    </div>

                    {step === 1
                        ? <CredentialsForm form={form} updateForm={updateForm} sendOtp={sendOtp} loading={loading} />
                        : <OtpForm email={form.email} updateForm={updateForm} register={register} loading={loading} goBack={() => setStep(1)} />
                    }
                </div>
            </div>

            <div className="hidden lg:flex lg:w-1/2 bg-slate-950 relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-900 rounded-full mix-blend-screen filter blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-900 rounded-full mix-blend-screen filter blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2"></div>
                </div>
                <div className="relative z-10 p-12 text-center space-y-6 max-w-lg">
                    <h2 className="text-4xl font-bold text-white leading-tight">University Faculty Portal</h2>
                    <p className="text-amber-200/70 text-lg">Dedicated space for PhD supervisors and faculty members.</p>
                </div>
                <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-slate-950 to-transparent z-20"></div>
            </div>
        </div>
    );
};

export default TeacherRegister;
