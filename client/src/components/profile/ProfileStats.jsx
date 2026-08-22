import React from "react";
import { Compass, MapPin, Clock, DollarSign } from "lucide-react";

const ProfileStats = ({ trips = [] }) => {
  const totalTrips = trips.length;

  const totalDestinations = trips.reduce(
    (sum, t) => sum + (t.stops?.length || 0),
    0
  );

  const totalActivities = trips.reduce((sum, t) => {
    const stopActs = (t.stops || []).reduce(
      (sSum, s) => sSum + (s.selectedActivities?.length || 0),
      0
    );
    return sum + stopActs;
  }, 0);

  const totalBudgetManaged = trips.reduce(
    (sum, t) => sum + (t.budgetLimit > 0 ? t.budgetLimit : 0),
    0
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Total Trips
          </span>
          <Compass className="w-4 h-4 text-indigo-400" />
        </div>
        <p className="text-2xl font-extrabold text-white">{totalTrips}</p>
        <span className="text-[10px] text-slate-400 block">Created travel plans</span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Destinations
          </span>
          <MapPin className="w-4 h-4 text-indigo-400" />
        </div>
        <p className="text-2xl font-extrabold text-white">{totalDestinations}</p>
        <span className="text-[10px] text-slate-400 block">City stops planned</span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Activities
          </span>
          <Clock className="w-4 h-4 text-indigo-400" />
        </div>
        <p className="text-2xl font-extrabold text-white">{totalActivities}</p>
        <span className="text-[10px] text-slate-400 block">Scheduled sights & tours</span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Budget Managed
          </span>
          <DollarSign className="w-4 h-4 text-emerald-400" />
        </div>
        <p className="text-2xl font-extrabold text-emerald-400">
          ${totalBudgetManaged.toLocaleString()}
        </p>
        <span className="text-[10px] text-slate-400 block">Combined target budget</span>
      </div>
    </div>
  );
};

export default ProfileStats;
