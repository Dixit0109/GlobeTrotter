import React from "react";

const Input = ({
  label,
  error,
  helperText,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  id,
  required = false,
  className = "",
  disabled = false,
  rightElement,
  ...props
}) => {
  const inputId = id || name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-300 mb-1.5"
        >
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          type={type}
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full px-3.5 py-2 ${
            rightElement ? "pr-10" : ""
          } bg-slate-950 border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
            error
              ? "border-rose-500 focus:ring-rose-500/30"
              : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 flex items-center justify-center text-slate-400 hover:text-slate-200">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
