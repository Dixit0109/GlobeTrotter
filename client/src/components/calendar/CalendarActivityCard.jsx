import React from "react";
import { Clock, MapPin, DollarSign, Tag, Edit2, Trash2 } from "lucide-react";

const CalendarActivityCard = ({
  activityEntry,
  stopId,
  city,
  onEdit,
  onRemove,
}) => {
  if (!activityEntry) return null;

  const actDoc = activityEntry.activity || {};
  const cityName = city?.name || actDoc.city?.name || "City";

  return (
    <div className="p-4 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl flex items-start justify-between space-x-4 transition-all shadow-md group">
      <div className="flex items-start space-x-3.5 min-w-0 flex-1">
        {actDoc.image ? (
          <img
            src={actDoc.image}
            alt={actDoc.name}
            className="w-14 h-14 rounded-xl object-cover flex-shrink-0 mt-0.5"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400 flex-shrink-0">
            <Tag className="w-6 h-6" />
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-bold text-white text-base truncate group-hover:text-indigo-400 transition-colors">
              {actDoc.name || "Activity"}
            </h4>
            {actDoc.type && (
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex-shrink-0">
                {actDoc.type}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center space-x-1 text-slate-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>{cityName}</span>
            </span>

            {activityEntry.scheduledTime && (
              <span className="flex items-center space-x-1 text-slate-200 font-semibold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{activityEntry.scheduledTime}</span>
              </span>
            )}

            {actDoc.duration && (
              <span>{actDoc.duration} mins</span>
            )}

            {actDoc.estimatedCost !== undefined && (
              <span className="text-emerald-400 font-bold">
                ${actDoc.estimatedCost}
              </span>
            )}
          </div>

          {activityEntry.notes && (
            <p className="text-xs text-slate-400 italic pt-1 border-l-2 border-indigo-500/40 pl-2">
              {activityEntry.notes}
            </p>
          )}
        </div>
      </div>

      {/* Item Controls */}
      <div className="flex items-center space-x-1 flex-shrink-0">
        <button
          onClick={() => onEdit(stopId, activityEntry)}
          aria-label="Edit activity"
          title="Edit activity"
          className="p-2 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-800 transition-colors border border-slate-800 bg-slate-950"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onRemove(stopId, activityEntry._id)}
          aria-label="Remove activity"
          title="Remove activity"
          className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors border border-slate-800 bg-slate-950"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default CalendarActivityCard;
