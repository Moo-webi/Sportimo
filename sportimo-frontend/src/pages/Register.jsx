import React, { useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import brandIcon from '../assets/icon.png';

const Register = () => {
    // Role must match your Java Enum: Role.ATHLETE and Role.CENTER
    const [role, setRole] = useState('ATHLETE');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        birthDate: '',
        height: '',
        weight: '',
        name: '',
        address: '',
        phone: '',
        description: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Sends RegisterRequest DTO to your AuthService
            await api.post('/auth/register', { ...formData, role });
            alert('Registration successful! Please login.');
        } catch (err) {
            alert(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-white">
            {/* Top mini-nav */}
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                <Link to="/" className="flex items-center gap-2">
                    <img src={brandIcon} alt="Sportimo icon" className="h-9 w-9 rounded-xl object-cover shadow-sm" />
                    <div className="leading-tight">
                        <div className="text-lg font-extrabold tracking-tight text-slate-900">Sportimo</div>
                        <div className="-mt-1 text-xs text-slate-500">Book • Play • Track</div>
                    </div>
                </Link>
                <Link
                    to="/login"
                    className="rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-green-50"
                >
                    Log in
                </Link>
            </div>

            <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-10 md:py-16">
                <div className="relative w-full max-w-lg">
                    <div className="absolute -inset-6 -z-10 rounded-[32px] bg-gradient-to-br from-green-100 via-white to-emerald-100 blur-2xl" />

                    <form onSubmit={handleSubmit} className="rounded-3xl border border-green-100 bg-white p-8 shadow-sm">
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                Join Sportimo
                            </div>
                            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">Create your account</h2>
                            <p className="mt-2 text-sm text-slate-600">Pick your role, then fill in the details.</p>
                        </div>

                        {/* Role Toggle - Logic matches AuthService.java */}
                        <div className="mt-6 flex overflow-hidden rounded-2xl border border-green-200 bg-green-50">
                            <button
                                type="button"
                                onClick={() => setRole('ATHLETE')}
                                className={`flex-1 px-4 py-2.5 text-sm font-extrabold transition ${
                                    role === 'ATHLETE'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-transparent text-slate-700 hover:bg-white/70'
                                }`}
                            >
                                Athlete
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('CENTER')}
                                className={`flex-1 px-4 py-2.5 text-sm font-extrabold transition ${
                                    role === 'CENTER'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-transparent text-slate-700 hover:bg-white/70'
                                }`}
                            >
                                Sports Center
                            </button>
                        </div>

                        <div className="mt-6 space-y-4">
                            {/* Common Fields */}
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Email address</label>
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="Create a strong password"
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                                    required
                                />
                            </div>

                            {/* Conditional Fields for Athlete */}
                            {role === 'ATHLETE' ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1 block text-sm font-semibold text-slate-700">First name</label>
                                            <input
                                                name="firstName"
                                                placeholder="Muhammed"
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-semibold text-slate-700">Last name</label>
                                            <input
                                                name="lastName"
                                                placeholder="Mabrouk"
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">Birth date</label>
                                        <input
                                            name="birthDate"
                                            type="date"
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1 block text-sm font-semibold text-slate-700">Height (cm)</label>
                                            <input
                                                name="height"
                                                type="number"
                                                step="0.1"
                                                placeholder="184"
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-semibold text-slate-700">Weight (kg)</label>
                                            <input
                                                name="weight"
                                                type="number"
                                                step="0.1"
                                                placeholder="90"
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Conditional Fields for SportsCenter */
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">Sports center name</label>
                                        <input
                                            name="name"
                                            placeholder="City Sports Center"
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">Address</label>
                                        <input
                                            name="address"
                                            placeholder="Rua ..., Porto"
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">Phone number</label>
                                        <input
                                            name="phone"
                                            placeholder="+351 ..."
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">Short description</label>
                                        <textarea
                                            name="description"
                                            placeholder="Tell athletes what makes your center great..."
                                            onChange={handleChange}
                                            className="h-24 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="mt-7 w-full rounded-xl bg-emerald-600 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-emerald-700 transition-all"
                        >
                            Register as {role === 'ATHLETE' ? 'Athlete' : 'Sports Center'}
                        </button>

                        <div className="mt-6 text-center text-sm text-slate-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-extrabold text-emerald-700 hover:underline">
                                Log in
                            </Link>
                        </div>

                        <div className="mt-4 text-center">
                            <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-slate-700">
                                ← Back to home
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
