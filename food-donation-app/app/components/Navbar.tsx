"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import './Navbar.css';

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  siteTitle?: string;
  menuItems?: NavItem[];
}

const Navbar: React.FC<NavbarProps> = ({ 
  siteTitle = "Food Donation", 
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const donorId = localStorage.getItem("donorId");
      setIsAuthenticated(!!donorId);
    };

    checkAuth();
    
    // Check auth on storage changes
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("donorId");
    localStorage.removeItem("donorName");
    setIsAuthenticated(false);
    closeMenu();
    router.push('/');
  };

  // Determine which menu items to show
  const getMenuItems = (): NavItem[] => {
    if (isAuthenticated) {
      return [
        { label: 'Home', href: '/' },
        { label: 'About Us', href: '/AboutUs' },
        { label: 'Contact Us', href: '/ContactUs' },
        { label: 'Dashboard', href: '/donor/dashboard' }
      ];
    }
    return menuItems;
  };

  const currentMenuItems = getMenuItems();

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link href="/" className="navbar-logo" onClick={closeMenu}>
          <span className="logo-icon">🍽️</span>
          <span className="logo-text">{siteTitle}</span>
        </Link>

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

          {/* Auth buttons */}
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
      </div>
    </nav>
  );
};

export default Navbar;

