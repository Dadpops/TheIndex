"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError("Supabase is not configured. Add credentials to .env.local first.");
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = getBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <label className="mb-1 block text-sm text-text-secondary" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-text-secondary/60 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-text-secondary" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-text-secondary/60 focus:outline-none"
        />
      </div>

      {!isSupabaseConfigured ? (
        <p className="rounded-md border border-accent-muted/40 bg-accent/5 px-3 py-2 text-xs text-text-secondary">
          Supabase is not configured. The public site still works against the local seed — login is
          only needed for the CMS once a Supabase project is connected.
        </p>
      ) : null}

      {error ? <p className="text-sm text-marvel">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md border border-border bg-surface-alt px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:border-text-secondary/60 disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4">
      <Link href="/" className="display mb-1 text-3xl tracking-wide text-text-primary">
        THE INDEX
      </Link>
      <p className="mb-8 text-sm text-text-secondary">Content administration</p>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
