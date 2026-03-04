import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import FacilityCard from '../components/FacilityCard';
import { Link } from 'react-router-dom';
import brandIcon from '../assets/icon.png';
import { clearAuth, getAuthUser } from '../utils/auth';

const FacilityList = () => {
    const [facilities, setFacilities] = useState([]);
    const [sports, setSports] = useState([]);
    const [selectedSportId, setSelectedSportId] = useState('');
    const [loading, setLoading] = useState(true);
    const [authUser, setAuthUser] = useState(null);
    const [bookingFacility, setBookingFacility] = useState(null);
    const [bookingDate, setBookingDate] = useState("");
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState("");

    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                const user = getAuthUser();
                setAuthUser(user);

                const facilitiesEndpoint = user?.role === "CENTER" ? "/facilities/mine" : "/facilities";
                const [facilitiesRes, sportsRes] = await Promise.all([
                    api.get(facilitiesEndpoint),
                    api.get('/sports')
                ]);
                setFacilities(facilitiesRes.data);
                setSports(sportsRes.data);
            } catch (err) {
                console.error("Failed to fetch facilities", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFacilities();
    }, []);

    const handleLogout = () => {
        clearAuth();
        setAuthUser(null);
        window.location.href = "/";
    };

    const openBookingModal = (facility) => {
        setBookingFacility(facility);
        setBookingDate("");
        setAvailableSlots([]);
        setSelectedSlot(null);
        setBookingError("");
    };

    const closeBookingModal = () => {
        setBookingFacility(null);
        setBookingDate("");
        setAvailableSlots([]);
        setSelectedSlot(null);
        setBookingError("");
    };

    const loadAvailableSlots = async (facilityId, dateValue) => {
        if (!facilityId || !dateValue) return;
        setSlotsLoading(true);
        setBookingError("");
        setSelectedSlot(null);
        try {
            const res = await api.get("/bookings/available-slots", {
                params: { facilityId, date: dateValue },
            });
            setAvailableSlots(res.data || []);
        } catch (error) {
            setAvailableSlots([]);
            setBookingError(extractApiError(error, "Failed to load available slots."));
        } finally {
            setSlotsLoading(false);
        }
    };

    const handleCreateBooking = async (e) => {
        e.preventDefault();
        if (!bookingFacility) return;

        setBookingError("");
        setBookingLoading(true);
        try {
            if (!selectedSlot) {
                setBookingError("Please select an available slot.");
                setBookingLoading(false);
                return;
            }
            await api.post("/bookings", {
                facilityId: bookingFacility.id,
                startTime: selectedSlot.startTime,
                endTime: selectedSlot.endTime,
            });
            alert("Booking created successfully.");
            closeBookingModal();
        } catch (error) {
            setBookingError(extractApiError(error, "Failed to create booking."));
        } finally {
            setBookingLoading(false);
        }
    };

    const filteredFacilities = selectedSportId
        ? facilities.filter((f) => String(f.sport?.id) === selectedSportId)
        : facilities;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-white p-8 text-center">
                <p className="mt-20 text-slate-600">Loading amazing sports spots...</p>
            </div>
        );
    }

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
                    {authUser ? (
                        <>
                            <span className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                                 {authUser.name}
                            </span>
                            <Link
                                to={authUser.role === "CENTER" ? "/manage" : authUser.role === "ATHLETE" ? "/dashboard" : "/facilities"}
                                className="rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-green-50"
                            >
                                Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                            >
                                Log out
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                        >
                            Log in
                        </Link>
                    )}
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-4 pb-10 pt-4">
                <div className="mb-8 rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Available Facilities</h1>
                    <div className="w-full md:w-72">
                        <label className="mb-1 block text-sm font-semibold text-slate-700">
                            Filter by sport
                        </label>
                        <select
                            value={selectedSportId}
                            onChange={(e) => setSelectedSportId(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                        >
                            <option value="">All sports</option>
                            {sports.map((sport) => (
                                <option key={sport.id} value={String(sport.id)}>
                                    {sport.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                </div>

                {filteredFacilities.length === 0 ? (
                    <div className="rounded-3xl border border-green-100 bg-white p-10 text-center shadow-sm">
                        <p className="text-slate-600">No facilities match this filter.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredFacilities.map((f) => (
                            <FacilityCard
                                key={f.id}
                                facility={f}
                                isCenter={authUser?.role === "CENTER"}
                                isAthlete={authUser?.role === "ATHLETE"}
                                onBook={openBookingModal}
                            />
                        ))}
                    </div>
                )}
            </div>

            {bookingFacility && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
                    <div className="w-full max-w-md rounded-3xl border border-green-100 bg-white p-6 shadow-xl">
                        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                            Book {bookingFacility.name}
                        </h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Choose a date, then pick one available slot.
                        </p>

                        {bookingError && (
                            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                                {bookingError}
                            </div>
                        )}

                        <form onSubmit={handleCreateBooking} className="mt-4 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">
                                    Booking date
                                </label>
                                <input
                                    type="date"
                                    value={bookingDate}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setBookingDate(value);
                                        setAvailableSlots([]);
                                        setSelectedSlot(null);
                                        if (value) {
                                            loadAvailableSlots(bookingFacility.id, value);
                                        }
                                    }}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                                    required
                                />
                            </div>

                            {bookingDate && (
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Available slots
                                    </label>
                                    {slotsLoading ? (
                                        <p className="text-sm text-slate-600">Loading slots...</p>
                                    ) : availableSlots.length === 0 ? (
                                        <p className="text-sm text-slate-600">No available slots on this date.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {availableSlots.map((slot, idx) => {
                                                const start = formatSlotTime(slot.startTime);
                                                const end = formatSlotTime(slot.endTime);
                                                const isSelected = selectedSlot?.startTime === slot.startTime && selectedSlot?.endTime === slot.endTime;

                                                return (
                                                    <button
                                                        key={`${slot.startTime}-${slot.endTime}-${idx}`}
                                                        type="button"
                                                        onClick={() => setSelectedSlot(slot)}
                                                        className={`w-full rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${
                                                            isSelected
                                                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                                                : "border-slate-200 bg-white text-slate-700 hover:bg-green-50"
                                                        }`}
                                                    >
                                                        {start} - {end}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={closeBookingModal}
                                    className="w-full rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-green-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={bookingLoading}
                                    className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm ${
                                        bookingLoading ? "bg-emerald-400" : "bg-emerald-600 hover:bg-emerald-700"
                                    }`}
                                >
                                    {bookingLoading ? "Booking..." : "Confirm Booking"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const formatSlotTime = (dateTimeValue) => {
    if (!dateTimeValue) return "";
    const date = new Date(dateTimeValue);
    if (Number.isNaN(date.getTime())) return dateTimeValue;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const extractApiError = (error, fallback) => {
    const data = error?.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (data?.message) return data.message;
    if (error?.response?.status) return `${fallback} (HTTP ${error.response.status})`;
    return fallback;
};

export default FacilityList;
