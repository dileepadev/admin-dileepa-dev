"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { logout } from "@/app/actions/auth";
import {
  LayoutDashboard,
  User,
  Briefcase,
  GraduationCap,
  Calendar,
  Video,
  FileText,
  Users,
  Wrench,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "About", href: "/about", icon: User },
  { name: "Experiences", href: "/experiences", icon: Briefcase },
  { name: "Educations", href: "/educations", icon: GraduationCap },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Videos", href: "/videos", icon: Video },
  { name: "Blogs", href: "/blogs", icon: FileText },
  { name: "Communities", href: "/communities", icon: Users },
  { name: "Tools", href: "/tools", icon: Wrench },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={cn("flex h-full w-64 flex-col border-r bg-card", className)}>
      <div className="flex h-14 items-center border-b px-6">
        <span className="font-semibold tracking-tight">Admin Dashboard</span>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t p-4 space-y-1">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {mounted ? (
             theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
          ) : (
            <span className="h-4 w-4" /> // Placeholder to prevent layout shift
          )}
          <span>{mounted ? (theme === "dark" ? "Light Mode" : "Dark Mode") : "Toggle Theme"}</span>
        </button>
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

