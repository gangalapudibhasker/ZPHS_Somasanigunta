import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import NotificationDrawer from "@/components/NotificationDrawer";
import OfflineSyncBanner from "@/components/OfflineSyncBanner";
import RoleSwitcherBar from "@/components/RoleSwitcherBar";
import AdminNavbar from "@/components/AdminNavbar";
import {
  LayoutDashboard,
  CalendarCheck2,
  GraduationCap,
  Building,
  Users2,
  CalendarDays,
  Target,
  CloudUpload,
  FileSpreadsheet,
  ShieldAlert,
  Home,
  LogOut,
} from "lucide-react";

export const revalidate = 0;

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("zphs_session");

  if (!sessionCookie) {
    redirect("/login");
  }

  const user = verifyToken(sessionCookie.value);
  if (!user) {
    redirect("/login");
  }

  const role = user.role || "PARENT";

  const navLinks = [
    { href: "/portal/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { href: "/portal/attendance", label: "Attendance Tracking", icon: <CalendarCheck2 size={18} /> },
    { href: "/portal/grades", label: "Grade Reporting", icon: <GraduationCap size={18} /> },
    { href: "/portal/facilities", label: "Facility & Activities", icon: <Building size={18} /> },
    { href: "/portal/smc", label: "SMC (15 Members)", icon: <Users2 size={18} /> },
    { href: "/portal/ptc", label: "PTC Conferences", icon: <CalendarDays size={18} /> },
    { href: "/portal/campaigns", label: "Active Campaigns", icon: <Target size={18} /> },
    { href: "/portal/reports", label: "Reports & Exports", icon: <FileSpreadsheet size={18} /> },
    ...(role === "ADMIN"
      ? [{ href: "/portal/backup", label: "Google Drive Backup", icon: <CloudUpload size={18} /> }]
      : []),
  ];

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      {/* 1. Top Role Switcher Demo Toolbar */}
      <RoleSwitcherBar currentRole={user.role} currentName={user.name} />

      {/* 2. Offline Synchronization Status Banner */}
      <OfflineSyncBanner />

      {/* 3. Main Portal Header */}
      <header
        className="no-print"
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          {/* Logo & School Identity */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <img
                src="/images/school_logo.png"
                alt="ZPHS Somasanigunta"
                style={{ width: "42px", height: "42px", borderRadius: "50%", border: "2px solid #10b981", objectFit: "cover" }}
              />
              <div>
                <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#1e3a8a", lineHeight: "1.2" }}>
                  ZPHS Somasanigunta
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>
                  Role-Based Management Portal
                </div>
              </div>
            </Link>
          </div>

          {/* Right Header: Notification Drawer, Role Badge, and Navigation Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <NotificationDrawer />

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }} className="desktop-only">
              <Link href="/" target="_blank" className="btn btn-outline" style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}>
                <Home size={14} /> Public Website
              </Link>
              {role === "ADMIN" && (
                <Link href="/admin/dashboard" className="btn btn-primary" style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}>
                  <ShieldAlert size={14} /> Admin Console
                </Link>
              )}
            </div>

            <div style={{ width: "120px" }}>
              <AdminNavbar />
            </div>
          </div>
        </div>

        {/* 4. Sub-Navigation Bar */}
        <nav
          style={{
            backgroundColor: "#1e3a8a",
            color: "white",
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          <div className="container" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  padding: "0.75rem 1rem",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                  color: "#e2e8f0",
                  borderBottom: "3px solid transparent",
                  transition: "all 0.15s",
                }}
                className="portal-nav-item"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* 5. Main Content Area */}
      <main className="flex-1" style={{ padding: "1.5rem 0 3rem 0" }}>
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
}
