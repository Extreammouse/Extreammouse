import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Settings, 
  LogOut, 
  DollarSign, 
  Menu, 
  X, 
  Bell
} from 'lucide-react';
import Button from './Button';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

// Updated Logo component with larger size
const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-4">
      <img 
        src="/images/Quicksend_logo_new.png" 
        alt="QuickSend AI Logo" 
        className="h-12 w-auto" // Increased height from h-8 to h-12
      />
      <span className="text-2xl font-bold text-white">QuickSend AI</span>
    </div>
  );
};

const AppBar: React.FC = () => {
  const { signOut } = useFirebaseAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasNotifications] = useState(true);

  const navigationItems = [
    {
      label: 'Pricing',
      icon: DollarSign,
      path: '/pricing',
    },
    {
      label: 'Settings',
      icon: Settings,
      path: '/settings',
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-slate-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20"> {/* Increased height from h-16 to h-20 */}
          <Link 
            to="/dashboard" 
            className="flex items-center hover:opacity-90 transition-all duration-300 transform hover:scale-105"
          >
            <Logo />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Notification Icon */}
            <button 
              className="relative p-2 rounded-full hover:bg-slate-800 transition-all duration-300"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="w-5 h-5 text-white" />
              {hasNotifications && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>

            {navigationItems.map((item) => (
              <Button
                key={item.label}
                variant={isActive(item.path) ? "primary" : "secondary"}
                size="sm"
                onClick={() => navigate(item.path)}
                className="flex items-center gap-2 transition-all duration-300 hover:scale-105 text-white bg-slate-800 hover:bg-slate-700"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="flex items-center gap-2 ml-2 transition-all duration-300 hover:scale-105 text-white border-white hover:bg-slate-800"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-800 transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 animate-fadeIn bg-slate-900">
            {navigationItems.map((item) => (
              <Button
                key={item.label}
                variant={isActive(item.path) ? "primary" : "secondary"}
                size="sm"
                onClick={() => {
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full justify-center mb-2 transition-all duration-300 text-white bg-slate-800 hover:bg-slate-700"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                signOut();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full justify-center transition-all duration-300 text-white border-white hover:bg-slate-800"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppBar;