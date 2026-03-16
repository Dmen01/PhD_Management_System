import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

const Login = () => {
    const { role } = useParams();
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
            const res = await fetch('http://localhost:5001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('studentEmail', email);
                navigate('/dashboard/student');
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
        <div className="min-h-screen bg-white text-slate-900 flex">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative">
                <motion.button 
                    whileHover={{ x: -5 }}
                    onClick={() => navigate('/')} 
                    className="absolute top-8 left-8 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Home
                </motion.button>

                <div className="max-w-md w-full mx-auto space-y-8">
                    <div className="space-y-2">
                        <div className="h-12 w-12 bg-indigo-600 rounded-xl mb-6 flex items-center justify-center">
                            {/* Simple Logo Placeholder */}
                            <div className="w-6 h-6 border-4 border-white rounded-full"></div>
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900">Welcome back !</h1>
                        <p className="text-slate-500">Enter to get unlimited access to data & information.</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        {loginError && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                                {loginError}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Email <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                                    onBlur={() => !isValidEmail(email) && email && setEmailError('Please enter a valid email address')}
                                    placeholder="Enter your mail address"
                                    className={`w-full h-12 px-4 rounded-xl border transition-all outline-none focus:ring-2 ${emailError ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-200'}`}
                                />
                            </div>
                            {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Password <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none pr-12"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => navigate('/forgot-password')}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                            >
                                Forgot your password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}>
                            {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Log In'}
                        </button>

                         <p className="text-center text-sm font-medium text-slate-600">
                            Don't have an account? <span onClick={() => navigate('/register')} className="text-indigo-600 hover:underline cursor-pointer">Register here</span>
                        </p>
                    </form>
                </div>
            </div>

            {/* Right Side - Art / Pattern */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#2e1065] relative overflow-hidden items-center justify-center">
                 {/* Geometric Background approximation using CSS */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-200 h-200 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-150 h-150 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>
                </div>

                {/* Geometric Shapes Grid - Abstract Representation */}
                <div className="relative z-10 p-12 grid grid-cols-2 gap-4 opacity-80 rotate-12 scale-110">
                    <div className="w-48 h-48 bg-indigo-500/30 rounded-full backdrop-blur-3xl"></div>
                    <div className="w-48 h-48 bg-purple-600/30 rounded-2xl backdrop-blur-3xl"></div>
                    <div className="w-48 h-48 bg-cyan-500/30 rounded-tl-[80px] backdrop-blur-3xl"></div>
                    <div className="w-48 h-48 bg-blue-600/30 rounded-full backdrop-blur-3xl border border-white/10"></div>
                </div>

                <div className="absolute bottom-0 w-full h-1/4 bg-linear-to-t from-[#2e1065] to-transparent z-20"></div>
            </div>
        </div>
    );
};

export default Login;
