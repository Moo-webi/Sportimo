import React from 'react';
import { Link } from 'react-router-dom';

const FacilityCard = ({ facility, isCenter = false, isAthlete = false, onBook }) => {
    return (
        <div className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md">
            <div>
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-extrabold tracking-tight text-slate-900">{facility.name}</h3>
                        <p className="mt-1 text-sm text-slate-600">{facility.description}</p>
                        <p className="mt-2 text-sm font-semibold text-emerald-700">
                            Sport: {facility.sport?.name || 'N/A'}
                        </p>
                    </div>
                    <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                        Active
                    </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
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
    );
};

export default FacilityCard;
