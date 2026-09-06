"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Window } from "@/components/ui/Window";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Login gagal");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-bg p-4">
      <Window title="LOGIN.SH" tone="terminal" className="w-full max-w-sm">
        <h1 className="mb-1 font-display text-xl font-extrabold uppercase">Ingot Case Monitor_</h1>
        <p className="mb-4 font-body text-sm text-text-muted">Monitoring tonase pouring line</p>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div>
            <Label>Username</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus required />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && (
            <p className="border-2 border-border bg-red px-3 py-2 font-mono-ui text-xs font-semibold text-white">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </Window>
    </div>
  );
}
