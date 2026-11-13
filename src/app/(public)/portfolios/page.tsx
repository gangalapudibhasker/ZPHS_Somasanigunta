import React from "react";
import { prisma } from "@/lib/db";
import StudentPortfolioList from "@/components/StudentPortfolioList";

export const revalidate = 0;

const KNOWN_STUDENT_PHOTOS: Record<string, string> = {
  "ADM/2022/1001": "/images/students/bandi_subramanyam.jpg",
  "ADM/2022/1002": "/images/students/chata_subramanyam.jpg",
  "ADM/2022/1004": "/images/students/kantipalli_sathish_kumar.jpg",
  "ADM/2022/1005": "/images/students/nakkala_sowmya.jpg",
  "ADM/2022/1008": "/images/students/thokala_amar.jpg",
  "ADM/2022/1009": "/images/students/thoka_vikash.jpg",
  "ADM/2022/1010": "/images/students/thuraka_bhargavi.jpg",
  "ADM/2022/1012": "/images/students/yamala_venkatadri.jpg",
};

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
    const photoUrl = s.photo || (s.admissionNo ? KNOWN_STUDENT_PHOTOS[s.admissionNo] : null) || null;
    return {
      ...s,
      photo: photoUrl,
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
