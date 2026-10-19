"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password" | string;
  placeholder?: string;
  minLength?: number;
  id?: string;
  disabled?: boolean;
}

/**
 * Enterprise Password Input:
 * Granular browser autofill control:
 * - Prevents background auto-population before user explicitly clicks or focuses the input.
 * - Enforces proper autoComplete tags ('current-password' / 'new-password').
 * - Toggles password visibility without rogue autofocus.
 */
export function PasswordInput({
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
  minLength = 8,
  id,
  disabled = false,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <label htmlFor={id} className="block text-sm font-semibold text-slate-800">
      {label}
      <div className="relative mt-1.5">
        <input
          id={id}
          required
          disabled={disabled}
          minLength={minLength}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          readOnly={!isFocused && !value}
          onFocus={() => setIsFocused(true)}
          onClick={() => setIsFocused(true)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-brand-green focus:ring-2 focus:ring-brand-green/15 disabled:bg-slate-50 disabled:text-slate-400"
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:text-slate-700"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </label>
  );
}
