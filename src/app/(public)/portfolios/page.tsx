import React from "react";
import { prisma } from "@/lib/db";
import StudentPortfolioList from "@/components/StudentPortfolioList";

export const revalidate = 0;

export default async function PortfoliosPage() {
  const students = await prisma.student.findMany({
    orderBy: [
      { classLevel: "asc" },
      { rollNo: "asc" }
    ],
  });

  const extraRows = await prisma.$queryRawUnsafe<
    Array<{
      id: number;
      apaarId: string | null;
      penId: string | null;
      fatherName: string | null;
      motherName: string | null;
      caste: string | null;
      admissionYear: string | null;
      admissionFormData: string | null;
    }>
  >(`SELECT "id", "apaarId", "penId", "fatherName", "motherName", "caste", "admissionYear", "admissionFormData" FROM "Student"`).catch(() => []);
  const extraMap = new Map(extraRows.map((r) => [Number(r.id), r]));

  const enrichedStudents = students.map((s) => {
    const extra = extraMap.get(s.id);
    let parsedAdmissionFormData = {};
    if (extra?.admissionFormData) {
      try {
        parsedAdmissionFormData = JSON.parse(extra.admissionFormData);
      } catch {}
    }
    return {
      ...s,
      apaarId: extra?.apaarId || "",
      penId: extra?.penId || "",
      fatherName: extra?.fatherName || s.parentName || "",
      motherName: extra?.motherName || "",
      caste: extra?.caste || "",
      admissionYear: extra?.admissionYear || "2025-2026",
      admissionFormData: parsedAdmissionFormData,
    };
  });

  return (
    <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "3rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.25rem", color: "#1e3a8a", fontWeight: 800 }}>
          Classwise Student Portfolios
        </h1>
        <p style={{ color: "#64748b", marginTop: "0.5rem", fontSize: "0.95rem" }}>
          Digital student records, passport photos, APAAR / PEN identifiers &amp; comprehensive academic profiles
        </p>
      </div>

      {/* Render Client-Side Filterable & Searchable Grid */}
      <StudentPortfolioList initialStudents={enrichedStudents} />
    </div>
  );
}
