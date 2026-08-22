import React from "react";
import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ label = "Loading...", fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
      {label && <p className="text-sm font-medium text-slate-400">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
