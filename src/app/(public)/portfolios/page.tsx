import React from "react";
import { prisma } from "@/lib/db";
import StudentPortfolioList from "@/components/StudentPortfolioList";

export const revalidate = 0;

export default async function PortfoliosPage() {
  // Query all students (excluding sensitive Aadhaar field for public safety)
  const students = await prisma.student.findMany({
    select: {
      id: true,
      name: true,
      admissionNo: true,
      rollNo: true,
      classLevel: true,
      gender: true,
      dob: true,
      bloodGroup: true,
      parentName: true,
      mobileNo: true,
      address: true,
      academicPerformance: true,
      attendancePercentage: true,
      coCurricular: true,
      sportsAchievements: true,
      certificates: true,
      photo: true,
    },
    orderBy: [
      { classLevel: "asc" },
      { rollNo: "asc" }
    ],
  });

  return (
    <div className="container" style={{ paddingTop: "3rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.25rem", color: "#1e3a8a" }}>Classwise Student Portfolios</h1>
        <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
          Digital profiles, co-curricular records, and academic progress cards of ZPHS students
        </p>
      </div>

      {/* Render Client-Side Filterable & Searchable Grid */}
      <StudentPortfolioList initialStudents={students} />
    </div>
  );
}
