import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

const TeacherLogin = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!isValidEmail(email)) return setEmailError('Please enter a valid email address');
        setLoading(true);
        setLoginError('');
        try {
            const res = await fetch(`${API_BASE}/api/auth/teacher/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                sessionStorage.setItem('teacherEmail', email);
                navigate('/dashboard/teacher');
            } else {
                setLoginError(data.message);
            }
        } catch (err) {
            console.error(err);
            setLoginError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative bg-slate-900">
                <motion.button
                    whileHover={{ x: -5 }}
                    onClick={() => navigate('/')}
                    className="absolute top-8 left-8 flex items-center text-slate-400 hover:text-amber-400 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Home
                </motion.button>

                <div className="max-w-md w-full mx-auto space-y-8">
                    <div className="space-y-2">
                        <div className="h-12 w-12 bg-amber-500 rounded-xl mb-6 flex items-center justify-center">
                            <div className="w-6 h-6 border-4 border-slate-900 rounded-full"></div>
                        </div>
                        <h1 className="text-4xl font-bold text-white">Teacher Portal</h1>
                        <p className="text-slate-400">Secure access for university faculty.</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        {loginError && (
                            <div className="bg-red-900/50 border border-red-500/50 text-red-200 text-sm px-4 py-3 rounded-xl">
                                {loginError}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Email <span className="text-amber-400">*</span></label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                                onBlur={() => !isValidEmail(email) && email && setEmailError('Please enter a valid email address')}
                                placeholder="Enter teacher email address"
                                className={`w-full h-12 px-4 rounded-xl border bg-slate-800 text-white transition-all outline-none focus:ring-2 ${emailError ? 'border-red-500 focus:ring-red-900' : 'border-slate-700 focus:border-amber-500 focus:ring-amber-900/50'}`}
                            />
                            {emailError && <p className="text-xs text-red-400 mt-1">{emailError}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Password <span className="text-amber-400">*</span></label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="w-full h-12 px-4 rounded-xl border border-slate-700 bg-slate-800 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-900/50 transition-all outline-none pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full h-14 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <span className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> : 'Sign In'}
                        </button>

                        <p className="text-center text-sm font-medium text-slate-400">
                            First time? <span onClick={() => navigate('/register/teacher')} className="text-amber-400 hover:text-amber-300 hover:underline cursor-pointer">Create your account</span>
                        </p>
                    </form>
                </div>
            </div>

            {/* Right Side - Art */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-950 relative overflow-hidden items-center justify-center border-l border-slate-800">
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-900 rounded-full mix-blend-screen filter blur-3xl opacity-15 -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-900 rounded-full mix-blend-screen filter blur-3xl opacity-15 translate-y-1/2 -translate-x-1/2"></div>
                </div>
                <div className="relative z-10 p-12 grid grid-cols-2 gap-4 opacity-50 rotate-12 scale-110">
                    <div className="w-48 h-48 bg-amber-800/20 rounded-lg backdrop-blur-3xl border border-amber-500/10"></div>
                    <div className="w-48 h-48 bg-orange-800/20 rounded-lg backdrop-blur-3xl border border-orange-500/10"></div>
                    <div className="w-48 h-48 bg-slate-800/40 rounded-lg backdrop-blur-3xl border border-slate-700"></div>
                    <div className="w-48 h-48 bg-amber-900/30 rounded-lg backdrop-blur-3xl border border-amber-700/20"></div>
                </div>
                <div className="absolute inset-0 flex items-end justify-center pb-16 z-20">
                    <div className="text-center space-y-3 max-w-xs">
                        <p className="text-amber-300/70 text-base font-medium">Faculty Portal</p>
                        <h2 className="text-2xl font-bold text-white">University PhD Management</h2>
                    </div>
                </div>
                <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-slate-950 to-transparent z-30"></div>
            </div>
        </div>
    );
};

export default TeacherLogin;
