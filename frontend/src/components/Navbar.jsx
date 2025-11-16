import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { AlertTriangle, Home, List, FileText, Settings, Users, Menu, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useIsMobile } from '../hooks/useMediaQuery';

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const navItems = [
    { path: '/', icon: Home, label: t('home') },
    { path: '/alerts', icon: List, label: t('alerts') },
    { path: '/crowd-monitor', icon: Users, label: t('crowdSafety') },
    { path: '/explain', icon: FileText, label: t('explain') },
    { path: '/settings', icon: Settings, label: t('settings') }
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (!isMobile && isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isMobile, isMenuOpen]);

  return (
    <nav data-testid="navbar" className="bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2" data-testid="navbar-logo">
            <AlertTriangle className="w-8 h-8" />
            <span className="text-xl font-bold">ReadyIndia AI</span>
          </Link>

          <div className="hidden md:flex space-x-8 items-center">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-link-${item.label.toLowerCase()}`}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
                  location.pathname === item.path
                    ? 'bg-white/20 font-semibold'
                    : 'hover:bg-white/10'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
            <div className="border-l border-white/20 pl-8">
              <LanguageSwitcher />
            </div>
          </div>

          <div className="md:hidden flex items-center space-x-3">
            <LanguageSwitcher />
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md hover:bg-white/10 transition-colors"
              data-testid="mobile-menu-button"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <>
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeMenu}
          />
          <div className="md:hidden absolute top-16 left-0 right-0 bg-gradient-to-r from-orange-600 to-red-600 shadow-lg z-50 animate-fade-in">
            <div className="px-4 py-2 space-y-1">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMenu}
                  data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-md transition-all ${
                    location.pathname === item.path
                      ? 'bg-white/20 font-semibold'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
