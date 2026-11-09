import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Calendar, 
  LogIn, 
  FileText, 
  BookOpen, 
  Camera, 
  Users, 
  Home, 
  Layers,
  Sparkles,
  Award,
  Utensils,
  HeartHandshake,
  Crown,
  BarChart3,
  GraduationCap,
  ShieldCheck
} from "lucide-react";

export const revalidate = 0; // Disable caching for layout to keep notices fresh

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch pinned notices for the ticker banner
  const pinnedNotices = await prisma.notice.findMany({
    where: { isPinned: true },
    orderBy: { date: "desc" },
    take: 5,
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Main School Header Section */}
      <header style={{ backgroundColor: "#ffffff", padding: "1.5rem 0", borderBottom: "4px solid #1e3a8a", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }} className="no-print">
        <div className="container flex items-center justify-between" style={{ flexWrap: "wrap", gap: "1rem" }}>
          <div className="flex items-center gap-4">
            {/* School Logo Image */}
            <img
              src="/images/school_logo.png"
              alt="ZPHS Somasanigunta School Logo"
              style={{
                width: "75px",
                height: "75px",
                borderRadius: "50%",
                objectFit: "cover",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                border: "2px solid #10b981"
              }}
            />
            <div>
              <h1 style={{ fontSize: "1.6rem", color: "#1e3a8a", fontWeight: "800", letterSpacing: "-0.5px" }}>
                ZILLA PARISHAD HIGH SCHOOL
              </h1>
              <p style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: "500" }}>
                Somasanigunta, Venkatagiri Mandal, Tirupati District, Andhra Pradesh
              </p>
              <p style={{ fontSize: "0.8rem", color: "#10b981", fontWeight: "bold", fontStyle: "italic", marginTop: "2px" }}>
                Motto: Tamasoma Jyotirgamaya (Lead us from Darkness to Light)
              </p>
            </div>
          </div>

          {/* Quick Stats & Admin Portal Info (Opposite School Name) */}
          <div className="flex items-center gap-6" style={{ flexWrap: "wrap" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "bold" }}>School Code</div>
              <div style={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: "700" }}>UDISE: 28193503404</div>
            </div>
            
            <div style={{ height: "30px", width: "1px", backgroundColor: "#cbd5e1" }} className="desktop-only"></div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", textAlign: "right", alignItems: "flex-end" }}>
              <span className="flex items-center gap-1.5" style={{ fontSize: "0.85rem", color: "#334155", fontWeight: "600" }}>
                <Phone size={14} style={{ color: "#10b981" }} /> +91 85550 79452
              </span>
              <Link href="/login" className="flex items-center gap-1.5 header-admin-link" style={{ fontSize: "0.85rem", fontWeight: "700" }}>
                <LogIn size={14} /> Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Sticky Navigation Menu */}
      <nav style={{
        position: "sticky",
        top: 0,
        backgroundColor: "#1e3a8a",
        color: "white",
        zIndex: 100,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      }} className="no-print">
        <div className="container flex items-center justify-between" style={{ overflowX: "auto", scrollbarWidth: "none" }}>
          <div className="flex" style={{ width: "100%", flexWrap: "nowrap", whiteSpace: "nowrap" }}>
            <Link href="/" className="flex items-center gap-1.5" style={{ padding: "0.9rem 0.9rem", fontWeight: "600", fontSize: "0.88rem", borderBottom: "3px solid transparent" }}>
              <Home size={15} /> Home
            </Link>
            <Link href="/timetable" className="flex items-center gap-1.5" style={{ padding: "0.9rem 0.9rem", fontWeight: "600", fontSize: "0.88rem", borderBottom: "3px solid transparent" }}>
              <Clock size={15} /> Timetable
            </Link>
            <Link href="/study-certificate" className="flex items-center gap-1.5" style={{ padding: "0.9rem 0.9rem", fontWeight: "600", fontSize: "0.88rem", borderBottom: "3px solid transparent" }}>
              <Award size={15} /> Study Certificate
            </Link>
            <Link href="/events" className="flex items-center gap-1.5" style={{ padding: "0.9rem 0.9rem", fontWeight: "600", fontSize: "0.88rem", borderBottom: "3px solid transparent" }}>
              <Calendar size={15} /> Events
            </Link>
            <Link href="/donors" className="flex items-center gap-1.5" style={{ padding: "0.9rem 0.9rem", fontWeight: "600", fontSize: "0.88rem", borderBottom: "3px solid transparent" }}>
              <HeartHandshake size={15} /> Donors
            </Link>
            <Link href="/smc" className="flex items-center gap-1.5" style={{ padding: "0.9rem 0.9rem", fontWeight: "600", fontSize: "0.88rem", borderBottom: "3px solid transparent" }}>
              <ShieldCheck size={15} /> SMC
            </Link>
            <Link href="/activities" className="flex items-center gap-1.5" style={{ padding: "0.9rem 0.9rem", fontWeight: "600", fontSize: "0.88rem", borderBottom: "3px solid transparent" }}>
              <Sparkles size={15} /> Activities
            </Link>
            <Link href="/reports" className="flex items-center gap-1.5" style={{ padding: "0.9rem 0.9rem", fontWeight: "600", fontSize: "0.88rem", borderBottom: "3px solid transparent" }}>
              <BarChart3 size={15} /> Reports & Sheets
            </Link>
            <Link href="/portfolios" className="flex items-center gap-1.5" style={{ padding: "0.9rem 0.9rem", fontWeight: "600", fontSize: "0.88rem", borderBottom: "3px solid transparent" }}>
              <FileText size={15} /> Portfolios
            </Link>
            <Link href="/gallery" className="flex items-center gap-1.5" style={{ padding: "0.9rem 0.9rem", fontWeight: "600", fontSize: "0.88rem", borderBottom: "3px solid transparent" }}>
              <Camera size={15} /> Gallery
            </Link>
          </div>
        </div>
      </nav>

      {/* 3. Scrolling Announcement Ticker (Placed below navigation menu) */}
      <div className="notice-ticker">
        <div className="ticker-content">
          {pinnedNotices.length > 0 ? (
            pinnedNotices.map((notice) => (
              <span key={notice.id}>
                📢 [{notice.category}] {notice.title} ({notice.date})
              </span>
            ))
          ) : (
            <span>Welcome to Zilla Parishad High School (ZPHS), Somasanigunta. Admissions open for Academic Year 2026-2027!</span>
          )}
        </div>
      </div>

      {/* 4. Content Area */}
      <main className="flex-1" style={{ paddingBottom: "3rem" }}>
        {children}
      </main>

      {/* 6. Footer Section */}
      <footer style={{ backgroundColor: "#0f172a", color: "#cbd5e1", padding: "4rem 0 2rem 0", borderTop: "4px solid #10b981" }} className="no-print">
        <div className="container">
          <div className="grid-cols-3" style={{ marginBottom: "3rem" }}>
            {/* Column 1: School Address */}
            <div className="flex flex-col gap-4">
              <h3 style={{ color: "white", fontSize: "1.2rem", fontWeight: "700" }}>ZPHS Somasanigunta</h3>
              <p style={{ fontSize: "0.9rem", lineHeight: "1.6" }}>
                Serving the student community of Somasanigunta and surrounding villages in Venkatagiri Mandal, Tirupati District. Providing high-quality digital education, state-of-the-art labs, and strong sports coaching.
              </p>
              <div className="flex flex-col gap-2" style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
                <span className="flex items-center gap-2">
                  <MapPin size={16} style={{ color: "#10b981" }} /> Somasanigunta (V), Venkatagiri (M), Tirupati (Dt), Andhra Pradesh, India.
                </span>
                <span className="flex items-center gap-2">
                  <Phone size={16} style={{ color: "#10b981" }} /> +91 85550 79452
                </span>
                <span className="flex items-center gap-2">
                  <Mail size={16} style={{ color: "#10b981" }} /> info.zphssomasanigunta@gmail.com
                </span>
              </div>
            </div>

            {/* Column 2: Useful Links */}
            <div className="flex flex-col gap-4" style={{ paddingLeft: "1.5rem" }}>
              <h3 style={{ color: "white", fontSize: "1.2rem", fontWeight: "700" }}>Quick Resources</h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.95rem" }}>
                <li>
                  <Link href="/portfolios" className="footer-link-gray">
                    Student Portfolio Search
                  </Link>
                </li>
                <li>
                  <Link href="/facilities" className="footer-link-gray">
                    Classroom &amp; Lab Facilities
                  </Link>
                </li>
                <li>
                  <Link href="/notices" className="footer-link-gray">
                    Circulars &amp; Announcements
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="footer-link-amber">
                    Secure Administrator Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Government Links */}
            <div className="flex flex-col gap-4">
              <h3 style={{ color: "white", fontSize: "1.2rem", fontWeight: "700" }}>Government Portals</h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.95rem" }}>
                <li>
                  <a href="https://studentinfo.ap.gov.in" target="_blank" rel="noopener noreferrer" className="footer-link-gray">
                    AP Student Info Portal
                  </a>
                </li>
                <li>
                  <a href="https://cse.ap.gov.in" target="_blank" rel="noopener noreferrer" className="footer-link-gray">
                    Commissioner of School Education, AP
                  </a>
                </li>
                <li>
                  <a href="https://schooledu.ap.gov.in" target="_blank" rel="noopener noreferrer" className="footer-link-gray">
                    DOKKA SEETHAMMA MADHYAHANA BADI BHOJANAM(MDM)
                  </a>
                </li>
                <li>
                  <a href="https://schooledu.ap.gov.in" target="_blank" rel="noopener noreferrer" className="footer-link-gray">
                    AP School Education Department
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright Divider */}
          <div style={{ borderTop: "1px solid #1e293b", paddingTop: "2rem", fontSize: "0.85rem", textAlign: "center", color: "#64748b" }}>
            <p>© {new Date().getFullYear()} ZPHS Somasanigunta. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
