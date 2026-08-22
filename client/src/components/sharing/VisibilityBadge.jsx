import React from "react";
import { Lock, Globe, Users } from "lucide-react";

const config = {
  private: {
    label: "Private",
    icon: Lock,
    className: "bg-slate-800 text-slate-300 border-slate-700",
  },
  public: {
    label: "Public",
    icon: Globe,
    className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  },
  shared: {
    label: "Shared",
    icon: Users,
    className: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
  },
};

const VisibilityBadge = ({ visibility = "private", className = "" }) => {
  const item = config[visibility] || config.private;
  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${item.className} ${className}`}
    >
      <Icon className="w-3 h-3 flex-shrink-0" />
      <span className="capitalize">{item.label}</span>
    </span>
  );
};

export default VisibilityBadge;
