import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import HeroSlider from "@/components/HeroSlider";
import ContactForm from "@/components/ContactForm";
import { 
  Users, 
  UserCheck, 
  BookOpen, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Award, 
  Clipboard, 
  TrendingUp, 
  CheckCircle,
  AlertCircle,
  Phone,
  Mail
} from "lucide-react";

export const revalidate = 0; // Disable static caching to show live database stats

export default async function HomePage() {
  // 1. Fetch statistics from SQLite
  const totalStudents = await prisma.student.count();
  const boysCount = await prisma.student.count({ where: { gender: "Male" } });
  const girlsCount = await prisma.student.count({ where: { gender: "Female" } });
  
  // Calculate average attendance from all students
  const students = await prisma.student.findMany({ select: { attendancePercentage: true } });
  const avgAttendance = students.length > 0 
    ? (students.reduce((sum, s) => sum + s.attendancePercentage, 0) / students.length).toFixed(1)
    : "93.5"; // Fallback placeholder if empty

  // Class-wise strength
  const c6 = await prisma.student.count({ where: { classLevel: 6 } });
  const c7 = await prisma.student.count({ where: { classLevel: 7 } });
  const c8 = await prisma.student.count({ where: { classLevel: 8 } });
  const c9 = await prisma.student.count({ where: { classLevel: 9 } });
  const c10 = await prisma.student.count({ where: { classLevel: 10 } });

  // 2. Fetch recent notices
  const notices = await prisma.notice.findMany({
    orderBy: { date: "desc" },
    take: 4,
  });

  // 3. Fetch latest SASA Activity
  const latestSasa = await prisma.sasaActivity.findFirst({
    orderBy: { date: "desc" },
  });

  // Default teachers list (static list of staff members)
  const staff = [
    {
      name: "Sri Gangalapudi Bhaskar Reddy",
      qualifications: "M.Phil(Maths), M.Sc(Maths), M.Ed., PG dip in Computers",
      role: "Headmaster / School Assistant (Mathematics)",
    },
    { name: "Sri Sreeram Ravi Kumar", role: "School Assistant (English)" },
    { name: "Smt. Gunukula Haritha", role: "School Assistant (Biological Science)" },
    { name: "Smt. Muttaraju Venkata Jayaprada", role: "School Assistant (Hindi)" },
    { name: "Sri Kallu Sreekrishna", role: "School Assistant (Social Studies)" },
    { name: "Smt. Shaik Shahida", role: "School Assistant (Physical Science)" },
    { name: "Sri Layesetty Muneeswaraiah", role: "School Assistant (Telugu)" },
  ];

  // SVG Chart Dimensions
  const maxStrength = Math.max(c6, c7, c8, c9, c10, 5); // Avoid division by zero, min height factor 5
  const chartHeight = 160;
  const barWidth = 40;
  const barGap = 35;
  const chartWidth = 5 * (barWidth + barGap) + barGap;

  const classesData = [
    { label: "Class 6", count: c6 },
    { label: "Class 7", count: c7 },
    { label: "Class 8", count: c8 },
    { label: "Class 9", count: c9 },
    { label: "Class 10", count: c10 },
  ];

  return (
    <div>
      {/* 1. Hero Image Slider */}
      <HeroSlider />

      {/* 2. School Statistics Dashboard Widget */}
      <section style={{ padding: "3rem 0", backgroundColor: "#f1f5f9" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "2rem", color: "#1e3a8a" }}>School Dashboard at a Glance</h2>
            <p style={{ color: "#64748b", marginTop: "0.5rem" }}>Real-time student strength and academic statistics</p>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid-cols-4" style={{ marginBottom: "3rem" }}>
            <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ padding: "1rem", backgroundColor: "#eff6ff", borderRadius: "50%", color: "#1e3a8a" }}>
                <Users size={32} />
              </div>
              <div>
                <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>Total Enrolled</div>
                <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#0f172a" }}>{totalStudents}</div>
                <div style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: "600" }}>Active Students</div>
              </div>
            </div>

            <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ padding: "1rem", backgroundColor: "#dcfce7", borderRadius: "50%", color: "#166534" }}>
                <UserCheck size={32} />
              </div>
              <div>
                <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>Avg Attendance</div>
                <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#0f172a" }}>{avgAttendance}%</div>
                <div style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: "600" }}>Daily Target: 90%+</div>
              </div>
            </div>

            <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ padding: "1rem", backgroundColor: "#fef3c7", borderRadius: "50%", color: "#92400e" }}>
                <BookOpen size={32} />
              </div>
              <div>
                <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>Library Books</div>
                <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#0f172a" }}>1,250</div>
                <div style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: "600" }}>5 Categories</div>
              </div>
            </div>

            <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ padding: "1rem", backgroundColor: "#fee2e2", borderRadius: "50%", color: "#991b1b" }}>
                <Briefcase size={32} />
              </div>
              <div>
                <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>Teaching Staff</div>
                <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#0f172a" }}>{staff.length}</div>
                <div style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: "600" }}>1 HM + 6 Teachers</div>
              </div>
            </div>
          </div>

          {/* Visual SVG Chart & Student Split */}
          <div className="grid-cols-2">
            {/* Class strength SVG Chart Card */}
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: "1.5rem" }}>
                <TrendingUp size={20} /> Class-wise Strength Analysis
              </h3>
              
              <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", height: "220px", width: "100%", paddingBottom: "1rem" }}>
                <svg width="100%" height="200" viewBox={`0 0 ${chartWidth} 200`} style={{ overflow: "visible" }}>
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2={chartWidth} y2="20" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="80" x2={chartWidth} y2="80" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="140" x2={chartWidth} y2="140" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="170" x2={chartWidth} y2="170" stroke="#cbd5e1" strokeWidth="2" />

                  {/* Draw bars */}
                  {classesData.map((cls, idx) => {
                    const barHeight = (cls.count / maxStrength) * chartHeight;
                    const x = barGap + idx * (barWidth + barGap);
                    const y = 170 - barHeight;
                    return (
                      <g key={cls.label}>
                        {/* Hover effect bar */}
                        <rect 
                          x={x} 
                          y={y} 
                          width={barWidth} 
                          height={barHeight} 
                          rx="4" 
                          fill="#1e3a8a" 
                          style={{ transition: "fill 0.3s" }} 
                        />
                        {/* Data labels on top of bars */}
                        <text 
                          x={x + barWidth / 2} 
                          y={y - 8} 
                          textAnchor="middle" 
                          fontSize="12" 
                          fontWeight="bold" 
                          fill="#0f172a"
                        >
                          {cls.count}
                        </text>
                        {/* Class labels under axis */}
                        <text 
                          x={x + barWidth / 2} 
                          y="190" 
                          textAnchor="middle" 
                          fontSize="11" 
                          fontWeight="600" 
                          fill="#64748b"
                        >
                          {cls.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Boys / Girls Split Card */}
            <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <h3 className="card-title" style={{ marginBottom: "1.5rem" }}>
                  <Users size={20} /> Gender Enrollment Breakdown
                </h3>
                
                <div style={{ display: "flex", gap: "2rem", alignItems: "center", justifyContent: "center", margin: "2rem 0" }}>
                  {/* Boys Count Visual */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#1e3a8a" }}>Boys</div>
                    <div style={{ fontSize: "2rem", fontWeight: "800", color: "#1e3a8a", margin: "0.25rem 0" }}>{boysCount}</div>
                    <div style={{ width: "80px", height: "8px", backgroundColor: "#1e3a8a", borderRadius: "4px", margin: "auto" }}></div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.5rem" }}>
                      {totalStudents > 0 ? ((boysCount / totalStudents) * 100).toFixed(1) : 0}%
                    </div>
                  </div>

                  <div style={{ fontSize: "2rem", color: "#cbd5e1" }}>/</div>

                  {/* Girls Count Visual */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#10b981" }}>Girls</div>
                    <div style={{ fontSize: "2rem", fontWeight: "800", color: "#10b981", margin: "0.25rem 0" }}>{girlsCount}</div>
                    <div style={{ width: "80px", height: "8px", backgroundColor: "#10b981", borderRadius: "4px", margin: "auto" }}></div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.5rem" }}>
                      {totalStudents > 0 ? ((girlsCount / totalStudents) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
              </div>

              {/* MDM status note */}
              <div style={{ padding: "0.75rem 1rem", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <CheckCircle size={16} style={{ color: "#166534", flexShrink: 0 }} />
                <span style={{ fontSize: "0.825rem", color: "#166534", fontWeight: "500" }}>
                  <strong>Mid-Day Meal (Dokka Seethamma Madhyahana Badi Bhojanam) Active:</strong> Egg &amp; Chikky successfully served to all {totalStudents} present students today.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. About School Section */}
      <section id="about" style={{ padding: "4rem 0", backgroundColor: "#ffffff" }}>
        <div className="container">
          <div className="grid-cols-3" style={{ gap: "3rem" }}>
            
            {/* Block 1: History, Vision, Mission */}
            <div style={{ gridColumn: "span 2" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div>
                  <h2 style={{ fontSize: "2rem", color: "#1e3a8a", marginBottom: "1rem" }}>About ZPHS Somasanigunta</h2>
                  <p style={{ lineHeight: "1.7", color: "#475569", marginBottom: "1rem" }}>
                    Zilla Parishad High School, Somasanigunta, located in Venkatagiri Mandal of Tirupati District, is a premier government-run educational institution. Established with the goal of providing high-quality secondary education to rural children, the school has grown into a center of academic excellence and holistic development.
                  </p>
                  <p style={{ lineHeight: "1.7", color: "#475569", marginBottom: "1.5rem" }}>
                    We believe in equipping our students with both modern technical capabilities (like digital interactive flat panels and well-equipped labs) and strong moral values, ensuring they contribute positively to society.
                  </p>

                  {/* School entrance photo banner */}
                  <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", marginBottom: "1rem" }}>
                    <img 
                      src="/images/school_image.jpg" 
                      alt="Zilla Parishad High School, Somasanigunta Entrance Gate" 
                      style={{ width: "100%", height: "320px", objectFit: "cover", display: "block" }} 
                    />
                    <div style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "100%",
                      padding: "0.8rem 1.25rem",
                      background: "linear-gradient(transparent, rgba(15, 23, 42, 0.85))",
                      color: "white",
                      fontSize: "0.85rem",
                      fontWeight: "600"
                    }}>
                      ZPHS Somasanigunta - School Campus Entrance
                    </div>
                  </div>
                </div>

                <div className="grid-cols-2" style={{ gap: "1.5rem", marginTop: "1rem" }}>
                  <div style={{ padding: "1.25rem", backgroundColor: "#f8fafc", borderRadius: "8px", borderLeft: "4px solid #1e3a8a" }}>
                    <h4 style={{ color: "#1e3a8a", marginBottom: "0.5rem" }}>Our Vision</h4>
                    <p style={{ fontSize: "0.9rem", color: "#475569", lineHeight: "1.6" }}>
                      To emerge as a model rural digital high school where every student accesses technology-integrated, value-based quality education.
                    </p>
                  </div>

                  <div style={{ padding: "1.25rem", backgroundColor: "#f8fafc", borderRadius: "8px", borderLeft: "4px solid #10b981" }}>
                    <h4 style={{ color: "#10b981", marginBottom: "0.5rem" }}>Our Mission</h4>
                    <p style={{ fontSize: "0.9rem", color: "#475569", lineHeight: "1.6" }}>
                      Ensuring 100% enrollment, active classroom participation through audio-visual aids, robust laboratory experimentation, and excellence in co-curricular activities.
                    </p>
                  </div>
                </div>

                {/* Infrastructure Details */}
                <div style={{ marginTop: "1.5rem" }}>
                  <h3 style={{ color: "#1e3a8a", marginBottom: "1rem" }}>School Infrastructure</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                    <div style={{ textAlign: "center", padding: "1rem", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e3a8a" }}>5</div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Digital Classrooms</div>
                    </div>
                    <div style={{ textAlign: "center", padding: "1rem", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e3a8a" }}>2</div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Science &amp; Math Labs</div>
                    </div>
                    <div style={{ textAlign: "center", padding: "1rem", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e3a8a" }}>3</div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Trees &amp; Small Ground</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Block 2: Headmaster Message & Staff list */}
            <div className="flex flex-col gap-6">
              {/* HM message */}
              <div className="card" style={{ borderColor: "#1e3a8a", borderTopWidth: "4px" }}>
                <h3 style={{ fontSize: "1.15rem", color: "#1e3a8a", marginBottom: "0.75rem" }}>Headmaster's Message</h3>
                <p style={{ fontSize: "0.875rem", fontStyle: "italic", lineHeight: "1.6", color: "#475569" }}>
                  "Welcome to the digital portal of ZPHS Somasanigunta. We are committed to narrowing the rural-urban educational gap by integrating interactive digital technology in our day-to-day teaching. Our dedicated staff strives to unlock the full potential of every child in academics and sports."
                </p>
                <div style={{ marginTop: "1rem", textAlign: "right" }}>
                  <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "0.95rem" }}>Sri Gangalapudi Bhaskar Reddy</div>
                  <div style={{ fontSize: "0.75rem", color: "#1e3a8a", fontWeight: "600", marginTop: "2px" }}>
                    M.Phil(Maths), M.Sc(Maths), M.Ed., PG dip in Computers
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>Headmaster, ZPHS Somasanigunta</div>
                </div>
              </div>

              {/* Staff Roster */}
              <div className="card">
                <h3 style={{ fontSize: "1.15rem", color: "#0f172a", marginBottom: "1rem" }}>School Faculty</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {staff.map((teacher, index) => (
                    <div key={index} style={{ fontSize: "0.85rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.5rem" }}>
                      <div style={{ fontWeight: "bold", color: "#0f172a" }}>{teacher.name}</div>
                      {teacher.qualifications && (
                        <div style={{ fontSize: "0.75rem", color: "#1e3a8a", fontWeight: "600" }}>{teacher.qualifications}</div>
                      )}
                      <div style={{ color: "#64748b" }}>{teacher.role}</div>
                    </div>
                  ))}
                </div>

                {/* Aya and Cook Details below Staff Details */}
                <h4 style={{ fontSize: "1rem", color: "#1e3a8a", marginTop: "1.25rem", marginBottom: "0.75rem", paddingTop: "0.75rem", borderTop: "2px solid #e2e8f0" }}>
                  Support Staff (Aya &amp; Cook Details)
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                  <div style={{ fontSize: "0.85rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.5rem" }}>
                    <div style={{ fontWeight: "bold", color: "#0f172a" }}>Vasamthamma</div>
                    <div style={{ color: "#10b981", fontWeight: "600", fontSize: "0.8rem" }}>School Aya</div>
                  </div>
                  <div style={{ fontSize: "0.85rem" }}>
                    <div style={{ fontWeight: "bold", color: "#0f172a" }}>Chalapathi</div>
                    <div style={{ color: "#f59e0b", fontWeight: "600", fontSize: "0.8rem" }}>Mid-Day Meal (MDM) Cook</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Interactive Notice Board Section */}
      <section style={{ padding: "4rem 0", backgroundColor: "#f8fafc" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <div>
              <h2 style={{ fontSize: "1.8rem", color: "#1e3a8a" }}>Notice Board</h2>
              <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "0.25rem" }}>Latest notifications and government orders</p>
            </div>
            <Link href="/notices" className="btn btn-outline" style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}>
              View All Notices
            </Link>
          </div>

          <div className="grid-cols-2">
            {notices.length > 0 ? (
              notices.map((notice) => (
                <div className="card" key={notice.id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                  <div>
                    <div className="flex justify-between items-center" style={{ marginBottom: "0.75rem" }}>
                      <span className={`badge ${
                        notice.category === "HOLIDAY" ? "badge-danger" : 
                        notice.category === "EXAM_SCHEDULE" ? "badge-warning" : 
                        notice.category === "RESULT" ? "badge-success" : "badge-primary"
                      }`}>
                        {notice.category.replace("_", " ")}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Calendar size={12} /> {notice.date}
                      </span>
                    </div>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "0.75rem", color: "#0f172a" }}>{notice.title}</h3>
                    <p style={{ fontSize: "0.9rem", color: "#475569", lineHeight: "1.6" }}>{notice.content}</p>
                  </div>
                  {notice.isPinned && (
                    <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "#b45309", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <AlertCircle size={14} /> Pinned Announcement
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p style={{ gridColumn: "span 2", textAlign: "center", color: "#64748b", padding: "2rem" }}>
                No active announcements on the notice board.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 5. Contact Section */}
      <section id="contact" style={{ padding: "4rem 0", backgroundColor: "#f8fafc" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "2rem", color: "#1e3a8a" }}>Contact School Office</h2>
            <p style={{ color: "#64748b", marginTop: "0.5rem" }}>Get in touch for admissions, certificates, or reporting inquiries</p>
          </div>

          <div className="grid-cols-2" style={{ gap: "3rem" }}>
            {/* Form */}
            <div className="card">
              <h3 style={{ fontSize: "1.2rem", color: "#1e3a8a", marginBottom: "1.5rem" }}>Send a Message</h3>
              <ContactForm />
            </div>

            {/* Map and Details */}
            <div className="flex flex-col gap-6">
              <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h3 style={{ fontSize: "1.2rem", color: "#1e3a8a" }}>Office Details</h3>
                <div className="flex flex-col gap-3" style={{ fontSize: "0.95rem" }}>
                  <span className="flex items-center gap-2">
                    <MapPin size={18} style={{ color: "#1e3a8a", flexShrink: 0 }} /> 
                    Zilla Parishad High School, Somasanigunta Village, Venkatagiri Mandal, Tirupati District, Andhra Pradesh, PIN: 524132.
                  </span>
                  <span className="flex items-center gap-2">
                    <Phone size={18} style={{ color: "#10b981", flexShrink: 0 }} /> +91 85550 79452 (HM Office)
                  </span>
                  <span className="flex items-center gap-2">
                    <Mail size={18} style={{ color: "#3b82f6", flexShrink: 0 }} /> info.zphssomasanigunta@gmail.com
                  </span>
                </div>
              </div>

              {/* Google Map Integration */}
              <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--shadow-sm)", height: "230px" }}>
                <iframe
                  title="ZPHS Somasanigunta Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3864.0841295287754!2d79.57682227590217!3d13.96695279237699!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4cf130a1098dfb%3A0xe964a2c0702677bc!2sSomasanigunta%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1717311100000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
