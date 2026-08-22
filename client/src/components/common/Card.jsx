import React from "react";

const Card = ({ children, title, subtitle, className = "", footer, ...props }) => {
  return (
    <div
      className={`bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg shadow-black/20 ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-white tracking-tight">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      )}
      <div>{children}</div>
      {footer && (
        <div className="mt-5 pt-4 border-t border-slate-800/80">{footer}</div>
      )}
    </div>
  );
};

export default Card;
