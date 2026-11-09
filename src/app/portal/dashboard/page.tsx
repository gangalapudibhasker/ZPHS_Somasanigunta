import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import {
  CalendarCheck2,
  GraduationCap,
  Users2,
  CalendarDays,
  Target,
  CloudUpload,
  FileSpreadsheet,
  Award,
  Clock,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Building,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export const revalidate = 0;

export default async function PortalDashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("zphs_session");
  if (!sessionCookie) redirect("/login");

  const user = verifyToken(sessionCookie.value);
  if (!user) redirect("/login");

  const role = user.role || "PARENT";

  // Data queries
  const studentsCount = await prisma.student.count();
  const activeCampaigns = await prisma.activeCampaign.findMany({ take: 3 });
  const recentNotices = await prisma.notification.findMany({
    where: { OR: [{ targetRole: "ALL" }, { targetRole: role }] },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  const activeProposals = await prisma.smcProposal.findMany({
    where: { status: "ACTIVE" },
    take: 2,
  });

  // If Parent or Student, fetch linked student record
  let linkedStudent: any = null;
  let studentGrades: any[] = [];
  let studentAttendanceCount = 0;

  if (user.studentAdmissionNo) {
    linkedStudent = await prisma.student.findUnique({
      where: { admissionNo: user.studentAdmissionNo },
    });

    if (linkedStudent) {
      studentGrades = await prisma.gradeReport.findMany({
        where: { admissionNo: linkedStudent.admissionNo },
        orderBy: { createdAt: "desc" },
      });
      studentAttendanceCount = await prisma.attendanceRecord.count({
        where: { admissionNo: linkedStudent.admissionNo, status: "PRESENT" },
      });
    }
  }

  // Teacher / Admin specific counts
  const totalAttendanceLoggedToday = await prisma.attendanceRecord.count({
    where: { date: new Date().toISOString().split("T")[0] },
  });

  const upcomingPtcs = await prisma.ptConference.findMany({
    where: { status: "BOOKED" },
    take: 3,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* 1. Personalized Hero Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 60%, #047857 100%)",
          color: "white",
          padding: "2.25rem",
          borderRadius: "16px",
          boxShadow: "var(--shadow-md)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <span
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                padding: "3px 12px",
                borderRadius: "9999px",
                fontSize: "0.75rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {role} Portal Workspace
            </span>
            <Sparkles size={18} style={{ color: "#facc15" }} />
          </div>
          <h1 style={{ fontSize: "1.85rem", color: "white", fontWeight: "800", lineHeight: "1.2" }}>
            Welcome, {user.name}
          </h1>
          <p style={{ opacity: 0.9, marginTop: "0.5rem", fontSize: "0.95rem", maxWidth: "650px" }}>
            Zilla Parishad High School, Somasanigunta management and academic tracking system.
            {role === "PARENT" && " Monitor your child's live attendance records and automated grade report cards below."}
            {role === "TEACHER" && " Mark class attendance, update grade matrices, and upload classroom activity photos."}
            {role === "STUDENT" && " Track your academic progress, SA exam cards, and daily attendance."}
            {role === "SMC" && " Review school development proposals, cast your committee votes, and track action items."}
            {role === "ADMIN" && " Comprehensive oversight of students, faculty, SMC committee, and Google Drive backups."}
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {role === "TEACHER" && (
            <Link href="/portal/attendance" className="btn btn-accent" style={{ fontSize: "0.9rem" }}>
              <CalendarCheck2 size={16} /> Mark Today's Attendance
            </Link>
          )}
          {role === "PARENT" && (
            <Link href="/portal/ptc" className="btn btn-accent" style={{ fontSize: "0.9rem" }}>
              <CalendarDays size={16} /> Book Teacher Conference
            </Link>
          )}
          {role === "SMC" && (
            <Link href="/portal/smc" className="btn btn-accent" style={{ fontSize: "0.9rem" }}>
              <Users2 size={16} /> View Proposals &amp; Vote
            </Link>
          )}
          <Link href="/portal/grades" className="btn btn-outline" style={{ borderColor: "white", color: "white", fontSize: "0.9rem" }}>
            <GraduationCap size={16} /> Grade Reports
          </Link>
        </div>
      </div>

      {/* 2. Role-Tailored Feature Panels */}

      {/* PARENT & STUDENT VIEW */}
      {(role === "PARENT" || role === "STUDENT") && linkedStudent && (
        <div className="card" style={{ borderLeft: "5px solid #10b981", padding: "1.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.5rem" }}>
            <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
              <img
                src={linkedStudent.photo || "/images/placeholders/student_male.svg"}
                alt={linkedStudent.name}
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #10b981",
                  boxShadow: "var(--shadow-sm)",
                }}
              />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <h2 style={{ fontSize: "1.35rem", color: "#1e3a8a", fontWeight: "700" }}>{linkedStudent.name}</h2>
                  <span className="badge badge-primary">Class {linkedStudent.classLevel}</span>
                  <span className="badge badge-success">Roll #{linkedStudent.rollNo}</span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>
                  Admission No: <strong>{linkedStudent.admissionNo}</strong> | Blood Group: <strong>{linkedStudent.bloodGroup || "N/A"}</strong>
                </div>
                <div style={{ fontSize: "0.85rem", color: "#334155", marginTop: "0.25rem" }}>
                  Parent: <strong>{linkedStudent.parentName}</strong> ({linkedStudent.mobileNo})
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Attendance Rate</div>
                <div style={{ fontSize: "1.75rem", fontWeight: "800", color: linkedStudent.attendancePercentage >= 90 ? "#15803d" : "#b45309" }}>
                  {linkedStudent.attendancePercentage}%
                </div>
                <div style={{ fontSize: "0.75rem", color: "#15803d", fontWeight: "600" }}>Excellent Attendance</div>
              </div>

              <div style={{ textAlign: "center", borderLeft: "1px solid #e2e8f0", paddingLeft: "1.5rem" }}>
                <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Academic Standing</div>
                <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#1e3a8a" }}>
                  {studentGrades.length > 0 ? `${studentGrades[0].gpa} GPA` : linkedStudent.academicPerformance}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: "600" }}>
                  {studentGrades.length > 0 ? `Grade: ${studentGrades[0].overallGrade} (${studentGrades[0].examName})` : "Active"}
                </div>
              </div>
            </div>
          </div>

          {/* Student's Recent Grade Reports Carousel/Grid */}
          {studentGrades.length > 0 && (
            <div style={{ marginTop: "1.5rem", borderTop: "1px solid #f1f5f9", paddingTop: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <h3 style={{ fontSize: "1rem", color: "#0f172a", fontWeight: "700" }}>Latest Automated Progress Cards</h3>
                <Link href="/portal/grades" style={{ fontSize: "0.8rem", color: "#1e3a8a", fontWeight: "700" }}>
                  View All &amp; Download PDF Report Card →
                </Link>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                {studentGrades.map((g) => (
                  <div
                    key={g.id}
                    style={{
                      backgroundColor: "#f8fafc",
                      padding: "1rem",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span style={{ fontWeight: "700", color: "#1e3a8a", fontSize: "0.95rem" }}>{g.examName} ({g.academicYear})</span>
                      <span className="badge badge-accent" style={{ fontWeight: "800" }}>{g.overallGrade} ({g.gpa} GPA)</span>
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#334155", marginBottom: "0.5rem" }}>
                      Total Score: <strong>{g.totalMarks} / {g.maxMarks}</strong> ({g.percentage}%)
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b", fontStyle: "italic", lineHeight: "1.4" }}>
                      "{g.teacherRemarks}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Global KPI Cards Grid */}
      <div className="grid-cols-4">
        <Link href="/portal/attendance" className="card" style={{ borderLeft: "4px solid #3b82f6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>Students Enrolled</div>
              <div style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a", margin: "0.25rem 0" }}>{studentsCount}</div>
              <div style={{ fontSize: "0.8rem", color: "#10b981", fontWeight: "600" }}>Classes 6th to 10th</div>
            </div>
            <CalendarCheck2 size={24} style={{ color: "#3b82f6" }} />
          </div>
        </Link>

        <Link href="/portal/smc" className="card" style={{ borderLeft: "4px solid #dc2626" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>SMC Committee</div>
              <div style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a", margin: "0.25rem 0" }}>15 Members</div>
              <div style={{ fontSize: "0.8rem", color: "#dc2626", fontWeight: "600" }}>{activeProposals.length} Proposals Open for Vote</div>
            </div>
            <Users2 size={24} style={{ color: "#dc2626" }} />
          </div>
        </Link>

        <Link href="/portal/campaigns" className="card" style={{ borderLeft: "4px solid #10b981" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>Active Campaigns</div>
              <div style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a", margin: "0.25rem 0" }}>5 Running</div>
              <div style={{ fontSize: "0.8rem", color: "#10b981", fontWeight: "600" }}>93.8% School Attendance</div>
            </div>
            <Target size={24} style={{ color: "#10b981" }} />
          </div>
        </Link>

        <Link href="/portal/backup" className="card" style={{ borderLeft: "4px solid #8b5cf6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>Google Drive Backup</div>
              <div style={{ fontSize: "1.35rem", fontWeight: "800", color: "#0f172a", margin: "0.5rem 0" }}>Connected</div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Folder: School Management data</div>
            </div>
            <CloudUpload size={24} style={{ color: "#8b5cf6" }} />
          </div>
        </Link>
      </div>

      {/* 4. Split Modules: SMC Proposals Awaiting Action & Active Campaigns */}
      <div className="grid-cols-2">
        {/* SMC Proposals Card */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Users2 size={18} style={{ color: "#dc2626" }} />
                School Management Committee (SMC) Active Voting
              </h3>
              <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "2px" }}>
                15 statutory members participating in school development decisions
              </p>
            </div>
            <Link href="/portal/smc" style={{ fontSize: "0.8rem", color: "#1e3a8a", fontWeight: "bold" }}>
              View All →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
            {activeProposals.map((prop) => {
              const totalVotes = prop.yesCount + prop.noCount + prop.abstainCount;
              const quorumPercent = Math.round((totalVotes / 15) * 100);
              return (
                <div
                  key={prop.id}
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "1rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <span className="badge badge-primary" style={{ fontSize: "0.7rem", marginBottom: "0.25rem" }}>
                        {prop.proposalCode}
                      </span>
                      <h4 style={{ fontSize: "0.95rem", color: "#0f172a", marginTop: "0.25rem" }}>{prop.title}</h4>
                      <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.25rem" }}>
                        Budget: <strong>₹{prop.budget.toLocaleString()}</strong> | Deadline: {prop.votingDeadline}
                      </p>
                    </div>
                    <span className="badge badge-warning" style={{ fontWeight: "700" }}>ACTIVE</span>
                  </div>

                  {/* Quorum Progress Bar */}
                  <div style={{ marginTop: "0.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.25rem", color: "#475569" }}>
                      <span>Quorum Progress: <strong>{totalVotes} of 15 Members Voted</strong></span>
                      <span style={{ fontWeight: "bold" }}>{quorumPercent}%</span>
                    </div>
                    <div style={{ height: "6px", width: "100%", backgroundColor: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${quorumPercent}%`, backgroundColor: "#10b981", borderRadius: "3px" }} />
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem" }}>
                    <div style={{ fontSize: "0.8rem", display: "flex", gap: "0.75rem" }}>
                      <span style={{ color: "#15803d", fontWeight: "bold" }}>✓ {prop.yesCount} YES</span>
                      <span style={{ color: "#b91c1c", fontWeight: "bold" }}>✗ {prop.noCount} NO</span>
                      <span style={{ color: "#64748b" }}>– {prop.abstainCount} Abstain</span>
                    </div>
                    <Link href="/portal/smc" className="btn btn-primary" style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}>
                      Cast Vote
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Campaigns Tracker Card */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Target size={18} style={{ color: "#10b981" }} />
                Active Campaigns &amp; School KPIs
              </h3>
              <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "2px" }}>
                Real-time tracking of institutional milestones
              </p>
            </div>
            <Link href="/portal/campaigns" style={{ fontSize: "0.8rem", color: "#1e3a8a", fontWeight: "bold" }}>
              Analytics →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
            {activeCampaigns.map((c) => {
              const progress = Math.min(100, Math.round((c.currentValue / c.targetValue) * 100));
              return (
                <div key={c.id} style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{ fontWeight: "700", color: "#0f172a", fontSize: "0.9rem" }}>{c.title}</span>
                    <span style={{ fontWeight: "800", color: progress >= 90 ? "#15803d" : "#2563eb", fontSize: "0.9rem" }}>
                      {c.currentValue} / {c.targetValue} {c.unit}
                    </span>
                  </div>
                  <div style={{ height: "6px", width: "100%", backgroundColor: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progress}%`, backgroundColor: progress >= 90 ? "#10b981" : "#3b82f6", borderRadius: "3px" }} />
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.5rem", lineHeight: "1.3" }}>
                    {c.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Quick Access Shortcuts Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h3 style={{ fontSize: "1.15rem", color: "#0f172a", fontWeight: "700" }}>System Module Direct Links</h3>
        <div className="grid-cols-4">
          <Link href="/portal/attendance" className="card" style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
            <CalendarCheck2 size={28} style={{ color: "#3b82f6", margin: "0 auto 0.5rem auto" }} />
            <h4 style={{ fontSize: "1rem", color: "#0f172a" }}>Daily Attendance</h4>
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>Classes 6 to 10 register &amp; SMS alerts</p>
          </Link>

          <Link href="/portal/grades" className="card" style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
            <GraduationCap size={28} style={{ color: "#10b981", margin: "0 auto 0.5rem auto" }} />
            <h4 style={{ fontSize: "1rem", color: "#0f172a" }}>Grade Reporting</h4>
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>FA &amp; SA cards with auto-GPA calculation</p>
          </Link>

          <Link href="/portal/facilities" className="card" style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
            <Building size={28} style={{ color: "#8b5cf6", margin: "0 auto 0.5rem auto" }} />
            <h4 style={{ fontSize: "1rem", color: "#0f172a" }}>Facility &amp; Photos</h4>
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>Classroom activity uploads &amp; notes</p>
          </Link>

          <Link href="/portal/reports" className="card" style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
            <FileSpreadsheet size={28} style={{ color: "#f59e0b", margin: "0 auto 0.5rem auto" }} />
            <h4 style={{ fontSize: "1rem", color: "#0f172a" }}>BI Reports &amp; Exports</h4>
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>Encrypted PDF &amp; CSV data export</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
