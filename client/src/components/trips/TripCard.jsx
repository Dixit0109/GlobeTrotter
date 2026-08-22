import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, DollarSign, Trash2, ArrowRight } from "lucide-react";
import Button from "../common/Button";

import VisibilityBadge from "../sharing/VisibilityBadge";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const TripCard = ({ trip, onDelete }) => {
  const navigate = useNavigate();

  const stopCount = trip.stops?.length || 0;
  const startDateStr = formatDate(trip.startDate);
  const endDateStr = formatDate(trip.endDate);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between group">
      <div>
        {/* Cover Image / Header */}
        <div className="h-40 bg-gradient-to-tr from-indigo-900 via-slate-800 to-purple-900 relative overflow-hidden">
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
          <div className="absolute top-3 right-3">
            <VisibilityBadge visibility={trip.visibility} />
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          <h3 className="text-lg font-bold text-white tracking-tight line-clamp-1 group-hover:text-indigo-400 transition-colors">
            {trip.name}
          </h3>

          {trip.description && (
            <p className="text-xs text-slate-400 line-clamp-2">
              {trip.description}
            </p>
          )}

          <div className="space-y-1.5 text-xs text-slate-400 pt-1">
            {(startDateStr || endDateStr) && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span>
                  {startDateStr} {endDateStr && `– ${endDateStr}`}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
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

      {/* Action Footer */}
      <div className="p-5 pt-0 flex items-center justify-between space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/trips/${trip._id}`)}
          className="flex-1 justify-center"
        >
          <span>View Trip</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Button>

        <button
          onClick={() => onDelete(trip)}
          aria-label="Delete trip"
          title="Delete trip"
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-slate-800 hover:border-rose-500/30"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TripCard;
