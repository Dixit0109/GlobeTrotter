import React, { useState } from "react";
import { User as UserIcon, Shield, Calendar, Mail } from "lucide-react";

const formatMemberSince = (dateStr) => {
  if (!dateStr) return "Member";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const ProfileHeader = ({ user }) => {
  const [imgError, setImgError] = useState(false);

  if (!user) return null;

  const initials = getInitials(user.name);
  const memberSince = formatMemberSince(user.createdAt);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
        {/* Avatar Image or Initials Fallback */}
        <div className="relative flex-shrink-0">
          {user.profilePhoto && !imgError ? (
            <img
              src={user.profilePhoto}
              alt={user.name}
              onError={() => setImgError(true)}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-xl"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold text-2xl flex items-center justify-center border-2 border-indigo-400/40 shadow-xl shadow-indigo-600/20">
              {initials}
            </div>
          )}

          {/* Role Badge Overlay */}
          <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950 border border-slate-800 text-indigo-400 shadow-md">
            {user.role || "user"}
          </div>
        </div>

        {/* User Details */}
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {user.name}
              </h2>
              <p className="text-sm text-slate-400 flex items-center justify-center sm:justify-start space-x-1.5 mt-1">
                <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </p>
            </div>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-950 border border-slate-800 text-slate-300 w-fit mx-auto sm:mx-0">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Member since {memberSince}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
