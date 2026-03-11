import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Check, Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

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

const SubmitButton = ({ loading, text, icon: Icon, color }) => {
    const bgClass = color === 'green'
        ? 'bg-green-600 hover:bg-green-700 shadow-green-200'
        : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200';
    return (
        <button type="submit" disabled={loading} className={`w-full h-14 ${bgClass} text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2`}>
            {loading ? <Loader2 className="animate-spin" /> : <><span>{text}</span><Icon size={18} /></>}
        </button>
    );
};

const CredentialsForm = ({ form, updateForm, sendOtp, loading }) => (
    <motion.form
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
        onSubmit={sendOtp}
    >
        <Input label="Email Address *" name="email" type="email" value={form.email} onChange={updateForm} icon={Mail} placeholder="your@email.com" required />
        <Input label="Password *" name="password" type="password" value={form.password} onChange={updateForm} icon={Lock} placeholder="Create a password" required />
        <Input label="Confirm Password *" name="confirmPassword" type="password" value={form.confirmPassword} onChange={updateForm} icon={Lock} placeholder="Confirm your password" required />
        <SubmitButton loading={loading} text="Verify Email & Continue" icon={Send} color="indigo" />
    </motion.form>
);

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
    const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', otp: '' });

    const updateForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const sendOtp = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) return alert("Passwords do not match");

        setLoading(true);
        try {
            const res = await fetch('http://localhost:5001/api/auth/otp/send', {
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
            const otpRes = await fetch('http://localhost:5001/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email, otp: form.otp })
            });
            const otpData = await otpRes.json();
            if (!otpRes.ok) return alert(otpData.message);

            // Then register the student
            const res = await fetch('http://localhost:5001/api/auth/register/student', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email, password: form.password })
            });
            const data = await res.json();
            if (res.ok) {
                alert("Registration Successful! You can now log in.");
                navigate('/login/student');
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
