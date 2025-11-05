import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut, User, Building2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

const DashboardNavbar = ({ userType = 'user' }) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    apiClient.logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const user = apiClient.getCurrentUser();

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border backdrop-blur-md bg-opacity-90">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:text-accent transition-colors">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              SC
            </div>
            <span className="hidden sm:inline">Smart Complaint</span>
          </Link>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              {userType === 'user' ? (
                <User className="h-4 w-4" />
              ) : (
                <Building2 className="h-4 w-4" />
              )}
              <span>Welcome, {user?.name || user?.departmentName || 'User'}</span>
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {/* Logout Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to log out? You will need to sign in again to access your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
