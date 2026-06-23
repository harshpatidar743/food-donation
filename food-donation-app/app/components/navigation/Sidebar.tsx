"use client";

import Link from "next/link";
import { LogOut, X } from "lucide-react";
import type { NavigationItem } from "./types";
import styles from "./Sidebar.module.css";

type SidebarProps = {
  isAuthenticated: boolean;
  isOpen: boolean;
  items: NavigationItem[];
  onClose: () => void;
  onLogout: () => void;
  pathname: string;
  siteTitle: string;
};

export default function Sidebar({
  isAuthenticated,
  isOpen,
  items,
  onClose,
  onLogout,
  pathname,
  siteTitle,
}: SidebarProps) {
  const overlayClassName = [
    styles.overlay,
    isOpen ? styles.overlayOpen : styles.overlayClosed,
  ].join(" ");

  const sidebarClassName = [
    styles.sidebar,
    isOpen ? styles.sidebarOpen : styles.sidebarClosed,
  ].join(" ");

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation drawer"
        className={overlayClassName}
        onClick={onClose}
      />

      <aside aria-hidden={!isOpen} className={sidebarClassName}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>
              Navigation
            </p>
            <h2 className={styles.title}>{siteTitle}</h2>
            <p className={styles.subtitle}>
              Quick access across FoodMatch.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className={styles.closeButton}
          >
            <X className={styles.closeIcon} />
          </button>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.list}>
            {items.map((item) => {
              const isActive = pathname === item.href;
              const linkClassName = [
                styles.itemLink,
                isActive ? styles.itemLinkActive : "",
              ].filter(Boolean).join(" ");

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={linkClassName}
                  >
                    <span>{item.label}</span>
                    <span className={styles.itemStatus}>{isActive ? "Live" : ""}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.footer}>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={onLogout}
              className={styles.actionButton}
            >
              <LogOut className={styles.actionIcon} />
              Logout
            </button>
          ) : (
            <Link
              href="/donor/login"
              onClick={onClose}
              className={styles.actionButton}
            >
              Login
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
