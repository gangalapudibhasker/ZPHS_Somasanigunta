"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, X, AlertCircle, Calendar, FileText, CheckCircle, Volume2, VolumeX } from "lucide-react";

interface Notification {
  id: number;
  title: string;
  message: string;
  category: string;
  targetRole: string;
  date: string;
  isRead: boolean;
  actionUrl?: string;
}

export default function NotificationDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s for real-time simulation
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id?: number, markAll: boolean = false) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, markAll }),
      });
      fetchNotifications();
    } catch (err) {
      console.error("Error marking notification:", err);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "ATTENDANCE":
        return { bg: "#fee2e2", color: "#991b1b", label: "Attendance" };
      case "PROGRESS":
        return { bg: "#dcfce7", color: "#166534", label: "Grades" };
      case "SMC":
        return { bg: "#fef3c7", color: "#92400e", label: "SMC Committee" };
      case "EXAM":
        return { bg: "#e0e7ff", color: "#3730a3", label: "Exam Alert" };
      case "EVENT":
        return { bg: "#f3e8ff", color: "#6b21a8", label: "Event / PTC" };
      default:
        return { bg: "#f1f5f9", color: "#475569", label: "General" };
    }
  };

  return (
    <>
      {/* Bell Button with Live Badge */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Notifications"
          style={{
            position: "relative",
            background: "transparent",
            border: "1px solid #cbd5e1",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#1e3a8a",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                backgroundColor: "#ef4444",
                color: "white",
                fontSize: "0.7rem",
                fontWeight: "bold",
                borderRadius: "9999px",
                padding: "2px 6px",
                minWidth: "18px",
                textAlign: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                animation: "pulse 2s infinite",
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Drawer Overlay & Panel */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(2px)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              height: "100%",
              backgroundColor: "#ffffff",
              boxShadow: "var(--shadow-xl)",
              display: "flex",
              flexDirection: "column",
              animation: "slideInRight 0.25s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#1e3a8a",
                color: "white",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Bell size={20} />
                <h3 style={{ fontSize: "1.1rem", color: "white", margin: 0 }}>Real-Time Alerts</h3>
                {unreadCount > 0 && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      backgroundColor: "#ef4444",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {unreadCount} New
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  title={soundEnabled ? "Mute alert chime" : "Enable alert chime"}
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "none",
                    color: "white",
                    borderRadius: "6px",
                    padding: "6px",
                    cursor: "pointer",
                  }}
                >
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "none",
                    color: "white",
                    borderRadius: "6px",
                    padding: "6px",
                    cursor: "pointer",
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Actions Bar */}
            <div
              style={{
                padding: "0.75rem 1.25rem",
                backgroundColor: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.8rem",
              }}
            >
              <span style={{ color: "#64748b", fontWeight: "600" }}>Recent Announcements &amp; Updates</span>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAsRead(undefined, true)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#1e3a8a",
                    fontWeight: "bold",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
              {notifications.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#64748b" }}>
                  <Bell size={36} style={{ color: "#cbd5e1", margin: "0 auto 1rem auto" }} />
                  <p style={{ fontWeight: "600" }}>No notifications at this moment.</p>
                  <p style={{ fontSize: "0.8rem" }}>Important updates from ZPHS will appear here in real-time.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {notifications.map((n) => {
                    const badge = getCategoryBadge(n.category);
                    return (
                      <div
                        key={n.id}
                        style={{
                          padding: "1rem",
                          borderRadius: "10px",
                          backgroundColor: n.isRead ? "#ffffff" : "#f0fdf4",
                          border: n.isRead ? "1px solid #e2e8f0" : "1.5px solid #86efac",
                          boxShadow: "var(--shadow-sm)",
                          position: "relative",
                          transition: "all 0.2s",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.35rem" }}>
                          <span
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: "bold",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              backgroundColor: badge.bg,
                              color: badge.color,
                            }}
                          >
                            {badge.label}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{n.date}</span>
                        </div>

                        <h4 style={{ fontSize: "0.95rem", color: "#0f172a", marginBottom: "0.25rem", fontWeight: n.isRead ? "600" : "700" }}>
                          {n.title}
                        </h4>

                        <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: "1.4", marginBottom: "0.5rem" }}>
                          {n.message}
                        </p>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.5rem", borderTop: "1px dashed #f1f5f9" }}>
                          {n.actionUrl ? (
                            <a
                              href={n.actionUrl}
                              onClick={() => {
                                markAsRead(n.id);
                                setIsOpen(false);
                              }}
                              style={{ fontSize: "0.8rem", color: "#1e3a8a", fontWeight: "bold" }}
                            >
                              View Details →
                            </a>
                          ) : (
                            <span />
                          )}

                          {!n.isRead && (
                            <button
                              onClick={() => markAsRead(n.id)}
                              style={{
                                border: "none",
                                background: "none",
                                color: "#10b981",
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "2px",
                              }}
                            >
                              <Check size={14} /> Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid #e2e8f0", backgroundColor: "#f8fafc", textAlign: "center", fontSize: "0.75rem", color: "#64748b" }}>
              ZPHS Somasanigunta Real-Time Notification Gateway
            </div>
          </div>
        </div>
      )}
    </>
  );
}
