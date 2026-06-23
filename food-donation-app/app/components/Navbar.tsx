"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import NotificationDropdown from "./navigation/NotificationDropdown";
import ProfileDropdown from "./navigation/ProfileDropdown";
import Sidebar from "./navigation/Sidebar";
import styles from "./Navbar.module.css";
import {
  AUTH_STORAGE_EVENT,
  clearStoredAuthUser,
  getStoredAuthUser,
  isAdminUser,
  isAuthenticatedUser,
  type AuthUser,
} from "../lib/auth";
import type {
  NavigationItem,
  NotificationItem,
  ProfileMenuItem,
} from "./navigation/types";

interface NavbarProps {
  siteTitle?: string;
  menuItems?: NavigationItem[];
}

const defaultMenuItems: NavigationItem[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/AboutUs" },
  { label: "Contact Us", href: "/ContactUs" },
];

export default function Navbar({
  siteTitle = "FoodMatch",
  menuItems = defaultMenuItems,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [hasResolvedAuth, setHasResolvedAuth] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleAuthChange = () => {
      setAuthUser(getStoredAuthUser());
      setHasResolvedAuth(true);
    };

    handleAuthChange();

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener(AUTH_STORAGE_EVENT, handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener(AUTH_STORAGE_EVENT, handleAuthChange);
    };
  }, [pathname]);

  useEffect(() => {
    setIsSidebarOpen(false);
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
      }
    };

    if (isSidebarOpen || isProfileOpen || isNotificationsOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isNotificationsOpen, isProfileOpen, isSidebarOpen]);

  useEffect(() => {
    if (!isSidebarOpen) {
      document.body.classList.remove("menu-open");
      document.documentElement.classList.remove("menu-open");
      document.body.style.top = "";
      return;
    }

    const scrollY = window.scrollY;
    document.body.style.top = `-${scrollY}px`;
    document.body.classList.add("menu-open");
    document.documentElement.classList.add("menu-open");

    return () => {
      const lockedScrollY = Math.abs(parseInt(document.body.style.top || "0", 10));

      document.body.classList.remove("menu-open");
      document.documentElement.classList.remove("menu-open");
      document.body.style.top = "";
      window.scrollTo(0, lockedScrollY || scrollY);
    };
  }, [isSidebarOpen]);

  const isAuthenticated = isAuthenticatedUser(authUser);
  const isAdmin = isAdminUser(authUser);

  const navigationItems = useMemo<NavigationItem[]>(() => {
    if (!isAuthenticated) {
      return menuItems;
    }

    const items = [
      ...menuItems,
      { label: "Dashboard", href: "/donor/dashboard" },
      { label: "Profile", href: "/dashboard/profile" },
    ];

    if (isAdmin) {
      items.push({ label: "Admin Messages", href: "/dashboard/messages" });
    }

    return items;
  }, [isAdmin, isAuthenticated, menuItems]);

  const profileItems = useMemo<ProfileMenuItem[]>(() => {
    if (!hasResolvedAuth) {
      return [];
    }

    if (!isAuthenticated) {
      return [
        { label: "Login", href: "/donor/login" },
      ];
    }

    const items: ProfileMenuItem[] = [
      { label: "Profile", href: "/dashboard/profile" },
      { label: "Dashboard", href: "/donor/dashboard" },
    ];

    if (isAdmin) {
      items.splice(1, 0, { label: "Admin Messages", href: "/dashboard/messages" });
    }

    return items;
  }, [hasResolvedAuth, isAdmin, isAuthenticated]);

  const notifications = useMemo<NotificationItem[]>(() => {
    if (!isAuthenticated) {
      return [
        {
          id: "welcome",
          title: "Welcome to FoodMatch",
          description:
            "Sign in to manage your dashboard, profile, and donation activity.",
          href: "/donor/login",
          unread: true,
        },
      ];
    }

    const items: NotificationItem[] = [
      {
        id: "dashboard",
        title: "Dashboard shortcuts ready",
        description: "Jump back into your latest donation activity from one place.",
        href: "/donor/dashboard",
        unread: pathname !== "/donor/dashboard",
      },
      {
        id: "profile",
        title: "Profile details available",
        description: "Review your contact info, location, and profile settings.",
        href: "/dashboard/profile",
        unread: pathname !== "/dashboard/profile",
      },
    ];

    if (isAdmin) {
      items.unshift({
        id: "admin-messages",
        title: "Admin inbox is ready",
        description: "Open the messages dashboard to review recent contact requests.",
        href: "/dashboard/messages",
        unread: pathname !== "/dashboard/messages",
      });
    }

    return items;
  }, [isAdmin, isAuthenticated, pathname]);

  const unreadCount = notifications.filter((item) => item.unread).length;

  const closeAllOverlays = () => {
    setIsSidebarOpen(false);
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen((currentValue) => !currentValue);
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
  };

  const handleProfileToggle = () => {
    setIsProfileOpen((currentValue) => !currentValue);
    setIsSidebarOpen(false);
    setIsNotificationsOpen(false);
  };

  const handleNotificationsToggle = () => {
    setIsNotificationsOpen((currentValue) => !currentValue);
    setIsSidebarOpen(false);
    setIsProfileOpen(false);
  };

  const handleLogout = () => {
    clearStoredAuthUser();
    closeAllOverlays();
    setAuthUser(null);
    router.push("/");
  };

  const navbarClassName = [
    styles.navbar,
    scrolled ? styles.navbarScrolled : styles.navbarTop,
  ].join(" ");

  const menuButtonClassName = [
    styles.menuButton,
    isSidebarOpen ? styles.menuButtonActive : "",
  ].filter(Boolean).join(" ");

  return (
    <>
      <nav className={navbarClassName}>
        <div className={styles.inner}>
          <div className={styles.brandGroup}>
            <button
              type="button"
              onClick={handleSidebarToggle}
              aria-expanded={isSidebarOpen}
              aria-label="Open navigation drawer"
              className={menuButtonClassName}
            >
              <Menu className={styles.menuIcon} />
            </button>

            <Link
              href="/"
              onClick={closeAllOverlays}
              className={styles.brandLink}
            >
              <span className={styles.brandMark}>
                FM
              </span>

              <div className={styles.brandText}>
                <span className={styles.siteTitle}>
                  {siteTitle}
                </span>
                <span className={styles.tagline}>
                  Share More, Waste Less
                </span>
              </div>
            </Link>
          </div>

          <div className={styles.actions}>
            <NotificationDropdown
              isOpen={isNotificationsOpen}
              items={notifications}
              onClose={() => setIsNotificationsOpen(false)}
              onToggle={handleNotificationsToggle}
              unreadCount={unreadCount}
            />

            <ProfileDropdown
              isAuthenticated={isAuthenticated}
              isOpen={isProfileOpen}
              items={profileItems}
              name={authUser?.name}
              onClose={() => setIsProfileOpen(false)}
              onLogout={handleLogout}
              onToggle={handleProfileToggle}
            />
          </div>
        </div>
      </nav>

      <Sidebar
        isAuthenticated={isAuthenticated}
        isOpen={isSidebarOpen}
        items={navigationItems}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        pathname={pathname}
        siteTitle={siteTitle}
      />
    </>
  );
}
