"use client";

import Image from "next/image";
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
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90" aria-label="CivicProof home">
          <span className="brand-plate grid h-9 w-[150px] place-items-center overflow-hidden rounded-md px-2">
            <Image src="/logo.png" alt="CivicProof" width={150} height={42} priority className="h-7 w-auto object-contain" />
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-[var(--bg-elevated)]"
            style={{ color: "var(--text-muted)" }}
          >
            Dashboard
          </Link>
          <Link
            href="/cases/new"
            className="interactive-glow rounded-md px-3 py-2 text-sm font-semibold"
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
