import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import Button from "./Button";

const ErrorMessage = ({
  message = "Something went wrong. Please try again.",
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center my-4">
      <AlertCircle className="w-8 h-8 text-rose-400 mb-2" />
      <p className="text-sm font-medium text-rose-300 mb-3">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;
