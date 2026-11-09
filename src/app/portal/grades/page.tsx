import React from "react";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import GradeReportingManager from "@/components/GradeReportingManager";

export const revalidate = 0;

export default async function GradesPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("zphs_session");
  const user = sessionCookie ? verifyToken(sessionCookie.value) : null;

  const students = await prisma.student.findMany({
    select: {
      id: true,
      name: true,
      admissionNo: true,
      rollNo: true,
      classLevel: true,
      gender: true,
      photo: true,
      parentName: true,
    },
    orderBy: [{ classLevel: "asc" }, { rollNo: "asc" }],
  });

  const reports = await prisma.gradeReport.findMany({
    orderBy: [{ classLevel: "asc" }, { totalMarks: "desc" }],
  });

  const studentMap = new Map(students.map((s) => [s.admissionNo, s]));

  const enrichedReports = reports.map((r) => {
    const s = studentMap.get(r.admissionNo);
    return {
      ...r,
      studentName: s?.name || "Student",
      studentPhoto: s?.photo || "/images/placeholders/student_male.svg",
      rollNo: s?.rollNo || "",
      parentName: s?.parentName || "",
    };
  });

  return (
    <GradeReportingManager
      initialReports={enrichedReports}
      students={students}
      userRole={user?.role || "TEACHER"}
    />
  );
}
