import React from "react";
import { AlertTriangle, CheckCircle2, DollarSign, Calendar, TrendingUp } from "lucide-react";

const BudgetSummaryCard = ({ budgetData }) => {
  if (!budgetData) return null;

  const {
    totalCost = 0,
    budgetLimit,
    remainingBudget,
    averageDailyCost = 0,
    numberOfTripDays = 1,
    isOverBudget = false,
    currency = "USD",
    hasMultipleCurrencies = false,
    currencyWarning,
  } = budgetData;

  const symbol = currency === "INR" ? "₹" : "$";

  const percentSpent =
    budgetLimit && budgetLimit > 0
      ? Math.min(100, Math.round((totalCost / budgetLimit) * 100))
      : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
      {/* Top Warning Banner if Over Budget */}
      {isOverBudget ? (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>WARNING: Expenses have exceeded your trip budget limit!</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-200 border border-rose-500/30 uppercase tracking-wider font-bold">
            OVER BUDGET
          </span>
        </div>
      ) : budgetLimit ? (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Your trip spending is on track and within budget limit.</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 uppercase tracking-wider font-bold">
            ON TRACK
          </span>
        </div>
      ) : null}

      {hasMultipleCurrencies && currencyWarning && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl text-xs">
          {currencyWarning}
        </div>
      )}

      {/* Main Financial Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">
            Total Spent
          </span>
          <p className="text-2xl font-extrabold text-white">
            {symbol}
            {totalCost.toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">
            Budget Limit
          </span>
          <p className="text-2xl font-extrabold text-slate-200">
            {budgetLimit ? `${symbol}${budgetLimit.toLocaleString()}` : "N/A"}
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">
            Remaining
          </span>
          <p
            className={`text-2xl font-extrabold ${
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
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">
            Avg Daily Cost
          </span>
          <p className="text-2xl font-extrabold text-indigo-400">
            {symbol}
            {averageDailyCost.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400 block">
            Over {numberOfTripDays} {numberOfTripDays === 1 ? "day" : "days"}
          </span>
        </div>
      </div>

      {/* Visual Progress Bar */}
      {budgetLimit && budgetLimit > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">
              Budget Usage Progress ({percentSpent}%)
            </span>
            <span className="text-slate-400">
              {symbol}
              {totalCost.toLocaleString()} of {symbol}
              {budgetLimit.toLocaleString()}
            </span>
          </div>

          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget
                  ? "bg-rose-500 shadow-lg shadow-rose-500/50"
                  : percentSpent > 80
                  ? "bg-amber-500"
                  : "bg-gradient-to-r from-indigo-500 to-emerald-400"
              }`}
              style={{ width: `${Math.min(100, percentSpent)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetSummaryCard;
