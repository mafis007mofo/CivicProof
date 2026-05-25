"use client";

import { Shield } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  return (
    <header
      className="fixed left-0 top-0 z-50 w-full border-b backdrop-blur-xl"
      style={{
        backgroundColor: "color-mix(in srgb, var(--bg-primary) 86%, transparent)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-85">
          <Shield className="h-5 w-5" style={{ color: "var(--accent-green)" }} />
          <span className="font-heading text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            CivicProof
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex text-sm font-medium transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            Dashboard
          </Link>
          <Link
            href="/cases/new"
            className="rounded-md px-3 py-2 text-sm font-semibold transition hover:scale-[1.02]"
            style={{
              backgroundColor: "var(--accent-green)",
              color: "var(--bg-primary)",
              boxShadow: "0 0 18px color-mix(in srgb, var(--accent-green) 24%, transparent)",
            }}
          >
            New Case
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
