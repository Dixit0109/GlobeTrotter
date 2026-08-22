import React from "react";
import { MapPin, Plus, Sparkles } from "lucide-react";
import CalendarActivityCard from "./CalendarActivityCard";
import Button from "../common/Button";

const DayView = ({
  dayStr,
  activeStop,
  dayActivities = [],
  onEditActivity,
  onRemoveActivity,
  onAddActivity,
}) => {
  const city = activeStop?.city || {};

  return (
    <div className="space-y-6">
      {/* City Context Header Banner */}
      {activeStop ? (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-3">
            {city.image && (
              <img
                src={city.image}
                alt={city.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-700/80"
              />
            )}
            <div>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">
                Active Destination Stop
              </span>
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                {city.name}, {city.country}
              </h3>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddActivity(activeStop)}
          >
            <Plus className="w-4 h-4 mr-1" /> Add Activity
          </Button>
        </div>
      ) : (
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-xs text-slate-400 flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-slate-500" />
            <span>No specific destination stop assigned for this calendar date.</span>
          </span>
        </div>
      )}

      {/* Activities List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Scheduled Activities ({dayActivities.length})
          </h4>
        </div>

        {dayActivities.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl space-y-3">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-full w-fit mx-auto border border-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">
              No activities planned
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              This day is free. Schedule tours, food walks, or sights to build your daily travel routine.
            </p>
            {activeStop && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddActivity(activeStop)}
              >
                <Plus className="w-4 h-4 mr-1" /> Add Activity
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {dayActivities.map((actItem) => (
              <CalendarActivityCard
                key={actItem.entry._id}
                activityEntry={actItem.entry}
                stopId={actItem.stopId}
                city={actItem.city}
                onEdit={onEditActivity}
                onRemove={onRemoveActivity}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DayView;
