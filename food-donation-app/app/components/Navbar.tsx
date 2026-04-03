"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import './Navbar.css';
import {
  AUTH_STORAGE_EVENT,
  clearStoredAuthUser,
  getStoredAuthUser,
  isAuthenticatedUser,
  isAdminUser
} from '../lib/auth';

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  siteTitle?: string;
  menuItems?: NavItem[];
}

const Navbar: React.FC<NavbarProps> = ({
  siteTitle = 'FoodMatch',
  menuItems = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/AboutUs' },
    { label: 'Contact Us', href: '/ContactUs' }
  ]
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const authUser = getStoredAuthUser();
      setIsAuthenticated(isAuthenticatedUser(authUser));
      setIsAdmin(isAdminUser(authUser));
    };

    checkAuth();

    window.addEventListener('storage', checkAuth);
    window.addEventListener(AUTH_STORAGE_EVENT, checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener(AUTH_STORAGE_EVENT, checkAuth);
    };
  }, [pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) {
      document.body.classList.remove('menu-open');
      document.documentElement.classList.remove('menu-open');
      document.body.style.top = '';
      return;
    }

    const scrollY = window.scrollY;
    document.body.style.top = `-${scrollY}px`;
    document.body.classList.add('menu-open');
    document.documentElement.classList.add('menu-open');

    return () => {
      const lockedScrollY = Math.abs(parseInt(document.body.style.top || '0', 10));

      document.body.classList.remove('menu-open');
      document.documentElement.classList.remove('menu-open');
      document.body.style.top = '';
      window.scrollTo(0, lockedScrollY || scrollY);
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    clearStoredAuthUser();
    setIsAuthenticated(false);
    setIsAdmin(false);
    closeMenu();
    router.push('/');
  };

  const getMenuItems = (): NavItem[] => {
    if (isAuthenticated) {
      const authenticatedMenuItems = [
        { label: 'Home', href: '/' },
        { label: 'About Us', href: '/AboutUs' },
        { label: 'Contact Us', href: '/ContactUs' },
        { label: 'Dashboard', href: '/donor/dashboard' }
      ];

      if (isAdmin) {
        authenticatedMenuItems.push({ label: 'Admin Messages', href: '/dashboard/messages' });
      }

      return authenticatedMenuItems;
    }
    return menuItems;
  };

  const currentMenuItems = getMenuItems();

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="logo-section">
          <Link href="/" className="navbar-logo" onClick={closeMenu}>
            <span className="logo-icon">🍽️</span>
            <span className="logo-text">{siteTitle}</span>
          </Link>
        </div>

        <div className="nav-section">
          <button
            className={`hamburger ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
            {currentMenuItems.map((item) => (
              <li key={item.href} className="navbar-item">
                <Link
                  href={item.href}
                  className={`navbar-link ${pathname === item.href ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              </li>
            ))}

            {isAuthenticated ? (
              <li className="navbar-item">
                <button
                  className="navbar-link logout-link"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            ) : (
              <li className="navbar-item">
                <Link
                  href="/donor/login"
                  className={`navbar-link auth-link ${pathname === '/donor/login' ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  Login
                </Link>
              </li>
            )}
          </ul>

          <div
            className={`mobile-overlay ${isMenuOpen ? 'active' : ''}`}
            onClick={closeMenu}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

