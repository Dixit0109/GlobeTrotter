import React from "react";
import { useLocation } from "react-router-dom";
import { Menu, LogOut, Compass } from "lucide-react";
import useAuth from "../../hooks/useAuth";

const routeTitleMap = {
  "/dashboard": "Dashboard",
  "/trips": "My Trips",
  "/create-trip": "Plan a Trip",
  "/discover": "Discover",
  "/budget": "Budget & Expense Tracker",
  "/calendar": "Trip Calendar",
  "/profile": "User Profile",
};

const Topbar = ({ onOpenMobile }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const currentTitle = routeTitleMap[location.pathname] || "GlobeTrotter";
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <header className="h-16 px-4 sm:px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        {/* Mobile menu trigger button */}
        <button
          onClick={onOpenMobile}
          aria-label="Open mobile menu"
          className="p-2 text-slate-400 hover:text-white rounded-lg border border-slate-800 bg-slate-950 md:hidden focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Branding on mobile */}
        <div className="flex items-center space-x-2 md:hidden">
          <div className="p-1.5 bg-indigo-600/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Compass className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="font-bold text-base bg-gradient-to-r from-indigo-400 to-violet-300 bg-clip-text text-transparent">
            GlobeTrotter
          </span>
        </div>

        {/* Page Context Title for Desktop */}
        <h1 className="text-lg font-bold text-white tracking-tight hidden md:block">
          {currentTitle}
        </h1>
      </div>

      {/* User profile & actions right side */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2.5 px-3 py-1.5 bg-slate-950/60 border border-slate-800/80 rounded-full">
          <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-xs">
            {userInitial}
          </div>
          <span className="text-xs font-medium text-slate-200 hidden sm:inline">
            {user?.name || "User"}
          </span>
        </div>

        <button
          onClick={logout}
          aria-label="Log out"
          title="Log out"
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-slate-800 bg-slate-950"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
