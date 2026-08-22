import React from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Compass, Globe } from "lucide-react";
import Button from "../common/Button";

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <button
        onClick={() => navigate("/create-trip")}
        className="flex items-center justify-between p-4 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 rounded-xl transition-all text-left group"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-lg group-hover:scale-105 transition-transform shadow-md shadow-indigo-600/20">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-100 text-sm">Plan a Trip</h4>
            <p className="text-xs text-slate-400">Create new itinerary</p>
          </div>
        </div>
      </button>

      <button
        onClick={() => navigate("/trips")}
        className="flex items-center justify-between p-4 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all text-left group"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-slate-800 text-slate-200 rounded-lg group-hover:scale-105 transition-transform border border-slate-700">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-100 text-sm">My Trips</h4>
            <p className="text-xs text-slate-400">View saved itineraries</p>
          </div>
        </div>
      </button>

      <button
        onClick={() => navigate("/discover")}
        className="flex items-center justify-between p-4 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all text-left group"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-slate-800 text-slate-200 rounded-lg group-hover:scale-105 transition-transform border border-slate-700">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-100 text-sm">
              Discover Destinations
            </h4>
            <p className="text-xs text-slate-400">Explore 20+ cities</p>
          </div>
        </div>
      </button>
    </div>
  );
};

export default QuickActions;
