"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { TheIndexLogo } from "@/components/ui/TheIndexLogo";

const NAV = [
  { href: "/dc", label: "DC" },
  { href: "/marvel", label: "Marvel" },
  { href: "/image", label: "Image" },
  { href: "/boom", label: "BOOM!" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // "/" focuses search from anywhere (unless typing in a field).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || el?.isContentEditable) return;
      e.preventDefault();
      router.push("/search");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" aria-label="The Index — home" className="shrink-0 text-text-primary transition-opacity hover:opacity-80">
          <TheIndexLogo className="h-8 w-auto" />
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium transition-colors duration-150",
                  active ? "text-text-primary" : "text-text-secondary hover:text-text-primary",
                )}
              >
                {item.label}
                {active ? (
                  <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/search"
          className={cn(
            "ml-auto inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-sm transition-colors duration-150 hover:border-text-secondary",
            isActive("/search") ? "text-text-primary" : "text-text-secondary",
          )}
        >
          <Search className="size-4" />
          <span className="hidden md:inline">Search</span>
          <kbd className="hidden rounded border border-border bg-surface-alt px-1.5 py-0.5 font-mono text-[10px] text-text-secondary md:inline">
            /
          </kbd>
        </Link>
      </div>
    </header>
  );
}
