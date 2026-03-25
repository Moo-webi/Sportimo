import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import brandIcon from "../assets/icon.png";
import { clearAuth, getAuthUser } from "../utils/auth";

const AthleteProfilePage = () => {
    const navigate = useNavigate();
    const { athleteId } = useParams();
    const [authUser, setAuthUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setAuthUser(getAuthUser());
        loadProfile();
    }, [athleteId]);

    const loadProfile = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await api.get(`/athletes/${athleteId}`);
            setProfile(response.data);
        } catch (err) {
            setError(extractApiError(err, "Failed to load athlete profile."));
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        clearAuth();
        navigate("/login");
    };

    const handleSendFriendRequest = async () => {
        if (!profile?.athleteId) return;
        setActionLoading(true);
        try {
            await api.post(`/athletes/${profile.athleteId}/friend-requests`);
            await loadProfile();
        } catch (err) {
            alert(extractApiError(err, "Failed to send friend request."));
        } finally {
            setActionLoading(false);
        }
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
                        to="/dashboard"
                        className="rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-green-50"
                    >
                        Back to Dashboard
                    </Link>
                    <Link
                        to="/messages"
                        className="rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-green-50"
                    >
                        Messages
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                    >
                        Log out
                    </button>
                </div>
            </div>

            <div className="mx-auto max-w-5xl space-y-6 px-4 pb-10 pt-4">
                {error && (
                    <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                        {error}
                    </section>
                )}

                {loading ? (
                    <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
                        <p className="text-slate-600">Loading athlete profile...</p>
                    </section>
                ) : profile ? (
                    <>
                        <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                                        {formatAthleteName(profile)}
                                    </h1>
                                    {profile.self && profile.email && (
                                        <p className="mt-2 break-all text-slate-600">{profile.email}</p>
                                    )}
                                </div>
                                <div className="flex flex-col items-start gap-3 sm:items-end">
                                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone(profile.friendshipStatus)}`}>
                                        {formatFriendshipStatus(profile.friendshipStatus)}
                                    </span>
                                    {!profile.self && profile.friendshipStatus === "NONE" && (
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                disabled={actionLoading}
                                                onClick={handleSendFriendRequest}
                                                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-emerald-300"
                                            >
                                                {actionLoading ? "Sending..." : "Send Friend Request"}
                                            </button>
                                            <button
                                                onClick={() => navigate(`/messages?recipientType=ATHLETE&recipientId=${profile.athleteId}`)}
                                                className="rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-green-50"
                                            >
                                                Message Athlete
                                            </button>
                                        </div>
                                    )}
                                    {!profile.self && profile.friendshipStatus !== "NONE" && (
                                        <button
                                            onClick={() => navigate(`/messages?recipientType=ATHLETE&recipientId=${profile.athleteId}`)}
                                            className="rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-green-50"
                                        >
                                            Message Athlete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </section>

                        {profile.self && (
                            <>
                                <section className="grid gap-4 md:grid-cols-2">
                                    <InfoItem label="Birth date" value={formatDate(profile.birthDate)} />
                                    <InfoItem label="Height" value={profile.height ? `${profile.height} cm` : "-"} />
                                    <InfoItem label="Weight" value={profile.weight ? `${profile.weight} kg` : "-"} />
                                    <InfoItem label="Joined" value={formatDateTime(profile.joinedAt)} />
                                </section>

                                <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
                                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Friends</h2>
                                    <p className="mt-1 text-sm text-slate-600">Athletes connected to this profile.</p>
                                    {profile.friends?.length ? (
                                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                                            {profile.friends.map((friend) => (
                                                <div key={friend.athleteId} className="rounded-2xl border border-green-100 bg-green-50 p-4">
                                                    <p className="font-extrabold text-slate-900">{formatAthleteName(friend)}</p>
                                                    <p className="mt-1 break-all text-sm text-slate-600">{friend.email}</p>
                                                    <button
                                                        onClick={() => navigate(`/athletes/${friend.athleteId}`)}
                                                        className="mt-3 rounded-xl border border-green-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-green-100"
                                                    >
                                                        View Profile
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="mt-4 text-slate-600">This athlete has no friends yet.</p>
                                    )}
                                </section>
                            </>
                        )}

                        <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
                            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Matches</h2>
                            <p className="mt-1 text-sm text-slate-600">
                                {profile.self ? "Your booked and joined matches." : "This athlete's booked and joined matches."}
                            </p>
                            {profile.matches?.length ? (
                                <div className="mt-4 space-y-3">
                                    {profile.matches.map((match) => (
                                        <div key={match.id} className="rounded-2xl border border-green-100 bg-green-50 p-4">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="text-base font-extrabold text-slate-900">{match.facilityName || "Facility"}</p>
                                                    <p className="mt-1 text-sm text-slate-600">{match.sportName || "Sport"}</p>
                                                    <p className="mt-1 text-sm text-slate-700">
                                                        {formatDateTime(match.startTime)} - {formatDateTime(match.endTime)}
                                                    </p>
                                                    {match.bookingType === "OPEN_MATCH" && match.participants?.length > 0 && (
                                                        <p className="mt-1 text-sm text-slate-700">
                                                            Players: {match.participants.map((participant) => participant.name || participant.email || "Athlete").join(", ")}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="rounded-full border border-green-200 bg-white px-3 py-1 text-xs font-bold text-emerald-700">
                                                        {match.status}
                                                    </span>
                                                    <span className="rounded-full border border-green-200 bg-white px-3 py-1 text-xs font-bold text-slate-700">
                                                        {match.bookingType === "OPEN_MATCH" ? "Open match" : "Closed booking"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-4 text-slate-600">No matches available.</p>
                            )}
                        </section>
                    </>
                ) : null}
            </div>
        </div>
    );
};

const InfoItem = ({ label, value }) => (
    <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-2 text-sm font-bold text-slate-900">{value || "-"}</p>
    </div>
);

const formatAthleteName = (athlete) => {
    const fullName = [athlete?.firstName, athlete?.lastName].filter(Boolean).join(" ").trim();
    return fullName || "Athlete";
};

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

const formatFriendshipStatus = (status) => {
    switch (status) {
        case "SELF":
            return "You";
        case "FRIENDS":
            return "Friends";
        case "REQUEST_SENT":
            return "Request Sent";
        case "REQUEST_RECEIVED":
            return "Wants to Connect";
        default:
            return "Not Connected";
    }
};

const statusTone = (status) => {
    switch (status) {
        case "SELF":
            return "bg-slate-100 text-slate-700";
        case "FRIENDS":
            return "bg-emerald-100 text-emerald-700";
        case "REQUEST_SENT":
            return "bg-amber-100 text-amber-700";
        case "REQUEST_RECEIVED":
            return "bg-blue-100 text-blue-700";
        default:
            return "bg-slate-100 text-slate-600";
    }
};

const extractApiError = (error, fallback) => {
    const data = error?.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (data?.message) return data.message;
    if (error?.response?.status) return `${fallback} (HTTP ${error.response.status})`;
    return fallback;
};

export default AthleteProfilePage;
