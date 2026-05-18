"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListPlus,
  PieChart,
  Target,
  Moon,
  Sun,
  Monitor,
  LogOut,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useSession, signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/transactions", label: "내역", icon: ListPlus },
  { href: "/analysis", label: "분석", icon: PieChart },
  { href: "/budget", label: "예산", icon: Target },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  const themeOptions: { value: "light" | "dark" | "system"; icon: typeof Sun }[] = [
    { value: "light", icon: Sun },
    { value: "dark", icon: Moon },
    { value: "system", icon: Monitor },
  ];

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[220px] flex-col bg-bg-secondary border-r border-border z-50">
        <div className="p-6 pb-2">
          <h1 className="font-display text-2xl italic text-accent">Cashbook</h1>
          <p className="text-xs text-tx-tertiary mt-0.5">나의 가계부</p>
          {session?.user && (
            <p className="text-xs text-tx-secondary mt-2 truncate">
              {session.user.email}
            </p>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? "bg-accent-light text-accent font-medium"
                    : "text-tx-secondary hover:text-tx-primary hover:bg-bg-tertiary"
                }`}
              >
                <item.icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-3">
          <div className="flex bg-bg-tertiary rounded-lg p-1 gap-0.5">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-all ${
                  theme === opt.value
                    ? "bg-bg-primary text-tx-primary shadow-sm"
                    : "text-tx-tertiary hover:text-tx-secondary"
                }`}
                aria-label={opt.value}
              >
                <opt.icon size={14} />
              </button>
            ))}
          </div>

          {session && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm text-tx-secondary hover:text-tx-primary hover:bg-bg-tertiary transition-all"
            >
              <LogOut size={16} />
              로그아웃
            </button>
          )}
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-primary border-t border-border z-50 flex">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] transition-all ${
                active ? "text-accent" : "text-tx-tertiary"
              }`}
            >
              <item.icon size={20} strokeWidth={active ? 2.2 : 1.6} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
