import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "accent" | "danger" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary: "bg-blue text-white",
  accent: "bg-lime text-text-primary",
  danger: "bg-red text-white",
  ghost: "bg-surface text-text-primary",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(function Button({ variant = "primary", className = "", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 border-2 border-border px-4 py-2.5 font-mono-ui text-xs font-semibold uppercase tracking-wide shadow-[var(--shadow-hard-sm)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[var(--shadow-hard-md)] active:translate-x-0 active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[var(--shadow-hard-sm)] ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
});
