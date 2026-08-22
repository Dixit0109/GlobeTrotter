import React from "react";
import { Calendar as CalendarIcon, MapPin, Plus } from "lucide-react";
import CalendarActivityCard from "./CalendarActivityCard";
import Button from "../common/Button";

const formatTimelineDate = (dateStr) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const TimelineView = ({
  days = [],
  stopsMap = {}, // { [dateStr]: activeStop }
  dayActivitiesMap = {}, // { [dateStr]: [ { entry, stopId, city } ] }
  onEditActivity,
  onRemoveActivity,
  onAddActivity,
}) => {
  return (
    <div className="space-y-6 pt-2">
      {days.map((dayStr, idx) => {
        const activeStop = stopsMap[dayStr];
        const dayActivities = dayActivitiesMap[dayStr] || [];
        const city = activeStop?.city || {};

        return (
          <div
            key={dayStr}
            className="relative flex items-start space-x-4 sm:space-x-6 group"
          >
            {/* Timeline Line Connector */}
            <div className="flex flex-col items-center flex-shrink-0 pt-1">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-indigo-400 font-bold text-xs flex items-center justify-center border border-slate-800 group-hover:border-indigo-500 transition-colors shadow-md">
                {idx + 1}
              </div>
              {idx < days.length - 1 && (
                <div className="w-0.5 flex-1 bg-slate-800/80 my-2 group-hover:bg-indigo-500/30 transition-colors" />
              )}
            </div>

            {/* Day Block */}
            <div className="flex-1 space-y-3 mb-6">
              {/* Day & City Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-900 border border-slate-800 rounded-xl gap-2">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-white text-sm sm:text-base">
                    {formatTimelineDate(dayStr)}
                  </span>
                  {activeStop && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-indigo-400" />
                      <span>{city.name}</span>
                    </span>
                  )}
                </div>

                {activeStop && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddActivity(activeStop)}
                    className="text-xs text-slate-400 hover:text-indigo-400 justify-start sm:justify-center"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Activity
                  </Button>
                )}
              </div>

              {/* Day Activities */}
              {dayActivities.length === 0 ? (
                <div className="p-3.5 text-xs text-slate-500 italic bg-slate-950/40 border border-slate-800/60 rounded-xl">
                  No activities planned for this day.
                </div>
              ) : (
                <div className="space-y-2.5">
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
      })}
    </div>
  );
};

export default TimelineView;
