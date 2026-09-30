import { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

export function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isLoggingOut } = useAuth();
  const location = useLocation();
  const hasToastedRef = useRef(false);

  const isStudent = user && user.role === "student";
  const isUnauthorizedAdmin = adminOnly && isStudent;

  useEffect(() => {
    if (!loading && !isLoggingOut && isUnauthorizedAdmin && !hasToastedRef.current) {
      hasToastedRef.current = true;
      toast({
        variant: "destructive",
        description: "You do not have access to that page",
      });
    }
  }, [loading, isLoggingOut, isUnauthorizedAdmin]);

  // While checking session on mount/refresh, hold state with a full-page spinner
  // to avoid bouncing authenticated users
  if (loading) {
    return (
      <div
        role="status"
        aria-label="Loading authentication session"
        className="min-h-screen w-full bg-[#080808] flex flex-col items-center justify-center text-white select-none"
      >
        <div className="relative flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-2 border-white/10 border-t-[#4285f4] animate-spin" />
        </div>
        <p className="mt-4 text-xs tracking-wider uppercase text-neutral-400 font-medium">
          Verifying session...
        </p>
      </div>
    );
  }

  // During sign-out, immediately direct to home instead of login
  if (isLoggingOut) {
    return <Navigate to="/" replace />;
  }

  // Not signed in -> redirect to login preserving intent
  if (!user) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${returnUrl}`} replace />;
  }

  // Signed in but lacks admin role for adminOnly route
  if (isUnauthorizedAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
