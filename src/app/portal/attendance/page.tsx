import React from "react";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import AttendanceManager from "@/components/AttendanceManager";

export const revalidate = 0;

export default async function AttendancePage() {
  let user: any = { id: 1, username: "admin", name: "Sri Gangalapudi Bhaskar Reddy", role: "ADMIN" };
  if (process.env.GITHUB_PAGES !== "true") {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("zphs_session");
    user = sessionCookie ? verifyToken(sessionCookie.value) : null;
  }

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
      mobileNo: true,
      attendancePercentage: true,
    },
    orderBy: [{ classLevel: "asc" }, { rollNo: "asc" }],
  });

  return (
    <AttendanceManager
      initialStudents={students}
      userRole={user?.role || "TEACHER"}
      userName={user?.name || "Teacher"}
    />
  );
}
