import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import brandIcon from "../assets/icon.png";
import { clearAuth, getAuthUser, setStoredUserName } from "../utils/auth";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const emptyFacility = {
    name: "",
    description: "",
    imageUrlsText: "",
    pricePerHour: "",
    sportId: "",
    address: "",
    latitude: "",
    longitude: "",
};
const emptyAvailability = { dayOfWeek: "MON", startTime: "", endTime: "" };

const ManageFacilities = () => {
    const navigate = useNavigate();
    const [sports, setSports] = useState([]);
    const [myFacilities, setMyFacilities] = useState([]);
    const [centerBookings, setCenterBookings] = useState([]);
    const [centerProfile, setCenterProfile] = useState(null);
    const [authUser, setAuthUser] = useState(() => getAuthUser());
    const [newSportName, setNewSportName] = useState("");
    const [createFacilityData, setCreateFacilityData] = useState(emptyFacility);
    const [editingFacilityId, setEditingFacilityId] = useState(null);
    const [editFacilityData, setEditFacilityData] = useState(emptyFacility);
    const [selectedFacilityId, setSelectedFacilityId] = useState(null);
    const [selectedFacilityName, setSelectedFacilityName] = useState("");
    const [availabilities, setAvailabilities] = useState([]);
    const [availabilityData, setAvailabilityData] = useState(emptyAvailability);
    const [editingAvailabilityId, setEditingAvailabilityId] = useState(null);
    const [centerForm, setCenterForm] = useState({
        name: "",
        description: "",
        phone: "",
        address: "",
        latitude: "",
        longitude: "",
    });
    const [centerSaving, setCenterSaving] = useState(false);

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

    useEffect(() => {
        const bootstrap = async () => {
            const [sportsRes, facilitiesRes, bookingsRes, centerRes] = await Promise.all([
                api.get("/sports"),
                api.get("/facilities/mine"),
                api.get("/bookings/center"),
                api.get("/centers/me"),
            ]);
            setSports(sportsRes.data || []);
            setMyFacilities(facilitiesRes.data || []);
            setCenterBookings(bookingsRes.data || []);
            setCenterProfile(centerRes.data || null);
            setCenterForm(buildCenterForm(centerRes.data || null));
            setCreateFacilityData(buildFacilityDraft(centerRes.data || null));
        };
        bootstrap();
    }, []);

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
            imageUrls: parseImageUrls(createFacilityData.imageUrlsText),
            pricePerHour: Number(createFacilityData.pricePerHour),
            sportId: Number(createFacilityData.sportId),
            address: createFacilityData.address,
            latitude: toOptionalNumber(createFacilityData.latitude),
            longitude: toOptionalNumber(createFacilityData.longitude),
        });
        setCreateFacilityData(buildFacilityDraft(centerProfile));
        await loadMyFacilities();
    };

    const startEditFacility = (facility) => {
        setEditingFacilityId(facility.id);
        setEditFacilityData({
            name: facility.name || "",
            description: facility.description || "",
            imageUrlsText: (facility.imageUrls && facility.imageUrls.length > 0
                ? facility.imageUrls
                : facility.imageUrl
                    ? [facility.imageUrl]
                    : []
            ).join("\n"),
            pricePerHour: facility.pricePerHour ?? "",
            sportId: facility.sport?.id ? String(facility.sport.id) : "",
            address: facility.address || centerProfile?.address || "",
            latitude: formatOptionalNumber(facility.latitude ?? centerProfile?.latitude),
            longitude: formatOptionalNumber(facility.longitude ?? centerProfile?.longitude),
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
            imageUrls: parseImageUrls(editFacilityData.imageUrlsText),
            pricePerHour: Number(editFacilityData.pricePerHour),
            sportId: Number(editFacilityData.sportId),
            address: editFacilityData.address,
            latitude: toOptionalNumber(editFacilityData.latitude),
            longitude: toOptionalNumber(editFacilityData.longitude),
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

    const handleSaveCenterProfile = async (e) => {
        e.preventDefault();
        setCenterSaving(true);
        try {
            const response = await api.put("/centers/me", {
                name: centerForm.name,
                description: centerForm.description,
                phone: centerForm.phone,
                address: centerForm.address,
                latitude: toOptionalNumber(centerForm.latitude),
                longitude: toOptionalNumber(centerForm.longitude),
            });
            setCenterProfile(response.data);
            setCenterForm(buildCenterForm(response.data));
            setStoredUserName(response.data?.name || "Sports Center");
            setAuthUser(getAuthUser());
            alert("Sports center information updated.");
        } catch (error) {
            alert(error.response?.data?.message || "Failed to update sports center information.");
        } finally {
            setCenterSaving(false);
        }
    };

    const handleMessageAthlete = (athleteId) => {
        if (!athleteId) return;
        navigate(`/messages?recipientType=ATHLETE&recipientId=${athleteId}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                <Link to="/" className="flex items-center gap-2">
                    <img src={brandIcon} alt="Sportimo icon" className="h-9 w-9 rounded-xl object-cover shadow-sm" />
                    <div className="leading-tight">
                        <div className="text-lg font-extrabold tracking-tight text-slate-900">Sportimo</div>
                        <div className="-mt-1 text-xs text-slate-500">Book,  Play and  Track</div>
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

            <div className="mx-auto max-w-6xl space-y-8 px-4 pb-10 pt-4">
                <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Sports Center Information</h2>
                    <form onSubmit={handleSaveCenterProfile} className="mt-4 grid gap-4 md:grid-cols-2">
                        <input
                            value={centerForm.name}
                            onChange={(e) => setCenterForm({ ...centerForm, name: e.target.value })}
                            placeholder="Sports center name"
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                            required
                        />
                        <input
                            value={centerForm.phone}
                            onChange={(e) => setCenterForm({ ...centerForm, phone: e.target.value })}
                            placeholder="Phone number"
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                        />
                        <textarea
                            value={centerForm.description}
                            onChange={(e) => setCenterForm({ ...centerForm, description: e.target.value })}
                            placeholder="Description"
                            rows={3}
                            className="md:col-span-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                        />
                        <input
                            value={centerForm.address}
                            onChange={(e) => setCenterForm({ ...centerForm, address: e.target.value })}
                            placeholder="Address"
                            className="md:col-span-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                            required
                        />
                        <input
                            type="number"
                            step="any"
                            value={centerForm.latitude}
                            onChange={(e) => setCenterForm({ ...centerForm, latitude: e.target.value })}
                            placeholder="Latitude"
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                        />
                        <input
                            type="number"
                            step="any"
                            value={centerForm.longitude}
                            onChange={(e) => setCenterForm({ ...centerForm, longitude: e.target.value })}
                            placeholder="Longitude"
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                        />
                        <div className="md:col-span-2 flex items-center gap-3">
                            <button
                                type="submit"
                                disabled={centerSaving}
                                className={`rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm ${
                                    centerSaving ? "bg-emerald-400" : "bg-emerald-600 hover:bg-emerald-700"
                                }`}
                            >
                                {centerSaving ? "Saving..." : "Save Information"}
                            </button>
                            {centerProfile?.googleMapsUrl && (
                                <a
                                    href={centerProfile.googleMapsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm font-semibold text-emerald-700 hover:underline"
                                >
                                    Open current location in Google Maps
                                </a>
                            )}
                        </div>
                    </form>
                </section>

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
                    {centerProfile?.address && (
                        <div className="mt-3 rounded-2xl border border-green-100 bg-green-50 p-4 text-sm text-slate-700">
                            Default location: <span className="font-semibold">{centerProfile.address}</span>
                            {centerProfile.googleMapsUrl && (
                                <a
                                    href={centerProfile.googleMapsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="ml-2 font-semibold text-emerald-700 hover:underline"
                                >
                                    Open in Google Maps
                                </a>
                            )}
                        </div>
                    )}
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
                        <textarea
                            name="imageUrls"
                            placeholder={"Image URLs (one per line)\nhttps://.../pic1.jpg\nhttps://.../pic2.jpg"}
                            value={createFacilityData.imageUrlsText}
                            onChange={(e) => setCreateFacilityData({ ...createFacilityData, imageUrlsText: e.target.value })}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                            rows={3}
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
                        <div className="md:col-span-2 grid gap-4 md:grid-cols-3">
                            <input
                                name="address"
                                placeholder="Facility address"
                                value={createFacilityData.address}
                                onChange={(e) => setCreateFacilityData({ ...createFacilityData, address: e.target.value })}
                                className="md:col-span-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                                required
                            />
                            <input
                                name="latitude"
                                type="number"
                                step="any"
                                placeholder="Latitude"
                                value={createFacilityData.latitude}
                                onChange={(e) => setCreateFacilityData({ ...createFacilityData, latitude: e.target.value })}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                            />
                            <input
                                name="longitude"
                                type="number"
                                step="any"
                                placeholder="Longitude"
                                value={createFacilityData.longitude}
                                onChange={(e) => setCreateFacilityData({ ...createFacilityData, longitude: e.target.value })}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400"
                            />
                            <button
                                type="button"
                                onClick={() => setCreateFacilityData((current) => ({
                                    ...current,
                                    address: centerProfile?.address || "",
                                    latitude: formatOptionalNumber(centerProfile?.latitude),
                                    longitude: formatOptionalNumber(centerProfile?.longitude),
                                }))}
                                className="rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-green-50"
                            >
                                Use center location
                            </button>
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
                                            <textarea
                                                placeholder={"Image URLs (one per line)\nhttps://.../pic1.jpg\nhttps://.../pic2.jpg"}
                                                value={editFacilityData.imageUrlsText}
                                                onChange={(e) =>
                                                    setEditFacilityData({
                                                        ...editFacilityData,
                                                        imageUrlsText: e.target.value,
                                                    })
                                                }
                                                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                                                rows={3}
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
                                            <input
                                                value={editFacilityData.address}
                                                onChange={(e) =>
                                                    setEditFacilityData({
                                                        ...editFacilityData,
                                                        address: e.target.value,
                                                    })
                                                }
                                                placeholder="Facility address"
                                                className="md:col-span-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                                            />
                                            <input
                                                type="number"
                                                step="any"
                                                value={editFacilityData.latitude}
                                                onChange={(e) =>
                                                    setEditFacilityData({
                                                        ...editFacilityData,
                                                        latitude: e.target.value,
                                                    })
                                                }
                                                placeholder="Latitude"
                                                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                                            />
                                            <input
                                                type="number"
                                                step="any"
                                                value={editFacilityData.longitude}
                                                onChange={(e) =>
                                                    setEditFacilityData({
                                                        ...editFacilityData,
                                                        longitude: e.target.value,
                                                    })
                                                }
                                                placeholder="Longitude"
                                                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setEditFacilityData({
                                                        ...editFacilityData,
                                                        address: centerProfile?.address || "",
                                                        latitude: formatOptionalNumber(centerProfile?.latitude),
                                                        longitude: formatOptionalNumber(centerProfile?.longitude),
                                                    })
                                                }
                                                className="rounded-xl border border-green-200 px-4 py-2 text-sm font-semibold text-slate-700"
                                            >
                                                Use center location
                                            </button>
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
                                            <div className="flex gap-4">
                                                {getFacilityImages(facility).length > 0 ? (
                                                    <img
                                                        src={getFacilityImages(facility)[0]}
                                                        alt={facility.name}
                                                        className="h-20 w-28 rounded-xl object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-20 w-28 rounded-xl bg-green-50" />
                                                )}
                                                <div>
                                                    <p className="text-lg font-extrabold text-slate-900">{facility.name}</p>
                                                    <p className="mt-1 text-sm text-slate-600">{facility.description}</p>
                                                    <p className="mt-1 text-sm font-semibold text-emerald-700">
                                                        {facility.sport?.name || "Sport"} • ${facility.pricePerHour}/hour
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-700">
                                                        {facility.address || "No address"}
                                                    </p>
                                                    {facility.googleMapsUrl && (
                                                        <a
                                                            href={facility.googleMapsUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="mt-1 inline-block text-sm font-semibold text-emerald-700 hover:underline"
                                                        >
                                                            Open in Google Maps
                                                        </a>
                                                    )}
                                                </div>
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
                                                {booking.facilityName || "Facility"}  {booking.sportName || "Sport"}
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
                                            {booking.athleteId && (
                                                <button
                                                    onClick={() => handleMessageAthlete(booking.athleteId)}
                                                    className="rounded-xl border border-green-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-green-50"
                                                >
                                                    Message Athlete
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
                                                {slot.dayOfWeek}  {slot.startTime?.slice(0, 5)} - {slot.endTime?.slice(0, 5)}
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

const parseImageUrls = (value) => {
    if (!value) return [];
    return value
        .split("\n")
        .map((line) => line.trim())
        .filter((line, index, arr) => line.length > 0 && arr.indexOf(line) === index);
};

const getFacilityImages = (facility) => {
    if (Array.isArray(facility?.imageUrls) && facility.imageUrls.length > 0) {
        return facility.imageUrls;
    }
    if (facility?.imageUrl) return [facility.imageUrl];
    return [];
};

const buildFacilityDraft = (centerProfile) => ({
    ...emptyFacility,
    address: centerProfile?.address || "",
    latitude: formatOptionalNumber(centerProfile?.latitude),
    longitude: formatOptionalNumber(centerProfile?.longitude),
});

const buildCenterForm = (centerProfile) => ({
    name: centerProfile?.name || "",
    description: centerProfile?.description || "",
    phone: centerProfile?.phone || "",
    address: centerProfile?.address || "",
    latitude: formatOptionalNumber(centerProfile?.latitude),
    longitude: formatOptionalNumber(centerProfile?.longitude),
});

const formatOptionalNumber = (value) => {
    return value === null || value === undefined ? "" : String(value);
};

const toOptionalNumber = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

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


