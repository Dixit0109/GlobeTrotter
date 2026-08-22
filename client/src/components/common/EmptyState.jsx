import React from "react";
import { Compass } from "lucide-react";
import Button from "./Button";

const EmptyState = ({
  icon: Icon = Compass,
  title = "No data found",
  description = "Get started by adding your first item.",
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900/40 border border-slate-800/80 rounded-xl my-4">
      <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-full mb-3 border border-indigo-500/20">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-lg font-semibold text-white mb-1">{title}</h4>
      <p className="text-sm text-slate-400 max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
};

export default EmptyState;
