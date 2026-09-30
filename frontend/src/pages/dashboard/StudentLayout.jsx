import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import SidebarLayout from "@/components/SidebarLayout";
import { FileText, Megaphone, LogOut } from "lucide-react";

const STUDENT_NAV = [
  { label: "My Applications", href: "/dashboard", icon: FileText },
  { label: "Announcements", href: "/dashboard/announcements", icon: Megaphone },
];

function StudentAccountBlock() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    navigate("/", { replace: true });
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 space-y-3">
      {/* Name */}
      <div>
        <p className="text-xs font-semibold text-white truncate">
          {user?.name || "Student"}
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

export default function StudentLayout() {
  return (
    <SidebarLayout
      navItems={STUDENT_NAV}
      accountSlot={<StudentAccountBlock />}
    >
      <Outlet />
    </SidebarLayout>
  );
}
