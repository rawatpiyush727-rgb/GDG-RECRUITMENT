import { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import gdgLogo from "@/assets/gdg-logo-cropped.png";

/**
 * Shared sidebar layout shell used by both admin and student layouts.
 *
 * Props:
 *   navItems    – [{ label, href, icon: LucideComponent }]
 *   accountSlot – ReactNode rendered in the sidebar account block
 *   children    – routed page content (<Outlet />)
 */
export default function SidebarLayout({ navItems = [], accountSlot, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mobileOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const sidebarContent = (
    <>
      {/* GDG Mark */}
      <div className="px-5 pt-6 pb-4">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-white font-bold text-sm tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4] rounded group"
        >
          <img
            src={gdgLogo}
            alt="GDG Logo"
            draggable={false}
            className="h-5 w-auto object-contain shrink-0 transition-transform duration-200 group-hover:scale-105"
          />
          <span className="tracking-[0.15em] text-[13px]">GDG ON CAMPUS</span>
        </Link>
      </div>

      {/* Account Block */}
      {accountSlot && (
        <div className="px-4 pb-4">
          {accountSlot}
        </div>
      )}

      {/* Separator */}
      <div className="h-px bg-white/[0.06] mx-4 mb-2" />

      {/* Navigation */}
      <nav aria-label="Sidebar navigation" className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/admin" || item.href === "/dashboard"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4]",
                  isActive
                    ? "bg-[#4285f4]/15 text-[#4285f4]"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                )
              }
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen w-full bg-[#080808] text-white flex">
      {/* ── Desktop sidebar (md+) ── */}
      <aside className="hidden md:flex md:flex-col md:w-[260px] md:shrink-0 md:fixed md:inset-y-0 md:left-0 bg-[#060608] border-r border-white/[0.06] z-40">
        {sidebarContent}
      </aside>

      {/* ── Mobile top bar + drawer (<md) ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-[#060608] border-b border-white/[0.06] flex items-center justify-between px-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-white font-bold text-xs tracking-wider"
        >
          <img
            src={gdgLogo}
            alt="GDG Logo"
            draggable={false}
            className="h-4.5 w-auto object-contain shrink-0"
          />
          <span className="tracking-[0.12em]">GDG</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle sidebar"
          aria-expanded={mobileOpen}
          className="p-1.5 rounded-md text-white/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4]"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-50 w-[280px] bg-[#060608] border-r border-white/[0.06] flex flex-col",
          "transition-transform duration-200 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* ── Main content area ── */}
      <main className="flex-1 md:ml-[260px] min-h-screen pt-14 md:pt-0">
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
