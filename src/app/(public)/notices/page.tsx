import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Calendar, Tag, AlertCircle, FileText } from "lucide-react";

export const revalidate = 0;

export default async function PublicNoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const selectedCategory = params.category || "ALL";

  // Query notices from DB
  const notices = await prisma.notice.findMany({
    where: selectedCategory === "ALL" ? {} : { category: selectedCategory },
    orderBy: [
      { isPinned: "desc" },
      { date: "desc" }
    ],
  });

  const categories = [
    { value: "ALL", label: "All Notices" },
    { value: "ANNOUNCEMENT", label: "Announcements" },
    { value: "HOLIDAY", label: "Holidays" },
    { value: "EXAM_SCHEDULE", label: "Exam Schedules" },
    { value: "RESULT", label: "Results" },
    { value: "GOV_ORDER", label: "Government Orders" },
  ];

  return (
    <div className="container" style={{ paddingTop: "3rem" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.25rem", color: "#1e3a8a" }}>Notice Board &amp; Announcements</h1>
        <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
          Official circulars, exam notifications, holiday declarations, and school results
        </p>
      </div>

      {/* Category Navigation Bar */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", marginBottom: "2.5rem" }}>
        {categories.map((cat) => (
          <Link
            key={cat.value}
            href={cat.value === "ALL" ? "/notices" : `/notices?category=${cat.value}`}
            style={{
              padding: "0.5rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: "600",
              border: "1px solid",
              borderColor: selectedCategory === cat.value ? "#1e3a8a" : "#cbd5e1",
              borderRadius: "20px",
              backgroundColor: selectedCategory === cat.value ? "#1e3a8a" : "white",
              color: selectedCategory === cat.value ? "white" : "#475569",
              transition: "all 0.2s"
            }}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Notices Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {notices.length > 0 ? (
          notices.map((notice) => (
            <div 
              key={notice.id} 
              className="card" 
              style={{ 
                borderLeft: notice.isPinned ? "5px solid #fbbf24" : "1px solid #e2e8f0",
                display: "flex", 
                flexDirection: "column", 
                gap: "0.75rem",
                backgroundColor: notice.isPinned ? "#fffbeb" : "white"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className={`badge ${
                    notice.category === "HOLIDAY" ? "badge-danger" : 
                    notice.category === "EXAM_SCHEDULE" ? "badge-warning" : 
                    notice.category === "RESULT" ? "badge-success" : "badge-primary"
                  }`}>
                    {notice.category.replace("_", " ")}
                  </span>
                  {notice.isPinned && (
                    <span className="badge badge-warning" style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.7rem" }}>
                      <AlertCircle size={10} /> PINNED
                    </span>
                  )}
                </div>
                <span style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Calendar size={13} /> Posted: {notice.date}
                </span>
              </div>

              <h3 style={{ fontSize: "1.25rem", color: "#0f172a" }}>{notice.title}</h3>
              <p style={{ color: "#475569", lineHeight: "1.6", fontSize: "0.95rem" }}>{notice.content}</p>
            </div>
          ))
        ) : (
          <div className="card" style={{ padding: "4rem 2rem", textAlign: "center" }}>
            <p style={{ color: "#64748b", fontSize: "1.1rem" }}>
              No notices published in this category yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
