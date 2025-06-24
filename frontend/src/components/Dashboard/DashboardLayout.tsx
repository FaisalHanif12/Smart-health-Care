import { useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      setIsMobileMenuOpen(false); // Close mobile menu
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const goTo = (path: string) => {
    console.log('Navigation to:', path);
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="flex">
        {/* Mobile Header */}
        <div className="md:hidden bg-gray-900 dark:bg-gray-800 p-4 flex justify-between items-center w-full fixed top-0 z-40">
          <div className="flex items-center">
            <img 
              src="/fitness tracker.webp" 
              alt="Health Tracker" 
              className="w-8 h-8 rounded-lg"
            />
          </div>
          <button 
            className="text-white" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Sidebar Navigation */}
        <div className={`w-64 bg-gray-900 dark:bg-gray-800 min-h-screen fixed md:relative left-0 top-0 z-40 md:z-auto transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:block`}>
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-8 mt-4 md:mt-0">
              <img 
                src="/fitness tracker.webp" 
                alt="Health Tracker" 
                className="w-10 h-10 rounded-lg"
              />
              <h1 className="text-xl font-bold text-yellow-400">
                <span className="hidden lg:inline">HEALTH TRACKER</span>
                <span className="lg:hidden">HEALTH</span>
              </h1>
            </div>
            
            {/* Navigation Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => goTo('/dashboard')}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                  isActive('/dashboard') 
                    ? 'bg-gray-800 dark:bg-gray-700 text-yellow-400' 
                    : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800 dark:hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => goTo('/dashboard/workout')}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                  isActive('/dashboard/workout') 
                    ? 'bg-gray-800 dark:bg-gray-700 text-yellow-400' 
                    : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800 dark:hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Workout Plan</span>
              </button>

              <button
                onClick={() => goTo('/dashboard/diet')}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                  isActive('/dashboard/diet') 
                    ? 'bg-gray-800 dark:bg-gray-700 text-yellow-400' 
                    : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800 dark:hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                </svg>
                <span>Diet Plan</span>
              </button>

              <button
                onClick={() => goTo('/dashboard/store')}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                  isActive('/dashboard/store') 
                    ? 'bg-gray-800 dark:bg-gray-700 text-yellow-400' 
                    : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800 dark:hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                <span>Store</span>
              </button>

              <button
                onClick={() => goTo('/dashboard/profile')}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                  isActive('/dashboard/profile') 
                    ? 'bg-gray-800 dark:bg-gray-700 text-yellow-400' 
                    : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800 dark:hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span>Profile</span>
              </button>

              <button
                onClick={() => goTo('/dashboard/settings')}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                  isActive('/dashboard/settings') 
                    ? 'bg-gray-800 dark:bg-gray-700 text-yellow-400' 
                    : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800 dark:hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <span>Settings</span>
              </button>

              {/* Logout Button */}
              <div className="pt-4 mt-4 border-t border-gray-800 dark:border-gray-700">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-700 hover:text-yellow-400"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm3 6V7a1 1 0 012 0v2h2a1 1 0 110 2H8v2a1 1 0 11-2 0v-2H4a1 1 0 110-2h2z" clipRule="evenodd" />
                  </svg>
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full md:ml-0 pt-16 md:pt-0 bg-white dark:bg-gray-900">
          {children}
        </div>
      </div>
    </div>
  );
} 