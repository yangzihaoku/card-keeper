"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  LayoutDashboard,
  Shield,
  Bell,
  Settings,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/", label: "总览", icon: LayoutDashboard },
  { href: "/cards", label: "卡片", icon: CreditCard },
  { href: "/insurance", label: "保险对比", icon: Shield },
  { href: "/spending", label: "消费追踪", icon: TrendingUp },
  { href: "/changes", label: "权益变动", icon: Bell },
  { href: "/settings", label: "设置", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Mobile header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-[hsl(var(--card))]/80 backdrop-blur-xl border-b border-[hsl(var(--border))] md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[hsl(var(--primary))]" />
          <span className="font-bold">Card Keeper</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      <div className="flex">
        {/* Sidebar - desktop */}
        <aside className="hidden md:flex md:w-56 md:flex-col md:fixed md:inset-y-0 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <div className="flex items-center gap-2 px-6 py-5 border-b border-[hsl(var(--border))]">
            <CreditCard className="w-6 h-6 text-[hsl(var(--primary))]" />
            <span className="text-lg font-bold">Card Keeper</span>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Mobile nav overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            <nav className="absolute top-14 left-0 right-0 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] p-3 space-y-1 shadow-lg">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                      : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 md:ml-56">
          <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-[hsl(var(--card))]/90 backdrop-blur-xl border-t border-[hsl(var(--border))] py-2 md:hidden">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-xs transition-colors",
              pathname === item.href
                ? "text-[hsl(var(--primary))]"
                : "text-[hsl(var(--muted-foreground))]"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
