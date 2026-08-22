import React from "react";
import { User as UserIcon, Mail, Shield, Globe, Calendar, Info } from "lucide-react";

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const AccountInfoCard = ({ user }) => {
  if (!user) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white tracking-tight">
          Account Information
        </h3>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-indigo-400 capitalize">
          {user.role || "user"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-500 font-semibold uppercase tracking-wider block flex items-center space-x-1.5">
            <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Full Name</span>
          </span>
          <p className="text-slate-200 font-bold text-sm">{user.name}</p>
        </div>

        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-500 font-semibold uppercase tracking-wider block flex items-center space-x-1.5">
            <Mail className="w-3.5 h-3.5 text-indigo-400" />
            <span>Email Address</span>
          </span>
          <p className="text-slate-200 font-bold text-sm truncate">{user.email}</p>
        </div>

        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-500 font-semibold uppercase tracking-wider block flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>Language Preference</span>
          </span>
          <p className="text-slate-200 font-bold text-sm uppercase">
            {user.languagePreference === "en" ? "English (en)" : user.languagePreference || "English (en)"}
          </p>
        </div>

        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-500 font-semibold uppercase tracking-wider block flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>Member Since</span>
          </span>
          <p className="text-slate-200 font-bold text-sm">
            {formatDate(user.createdAt)}
          </p>
        </div>
      </div>

      {/* Profile Editing Informational Notice */}
      <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-start space-x-3 text-xs text-indigo-300">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-indigo-400" />
        <div className="space-y-0.5">
          <p className="font-semibold text-indigo-200">Profile Editing Notice</p>
          <p className="text-slate-400">
            Your profile information is currently managed through your account registration. Direct profile editing and settings updates will be available in a future update.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountInfoCard;
