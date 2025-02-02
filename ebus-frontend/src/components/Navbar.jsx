import React, { Fragment, useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  TicketIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  HomeIcon,
  MapIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '../hooks/useAuth';
import { debounce } from '../utils/helpers';
import axios from 'axios';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Throttled scroll handler
  const handleScroll = useCallback(
    debounce(() => {
      setIsScrolled(window.scrollY > 10);
    }, 50),
    []
  );

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      navigate(`/search?query=${encodeURIComponent(trimmedQuery)}`);
      setSearchQuery('');
    }
  };

  // Fetch user profile and notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Fetch user profile
      axios.get('/api/users/profile/')
        .then(response => {
          setProfileData(response.data);
        })
        .catch(error => {
          console.error('Error fetching profile:', error);
        });

      // Fetch notifications
      axios.get('/api/users/notifications/')
        .then(response => {
          setHasNotifications(response.data.unread_count > 0);
        })
        .catch(error => {
          console.error('Error fetching notifications:', error);
        });
    }
  }, [isAuthenticated]);

  const mainNavigation = useMemo(() => [
    { name: 'Home', href: '/', icon: HomeIcon, current: location.pathname === '/' },
    { name: 'Routes', href: '/', icon: MapIcon, current: location.pathname === '/routes' },
    { name: 'Schedule', href: '/schedule', icon: TicketIcon, current: location.pathname === '/schedule' },
  ], [location.pathname]);

  const authNavigation = useMemo(() => [
    { 
      name: 'Profile', 
      href: '/profile', 
      icon: UserCircleIcon,
      current: location.pathname === '/profile'
    },
    { 
      name: 'My Bookings', 
      href: '/bookings', 
      icon: TicketIcon,
      current: location.pathname === '/bookings'
    },
    { 
      name: 'Logout', 
      icon: ArrowRightOnRectangleIcon, 
      action: logout,
      className: 'text-red-600 hover:text-red-700 hover:bg-red-50'
    },
  ], [location.pathname, logout]);

  const userMenuItems = useMemo(() => [
    ...authNavigation,
    { 
      name: 'Notifications', 
      icon: BellIcon, 
      href: '/notifications',
      current: location.pathname === '/notifications',
      badge: hasNotifications
    }
  ], [authNavigation, hasNotifications, location.pathname]);

  return (
    <nav 
      className={`fixed w-full top-0 z-50 transition-all duration-200 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-sm shadow-md' 
          : 'bg-white'
      }`}
      aria-label="Main navigation"
    >
      {/* Skip Navigation Link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed top-2 left-2 p-2 bg-white text-primary rounded-md"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left Section */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <button
                type="button"
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                )}
              </button>

              <Link 
                to="/" 
                className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-md"
              >
                <span className="text-2xl font-bold text-primary tracking-tight hover:text-primary-dark transition-colors">
                  E-Bus
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-6" aria-label="Primary navigation">
              {mainNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.current
                      ? 'text-primary bg-primary-50'
                      : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                  } focus:outline-none focus:ring-2 focus:ring-primary`}
                  aria-current={item.current ? 'page' : undefined}
                >
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Center Section - Search */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="hidden lg:flex flex-1 max-w-xl mx-8"
            role="search"
          >
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search routes or destinations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                aria-label="Search routes or destinations"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center px-2 py-0.5 text-xs text-gray-400 bg-gray-100 border rounded">
                ⌘K
              </kbd>
            </div>
          </form>

          {/* Right Section - Desktop */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <button
                  className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-full relative focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={`Notifications ${hasNotifications ? ' (new)' : ''}`}
                  onClick={() => navigate('/notifications')}
                >
                  <BellIcon className="h-6 w-6" />
                  {hasNotifications && (
                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-400 ring-2 ring-white" />
                  )}
                </button>

                <Menu as="div" className="relative">
                  <Menu.Button 
                    className="flex items-center space-x-1 text-gray-600 hover:text-primary group focus:outline-none"
                    aria-label="User menu"
                  >
                    <div className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-50">
                      <UserCircleIcon className="h-6 w-6" />
                      {profileData && (
                        <span className="text-sm font-medium">{profileData.first_name}</span>
                      )}
                    </div>
                  </Menu.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        {userMenuItems.map((item) => (
                          <Menu.Item key={item.name}>
                            {({ active }) => (
                              <Link
                                to={item.href || '#'}
                                onClick={item.action}
                                className={`flex items-center px-4 py-2 text-sm text-gray-700 ${
                                  active ? 'bg-gray-100 text-gray-900' : ''
                                }`}
                              >
                                {item.icon && (
                                  <item.icon className="h-5 w-5 mr-3" aria-hidden="true" />
                                )}
                                {item.name}
                                {item.badge && (
                                  <span className="ml-2 inline-block h-2.5 w-2.5 rounded-full bg-red-400 ring-2 ring-white" />
                                )}
                              </Link>
                            )}
                          </Menu.Item>
                        ))}
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium text-primary hover:text-primary-dark"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute top-0 right-0 bottom-0 left-0 bg-white p-4 space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Link to="/" className="text-xl font-bold text-primary">
                  E-Bus
                </Link>
              </div>
              <button
                className="p-2 rounded-md text-gray-600 hover:text-primary focus:outline-none"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <nav className="space-y-4">
              {mainNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-4 py-2 text-sm font-medium ${
                    item.current ? 'text-primary' : 'text-gray-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {isAuthenticated && (
                <>
                  {userMenuItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href || '#'}
                      onClick={item.action}
                      className="block px-4 py-2 text-sm text-gray-600 hover:text-primary"
                    >
                      {item.icon && (
                        <item.icon className="h-5 w-5 mr-3 inline-block" />
                      )}
                      {item.name}
                      {item.badge && (
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-400 ring-2 ring-white ml-2" />
                      )}
                    </Link>
                  ))}
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
