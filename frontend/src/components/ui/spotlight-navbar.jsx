import { useEffect, useRef, useState, useMemo } from "react";
import { animate } from "motion";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Menu, X, LayoutDashboard, LogOut, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import gdgLogo from "@/assets/gdg-logo-cropped.png";

function MinimalUserIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4.5" />
      <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}

export function SpotlightNavbar({
  items,
  className,
  onItemClick,
  defaultActiveIndex,
}) {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navRef = useRef(null);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const [hoverX, setHoverX] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const spotlightX = useRef(0);
  const ambienceX = useRef(0);

  // Compute navigation links — no Admin link in the navbar for any user;
  // admins reach the admin page via the Dashboard link in the profile dropdown.
  const navItems = useMemo(() => {
    const list = items || [
      { label: "Home", href: "/" },
      { label: "Departments", href: "/departments" },
      { label: "About", href: "https://www.gdgnsut.com/", isExternal: true },
    ];
    return list.map((item) => {
      if (item.label === "About") {
        return {
          ...item,
          href: "https://www.gdgnsut.com/",
          isExternal: true,
        };
      }
      return item;
    });
  }, [items]);

  // Determine active index from location
  const currentActiveIndex = useMemo(() => {
    if (defaultActiveIndex !== undefined) return defaultActiveIndex;
    const path = location.pathname;

    // When on admin or dashboard routes, highlight user profile icon
    if (path.startsWith("/admin") || path.startsWith("/dashboard")) {
      return "user";
    }

    const index = navItems.findIndex((item) => {
      if (item.isExternal || item.href.startsWith("http")) return false;
      if (item.href === "/" && path === "/") return true;
      if (item.href !== "/" && path.startsWith(item.href)) return true;
      return false;
    });
    return index >= 0 ? index : -1;
  }, [location.pathname, navItems, defaultActiveIndex]);

  const activeIndex = currentActiveIndex;

  // Check prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Track mouse movement across navbar
  useEffect(() => {
    if (!navRef.current) return;
    const nav = navRef.current;

    const handleMouseMove = (e) => {
      const rect = nav.getBoundingClientRect();
      const x = e.clientX - rect.left;
      setHoverX(x);
      spotlightX.current = x;
      nav.style.setProperty("--spotlight-x", `${x}px`);
    };

    const handleMouseLeave = () => {
      setHoverX(null);
      const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);
      if (!activeItem) return;

      const navRect = nav.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      const targetX = itemRect.left - navRect.left + itemRect.width / 2;

      if (prefersReducedMotion) {
        spotlightX.current = targetX;
        nav.style.setProperty("--spotlight-x", `${targetX}px`);
        return;
      }

      animate(spotlightX.current, targetX, {
        type: "spring",
        stiffness: 200,
        damping: 20,
        onUpdate: (value) => {
          spotlightX.current = value;
          nav.style.setProperty("--spotlight-x", `${value}px`);
        },
      });
    };

    nav.addEventListener("mousemove", handleMouseMove);
    nav.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      nav.removeEventListener("mousemove", handleMouseMove);
      nav.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [activeIndex, prefersReducedMotion]);

  // Move active ambience underneath active item
  useEffect(() => {
    if (!navRef.current) return;
    const nav = navRef.current;
    const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);
    if (!activeItem) return;

    const navRect = nav.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    const targetX = itemRect.left - navRect.left + itemRect.width / 2;

    if (prefersReducedMotion) {
      ambienceX.current = targetX;
      nav.style.setProperty("--ambience-x", `${targetX}px`);
      return;
    }

    animate(ambienceX.current, targetX, {
      type: "spring",
      stiffness: 200,
      damping: 20,
      onUpdate: (value) => {
        ambienceX.current = value;
        nav.style.setProperty("--ambience-x", `${value}px`);
      },
    });
  }, [activeIndex, prefersReducedMotion, navItems]);

  // Handle click outside and Escape key for avatar dropdown
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setDropdownOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Handle Escape key for mobile menu
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  const handleItemClick = (item, index, event) => {
    onItemClick?.(item, index);

    if (item.isExternal || item.href.startsWith("http")) {
      // External navigation: allow browser to open in new tab natively without React Router
      return;
    }

    event.preventDefault();

    if (item.href.startsWith("/")) {
      navigate(item.href);
      return;
    }

    const target = document.querySelector(item.href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMobileOpen(false);
    navigate("/", { replace: true });
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <header className={cn("relative flex justify-center pt-6 px-4 z-50", className)}>
      {/* ── Desktop Floating Pill Navbar (md and up) ── */}
      <div className="relative hidden md:block">
        <nav
          ref={navRef}
          aria-label="Main Navigation"
          className={cn(
            "spotlight-nav",
            "relative h-11 rounded-full",
            "border border-white/10",
            "bg-black/50 backdrop-blur-xl",
            "shadow-[0_0_30px_rgba(66,133,244,0.08)]",
            "flex items-center px-1"
          )}
        >
          {/* Mouse-following spotlight & active glow container */}
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <div
              className="absolute inset-0 z-[1] transition-opacity duration-300 pointer-events-none"
              style={{
                opacity: hoverX !== null ? 1 : 0,
                background: `
                  radial-gradient(
                    120px circle at var(--spotlight-x) 100%,
                    rgba(66, 133, 244, 0.20) 0%,
                    rgba(66, 133, 244, 0.08) 35%,
                    transparent 70%
                  )
                `,
              }}
            />
            <div
              className="absolute bottom-0 left-0 z-[2] h-[2px] w-full pointer-events-none"
              style={{
                background: `
                  radial-gradient(
                    65px circle at var(--ambience-x) 0%,
                    rgba(66, 133, 244, 1) 0%,
                    rgba(66, 133, 244, 0.25) 35%,
                    transparent 100%
                  )
                `,
              }}
            />
          </div>

          {/* Navigation links */}
          <ul className="relative z-10 flex h-full items-center gap-0 px-1">
            {navItems.map((item, index) => (
              <li
                key={item.href}
                className="relative flex h-full items-center justify-center"
              >
                <a
                  href={item.href}
                  data-index={index}
                  target={item.isExternal ? "_blank" : undefined}
                  rel={item.isExternal ? "noopener noreferrer" : undefined}
                  aria-label={
                    item.isExternal
                      ? `${item.label} (opens official website in new tab)`
                      : undefined
                  }
                  title={
                    item.isExternal
                      ? "Opens official GDG NSUT website in a new tab"
                      : undefined
                  }
                  onClick={(event) => handleItemClick(item, index, event)}
                  className={cn(
                    "group inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-medium",
                    "transition-colors duration-200",
                    "focus-visible:outline-none",
                    "focus-visible:ring-2 focus-visible:ring-[#4285f4]",
                    activeIndex === index
                      ? "text-white font-semibold"
                      : "text-white/60 hover:text-white"
                  )}
                >
                  <span>{item.label}</span>
                  {item.isExternal && (
                    <ArrowUpRight
                      className="h-3.5 w-3.5 text-white/50 group-hover:text-white transition-colors duration-200 -mr-0.5"
                      aria-hidden="true"
                    />
                  )}
                </a>
              </li>
            ))}
          </ul>

          {/* Separator */}
          <div className="h-4 w-px bg-white/10 mx-1 z-10" />

          {/* Auth slot */}
          <div className="relative z-10 px-1 flex items-center">
            {loading ? (
              // Loading skeleton matching button size
              <div
                data-testid="navbar-auth-skeleton"
                className="h-5 w-14 rounded-full bg-white/10 animate-pulse my-1"
                aria-label="Loading profile"
              />
            ) : !user ? (
              // Signed out: Exactly looks like other 3 navbar buttons
              <Link
                to="/login"
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium",
                  "transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4]",
                  location.pathname === "/login"
                    ? "text-white font-semibold"
                    : "text-white/60 hover:text-white"
                )}
              >
                Sign in
              </Link>
            ) : (
              // Signed in: Minimalistic logo icon matching navbar styling
              <div ref={dropdownRef} className="relative flex items-center">
                <button
                  type="button"
                  data-index="user"
                  aria-haspopup="menu"
                  aria-expanded={dropdownOpen}
                  aria-label="User account menu"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setDropdownOpen((prev) => !prev);
                    }
                  }}
                  className={cn(
                    "flex items-center justify-center rounded-full px-3 py-1.5",
                    "transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4]",
                    activeIndex === "user" || dropdownOpen
                      ? "text-white bg-white/10"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <MinimalUserIcon className="h-4 w-4" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    role="menu"
                    aria-label="User account actions"
                    className={cn(
                      "absolute right-0 top-full mt-2 w-48 rounded-xl",
                      "border border-white/10 bg-[#101422] p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.6)]",
                      "z-50 text-white animate-in fade-in-50 zoom-in-95 duration-150"
                    )}
                  >
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="text-xs font-semibold text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-neutral-400 truncate">
                        {user.email}
                      </p>
                      {user.role !== "student" && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-[#4285f4]/20 text-[#4285f4] rounded">
                          {user.role}
                        </span>
                      )}
                    </div>

                    <Link
                      to={user.role !== "student" ? "/admin" : "/dashboard"}
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium rounded-lg text-neutral-200 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4]"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 text-[#4285f4]" />
                      Dashboard
                    </Link>

                    <div className="h-px bg-white/10 my-1" />

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium rounded-lg text-[#ea4335] hover:bg-[#ea4335]/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea4335]"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* ── Mobile Floating Pill Navbar (below md: 375px responsive) ── */}
      <div className="relative md:hidden w-full max-w-sm">
        <div className="h-11 px-3.5 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl flex items-center justify-between shadow-[0_0_25px_rgba(66,133,244,0.1)]">
          <Link
            to="/"
            className="text-xs font-bold tracking-wider text-white flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4] rounded-full"
          >
            <img
              src={gdgLogo}
              alt="GDG Logo"
              draggable={false}
              className="h-4 w-auto object-contain shrink-0"
            />
            GDG ON CAMPUS
          </Link>

          <div className="flex items-center gap-2">
            {loading ? (
              <div className="h-6 w-12 rounded-full bg-white/10 animate-pulse" />
            ) : !user ? (
              <Link
                to="/login"
                className="px-3 py-1 text-xs font-medium rounded-full text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4]"
              >
                Sign in
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setMobileOpen((prev) => !prev)}
                aria-label="Toggle user menu"
                aria-expanded={mobileOpen}
                className="h-7 w-7 rounded-full text-white/70 hover:text-white flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4]"
              >
                <MinimalUserIcon className="h-4 w-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle mobile menu"
              aria-expanded={mobileOpen}
              className="p-1 rounded-md text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4]"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Full-width Mobile Sheet / Overlay */}
        {mobileOpen && (
          <div
            ref={mobileMenuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            className="fixed inset-x-3 top-20 z-50 rounded-2xl border border-white/10 bg-[#0c101c] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-white animate-in slide-in-from-top-4 duration-200"
          >
            {/* Nav links */}
            <div className="flex flex-col gap-1">
              {navItems.map((item, index) => (
                <a
                  key={item.href}
                  href={item.href}
                  target={item.isExternal ? "_blank" : undefined}
                  rel={item.isExternal ? "noopener noreferrer" : undefined}
                  aria-label={
                    item.isExternal
                      ? `${item.label} (opens official website in new tab)`
                      : undefined
                  }
                  title={
                    item.isExternal
                      ? "Opens official GDG NSUT website in a new tab"
                      : undefined
                  }
                  onClick={(e) => {
                    handleItemClick(item, index, e);
                    setMobileOpen(false);
                  }}
                  className="group inline-flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4]"
                >
                  <span>{item.label}</span>
                  {item.isExternal && (
                    <ArrowUpRight
                      className="h-4 w-4 text-neutral-400 group-hover:text-white transition-colors duration-200"
                      aria-hidden="true"
                    />
                  )}
                </a>
              ))}
            </div>

            <div className="h-px bg-white/10 my-3" />

            {/* Auth section */}
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.04]">
                  <div className="h-8 w-8 rounded-full bg-white/10 text-white/80 flex items-center justify-center">
                    <MinimalUserIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-neutral-400 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1 pt-1">
                  <Link
                    to={user.role !== "student" ? "/admin" : "/dashboard"}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-neutral-200 hover:text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4]"
                  >
                    <LayoutDashboard className="h-4 w-4 text-[#4285f4]" />
                    Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#ea4335] hover:bg-[#ea4335]/10 mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea4335]"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center py-2.5 rounded-xl border border-white/10 text-white text-sm font-medium hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4]"
              >
                Sign in
              </Link>
            )}
          </div>
        )}
      </div>

      <style>{`
        .spotlight-nav {
          --spotlight-x: 0px;
          --ambience-x: 0px;
        }
      `}</style>
    </header>
  );
}

export default SpotlightNavbar;