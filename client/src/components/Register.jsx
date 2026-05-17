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
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-3 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-green-300"
    >
        <CheckCircle size={22} className="shrink-0" />
        <span className="font-semibold text-sm">{message}</span>
    </motion.div>
);

const Input = ({ label, icon: Icon, className = "", ...props }) => (
    <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <div className="relative">
            {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />}
            <input
                className={`w-full h-12 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all ${Icon ? 'pl-12' : 'px-4'} pr-4 ${className}`}
                {...props}
            />
        </div>
    </div>
);

const PasswordInput = ({ label, name, value, onChange, placeholder }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">{label}</label>
            <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    name={name}
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required
                    className="w-full h-12 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all pl-12 pr-12"
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>
    );
};

const SubmitButton = ({ loading, disabled, text, icon: Icon, color }) => {
    const bgClass = color === 'green'
        ? 'bg-green-600 hover:bg-green-700 shadow-green-200'
        : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200';
    const isDisabled = loading || disabled;
    return (
        <button
            type="submit"
            disabled={isDisabled}
            className={`w-full h-14 ${bgClass} text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {loading ? <Loader2 className="animate-spin" /> : <><span>{text}</span><Icon size={18} /></>}
        </button>
    );
};

const passwordRules = [
    { label: "At least 8 characters",    test: (p) => p.length >= 8 },
    { label: "One uppercase letter",      test: (p) => /[A-Z]/.test(p) },
    { label: "One lowercase letter",      test: (p) => /[a-z]/.test(p) },
    { label: "One number",               test: (p) => /\d/.test(p) },
    { label: "One special character",    test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

const PasswordStrength = ({ password }) => {
    if (!password) return null;
    return (
        <div className="space-y-1 pt-1">
            {passwordRules.map(({ label, test }) => {
                const pass = test(password);
                return (
                    <div key={label} className={`flex items-center space-x-2 text-xs transition-colors ${pass ? 'text-green-600' : 'text-slate-400'}`}>
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${pass ? 'bg-green-500' : 'bg-slate-200'}`}>
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
    const handleEmailChange = (e) => { updateForm(e); setEmailError(''); };
    const handleEmailBlur = () => {
        if (form.email && !isValidEmail(form.email)) setEmailError('Please enter a valid email address');
    };
    return (
        <motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
            onSubmit={(e) => { if (!isValidEmail(form.email)) { setEmailError('Please enter a valid email address'); return e.preventDefault(); } sendOtp(e); }}
        >
            <div className="space-y-1">
                <Input label="Email Address *" name="email" type="email" value={form.email}
                    onChange={handleEmailChange} onBlur={handleEmailBlur}
                    icon={Mail} placeholder="Enter Your Email" required
                    className={emailError ? '!border-red-400' : ''}
                />
                {emailError && <p className="text-xs text-red-500 pl-1">{emailError}</p>}
            </div>
            <div className="space-y-2">
                <PasswordInput label="Password *" name="password" value={form.password} onChange={updateForm} placeholder="Create a password" />
                <PasswordStrength password={form.password} />
            </div>
            <PasswordInput label="Confirm Password *" name="confirmPassword" value={form.confirmPassword} onChange={updateForm} placeholder="Confirm your password" />
            <SubmitButton loading={loading} disabled={!allRulesPass} text="Verify Email & Continue" icon={Send} color="indigo" />
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
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-indigo-800 text-sm">
            We've sent a verification code to <strong>{email}</strong>. Please enter it below.
            <br />(Check server console for mock OTP)
        </div>
        <Input
            label="Verification Code *"
            name="otp"
            onChange={updateForm}
            placeholder="123456"
            maxLength={6}
            className="text-center text-2xl tracking-widest"
            required
        />
        <SubmitButton loading={loading} text="Complete Registration" icon={Check} color="green" />
        <button type="button" onClick={goBack} className="w-full text-sm text-slate-500 hover:text-indigo-600 transition-colors">
            Go Back
        </button>
    </motion.form>
);

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', otp: '' });

    const updateForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const sendOtp = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) return alert("Passwords do not match");

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/otp/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email })
            });
            const data = await res.json();
            if (res.ok) setStep(2);
            else alert(data.message);
        } catch (err) {
            console.error(err);
            alert("Failed to connect to server");
        } finally {
            setLoading(false);
        }
    };

    const register = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // First verify the OTP
            const otpRes = await fetch(`${API_BASE}/api/auth/otp/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email, otp: form.otp })
            });
            const otpData = await otpRes.json();
            if (!otpRes.ok) return alert(otpData.message);

            // Then register the student
            const res = await fetch(`${API_BASE}/api/auth/register/student`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email, password: form.password })
            });
            const data = await res.json();
            if (res.ok) {
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                    navigate('/login/student');
                }, 3000);
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex">
            <AnimatePresence>
                {showToast && <Toast message="Registration successful! Redirecting to login..." />}
            </AnimatePresence>
            <div className="w-full lg:w-1/2 p-8 md:p-12 lg:px-20 lg:py-12 flex flex-col justify-center relative overflow-y-auto">
                <motion.button
                    whileHover={{ x: -5 }}
                    onClick={() => navigate('/login/student')}
                    className="absolute top-8 left-8 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" /> Back to Login
                </motion.button>

                <div className="max-w-md w-full mx-auto space-y-8 mt-16 lg:mt-0">
                    <div className="space-y-2">
                        <div className="h-12 w-12 bg-indigo-600 rounded-xl mb-6 flex items-center justify-center">
                            <div className="w-6 h-6 border-4 border-white rounded-full"></div>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">Student Registration</h1>
                        <p className="text-slate-500">Create your account to access the research portal.</p>
                    </div>

                    {/* Step indicator */}
                    <div className="flex items-center space-x-3">
                        <div className={`h-2 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                        <div className={`h-2 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                    </div>

                    {step === 1
                        ? <CredentialsForm form={form} updateForm={updateForm} sendOtp={sendOtp} loading={loading} />
                        : <OtpForm email={form.email} updateForm={updateForm} register={register} loading={loading} goBack={() => setStep(1)} />
                    }
                </div>
            </div>

            <div className="hidden lg:flex lg:w-1/2 bg-[#2e1065] relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>
                </div>
                <div className="relative z-10 p-12 text-center space-y-6 max-w-lg">
                    <h2 className="text-4xl font-bold text-white leading-tight">Join the Academic Research Community</h2>
                    <p className="text-indigo-200 text-lg">Manage your PhD journey, track progress, and collaborate seamlessly.</p>
                </div>
                <div className="absolute bottom-0 w-full h-1/4 bg-gradient-to-t from-[#2e1065] to-transparent z-20"></div>
            </div>
        </div>
    );
};

export default Register;
