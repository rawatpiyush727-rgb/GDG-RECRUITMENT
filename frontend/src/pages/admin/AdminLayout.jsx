import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import SidebarLayout from "@/components/SidebarLayout";
import {
  BarChart3,
  Layers,
  FileText,
  Megaphone,
  Shield,
  LogOut,
} from "lucide-react";

const ADMIN_NAV = [
  { label: "Overview", href: "/admin", icon: BarChart3 },
  { label: "Departments", href: "/admin/departments", icon: Layers },
  { label: "Applications", href: "/admin/applications", icon: FileText },
  { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
];

function AdminAccountBlock() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isSuperadmin = user?.role === "superadmin";
  const roleLabel = isSuperadmin
    ? "Superadmin Console"
    : `Department Admin · ${(user?.departmentId || "General").toUpperCase()}`;

  const handleSignOut = async () => {
    navigate("/", { replace: true });
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 space-y-3">
      {/* Role Badge */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.04] text-[10px] font-medium tracking-wider uppercase text-[#fbbc05]">
        <Shield className="h-3 w-3" />
        {roleLabel}
      </div>

      {/* Name */}
      <div>
        <p className="text-xs font-semibold text-white truncate">
          {user?.name || "Admin"}
        </p>
        <p className="text-[11px] text-neutral-500 truncate">
          {user?.email}
        </p>
      </div>

      {/* Sign Out */}
      <button
        type="button"
        onClick={handleSignOut}
        className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#ea4335] hover:bg-[#ea4335]/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea4335]"
      >
        <LogOut className="h-3.5 w-3.5" />
        Sign out
      </button>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <SidebarLayout
      navItems={ADMIN_NAV}
      accountSlot={<AdminAccountBlock />}
    >
      <Outlet />
    </SidebarLayout>
  );
}
