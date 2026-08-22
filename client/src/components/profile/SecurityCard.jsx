import React from "react";
import { ShieldCheck, LogOut, Lock, Key } from "lucide-react";
import Button from "../common/Button";

const SecurityCard = ({ onLogout }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
      <div className="flex items-center space-x-2">
        <ShieldCheck className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-bold text-white tracking-tight">
          Account Security & Session
        </h3>
      </div>

      <div className="space-y-3">
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-semibold">Authentication Status</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold uppercase tracking-wider text-[10px]">
            Active JWT Session
          </span>
        </div>

        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
          <span className="text-slate-400 font-semibold flex items-center space-x-1.5">
            <Key className="w-3.5 h-3.5 text-indigo-400" />
            <span>Password & Credentials</span>
          </span>
          <p className="text-slate-400">
            Password management is handled through the current authentication system.
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          Ready to leave? Sign out of your current session.
        </span>
        <Button variant="danger" size="sm" onClick={onLogout}>
          <LogOut className="w-4 h-4 mr-1.5" /> Logout
        </Button>
      </div>
    </div>
  );
};

export default SecurityCard;
