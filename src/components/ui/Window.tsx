type HeaderTone = "blue" | "terminal" | "lime";

const toneClasses: Record<HeaderTone, string> = {
  blue: "bg-blue text-white",
  terminal: "bg-terminal text-white",
  lime: "bg-lime text-text-primary",
};

/** Retro Window Container — the primary layout unit of the design system. */
export function Window({
  title,
  tone = "blue",
  children,
  className = "",
  actions,
}: {
  title: string;
  tone?: HeaderTone;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className={`border-2 border-border bg-surface shadow-[var(--shadow-hard-sm)] ${className}`}>
      <div className={`flex items-center justify-between border-b-2 border-border px-3 py-2 ${toneClasses[tone]}`}>
        <span className="font-mono-ui text-xs font-semibold uppercase tracking-wide">{title}</span>
        <div className="flex items-center gap-3">
          {actions}
          <span className="font-mono-ui text-xs opacity-70">_ &#9633; X</span>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
