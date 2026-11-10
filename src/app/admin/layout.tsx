import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import AdminNavbar from "@/components/AdminNavbar";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Utensils, 
  BookOpen, 
  FolderOpen, 
  Layers, 
  Camera, 
  Bell, 
  LogOut,
  School,
  Sparkles,
  Award,
  Calendar,
  Clock,
  GraduationCap,
  HeartHandshake,
  Crown,
  HeartPulse,
  ShieldCheck,
  BarChart3
} from "lucide-react";

export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Server-side session verification
  let adminUser: any = null;
  if (process.env.GITHUB_PAGES !== "true") {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("zphs_session");

    if (!sessionCookie) {
      redirect("/login");
    }

    const admin = verifyToken(sessionCookie.value);
    if (!admin) {
      redirect("/login");
    }
    adminUser = admin;
  }

  const sidebarLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={19} /> },
    { href: "/admin/students", label: "Students & Admissions", icon: <Users size={19} /> },
    { href: "/admin/study-certificate", label: "Study Certificate Gen", icon: <Award size={19} /> },
    { href: "/admin/timetable", label: "Class Timetable", icon: <Clock size={19} /> },
    { href: "/admin/mdm", label: "MDM (Mid-Day Meals)", icon: <Utensils size={19} /> },
    { href: "/admin/events", label: "School Events", icon: <Calendar size={19} /> },
    { href: "/admin/donors", label: "Donors Details", icon: <HeartHandshake size={19} /> },
    { href: "/admin/smc", label: "School Mgmt Committee", icon: <ShieldCheck size={19} /> },
    { href: "/admin/reports", label: "Reports & Google Sheets", icon: <BarChart3 size={19} /> },
    { href: "/admin/activities", label: "Students Activities", icon: <Sparkles size={19} /> },
    { href: "/admin/nominal-roll", label: "Nominal Roll (10th)", icon: <FileText size={19} /> },
    { href: "/admin/book-indent", label: "Books Indent", icon: <BookOpen size={19} /> },
    { href: "/admin/files", label: "Office Files", icon: <FolderOpen size={19} /> },
    { href: "/admin/gallery", label: "Photo Gallery", icon: <Camera size={19} /> },
    { href: "/admin/notices", label: "Notice Board", icon: <Bell size={19} /> },
  ];

  return (
    <div className="flex" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* 1. Sidebar Navigation */}
      <aside 
        className="admin-sidebar no-print" 
        style={{
          width: "260px",
          backgroundColor: "#0f172a",
          color: "#94a3b8",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #1e293b",
          flexShrink: 0
        }}
      >
        {/* Brand */}
        <div style={{ padding: "1.5rem 1.25rem", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <img
            src="/images/school_logo.png"
            alt="ZPHS Logo"
            style={{ width: "38px", height: "38px", borderRadius: "50%", border: "1.5px solid #10b981", objectFit: "cover" }}
          />
          <div>
            <h1 style={{ color: "white", fontSize: "1.05rem", fontWeight: "bold" }}>ZPHS Admin</h1>
            <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>Somasanigunta Portal</span>
          </div>
        </div>

        {/* Links */}
        <nav style={{ padding: "1.5rem 0.75rem", display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                fontSize: "0.925rem",
                fontWeight: "600",
                color: "#cbd5e1",
                transition: "all 0.2s"
              }}
              className="admin-sidebar-link"
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Footer actions / Admin details */}
        <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid #1e293b" }}>
          <div style={{ fontSize: "0.8rem", color: "white", fontWeight: "bold" }}>{adminUser?.name || "Administrator"}</div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "capitalize", marginBottom: "0.75rem" }}>{(adminUser?.role || "Admin").toLowerCase()}</div>
          <AdminNavbar />
        </div>
      </aside>

      {/* 2. Main Content Viewport */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowX: "hidden" }}>
        {/* Top bar header */}
        <header 
          className="no-print" 
          style={{ 
            height: "70px", 
            backgroundColor: "white", 
            borderBottom: "1px solid #e2e8f0", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            padding: "0 2rem" 
          }}
        >
          <h2 style={{ fontSize: "1.25rem", color: "#0f172a", fontWeight: "700" }}>Administrative Workspace</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link href="/" target="_blank" className="btn btn-outline" style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}>
              View Public Website
            </Link>
          </div>
        </header>

        {/* Sub-page viewport */}
        <main className="flex-1" style={{ padding: "2rem", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
