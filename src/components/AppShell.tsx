"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/pouring", label: "Input Penuangan" },
  { href: "/admin/cases", label: "Master Case", leaderOnly: true },
  { href: "/admin/history", label: "History", leaderOnly: true },
];

export function AppShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role: "OPERATOR" | "LEADER";
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b-2 border-border bg-terminal text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="font-display text-lg font-extrabold uppercase tracking-tight">
              INGOT_CASE_MONITOR
            </span>
            <nav className="flex flex-wrap gap-1">
              {NAV.filter((item) => !item.leaderOnly || role === "LEADER").map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`border-2 border-transparent px-3 py-1.5 font-mono-ui text-xs font-semibold uppercase tracking-wide ${
                    pathname.startsWith(item.href) ? "border-lime text-lime" : "text-white/80 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 font-mono-ui text-xs">
            <Button variant="danger" className="px-3 py-1.5" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
