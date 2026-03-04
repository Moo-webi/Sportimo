import React, { useEffect, useMemo, useState } from "react";
import brandIcon from "../assets/icon.png";
import brandLogo from "../assets/logo (2).png";
import { clearAuth, getAuthUser } from "../utils/auth";
import api from "../api/axios";

/**
 * Sportimo Landing Page (Playtomic-inspired layout)
 * Stack: React + TailwindCSS
 * Theme: Light green
 *
 * Drop this into: src/pages/Landing.jsx (or App.jsx)
 */
export default function SportimoLanding() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [authUser, setAuthUser] = useState(null);
    const [landingData, setLandingData] = useState(null);

    const navLinks = useMemo(
        () => [
            { label: "How it works", href: "#how" },
            { label: "Features", href: "#features" },
            { label: "For Centers", href: "#centers" },
            { label: "Matches", href: "#matches" },
            { label: "FAQ", href: "#faq" },
        ],
        []
    );

    useEffect(() => {
        setAuthUser(getAuthUser());

        const fetchLandingData = async () => {
            try {
                const res = await api.get("/public/landing");
                setLandingData(res.data);
            } catch (error) {
                console.error("Failed to load landing data", error);
            }
        };

        fetchLandingData();
    }, []);

    const handleLogout = () => {
        clearAuth();
        setAuthUser(null);
        window.location.href = "/";
    };

    const dynamicSports = landingData?.spotlightSports?.length
        ? landingData.spotlightSports
        : ["Padel", "Tennis", "Football", "Basketball"];

    const dynamicFacilities = landingData?.featuredFacilities?.length
        ? landingData.featuredFacilities
        : [];

    const dynamicMatches = landingData?.upcomingMatches?.length
        ? landingData.upcomingMatches
        : [];

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-white text-slate-900">
            {/* NAVBAR */}
            <header className="sticky top-0 z-50 border-b border-green-100 bg-white/80 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                    <a href="/" className="flex items-center gap-2">
                        <img src={brandIcon} alt="Sportimo icon" className="h-9 w-9 rounded-xl object-cover shadow-sm" />
                        <div className="leading-tight">
                            <div className="text-lg font800 font-extrabold tracking-tight">
                                Sportimo
                            </div>
                            <div className="text-xs text-slate-500 -mt-1">
                                Book • Play • Track
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
                                <span className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                                    {authUser.name}
                                </span>
                                <a
                                    href={authUser.role === "CENTER" ? "/manage" : authUser.role === "ATHLETE" ? "/dashboard" : "/facilities"}
                                    className="rounded-xl border border-green-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-green-50"
                                >
                                    Dashboard
                                </a>
                                <button
                                    onClick={handleLogout}
                                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
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
                                <div className="mt-2 flex gap-2">
                                    {authUser ? (
                                        <>
                                            <a
                                                href={authUser.role === "CENTER" ? "/manage" : authUser.role === "ATHLETE" ? "/dashboard" : "/facilities"}
                                                className="w-full rounded-xl border border-green-200 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-green-50"
                                            >
                                                Dashboard
                                            </a>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-700"
                                            >
                                                Log out
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <a
                                                href="/login"
                                                className="w-full rounded-xl border border-green-200 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-green-50"
                                            >
                                                Log in
                                            </a>
                                            <a
                                                href="/register"
                                                className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-700"
                                            >
                                                Get started
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* HERO */}
            <section className="mx-auto max-w-6xl px-4 pt-10 md:pt-16">
                <div className="grid items-center gap-10 md:grid-cols-2">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                            Multi-sport bookings in one place
                        </div>

                        <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
                            Book sports facilities,
                            <span className="text-emerald-700"> create matches</span>, and
                            track your progress.
                        </h1>

                        <p className="mt-4 text-lg text-slate-600">
                            Sportimo connects athletes and sports centers—discover nearby
                            facilities, reserve time slots, and build a sports community.
                        </p>

                        {/* Search card (Playtomic-ish) */}
                        <div className="mt-6 rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
                            <div className="grid gap-3 md:grid-cols-3">
                                <div className="md:col-span-1">
                                    <label className="text-xs font-semibold text-slate-500">
                                        Sport
                                    </label>
                                    <select className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400">
                                        {dynamicSports.map((sport) => (
                                            <option key={sport}>{sport}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-1">
                                    <label className="text-xs font-semibold text-slate-500">
                                        Location
                                    </label>
                                    <input
                                        placeholder="Porto, Portugal"
                                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400"
                                    />
                                </div>

                                <div className="md:col-span-1">
                                    <label className="text-xs font-semibold text-slate-500">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex flex-col gap-2 md:flex-row">
                                <a
                                    href="/facilities"
                                    className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 md:w-auto"
                                >
                                    Search facilities
                                </a>
                                <a
                                    href="#how"
                                    className="inline-flex w-full items-center justify-center rounded-xl border border-green-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-green-50 md:w-auto"
                                >
                                    See how it works
                                </a>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                            <Badge text="Fast booking" />
                            <Badge text="No overlaps" />
                            <Badge text="Matches + community" />
                            <Badge text="Performance tracking" />
                        </div>
                    </div>

                    {/* Hero visual */}
                    <div className="relative">
                        <div className="absolute -inset-6 -z-10 rounded-[32px] bg-gradient-to-br from-green-100 via-white to-emerald-100 blur-2xl" />
                        <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-bold text-slate-800">
                                    Nearby facilities
                                </div>
                                <div className="text-xs font-semibold text-emerald-700">
                                    Live availability
                                </div>
                            </div>

                            <div className="mt-4 grid gap-3">
                                {dynamicFacilities.length > 0 ? (
                                    dynamicFacilities.map((facility) => (
                                        <FacilityCard
                                            key={facility.id}
                                            title={facility.name}
                                            subtitle={`${facility.sportName || "Sport"} • ${facility.description || "Facility"}`}
                                            price={`$${facility.pricePerHour} / hour`}
                                            tags={["Available"]}
                                        />
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm font-semibold text-slate-600">
                                        No facilities available yet.
                                    </div>
                                )}
                            </div>

                            <div className="mt-5 rounded-2xl bg-green-50 p-4">
                                <div className="text-xs font-semibold text-slate-600">
                                    Next up
                                </div>
                                <div className="mt-1 text-sm font-bold text-slate-900">
                                    {dynamicMatches.length > 0
                                        ? `${dynamicMatches[0].sportName || "Match"} at ${formatMatchTime(dynamicMatches[0].startTime)}`
                                        : "No upcoming matches yet"}
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <div className="h-8 w-8 rounded-full bg-emerald-200" />
                                    <div className="h-8 w-8 rounded-full bg-emerald-200" />
                                    <div className="h-8 w-8 rounded-full bg-emerald-200" />
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                                        +2
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <StatCard label="Facilities" value={landingData ? String(landingData.facilitiesCount) : "..."} />
                            <StatCard label="Sports" value={landingData ? String(landingData.sportsCount) : "..."} />
                            <StatCard label="Slots" value={landingData ? String(landingData.slotsCount) : "..."} />
                            <StatCard label="Matches" value={landingData ? String(landingData.upcomingMatchesCount) : "..."} />
                        </div>
                    </div>
                </div>
            </section>

            {/* LOGOS / SOCIAL PROOF (light) */}
            <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
                <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
                    <div className="text-center text-sm font-semibold text-slate-600">
                        Built for athletes and sports centers — starting in Porto, scalable everywhere.
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-3 opacity-80 md:grid-cols-4">
                        {dynamicSports.slice(0, 4).map((sport) => (
                            <LogoPill key={sport} text={sport} />
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section id="features" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight">
                            Everything you need to play more
                        </h2>
                        <p className="mt-2 max-w-2xl text-slate-600">
                            Discover facilities, reserve time slots, organize matches, and keep your stats in one place.
                        </p>
                    </div>
                    <a
                        href="/register"
                        className="hidden rounded-xl border border-green-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-green-50 md:inline-flex"
                    >
                        Create account
                    </a>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                    <Feature
                        title="Smart discovery"
                        desc="Find nearby facilities with filters by sport, location, and date."
                    />
                    <Feature
                        title="Conflict-free booking"
                        desc="Availability stays consistent, so overlapping bookings don’t happen."
                    />
                    <Feature
                        title="Matches & community"
                        desc="Create matches, invite friends, and join public games."
                    />
                    <Feature
                        title="Performance tracking"
                        desc="Track progress like weight and calories burned to stay motivated."
                    />
                    <Feature
                        title="Ratings & reviews"
                        desc="See what players think before you book—help centers improve."
                    />
                    <Feature
                        title="Center dashboard"
                        desc="Sports centers manage facilities, pricing, schedules, and bookings."
                    />
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="how" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
                <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm md:p-10">
                    <h2 className="text-3xl font-extrabold tracking-tight">
                        How Sportimo works
                    </h2>
                    <p className="mt-2 text-slate-600">
                        Simple flow, fast booking, and a community layer on top.
                    </p>

                    <div className="mt-8 grid gap-6 md:grid-cols-3">
                        <Step
                            n="1"
                            title="Search"
                            desc="Choose sport, location, and date to find available facilities."
                        />
                        <Step
                            n="2"
                            title="Book"
                            desc="Pick a time slot, confirm your reservation, and you’re set."
                        />
                        <Step
                            n="3"
                            title="Play"
                            desc="Create or join matches, invite friends, and track your progress."
                        />
                    </div>
                </div>
            </section>

            {/* FOR SPORTS CENTERS */}
            <section id="centers" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm md:p-10">
                        <h2 className="text-3xl font-extrabold tracking-tight">
                            For sports centers
                        </h2>
                        <p className="mt-2 text-slate-600">
                            Manage facilities, schedules, and bookings with an interface built for speed.
                        </p>

                        <ul className="mt-6 space-y-3 text-sm text-slate-700">
                            <li className="flex gap-2">
                                <Check /> Add and edit facilities, sport types, and pricing
                            </li>
                            <li className="flex gap-2">
                                <Check /> Set availability schedules and keep them updated
                            </li>
                            <li className="flex gap-2">
                                <Check /> View bookings in real time and reduce manual coordination
                            </li>
                            <li className="flex gap-2">
                                <Check /> Increase visibility to athletes searching nearby
                            </li>
                        </ul>

                        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                            <a
                                href="/register?role=center"
                                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-700"
                            >
                                Register as a center
                            </a>
                            <a
                                href="#faq"
                                className="rounded-xl border border-green-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-green-50"
                            >
                                Questions?
                            </a>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm md:p-10">
                        <div className="text-sm font-bold text-slate-800">
                            Center dashboard preview
                        </div>
                        <div className="mt-4 grid gap-3">
                            <PanelRow label="Facilities" value="3 active" />
                            <PanelRow label="Today bookings" value="7" />
                            <PanelRow label="Next slot" value="18:30" />
                            <PanelRow label="Avg rating" value="4.6★" />
                        </div>

                        <div className="mt-6 rounded-2xl bg-white p-4">
                            <div className="text-xs font-semibold text-slate-600">
                                Tip
                            </div>
                            <div className="mt-1 text-sm font-bold text-slate-900">
                                Add photos + clear pricing to boost conversions
                            </div>
                            <p className="mt-2 text-sm text-slate-600">
                                Clear listings help athletes trust the booking flow and come back.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* MATCHES */}
            <section id="matches" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
                <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm md:p-10">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h2 className="text-3xl font-extrabold tracking-tight">
                                Create matches, meet players
                            </h2>
                            <p className="mt-2 text-slate-600">
                                Invite friends or open your match to the community.
                            </p>
                        </div>
                        <a
                            href="/matches"
                            className="rounded-xl border border-green-200 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-green-50"
                        >
                            Browse matches
                        </a>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        {dynamicMatches.length > 0 ? (
                            dynamicMatches.map((match) => (
                                <MatchCard
                                    key={match.id}
                                    title={`${match.sportName || "Sport"} • Upcoming`}
                                    meta={`${match.facilityName || "Facility"} • ${formatMatchTime(match.startTime)}`}
                                    seats="Open booking"
                                />
                            ))
                        ) : (
                            <div className="md:col-span-3 rounded-3xl border border-green-100 bg-white p-6 text-sm font-semibold text-slate-600 shadow-sm">
                                No upcoming matches found yet.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
                <h2 className="text-3xl font-extrabold tracking-tight">FAQ</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <Faq
                        q="Is Sportimo only for padel/tennis?"
                        a="No — Sportimo is multi-sport (football, futsal, padel, tennis, basketball, and more)."
                    />
                    <Faq
                        q="Do I need an account to view facilities?"
                        a="You can browse facilities publicly, then sign up to book, create matches, and track stats."
                    />
                    <Faq
                        q="How do sports centers join?"
                        a="Centers register, add facilities, set schedules and pricing, then start receiving bookings."
                    />
                    <Faq
                        q="Will payments be integrated?"
                        a="That can be added later; the MVP focuses on booking and management first."
                    />
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="mx-auto max-w-6xl px-4 pb-16">
                <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-green-500 p-8 text-white shadow-sm md:p-12">
                    <div className="grid gap-6 md:grid-cols-2 md:items-center">
                        <div>
                            <h3 className="text-3xl font-extrabold tracking-tight">
                                Ready to play more this week?
                            </h3>
                            <p className="mt-2 text-white/90">
                                Create an account in minutes and start booking facilities or organizing matches.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row md:justify-end">
                            <a
                                href="/register"
                                className="rounded-xl bg-white px-5 py-2.5 text-center text-sm font-extrabold text-emerald-700 hover:bg-white/90"
                            >
                                Sign up free
                            </a>
                            <a
                                href="/register?role=center"
                                className="rounded-xl border border-white/30 px-5 py-2.5 text-center text-sm font-extrabold text-white hover:bg-white/10"
                            >
                                I’m a sports center
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-green-100 bg-white">
                <div className="mx-auto max-w-6xl px-4 py-10">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <img src={brandLogo} alt="Sportimo logo" className="h-8 w-auto" />
                            </div>
                            <p className="mt-3 max-w-sm text-sm text-slate-600">
                                Book facilities, create matches, and track performance — all in one platform.
                            </p>
                            <p className="mt-3 text-xs text-slate-500">
                                © {new Date().getFullYear()} Sportimo. All rights reserved.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6 text-sm md:grid-cols-3">
                            <FooterCol title="Product">
                                <FooterLink href="#features" label="Features" />
                                <FooterLink href="#how" label="How it works" />
                                <FooterLink href="/facilities" label="Facilities" />
                                <FooterLink href="/matches" label="Matches" />
                            </FooterCol>
                            <FooterCol title="For Centers">
                                <FooterLink href="#centers" label="Dashboard" />
                                <FooterLink href="/register?role=center" label="Register" />
                                <FooterLink href="#faq" label="FAQ" />
                            </FooterCol>
                            <FooterCol title="Company">
                                <FooterLink href="/about" label="About" />
                                <FooterLink href="/privacy" label="Privacy" />
                                <FooterLink href="/terms" label="Terms" />
                            </FooterCol>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function formatMatchTime(rawDateTime) {
    if (!rawDateTime) return "TBD";
    const date = new Date(rawDateTime);
    if (Number.isNaN(date.getTime())) return "TBD";
    return date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/* ---------- small components ---------- */

function Badge({ text }) {
    return (
        <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-emerald-700">
      {text}
    </span>
    );
}

function FacilityCard({ title, subtitle, price, tags }) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:border-emerald-200">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-sm font-extrabold text-slate-900">{title}</div>
                    <div className="mt-1 text-xs font-semibold text-slate-500">
                        {subtitle}
                    </div>
                </div>
                <div className="text-sm font-extrabold text-emerald-700">{price}</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((t) => (
                    <span
                        key={t}
                        className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-slate-700"
                    >
            {t}
          </span>
                ))}
            </div>
        </div>
    );
}

function StatCard({ label, value }) {
    return (
        <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">{label}</div>
            <div className="mt-1 text-lg font-extrabold text-slate-900">{value}</div>
        </div>
    );
}

function LogoPill({ text }) {
    return (
        <div className="flex items-center justify-center rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-extrabold text-slate-700">
            {text}
        </div>
    );
}

function Feature({ title, desc }) {
    return (
        <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm hover:border-emerald-200">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-50">
                <span className="h-4 w-4 rounded-full bg-emerald-600" />
            </div>
            <div className="mt-4 text-lg font-extrabold">{title}</div>
            <p className="mt-2 text-sm text-slate-600">{desc}</p>
        </div>
    );
}

function Step({ n, title, desc }) {
    return (
        <div className="rounded-3xl border border-green-100 bg-green-50 p-6">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-extrabold text-white">
                {n}
            </div>
            <div className="mt-4 text-lg font-extrabold">{title}</div>
            <p className="mt-2 text-sm text-slate-600">{desc}</p>
        </div>
    );
}

function PanelRow({ label, value }) {
    return (
        <div className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3">
            <div className="text-sm font-semibold text-slate-600">{label}</div>
            <div className="text-sm font-extrabold text-slate-900">{value}</div>
        </div>
    );
}

function MatchCard({ title, meta, seats }) {
    return (
        <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm hover:border-emerald-200">
            <div className="text-sm font-extrabold text-slate-900">{title}</div>
            <div className="mt-2 text-sm text-slate-600">{meta}</div>
            <div className="mt-4 inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
                {seats}
            </div>
            <a
                href="/matches"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
                Join
            </a>
        </div>
    );
}

function Faq({ q, a }) {
    return (
        <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
            <div className="text-base font-extrabold">{q}</div>
            <p className="mt-2 text-sm text-slate-600">{a}</p>
        </div>
    );
}

function FooterCol({ title, children }) {
    return (
        <div>
            <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                {title}
            </div>
            <div className="mt-3 flex flex-col gap-2">{children}</div>
        </div>
    );
}

function FooterLink({ href, label }) {
    return (
        <a
            href={href}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
            {label}
        </a>
    );
}

function Check() {
    return (
        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
        <path
            d="M20 6L9 17l-5-5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
      </svg>
    </span>
    );
}
