import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Your AuthService.java returns the JWT as a plain string or inside an object
            const response = await api.post('/login', credentials);

            // Extract the token (adjust if your backend wraps it in a JSON object like { token: "..." })
            const token = typeof response.data === 'string' ? response.data : response.data.token;

            localStorage.setItem('token', token);

            // Redirect to a protected route (e.g., Dashboard or Facility List)
            navigate('/facilities');
        } catch (err) {
            setError(err.response?.data?.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">Welcome Back</h2>
                <p className="text-center text-gray-500 mb-8">Log in to your Sportimo account</p>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            onChange={handleChange}
                            className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            onChange={handleChange}
                            className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-bold text-white transition-all shadow-lg ${
                            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                        Create an account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;