import React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import Button from "../common/Button";

const formatDayLabel = (dateStr) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const DateNavigator = ({
  days = [],
  currentIndex = 0,
  onChangeIndex,
  onResetToStart,
}) => {
  if (days.length === 0) return null;

  const currentDayStr = days[currentIndex];
  const isFirstDay = currentIndex === 0;
  const isLastDay = currentIndex === days.length - 1;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xl">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-indigo-600/10 text-indigo-400 rounded-xl border border-indigo-500/20">
          <CalendarIcon className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">
            Day {currentIndex + 1} of {days.length}
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight">
            {formatDayLabel(currentDayStr)}
          </h3>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center space-x-2 justify-between sm:justify-end">
        {!isFirstDay && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetToStart}
            className="text-xs"
          >
            Trip Start
          </Button>
        )}

        <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 p-1 rounded-xl">
          <Button
            variant="ghost"
            size="sm"
            disabled={isFirstDay}
            onClick={() => onChangeIndex(currentIndex - 1)}
            aria-label="Previous day"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
          </Button>

          <div className="w-px h-4 bg-slate-800 mx-1" />

          <Button
            variant="ghost"
            size="sm"
            disabled={isLastDay}
            onClick={() => onChangeIndex(currentIndex + 1)}
            aria-label="Next day"
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DateNavigator;
