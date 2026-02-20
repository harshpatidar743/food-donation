"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

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
          {menuItems.map((item) => (
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
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
