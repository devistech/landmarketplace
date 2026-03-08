import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, isAdmin, loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  if (user && profile && !profile.profile_completed && window.location.pathname !== "/complete-profile") {
    return <Navigate to="/complete-profile" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
