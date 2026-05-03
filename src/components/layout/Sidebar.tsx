"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  BookOpen,
  Archive,
  Settings,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/subscriptions", label: "Subscriptions", icon: BookOpen },
  { href: "/archive", label: "Archive", icon: Archive },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/invite", label: "Invite a Friend", icon: UserPlus },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col z-30">
      <div className="p-5 border-b border-[#2a2a2a]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-[#ff4500] font-bold text-lg leading-none">Reddit</span>
          <span className="text-[#f0f0f0] font-semibold text-sm leading-none">Newsletter</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname.startsWith(href)
                ? "bg-[#ff4500]/10 text-[#ff4500]"
                : "text-[#888888] hover:text-[#f0f0f0] hover:bg-[#f0f0f0]/5"
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-[#2a2a2a]">
        <UserButton
          appearance={{
            elements: {
              userButtonBox: "flex items-center gap-2 text-sm text-[#f0f0f0]",
            },
          }}
          showName
        />
      </div>
    </aside>
  );
}
