import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import brandIcon from "../assets/icon.png";
import { clearAuth, getAuthUser } from "../utils/auth";

const AthleteDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [authUser, setAuthUser] = useState(null);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const loadDashboard = async () => {
            setLoading(true);
            setError("");
            try {
                const meRes = await api.get("/athletes/me");
                setProfile(meRes.data);
            } catch (err) {
                setError(extractApiError(err, "Failed to load athlete profile."));
            } finally {
                setLoading(false);
            }
        };

        setAuthUser(getAuthUser());
        loadDashboard();
    }, []);

    const totalBookings = profile?.bookings?.length || 0;
    const pendingBookings = useMemo(
        () => (profile?.bookings || []).filter((booking) => booking.status === "PENDING").length,
        [profile]
    );
    const confirmedBookings = useMemo(
        () => (profile?.bookings || []).filter((booking) => booking.status === "CONFIRMED").length,
        [profile]
    );

    const handleLogout = () => {
        clearAuth();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                <Link to="/" className="flex items-center gap-2">
                    <img src={brandIcon} alt="Sportimo icon" className="h-9 w-9 rounded-xl object-cover shadow-sm" />
                    <div className="leading-tight">
                        <div className="text-lg font-extrabold tracking-tight text-slate-900">Sportimo</div>
                        <div className="-mt-1 text-xs text-slate-500">Book • Play • Track</div>
                    </div>
                </Link>
                <div className="flex items-center gap-2">
                    {authUser && (
                        <span className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                            {authUser.name}
                        </span>
                    )}
                    <Link
                        to="/facilities"
                        className="rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-green-50"
                    >
                        Browse Facilities
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                    >
                        Log out
                    </button>
                </div>
            </div>

            <div className="mx-auto max-w-6xl space-y-6 px-4 pb-10 pt-4">
                <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Athlete Dashboard</h1>
                    <p className="mt-2 text-slate-600">
                        Your profile information and booking history.
                    </p>
                </section>

                {error && (
                    <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                        {error}
                    </section>
                )}

                {loading ? (
                    <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
                        <p className="text-slate-600">Loading dashboard data...</p>
                    </section>
                ) : (
                    <>
                        <section className="grid gap-4 md:grid-cols-4">
                            <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Bookings</p>
                                <p className="mt-2 text-3xl font-extrabold text-emerald-700">{totalBookings}</p>
                            </div>
                            <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending</p>
                                <p className="mt-2 text-3xl font-extrabold text-emerald-700">{pendingBookings}</p>
                            </div>
                            <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Confirmed</p>
                                <p className="mt-2 text-3xl font-extrabold text-emerald-700">{confirmedBookings}</p>
                            </div>
                            <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
                                <p className="mt-2 truncate text-sm font-bold text-slate-800">{profile?.email || "-"}</p>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
                            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">My Information</h2>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                <InfoItem label="First name" value={profile?.firstName} />
                                <InfoItem label="Last name" value={profile?.lastName} />
                                <InfoItem label="Birth date" value={formatDate(profile?.birthDate)} />
                                <InfoItem label="Height" value={profile?.height ? `${profile.height} cm` : "-"} />
                                <InfoItem label="Weight" value={profile?.weight ? `${profile.weight} kg` : "-"} />
                                <InfoItem label="Joined" value={formatDateTime(profile?.joinedAt)} />
                            </div>
                        </section>

                        <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
                            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">My Bookings</h2>
                            {profile?.bookings?.length ? (
                                <div className="mt-4 space-y-3">
                                    {profile.bookings.map((booking) => (
                                        <div key={booking.id} className="rounded-2xl border border-green-100 bg-green-50 p-4">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="text-base font-extrabold text-slate-900">{booking.facilityName || "Facility"}</p>
                                                    <p className="mt-1 text-sm text-slate-600">{booking.sportName || "Sport"}</p>
                                                    <p className="mt-1 text-sm text-slate-700">
                                                        {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="rounded-full border border-green-200 bg-white px-3 py-1 text-xs font-bold text-emerald-700">
                                                        {booking.status}
                                                    </span>
                                                    <span className="text-sm font-bold text-emerald-700">
                                                        ${booking.pricePerHour}/hour
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-4 text-slate-600">You have not made any bookings yet.</p>
                            )}
                        </section>
                    </>
                )}
            </div>
        </div>
    );
};

const InfoItem = ({ label, value }) => (
    <div className="rounded-2xl border border-green-100 bg-green-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1 text-sm font-bold text-slate-900">{value || "-"}</p>
    </div>
);

const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString();
};

const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const extractApiError = (error, fallback) => {
    const data = error?.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (data?.message) return data.message;
    if (error?.response?.status) return `${fallback} (HTTP ${error.response.status})`;
    return fallback;
};

export default AthleteDashboard;
