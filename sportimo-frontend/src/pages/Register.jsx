import React, { useState } from 'react';
import api from '../api/axios';

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
            await api.post('/register', { ...formData, role });
            alert("Registration successful! Please login.");
        } catch (err) {
            alert(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Join Sportimo</h2>

                {/* Role Toggle - Logic matches AuthService.java */}
                <div className="flex mb-6 border rounded-md overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setRole('ATHLETE')}
                        className={`flex-1 py-2 text-sm font-semibold transition ${role === 'ATHLETE' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600'}`}
                    >
                        Athlete
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('CENTER')}
                        className={`flex-1 py-2 text-sm font-semibold transition ${role === 'CENTER' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600'}`}
                    >
                        Sports Center
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Common Fields */}
                    <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
                    <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required />

                    {/* Conditional Fields for Athlete */}
                    {role === 'ATHLETE' ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input name="firstName" placeholder="First Name" onChange={handleChange} className="border p-2 rounded" required />
                                <input name="lastName" placeholder="Last Name" onChange={handleChange} className="border p-2 rounded" required />
                            </div>
                            <label className="block text-sm text-gray-600 mb-1">Birth Date</label>
                            <input name="birthDate" type="date" onChange={handleChange} className="w-full border p-2 rounded" required />
                            <div className="grid grid-cols-2 gap-4">
                                <input name="height" type="number" step="0.1" placeholder="Height (cm)" onChange={handleChange} className="border p-2 rounded" />
                                <input name="weight" type="number" step="0.1" placeholder="Weight (kg)" onChange={handleChange} className="border p-2 rounded" />
                            </div>
                        </div>
                    ) : (
                        /* Conditional Fields for SportsCenter */
                        <div className="space-y-4">
                            <input name="name" placeholder="Sports Center Name" onChange={handleChange} className="w-full border p-2 rounded" required />
                            <input name="address" placeholder="Address" onChange={handleChange} className="w-full border p-2 rounded" required />
                            <input name="phone" placeholder="Phone Number" onChange={handleChange} className="w-full border p-2 rounded" />
                            <textarea name="description" placeholder="Short Description" onChange={handleChange} className="w-full border p-2 rounded h-20" />
                        </div>
                    )}
                </div>

                <button type="submit" className="w-full mt-6 bg-blue-600 text-white py-2 rounded-md font-bold hover:bg-blue-700 transition-colors shadow-lg">
                    Register as {role === 'ATHLETE' ? 'Athlete' : 'Sports Center'}
                </button>
            </form>
        </div>
    );
};

export default Register;