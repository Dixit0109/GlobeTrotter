import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, ArrowRight, DollarSign } from "lucide-react";
import Button from "../common/Button";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const TripPreviewCard = ({ trip }) => {
  const navigate = useNavigate();

  const stopCount = trip.stops?.length || 0;
  const startDateStr = formatDate(trip.startDate);
  const endDateStr = formatDate(trip.endDate);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between group">
      <div>
        {/* Cover Photo / Gradient */}
        <div className="h-36 bg-gradient-to-tr from-indigo-900 via-slate-800 to-purple-900 relative overflow-hidden">
          {trip.coverPhoto ? (
            <img
              src={trip.coverPhoto}
              alt={trip.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-20 text-indigo-300">
              <MapPin className="w-16 h-16" />
            </div>
          )}

          {/* Visibility Badge */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-950/80 backdrop-blur border border-slate-700/80 text-slate-200 capitalize">
            {trip.visibility || "private"}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 space-y-3">
          <h3 className="text-lg font-bold text-white tracking-tight line-clamp-1 group-hover:text-indigo-400 transition-colors">
            {trip.name}
          </h3>

          <div className="space-y-1.5 text-xs text-slate-400">
            {(startDateStr || endDateStr) && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span>
                  {startDateStr} {endDateStr && `– ${endDateStr}`}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span>
                  {stopCount} {stopCount === 1 ? "stop" : "stops"}
                </span>
              </div>

              {trip.budgetLimit > 0 && (
                <div className="flex items-center space-x-1 text-slate-300 font-medium">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Limit: ${trip.budgetLimit.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/trips")}
          className="w-full justify-between group-hover:border-indigo-500/50"
        >
          <span>View Trip</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default TripPreviewCard;
