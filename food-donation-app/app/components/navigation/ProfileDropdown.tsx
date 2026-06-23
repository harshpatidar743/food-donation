"use client";

import Link from "next/link";
import { ChevronDown, LayoutDashboard, LogOut, UserCircle2 } from "lucide-react";
import { useEffect, useRef } from "react";
import type { ProfileMenuItem } from "./types";
import styles from "./ProfileDropdown.module.css";

type ProfileDropdownProps = {
  isAuthenticated: boolean;
  isOpen: boolean;
  items: ProfileMenuItem[];
  name?: string;
  onClose: () => void;
  onLogout: () => void;
  onToggle: () => void;
};

const getInitials = (name?: string) => {
  if (!name) {
    return "FM";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
};

export default function ProfileDropdown({
  isAuthenticated,
  isOpen,
  items,
  name,
  onClose,
  onLogout,
  onToggle,
}: ProfileDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initials = getInitials(name);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen, onClose]);

  const triggerClassName = [
    styles.trigger,
    isOpen ? styles.triggerOpen : "",
  ].filter(Boolean).join(" ");

  const chevronClassName = [
    styles.chevron,
    isOpen ? styles.chevronOpen : "",
  ].filter(Boolean).join(" ");

  const menuClassName = [
    styles.menu,
    isOpen ? styles.menuOpen : styles.menuClosed,
  ].join(" ");

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label="Open profile menu"
        className={triggerClassName}
      >
        <span className={styles.avatar}>
          {isAuthenticated ? initials : <UserCircle2 className={styles.avatarIcon} />}
        </span>
        <ChevronDown className={chevronClassName} />
      </button>

      <div className={menuClassName}>
        <div className={styles.menuHeader}>
          <p className={styles.headerLabel}>Profile</p>
          <p className={styles.headerTitle}>
            {name || "FoodMatch Guest"}
          </p>
          <p className={styles.headerText}>
            {isAuthenticated ? "Manage your dashboard and account." : "Sign in to access your dashboard."}
          </p>
        </div>

        <div className={styles.menuList}>
          {items.map((item) => (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              onClick={onClose}
              className={styles.menuLink}
            >
              <LayoutDashboard className={styles.itemIcon} />
              <span>{item.label}</span>
            </Link>
          ))}

          {isAuthenticated ? (
            <button
              type="button"
              onClick={onLogout}
              className={styles.logoutButton}
            >
              <LogOut className={styles.itemIcon} />
              <span>Logout</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
