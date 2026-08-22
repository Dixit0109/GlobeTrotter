import React from "react";
import {
  MapPin,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Clock,
  DollarSign,
  Tag,
} from "lucide-react";
import Button from "../common/Button";
import DestinationImage from "../common/DestinationImage";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const ItineraryStopCard = ({
  stop,
  index,
  totalStops,
  isOwner = true,
  onMoveUp,
  onMoveDown,
  onEditStop,
  onDeleteStop,
  onAddActivity,
  onEditActivity,
  onRemoveActivity,
}) => {
  const city = stop.city || {};
  const activities = stop.selectedActivities || [];

  const arrivalStr = formatDate(stop.arrivalDate);
  const departureStr = formatDate(stop.departureDate);

  const formatStopNum = (n) => (n < 9 ? `0${n + 1}` : `${n + 1}`);

  return (
    <div className="relative flex items-start space-x-4 sm:space-x-6 group">
      {/* Timeline Connector Pillar */}
      <div className="flex flex-col items-center flex-shrink-0 pt-1">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-sm flex items-center justify-center shadow-lg shadow-indigo-600/20 border border-indigo-400/30">
          {formatStopNum(index)}
        </div>
        {index < totalStops - 1 && (
          <div className="w-0.5 flex-1 bg-slate-800 my-2 group-hover:bg-slate-700 transition-colors" />
        )}
      </div>

      {/* Main Stop Card */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mb-8">
        {/* Stop Header Banner */}
        <div className="relative h-28 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 overflow-hidden border-b border-slate-800 p-4 flex items-center justify-between">
          <DestinationImage
            src={city.image}
            alt={city.name}
            className="absolute right-0 top-0 bottom-0 w-1/2 object-cover opacity-25 mask-linear-gradient"
          />

          <div className="relative z-10 space-y-1">
            <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>{city.country || "Destination"}</span>
            </div>
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              {city.name}
            </h3>
            {(arrivalStr || departureStr) && (
              <p className="text-xs text-slate-400 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {arrivalStr} &rarr; {departureStr}
                </span>
              </p>
            )}
          </div>

          {/* Controls: Reorder, Edit, Delete (Owner Only) */}
          {isOwner && (
            <div className="relative z-10 flex items-center space-x-1 bg-slate-950/80 backdrop-blur border border-slate-800/80 p-1 rounded-xl">
              <button
                onClick={() => onMoveUp(index)}
                disabled={index === 0}
                aria-label="Move stop up"
                title="Move up"
                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-slate-800 transition-all"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => onMoveDown(index)}
                disabled={index === totalStops - 1}
                aria-label="Move stop down"
                title="Move down"
                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-slate-800 transition-all"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-800 my-auto mx-0.5" />
              <button
                onClick={() => onEditStop(stop)}
                aria-label="Edit stop"
                title="Edit stop"
                className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-800 transition-all"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteStop(stop)}
                aria-label="Delete stop"
                title="Delete stop"
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Stop Content Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {stop.notes && (
            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs text-slate-300">
              <span className="font-semibold text-slate-400 block mb-0.5">
                Notes:
              </span>
              {stop.notes}
            </div>
          )}

          {/* Activities List Header */}
          <div className="flex items-center justify-between pt-1">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Activities ({activities.length})
            </h4>
            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddActivity(stop)}
                className="text-xs py-1"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Activity
              </Button>
            )}
          </div>

          {/* Activities Grid */}
          {activities.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2 text-center border border-dashed border-slate-800/80 rounded-xl">
              No activities added yet for {city.name}. Click "+ Add Activity" to schedule tours or sights.
            </p>
          ) : (
            <div className="space-y-2.5">
              {activities.map((actEntry) => {
                const actDoc = actEntry.activity || {};
                const actDateStr = formatDate(actEntry.scheduledDate);

                return (
                  <div
                    key={actEntry._id}
                    className="p-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl flex items-start justify-between space-x-3 transition-all"
                  >
                    <div className="flex items-start space-x-3 min-w-0 flex-1">
                      {actDoc.image && (
                        <img
                          src={actDoc.image}
                          alt={actDoc.name}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0 mt-0.5"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <h5 className="font-bold text-slate-200 text-sm truncate">
                            {actDoc.name || "Activity"}
                          </h5>
                          {actDoc.type && (
                            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex-shrink-0">
                              {actDoc.type}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                          {actDateStr && (
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              <span>{actDateStr}</span>
                            </span>
                          )}
                          {actEntry.scheduledTime && (
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>{actEntry.scheduledTime}</span>
                            </span>
                          )}
                          {actDoc.duration && (
                            <span>{actDoc.duration}m</span>
                          )}
                          {actDoc.estimatedCost !== undefined && (
                            <span className="text-emerald-400 font-medium">
                              ${actDoc.estimatedCost}
                            </span>
                          )}
                        </div>

                        {actEntry.notes && (
                          <p className="text-xs text-slate-400 italic mt-1 border-l-2 border-indigo-500/40 pl-2">
                            {actEntry.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Activity Item Actions (Owner Only) */}
                    {isOwner && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onEditActivity(stop._id, actEntry)}
                          aria-label="Edit activity"
                          title="Edit activity"
                          className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onRemoveActivity(stop._id, actEntry._id)}
                          aria-label="Remove activity"
                          title="Remove activity"
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItineraryStopCard;
