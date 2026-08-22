import React from "react";
import useAuth from "../../hooks/useAuth";
import { Sparkles } from "lucide-react";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const WelcomeSection = () => {
  const { user } = useAuth();
  const greeting = getGreeting();

  return (
    <div className="bg-gradient-to-r from-indigo-900/40 via-slate-900 to-violet-900/30 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
      <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Travel Dashboard</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          {greeting},{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-300 bg-clip-text text-transparent">
            {user?.name || "Traveler"}
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-xl">
          Plan your next adventure, track live budgets, and explore top destinations across the globe.
        </p>
      </div>
    </div>
  );
};

export default WelcomeSection;
