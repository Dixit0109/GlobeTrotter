import React from "react";
import { Plane, Hotel, Ticket, UtensilsCrossed, Tag, Wallet } from "lucide-react";

const standardConfig = {
  transport: { label: "Transport", icon: Plane, color: "bg-blue-500", text: "text-blue-400" },
  stay: { label: "Accommodation / Stay", icon: Hotel, color: "bg-indigo-500", text: "text-indigo-400" },
  activities: { label: "Activities & Tours", icon: Ticket, color: "bg-purple-500", text: "text-purple-400" },
  meals: { label: "Meals & Dining", icon: UtensilsCrossed, color: "bg-emerald-500", text: "text-emerald-400" },
  other: { label: "Other / Misc", icon: Tag, color: "bg-slate-500", text: "text-slate-400" },
};

const getCategoryMeta = (catKey) => {
  if (standardConfig[catKey]) {
    return standardConfig[catKey];
  }
  // Custom Category Fallback
  return {
    label: catKey.charAt(0).toUpperCase() + catKey.slice(1),
    icon: Wallet,
    color: "bg-amber-500",
    text: "text-amber-400",
  };
};

const CategoryBreakdownCard = ({ categoryBreakdown = {}, totalCost = 0, currency = "USD" }) => {
  const symbol = currency === "INR" ? "₹" : "$";

  // Merge standard categories with any custom category keys present in categoryBreakdown
  const standardKeys = ["transport", "stay", "activities", "meals", "other"];
  const customKeys = Object.keys(categoryBreakdown).filter(
    (k) => !standardKeys.includes(k) && (categoryBreakdown[k] || 0) > 0
  );

  const allCategoryKeys = [...standardKeys, ...customKeys];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
      <h3 className="text-lg font-bold text-white tracking-tight">
        Category Breakdown
      </h3>

      <div className="space-y-4">
        {allCategoryKeys.map((catKey) => {
          const config = getCategoryMeta(catKey);
          const Icon = config.icon;
          const amount = categoryBreakdown[catKey] || 0;
          const percentage =
            totalCost > 0 ? Math.round((amount / totalCost) * 100) : 0;

          return (
            <div key={catKey} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-lg bg-slate-950 border border-slate-800 ${config.text}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-200 capitalize">{config.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 font-normal">{percentage}%</span>
                  <span className="text-slate-100 font-bold">
                    {symbol}
                    {amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${config.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBreakdownCard;
