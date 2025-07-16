import { Link, useNavigate, useLocation } from "react-router-dom";
import { Heart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export const Header = ({ isAuthenticated = false, onLogout }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    if (isAuthenticated) {
      // If authenticated, go to dashboard or stay on current auth page
      if (location.pathname === '/') {
        return; // Already on home
      }
      navigate('/dashboard');
    } else {
      // If not authenticated, go to landing page
      navigate('/');
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    // Navigate to unauthenticated home page
    navigate('/', { replace: true });
  };

  return (
    <header className="bg-header-bg text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo - clickable to navigate based on auth state */}
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="bg-primary rounded-xl p-2">
              <Heart className="h-6 w-6 text-white fill-white" />
            </div>
            <span className="text-xl font-bold">HealthSync</span>
          </button>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-white hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button variant="secondary" size="sm">
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};