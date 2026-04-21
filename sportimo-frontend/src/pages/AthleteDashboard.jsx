import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { clearAuth, getAuthUser, setStoredUserName } from "../utils/auth";

const AthleteDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [authUser, setAuthUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [directory, setDirectory] = useState([]);
    const [reviewBooking, setReviewBooking] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [profileForm, setProfileForm] = useState({
        firstName: "",
        lastName: "",
        birthDate: "",
        height: "",
        weight: "",
    });
    const [profileSaving, setProfileSaving] = useState(false);
    const [socialActionLoading, setSocialActionLoading] = useState(false);
    const [accountActionLoading, setAccountActionLoading] = useState(false);
    const [directorySearch, setDirectorySearch] = useState("");

    useEffect(() => {
        setAuthUser(getAuthUser());
        refreshDashboard();
    }, []);

    const refreshDashboard = async () => {
        setLoading(true);
        setError("");
        try {
            const [meRes, directoryRes] = await Promise.all([
                api.get("/athletes/me"),
                api.get("/athletes"),
            ]);
            setProfile(meRes.data);
            setProfileForm(buildAthleteProfileForm(meRes.data));
            setDirectory(directoryRes.data || []);
        } catch (err) {
            setError(extractApiError(err, "Failed to load athlete profile."));
        } finally {
            setLoading(false);
        }
    };

    const totalBookings = profile?.bookings?.length || 0;
    const pendingBookings = useMemo(
        () => (profile?.bookings || []).filter((booking) => booking.status === "PENDING").length,
        [profile]
    );
    const confirmedBookings = useMemo(
        () => (profile?.bookings || []).filter((booking) => booking.status === "CONFIRMED").length,
        [profile]
    );
    const friendsCount = profile?.friends?.length || 0;
    const incomingRequestsCount = profile?.incomingFriendRequests?.length || 0;
    const outgoingRequestsCount = profile?.outgoingFriendRequests?.length || 0;
    const filteredDirectory = useMemo(() => {
        const query = directorySearch.trim().toLowerCase();
        if (!query) return directory;
        return directory.filter((athlete) =>
            formatAthleteName(athlete).toLowerCase().includes(query)
        );
    }, [directory, directorySearch]);

    const handleLogout = () => {
        clearAuth();
        navigate("/login");
    };

    const navLinks = useMemo(() => {
        const base = [
            { label: "Browse Facilities", to: "/facilities" },
            { label: "Messages", to: "/messages" },
        ];
        if (authUser) {
            if (authUser.role === "CENTER") base.unshift({ label: "Manage", to: "/manage" });
            else if (authUser.role === "ATHLETE") base.unshift({ label: "Dashboard", to: "/dashboard" });
        } else {
            base.unshift({ label: "How it works", to: "#how" });
        }
        return base;
    }, [authUser]);

    const handleCancelBooking = async (bookingId) => {
        const confirmed = window.confirm("Cancel this pending booking?");
        if (!confirmed) return;
        try {
            await api.put(`/bookings/${bookingId}/cancel`);
            await refreshDashboard();
        } catch (err) {
            alert(extractApiError(err, "Failed to cancel booking."));
        }
    };

    const openReviewModal = (booking) => {
        setReviewBooking(booking);
        setReviewRating(5);
        setReviewComment("");
    };

    const closeReviewModal = () => {
        setReviewBooking(null);
        setReviewRating(5);
        setReviewComment("");
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!reviewBooking) return;

        setReviewSubmitting(true);
        try {
            await api.post(`/bookings/${reviewBooking.id}/review`, {
                rating: Number(reviewRating),
                comment: reviewComment?.trim() || null,
            });
            await refreshDashboard();
            closeReviewModal();
        } catch (err) {
            alert(extractApiError(err, "Failed to submit review."));
        } finally {
            setReviewSubmitting(false);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setProfileSaving(true);
        try {
            const response = await api.put("/athletes/me", {
                firstName: profileForm.firstName,
                lastName: profileForm.lastName,
                birthDate: profileForm.birthDate || null,
                height: toOptionalNumber(profileForm.height),
                weight: toOptionalNumber(profileForm.weight),
            });
            setProfile(response.data);
            setProfileForm(buildAthleteProfileForm(response.data));
            setStoredUserName([response.data?.firstName, response.data?.lastName].filter(Boolean).join(" ").trim());
            setAuthUser(getAuthUser());
            alert("Profile updated.");
        } catch (err) {
            alert(extractApiError(err, "Failed to update profile."));
        } finally {
            setProfileSaving(false);
        }
    };

    const handleViewProfile = (athleteId) => {
        if (!athleteId) return;
        navigate(`/athletes/${athleteId}`);
    };

    const handleSendFriendRequest = async (athleteId) => {
        setSocialActionLoading(true);
        try {
            await api.post(`/athletes/${athleteId}/friend-requests`);
            await refreshDashboard();
        } catch (err) {
            alert(extractApiError(err, "Failed to send friend request."));
        } finally {
            setSocialActionLoading(false);
        }
    };

    const handleAcceptFriendRequest = async (requestId, athleteId) => {
        setSocialActionLoading(true);
        try {
            await api.post(`/athletes/friend-requests/${requestId}/accept`);
            await refreshDashboard();
        } catch (err) {
            alert(extractApiError(err, "Failed to accept friend request."));
        } finally {
            setSocialActionLoading(false);
        }
    };

    const handleDeclineFriendRequest = async (requestId, athleteId = null) => {
        setSocialActionLoading(true);
        try {
            await api.delete(`/athletes/friend-requests/${requestId}`);
            await refreshDashboard();
        } catch (err) {
            alert(extractApiError(err, "Failed to decline friend request."));
        } finally {
            setSocialActionLoading(false);
        }
    };

    const handleRemoveFriend = async (friendId) => {
        if (!friendId) return;
        const confirmed = window.confirm("Remove this athlete from your friends list?");
        if (!confirmed) return;

        setSocialActionLoading(true);
        try {
            await api.delete(`/athletes/friends/${friendId}`);
            await refreshDashboard();
        } catch (err) {
            alert(extractApiError(err, "Failed to remove friend."));
        } finally {
            setSocialActionLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm("Delete your account permanently? This will remove your profile, friendships, messages, reviews, and bookings.");
        if (!confirmed) return;

        setAccountActionLoading(true);
        try {
            await api.delete("/athletes/me");
            clearAuth();
            navigate("/");
        } catch (err) {
            alert(extractApiError(err, "Failed to delete account."));
            setAccountActionLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-white">
            {/* NAVBAR */}
            <Navbar 
                authUser={authUser}
                onLogout={handleLogout}
            />

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
                        <section className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
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
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Friends</p>
                                <p className="mt-2 text-3xl font-extrabold text-emerald-700">{friendsCount}</p>
                            </div>
                            <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Incoming Requests</p>
                                <p className="mt-2 text-3xl font-extrabold text-emerald-700">{incomingRequestsCount}</p>
                            </div>
                            <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Outgoing Requests</p>
                                <p className="mt-2 text-3xl font-extrabold text-emerald-700">{outgoingRequestsCount}</p>
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
                            <form onSubmit={handleSaveProfile} className="mt-6 grid gap-4 md:grid-cols-2">
                                <input
                                    value={profileForm.firstName}
                                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                                    placeholder="First name"
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                                    required
                                />
                                <input
                                    value={profileForm.lastName}
                                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                                    placeholder="Last name"
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                                    required
                                />
                                <input
                                    type="date"
                                    value={profileForm.birthDate}
                                    onChange={(e) => setProfileForm({ ...profileForm, birthDate: e.target.value })}
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                                />
                                <input
                                    type="number"
                                    step="0.1"
                                    value={profileForm.height}
                                    onChange={(e) => setProfileForm({ ...profileForm, height: e.target.value })}
                                    placeholder="Height (cm)"
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                                />
                                <input
                                    type="number"
                                    step="0.1"
                                    value={profileForm.weight}
                                    onChange={(e) => setProfileForm({ ...profileForm, weight: e.target.value })}
                                    placeholder="Weight (kg)"
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                                />
                                <button
                                    type="submit"
                                    disabled={profileSaving}
                                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm ${
                                        profileSaving ? "bg-emerald-400" : "bg-emerald-600 hover:bg-emerald-700"
                                    }`}
                                >
                                    {profileSaving ? "Saving..." : "Save Information"}
                                </button>
                            </form>
                            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
                                <p className="text-sm font-semibold text-red-800">Danger Zone</p>
                                <p className="mt-1 text-sm text-red-700">
                                    Deleting your account removes your athlete profile, bookings, reviews, friendships, and messages.
                                </p>
                                <button
                                    type="button"
                                    disabled={accountActionLoading}
                                    onClick={handleDeleteAccount}
                                    className="mt-4 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-red-300"
                                >
                                    {accountActionLoading ? "Deleting..." : "Delete My Account"}
                                </button>
                            </div>
                        </section>

                        <section className="space-y-6">
                                <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
                                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Friends</h2>
                                    <p className="mt-1 text-sm text-slate-600">Athletes connected to your profile.</p>
                                    {profile?.friends?.length ? (
                                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                                            {profile.friends.map((friend) => (
                                                <div key={friend.athleteId} className="rounded-2xl border border-green-100 bg-green-50 p-4">
                                                    <p className="text-base font-extrabold text-slate-900">{formatAthleteName(friend)}</p>
                                                    <p className="mt-1 text-sm text-slate-600">{friend.email}</p>
                                                    <button
                                                        onClick={() => handleViewProfile(friend.athleteId)}
                                                        className="mt-3 rounded-xl border border-green-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-green-100"
                                                    >
                                                        View Profile
                                                    </button>
                                                    <button
                                                        disabled={socialActionLoading}
                                                        onClick={() => handleRemoveFriend(friend.athleteId)}
                                                        className="mt-3 ml-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                                                    >
                                                        Remove Friend
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="mt-4 text-slate-600">No friends yet.</p>
                                    )}
                                </section>

                                <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
                                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Friend Requests</h2>
                                    <div className="mt-5 grid gap-5 lg:grid-cols-2">
                                        <div>
                                            <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-500">Incoming</h3>
                                            {profile?.incomingFriendRequests?.length ? (
                                                <div className="mt-3 space-y-3">
                                                    {profile.incomingFriendRequests.map((request) => (
                                                        <div key={request.id} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                                                            <p className="font-bold text-slate-900">{formatAthleteName(request.sender)}</p>
                                                            <p className="mt-1 text-sm text-slate-600">{request.sender?.email}</p>
                                                            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                                                Sent {formatDateTime(request.sentAt)}
                                                            </p>
                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                <button
                                                                    disabled={socialActionLoading}
                                                                    onClick={() => handleAcceptFriendRequest(request.id, request.sender?.athleteId)}
                                                                    className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-emerald-300"
                                                                >
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    disabled={socialActionLoading}
                                                                    onClick={() => handleDeclineFriendRequest(request.id)}
                                                                    className="rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                                                                >
                                                                    Decline
                                                                </button>
                                                                <button
                                                                    onClick={() => handleViewProfile(request.sender?.athleteId)}
                                                                    className="rounded-xl border border-green-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-green-50"
                                                                >
                                                                    View Profile
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="mt-3 text-sm text-slate-600">No incoming requests.</p>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-500">Outgoing</h3>
                                            {profile?.outgoingFriendRequests?.length ? (
                                                <div className="mt-3 space-y-3">
                                                    {profile.outgoingFriendRequests.map((request) => (
                                                        <div key={request.id} className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                                                            <p className="font-bold text-slate-900">{formatAthleteName(request.receiver)}</p>
                                                            <p className="mt-1 text-sm text-slate-600">{request.receiver?.email}</p>
                                                            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                                                                Pending since {formatDateTime(request.sentAt)}
                                                            </p>
                                                            <button
                                                                onClick={() => handleViewProfile(request.receiver?.athleteId)}
                                                                className="mt-3 rounded-xl border border-green-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-green-50"
                                                            >
                                                                View Profile
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="mt-3 text-sm text-slate-600">No outgoing requests.</p>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
                                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Athlete Directory</h2>
                                    <p className="mt-1 text-sm text-slate-600">Browse athletes and send friend requests.</p>
                                    <div className="mt-4">
                                        <input
                                            type="text"
                                            value={directorySearch}
                                            onChange={(e) => setDirectorySearch(e.target.value)}
                                            placeholder="Search athletes by name"
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                                        />
                                    </div>
                                    {filteredDirectory.length ? (
                                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                                            {filteredDirectory.map((athlete) => (
                                                <div key={athlete.athleteId} className="rounded-2xl border border-green-100 bg-white p-4">
                                                    <div className="space-y-3">
                                                        <div>
                                                            <p className="font-extrabold text-slate-900">{formatAthleteName(athlete)}</p>
                                                            <p className="mt-1 break-all text-sm text-slate-600">{athlete.email}</p>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                                                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                                Connection
                                                            </span>
                                                            <span className={`rounded-full px-3 py-1 text-xs font-bold text-center ${statusTone(athlete.friendshipStatus)}`}>
                                                                {formatFriendshipStatus(athlete.friendshipStatus)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        <button
                                                            onClick={() => handleViewProfile(athlete.athleteId)}
                                                            className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-green-100"
                                                        >
                                                            View Profile
                                                        </button>
                                                        {athlete.friendshipStatus === "NONE" && (
                                                            <button
                                                                disabled={socialActionLoading}
                                                                onClick={() => handleSendFriendRequest(athlete.athleteId)}
                                                                className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-emerald-300"
                                                            >
                                                                Add Friend
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="mt-4 text-slate-600">
                                            {directory.length ? "No athletes match your search." : "No other athletes found."}
                                        </p>
                                    )}
                                </section>
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
                                                    <p className="mt-1 text-sm font-semibold text-emerald-700">
                                                        {booking.bookingType === "OPEN_MATCH" ? "Open match" : "Closed booking"}
                                                        {booking.bookingType === "OPEN_MATCH"
                                                            ? ` • Players ${booking.participants?.length || 0}/${(booking.openSlots || 0) + 1} • Available ${booking.availableSlots ?? 0}`
                                                            : ""}
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-700">
                                                        {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}
                                                    </p>
                                                    {booking.bookingType === "OPEN_MATCH" && booking.participants?.length > 0 && (
                                                        <div className="mt-2">
                                                            <p className="text-sm text-slate-700">Athletes:</p>
                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                {booking.participants.map((participant) => (
                                                                    <button
                                                                        key={`${booking.id}-${participant.athleteId ?? participant.email ?? participant.name}`}
                                                                        type="button"
                                                                        onClick={() => participant.athleteId && handleViewProfile(participant.athleteId)}
                                                                        disabled={!participant.athleteId}
                                                                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                                                                            participant.athleteId
                                                                                ? "border border-green-200 bg-white text-emerald-700 hover:bg-green-100"
                                                                                : "border border-slate-200 bg-slate-100 text-slate-500"
                                                                        }`}
                                                                    >
                                                                        {participant.name || participant.email || "Athlete"}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="rounded-full border border-green-200 bg-white px-3 py-1 text-xs font-bold text-emerald-700">
                                                        {booking.status}
                                                    </span>
                                                    <span className="text-sm font-bold text-emerald-700">
                                                        ${booking.pricePerHour}/hour
                                                    </span>
                                                    {booking.owner && booking.status === "PENDING" && (
                                                        <button
                                                            onClick={() => handleCancelBooking(booking.id)}
                                                            className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                    {booking.canReview && !booking.reviewed && (
                                                        <button
                                                            onClick={() => openReviewModal(booking)}
                                                            className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                                                        >
                                                            Review
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            {booking.reviewed && (
                                                <p className="mt-2 text-sm font-semibold text-slate-700">
                                                    Your review: {booking.reviewRating}/5
                                                    {booking.reviewComment ? ` - ${booking.reviewComment}` : ""}
                                                </p>
                                            )}
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

            {reviewBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
                    <div className="w-full max-w-md rounded-3xl border border-green-100 bg-white p-6 shadow-xl">
                        <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
                            Review {reviewBooking.facilityName || "Facility"}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">Share your experience after this booking.</p>

                        <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Rating</label>
                                <select
                                    value={reviewRating}
                                    onChange={(e) => setReviewRating(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                                >
                                    <option value="5">5 - Excellent</option>
                                    <option value="4">4 - Very good</option>
                                    <option value="3">3 - Good</option>
                                    <option value="2">2 - Fair</option>
                                    <option value="1">1 - Poor</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Comment (optional)</label>
                                <textarea
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    rows={3}
                                    placeholder="How was the facility and your experience?"
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={closeReviewModal}
                                    className="w-full rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-green-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={reviewSubmitting}
                                    className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm ${
                                        reviewSubmitting ? "bg-emerald-400" : "bg-emerald-600 hover:bg-emerald-700"
                                    }`}
                                >
                                    {reviewSubmitting ? "Submitting..." : "Submit Review"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const InfoItem = ({ label, value }) => (
    <div className="rounded-2xl border border-green-100 bg-green-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1 text-sm font-bold text-slate-900">{value || "-"}</p>
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

const buildAthleteProfileForm = (profile) => ({
    firstName: profile?.firstName || "",
    lastName: profile?.lastName || "",
    birthDate: profile?.birthDate || "",
    height: profile?.height ?? "",
    weight: profile?.weight ?? "",
});

const toOptionalNumber = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

export default AthleteDashboard;
