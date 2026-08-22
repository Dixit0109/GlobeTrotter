import React from "react";
import { DollarSign, AlertTriangle, CheckCircle2 } from "lucide-react";

const BudgetHighlightCard = ({ tripName, budgetData }) => {
  if (!budgetData) return null;

  const {
    totalCost = 0,
    budgetLimit,
    remainingBudget,
    isOverBudget = false,
    currency = "USD",
  } = budgetData;

  const symbol = currency === "INR" ? "₹" : "$";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-md">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-100 text-sm truncate max-w-[200px]">
          {tripName}
        </h4>
        {isOverBudget ? (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Over Budget</span>
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>On Track</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
          <span className="text-[10px] text-slate-500 block uppercase font-medium">
            Total Spent
          </span>
          <span className="text-sm font-bold text-slate-200">
            {symbol}
            {totalCost.toLocaleString()}
          </span>
        </div>

        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
          <span className="text-[10px] text-slate-500 block uppercase font-medium">
            Budget Limit
          </span>
          <span className="text-sm font-bold text-slate-200">
            {budgetLimit ? `${symbol}${budgetLimit.toLocaleString()}` : "N/A"}
          </span>
        </div>

        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
          <span className="text-[10px] text-slate-500 block uppercase font-medium">
            Remaining
          </span>
          <span
            className={`text-sm font-bold ${
              isOverBudget
                ? "text-rose-400"
                : remainingBudget !== null
                ? "text-emerald-400"
                : "text-slate-400"
            }`}
          >
            {remainingBudget !== null
              ? `${symbol}${remainingBudget.toLocaleString()}`
              : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetHighlightCard;
