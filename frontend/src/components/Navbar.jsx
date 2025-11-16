import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { AlertTriangle, Home, List, FileText, Settings } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: t('home') },
    { path: '/alerts', icon: List, label: t('alerts') },
    { path: '/explain', icon: FileText, label: t('explain') },
    { path: '/settings', icon: Settings, label: t('settings') }
  ];

  return (
    <nav data-testid="navbar" className="bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg">
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

          <div className="md:hidden flex space-x-4 items-center">
            {navItems.map(item => (
              <Link key={item.path} to={item.path} data-testid={`mobile-nav-${item.label.toLowerCase()}`}>
                <item.icon className={`w-6 h-6 ${
                  location.pathname === item.path ? 'text-yellow-300' : ''
                }`} />
              </Link>
            ))}
            <div className="border-l border-white/30 pl-4">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
