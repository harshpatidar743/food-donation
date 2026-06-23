"use client";

import Link from "next/link";
import { Bell, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";
import type { NotificationItem } from "./types";
import styles from "./NotificationDropdown.module.css";

type NotificationDropdownProps = {
  isOpen: boolean;
  items: NotificationItem[];
  onClose: () => void;
  onToggle: () => void;
  unreadCount: number;
};

export default function NotificationDropdown({
  isOpen,
  items,
  onClose,
  onToggle,
  unreadCount,
}: NotificationDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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
        aria-label="Open notifications"
        className={triggerClassName}
      >
        <Bell className={styles.bellIcon} />
        {unreadCount > 0 ? (
          <span className={styles.badge}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      <div className={menuClassName}>
        <div className={styles.menuHeader}>
          <div className={styles.headerRow}>
            <div>
              <p className={styles.headerLabel}>
                Notifications
              </p>
              <p className={styles.headerTitle}>Recent activity</p>
            </div>
            <span className={styles.count}>
              {unreadCount} new
            </span>
          </div>
        </div>

        <div className={styles.list}>
          {items.length > 0 ? (
            items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className={styles.item}
              >
                <span
                  className={[styles.dot, item.unread ? styles.dotUnread : ""].filter(Boolean).join(" ")}
                />
                <div className={styles.itemBody}>
                  <p className={styles.itemTitle}>{item.title}</p>
                  <p className={styles.itemText}>{item.description}</p>
                </div>
                <ChevronRight className={styles.chevron} />
              </Link>
            ))
          ) : (
            <div className={styles.empty}>
              No notifications right now.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
