"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="sticky top-0 z-40 w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="font-semibold">
            Miamente
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" aria-label="Toggle theme">
              Light
            </Button>
            <Link href="/register">
              <Button>Crear cuenta</Button>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  const isDark = theme === "dark";
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-neutral-900/70 dark:supports-[backdrop-filter]:bg-neutral-900/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold">
          Miamente
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {isDark ? "Light" : "Dark"}
          </Button>
          <Link href="/register">
            <Button>Crear cuenta</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
