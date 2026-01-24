"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
  Settings,
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
      <div className="border-t p-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </div>
  );
}
