import React, { useEffect, useState } from "react";
import {
  Compass,
  MapPin,
  Activity,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Globe,
  DollarSign,
  Share2,
  LogOut,
  User,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import API from "../services/api";
import Button from "../components/common/Button";

export default function Home() {
  const { user, logout } = useAuth();
  const [healthStatus, setHealthStatus] = useState({
    loading: true,
    data: null,
    error: null,
  });

  useEffect(() => {
    API.get("/health")
      .then((res) => {
        setHealthStatus({ loading: false, data: res.data, error: null });
      })
      .catch((err) => {
        setHealthStatus({
          loading: false,
          data: null,
          error:
            err.response?.data?.message ||
            err.message ||
            "Failed to connect to backend",
        });
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-xl shadow-lg shadow-indigo-500/20">
              <Compass className="w-6 h-6 text-white animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-300 bg-clip-text text-transparent">
              GlobeTrotter
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800/60">
              <span className="text-slate-400 font-medium">API Health:</span>
              {healthStatus.loading ? (
                <span className="flex items-center text-amber-400">
                  <Activity className="w-3.5 h-3.5 animate-spin mr-1" />{" "}
                  Connecting...
                </span>
              ) : healthStatus.error ? (
                <span
                  className="flex items-center text-rose-400 font-semibold"
                  title={healthStatus.error}
                >
                  <AlertCircle className="w-3.5 h-3.5 mr-1" /> Offline
                </span>
              ) : (
                <span className="flex items-center text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Connected
                </span>
              )}
            </div>

            {user && (
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="text-sm font-medium text-slate-200 hidden sm:inline">
                    {user.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-slate-400 hover:text-rose-400"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content / Hero */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* User Welcome Header */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Authenticated Session Active</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Welcome,{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              {user?.name || "Traveler"}
            </span>
          </h1>

          <p className="text-lg text-slate-400 leading-relaxed">
            Your GlobeTrotter account is ready. Plan your itineraries, manage stop schedules, track expenses, and explore curated travel destinations.
          </p>
        </div>

        {/* User Info Card & Backend Connection Status */}
        <div className="mt-12 max-w-2xl mx-auto p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-indigo-400" />
              <h2 className="font-semibold text-slate-200">
                User Session Info
              </h2>
            </div>
            <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
              {user?.role || "User"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 text-xs block mb-1">Full Name</span>
              <span className="font-medium text-slate-200">{user?.name}</span>
            </div>
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 text-xs block mb-1">Email Address</span>
              <span className="font-medium text-slate-200">{user?.email}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Authentication Token & HTTP-Only Cookie Active</span>
            </div>
          </div>
        </div>

        {/* Feature Modules Preview */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition">
            <div className="p-3 w-fit rounded-xl bg-indigo-500/10 text-indigo-400 mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-200 text-lg mb-2">
              Multi-City Itinerary
            </h3>
            <p className="text-sm text-slate-400">
              Add, reorder, and schedule stops with customizable daily activities.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition">
            <div className="p-3 w-fit rounded-xl bg-violet-500/10 text-violet-400 mb-4">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-200 text-lg mb-2">
              Smart Budget Tracker
            </h3>
            <p className="text-sm text-slate-400">
              Live breakdown of transport, stays, & meals with over-budget alerts.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition">
            <div className="p-3 w-fit rounded-xl bg-purple-500/10 text-purple-400 mb-4">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-200 text-lg mb-2">
              Public Share & Discovery
            </h3>
            <p className="text-sm text-slate-400">
              Explore 20+ cities and activities or share read-only itinerary links.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
