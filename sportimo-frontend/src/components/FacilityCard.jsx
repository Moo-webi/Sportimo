import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FacilityCard = ({ facility, centerNameById = {}, isCenter = false, isAthlete = false, onBook }) => {
    const reviewCount = Number(facility.reviewCount || 0);
    const averageRating = typeof facility.averageRating === "number" ? facility.averageRating : null;
    const images = Array.isArray(facility.imageUrls) && facility.imageUrls.length > 0
        ? facility.imageUrls
            : facility.imageUrl
                ? [facility.imageUrl]
                : [];
    const [imageIndex, setImageIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const safeImageIndex = images.length > 0 ? Math.min(imageIndex, images.length - 1) : 0;
    const coverImage = images[safeImageIndex] || null;
    const resolvedCenterName =
        (facility?.sportsCenterId && centerNameById[facility.sportsCenterId]) ||
        facility?.sportsCenterName ||
        facility?.sportsCenter?.name ||
        "N/A";

    const showPrevImage = () => {
        if (images.length < 2) return;
        setImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const showNextImage = () => {
        if (images.length < 2) return;
        setImageIndex((prev) => (prev + 1) % images.length);
    };

    const openLightbox = () => {
        if (!coverImage) return;
        setIsLightboxOpen(true);
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
    };

    return (
        <>
            <div className="flex h-full flex-col rounded-3xl border border-green-100 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md">
            <div className="relative mb-4 overflow-hidden rounded-2xl bg-green-50">
                {coverImage ? (
                    <img
                        src={coverImage}
                        alt={facility.name}
                        className="h-44 w-full cursor-zoom-in object-cover"
                        onClick={openLightbox}
                    />
                ) : (
                    <div className="flex h-44 w-full items-center justify-center text-sm font-semibold text-slate-500">
                        No image
                    </div>
                )}
                {images.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={showPrevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/45 px-2 py-1 text-xs font-bold text-white hover:bg-black/60"
                            aria-label="Previous image"
                        >
                            {"<"}
                        </button>
                        <button
                            type="button"
                            onClick={showNextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/45 px-2 py-1 text-xs font-bold text-white hover:bg-black/60"
                            aria-label="Next image"
                        >
                            {">"}
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-2 py-0.5 text-xs font-semibold text-white">
                            {safeImageIndex + 1}/{images.length}
                        </div>
                    </>
                )}
            </div>
            <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between">
                    <div className="min-h-[120px]">
                        <h3 className="text-xl font-extrabold tracking-tight text-slate-900">{facility.name}</h3>
                        <p className="mt-1 text-sm text-slate-600">
                            {facility.description || "No description provided."}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-emerald-700">
                            Sport: {facility.sport?.name || 'N/A'}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                            Center: {resolvedCenterName}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-700">
                            {reviewCount > 0 && averageRating != null
                                ? `Rated ${averageRating.toFixed(1)}/5 (${reviewCount} review${reviewCount > 1 ? "s" : ""})`
                                : "No reviews yet"}
                        </p>
                    </div>
                    <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                        Active
                    </span>
                </div>

                <div className="mt-4 flex items-center justify-between pt-2">
                    <div>
                        <span className="text-2xl font-extrabold text-emerald-700">${facility.pricePerHour}</span>
                        <span className="text-sm text-slate-500"> / hour</span>
                    </div>
                    {isCenter ? (
                        <Link
                            to="/manage"
                            className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-green-50"
                        >
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                                <path d="M4 20h4l10-10-4-4L4 16v4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M13 7l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Edit
                        </Link>
                    ) : isAthlete ? (
                        <button
                            onClick={() => onBook?.(facility)}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                        >
                            Book Now
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                        >
                            Log in to book
                        </Link>
                    )}
                </div>
            </div>
            </div>
            {isLightboxOpen && coverImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
                    onClick={closeLightbox}
                >
                    <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={coverImage}
                            alt={facility.name}
                            className="max-h-[85vh] w-full rounded-2xl object-contain"
                        />
                        <button
                            type="button"
                            onClick={closeLightbox}
                            className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-sm font-bold text-white hover:bg-black/75"
                            aria-label="Close image preview"
                        >
                            x
                        </button>
                        {images.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={showPrevImage}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-1 text-sm font-bold text-white hover:bg-black/75"
                                    aria-label="Previous image"
                                >
                                    {"<"}
                                </button>
                                <button
                                    type="button"
                                    onClick={showNextImage}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-1 text-sm font-bold text-white hover:bg-black/75"
                                    aria-label="Next image"
                                >
                                    {">"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default FacilityCard;
