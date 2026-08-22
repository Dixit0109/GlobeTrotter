import React from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, MapPin, Compass } from "lucide-react";
import Button from "../common/Button";

const SavedDestinationsCard = ({ savedDestinations = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
      <div className="flex items-center space-x-2">
        <Bookmark className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-bold text-white tracking-tight">
          Saved Destinations ({savedDestinations.length})
        </h3>
      </div>

      {savedDestinations.length === 0 ? (
        <div className="p-6 text-center bg-slate-950/60 border border-dashed border-slate-800 rounded-xl space-y-3">
          <MapPin className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-xs text-slate-400">
            No saved destinations yet. Explore cities and cataloged travel spots.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/discover")}
          >
            <Compass className="w-3.5 h-3.5 mr-1.5" /> Discover Destinations
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 pt-1">
          {savedDestinations.map((dest, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-indigo-300 flex items-center space-x-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>{dest}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedDestinationsCard;
