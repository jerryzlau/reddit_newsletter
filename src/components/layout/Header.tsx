"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";

const breadcrumbs: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/subscriptions": "Subscriptions",
  "/archive": "Archive",
  "/settings": "Settings",
  "/invite": "Invite a Friend",
};

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const crumb =
    Object.entries(breadcrumbs).find(([path]) => pathname.startsWith(path))?.[1] ?? "";

  return (
    <>
      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#1a1a1a] border-b border-[#2a2a2a] sticky top-0 z-20">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-[#f0f0f0] p-1"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/dashboard" className="text-[#ff4500] font-bold text-base">
          Reddit Newsletter
        </Link>
        <div className="w-7" />
      </header>

      {/* Desktop breadcrumb */}
      <div className="hidden md:flex items-center h-14 px-6 border-b border-[#2a2a2a]">
        <span className="text-[#f0f0f0] font-semibold text-sm">{crumb}</span>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-60 h-full">
            <Sidebar />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-[#888888] hover:text-[#f0f0f0] z-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
