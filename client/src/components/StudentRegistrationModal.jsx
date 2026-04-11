import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Calendar, FileText, Mail, Loader2, ChevronRight } from 'lucide-react';

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

// ── Reusable Field ────────────────────────────────────────────────────────────
const Field = ({ label, error, children }) => (
    <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>
        {children}
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
);

const Input = ({ icon: Icon, error, ...props }) => (
    <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />}
        <input
            className={`w-full h-10 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all ${Icon ? 'pl-9' : 'px-3'} pr-3
                ${error ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}`}
            {...props}
        />
    </div>
);

// ── Main Modal ────────────────────────────────────────────────────────────────
const StudentRegistrationModal = ({ email, onComplete }) => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({
        rollNo: '', firstName: '', middleName: '', lastName: '',
        fatherName: '', motherName: '', dob: '', mobileNumber: '',
        yearOfAdmission: new Date().getFullYear(), email,
        admissionMode: 'Entrance', admissionType: 'Full-time'
    });

    const update = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const validate = () => {
        const e = {};
        if (!form.rollNo.trim()) e.rollNo = 'Required';
        if (!form.firstName.trim()) e.firstName = 'Required';
        if (!form.lastName.trim()) e.lastName = 'Required';
        if (!form.fatherName.trim()) e.fatherName = 'Required';
        if (!form.motherName.trim()) e.motherName = 'Required';
        if (!form.dob) e.dob = 'Required';
        if (!form.mobileNumber.trim()) e.mobileNumber = 'Required';
        else if (!/^[0-9]{10,15}$/.test(form.mobileNumber)) e.mobileNumber = 'Must be 10–15 digits';
        if (!form.email.trim()) e.email = 'Required';
        else if (!isValidEmail(form.email)) e.email = 'Invalid email';
        if (!form.yearOfAdmission) e.yearOfAdmission = 'Required';
        if (!form.admissionMode) e.admissionMode = 'Required';
        if (!form.admissionType) e.admissionType = 'Required';
        return e;
    };

    const submit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) return setErrors(errs);

        setLoading(true);
        try {
            const res = await fetch('http://localhost:5001/api/student/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rollNo: form.rollNo,
                    email: form.email,
                    firstName: form.firstName,
                    middleName: form.middleName,
                    lastName: form.lastName,
                    fatherName: form.fatherName,
                    motherName: form.motherName,
                    dob: form.dob,
                    mobileNumber: form.mobileNumber,
                    yearOfAdmission: form.yearOfAdmission,
                    admissionMode: form.admissionMode,
                    admissionType: form.admissionType
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
            >
                {/* Header */}
                <div className="sticky top-0 bg-indigo-600 px-6 py-5 rounded-t-2xl z-10">
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                            <User size={18} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Complete Your Profile</h2>
                            <p className="text-indigo-200 text-xs">Please fill in your details to continue. This is required once.</p>
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

                    {/* Roll Number */}
                    <Field label="Roll Number *" error={errors.rollNo}>
                        <Input name="rollNo" value={form.rollNo} onChange={update}
                            icon={FileText} placeholder="e.g. ROLL2024001" error={errors.rollNo} />
                    </Field>

                    {/* Name row */}
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

                    {/* Parents */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Father's Name *" error={errors.fatherName}>
                            <Input name="fatherName" value={form.fatherName} onChange={update}
                                icon={User} placeholder="Father's full name" error={errors.fatherName} />
                        </Field>
                        <Field label="Mother's Name *" error={errors.motherName}>
                            <Input name="motherName" value={form.motherName} onChange={update}
                                icon={User} placeholder="Mother's full name" error={errors.motherName} />
                        </Field>
                    </div>

                    {/* DOB & Year */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Date of Birth *" error={errors.dob}>
                            <Input name="dob" type="date" value={form.dob} onChange={update}
                                icon={Calendar} error={errors.dob}
                                max={new Date().toISOString().split('T')[0]} />
                        </Field>
                        <Field label="Year of Admission *" error={errors.yearOfAdmission}>
                            <Input name="yearOfAdmission" type="number" value={form.yearOfAdmission} onChange={update}
                                icon={Calendar} placeholder="2024" min="1900" max="2100" error={errors.yearOfAdmission} />
                        </Field>
                    </div>

                    {/* Contact */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Mobile Number *" error={errors.mobileNumber}>
                            <Input name="mobileNumber" type="tel" value={form.mobileNumber} onChange={update}
                                icon={Phone} placeholder="10–15 digit number" error={errors.mobileNumber} />
                        </Field>
                        <Field label="Email *" error={errors.email}>
                            <Input name="email" type="email" value={form.email} onChange={update}
                                icon={Mail} placeholder="your@email.com" error={errors.email} />
                        </Field>
                    </div>

                    {/* Admission Mode & Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Mode of Admission *" error={errors.admissionMode}>
                            <select name="admissionMode" value={form.admissionMode} onChange={update}
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
                            >
                                <option value="Entrance">Entrance</option>
                                <option value="NET">NET</option>
                                <option value="ADF">ADF</option>
                            </select>
                        </Field>
                        <Field label="Type of Admission *" error={errors.admissionType}>
                            <select name="admissionType" value={form.admissionType} onChange={update}
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
                            >
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                            </select>
                        </Field>
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={loading}
                        className={`w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-200 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}>
                        {loading
                            ? <Loader2 className="animate-spin" size={20} />
                            : <><span>Save & Continue</span><ChevronRight size={18} /></>}
                    </button>

                    <p className="text-center text-xs text-slate-400">
                        This information is required to activate your student account. You cannot skip this step.
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default StudentRegistrationModal;
