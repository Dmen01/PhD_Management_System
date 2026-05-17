import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

const AdminLogin = () => {
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
            const res = await fetch(`${API_BASE}/api/auth/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                sessionStorage.setItem('adminEmail', email);
                // Placeholder navigation for now
                navigate('/dashboard/admin');
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
                    className="absolute top-8 left-8 flex items-center text-slate-400 hover:text-emerald-400 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Home
                </motion.button>

                <div className="max-w-md w-full mx-auto space-y-8">
                    <div className="space-y-2">
                        <div className="h-12 w-12 bg-emerald-600 rounded-xl mb-6 flex items-center justify-center">
                            <div className="w-6 h-6 border-4 border-slate-900 rounded-full"></div>
                        </div>
                        <h1 className="text-4xl font-bold text-white">Admin Portal</h1>
                        <p className="text-slate-400">Secure access to university administration.</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        {loginError && (
                            <div className="bg-red-900/50 border border-red-500/50 text-red-200 text-sm px-4 py-3 rounded-xl">
                                {loginError}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Email <span className="text-emerald-500">*</span></label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                                    onBlur={() => !isValidEmail(email) && email && setEmailError('Please enter a valid email address')}
                                    placeholder="Enter admin email address"
                                    className={`w-full h-12 px-4 rounded-xl border bg-slate-800 text-white transition-all outline-none focus:ring-2 ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-900' : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-900/50'}`}
                                />
                            </div>
                            {emailError && <p className="text-xs text-red-400 mt-1">{emailError}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Password <span className="text-emerald-500">*</span></label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="w-full h-12 px-4 rounded-xl border border-slate-700 bg-slate-800 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-900/50 transition-all outline-none pr-12"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}>
                            {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Secure Login'}
                        </button>

                         <p className="text-center text-sm font-medium text-slate-400">
                            Authorized personnel only. <span onClick={() => navigate('/register/admin')} className="text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer">Register setup</span>
                        </p>
                    </form>
                </div>
            </div>

            {/* Right Side - Art / Pattern */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-950 relative overflow-hidden items-center justify-center border-l border-slate-800">
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-200 h-200 bg-emerald-900 rounded-full mix-blend-screen filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-150 h-150 bg-teal-900 rounded-full mix-blend-screen filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>
                </div>

                <div className="relative z-10 p-12 grid grid-cols-2 gap-4 opacity-50 rotate-12 scale-110">
                    <div className="w-48 h-48 bg-emerald-800/20 rounded-lg backdrop-blur-3xl border border-emerald-500/10"></div>
                    <div className="w-48 h-48 bg-teal-800/20 rounded-lg backdrop-blur-3xl border border-teal-500/10"></div>
                    <div className="w-48 h-48 bg-slate-800/40 rounded-lg backdrop-blur-3xl border border-slate-700"></div>
                    <div className="w-48 h-48 bg-emerald-900/30 rounded-lg backdrop-blur-3xl border border-emerald-700/20"></div>
                </div>

                <div className="absolute bottom-0 w-full h-1/3 bg-linear-to-t from-slate-950 to-transparent z-20"></div>
            </div>
        </div>
    );
};

export default AdminLogin;
