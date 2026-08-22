import React from "react";
import { Plane, Hotel, Ticket, UtensilsCrossed, Tag, Wallet, Edit2, Trash2 } from "lucide-react";

const categoryConfig = {
  transport: { label: "Transport", icon: Plane, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  stay: { label: "Stay", icon: Hotel, color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  activities: { label: "Activities", icon: Ticket, color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  meals: { label: "Meals", icon: UtensilsCrossed, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  other: { label: "Other", icon: Tag, color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const ExpenseRow = ({ expense, onEdit, onDelete }) => {
  const catKey = expense.category ? expense.category.toLowerCase() : "other";
  const cat = categoryConfig[catKey] || {
    label: expense.category,
    icon: Wallet,
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };
  const Icon = cat.icon;

  const currencyCode = expense.currency ? expense.currency.toUpperCase() : "USD";
  const symbol = currencyCode === "INR" ? "₹" : currencyCode === "EUR" ? "€" : currencyCode === "GBP" ? "£" : "$";

  return (
    <div className="p-3.5 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between space-x-3 transition-all">
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <div className={`p-2.5 rounded-xl border flex-shrink-0 ${cat.color}`}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-bold text-slate-200 text-sm capitalize truncate">
              {cat.label || expense.category}
            </h4>
            <span className="text-[10px] text-slate-400">
              {formatDate(expense.date)}
            </span>
          </div>

          {expense.description && (
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {expense.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3 flex-shrink-0">
        <div className="text-right">
          <span className="font-extrabold text-white text-base block">
            {symbol}
            {expense.amount.toLocaleString()}
          </span>
          <span className="text-[10px] font-semibold text-slate-500 uppercase block">
            {currencyCode}
          </span>
        </div>

        <div className="flex items-center space-x-1 border-l border-slate-800 pl-2">
          <button
            onClick={() => onEdit(expense)}
            aria-label="Edit expense"
            title="Edit expense"
            className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(expense)}
            aria-label="Delete expense"
            title="Delete expense"
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseRow;
