import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import brandIcon from "../assets/icon.png";
import { clearAuth, getAuthUser } from "../utils/auth";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const emptyFacility = { name: "", description: "", pricePerHour: "", sportId: "" };
const emptyAvailability = { dayOfWeek: "MON", startTime: "", endTime: "" };

const ManageFacilities = () => {
    const [sports, setSports] = useState([]);
    const [myFacilities, setMyFacilities] = useState([]);
    const [centerBookings, setCenterBookings] = useState([]);
    const [authUser, setAuthUser] = useState(null);
    const [newSportName, setNewSportName] = useState("");
    const [createFacilityData, setCreateFacilityData] = useState(emptyFacility);
    const [editingFacilityId, setEditingFacilityId] = useState(null);
    const [editFacilityData, setEditFacilityData] = useState(emptyFacility);
    const [selectedFacilityId, setSelectedFacilityId] = useState(null);
    const [selectedFacilityName, setSelectedFacilityName] = useState("");
    const [availabilities, setAvailabilities] = useState([]);
    const [availabilityData, setAvailabilityData] = useState(emptyAvailability);
    const [editingAvailabilityId, setEditingAvailabilityId] = useState(null);

    useEffect(() => {
        loadPageData();
        setAuthUser(getAuthUser());
    }, []);

    const loadPageData = async () => {
        await Promise.all([loadSports(), loadMyFacilities(), loadCenterBookings()]);
    };

    const loadSports = async () => {
        const res = await api.get("/sports");
        setSports(res.data || []);
    };

    const loadMyFacilities = async () => {
        const res = await api.get("/facilities/mine");
        setMyFacilities(res.data || []);
    };

    const loadCenterBookings = async () => {
        const res = await api.get("/bookings/center");
        setCenterBookings(res.data || []);
    };

    const loadAvailability = async (facilityId) => {
        const res = await api.get(`/facilities/${facilityId}/availability`);
        setAvailabilities(res.data || []);
    };

    const handleLogout = () => {
        clearAuth();
        setAuthUser(null);
        window.location.href = "/";
    };

    const handleAddSport = async (e) => {
        e.preventDefault();
        await api.post("/sports", { name: newSportName });
        setNewSportName("");
        await loadSports();
    };

    const handleCreateFacility = async (e) => {
        e.preventDefault();
        await api.post("/facilities", {
            name: createFacilityData.name,
            description: createFacilityData.description,
            pricePerHour: Number(createFacilityData.pricePerHour),
            sportId: Number(createFacilityData.sportId),
        });
        setCreateFacilityData(emptyFacility);
        await loadMyFacilities();
    };

    const startEditFacility = (facility) => {
        setEditingFacilityId(facility.id);
        setEditFacilityData({
            name: facility.name || "",
            description: facility.description || "",
            pricePerHour: facility.pricePerHour ?? "",
            sportId: facility.sport?.id ? String(facility.sport.id) : "",
        });
    };

    const cancelEditFacility = () => {
        setEditingFacilityId(null);
        setEditFacilityData(emptyFacility);
    };

    const handleUpdateFacility = async (facilityId) => {
        await api.put(`/facilities/${facilityId}`, {
            name: editFacilityData.name,
            description: editFacilityData.description,
            pricePerHour: Number(editFacilityData.pricePerHour),
            sportId: Number(editFacilityData.sportId),
        });
        cancelEditFacility();
        await loadMyFacilities();
    };

    const handleDeleteFacility = async (facilityId) => {
        const confirmed = window.confirm("Delete this facility?");
        if (!confirmed) return;

        try {
            await api.delete(`/facilities/${facilityId}`);
            if (selectedFacilityId === facilityId) {
                setSelectedFacilityId(null);
                setAvailabilities([]);
                setEditingAvailabilityId(null);
                setAvailabilityData(emptyAvailability);
            }
            await loadMyFacilities();
        } catch (error) {
            alert(error.response?.data?.message || "Could not delete facility.");
        }
    };

    const openAvailabilityManager = async (facility) => {
        setSelectedFacilityId(facility.id);
        setSelectedFacilityName(facility.name || "Facility");
        setEditingAvailabilityId(null);
        setAvailabilityData(emptyAvailability);
        await loadAvailability(facility.id);
    };

    const closeAvailabilityManager = () => {
        setSelectedFacilityId(null);
        setSelectedFacilityName("");
        setAvailabilities([]);
        setEditingAvailabilityId(null);
        setAvailabilityData(emptyAvailability);
    };

    const startEditAvailability = (availability) => {
        setEditingAvailabilityId(availability.id);
        setAvailabilityData({
            dayOfWeek: availability.dayOfWeek,
            startTime: availability.startTime?.slice(0, 5) || "",
            endTime: availability.endTime?.slice(0, 5) || "",
        });
    };

    const resetAvailabilityEditor = () => {
        setEditingAvailabilityId(null);
        setAvailabilityData(emptyAvailability);
    };

    const handleSaveAvailability = async (e) => {
        e.preventDefault();
        if (!selectedFacilityId) return;

        const payload = {
            dayOfWeek: availabilityData.dayOfWeek,
            startTime: availabilityData.startTime,
            endTime: availabilityData.endTime,
        };

        if (editingAvailabilityId) {
            await api.put(
                `/facilities/${selectedFacilityId}/availability/${editingAvailabilityId}`,
                payload
            );
        } else {
            await api.post(`/facilities/${selectedFacilityId}/availability`, payload);
        }

        resetAvailabilityEditor();
        await loadAvailability(selectedFacilityId);
    };

    const handleDeleteAvailability = async (availabilityId) => {
        if (!selectedFacilityId) return;

        await api.delete(`/facilities/${selectedFacilityId}/availability/${availabilityId}`);
        if (editingAvailabilityId === availabilityId) {
            resetAvailabilityEditor();
        }
        await loadAvailability(selectedFacilityId);
    };

    const handleConfirmBooking = async (bookingId) => {
        try {
            await api.put(`/bookings/${bookingId}/confirm`);
            await loadCenterBookings();
            alert("Booking confirmed.");
        } catch (error) {
            const message =
                (typeof error?.response?.data === "string" && error.response.data) ||
                error?.response?.data?.message ||
                "Failed to confirm booking.";
            alert(message);
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
                        to="/facilities"
                        className="rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-green-50"
                    >
                        View Facilities
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                    >
                        Log out
                    </button>
                </div>
            </div>

            <div className="mx-auto max-w-6xl space-y-8 px-4 pb-10 pt-4">
                <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Add New Sport Category</h2>
                    <form onSubmit={handleAddSport} className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <input
                            value={newSportName}
                            onChange={(e) => setNewSportName(e.target.value)}
                            placeholder="e.g. Padel"
                            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                            required
                        />
                        <button className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
                            Add Sport
                        </button>
                    </form>
                </section>

                <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Create New Facility</h2>
                    <form onSubmit={handleCreateFacility} className="mt-4 grid gap-4 md:grid-cols-2">
                        <input
                            name="name"
                            placeholder="Facility Name"
                            value={createFacilityData.name}
                            onChange={(e) => setCreateFacilityData({ ...createFacilityData, name: e.target.value })}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                            required
                        />
                        <input
                            name="price"
                            type="number"
                            placeholder="Price Per Hour"
                            value={createFacilityData.pricePerHour}
                            onChange={(e) => setCreateFacilityData({ ...createFacilityData, pricePerHour: e.target.value })}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                            required
                        />
                        <select
                            value={createFacilityData.sportId}
                            onChange={(e) => setCreateFacilityData({ ...createFacilityData, sportId: e.target.value })}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                            required
                        >
                            <option value="">Select Sport</option>
                            {sports.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                        <div className="md:col-span-2">
                            <textarea
                                name="description"
                                placeholder="Facility description"
                                value={createFacilityData.description}
                                onChange={(e) =>
                                    setCreateFacilityData({ ...createFacilityData, description: e.target.value })
                                }
                                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                                rows={3}
                                required
                            />
                        </div>
                        <button className="md:col-span-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-700">
                            Create Facility
                        </button>
                    </form>
                </section>

                <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">My Facilities</h2>

                    {myFacilities.length === 0 ? (
                        <p className="mt-4 text-sm text-slate-600">No facilities yet.</p>
                    ) : (
                        <div className="mt-4 space-y-4">
                            {myFacilities.map((facility) => (
                                <div key={facility.id} className="rounded-2xl border border-green-100 p-4">
                                    {editingFacilityId === facility.id ? (
                                        <div className="grid gap-3 md:grid-cols-2">
                                            <input
                                                value={editFacilityData.name}
                                                onChange={(e) =>
                                                    setEditFacilityData({ ...editFacilityData, name: e.target.value })
                                                }
                                                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                                            />
                                            <input
                                                type="number"
                                                value={editFacilityData.pricePerHour}
                                                onChange={(e) =>
                                                    setEditFacilityData({
                                                        ...editFacilityData,
                                                        pricePerHour: e.target.value,
                                                    })
                                                }
                                                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                                            />
                                            <select
                                                value={editFacilityData.sportId}
                                                onChange={(e) =>
                                                    setEditFacilityData({ ...editFacilityData, sportId: e.target.value })
                                                }
                                                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                                            >
                                                <option value="">Select sport</option>
                                                {sports.map((s) => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <div />
                                            <textarea
                                                value={editFacilityData.description}
                                                onChange={(e) =>
                                                    setEditFacilityData({
                                                        ...editFacilityData,
                                                        description: e.target.value,
                                                    })
                                                }
                                                rows={2}
                                                className="md:col-span-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                                            />
                                            <div className="md:col-span-2 flex gap-2">
                                                <button
                                                    onClick={() => handleUpdateFacility(facility.id)}
                                                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={cancelEditFacility}
                                                    className="rounded-xl border border-green-200 px-4 py-2 text-sm font-semibold text-slate-700"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                            <div>
                                                <p className="text-lg font-extrabold text-slate-900">{facility.name}</p>
                                                <p className="mt-1 text-sm text-slate-600">{facility.description}</p>
                                                <p className="mt-1 text-sm font-semibold text-emerald-700">
                                                    {facility.sport?.name || "Sport"} • ${facility.pricePerHour}/hour
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => startEditFacility(facility)}
                                                    className="rounded-xl border border-green-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-green-50"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => openAvailabilityManager(facility)}
                                                    className="rounded-xl border border-green-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-green-50"
                                                >
                                                    Availability
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteFacility(facility.id)}
                                                    className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Bookings On My Facilities</h2>
                    {centerBookings.length === 0 ? (
                        <p className="mt-4 text-sm text-slate-600">No bookings yet.</p>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {centerBookings.map((booking) => (
                                <div key={booking.id} className="rounded-2xl border border-green-100 bg-green-50 p-4">
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="text-base font-extrabold text-slate-900">
                                                {booking.facilityName || "Facility"} • {booking.sportName || "Sport"}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-700">
                                                Athlete: {booking.athleteName || "Athlete"} ({booking.athleteEmail || "No email"})
                                            </p>
                                            <p className="mt-1 text-sm text-slate-700">
                                                {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="rounded-full border border-green-200 bg-white px-3 py-1 text-xs font-bold text-emerald-700">
                                                {booking.status}
                                            </span>
                                            {booking.status === "PENDING" && (
                                                <button
                                                    onClick={() => handleConfirmBooking(booking.id)}
                                                    className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                                                >
                                                    Confirm
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {selectedFacilityId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
                        <section className="w-full max-w-3xl rounded-3xl border border-green-100 bg-white p-6 shadow-xl">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Facility Availability</h2>
                                    <p className="mt-1 text-sm text-slate-600">{selectedFacilityName}</p>
                                </div>
                                <button
                                    onClick={closeAvailabilityManager}
                                    className="rounded-xl border border-green-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-green-50"
                                >
                                    Close
                                </button>
                            </div>

                            <form onSubmit={handleSaveAvailability} className="mt-4 grid gap-3 md:grid-cols-4">
                            <select
                                value={availabilityData.dayOfWeek}
                                onChange={(e) =>
                                    setAvailabilityData({ ...availabilityData, dayOfWeek: e.target.value })
                                }
                                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                            >
                                {DAYS.map((day) => (
                                    <option key={day} value={day}>
                                        {day}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="time"
                                value={availabilityData.startTime}
                                onChange={(e) =>
                                    setAvailabilityData({ ...availabilityData, startTime: e.target.value })
                                }
                                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                                required
                            />
                            <input
                                type="time"
                                value={availabilityData.endTime}
                                onChange={(e) =>
                                    setAvailabilityData({ ...availabilityData, endTime: e.target.value })
                                }
                                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                                required
                            />
                            <button className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white">
                                {editingAvailabilityId ? "Update Slot" : "Add Slot"}
                            </button>
                            </form>

                            {editingAvailabilityId && (
                                <button
                                    onClick={resetAvailabilityEditor}
                                    className="mt-2 rounded-xl border border-green-200 px-3 py-2 text-sm font-semibold text-slate-700"
                                >
                                    Cancel edit
                                </button>
                            )}

                            <div className="mt-5 max-h-72 space-y-2 overflow-y-auto pr-1">
                                {availabilities.length === 0 ? (
                                    <p className="text-sm text-slate-600">No availability slots yet.</p>
                                ) : (
                                    availabilities.map((slot) => (
                                        <div
                                            key={slot.id}
                                            className="flex flex-wrap items-center justify-between rounded-xl border border-green-100 bg-green-50 px-4 py-3"
                                        >
                                            <p className="text-sm font-semibold text-slate-800">
                                                {slot.dayOfWeek} • {slot.startTime?.slice(0, 5)} - {slot.endTime?.slice(0, 5)}
                                            </p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => startEditAvailability(slot)}
                                                    className="rounded-xl border border-green-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAvailability(slot.id)}
                                                    className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageFacilities;

const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};
