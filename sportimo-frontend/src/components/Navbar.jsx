import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import brandIcon from "../assets/icon.png";
import { clearAuth, getAuthUser } from "../utils/auth";

export default function Navbar({ authUser, onLogout }) {
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinks = [
        { label: "How it works", href: "#how" },
        { label: "Features", href: "#features" },
        { label: "For Centers", href: "#centers" },
        { label: "Matches", href: "#matches" },
        { label: "FAQ", href: "#faq" },
    ];

    const isActiveButton = (href) => {
        return location.pathname === href;
    };

    const getButtonClasses = (href, isLogout = false) => {
        const baseClasses = "rounded-xl px-4 py-2 text-sm font-semibold";
        const activeClasses = isActiveButton(href)
            ? "shadow-md bg-green-50"
            : "";

        if (isLogout) {
            return `${baseClasses} ${activeClasses} bg-emerald-600 text-white hover:bg-emerald-700`;
        }

        return `${baseClasses} ${activeClasses} border border-green-200 text-slate-700 hover:bg-green-50`;
    };

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        } else {
            clearAuth();
            window.location.href = "/";
        }
    };

    return (
        <header className="sticky top-0 z-50 border-b border-green-100 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                <a href="/" className="flex items-center gap-2">
                    <img src={brandIcon} alt="Sportimo icon" className="h-9 w-9 rounded-xl object-cover shadow-sm" />
                    <div className="leading-tight">
                        <div className="text-lg font-800 font-extrabold tracking-tight">
                            Sportimo
                        </div>
                        <div className="text-xs text-slate-500 -mt-1">
                            Book, Play and Track
                        </div>
                    </div>
                </a>

                <nav className="hidden items-center gap-6 md:flex">
                    {navLinks.map((l) => (
                        <a
                            key={l.href}
                            href={l.href}
                            className="text-sm font-medium text-slate-600 hover:text-slate-900"
                        >
                            {l.label}
                        </a>
                    ))}
                </nav>

                <div className="hidden items-center gap-2 md:flex">
                    {authUser ? (
                        <>
                            <a
                                href="/dashboard"
                                className={getButtonClasses("/dashboard")}
                            >
                                {authUser.name}
                            </a>
                            <a
                                href="/facilities"
                                className={getButtonClasses("/facilities")}
                            >
                                Browse facilities
                            </a>
                            <a
                                href="/messages"
                                className={getButtonClasses("/messages")}
                            >
                                Messages
                            </a>
                            <button
                                onClick={handleLogout}
                                className={getButtonClasses(null, true)}
                            >
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <a
                                href="/login"
                                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-green-50"
                            >
                                Log in
                            </a>
                            <a
                                href="/register"
                                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                            >
                                Get started
                            </a>
                        </>
                    )}
                </div>

                <button
                    onClick={() => setMobileOpen((v) => !v)}
                    className="rounded-xl p-2 hover:bg-green-50 md:hidden"
                    aria-label="Toggle menu"
                >
                    <span className="block h-0.5 w-6 bg-slate-700" />
                    <span className="mt-1 block h-0.5 w-6 bg-slate-700" />
                    <span className="mt-1 block h-0.5 w-6 bg-slate-700" />
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-green-100 bg-white">
                    <div className="mx-auto max-w-6xl px-4 py-3">
                        <div className="flex flex-col gap-2">
                            {navLinks.map((l) => (
                                <a
                                    key={l.href}
                                    href={l.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-green-50"
                                >
                                    {l.label}
                                </a>
                            ))}
                            {authUser && (
                                <div className="mt-2 flex flex-col gap-2">
                                    <a
                                        href="/athletes/profile"
                                        onClick={() => setMobileOpen(false)}
                                        className={`w-full text-center ${getButtonClasses("/athletes/profile")}`}
                                    >
                                        {authUser.name}
                                    </a>
                                    <a
                                        href="/facilities"
                                        onClick={() => setMobileOpen(false)}
                                        className={`w-full text-center ${getButtonClasses("/facilities")}`}
                                    >
                                        Browse facilities
                                    </a>
                                    <a
                                        href="/messages"
                                        onClick={() => setMobileOpen(false)}
                                        className={`w-full text-center ${getButtonClasses("/messages")}`}
                                    >
                                        Messages
                                    </a>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setMobileOpen(false);
                                        }}
                                        className={`w-full text-center ${getButtonClasses(null, true)}`}
                                    >
                                        Log out
                                    </button>
                                </div>
                            )}
                            {!authUser && (
                                <div className="mt-2 flex gap-2">
                                    <a
                                        href="/login"
                                        onClick={() => setMobileOpen(false)}
                                        className="w-full rounded-xl border border-green-200 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-green-50"
                                    >
                                        Log in
                                    </a>
                                    <a
                                        href="/register"
                                        onClick={() => setMobileOpen(false)}
                                        className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-700"
                                    >
                                        Get started
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
