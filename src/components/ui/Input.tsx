import { InputHTMLAttributes, SelectHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return (
      <input
        ref={ref}
        className={`w-full border-2 border-border bg-white px-3 py-2 font-mono-ui text-sm focus:shadow-[var(--shadow-hard-md)] focus:outline-none ${className}`}
        {...props}
      />
    );
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className = "", ...props }, ref) {
    return (
      <select
        ref={ref}
        className={`w-full border-2 border-border bg-white px-3 py-2 font-mono-ui text-sm focus:shadow-[var(--shadow-hard-md)] focus:outline-none ${className}`}
        {...props}
      />
    );
  },
);

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block font-mono-ui text-xs font-semibold uppercase tracking-wide text-text-muted">{children}</label>;
}
