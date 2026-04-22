import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { formatUserName, parseJwtPayload, getAuthUser } from "../utils/auth";

const Login = () => {
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", credentials);
            const token =
                typeof response.data === "string" ? response.data : response.data.token;
            const payload = parseJwtPayload(token);
            const role = payload?.role;
            const subject = payload?.sub || payload?.subject || "";
            const userName = formatUserName(subject);

            localStorage.setItem("token", token);
            if (role) {
                localStorage.setItem("role", role);
            } else {
                localStorage.removeItem("role");
            }
            localStorage.setItem("userName", userName);

            // Fetch user's first name based on role
            try {
                if (role === "CENTER") {
                    const centerRes = await api.get("/centers/me");
                    localStorage.setItem("userFirstName", centerRes.data.name);
                } else if (role === "ATHLETE") {
                    const athleteRes = await api.get("/athletes/me");
                    localStorage.setItem("userFirstName", athleteRes.data.firstName);
                }
            } catch (err) {
                console.error("Failed to fetch user first name:", err);
            }

            if (role === "CENTER") {
                navigate("/manage");
            } else if (role === "ATHLETE") {
                navigate("/dashboard");
            } else {
                navigate("/facilities");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-white">
            {/* NAVBAR */}
            <Navbar 
                authUser={getAuthUser()}
                onLogout={() => {}}
            />
            <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-10 md:py-16">
                <div className="relative w-full max-w-md">
                    <div className="absolute -inset-6 -z-10 rounded-[32px] bg-gradient-to-br from-green-100 via-white to-emerald-100 blur-2xl" />

                    <div className="rounded-3xl border border-green-100 bg-white p-8 shadow-xl">
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                Welcome back
                            </div>

                            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
                                Sign in
                            </h2>
                            <p className="mt-2 text-sm text-slate-600">
                                Log in to your Sportimo account
                            </p>
                        </div>

                        {error && (
                            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="mt-6 space-y-5">
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">
                                    Email address
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={credentials.email}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">
                                    Password
                                </label>
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full rounded-xl py-3 text-sm font-extrabold text-white shadow-sm transition-all ${
                                    loading
                                        ? "cursor-not-allowed bg-emerald-400"
                                        : "bg-emerald-600 hover:bg-emerald-700"
                                }`}
                            >
                                {loading ? "Authenticating..." : "Sign In"}
                            </button>

                            <div className="text-center text-sm text-slate-600">
                                Don&apos;t have an account?{" "}
                                <Link to="/register" className="font-extrabold text-emerald-700 hover:underline">
                                    Create one
                                </Link>
                            </div>

                            <div className="text-center">
                                <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-slate-700">
                                    ← Back to home
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
