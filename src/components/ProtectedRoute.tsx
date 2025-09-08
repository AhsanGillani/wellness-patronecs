import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "doctor" | "professional" | "patient";
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallbackPath = "/auth",
}) => {
  const { user, effectiveRole, loading } = useAuth();
  const navigate = useNavigate();
  const routerLocation = useLocation();

  useEffect(() => {
    if (loading) return; // Wait for auth to load

    // If no user, redirect to auth
    if (!user) {
      navigate(fallbackPath, {
        state: {
          from: {
            pathname: routerLocation.pathname,
            search: routerLocation.search,
            hash: routerLocation.hash,
          },
        },
        replace: true,
      });
      return;
    }

    // If role is required and user doesn't have it
    const normalizedEffectiveRole =
      effectiveRole === "doctor" ? "professional" : effectiveRole;
    const normalizedRequiredRole =
      requiredRole === "doctor" ? "professional" : requiredRole;

    if (requiredRole && normalizedEffectiveRole !== normalizedRequiredRole) {
      // Redirect based on user's actual role
      if (normalizedEffectiveRole === "admin") {
        navigate("/admin", { replace: true });
      } else if (normalizedEffectiveRole === "professional") {
        navigate("/doctor-dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
      return;
    }
  }, [
    user,
    effectiveRole,
    loading,
    navigate,
    requiredRole,
    fallbackPath,
    routerLocation.pathname,
    routerLocation.search,
    routerLocation.hash,
  ]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  // Don't render if user is not authenticated or doesn't have required role
  const normalizedEffectiveRole =
    effectiveRole === "doctor" ? "professional" : effectiveRole;
  const normalizedRequiredRole =
    requiredRole === "doctor" ? "professional" : requiredRole;

  if (
    !user ||
    (requiredRole && normalizedEffectiveRole !== normalizedRequiredRole)
  ) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
