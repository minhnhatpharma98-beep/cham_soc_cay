"use client";

import { BookOpen, Fish, House, Sprout } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV = [
  { href: "/", label: "Hôm nay", icon: House },
  { href: "/cay", label: "Cây cảnh", icon: Sprout },
  { href: "/ho-ca", label: "Hồ cá", icon: Fish },
  { href: "/cam-nang", label: "Cẩm nang", icon: BookOpen },
];

const active = (path: string, href: string) => (href === "/" ? path === "/" : path.startsWith(href));

export function TopNav() {
  const path = usePathname();
  return (
    <nav className="hidden items-center gap-1 rounded-full border border-line bg-white/70 p-1 md:flex">
      {NAV.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
            active(path, n.href) ? "bg-brand-dark text-white shadow-soft" : "text-foreground/70 hover:text-foreground"
          }`}
        >
          <n.icon size={16} strokeWidth={1.75} />
          {n.label}
        </Link>
      ))}
    </nav>
  );
}

/** Floating bottom bar for phones. */
export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-3 bottom-3 z-20 grid grid-cols-4 rounded-2xl border border-line bg-white/90 p-1.5 shadow-lift backdrop-blur md:hidden">
      {NAV.map((n) => {
        const on = active(path, n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-medium transition ${
              on ? "bg-brand-soft text-brand-dark" : "text-muted"
            }`}
          >
            <n.icon size={20} strokeWidth={on ? 2.25 : 1.75} />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
