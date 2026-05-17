import { API_BASE } from '../config';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Calendar, FileText, Mail, Building2, Award, Loader2, ChevronRight } from 'lucide-react';

// ── Reusable Field ────────────────────────────────────────────────────────────
const Field = ({ label, error, children }) => (
    <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>
        {children}
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
);

const Input = ({ icon: Icon, error, className = '', ...props }) => (
    <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />}
        <input
            className={`w-full h-10 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all ${Icon ? 'pl-9' : 'px-3'} pr-3
                ${error ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100'} ${className}`}
            {...props}
        />
    </div>
);

const Select = ({ icon: Icon, error, children, ...props }) => (
    <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />}
        <select
            className={`w-full h-10 rounded-lg border text-sm text-slate-900 outline-none transition-all appearance-none ${Icon ? 'pl-9' : 'px-3'} pr-3
                ${error ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100'}`}
            {...props}
        >
            {children}
        </select>
    </div>
);

// ── Main Modal ────────────────────────────────────────────────────────────────
const TeacherRegistrationModal = ({ email, onComplete }) => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({
        teacherId: '', firstName: '', middleName: '', lastName: '',
        department: '', designation: '', mobileNumber: '',
        yearOfJoining: new Date().getFullYear(), email
    });

    const update = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const validate = () => {
        const e = {};
        if (!form.teacherId.trim()) e.teacherId = 'Required';
        if (!form.firstName.trim()) e.firstName = 'Required';
        if (!form.lastName.trim()) e.lastName = 'Required';
        if (!form.department.trim()) e.department = 'Required';
        if (!form.designation.trim()) e.designation = 'Required';
        if (!form.mobileNumber.trim()) e.mobileNumber = 'Required';
        else if (!/^[0-9]{10,15}$/.test(form.mobileNumber)) e.mobileNumber = 'Must be 10–15 digits';
        if (!form.yearOfJoining) e.yearOfJoining = 'Required';
        return e;
    };

    const submit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) return setErrors(errs);

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/teacher/profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teacherId: form.teacherId,
                    email: form.email,
                    firstName: form.firstName,
                    middleName: form.middleName,
                    lastName: form.lastName,
                    department: form.department,
                    designation: form.designation,
                    mobileNumber: form.mobileNumber,
                    yearOfJoining: form.yearOfJoining,
                })
            });
            const data = await res.json();
            if (res.ok) onComplete();
            else setErrors({ form: data.message });
        } catch (err) {
            console.error(err);
            setErrors({ form: 'Failed to connect to server' });
        } finally {
            setLoading(false);
        }
    };

    const designations = [
        'Professor', 'Associate Professor', 'Assistant Professor',
        'Lecturer', 'Senior Lecturer', 'Research Fellow', 'PostDoc Researcher'
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
            >
                {/* Header */}
                <div className="sticky top-0 bg-amber-500 px-6 py-5 rounded-t-2xl z-10">
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                            <User size={18} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Complete Your Teacher Profile</h2>
                            <p className="text-amber-100 text-xs">Required once to activate your teacher account.</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={submit} className="p-6 space-y-5">
                    {errors.form && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                            {errors.form}
                        </div>
                    )}

                    {/* Teacher ID */}
                    <Field label="Teacher ID *" error={errors.teacherId}>
                        <Input name="teacherId" value={form.teacherId} onChange={update}
                            icon={FileText} placeholder="e.g. TCH2024001" error={errors.teacherId} />
                    </Field>

                    {/* Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field label="First Name *" error={errors.firstName}>
                            <Input name="firstName" value={form.firstName} onChange={update}
                                placeholder="First" error={errors.firstName} />
                        </Field>
                        <Field label="Middle Name" error={errors.middleName}>
                            <Input name="middleName" value={form.middleName} onChange={update}
                                placeholder="Middle (optional)" />
                        </Field>
                        <Field label="Last Name *" error={errors.lastName}>
                            <Input name="lastName" value={form.lastName} onChange={update}
                                placeholder="Last" error={errors.lastName} />
                        </Field>
                    </div>

                    {/* Department & Designation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Department *" error={errors.department}>
                            <Input name="department" value={form.department} onChange={update}
                                icon={Building2} placeholder="e.g. Computer Science" error={errors.department} />
                        </Field>
                        <Field label="Designation *" error={errors.designation}>
                            <Select name="designation" value={form.designation} onChange={update}
                                icon={Award} error={errors.designation}>
                                <option value="">— Select Designation —</option>
                                {designations.map(d => <option key={d} value={d}>{d}</option>)}
                            </Select>
                        </Field>
                    </div>

                    {/* Mobile & Year */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Mobile Number *" error={errors.mobileNumber}>
                            <Input name="mobileNumber" type="tel" value={form.mobileNumber} onChange={update}
                                icon={Phone} placeholder="10–15 digit number" error={errors.mobileNumber} />
                        </Field>
                        <Field label="Year of Joining *" error={errors.yearOfJoining}>
                            <Input name="yearOfJoining" type="number" value={form.yearOfJoining} onChange={update}
                                icon={Calendar} placeholder="e.g. 2020" min="1900" max="2100" error={errors.yearOfJoining} />
                        </Field>
                    </div>

                    {/* Email (read-only) */}
                    <Field label="Email (from account)">
                        <Input name="email" type="email" value={form.email} readOnly
                            icon={Mail} className="bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200" />
                    </Field>

                    {/* Submit */}
                    <button type="submit" disabled={loading}
                        className={`w-full h-12 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-amber-200 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}>
                        {loading
                            ? <Loader2 className="animate-spin" size={20} />
                            : <><span>Save & Continue</span><ChevronRight size={18} /></>}
                    </button>

                    <p className="text-center text-xs text-slate-400">
                        This information activates your teacher account. You cannot skip this step.
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default TeacherRegistrationModal;
