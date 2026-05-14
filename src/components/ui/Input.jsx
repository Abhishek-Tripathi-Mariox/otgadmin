import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Input({
  label,
  type = "text",
  placeholder = "",
  value = "",
  onChange,
  error = "",
  className = "",
  icon: Icon = null,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const effectiveType = isPassword && showPassword ? "text" : type;

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            {Icon}
          </div>
        )}
        <input
          type={effectiveType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-2.5 ${Icon ? "pl-10" : ""} ${
            isPassword ? "pr-10" : ""
          } bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white ${
            error ? "border-red-500 focus:ring-red-500" : ""
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-red-600 text-xs font-medium mt-1.5">{error}</p>
      )}
    </div>
  );
}
